import { Injectable } from '@angular/core';
import { HttpClient, HttpEventType, HttpRequest } from '@angular/common/http';
import { Observable, from, of, forkJoin, concat, BehaviorSubject } from 'rxjs';
import { map, switchMap, catchError, tap, mergeMap, last } from 'rxjs/operators';
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
  status: 'hashing' | 'uploading' | 'merging' | 'completed' | 'error';
  progress: number;
  speed?: string; // e.g. "1.2 MB/s"
}

@Injectable({
  providedIn: 'root',
})
export class FileService {
  private apiUrl = 'http://localhost:3000/api/files';
  private CHUNK_SIZE = 2 * 1024 * 1024; // 2MB

  constructor(private http: HttpClient) {}

  getFiles(): Observable<FileRecord[]> {
    return this.http.get<FileRecord[]>(this.apiUrl);
  }

  deleteFile(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  getDownloadToken(fileId: string): Observable<{ token: string }> {
    return this.http.get<{ token: string }>(`${this.apiUrl}/${fileId}/download-token`);
  }

  uploadFile(file: File): Observable<UploadProgress> {
    return new Observable<UploadProgress>((observer) => {
      let hash = '';
      let chunks: Blob[] = [];
      const startTime = Date.now();

      // 1. Calculate Hash
      observer.next({ status: 'hashing', progress: 0 });
      this.calculateHash(file)
        .then(async (fileHash) => {
          hash = fileHash;
          observer.next({ status: 'hashing', progress: 100 });

          // 2. Check if file exists
          const checkResult = await this.http
            .get<{
              exists: boolean;
              url?: string;
              chunks?: number[];
            }>(`${this.apiUrl}/check?hash=${hash}`)
            .toPromise();

          if (checkResult?.exists) {
            observer.next({ status: 'completed', progress: 100 });
            observer.complete();
            return;
          }

          // 3. Prepare chunks
          const totalChunks = Math.ceil(file.size / this.CHUNK_SIZE);
          const uploadedChunks = new Set(checkResult?.chunks || []);
          chunks = [];
          for (let i = 0; i < totalChunks; i++) {
            const start = i * this.CHUNK_SIZE;
            const end = Math.min(file.size, start + this.CHUNK_SIZE);
            chunks.push(file.slice(start, end));
          }

          // 4. Upload chunks
          let completedChunks = uploadedChunks.size;

          const uploadChunk = async (index: number) => {
            if (uploadedChunks.has(index)) return;

            const formData = new FormData();
            formData.append('file', chunks[index]);
            formData.append('hash', hash);
            formData.append('index', index.toString());

            await this.http.post(`${this.apiUrl}/upload`, formData).toPromise();
            completedChunks++;
            const progress = Math.round((completedChunks / totalChunks) * 100);

            // Calculate speed
            const duration = (Date.now() - startTime) / 1000;
            const uploadedBytes = completedChunks * this.CHUNK_SIZE;
            const speed = this.formatSize(uploadedBytes / duration) + '/s';

            observer.next({ status: 'uploading', progress, speed });
          };

          // Upload in parallel (limit concurrency)
          const concurrency = 3;
          const queue = Array.from({ length: totalChunks }, (_, i) => i).filter(
            (i) => !uploadedChunks.has(i),
          );

          for (let i = 0; i < queue.length; i += concurrency) {
            const batch = queue.slice(i, i + concurrency);
            await Promise.all(batch.map(uploadChunk));
          }

          // 5. Merge
          observer.next({ status: 'merging', progress: 100 });
          await this.http
            .post(`${this.apiUrl}/merge`, {
              hash,
              filename: file.name, // Use original name as base, backend handles extension
              originalName: file.name,
              totalChunks,
              mimeType: file.type,
            })
            .toPromise();

          observer.next({ status: 'completed', progress: 100 });
          observer.complete();
        })
        .catch((err) => {
          observer.error(err);
        });
    });
  }

  private calculateHash(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const spark = new SparkMD5.ArrayBuffer();
      const reader = new FileReader();
      const chunkSize = 2 * 1024 * 1024;
      const chunks = Math.ceil(file.size / chunkSize);
      let currentChunk = 0;

      reader.onload = (e: any) => {
        spark.append(e.target.result);
        currentChunk++;

        if (currentChunk < chunks) {
          loadNext();
        } else {
          resolve(spark.end());
        }
      };

      reader.onerror = (e) => reject(e);

      function loadNext() {
        const start = currentChunk * chunkSize;
        const end = Math.min(file.size, start + chunkSize);
        reader.readAsArrayBuffer(file.slice(start, end));
      }

      loadNext();
    });
  }

  downloadFileWithProgress(url: string): Observable<any> {
    return this.http.get(url, {
      responseType: 'blob',
      reportProgress: true,
      observe: 'events',
    });
  }

  private formatSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
