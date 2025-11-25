import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpEventType } from '@angular/common/http';
import {
  DataTableComponent,
  TableColumn,
  TableAction,
  ButtonComponent,
  CardComponent,
  MessageService,
} from '@repo/ui-lib';
import { FileService, FileRecord, UploadProgress } from '../../services/file.service';

interface UploadingFile {
  file: File;
  progress: UploadProgress;
}

interface DownloadingFile {
  id: string;
  filename: string;
  progress: number;
  speed?: string;
  status: 'downloading' | 'completed' | 'error';
}

@Component({
  selector: 'app-file-management',
  standalone: true,
  imports: [CommonModule, DataTableComponent, ButtonComponent, CardComponent],
  template: `
    <div class="file-admin-container">
      <h1>文件资源管理</h1>

      <!-- Upload Area -->
      <div class="upload-section">
        <div
          class="drop-zone"
          (dragover)="onDragOver($event)"
          (dragleave)="onDragLeave($event)"
          (drop)="onDrop($event)"
          [class.drag-active]="isDragging"
        >
          <div class="upload-icon">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </div>
          <h3>点击或拖拽文件到此处上传</h3>
          <p>支持视频、图片等各种文件格式</p>
          <input
            type="file"
            #fileInput
            multiple
            (change)="onFileSelected($event)"
            style="display: none"
          />
          <lib-button variant="primary" (click)="fileInput.click()">选择文件</lib-button>
        </div>

        <!-- Upload Progress List -->
        @if (uploadingFiles.length > 0) {
          <div class="progress-list">
            <h4>上传进度</h4>
            @for (item of uploadingFiles; track item.file.name) {
              <div class="progress-item">
                <div class="file-info">
                  <span class="file-name">{{ item.file.name }}</span>
                  <span class="file-status">
                    {{
                      item.progress.status === 'completed'
                        ? '上传完成'
                        : item.progress.status === 'error'
                          ? '上传失败'
                          : item.progress.speed || '准备中...'
                    }}
                  </span>
                </div>
                <div class="progress-bar-bg">
                  <div
                    class="progress-bar-fill"
                    [style.width.%]="item.progress.progress"
                    [class.completed]="item.progress.status === 'completed'"
                    [class.error]="item.progress.status === 'error'"
                  ></div>
                </div>
              </div>
            }
          </div>
        }

        <!-- Download Progress List -->
        @if (downloadingFiles.length > 0) {
          <div class="progress-list">
            <h4>下载进度</h4>
            @for (item of downloadingFiles; track item.id) {
              <div class="progress-item">
                <div class="file-info">
                  <span class="file-name">{{ item.filename }}</span>
                  <span class="file-status">
                    {{
                      item.status === 'completed'
                        ? '下载完成'
                        : item.status === 'error'
                          ? '下载失败'
                          : item.speed || '准备中...'
                    }}
                  </span>
                </div>
                <div class="progress-bar-bg">
                  <div
                    class="progress-bar-fill"
                    [style.width.%]="item.progress"
                    [class.completed]="item.status === 'completed'"
                    [class.error]="item.status === 'error'"
                  ></div>
                </div>
              </div>
            }
          </div>
        }
      </div>

      <!-- File List -->
      <div class="file-list-section">
        <lib-card title="文件列表" [hasHeader]="true">
          <ng-container ngProjectAs="[header-icon]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
              <polyline points="13 2 13 9 20 9" />
            </svg>
          </ng-container>

          <lib-data-table [columns]="columns" [data]="files" [actions]="actions"></lib-data-table>
        </lib-card>
      </div>
    </div>
  `,
  styles: [
    `
      .file-admin-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 2rem;
      }

      h1 {
        margin: 0 0 2rem 0;
        color: var(--color-text);
        font-size: 2rem;
      }

      .upload-section {
        margin-bottom: 2rem;
      }

      .drop-zone {
        border: 2px dashed var(--color-border);
        border-radius: 12px;
        padding: 3rem;
        text-align: center;
        background: var(--color-surface);
        transition: all 0.2s;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
      }

      .drop-zone.drag-active {
        border-color: var(--color-primary);
        background: color-mix(in srgb, var(--color-primary), transparent 95%);
      }

      .upload-icon {
        color: var(--color-primary);
        margin-bottom: 0.5rem;
      }

      .drop-zone h3 {
        margin: 0;
        color: var(--color-text);
        font-size: 1.2rem;
      }

      .drop-zone p {
        margin: 0;
        color: var(--color-textSecondary);
        margin-bottom: 1rem;
      }

      .progress-list {
        margin-top: 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .progress-list h4 {
        margin: 0 0 0.5rem 0;
        color: var(--color-text);
        font-size: 1rem;
      }

      .progress-item {
        background: var(--color-surface);
        padding: 1rem;
        border-radius: 8px;
        border: 1px solid var(--color-border);
      }

      .file-info {
        display: flex;
        justify-content: space-between;
        margin-bottom: 0.5rem;
        font-size: 0.9rem;
      }

      .file-name {
        color: var(--color-text);
        font-weight: 500;
      }

      .file-status {
        color: var(--color-textSecondary);
      }

      .progress-bar-bg {
        height: 6px;
        background: var(--color-border);
        border-radius: 3px;
        overflow: hidden;
      }

      .progress-bar-fill {
        height: 100%;
        background: var(--color-primary);
        transition: width 0.3s ease;
        border-radius: 3px;
      }

      .progress-bar-fill.completed {
        background: #10b981; /* Green */
      }

      .progress-bar-fill.error {
        background: #ef4444; /* Red */
      }
    `,
  ],
})
export class FileManagementComponent implements OnInit {
  private messageService = inject(MessageService);

  files: FileRecord[] = [];
  uploadingFiles: UploadingFile[] = [];
  downloadingFiles: DownloadingFile[] = [];
  isDragging = false;

  columns: TableColumn[] = [
    { key: 'originalName', label: '文件名', width: '400px' },
    {
      key: 'size',
      label: '大小',
      width: '120px',
      formatter: (val) => this.formatSize(val),
    },
    { key: 'mimeType', label: '类型', width: '180px' },
    {
      key: 'uploadTime',
      label: '上传时间',
      width: '200px',
      formatter: (val) => new Date(val).toLocaleString(),
    },
  ];

  actions: TableAction[] = [
    {
      label: '下载（带进度）',
      type: 'primary',
      handler: (row) => this.downloadFile(row),
    },
    {
      label: '直接下载',
      type: 'default',
      handler: (row) => this.directDownloadFile(row),
    },
    {
      label: '删除',
      type: 'danger',
      handler: (row) => this.deleteFile(row),
    },
  ];

  constructor(private fileService: FileService) {}

  ngOnInit() {
    this.loadFiles();
  }

  loadFiles() {
    this.fileService.getFiles().subscribe((files) => {
      this.files = files.sort(
        (a, b) => new Date(b.uploadTime).getTime() - new Date(a.uploadTime).getTime(),
      );
    });
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    const files = event.dataTransfer?.files;
    if (files) {
      this.handleFiles(files);
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (files) {
      this.handleFiles(files);
    }
  }

  handleFiles(fileList: FileList) {
    Array.from(fileList).forEach((file) => {
      const uploadingFile: UploadingFile = {
        file,
        progress: { status: 'hashing', progress: 0 },
      };
      this.uploadingFiles.push(uploadingFile);

      this.fileService.uploadFile(file).subscribe({
        next: (progress) => {
          uploadingFile.progress = progress;
        },
        error: (err) => {
          console.error('Upload failed', err);
          uploadingFile.progress = { status: 'error', progress: 0 };
        },
        complete: () => {
          this.loadFiles();
          // Remove from uploading list after 3 seconds
          setTimeout(() => {
            this.uploadingFiles = this.uploadingFiles.filter((f) => f !== uploadingFile);
          }, 3000);
        },
      });
    });
  }

  downloadFile(file: FileRecord) {
    const downloadingFile: DownloadingFile = {
      id: file.id,
      filename: file.originalName,
      progress: 0,
      status: 'downloading',
    };
    this.downloadingFiles.push(downloadingFile);

    const startTime = Date.now();

    this.fileService.getDownloadToken(file.id).subscribe({
      next: ({ token }) => {
        const url = `http://localhost:3000/api/files/download/${token}`;

        this.fileService.downloadFileWithProgress(url).subscribe({
          next: (event) => {
            if (event.type === HttpEventType.DownloadProgress) {
              if (event.total) {
                const progress = Math.round((100 * event.loaded) / event.total);
                downloadingFile.progress = progress;

                // Calculate speed
                const duration = (Date.now() - startTime) / 1000;
                if (duration > 0) {
                  const speed = this.formatSize(event.loaded / duration) + '/s';
                  downloadingFile.speed = speed;
                }
              }
            } else if (event.type === HttpEventType.Response) {
              downloadingFile.status = 'completed';
              downloadingFile.progress = 100;
              this.saveFile(event.body, file.originalName);

              // Remove from downloading list after 3 seconds
              setTimeout(() => {
                this.downloadingFiles = this.downloadingFiles.filter((f) => f !== downloadingFile);
              }, 3000);
            }
          },
          error: (err) => {
            console.error('Download failed', err);
            downloadingFile.status = 'error';
          },
        });
      },
      error: (err) => {
        console.error('Failed to get download token', err);
        downloadingFile.status = 'error';
      },
    });
  }

  private saveFile(blob: Blob, filename: string) {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  directDownloadFile(file: FileRecord) {
    // 先获取下载 Token，然后触发下载
    this.fileService.getDownloadToken(file.id).subscribe({
      next: ({ token }) => {
        const url = `http://localhost:3000/api/files/download/${token}`;
        const link = document.createElement('a');
        link.href = url;
        // link.download 属性在跨域或由 Content-Disposition 头控制时可能无效，
        // 但在这里我们希望浏览器处理文件名
        link.download = file.originalName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      },
      error: (err) => {
        console.error('Failed to get download token', err);
        this.messageService.error('获取下载链接失败');
      },
    });
  }

  deleteFile(file: FileRecord) {
    if (confirm(`确定要删除文件 "${file.originalName}" 吗？`)) {
      this.fileService.deleteFile(file.id).subscribe(() => {
        this.loadFiles();
      });
    }
  }

  formatSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
