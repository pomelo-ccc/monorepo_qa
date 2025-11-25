import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileService, FileRecord, UploadProgress } from '../../services/file.service';
import { ButtonComponent, CardComponent } from '@repo/ui-lib';

@Component({
  selector: 'app-file-management',
  standalone: true,
  imports: [CommonModule, ButtonComponent, CardComponent],
  template: `
    <lib-card title="文件管理" [hasHeader]="true">
       <ng-container ngProjectAs="[header-extra]">
          <input type="file" #fileInput style="display:none" (change)="onFileSelected($event)" multiple>
          <lib-button variant="primary" (click)="fileInput.click()">
             上传文件
          </lib-button>
       </ng-container>

       <!-- Upload Progress -->
       @if (uploadTasks.length > 0) {
         <div class="upload-tasks">
           @for (task of uploadTasks; track task.file.name) {
             <div class="task-item">
               <div class="task-info">
                 <span class="task-name">{{ task.file.name }}</span>
                 <span class="task-status">{{ getStatusText(task.progress.status) }}</span>
               </div>
               <div class="progress-track">
                 <div class="progress-fill" [style.width.%]="task.progress.progress" 
                      [class.error]="task.progress.status === 'error'"></div>
               </div>
               @if (task.progress.error) {
                 <div class="error-msg">{{ task.progress.error }}</div>
               }
             </div>
           }
         </div>
       }

       <!-- File List -->
       <div class="file-grid">
         @for (file of files(); track file.id) {
           <div class="file-card">
             <div class="file-preview">
                @if (isImage(file)) {
                  <img [src]="getFileUrl(file)" alt="preview" loading="lazy">
                } @else {
                  <div class="file-icon">{{ getFileIcon(file) }}</div>
                }
             </div>
             <div class="file-info">
                <div class="file-name" title="{{file.originalName}}">{{ file.originalName }}</div>
                <div class="file-meta">{{ formatSize(file.size) }}</div>
             </div>
             <button class="delete-btn" (click)="deleteFile(file)" title="删除">
               <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
               </svg>
             </button>
           </div>
         }
         @if (files().length === 0) {
           <div class="empty-state">暂无文件</div>
         }
       </div>
    </lib-card>
  `,
  styles: [`
    .upload-tasks {
      margin-bottom: 2rem;
      border: 1px solid var(--color-border);
      border-radius: 8px;
      padding: 1rem;
      background: var(--color-surface);
    }
    .task-item {
      margin-bottom: 1rem;
    }
    .task-item:last-child { margin-bottom: 0; }
    .task-info {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.25rem;
      font-size: 0.85rem;
      color: var(--color-text);
    }
    .progress-track {
      height: 6px;
      background: var(--color-surface-hover);
      border-radius: 3px;
      overflow: hidden;
    }
    .progress-fill {
      height: 100%;
      background: var(--color-primary);
      transition: width 0.2s;
    }
    .progress-fill.error {
      background: var(--color-error);
    }
    .error-msg {
      font-size: 0.8rem;
      color: var(--color-error);
      margin-top: 0.25rem;
    }
    
    .file-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 1rem;
    }
    .file-card {
      border: 1px solid var(--color-border);
      border-radius: 8px;
      overflow: hidden;
      position: relative;
      background: var(--color-surface);
      transition: all 0.2s;
    }
    .file-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    .file-preview {
      height: 120px;
      background: var(--color-surface-hover);
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }
    .file-preview img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .file-icon {
      font-size: 3rem;
    }
    .file-info {
      padding: 0.5rem;
    }
    .file-name {
      font-size: 0.9rem;
      font-weight: 500;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      color: var(--color-text);
    }
    .file-meta {
      font-size: 0.75rem;
      color: var(--color-text-secondary);
    }
    .delete-btn {
      position: absolute;
      top: 4px;
      right: 4px;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: rgba(0,0,0,0.5);
      color: white;
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      opacity: 0;
      transition: opacity 0.2s;
    }
    .file-card:hover .delete-btn {
      opacity: 1;
    }
    .delete-btn:hover {
      background: var(--color-error);
    }
    .empty-state {
      text-align: center;
      padding: 2rem;
      color: var(--color-text-secondary);
      grid-column: 1 / -1;
    }
  `]
})
export class FileManagementComponent implements OnInit {
  files = signal<FileRecord[]>([]);
  uploadTasks: { file: File; progress: UploadProgress }[] = [];

  private fileService = inject(FileService);

  ngOnInit() {
    this.loadFiles();
  }

  loadFiles() {
    this.fileService.getFiles().subscribe((data) => this.files.set(data));
  }

  onFileSelected(event: Event) {
    const element = event.target as HTMLInputElement;
    const files = element.files;
    if (files) {
      Array.from(files).forEach((file) => this.uploadFile(file));
    }
    // Reset input
    element.value = '';
  }

  uploadFile(file: File) {
    const task: { file: File; progress: UploadProgress } = {
      file,
      progress: { status: 'calculating', progress: 0 },
    };
    this.uploadTasks.push(task);

    this.fileService.uploadFile(file).subscribe({
      next: (progress) => {
        task.progress = progress;
      },
      error: () => {
         // Error handled in progress
      },
      complete: () => {
        this.loadFiles();
        setTimeout(() => {
          const idx = this.uploadTasks.indexOf(task);
          if (idx > -1) this.uploadTasks.splice(idx, 1);
        }, 2000);
      }
    });
  }

  deleteFile(file: FileRecord) {
    if (confirm(`确定删除 ${file.originalName}?`)) {
      this.fileService.deleteFile(file.id).subscribe(() => {
        this.loadFiles();
      });
    }
  }

  isImage(file: FileRecord): boolean {
    return file.mimeType.startsWith('image/');
  }

  getFileUrl(file: FileRecord): string {
    return `http://localhost:3000${file.path}`; 
  }

  getFileIcon(file: FileRecord): string {
    if (file.mimeType.startsWith('video/')) return '🎬';
    if (file.mimeType.startsWith('audio/')) return '🎵';
    if (file.mimeType.includes('pdf')) return '📕';
    return '📄';
  }

  formatSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getStatusText(status: string): string {
    const map: Record<string, string> = {
      calculating: '计算校验和...',
      uploading: '上传中...',
      merging: '合并文件...',
      done: '完成',
      error: '失败'
    };
    return map[status] || status;
  }
}
