import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfigService, ModuleNode } from '../../services/config.service';
import { RouterModule } from '@angular/router';
import {
  ButtonComponent,
  CardComponent,
  DataTableComponent,
  TableColumn,
  TableAction,
} from '@repo/ui-lib';

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
  ],
  template: `
    <div class="config-layout">
      <header class="page-header">
        <h1>系统配置管理</h1>
        <div class="tabs">
          <button
            class="tab-btn"
            [class.active]="activeTab === 'modules'"
            (click)="activeTab = 'modules'"
          >
            模块管理
          </button>
          <button
            class="tab-btn"
            [class.active]="activeTab === 'tags'"
            (click)="activeTab = 'tags'"
          >
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
      </header>

      <main class="main-content">
        <!-- Modules Management -->
        <div *ngIf="activeTab === 'modules'" class="tab-content">
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

        <!-- Tags Management -->
        <div *ngIf="activeTab === 'tags'" class="tab-content">
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
              <div *ngFor="let tag of tags" class="tag-card">
                <div *ngIf="editingTag !== tag" class="tag-view">
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
                <div *ngIf="editingTag === tag" class="tag-edit">
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
              </div>
            </div>
          </lib-card>
        </div>

        <!-- Versions Management (Placeholder) -->
        <div *ngIf="activeTab === 'versions'" class="tab-content">
          <lib-card title="版本列表">
            <div class="empty-state">暂无版本数据</div>
          </lib-card>
        </div>
      </main>
    </div>
  `,
  styles: [
    `
      .config-layout {
        min-height: calc(100vh - 64px);
        background: var(--color-background);
        padding: 2rem;
        max-width: 1400px;
        margin: 0 auto;
      }

      .page-header {
        margin-bottom: 2rem;
      }

      .page-header h1 {
        font-size: 1.8rem;
        margin-bottom: 1.5rem;
        color: var(--color-text);
        font-weight: 700;
      }

      .tabs {
        display: flex;
        gap: 2rem;
        border-bottom: 1px solid var(--color-border);
      }

      .tab-btn {
        padding: 0.75rem 0;
        background: none;
        border: none;
        border-bottom: 2px solid transparent;
        color: var(--color-textSecondary);
        font-size: 1rem;
        cursor: pointer;
        transition: all 0.2s;
        font-weight: 500;
      }

      .tab-btn:hover {
        color: var(--color-primary);
      }

      .tab-btn.active {
        color: var(--color-primary);
        border-bottom-color: var(--color-primary);
        font-weight: 600;
      }

      .tab-content {
        margin-top: 1.5rem;
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
  activeTab: 'modules' | 'tags' | 'versions' = 'modules';

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

  constructor(private configService: ConfigService) {}

  ngOnInit() {
    this.loadModules();
    this.loadTags();
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
