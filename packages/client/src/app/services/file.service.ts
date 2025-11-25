import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import * as SparkMD5 from 'spark-md5';

export interface FileRecord {
  id: string;
  filename: string;
  originalName: string;
  size: number;
  mimeType: string;
  path: string;
  uploadTime: string;
  hash: string;
}

export interface UploadProgress {
  status: 'calculating' | 'uploading' | 'merging' | 'done' | 'error';
  progress: number; // 0-100
  error?: string;
}

@Injectable({ providedIn: 'root' })
export class FileService {
  private apiUrl = '/api/files';
  private CHUNK_SIZE = 2 * 1024 * 1024; // 2MB
  private http = inject(HttpClient);

  getFiles(): Observable<FileRecord[]> {
    return this.http.get<FileRecord[]>(this.apiUrl);
  }

  deleteFile(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  uploadFile(file: File): Observable<UploadProgress> {
    return new Observable((observer) => {
      const process = async () => {
        try {
          observer.next({ status: 'calculating', progress: 0 });
          const hash = await this.calculateHash(file);

          // Check if exists or partial
          const check = await this.http
            .get<any>(`${this.apiUrl}/check?hash=${hash}`)
            .toPromise();

          if (check.exists) {
            observer.next({ status: 'done', progress: 100 });
            observer.complete();
            return;
          }

          const chunks = Math.ceil(file.size / this.CHUNK_SIZE);
          const uploadedChunks = new Set(check.chunks || []);
          let uploadedCount = uploadedChunks.size;

          observer.next({ status: 'uploading', progress: (uploadedCount / chunks) * 100 });

          for (let i = 0; i < chunks; i++) {
            if (uploadedChunks.has(i)) continue;

            const start = i * this.CHUNK_SIZE;
            const end = Math.min(file.size, start + this.CHUNK_SIZE);
            const chunk = file.slice(start, end);

            const formData = new FormData();
            formData.append('file', chunk);
            formData.append('hash', hash);
            formData.append('index', i.toString());

            await this.http.post(`${this.apiUrl}/upload`, formData).toPromise();
            uploadedCount++;
            observer.next({ status: 'uploading', progress: (uploadedCount / chunks) * 100 });
          }

          observer.next({ status: 'merging', progress: 100 });
          await this.http
            .post(`${this.apiUrl}/merge`, {
              hash,
              filename: file.name,
              originalName: file.name,
              mimeType: file.type,
              totalChunks: chunks,
            })
            .toPromise();

          observer.next({ status: 'done', progress: 100 });
          observer.complete();
        } catch (err: any) {
          observer.next({ status: 'error', progress: 0, error: err.message });
          observer.error(err);
        }
      };

      process();
    });
  }

  private calculateHash(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const spark = new SparkMD5.ArrayBuffer();
      const fileReader = new FileReader();
      const chunkSize = 2097152; // 2MB
      const chunks = Math.ceil(file.size / chunkSize);
      let currentChunk = 0;

      fileReader.onload = (e: any) => {
        spark.append(e.target.result);
        currentChunk++;

        if (currentChunk < chunks) {
          loadNext();
        } else {
          resolve(spark.end());
        }
      };

      fileReader.onerror = () => reject('Hash calculation failed');

      function loadNext() {
        const start = currentChunk * chunkSize;
        const end = start + chunkSize >= file.size ? file.size : start + chunkSize;
        fileReader.readAsArrayBuffer(file.slice(start, end));
      }

      loadNext();
    });
  }
}
