import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfigService } from '../../services/config.service';
import { Router, RouterModule } from '@angular/router';
import {
  ButtonComponent,
  CardComponent,
  DataTableComponent,
  TableColumn,
  TableAction,
} from '@repo/ui-lib';
import { FileManagementComponent } from '../file-management/file-management.component';

@Component({
  selector: 'app-config-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ButtonComponent,
    CardComponent,
    DataTableComponent,
    FileManagementComponent,
  ],
  template: `
    <div class="config-page">
      <!-- 固定顶部栏 -->
      <div class="sticky-header">
        <button class="back-btn" (click)="goBack()">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          返回
        </button>
        <h1 class="page-title">系统配置</h1>
        <div class="header-spacer"></div>
      </div>

      <!-- Tab 导航 -->
      <div class="tab-bar">
        <button
          class="tab-item"
          [class.active]="activeTab === 'modules'"
          (click)="activeTab = 'modules'"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
          </svg>
          模块管理
        </button>
        <button
          class="tab-item"
          [class.active]="activeTab === 'tags'"
          (click)="activeTab = 'tags'"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
            <line x1="7" y1="7" x2="7.01" y2="7"></line>
          </svg>
          标签管理
        </button>
        <button
          class="tab-item"
          [class.active]="activeTab === 'versions'"
          (click)="activeTab = 'versions'"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="6" y1="3" x2="6" y2="15"></line>
            <circle cx="18" cy="6" r="3"></circle>
            <circle cx="6" cy="18" r="3"></circle>
            <path d="M18 9a9 9 0 0 1-9 9"></path>
          </svg>
          版本管理
        </button>
        <button
          class="tab-item"
          [class.active]="activeTab === 'files'"
          (click)="activeTab = 'files'"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
            <polyline points="13 2 13 9 20 9"></polyline>
          </svg>
          文件管理
        </button>
      </div>

      <!-- 内容区 -->
      <main class="main-content">
        <!-- Modules Management -->
        @if (activeTab === 'modules') {
          <div class="tab-content">
            <lib-card title="模块列表" [hasHeader]="true">
              <ng-container ngProjectAs="[header-extra]">
                <lib-button variant="primary" (click)="addModule()">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                  添加模块
                </lib-button>
              </ng-container>

              <lib-data-table
                [columns]="moduleColumns"
                [data]="flatModules"
                [actions]="moduleActions"
                [pagination]="false"
              ></lib-data-table>
            </lib-card>
          </div>
        }

        <!-- Tags Management -->
        @if (activeTab === 'tags') {
          <div class="tab-content">
            <lib-card title="标签列表" [hasHeader]="true">
              <div class="add-tag-section">
                <input
                  [(ngModel)]="newTagName"
                  (keyup.enter)="addTag()"
                  placeholder="输入新标签名称并回车"
                  class="add-input"
                />
                <lib-button variant="primary" (click)="addTag()" [disabled]="!newTagName">
                  添加标签
                </lib-button>
              </div>

              <div class="tags-grid">
                @for (tag of tags; track tag) {
                  <div class="tag-card">
                    @if (editingTag !== tag) {
                      <div class="tag-view">
                        <span class="tag-name">{{ tag }}</span>
                        <div class="tag-actions">
                          <button class="btn-icon-sm" (click)="startEditTag(tag)">
                            <svg
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                            >
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                          </button>
                          <button class="btn-icon-sm danger" (click)="deleteTag(tag)">
                            <svg
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                            >
                              <line x1="18" y1="6" x2="6" y2="18"></line>
                              <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                          </button>
                        </div>
                      </div>
                    }
                    @if (editingTag === tag) {
                      <div class="tag-edit">
                        <input
                          [(ngModel)]="editTagName"
                          (keyup.enter)="saveTagEdit()"
                          (keyup.escape)="cancelEditTag()"
                          class="edit-input-sm"
                          #editInput
                        />
                        <button class="btn-icon-sm success" (click)="saveTagEdit()">✓</button>
                        <button class="btn-icon-sm" (click)="cancelEditTag()">✕</button>
                      </div>
                    }
                  </div>
                }
              </div>
            </lib-card>
          </div>
        }

        <!-- Versions Management (Placeholder) -->
        @if (activeTab === 'versions') {
          <div class="tab-content">
            <lib-card title="版本列表">
              <div class="empty-state">暂无版本数据</div>
            </lib-card>
          </div>
        }

        <!-- File Management -->
        @if (activeTab === 'files') {
          <div class="tab-content">
            <app-file-management></app-file-management>
          </div>
        }
      </main>
    </div>
  `,
  styles: [
    `
      .config-page {
        min-height: 100vh;
        background: var(--color-background);
        display: flex;
        flex-direction: column;
      }

      /* 固定顶部栏 */
      .sticky-header {
        position: sticky;
        top: 0;
        z-index: 50;
        background: var(--color-background);
        border-bottom: 1px solid var(--color-border);
        padding: 0.75rem 2rem;
        display: flex;
        align-items: center;
        gap: 1.5rem;
        backdrop-filter: blur(10px);
      }

      .back-btn {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 1rem;
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: 8px;
        color: var(--color-text);
        font-size: 0.9rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
      }

      .back-btn:hover {
        background: var(--color-surfaceHover);
        border-color: var(--color-textSecondary);
      }

      .page-title {
        font-size: 1.25rem;
        font-weight: 600;
        color: var(--color-text);
        margin: 0;
      }

      .header-spacer {
        flex: 1;
      }

      /* Tab 导航 */
      .tab-bar {
        display: flex;
        gap: 0.5rem;
        padding: 1rem 2rem;
        background: var(--color-surface);
        border-bottom: 1px solid var(--color-border);
      }

      .tab-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.6rem 1.25rem;
        background: transparent;
        border: 1px solid transparent;
        border-radius: 8px;
        color: var(--color-textSecondary);
        font-size: 0.9rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
      }

      .tab-item:hover {
        background: var(--color-surfaceHover);
        color: var(--color-text);
      }

      .tab-item.active {
        background: color-mix(in srgb, var(--color-primary), transparent 90%);
        color: var(--color-primary);
        border-color: color-mix(in srgb, var(--color-primary), transparent 80%);
      }

      .main-content {
        flex: 1;
        padding: 1.5rem 2rem;
        max-width: 1200px;
      }

      .tab-content {
        animation: fadeIn 0.2s ease-out;
      }

      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }

      /* Tags Styles */
      .add-tag-section {
        display: flex;
        gap: 1rem;
        margin-bottom: 2rem;
      }

      .add-input {
        flex: 1;
        max-width: 300px;
        padding: 0.75rem;
        border: 1px solid var(--color-border);
        border-radius: 6px;
        font-size: 0.95rem;
        outline: none;
        transition: border-color 0.2s;
        background: var(--color-surface);
        color: var(--color-text);
      }

      .add-input:focus {
        border-color: var(--color-primary);
      }

      .tags-grid {
        display: flex;
        flex-wrap: wrap;
        gap: 0.75rem;
      }

      .tag-card {
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: 20px;
        padding: 0.4rem 0.5rem 0.4rem 1rem;
        display: flex;
        align-items: center;
        transition: all 0.2s;
      }

      .tag-card:hover {
        border-color: var(--color-primary);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
      }

      .tag-view {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .tag-name {
        font-size: 0.9rem;
        color: var(--color-text);
      }

      .tag-actions {
        display: flex;
        gap: 2px;
      }

      .tag-edit {
        display: flex;
        align-items: center;
        gap: 0.25rem;
      }

      .edit-input-sm {
        width: 100px;
        padding: 2px 6px;
        border: 1px solid var(--color-primary);
        border-radius: 4px;
        font-size: 0.9rem;
        background: var(--color-surface);
        color: var(--color-text);
      }

      .btn-icon-sm {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: none;
        background: transparent;
        color: var(--color-textSecondary);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .btn-icon-sm:hover {
        background: var(--color-surfaceHover);
        color: var(--color-text);
      }

      .btn-icon-sm.danger:hover {
        color: #ef4444;
        background: rgba(239, 68, 68, 0.1);
      }

      .btn-icon-sm.success {
        color: #10b981;
      }

      .empty-state {
        padding: 2rem;
        text-align: center;
        color: var(--color-textSecondary);
      }
    `,
  ],
})
export class ConfigManagementComponent implements OnInit {
  activeTab: 'modules' | 'tags' | 'versions' | 'files' = 'modules';

  // Modules Data
  modules: any[] = [];
  modulesChanged = false;

  moduleColumns: TableColumn[] = [
    { key: 'id', label: 'ID', width: 200 },
    { key: 'name', label: '名称', width: 200 },
    { key: 'type', label: '类型', width: 150 },
  ];

  moduleActions: TableAction[] = [
    {
      label: '编辑',
      type: 'primary',
      handler: (row) => this.editModule(row),
    },
    {
      label: '删除',
      type: 'danger',
      handler: (row) => this.deleteModuleItem(row),
    },
  ];

  // Tags Data
  tags: string[] = [];
  newTagName = '';
  editingTag: string | null = null;
  editTagName = '';

  /* eslint-disable @angular-eslint/prefer-inject */
  constructor(
    private configService: ConfigService,
    private router: Router,
  ) {}
  /* eslint-enable @angular-eslint/prefer-inject */

  ngOnInit() {
    this.loadModules();
    this.loadTags();
  }

  goBack() {
    this.router.navigate(['/']);
  }

  // --- Modules Logic ---
  loadModules() {
    this.configService.getModules().subscribe((data) => {
      this.modules = data;
      this.modulesChanged = false;
    });
  }

  get flatModules() {
    const result: any[] = [];
    this.modules.forEach((parent) => {
      if (parent.children) {
        parent.children.forEach((child: any) => {
          result.push({
            id: child.id,
            name: child.name,
            type: parent.name,
            parentId: parent.id,
            original: child,
            parentOriginal: parent,
          });
        });
      }
    });
    return result;
  }

  addModule() {
    // Simple implementation: Ask for Type (Parent), ID, Name
    const parentId = prompt(
      '请输入所属模块ID (例如: frontend, backend):\n现有模块: ' +
        this.modules.map((m) => m.id).join(', '),
    );
    if (!parentId) return;

    const parent = this.modules.find((m) => m.id === parentId);
    if (!parent) {
      alert('找不到该模块ID');
      return;
    }

    const id = prompt('请输入模块ID (英文):');
    if (!id) return;
    if (parent.children?.some((m: any) => m.id === id)) {
      alert('ID已存在');
      return;
    }

    const name = prompt('请输入模块名称:');
    if (!name) return;

    if (!parent.children) parent.children = [];
    parent.children.push({ id, name });

    this.saveModules();
  }

  editModule(row: any) {
    const newName = prompt('请输入新名称:', row.name);
    if (newName && newName !== row.name) {
      const parent = this.modules.find((m) => m.id === row.parentId);
      if (parent) {
        const child = parent.children.find((c: any) => c.id === row.id);
        if (child) {
          child.name = newName;
          this.saveModules();
        }
      }
    }
  }

  deleteModuleItem(row: any) {
    if (confirm(`确定要删除模块 "${row.name}" 吗？`)) {
      const parent = this.modules.find((m) => m.id === row.parentId);
      if (parent) {
        const index = parent.children.findIndex((c: any) => c.id === row.id);
        if (index > -1) {
          parent.children.splice(index, 1);
          this.saveModules();
        }
      }
    }
  }

  saveModules() {
    // Clean up UI properties like 'expanded' before saving
    const cleanModules = this.modules.map((m) => ({
      id: m.id,
      name: m.name,
      children: m.children?.map((c: any) => ({
        id: c.id,
        name: c.name,
      })),
    }));

    this.configService.saveModules(cleanModules).subscribe(() => {
      this.modulesChanged = false;
      this.loadModules(); // Reload to refresh view
    });
  }

  // --- Tags Logic ---
  loadTags() {
    this.configService.getTags().subscribe((data) => {
      this.tags = data;
    });
  }

  addTag() {
    if (!this.newTagName.trim()) return;

    this.configService.addTag(this.newTagName.trim()).subscribe({
      next: (tags) => {
        this.tags = tags;
        this.newTagName = '';
      },
      error: (err) => alert('添加失败: ' + err.error),
    });
  }

  startEditTag(tag: string) {
    this.editingTag = tag;
    this.editTagName = tag;
  }

  cancelEditTag() {
    this.editingTag = null;
    this.editTagName = '';
  }

  saveTagEdit() {
    if (!this.editingTag || !this.editTagName.trim()) return;
    if (this.editTagName === this.editingTag) {
      this.cancelEditTag();
      return;
    }

    this.configService.updateTag(this.editingTag, this.editTagName.trim()).subscribe({
      next: (tags) => {
        this.tags = tags;
        this.cancelEditTag();
      },
      error: (err) => alert('更新失败'),
    });
  }

  deleteTag(tag: string) {
    if (confirm(`确定要删除标签 "${tag}" 吗？`)) {
      this.configService.deleteTag(tag).subscribe(() => {
        this.tags = this.tags.filter((t) => t !== tag);
      });
    }
  }
}
