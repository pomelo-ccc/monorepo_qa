import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FaqService } from '../faq.service';
import { FaqItem } from '../models/faq.model';
import { AuthService } from '../services/auth.service';
import mermaid from 'mermaid';

@Component({
  selector: 'app-faq-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="page-container">
      @if (faq) {
        <!-- 顶部 Header -->
        <header class="page-header">
          <div class="header-main">
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
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  {{ faq.author || 'Unknown' }}
                </span>
                <span class="separator">|</span>
                <span class="time">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                  {{ faq.createTime || 'Recently' }}
                </span>
                <span class="status-badge" [class.resolved]="faq.status === 'resolved'">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  {{ faq.status === 'resolved' ? '已解决' : '处理中' }}
                </span>
              </div>
            </div>
          </div>
          
          <div class="header-actions">
            <button class="action-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="18" cy="5" r="3"></circle>
                <circle cx="6" cy="12" r="3"></circle>
                <circle cx="18" cy="19" r="3"></circle>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
              </svg>
              分享
            </button>
            <button class="action-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="1"></circle>
                <circle cx="19" cy="12" r="1"></circle>
                <circle cx="5" cy="12" r="1"></circle>
              </svg>
              更多
            </button>
            @if (authService.isAdmin()) {
              <button class="action-btn primary" [routerLink]="['/edit', faq.id]">
                编辑
              </button>
            }
          </div>
        </header>

        <div class="layout-grid">
          <!-- 左侧边栏：关联信息 -->
          <aside class="left-sidebar">
            <div class="sidebar-section">
              <h3 class="section-title">关联信息</h3>
              
              <div class="info-item">
                <label>所属模块</label>
                <div class="info-value">
                  <span class="dot"></span>
                  {{ faq.component }}
                </div>
              </div>

              <div class="info-item">
                <label>标签</label>
                <div class="tags-wrapper">
                  @for (tag of faq.tags; track tag) {
                    <span class="tag">{{ tag }}</span>
                  }
                </div>
              </div>

              <div class="info-item">
                <label>贡献者</label>
                <div class="contributors">
                  @if (faq.contributors && faq.contributors.length) {
                    @for (contributor of faq.contributors; track contributor) {
                      <div class="avatar" [title]="contributor">{{ contributor.slice(0, 2).toUpperCase() }}</div>
                    }
                  } @else {
                    <div class="avatar">KD</div>
                  }
                </div>
              </div>
            </div>
          </aside>

          <!-- 中间内容区 -->
          <main class="center-content">
            <!-- 问题与现象 -->
            <section class="content-card">
              <div class="card-header warning">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <h2>问题与现象</h2>
              </div>
              
              <div class="card-body">
                <div class="description-box">
                  <div class="box-label">问题描述</div>
                  <p>{{ faq.summary }}</p>
                </div>

                <div class="reproduction-steps">
                  <div class="box-label">复现步骤 / 现象描述</div>
                  <pre>{{ faq.phenomenon }}</pre>
                </div>
              </div>
            </section>

            <!-- 解决方案 -->
            <section class="content-card">
              <div class="card-header success">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                <h2>解决方案</h2>
              </div>
              
              <div class="card-body">
                <p class="solution-text">需要确保所有 pending 状态的校验都已完成。</p>
                <div class="code-block">
                  <pre>{{ faq.solution }}</pre>
                </div>
              </div>
            </section>
          </main>

          <!-- 右侧边栏：流程图 -->
          <aside class="right-sidebar">
            <div class="sidebar-card">
              <div class="card-header">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <rect x="3" y="3" width="7" height="7"></rect>
                  <rect x="14" y="3" width="7" height="7"></rect>
                  <rect x="14" y="14" width="7" height="7"></rect>
                  <rect x="3" y="14" width="7" height="7"></rect>
                </svg>
                <h3>流程图预览</h3>
              </div>
              
              <div class="mermaid-container">
                @if (faq.troubleshootingFlow) {
                  <div #mermaidDiv class="mermaid">{{ faq.troubleshootingFlow }}</div>
                } @else {
                  <div class="empty-state">暂无流程图</div>
                }
              </div>

              <div class="source-code-section">
                <div class="source-label">Mermaid 源码:</div>
                <div class="source-preview">
                  {{ faq.troubleshootingFlow || 'graph TD; ...' }}
                </div>
              </div>
            </div>
          </aside>
        </div>
      } @else {
        <div class="loading">加载中...</div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
      background: #f5f7fa;
      min-height: 100vh;
      color: #333;
    }

    .page-container {
      max-width: 1600px;
      margin: 0 auto;
      padding: 1.5rem;
    }

    /* Header Styles */
    .page-header {
      background: #fff;
      border-radius: 12px;
      padding: 1.5rem;
      margin-bottom: 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }

    .header-main {
      display: flex;
      gap: 1rem;
    }

    .header-icon {
      width: 48px;
      height: 48px;
      background: #f0f2f5;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #666;
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
      color: #1f2937;
    }

    .version-badge {
      background: #f3f4f6;
      color: #6b7280;
      font-size: 0.75rem;
      padding: 2px 8px;
      border-radius: 4px;
      border: 1px solid #e5e7eb;
    }

    .meta-row {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-size: 0.875rem;
      color: #6b7280;
    }

    .author, .time {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .separator {
      color: #e5e7eb;
    }

    .status-badge {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 0.75rem;
      background: #fef2f2;
      color: #ef4444;
    }

    .status-badge.resolved {
      background: #ecfdf5;
      color: #10b981;
    }

    .header-actions {
      display: flex;
      gap: 0.75rem;
    }

    .action-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      border: 1px solid #e5e7eb;
      background: #fff;
      border-radius: 6px;
      color: #374151;
      font-size: 0.875rem;
      cursor: pointer;
      transition: all 0.2s;
    }

    .action-btn:hover {
      background: #f9fafb;
    }

    .action-btn.primary {
      background: #111827;
      color: #fff;
      border-color: #111827;
    }

    .action-btn.primary:hover {
      background: #1f2937;
    }

    /* Layout Grid */
    .layout-grid {
      display: grid;
      grid-template-columns: 240px 1fr 320px;
      gap: 1.5rem;
      align-items: start;
    }

    /* Left Sidebar */
    .left-sidebar {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .sidebar-section {
      /* background: #fff; */
      /* padding: 1rem; */
      /* border-radius: 8px; */
    }

    .section-title {
      font-size: 0.875rem;
      color: #6b7280;
      margin: 0 0 1rem 0;
      font-weight: 500;
    }

    .info-item {
      margin-bottom: 1.5rem;
    }

    .info-item label {
      display: block;
      font-size: 0.75rem;
      color: #9ca3af;
      margin-bottom: 0.5rem;
    }

    .info-value {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.875rem;
      font-weight: 500;
      color: #374151;
    }

    .dot {
      width: 8px;
      height: 8px;
      background: #3b82f6;
      border-radius: 50%;
    }

    .tags-wrapper {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .tag {
      padding: 2px 8px;
      background: #fff;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      font-size: 0.75rem;
      color: #4b5563;
    }

    .contributors {
      display: flex;
      gap: -8px;
    }

    .avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: #e5e7eb;
      border: 2px solid #f5f7fa;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      color: #6b7280;
      font-weight: 600;
    }

    /* Center Content */
    .center-content {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .content-card {
      background: #fff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }

    .card-header {
      padding: 1rem 1.5rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      border-bottom: 1px solid #f3f4f6;
    }

    .card-header h2 {
      margin: 0;
      font-size: 1rem;
      font-weight: 600;
    }

    .card-header.warning { color: #f59e0b; }
    .card-header.success { color: #10b981; }

    .card-body {
      padding: 1.5rem;
    }

    .description-box {
      background: #fffbeb;
      border: 1px solid #fcd34d;
      border-radius: 8px;
      padding: 1rem;
      margin-bottom: 1.5rem;
    }

    .box-label {
      font-size: 0.75rem;
      color: #b45309;
      margin-bottom: 0.5rem;
      font-weight: 600;
    }

    .description-box p {
      margin: 0;
      color: #92400e;
      font-size: 0.95rem;
      line-height: 1.6;
    }

    .reproduction-steps pre {
      white-space: pre-wrap;
      font-family: inherit;
      color: #374151;
      margin: 0;
      line-height: 1.6;
    }

    .solution-text {
      margin-bottom: 1rem;
      color: #374151;
      line-height: 1.6;
    }

    .code-block {
      background: #111827;
      border-radius: 8px;
      padding: 1rem;
      color: #e5e7eb;
      font-family: monospace;
      overflow-x: auto;
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

    .sidebar-card {
      background: #fff;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }

    .sidebar-card .card-header {
      padding: 0 0 1rem 0;
      border-bottom: none;
      color: #374151;
    }

    .sidebar-card h3 {
      margin: 0;
      font-size: 0.875rem;
      font-weight: 600;
    }

    .mermaid-container {
      background: #fff;
      min-height: 200px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1.5rem;
    }

    .source-code-section {
      background: #f3f4f6;
      border-radius: 6px;
      padding: 0.75rem;
    }

    .source-label {
      font-size: 0.75rem;
      color: #6b7280;
      margin-bottom: 0.5rem;
    }

    .source-preview {
      font-family: monospace;
      font-size: 0.75rem;
      color: #9ca3af;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    @media (max-width: 1200px) {
      .layout-grid {
        grid-template-columns: 240px 1fr;
      }
      .right-sidebar {
        grid-column: 1 / -1;
      }
    }

    @media (max-width: 768px) {
      .layout-grid {
        grid-template-columns: 1fr;
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
  `]
})
export class FaqDetailComponent implements OnInit, AfterViewInit {
  faq?: FaqItem;
  @ViewChild('mermaidDiv') mermaidDiv?: ElementRef;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private faqService: FaqService,
    public authService: AuthService
  ) {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'default',
      securityLevel: 'loose',
    });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.faqService.getFaq(id).subscribe(data => {
        this.faq = data;
        this.faqService.updateFaq(id, { views: data.views + 1 }).subscribe();
      });
    }
  }

  ngAfterViewInit() {
    // Use setTimeout to ensure DOM is ready
    setTimeout(() => {
      this.renderMermaid();
    }, 100);
  }

  renderMermaid() {
    if (this.mermaidDiv && this.faq?.troubleshootingFlow) {
      mermaid.run({
        nodes: [this.mermaidDiv.nativeElement]
      });
    }
  }

  goBack() {
    this.router.navigate(['/']);
  }
}
