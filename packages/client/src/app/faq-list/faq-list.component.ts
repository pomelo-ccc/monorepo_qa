import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FaqService } from '../faq.service';
import { FaqItem } from '../models/faq.model';
import { ThemeService } from '../services/theme.service';

@Component({
  selector: 'app-faq-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="faq-container">
      <!-- 左侧边栏 -->
      <aside class="sidebar">
        <div class="sidebar-section">
          <h3 class="sidebar-title">模块分类</h3>
          <div class="filter-list">
            <button 
              [class.active]="selectedComponent() === ''"
              (click)="filterByComponent('')"
              class="filter-item">
              全部模块
            </button>
            @for (comp of components(); track comp) {
              <button 
                [class.active]="selectedComponent() === comp"
                (click)="filterByComponent(comp)"
                class="filter-item">
                {{ comp }} {{ getComponentLabel(comp) }}
              </button>
            }
          </div>
        </div>

        <div class="sidebar-section">
          <h3 class="sidebar-title">热门搜索</h3>
          <div class="tag-cloud">
            @for (tag of popularTags(); track tag) {
              <button (click)="searchByTag(tag)" class="tag-item">
                {{ tag }}
              </button>
            }
          </div>
        </div>
      </aside>

      <!-- 主内容区 -->
      <main class="main-content">
        <!-- 搜索区域 -->
        <div class="search-section">
          <div class="search-group">
            <label class="search-label">ERROR CODE 搜索</label>
            <div class="search-input-wrapper">
              <input 
                type="text" 
                [(ngModel)]="errorCodeSearch"
                (input)="onSearch()"
                placeholder="输入错误码 (如 504, ASYNC_ERR)"
                class="search-input"
              />
            </div>
          </div>

          <div class="search-group">
            <label class="search-label">关键词搜索</label>
            <div class="search-input-wrapper">
              <input 
                type="text" 
                [(ngModel)]="keywordSearch"
                (input)="onSearch()"
                placeholder="搜索标题、现象或解决方案..."
                class="search-input"
              />
            </div>
          </div>
        </div>

        <!-- FAQ 卡片列表 -->
        @if (filteredFaqs().length > 0) {
          <div class="faq-grid">
            @for (faq of filteredFaqs(); track faq.id) {
              <div class="faq-card" [routerLink]="['/detail', faq.id]">
                <div class="card-header">
                  <h3 class="card-title">{{ faq.title }}</h3>
                  <div class="card-meta">
                    <span class="badge badge-component">{{ faq.component }}</span>
                    <span class="badge badge-version">{{ faq.version }}</span>
                    @if (faq.errorCode) {
                      <span class="badge badge-error">{{ faq.errorCode }}</span>
                    }
                  </div>
                </div>
                
                <p class="card-summary">{{ faq.summary }}</p>
                
                <div class="card-tags">
                  @for (tag of faq.tags.slice(0, 3); track tag) {
                    <span class="tag">{{ tag }}</span>
                  }
                </div>
                
                <div class="card-footer">
                  <span class="stat">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                    {{ faq.views }} 次查看
                  </span>
                  <span class="stat">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12 6 12 12 16 14"/>
                    </svg>
                    {{ faq.solveTimeMinutes }} 分钟
                  </span>
                </div>
              </div>
            }
          </div>
        } @else {
          <div class="empty-state">
            <svg class="empty-icon" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
            <h3>未找到相关问题</h3>
            <p>尝试切换模块或修改搜索条件</p>
          </div>
        }
      </main>
    </div>
  `,
  styles: [`
    .faq-container {
      display: flex;
      min-height: calc(100vh - 80px);
      background: var(--color-background);
      color: var(--color-text);
    }

    /* 侧边栏 */
    .sidebar {
      width: 280px;
      background: var(--color-surface);
      border-right: 1px solid var(--color-border);
      padding: 2rem 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .sidebar-section {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .sidebar-title {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--color-textSecondary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin: 0;
    }

    .filter-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .filter-item {
      padding: 0.75rem 1rem;
      background: transparent;
      border: none;
      border-radius: 8px;
      color: var(--color-text);
      text-align: left;
      cursor: pointer;
      transition: all 0.2s;
      font-size: 0.95rem;
    }

    .filter-item:hover {
      background: var(--color-surfaceHover);
    }

    .filter-item.active {
      background: var(--color-primary);
      color: white;
      font-weight: 600;
    }

    .tag-cloud {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .tag-item {
      padding: 0.4rem 0.8rem;
      background: var(--color-surfaceHover);
      border: 1px solid var(--color-border);
      border-radius: 6px;
      color: var(--color-textSecondary);
      font-size: 0.85rem;
      cursor: pointer;
      transition: all 0.2s;
    }

    .tag-item:hover {
      background: var(--color-primary);
      color: white;
      border-color: var(--color-primary);
    }

    /* 主内容区 */
    .main-content {
      flex: 1;
      padding: 2rem;
      overflow-y: auto;
    }

    .search-section {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
      margin-bottom: 2rem;
      padding: 2rem;
      background: var(--color-surface);
      border-radius: 12px;
      border: 1px solid var(--color-border);
    }

    .search-group {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .search-label {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--color-textSecondary);
    }

    .search-input-wrapper {
      position: relative;
    }

    .search-input {
      width: 100%;
      padding: 0.875rem 1rem;
      background: var(--color-background);
      border: 1px solid var(--color-border);
      border-radius: 8px;
      color: var(--color-text);
      font-size: 0.95rem;
      transition: all 0.2s;
    }

    .search-input:focus {
      outline: none;
      border-color: var(--color-primary);
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .search-input::placeholder {
      color: var(--color-textSecondary);
    }

    /* FAQ 卡片网格 */
    .faq-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 1.5rem;
    }

    .faq-card {
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: 12px;
      padding: 1.5rem;
      cursor: pointer;
      transition: all 0.3s;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .faq-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
      border-color: var(--color-primary);
    }

    .card-header {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .card-title {
      margin: 0;
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--color-text);
      line-height: 1.4;
    }

    .card-meta {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .badge {
      padding: 0.25rem 0.75rem;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .badge-component {
      background: var(--color-primary);
      color: white;
    }

    .badge-version {
      background: var(--color-surfaceHover);
      color: var(--color-textSecondary);
    }

    .badge-error {
      background: var(--color-accent);
      color: white;
    }

    .card-summary {
      color: var(--color-textSecondary);
      font-size: 0.9rem;
      line-height: 1.6;
      margin: 0;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .card-tags {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .tag {
      padding: 0.25rem 0.6rem;
      background: var(--color-surfaceHover);
      border-radius: 4px;
      font-size: 0.75rem;
      color: var(--color-textSecondary);
    }

    .card-footer {
      display: flex;
      justify-content: space-between;
      padding-top: 0.75rem;
      border-top: 1px solid var(--color-border);
      margin-top: auto;
    }

    .stat {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.85rem;
      color: var(--color-textSecondary);
    }

    .stat svg {
      stroke-width: 2;
    }

    /* 空状态 */
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem 2rem;
      text-align: center;
    }

    .empty-icon {
      stroke-width: 1.5;
      color: var(--color-textSecondary);
      opacity: 0.5;
      margin-bottom: 1.5rem;
    }

    .empty-state h3 {
      margin: 0 0 0.5rem 0;
      color: var(--color-text);
      font-size: 1.25rem;
    }

    .empty-state p {
      margin: 0;
      color: var(--color-textSecondary);
    }
  `]
})
export class FaqListComponent implements OnInit {
  faqs = signal<FaqItem[]>([]);
  selectedComponent = signal<string>('');
  errorCodeSearch = '';
  keywordSearch = '';

  components = computed(() => {
    const comps = new Set(this.faqs().map(f => f.component));
    return Array.from(comps).sort();
  });

  popularTags = computed(() => {
    const tagCount = new Map<string, number>();
    this.faqs().forEach(faq => {
      faq.tags.forEach(tag => {
        tagCount.set(tag, (tagCount.get(tag) || 0) + 1);
      });
    });
    return Array.from(tagCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([tag]) => tag);
  });

  filteredFaqs = computed(() => {
    let result = this.faqs();

    // 模块筛选
    if (this.selectedComponent()) {
      result = result.filter(f => f.component === this.selectedComponent());
    }

    // ERROR CODE 搜索
    if (this.errorCodeSearch.trim()) {
      const search = this.errorCodeSearch.toLowerCase();
      result = result.filter(f =>
        f.errorCode?.toLowerCase().includes(search) ||
        f.title.toLowerCase().includes(search)
      );
    }

    // 关键词搜索
    if (this.keywordSearch.trim()) {
      const search = this.keywordSearch.toLowerCase();
      result = result.filter(f =>
        f.title.toLowerCase().includes(search) ||
        f.summary.toLowerCase().includes(search) ||
        f.phenomenon.toLowerCase().includes(search) ||
        f.solution.toLowerCase().includes(search) ||
        f.tags.some(tag => tag.toLowerCase().includes(search))
      );
    }

    return result;
  });

  constructor(
    private faqService: FaqService,
    public themeService: ThemeService
  ) { }

  ngOnInit() {
    this.loadFaqs();
  }

  loadFaqs() {
    this.faqService.getFaqs().subscribe(data => {
      this.faqs.set(data);
    });
  }

  filterByComponent(component: string) {
    this.selectedComponent.set(component);
  }

  searchByTag(tag: string) {
    this.keywordSearch = tag;
    this.onSearch();
  }

  onSearch() {
    // Trigger computed signal update
  }

  getComponentLabel(comp: string): string {
    const labels: Record<string, string> = {
      'Form': '表单',
      'Table': '表格',
      'Project': '工程化',
      'Backend': '后端交互'
    };
    return labels[comp] || '';
  }
}
