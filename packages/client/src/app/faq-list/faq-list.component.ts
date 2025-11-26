import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FaqService, ConfigService, ThemeService } from '../services';
import { FaqItem, FlatModule } from '../models';
import { ButtonComponent } from '@repo/ui-lib';

@Component({
  selector: 'app-faq-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ButtonComponent],
  template: `
    <div class="faq-container">
      <!-- 左侧边栏 -->
      <aside class="sidebar">
        <div class="sidebar-section">
          <h3 class="sidebar-title">模块分类</h3>
          <div class="filter-list">
            <lib-button
              [variant]="selectedModule() === '' ? 'primary' : 'ghost'"
              [block]="true"
              (click)="filterByModule('')"
              class="filter-btn"
            >
              全部模块
            </lib-button>
            @for (mod of usedModules(); track mod.id) {
              <lib-button
                [variant]="selectedModule() === mod.id ? 'primary' : 'ghost'"
                [block]="true"
                (click)="filterByModule(mod.id)"
                class="filter-btn"
              >
                {{ getModuleName(mod.id) }}
              </lib-button>
            }
          </div>
        </div>

        <div class="sidebar-section">
          <h3 class="sidebar-title">热门搜索</h3>
          <div class="tag-cloud">
            @for (tag of popularTags(); track tag) {
              <lib-button variant="outline" size="sm" (click)="searchByTag(tag)">
                {{ tag }}
              </lib-button>
            }
          </div>
        </div>
      </aside>

      <!-- 主内容区 -->
      <main class="main-content">
        <!-- 搜索区域 -->
        <div class="search-section">
          <div class="search-container">
            <div class="search-input-wrapper" [class.focused]="searchFocused">
              <div class="search-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
              </div>
              <input
                type="text"
                [(ngModel)]="keywordSearch"
                (focus)="searchFocused = true"
                (blur)="searchFocused = false"
                placeholder="搜索问题、错误码或解决方案..."
                class="search-input"
              />
              @if (keywordSearch) {
                <button class="clear-btn" (click)="keywordSearch = ''">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              }
            </div>
          </div>
        </div>

        <!-- FAQ 卡片列表 -->
        @if (filteredFaqs().length > 0) {
          <div class="faq-grid">
            @for (faq of filteredFaqs(); track faq.id) {
              <div class="faq-card" [routerLink]="['/detail', faq.id]">
                <div class="card-content">
                  <!-- 标题放在最显眼的位置 -->
                  <h3 class="card-title">{{ faq.title }}</h3>

                  <!-- 辅助信息行：模块、版本、错误码 -->
                  <div class="card-meta-row">
                    <div class="badges-wrapper">
                      <span class="capsule capsule-primary">{{ faq.component }}</span>
                      <span class="capsule capsule-outline">{{ faq.version }}</span>
                    </div>
                    @if (faq.errorCode) {
                      <span class="capsule capsule-warning">{{ faq.errorCode }}</span>
                    }
                  </div>

                  <!-- 摘要 -->
                  <p class="card-summary">{{ faq.summary }}</p>
                </div>

                <!-- 底部信息：标签和统计 -->
                <div class="card-footer">
                  <div class="tags-wrapper">
                    @for (tag of faq.tags.slice(0, 3); track tag) {
                      <span class="mini-tag">#{{ tag }}</span>
                    }
                  </div>
                  <div class="stats-wrapper">
                    <span class="stat-item" title="查看次数">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                      {{ faq.views }}
                    </span>
                    <span class="stat-item" title="解决时长">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      {{ faq.solveTimeMinutes }}m
                    </span>
                  </div>
                </div>
              </div>
            }
          </div>
        } @else {
          <div class="empty-state">
            <svg
              class="empty-icon"
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <h3>未找到相关问题</h3>
            <p>尝试切换模块或修改搜索条件</p>
          </div>
        }
      </main>
    </div>
  `,
  styles: [
    `
      .faq-container {
        display: flex;
        min-height: calc(100vh - 80px);
        background: transparent;
        color: var(--color-text);
      }

      /* 侧边栏 - 拟物化玻璃效果 */
      .sidebar {
        width: 280px;
        background: var(--color-surface);
        border-right: 1px solid var(--color-border);
        border-right-color: var(--color-glassBorderTop, var(--color-border));
        padding: 2rem 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 2rem;
        backdrop-filter: blur(var(--color-glassBlur, 0px));
        -webkit-backdrop-filter: blur(var(--color-glassBlur, 0px));
        box-shadow: var(--color-cardShadow, none);
        position: relative;
      }

      /* 侧边栏高光效果 */
      .sidebar::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 100%;
        background: var(--color-glassReflection, none);
        pointer-events: none;
        opacity: 0.5;
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

      :host ::ng-deep .filter-btn .btn {
        justify-content: flex-start;
        text-align: left;
        padding-left: 1rem;
      }

      .tag-cloud {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
      }

      /* 主内容区 */
      .main-content {
        flex: 1;
        padding: 2rem;
        overflow-y: auto;
      }

      .search-section {
        margin-bottom: 2.5rem;
        padding: 0;
        background: transparent;
        border: none;
        box-shadow: none;
        backdrop-filter: none;
        -webkit-backdrop-filter: none;
      }

      .search-section::before {
        display: none;
      }

      .search-container {
        max-width: 800px;
        margin: 0 auto;
      }

      .search-input-wrapper {
        position: relative;
        display: flex;
        align-items: center;
        background: var(--color-surface);
        border-radius: 24px;
        padding: 0.5rem 1rem;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        border: 1px solid transparent;
        box-shadow:
          0 4px 20px rgba(0, 0, 0, 0.05),
          0 1px 3px rgba(0, 0, 0, 0.02);
      }

      /* 玻璃态增强 */
      .search-input-wrapper {
        background: var(--color-surface);
        backdrop-filter: blur(var(--color-glassBlur, 10px));
        -webkit-backdrop-filter: blur(var(--color-glassBlur, 10px));
        border: 1px solid var(--color-border);
        border-top-color: var(--color-glassBorderTop, var(--color-border));
        border-bottom-color: var(--color-glassBorderBottom, var(--color-border));
      }

      .search-input-wrapper.focused {
        transform: translateY(-2px) scale(1.01);
        background: var(--color-surface);
        box-shadow:
          0 15px 35px rgba(0, 0, 0, 0.1),
          0 5px 15px rgba(0, 0, 0, 0.05),
          0 0 0 2px color-mix(in srgb, var(--color-primary), transparent 85%);
        border-color: color-mix(in srgb, var(--color-primary), transparent 70%);
      }

      .search-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0 0.75rem;
        color: var(--color-textSecondary);
        transition: color 0.3s;
      }

      .search-input-wrapper.focused .search-icon {
        color: var(--color-primary);
      }

      .search-input {
        flex: 1;
        width: 100%;
        padding: 1rem 0.5rem;
        background: transparent;
        border: none;
        color: var(--color-text);
        font-size: 1.1rem;
        font-weight: 500;
        outline: none;
        box-shadow: none;
      }

      .search-input::placeholder {
        color: var(--color-textSecondary);
        font-weight: 400;
        opacity: 0.7;
      }

      .clear-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        padding: 0;
        border: none;
        background: transparent;
        color: var(--color-textSecondary);
        border-radius: 50%;
        cursor: pointer;
        transition: all 0.2s;
        opacity: 0;
        transform: scale(0.8);
        margin-right: 0.5rem;
      }

      .search-input-wrapper:hover .clear-btn,
      .search-input-wrapper.focused .clear-btn {
        opacity: 1;
        transform: scale(1);
      }

      .clear-btn:hover {
        background: var(--color-surfaceHover);
        color: var(--color-text);
      }

      /* FAQ 卡片网格 */
      .faq-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
        gap: 1.25rem;
      }

      /* 卡片主体 */
      .faq-card {
        background: var(--color-surface);
        border-radius: 20px;
        overflow: hidden;
        cursor: pointer;
        transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        border: 1px solid var(--color-border);
        border-top-color: var(--color-glassBorderTop, var(--color-border));
        border-bottom-color: var(--color-glassBorderBottom, var(--color-border));
        box-shadow: var(--color-cardShadow, 0 4px 6px -1px rgba(0, 0, 0, 0.1));
        backdrop-filter: blur(var(--color-glassBlur, 0px));
        -webkit-backdrop-filter: blur(var(--color-glassBlur, 0px));
        display: flex;
        flex-direction: column;
        height: 100%;
        position: relative;
      }

      /* 玻璃态光晕效果 */
      .faq-card::after {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: 20px;
        padding: 1px;
        background: linear-gradient(
          135deg,
          var(--color-glassHighlight, transparent) 0%,
          transparent 50%,
          var(--color-glassShadow, transparent) 100%
        );
        -webkit-mask:
          linear-gradient(#fff 0 0) content-box,
          linear-gradient(#fff 0 0);
        -webkit-mask-composite: xor;
        mask-composite: exclude;
        pointer-events: none;
        opacity: 0.5;
        transition: opacity 0.4s;
      }

      .faq-card:hover {
        transform: translateY(-4px) scale(1.01);
        box-shadow:
          var(--color-cardShadow, 0 4px 6px -1px rgba(0, 0, 0, 0.1)),
          0 20px 25px -5px rgba(0, 0, 0, 0.1),
          0 8px 10px -6px rgba(0, 0, 0, 0.1);
      }

      .faq-card:hover::after {
        opacity: 1;
      }

      /* 卡片内容区 */
      .card-content {
        padding: 1.5rem 1.5rem 0.5rem;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        flex: 1;
      }

      .card-title {
        margin: 0;
        font-size: 1.35rem;
        font-weight: 700;
        color: var(--color-text);
        line-height: 1.3;
        letter-spacing: -0.02em;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        transition: color 0.3s;
      }

      .card-meta-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 0.25rem;
      }

      .badges-wrapper {
        display: flex;
        gap: 0.5rem;
      }

      .capsule {
        padding: 0.15rem 0.5rem;
        border-radius: 6px;
        font-size: 0.7rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.02em;
        line-height: 1;
        display: inline-flex;
        align-items: center;
      }

      .capsule-primary {
        background: color-mix(in srgb, var(--color-primary), transparent 90%);
        color: var(--color-primaryLight);
        border: 1px solid color-mix(in srgb, var(--color-primary), transparent 80%);
      }

      .capsule-outline {
        background: transparent;
        border: 1px solid var(--color-border);
        color: var(--color-textSecondary);
      }

      .capsule-warning {
        background: color-mix(in srgb, var(--color-accent), transparent 90%);
        color: var(--color-accent);
        border: 1px solid color-mix(in srgb, var(--color-accent), transparent 80%);
      }

      .card-summary {
        color: var(--color-textSecondary);
        font-size: 0.9rem;
        line-height: 1.6;
        margin: 0.5rem 0 0;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        opacity: 0.8;
      }

      /* 底部区域 */
      .card-footer {
        padding: 1rem 1.5rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-top: 1px solid color-mix(in srgb, var(--color-border), transparent 50%);
        background: linear-gradient(
          180deg,
          transparent 0%,
          color-mix(in srgb, var(--color-surfaceHover), transparent 80%) 100%
        );
      }

      .tags-wrapper {
        display: flex;
        gap: 0.5rem;
      }

      .mini-tag {
        font-size: 0.8rem;
        color: var(--color-textSecondary);
        font-weight: 500;
        transition: color 0.2s;
      }

      .faq-card:hover .mini-tag {
        color: var(--color-text);
      }

      .stats-wrapper {
        display: flex;
        gap: 1rem;
      }

      .stat-item {
        display: flex;
        align-items: center;
        gap: 0.35rem;
        font-size: 0.8rem;
        color: var(--color-textSecondary);
        font-weight: 500;
      }

      .stat-item svg {
        opacity: 0.6;
        transition: opacity 0.3s;
      }

      .faq-card:hover .stat-item svg {
        opacity: 1;
        color: var(--color-primary);
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
    `,
  ],
})
export class FaqListComponent implements OnInit {
  private faqService = inject(FaqService);
  private configService = inject(ConfigService);
  public themeService = inject(ThemeService);

  faqs = signal<FaqItem[]>([]);
  modules = signal<FlatModule[]>([]);
  selectedModule = signal<string>('');
  keywordSearch = '';
  searchFocused = false;

  /**
   * 从 FAQ 数据中提取已使用的模块
   */
  usedModules = computed(() => {
    const moduleIds = new Set(this.faqs().map((f) => f.component));
    return this.modules().filter((m) => moduleIds.has(m.id));
  });

  popularTags = computed(() => {
    const tagCount = new Map<string, number>();
    this.faqs().forEach((faq) => {
      faq.tags.forEach((tag) => {
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
    if (this.selectedModule()) {
      result = result.filter((f) => f.component === this.selectedModule());
    }

    // 关键词搜索
    if (this.keywordSearch.trim()) {
      const search = this.keywordSearch.toLowerCase();
      result = result.filter(
        (f) =>
          f.title.toLowerCase().includes(search) ||
          f.summary.toLowerCase().includes(search) ||
          f.phenomenon.toLowerCase().includes(search) ||
          f.solution.toLowerCase().includes(search) ||
          f.errorCode?.toLowerCase().includes(search) ||
          f.tags.some((tag) => tag.toLowerCase().includes(search)),
      );
    }

    return result;
  });

  ngOnInit() {
    this.loadData();
  }

  private loadData() {
    this.faqService.getAll().subscribe((data) => {
      this.faqs.set(data);
    });
    this.configService.getFlatModules().subscribe((data) => {
      this.modules.set(data);
    });
  }

  filterByModule(moduleId: string) {
    this.selectedModule.set(moduleId);
  }

  searchByTag(tag: string) {
    this.keywordSearch = tag;
  }

  getModuleName(moduleId: string): string {
    const module = this.modules().find((m) => m.id === moduleId);
    if (!module) return moduleId;
    return module.parentName ? `${module.parentName} - ${module.name}` : module.name;
  }
}
