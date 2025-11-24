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
    <div class="detail-layout">
      <!-- 左侧边栏 -->
      <aside class="sidebar">
        <nav class="nav-menu">
          <a routerLink="/" class="nav-item" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            </svg>
            <span>首页</span>
          </a>
          
          @if (authService.isAdmin()) {
            <a routerLink="/create" class="nav-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              <span>新建问题</span>
            </a>
          }
        </nav>
        
        @if (faq) {
          <div class="page-nav">
            <div class="nav-title">页面导航</div>
            <a href="#summary" class="nav-link">问题概述</a>
            <a href="#phenomenon" class="nav-link">现象描述</a>
            <a href="#solution" class="nav-link">解决方案</a>
            @if (faq.troubleshootingFlow) {
              <a href="#flow" class="nav-link">排查流程</a>
            }
            <a href="#validation" class="nav-link">验证方法</a>
          </div>
        }
      </aside>

      <!-- 主内容区 -->
      <main class="main-content">
        @if (faq) {
          <div class="detail-container">
            <div class="detail-header">
              <div class="header-actions">
                <button class="back-btn" (click)="goBack()">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M19 12H5M12 19l-7-7 7-7"/>
                  </svg>
                  返回列表
                </button>
                @if (authService.isAdmin()) {
                  <button class="edit-btn" [routerLink]="['/edit', faq.id]">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                    编辑
                  </button>
                }
              </div>
              
              <h1 class="title">{{ faq.title }}</h1>
              
              <div class="meta-row">
                <div class="badges">
                  <span class="badge badge-component">{{ faq.component }}</span>
                  <span class="badge badge-version">{{ faq.version }}</span>
                  @if (faq.errorCode) {
                    <span class="badge badge-error">{{ faq.errorCode }}</span>
                  }
                </div>
                
                <div class="stats">
                  <span class="stat">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                    {{ faq.views }} 次
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
              
              <div class="tags">
                @for (tag of faq.tags; track tag) {
                  <span class="tag">{{ tag }}</span>
                }
              </div>
            </div>

            <div class="content-grid">
              <section id="summary" class="content-card">
                <h2>📋 问题概述</h2>
                <p>{{ faq.summary }}</p>
              </section>

              <section id="phenomenon" class="content-card">
                <h2>🔍 现象描述</h2>
                <pre>{{ faq.phenomenon }}</pre>
              </section>

              <section id="solution" class="content-card highlight">
                <h2>✅ 解决方案</h2>
                <pre>{{ faq.solution }}</pre>
              </section>

              @if (faq.troubleshootingFlow) {
                <section id="flow" class="content-card full-width">
                  <h2>🔄 排查流程</h2>
                  <div class="mermaid-wrapper">
                    <div #mermaidDiv class="mermaid">{{ faq.troubleshootingFlow }}</div>
                  </div>
                </section>
              }

              <section id="validation" class="content-card">
                <h2>🧪 验证方法</h2>
                <p>{{ faq.validationMethod }}</p>
              </section>
            </div>
          </div>
        } @else {
          <div class="loading">加载中...</div>
        }
      </main>
    </div>
  `,
  styles: [`
    .detail-layout {
      display: flex;
      min-height: calc(100vh - 64px);
      background: var(--color-background);
    }

    .sidebar {
      width: 240px;
      background: var(--color-surface);
      border-right: 1px solid var(--color-border);
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 2rem;
      position: sticky;
      top: 64px;
      height: calc(100vh - 64px);
      overflow-y: auto;
    }

    .nav-menu {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      color: var(--color-text);
      text-decoration: none;
      border-radius: 8px;
      transition: all 0.2s;
      font-weight: 500;
    }

    .nav-item:hover {
      background: var(--color-surfaceHover);
    }

    .nav-item.active {
      background: var(--color-primary);
      color: white;
    }

    .nav-item svg {
      stroke-width: 2;
    }

    .page-nav {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .nav-title {
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--color-textSecondary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 0.5rem;
    }

    .nav-link {
      padding: 0.5rem 0.75rem;
      color: var(--color-textSecondary);
      text-decoration: none;
      border-radius: 6px;
      transition: all 0.2s;
      font-size: 0.9rem;
    }

    .nav-link:hover {
      background: var(--color-surfaceHover);
      color: var(--color-text);
    }

    .main-content {
      flex: 1;
      overflow-y: auto;
    }

    .detail-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }

    .detail-header {
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: 12px;
      padding: 2rem;
      margin-bottom: 2rem;
    }

    .header-actions {
      display: flex;
      justify-content: space-between;
      margin-bottom: 1.5rem;
    }

    .back-btn, .edit-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      background: var(--color-surfaceHover);
      border: 1px solid var(--color-border);
      border-radius: 6px;
      color: var(--color-text);
      cursor: pointer;
      transition: all 0.2s;
      font-size: 0.95rem;
    }

    .back-btn:hover, .edit-btn:hover {
      background: var(--color-primary);
      color: white;
      border-color: var(--color-primary);
    }

    .title {
      margin: 0 0 1.5rem 0;
      font-size: 2rem;
      font-weight: 700;
      color: var(--color-text);
      line-height: 1.3;
    }

    .meta-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .badges {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
    }

    .badge {
      padding: 0.4rem 1rem;
      border-radius: 6px;
      font-size: 0.85rem;
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

    .stats {
      display: flex;
      gap: 1.5rem;
    }

    .stat {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: var(--color-textSecondary);
      font-size: 0.9rem;
    }

    .stat svg {
      stroke-width: 2;
    }

    .tags {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .tag {
      padding: 0.3rem 0.8rem;
      background: var(--color-surfaceHover);
      border: 1px solid var(--color-border);
      border-radius: 4px;
      font-size: 0.85rem;
      color: var(--color-textSecondary);
    }

    .content-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1.5rem;
    }

    .content-card {
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: 12px;
      padding: 1.5rem;
    }

    .content-card.full-width {
      grid-column: 1 / -1;
    }

    .content-card.highlight {
      border-left: 4px solid var(--color-primary);
      background: var(--color-glass);
    }

    .content-card h2 {
      margin: 0 0 1rem 0;
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--color-text);
    }

    .content-card p, .content-card pre {
      margin: 0;
      color: var(--color-text);
      line-height: 1.8;
      white-space: pre-wrap;
      word-wrap: break-word;
    }

    .mermaid-wrapper {
      background: var(--color-background);
      border: 1px solid var(--color-border);
      border-radius: 8px;
      padding: 2rem;
      overflow-x: auto;
    }

    .mermaid {
      display: flex;
      justify-content: center;
      min-height: 200px;
    }

    .loading {
      text-align: center;
      padding: 4rem;
      color: var(--color-textSecondary);
      font-size: 1.1rem;
    }

    @media (max-width: 768px) {
      .content-grid {
        grid-template-columns: 1fr;
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
      theme: 'dark',
      themeVariables: {
        primaryColor: '#667eea',
        primaryTextColor: '#fff',
        primaryBorderColor: '#7c8ff5',
        lineColor: '#94a3b8',
        secondaryColor: '#3b82f6',
        tertiaryColor: '#1e293b'
      }
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
    setTimeout(() => {
      if (this.mermaidDiv && this.faq?.troubleshootingFlow) {
        mermaid.run({
          nodes: [this.mermaidDiv.nativeElement]
        });
      }
    }, 100);
  }

  goBack() {
    this.router.navigate(['/']);
  }
}
