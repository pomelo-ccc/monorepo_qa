import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FaqService } from '../faq.service';
import { FaqItem } from '../models/faq.model';
import { AuthService } from '../services/auth.service';
import {
  ButtonComponent,
  CardComponent,
  TagComponent,
  AvatarComponent,
  MermaidComponent,
  TreeComponent,
  TreeNode,
} from '@repo/ui-lib';

@Component({
  selector: 'app-faq-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ButtonComponent,
    CardComponent,
    TagComponent,
    AvatarComponent,
    MermaidComponent,
    TreeComponent,
  ],
  template: `
    <div class="view-container">
      <!-- 左侧导航栏 (Fixed Left) -->
      <aside class="nav-sidebar">
        <div class="sidebar-header">
          <h3 class="section-title">问题导航</h3>
        </div>
        <div class="nav-tree-wrapper">
          <lib-tree
            [nodes]="treeNodes"
            [activeId]="faq?.id || null"
            (nodeClick)="onNodeClick($event)"
          ></lib-tree>
        </div>
      </aside>

      <!-- 右侧主要内容区域 -->
      <div class="main-scroll-area">
        <div class="page-container">
          @if (faq) {
            <!-- 顶部 Header -->
            <header class="page-header">
              <div class="header-main">
                <lib-button variant="ghost" (click)="goBack()" title="返回列表">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                  </svg>
                </lib-button>
                <div class="header-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="9" y1="3" x2="9" y2="21"></line>
                  </svg>
                </div>
                <div class="header-content">
                  <div class="title-row">
                    <h1 class="title">{{ faq.title }}</h1>
                    <span class="version-badge">{{ faq.version }}</span>
                  </div>
                  <div class="meta-row">
                    <span class="author">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                      >
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                      {{ faq.author || 'Unknown' }}
                    </span>
                    <span class="separator">|</span>
                    <span class="time">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                      >
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                      </svg>
                      {{ faq.createTime || 'Recently' }}
                    </span>
                    <lib-tag
                      [color]="faq.status === 'resolved' ? '#10b981' : '#ef4444'"
                      [bgColor]="faq.status === 'resolved' ? '#ecfdf5' : '#fef2f2'"
                    >
                      {{ faq.status === 'resolved' ? '已解决' : '处理中' }}
                    </lib-tag>
                  </div>
                </div>
              </div>

              <div class="header-actions">
                <lib-button variant="outline" size="sm">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="18" cy="5" r="3"></circle>
                    <circle cx="6" cy="12" r="3"></circle>
                    <circle cx="18" cy="19" r="3"></circle>
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                  </svg>
                  分享
                </lib-button>
                <lib-button variant="outline" size="sm">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="12" cy="12" r="1"></circle>
                    <circle cx="19" cy="12" r="1"></circle>
                    <circle cx="5" cy="12" r="1"></circle>
                  </svg>
                  更多
                </lib-button>
                @if (authService.isAdmin()) {
                  <lib-button variant="primary" size="sm" [routerLink]="['/edit', faq.id]"
                    >编辑</lib-button
                  >
                }
              </div>
            </header>

            <div class="content-grid">
              <!-- 中间内容区 -->
              <main class="center-content">
                <!-- 关联信息 -->
                <lib-card class="meta-info-card" [noPadding]="false">
                  <div class="meta-grid">
                    <div class="meta-item">
                      <label>所属模块</label>
                      <div class="info-value">
                        <span class="dot"></span>
                        {{ faq.component }}
                      </div>
                    </div>

                    <div class="meta-item">
                      <label>标签</label>
                      <div class="tags-wrapper">
                        @for (tag of faq.tags; track tag) {
                          <lib-tag>{{ tag }}</lib-tag>
                        }
                      </div>
                    </div>

                    <div class="meta-item">
                      <label>贡献者</label>
                      <div class="contributors">
                        @if (faq.contributors && faq.contributors.length) {
                          @for (contributor of faq.contributors; track contributor) {
                            <lib-avatar [name]="contributor" [size]="32"></lib-avatar>
                          }
                        } @else {
                          <lib-avatar name="KD" [size]="32"></lib-avatar>
                        }
                      </div>
                    </div>
                  </div>
                </lib-card>

                <!-- 问题与现象 -->
                <lib-card title="问题与现象" variant="warning">
                  <ng-container ngProjectAs="[header-icon]">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                    >
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                  </ng-container>

                  <div class="description-box">
                    <div class="box-label">问题描述</div>
                    <p>{{ faq.summary }}</p>
                  </div>

                  <div class="reproduction-steps">
                    <div class="box-label">复现步骤 / 现象描述</div>
                    <pre>{{ faq.phenomenon }}</pre>
                  </div>
                </lib-card>

                <!-- 解决方案 -->
                <lib-card title="解决方案" variant="success">
                  <ng-container ngProjectAs="[header-icon]">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                    >
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                  </ng-container>

                  <p class="solution-text">需要确保所有 pending 状态的校验都已完成。</p>
                  <div class="code-block">
                    <pre>{{ faq.solution }}</pre>
                  </div>
                </lib-card>
              </main>

              <!-- 右侧边栏：流程图 -->
              <aside class="right-sidebar">
                <lib-card title="流程图预览">
                  <ng-container ngProjectAs="[header-icon]">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                    >
                      <rect x="3" y="3" width="7" height="7"></rect>
                      <rect x="14" y="3" width="7" height="7"></rect>
                      <rect x="14" y="14" width="7" height="7"></rect>
                      <rect x="3" y="14" width="7" height="7"></rect>
                    </svg>
                  </ng-container>

                  <lib-mermaid [code]="faq.troubleshootingFlow || ''"></lib-mermaid>

                  <div class="source-code-section">
                    <div class="source-label">Mermaid 源码:</div>
                    <div class="source-preview">
                      {{ faq.troubleshootingFlow || 'graph TD; ...' }}
                    </div>
                  </div>
                </lib-card>
              </aside>
            </div>
          } @else {
            <div class="loading">加载中...</div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        background: var(--color-background);
        min-height: 100vh;
        color: var(--color-text);
      }

      .view-container {
        display: flex;
        min-height: 100vh;
      }

      /* Nav Sidebar */
      .nav-sidebar {
        width: 280px;
        background: var(--color-surface);
        border-right: 1px solid var(--color-border);
        height: calc(100vh - 64px);
        position: sticky;
        top: 64px;
        overflow-y: auto;
        flex-shrink: 0;
        padding: 1.5rem 1rem;
        box-sizing: border-box;
        backdrop-filter: blur(10px);
      }

      .sidebar-header {
        margin-bottom: 1rem;
        padding-left: 0.5rem;
      }

      .section-title {
        font-size: 0.875rem;
        color: var(--color-text-secondary);
        margin: 0;
        font-weight: 600;
      }

      .main-scroll-area {
        flex: 1;
        min-width: 0;
      }

      .page-container {
        max-width: 1400px;
        margin: 0 auto;
        padding: 1.5rem;
      }

      /* Header Styles */
      .page-header {
        background: var(--color-surface);
        border-radius: 12px;
        padding: 1.5rem;
        margin-bottom: 1.5rem;
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        border: 1px solid var(--color-border);
        backdrop-filter: blur(10px);
      }

      .header-main {
        display: flex;
        gap: 1rem;
        align-items: center;
      }

      .header-icon {
        width: 48px;
        height: 48px;
        background: var(--color-surface-hover);
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--color-text-secondary);
      }

      .title-row {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        margin-bottom: 0.5rem;
      }

      .title {
        margin: 0;
        font-size: 1.25rem;
        font-weight: 600;
        color: var(--color-text);
      }

      .version-badge {
        background: var(--color-surface-hover);
        color: var(--color-text-secondary);
        font-size: 0.75rem;
        padding: 2px 8px;
        border-radius: 4px;
        border: 1px solid var(--color-border);
      }

      .meta-row {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        font-size: 0.875rem;
        color: var(--color-text-secondary);
      }

      .author,
      .time {
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .separator {
        color: var(--color-border);
      }

      .header-actions {
        display: flex;
        gap: 0.75rem;
      }

      /* Content Grid */
      .content-grid {
        display: grid;
        grid-template-columns: 1fr 400px;
        gap: 1.5rem;
        align-items: start;
      }

      /* Meta Info Card */
      .meta-grid {
        display: flex;
        gap: 3rem;
        align-items: flex-start;
      }

      .meta-item {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .meta-item label {
        font-size: 0.75rem;
        color: var(--color-text-secondary);
        font-weight: 500;
      }

      /* Center Content */
      .center-content {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .description-box {
        background: color-mix(in srgb, var(--color-warning), transparent 90%);
        border: 1px solid var(--color-warning);
        border-radius: 8px;
        padding: 1rem;
        margin-bottom: 1.5rem;
      }

      .box-label {
        font-size: 0.75rem;
        color: var(--color-warning);
        margin-bottom: 0.5rem;
        font-weight: 600;
      }

      .description-box p {
        margin: 0;
        color: var(--color-text);
        font-size: 0.95rem;
        line-height: 1.6;
      }

      .reproduction-steps pre {
        white-space: pre-wrap;
        font-family: inherit;
        color: var(--color-text);
        margin: 0;
        line-height: 1.6;
      }

      .solution-text {
        margin-bottom: 1rem;
        color: var(--color-text);
        line-height: 1.6;
      }

      .code-block {
        background: #111827; /* Keep dark for code */
        border-radius: 8px;
        padding: 1rem;
        color: #e5e7eb;
        font-family: monospace;
        overflow-x: auto;
        border: 1px solid var(--color-border);
      }

      .code-block pre {
        margin: 0;
      }

      /* Right Sidebar */
      .right-sidebar {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .source-code-section {
        background: var(--color-surface-hover);
        border-radius: 6px;
        padding: 0.75rem;
        margin-top: 1rem;
      }

      .source-label {
        font-size: 0.75rem;
        color: var(--color-text-secondary);
        margin-bottom: 0.5rem;
      }

      .source-preview {
        font-family: monospace;
        font-size: 0.75rem;
        color: var(--color-text-secondary);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .info-value {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 0.875rem;
        font-weight: 500;
        color: var(--color-text);
      }

      .dot {
        width: 8px;
        height: 8px;
        background: var(--color-primary);
        border-radius: 50%;
      }

      .tags-wrapper {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
      }

      .contributors {
        display: flex;
        gap: -8px;
      }

      @media (max-width: 1200px) {
        .content-grid {
          grid-template-columns: 1fr;
        }
        .right-sidebar {
          grid-column: 1 / -1;
        }
      }

      @media (max-width: 768px) {
        .view-container {
          flex-direction: column;
        }
        .nav-sidebar {
          width: 100%;
          height: auto;
          position: static;
          border-right: none;
          border-bottom: 1px solid var(--color-border);
        }
        .page-header {
          flex-direction: column;
          gap: 1rem;
        }
        .header-actions {
          width: 100%;
          justify-content: flex-end;
        }
      }
    `,
  ],
})
export class FaqDetailComponent implements OnInit {
  faq?: FaqItem;
  treeNodes: TreeNode[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private faqService: FaqService,
    public authService: AuthService,
  ) {}

  ngOnInit() {
    // Load all FAQs to build the nav tree
    this.faqService.getFaqs().subscribe((faqs) => {
      this.buildNavTree(faqs);
    });

    // Subscribe to route params to update current FAQ
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.loadFaq(id);
      }
    });
  }

  loadFaq(id: string) {
    this.faqService.getFaq(id).subscribe((data) => {
      this.faq = data;
      this.faqService.updateFaq(id, { views: data.views + 1 }).subscribe();
    });
  }

  buildNavTree(faqs: FaqItem[]) {
    const groups = new Map<string, FaqItem[]>();

    faqs.forEach((item) => {
      const comp = item.component || 'Other';
      if (!groups.has(comp)) {
        groups.set(comp, []);
      }
      groups.get(comp)?.push(item);
    });

    this.treeNodes = Array.from(groups.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([name, items]) => ({
        id: name,
        label: name,
        expanded: true,
        count: items.length,
        children: items.map((item) => ({
          id: item.id,
          label: item.title,
          isLeaf: true,
          data: item,
        })),
      }));
  }

  onNodeClick(node: TreeNode) {
    if (node.isLeaf && node.data) {
      const item = node.data as FaqItem;
      this.router.navigate(['/detail', item.id]);
    }
  }

  goBack() {
    this.router.navigate(['/']);
  }
}
