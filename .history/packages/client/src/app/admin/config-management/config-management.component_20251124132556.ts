import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfigService, ModuleNode } from '../../services/config.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-config-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="config-layout">
      <header class="page-header">
        <h1>配置管理</h1>
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
        </div>
      </header>

      <main class="main-content">
        <!-- Modules Management -->
        <div *ngIf="activeTab === 'modules'" class="tab-content">
          <div class="actions-bar">
            <button class="btn-primary" (click)="addTopLevelModule()">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              添加一级模块
            </button>
            <button class="btn-success" (click)="saveModules()" [disabled]="!modulesChanged">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                <polyline points="17 21 17 13 7 13 7 21"></polyline>
                <polyline points="7 3 7 8 15 8"></polyline>
              </svg>
              保存更改
            </button>
          </div>

          <div class="modules-tree">
            <div *ngFor="let module of modules; let i = index" class="module-item">
              <div class="module-row">
                <div class="module-info">
                  <span class="expand-icon" (click)="toggleExpand(module)">
                    {{ module.expanded ? '▼' : '▶' }}
                  </span>
                  <input 
                    [(ngModel)]="module.name" 
                    (ngModelChange)="markModulesChanged()"
                    class="edit-input"
                    placeholder="模块名称"
                  />
                  <span class="module-id">ID: {{ module.id }}</span>
                </div>
                <div class="module-actions">
                  <button class="btn-icon" (click)="addSubModule(module)" title="添加子模块">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                  </button>
                  <button class="btn-icon danger" (click)="deleteModule(modules, i)" title="删除">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Submodules -->
              <div class="sub-modules" *ngIf="module.expanded">
                <div *ngFor="let sub of module.children; let j = index" class="module-item sub">
                  <div class="module-row">
                    <div class="module-info">
                      <span class="dot"></span>
                      <input 
                        [(ngModel)]="sub.name" 
                        (ngModelChange)="markModulesChanged()"
                        class="edit-input"
                        placeholder="子模块名称"
                      />
                      <span class="module-id">ID: {{ sub.id }}</span>
                    </div>
                    <div class="module-actions">
                      <button class="btn-icon danger" (click)="deleteModule(module.children!, j)" title="删除">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
                <div class="empty-sub" *ngIf="!module.children?.length">
                  暂无子模块
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Tags Management -->
        <div *ngIf="activeTab === 'tags'" class="tab-content">
          <div class="add-tag-section">
            <input 
              [(ngModel)]="newTagName" 
              (keyup.enter)="addTag()"
              placeholder="输入新标签名称并回车"
              class="add-input"
            />
            <button class="btn-primary" (click)="addTag()" [disabled]="!newTagName">
              添加标签
            </button>
          </div>

          <div class="tags-grid">
            <div *ngFor="let tag of tags" class="tag-card">
              <div *ngIf="editingTag !== tag" class="tag-view">
                <span class="tag-name">{{ tag }}</span>
                <div class="tag-actions">
                  <button class="btn-icon-sm" (click)="startEditTag(tag)">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                  </button>
                  <button class="btn-icon-sm danger" (click)="deleteTag(tag)">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor">
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
        </div>
      </main>
    </div>
  `,
  styles: [`
    .config-layout {
      min-height: calc(100vh - 64px);
      background: var(--color-background);
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .page-header {
      margin-bottom: 2rem;
    }

    .page-header h1 {
      font-size: 1.8rem;
      margin-bottom: 1.5rem;
      color: var(--color-text);
    }

    .tabs {
      display: flex;
      gap: 1rem;
      border-bottom: 1px solid var(--color-border);
    }

    .tab-btn {
      padding: 0.75rem 1.5rem;
      background: none;
      border: none;
      border-bottom: 2px solid transparent;
      color: var(--color-textSecondary);
      font-size: 1rem;
      cursor: pointer;
      transition: all 0.2s;
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
      background: var(--color-surface);
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }

    /* Modules Styles */
    .actions-bar {
      display: flex;
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .modules-tree {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .module-item {
      border: 1px solid var(--color-border);
      border-radius: 8px;
      overflow: hidden;
    }

    .module-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem 1rem;
      background: #f8fafc;
    }

    .module-item.sub .module-row {
      background: #fff;
      border-top: 1px solid var(--color-border);
    }

    .module-info {
      display: flex;
      align-items: center;
      gap: 1rem;
      flex: 1;
    }

    .expand-icon {
      cursor: pointer;
      width: 20px;
      color: var(--color-textSecondary);
      font-size: 0.8rem;
    }

    .dot {
      width: 20px;
      display: flex;
      justify-content: center;
    }
    .dot::before {
      content: '';
      width: 6px;
      height: 6px;
      background: var(--color-border);
      border-radius: 50%;
    }

    .edit-input {
      padding: 0.4rem 0.8rem;
      border: 1px solid transparent;
      border-radius: 4px;
      background: transparent;
      font-size: 0.95rem;
      color: var(--color-text);
      transition: all 0.2s;
    }

    .edit-input:hover, .edit-input:focus {
      background: #fff;
      border-color: var(--color-border);
    }

    .module-id {
      font-size: 0.8rem;
      color: var(--color-textSecondary);
      font-family: monospace;
      background: #f1f5f9;
      padding: 2px 6px;
      border-radius: 4px;
    }

    .module-actions {
      display: flex;
      gap: 0.5rem;
      opacity: 0;
      transition: opacity 0.2s;
    }

    .module-row:hover .module-actions {
      opacity: 1;
    }

    .sub-modules {
      padding-left: 2rem;
      background: #f8fafc;
    }

    .empty-sub {
      padding: 1rem;
      color: var(--color-textSecondary);
      font-size: 0.85rem;
      font-style: italic;
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
    }

    .tags-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
    }

    .tag-card {
      background: #fff;
      border: 1px solid var(--color-border);
      border-radius: 20px;
      padding: 0.4rem 0.5rem 0.4rem 1rem;
      display: flex;
      align-items: center;
      transition: all 0.2s;
    }

    .tag-card:hover {
      border-color: var(--color-primary);
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
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
    }

    /* Buttons */
    .btn-primary, .btn-success {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.6rem 1.2rem;
      border: none;
      border-radius: 6px;
      color: white;
      cursor: pointer;
      font-weight: 500;
      transition: background 0.2s;
    }

    .btn-primary { background: var(--color-primary); }
    .btn-primary:hover { background: var(--color-primaryLight); }
    .btn-primary:disabled { background: #cbd5e1; cursor: not-allowed; }

    .btn-success { background: #10b981; }
    .btn-success:hover { background: #059669; }
    .btn-success:disabled { background: #cbd5e1; cursor: not-allowed; }

    .btn-icon {
      width: 28px;
      height: 28px;
      border-radius: 4px;
      border: 1px solid var(--color-border);
      background: #fff;
      color: var(--color-textSecondary);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }

    .btn-icon:hover {
      border-color: var(--color-primary);
      color: var(--color-primary);
    }

    .btn-icon.danger:hover {
      border-color: #ef4444;
      color: #ef4444;
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
      background: #f1f5f9;
      color: var(--color-text);
    }

    .btn-icon-sm.danger:hover {
      color: #ef4444;
      background: #fef2f2;
    }
    
    .btn-icon-sm.success {
      color: #10b981;
    }
  `]
})
export class ConfigManagementComponent implements OnInit {
  activeTab: 'modules' | 'tags' = 'modules';
  
  // Modules Data
  modules: any[] = [];
  modulesChanged = false;

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
    this.configService.getModules().subscribe(data => {
      this.modules = data.map(m => ({ ...m, expanded: true }));
      this.modulesChanged = false;
    });
  }

  toggleExpand(module: any) {
    module.expanded = !module.expanded;
  }

  addTopLevelModule() {
    const id = prompt('请输入模块ID (英文):');
    if (!id) return;
    if (this.modules.some(m => m.id === id)) {
      alert('ID已存在');
      return;
    }
    
    this.modules.push({
      id,
      name: '新模块',
      children: [],
      expanded: true
    });
    this.markModulesChanged();
  }

  addSubModule(parent: any) {
    const id = prompt('请输入子模块ID (英文):');
    if (!id) return;
    if (parent.children?.some((m: any) => m.id === id)) {
      alert('ID已存在');
      return;
    }

    if (!parent.children) parent.children = [];
    parent.children.push({
      id,
      name: '新子模块'
    });
    parent.expanded = true;
    this.markModulesChanged();
  }

  deleteModule(list: any[], index: number) {
    if (confirm('确定要删除该模块吗？')) {
      list.splice(index, 1);
      this.markModulesChanged();
    }
  }

  markModulesChanged() {
    this.modulesChanged = true;
  }

  saveModules() {
    // Clean up UI properties like 'expanded' before saving
    const cleanModules = this.modules.map(m => ({
      id: m.id,
      name: m.name,
      children: m.children?.map((c: any) => ({
        id: c.id,
        name: c.name
      }))
    }));

    this.configService.saveModules(cleanModules).subscribe(() => {
      this.modulesChanged = false;
      alert('保存成功');
    });
  }

  // --- Tags Logic ---
  loadTags() {
    this.configService.getTags().subscribe(data => {
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
      error: (err) => alert('添加失败: ' + err.error)
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
      error: (err) => alert('更新失败')
    });
  }

  deleteTag(tag: string) {
    if (confirm(`确定要删除标签 "${tag}" 吗？`)) {
      this.configService.deleteTag(tag).subscribe(() => {
        this.tags = this.tags.filter(t => t !== tag);
      });
    }
  }
}
