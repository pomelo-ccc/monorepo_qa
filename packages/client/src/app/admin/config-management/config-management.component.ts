import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfigService } from '../../services/config.service';
import { ModuleNode, ModuleChild, Version } from '../../models';
import { Router, RouterModule } from '@angular/router';
import {
  ButtonComponent,
  CardComponent,
  DataTableComponent,
  TableColumn,
  TableAction,
  MessageService,
  DialogComponent,
} from '@repo/ui-lib';

interface FlatModule {
  id: string;
  name: string;
  type: string;
  parentId: string;
  original: ModuleNode;
  parentOriginal: ModuleNode;
}

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
    DialogComponent,
  ],
  template: `
    <div class="config-page">
      <!-- 固定顶部栏 -->
      <div class="sticky-header">
        <button class="back-btn" (click)="goBack()">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
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
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
          </svg>
          模块管理
        </button>
        <button class="tab-item" [class.active]="activeTab === 'tags'" (click)="activeTab = 'tags'">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"
            ></path>
            <line x1="7" y1="7" x2="7.01" y2="7"></line>
          </svg>
          标签管理
        </button>
        <button
          class="tab-item"
          [class.active]="activeTab === 'versions'"
          (click)="activeTab = 'versions'"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <line x1="6" y1="3" x2="6" y2="15"></line>
            <circle cx="18" cy="6" r="3"></circle>
            <circle cx="6" cy="18" r="3"></circle>
            <path d="M18 9a9 9 0 0 1-9 9"></path>
          </svg>
          版本管理
        </button>
      </div>

      <!-- 内容区 -->
      <main class="main-content">
        <!-- Modules Management -->
        @if (activeTab === 'modules') {
          <div class="tab-content full-height">
            <lib-card title="模块列表" [hasHeader]="true" class="full-height-card">
              <ng-container ngProjectAs="[header-extra]">
                <lib-button variant="primary" (click)="openAddModuleDialog()">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                  添加模块
                </lib-button>
              </ng-container>

              <div class="table-wrapper">
                <lib-data-table
                  [columns]="moduleColumns"
                  [data]="flatModules"
                  [actions]="moduleActions"
                  [pagination]="false"
                  [autoHeight]="false"
                ></lib-data-table>
              </div>
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
                              <path
                                d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
                              ></path>
                              <path
                                d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
                              ></path>
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

        <!-- Versions Management -->
        @if (activeTab === 'versions') {
          <div class="tab-content full-height">
            <lib-card title="版本列表" [hasHeader]="true" class="full-height-card">
              <ng-container ngProjectAs="[header-extra]">
                <div class="header-actions">
                  <lib-button variant="outline" (click)="openBatchAddVersionDialog()">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                    >
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                      <line x1="12" y1="18" x2="12" y2="12"></line>
                      <line x1="9" y1="15" x2="15" y2="15"></line>
                    </svg>
                    批量添加
                  </lib-button>
                  <lib-button variant="primary" (click)="openAddVersionDialog()">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                    >
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    添加版本
                  </lib-button>
                </div>
              </ng-container>

              <div class="table-wrapper">
                <lib-data-table
                  [columns]="versionColumns"
                  [data]="versions"
                  [actions]="versionActions"
                  [pagination]="false"
                  [autoHeight]="false"
                ></lib-data-table>
              </div>
            </lib-card>
          </div>
        }
      </main>

      <!-- Dialogs -->

      <!-- Confirm Dialog -->
      @if (confirmDialog.visible) {
        <lib-dialog
          [title]="confirmDialog.title"
          confirmVariant="danger"
          (cancelEvent)="closeConfirmDialog()"
          (confirmEvent)="onConfirmDialog()"
        >
          <p>{{ confirmDialog.message }}</p>
        </lib-dialog>
      }

      <!-- Edit/Add Module Dialog -->
      @if (moduleDialog.visible) {
        <lib-dialog
          [title]="moduleDialog.isEdit ? '编辑模块' : '添加模块'"
          (cancelEvent)="closeModuleDialog()"
          (confirmEvent)="saveModule()"
        >
          <div class="form-group">
            <label for="module-id">模块ID</label>
            <input
              id="module-id"
              [(ngModel)]="moduleDialog.data.id"
              [disabled]="moduleDialog.isEdit"
              placeholder="输入模块ID (英文)"
              class="form-input"
            />
          </div>
          <div class="form-group">
            <label for="module-name">模块名称</label>
            <input
              id="module-name"
              [(ngModel)]="moduleDialog.data.name"
              placeholder="输入模块名称"
              class="form-input"
            />
          </div>
          @if (!moduleDialog.isEdit) {
            <div class="form-group">
              <label for="module-parent">父模块</label>
              <select
                id="module-parent"
                [(ngModel)]="moduleDialog.data.parentId"
                class="form-input"
              >
                <option value="">(无 - 创建顶级模块)</option>
                @for (m of modules; track m.id) {
                  <option [value]="m.id">{{ m.name }} ({{ m.id }})</option>
                }
              </select>
            </div>
          }
        </lib-dialog>
      }

      <!-- Edit/Add Version Dialog -->
      @if (versionDialog.visible) {
        <lib-dialog
          [title]="versionDialog.isEdit ? '编辑版本' : '添加版本'"
          (cancelEvent)="closeVersionDialog()"
          (confirmEvent)="saveVersion()"
        >
          <div class="form-group">
            <label for="version-name">版本号</label>
            <input
              id="version-name"
              [(ngModel)]="versionDialog.data.name"
              placeholder="例如 1.0.0"
              class="form-input"
            />
          </div>
          <div class="form-group">
            <label for="version-desc">描述</label>
            <textarea
              id="version-desc"
              [(ngModel)]="versionDialog.data.description"
              placeholder="版本描述"
              class="form-input"
              rows="3"
            ></textarea>
          </div>
        </lib-dialog>
      }

      <!-- Batch Add Version Dialog -->
      @if (batchVersionDialog.visible) {
        <lib-dialog
          title="批量添加版本"
          (cancelEvent)="closeBatchVersionDialog()"
          (confirmEvent)="saveBatchVersions()"
        >
          <div class="form-group">
            <label for="batch-version-text">版本列表 (每行一个)</label>
            <textarea
              id="batch-version-text"
              [(ngModel)]="batchVersionDialog.text"
              placeholder="1.0.0&#10;1.0.1&#10;1.0.2"
              class="form-input"
              rows="10"
            ></textarea>
            <p class="help-text">请输入版本号，每行一个。暂不支持批量输入描述。</p>
          </div>
        </lib-dialog>
      }
    </div>
  `,
  styles: [
    `
      .config-page {
        height: 100vh;
        background: var(--color-background);
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }

      /* 固定顶部栏 */
      .sticky-header {
        flex-shrink: 0;
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
        flex-shrink: 0;
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
        min-height: 0;
        padding: 1.5rem 2rem;
        max-width: 1200px;
        width: 100%;
        margin: 0 auto;
        overflow: hidden;
        display: flex;
        flex-direction: column;
      }

      .tab-content {
        animation: fadeIn 0.2s ease-out;
        display: flex;
        flex-direction: column;
      }

      .tab-content.full-height {
        flex: 1;
        min-height: 0;
        overflow: hidden;
      }

      .table-wrapper {
        height: 100%;
        padding: 1rem;
        box-sizing: border-box;
      }

      /* 确保 full-height-card 内的 card-body 不设置 padding */
      :host ::ng-deep .full-height-card .card-body {
        padding: 0;
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
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

      .header-actions {
        display: flex;
        gap: 0.5rem;
      }

      /* Form Styles */
      .form-group {
        margin-bottom: 1rem;
      }
      .form-group label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 500;
        color: var(--color-text);
      }
      .form-input {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid var(--color-border);
        border-radius: 6px;
        background: var(--color-background);
        color: var(--color-text);
        font-size: 0.95rem;
        box-sizing: border-box;
      }
      .form-input:focus {
        outline: none;
        border-color: var(--color-primary);
      }
      .help-text {
        font-size: 0.85rem;
        color: var(--color-textSecondary);
        margin-top: 0.5rem;
      }
    `,
  ],
})
export class ConfigManagementComponent implements OnInit {
  private messageService = inject(MessageService);

  activeTab: 'modules' | 'tags' | 'versions' | 'files' = 'modules';

  // Modules Data
  modules: ModuleNode[] = [];
  modulesChanged = false;

  moduleColumns: TableColumn[] = [
    { key: 'id', label: 'ID', width: 200 },
    { key: 'name', label: '名称', width: 200 },
    { key: 'type', label: '类型', width: 150 },
  ];

  moduleActions: TableAction[] = [];
  versionActions: TableAction[] = [];

  // Tags Data
  tags: string[] = [];
  newTagName = '';
  editingTag: string | null = null;
  editTagName = '';

  // Versions Data
  versions: Version[] = [];
  versionColumns: TableColumn[] = [
    { key: 'name', label: '版本号', width: 150 },
    { key: 'description', label: '描述', width: 300 },
    {
      key: 'createTime',
      label: '创建时间',
      width: 200,
      formatter: (val: string) => new Date(val).toLocaleString(),
    },
  ];

  // Dialog States
  confirmDialog = {
    visible: false,
    title: '',
    message: '',
    onConfirm: () => void 0,
  };

  moduleDialog = {
    visible: false,
    isEdit: false,
    data: { id: '', name: '', parentId: '' },
  };

  versionDialog = {
    visible: false,
    isEdit: false,
    data: { id: '', name: '', description: '' },
  };

  batchVersionDialog = {
    visible: false,
    text: '',
  };

  /* eslint-disable @angular-eslint/prefer-inject */
  constructor(
    private configService: ConfigService,
    private router: Router,
  ) {}
  /* eslint-enable @angular-eslint/prefer-inject */

  ngOnInit() {
    this.initActions();
    this.loadModules();
    this.loadTags();
    this.loadVersions();
  }

  initActions() {
    this.moduleActions = [
      {
        label: '编辑',
        type: 'primary',
        handler: (row) => this.openEditModuleDialog(row),
      },
      {
        label: '删除',
        type: 'danger',
        handler: (row) => this.deleteModuleItem(row),
      },
    ];

    this.versionActions = [
      {
        label: '编辑',
        type: 'primary',
        handler: (row) => this.openEditVersionDialog(row),
      },
      {
        label: '删除',
        type: 'danger',
        handler: (row) => this.deleteVersion(row),
      },
    ];
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

  get flatModules(): FlatModule[] {
    const result: FlatModule[] = [];
    this.modules.forEach((parent) => {
      if (parent.children) {
        parent.children.forEach((child: ModuleChild) => {
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

  // Module Dialogs
  openAddModuleDialog() {
    this.moduleDialog = {
      visible: true,
      isEdit: false,
      data: { id: '', name: '', parentId: '' },
    };
  }

  openEditModuleDialog(row: FlatModule) {
    this.moduleDialog = {
      visible: true,
      isEdit: true,
      data: { id: row.id, name: row.name, parentId: row.parentId },
    };
  }

  closeModuleDialog() {
    this.moduleDialog.visible = false;
  }

  saveModule() {
    const { id, name, parentId } = this.moduleDialog.data;
    if (!name) {
      this.messageService.warning('请输入模块名称');
      return;
    }

    if (this.moduleDialog.isEdit) {
      this.configService.updateModuleName(id, name, parentId).subscribe({
        next: () => {
          this.messageService.success('更新成功');
          this.loadModules();
          this.closeModuleDialog();
        },
        error: (err) => this.messageService.error('更新失败: ' + (err.error?.error || err.message)),
      });
    } else {
      if (!parentId) {
        // Create Parent
        if (!id) {
          this.messageService.warning('请输入模块ID');
          return;
        }
        this.configService.createModuleParent({ id, name }).subscribe({
          next: () => {
            this.messageService.success('顶级模块创建成功');
            this.loadModules();
            this.closeModuleDialog();
          },
          error: (err) =>
            this.messageService.error('创建失败: ' + (err.error?.error || err.message)),
        });
      } else {
        // Create Child
        if (!id) {
          this.messageService.warning('请输入模块ID');
          return;
        }
        this.configService.addModuleChild(parentId, { id, name }).subscribe({
          next: () => {
            this.messageService.success('添加成功');
            this.loadModules();
            this.closeModuleDialog();
          },
          error: (err) =>
            this.messageService.error('添加失败: ' + (err.error?.error || err.message)),
        });
      }
    }
  }

  deleteModuleItem(row: FlatModule) {
    this.confirmDialog = {
      visible: true,
      title: '删除模块',
      message: `确定要删除模块 "${row.name}" 吗？`,
      onConfirm: () => {
        this.configService.deleteModuleChild(row.parentId, row.id).subscribe({
          next: () => {
            this.messageService.success('删除成功');
            this.loadModules();
            this.closeConfirmDialog();
          },
          error: (err) =>
            this.messageService.error('删除失败: ' + (err.error?.error || err.message)),
        });
      },
    };
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
        this.messageService.success('添加成功');
      },
      error: (err) => this.messageService.error('添加失败: ' + err.error),
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
        this.messageService.success('更新成功');
      },
      error: () => this.messageService.error('更新失败'),
    });
  }

  deleteTag(tag: string) {
    this.confirmDialog = {
      visible: true,
      title: '删除标签',
      message: `确定要删除标签 "${tag}" 吗？`,
      onConfirm: () => {
        this.configService.deleteTag(tag).subscribe(() => {
          this.tags = this.tags.filter((t) => t !== tag);
          this.messageService.success('删除成功');
          this.closeConfirmDialog();
        });
      },
    };
  }

  // --- Versions Logic ---
  loadVersions() {
    this.configService.getVersions().subscribe((data) => {
      this.versions = data;
    });
  }

  openAddVersionDialog() {
    this.versionDialog = {
      visible: true,
      isEdit: false,
      data: { id: '', name: '', description: '' },
    };
  }

  openEditVersionDialog(row: Version) {
    this.versionDialog = {
      visible: true,
      isEdit: true,
      data: { id: row.id, name: row.name, description: row.description || '' },
    };
  }

  closeVersionDialog() {
    this.versionDialog.visible = false;
  }

  saveVersion() {
    const { id, name, description } = this.versionDialog.data;
    if (!name) {
      this.messageService.warning('请输入版本号');
      return;
    }

    if (this.versionDialog.isEdit) {
      this.configService.updateVersion(id, { name, description }).subscribe({
        next: () => {
          this.messageService.success('更新成功');
          this.loadVersions();
          this.closeVersionDialog();
        },
        error: (err) => this.messageService.error('更新失败: ' + (err.error?.error || err.message)),
      });
    } else {
      this.configService.addVersion({ name, description }).subscribe({
        next: () => {
          this.messageService.success('添加成功');
          this.loadVersions();
          this.closeVersionDialog();
        },
        error: (err) => this.messageService.error('添加失败: ' + (err.error?.error || err.message)),
      });
    }
  }

  deleteVersion(row: Version) {
    this.confirmDialog = {
      visible: true,
      title: '删除版本',
      message: `确定要删除版本 ${row.name} 吗？`,
      onConfirm: () => {
        this.configService.deleteVersion(row.id).subscribe({
          next: () => {
            this.messageService.success('删除成功');
            this.loadVersions();
            this.closeConfirmDialog();
          },
          error: (err) =>
            this.messageService.error('删除失败: ' + (err.error?.error || err.message)),
        });
      },
    };
  }

  // Batch Add Versions
  openBatchAddVersionDialog() {
    this.batchVersionDialog = {
      visible: true,
      text: '',
    };
  }

  closeBatchVersionDialog() {
    this.batchVersionDialog.visible = false;
  }

  saveBatchVersions() {
    const text = this.batchVersionDialog.text;
    if (!text.trim()) {
      this.closeBatchVersionDialog();
      return;
    }

    const versions = text
      .split('\n')
      .map((v) => v.trim())
      .filter((v) => v);

    if (versions.length === 0) {
      this.messageService.warning('没有有效的版本号');
      return;
    }

    // Sequential execution to avoid overwhelming server or race conditions
    // In a real app, backend should support batch add
    let successCount = 0;
    let failCount = 0;

    const processNext = (index: number) => {
      if (index >= versions.length) {
        this.loadVersions();
        this.closeBatchVersionDialog();
        if (failCount === 0) {
          this.messageService.success(`成功添加 ${successCount} 个版本`);
        } else {
          this.messageService.warning(`添加完成: 成功 ${successCount} 个, 失败 ${failCount} 个`);
        }
        return;
      }

      const version = versions[index];
      this.configService.addVersion({ name: version, description: '' }).subscribe({
        next: () => {
          successCount++;
          processNext(index + 1);
        },
        error: () => {
          failCount++;
          processNext(index + 1);
        },
      });
    };

    processNext(0);
  }

  // Confirm Dialog Helpers
  closeConfirmDialog() {
    this.confirmDialog.visible = false;
  }

  onConfirmDialog() {
    this.confirmDialog.onConfirm();
  }
}
