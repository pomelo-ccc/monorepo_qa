import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  DataTableComponent,
  TableColumn,
  TableAction,
  ButtonComponent,
  CardComponent,
} from '@repo/ui-lib';
import { MODULES, PREDEFINED_TAGS, VERSION_OPTIONS } from '../models/config';

interface ConfigItem {
  id: string;
  name: string;
  type?: string;
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, DataTableComponent, ButtonComponent, CardComponent],
  template: `
    <div class="admin-container">
      <h1>系统配置管理</h1>

      <div class="tabs">
        <button
          class="tab-btn"
          [class.active]="activeTab === 'modules'"
          (click)="activeTab = 'modules'"
        >
          模块管理
        </button>
        <button class="tab-btn" [class.active]="activeTab === 'tags'" (click)="activeTab = 'tags'">
          标签管理
        </button>
        <button
          class="tab-btn"
          [class.active]="activeTab === 'versions'"
          (click)="activeTab = 'versions'"
        >
          版本管理
        </button>
      </div>

      <div class="tab-content">
        @if (activeTab === 'modules') {
          <div class="section">
            <div class="section-header">
              <h2>模块列表</h2>
              <lib-button variant="primary" (click)="showAddDialog('module')">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                添加模块
              </lib-button>
            </div>
            <lib-data-table [columns]="moduleColumns" [data]="moduleData" [actions]="moduleActions">
            </lib-data-table>
          </div>
        }

        @if (activeTab === 'tags') {
          <div class="section">
            <div class="section-header">
              <h2>标签列表</h2>
              <lib-button variant="primary" (click)="showAddDialog('tag')">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                添加标签
              </lib-button>
            </div>
            <lib-data-table [columns]="tagColumns" [data]="tagData" [actions]="tagActions">
            </lib-data-table>
          </div>
        }

        @if (activeTab === 'versions') {
          <div class="section">
            <div class="section-header">
              <h2>版本列表</h2>
              <lib-button variant="primary" (click)="showAddDialog('version')">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                添加版本
              </lib-button>
            </div>
            <lib-data-table
              [columns]="versionColumns"
              [data]="versionData"
              [actions]="versionActions"
            >
            </lib-data-table>
          </div>
        }
      </div>

      <!-- Add/Edit Dialog -->
      @if (showDialog) {
        <div class="dialog-overlay" (click)="closeDialog()">
          <div class="dialog-wrapper" (click)="$event.stopPropagation()">
            <lib-card [title]="(editingItem ? '编辑' : '添加') + dialogTitle" [hasHeader]="true">
              <ng-container ngProjectAs="[header-icon]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </ng-container>

              <form (ngSubmit)="saveItem()">
                <div class="form-group">
                  <label>名称</label>
                  <input
                    type="text"
                    [(ngModel)]="formData.name"
                    name="name"
                    required
                    placeholder="输入名称"
                    class="form-input"
                  />
                </div>
                @if (dialogType === 'module') {
                  <div class="form-group">
                    <label>类型</label>
                    <select [(ngModel)]="formData.type" name="type" class="form-input">
                      <option value="frontend">前端</option>
                      <option value="backend">后端</option>
                    </select>
                  </div>
                }
                <div class="dialog-actions">
                  <lib-button variant="ghost" type="button" (click)="closeDialog()"
                    >取消</lib-button
                  >
                  <lib-button variant="primary" type="submit">保存</lib-button>
                </div>
              </form>
            </lib-card>
          </div>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .admin-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 2rem;
      }

      h1 {
        margin: 0 0 2rem 0;
        color: var(--color-text);
        font-size: 2rem;
      }

      .tabs {
        display: flex;
        gap: 0.5rem;
        margin-bottom: 2rem;
        border-bottom: 2px solid var(--color-border);
      }

      .tab-btn {
        padding: 0.75rem 1.5rem;
        background: transparent;
        border: none;
        border-bottom: 2px solid transparent;
        color: var(--color-textSecondary);
        cursor: pointer;
        transition: all 0.2s;
        font-weight: 500;
        margin-bottom: -2px;
      }

      .tab-btn:hover {
        color: var(--color-text);
      }

      .tab-btn.active {
        color: var(--color-primary);
        border-bottom-color: var(--color-primary);
      }

      .section {
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: 12px;
        padding: 2rem;
      }

      .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
      }

      .section-header h2 {
        margin: 0;
        color: var(--color-text);
        font-size: 1.5rem;
      }

      .dialog-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
      }

      .dialog-wrapper {
        width: 90%;
        max-width: 500px;
      }

      .form-group {
        margin-bottom: 1.5rem;
      }

      .form-group label {
        display: block;
        margin-bottom: 0.5rem;
        color: var(--color-text);
        font-weight: 600;
      }

      .form-input {
        width: 100%;
        padding: 0.75rem;
        background: var(--color-background);
        border: 1px solid var(--color-border);
        border-radius: 6px;
        color: var(--color-text);
        font-size: 1rem;
        box-sizing: border-box;
      }

      .form-input:focus {
        outline: none;
        border-color: var(--color-primary);
      }

      .dialog-actions {
        display: flex;
        gap: 1rem;
        justify-content: flex-end;
        margin-top: 2rem;
      }
    `,
  ],
})
export class AdminComponent implements OnInit {
  activeTab: 'modules' | 'tags' | 'versions' = 'modules';
  showDialog = false;
  dialogType: 'module' | 'tag' | 'version' = 'module';
  editingItem: ConfigItem | null = null;
  formData: any = {};

  // Module data
  moduleData: ConfigItem[] = [];
  moduleColumns: TableColumn[] = [
    { key: 'id', label: 'ID', width: '100px' },
    { key: 'name', label: '名称' },
    { key: 'type', label: '类型', width: '150px' },
  ];
  moduleActions: TableAction[] = [
    {
      label: '编辑',
      type: 'primary',
      handler: (row) => this.editItem('module', row),
    },
    {
      label: '删除',
      type: 'danger',
      handler: (row) => this.deleteItem('module', row),
    },
  ];

  // Tag data
  tagData: ConfigItem[] = [];
  tagColumns: TableColumn[] = [
    { key: 'id', label: 'ID', width: '100px' },
    { key: 'name', label: '标签名称' },
  ];
  tagActions: TableAction[] = [
    {
      label: '编辑',
      type: 'primary',
      handler: (row) => this.editItem('tag', row),
    },
    {
      label: '删除',
      type: 'danger',
      handler: (row) => this.deleteItem('tag', row),
    },
  ];

  // Version data
  versionData: ConfigItem[] = [];
  versionColumns: TableColumn[] = [
    { key: 'id', label: 'ID', width: '100px' },
    { key: 'name', label: '版本号' },
  ];
  versionActions: TableAction[] = [
    {
      label: '编辑',
      type: 'primary',
      handler: (row) => this.editItem('version', row),
    },
    {
      label: '删除',
      type: 'danger',
      handler: (row) => this.deleteItem('version', row),
    },
  ];

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    // Load modules
    this.moduleData = [
      ...MODULES.frontend.children.map((m) => ({ id: m.id, name: m.name, type: '前端' })),
      { id: MODULES.backend.id, name: MODULES.backend.name, type: '后端' },
    ];

    // Load tags
    this.tagData = PREDEFINED_TAGS.map((tag, i) => ({ id: `tag-${i}`, name: tag }));

    // Load versions
    this.versionData = VERSION_OPTIONS.map((v, i) => ({ id: `ver-${i}`, name: v }));
  }

  get dialogTitle() {
    const titles = { module: '模块', tag: '标签', version: '版本' };
    return titles[this.dialogType];
  }

  showAddDialog(type: 'module' | 'tag' | 'version') {
    this.dialogType = type;
    this.editingItem = null;
    this.formData = type === 'module' ? { name: '', type: 'frontend' } : { name: '' };
    this.showDialog = true;
  }

  editItem(type: 'module' | 'tag' | 'version', item: ConfigItem) {
    this.dialogType = type;
    this.editingItem = item;
    this.formData = { ...item };
    this.showDialog = true;
  }

  deleteItem(type: 'module' | 'tag' | 'version', item: ConfigItem) {
    if (confirm(`确定要删除 "${item.name}" 吗？`)) {
      // TODO: Implement actual delete logic
      alert('删除功能待实现（需要后端 API 支持）');
    }
  }

  saveItem() {
    // TODO: Implement actual save logic
    alert(
      '保存功能待实现（需要后端 API 支持）\n\n当前数据：' + JSON.stringify(this.formData, null, 2),
    );
    this.closeDialog();
  }

  closeDialog() {
    this.showDialog = false;
    this.editingItem = null;
    this.formData = {};
  }
}
