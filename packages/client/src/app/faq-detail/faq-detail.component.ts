import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FaqService } from '../faq.service';
import { FaqItem } from '../models/faq.model';
import mermaid from 'mermaid';

@Component({
    selector: 'app-faq-detail',
    standalone: true,
    imports: [CommonModule, RouterModule],
    template: `
    <div class="detail-container">
      @if (faq) {
        <div class="detail-header">
          <div class="header-top">
            <button class="back-btn" (click)="goBack()">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              返回列表
            </button>
            <button class="edit-btn" [routerLink]="['/edit', faq.id]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              编辑
            </button>
          </div>
          
          <h1 class="title">{{ faq.title }}</h1>
          
          <div class="meta-info">
            <span class="badge badge-component">{{ faq.component }}</span>
            <span class="badge badge-version">{{ faq.version }}</span>
            @if (faq.errorCode) {
              <span class="badge badge-error">{{ faq.errorCode }}</span>
            }
          </div>
          
          <div class="tags">
            @for (tag of faq.tags; track tag) {
              <span class="tag">{{ tag }}</span>
            }
          </div>
          
          <div class="stats">
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
              预计 {{ faq.solveTimeMinutes }} 分钟解决
            </span>
          </div>
        </div>

        <div class="detail-content">
          <section class="content-section">
            <h2 class="section-title">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="16" x2="12" y2="12"/>
                <line x1="12" y1="8" x2="12.01" y2="8"/>
              </svg>
              问题概述
            </h2>
            <p class="content-text">{{ faq.summary }}</p>
          </section>

          <section class="content-section">
            <h2 class="section-title">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
              现象描述
            </h2>
            <pre class="content-text">{{ faq.phenomenon }}</pre>
          </section>

          <section class="content-section highlight">
            <h2 class="section-title">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
              解决方案
            </h2>
            <pre class="content-text">{{ faq.solution }}</pre>
          </section>

          @if (faq.troubleshootingFlow) {
            <section class="content-section">
              <h2 class="section-title">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                </svg>
                排查流程
              </h2>
              <div class="mermaid-container">
                <div #mermaidDiv class="mermaid">{{ faq.troubleshootingFlow }}</div>
              </div>
            </section>
          }

          <section class="content-section">
            <h2 class="section-title">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M9 11l3 3L22 4"/>
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
              </svg>
              验证方法
            </h2>
            <p class="content-text">{{ faq.validationMethod }}</p>
          </section>
        </div>
      } @else {
        <div class="loading">加载中...</div>
      }
    </div>
  `,
    styles: [`
    .detail-container {
      max-width: 1000px;
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

    .header-top {
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
      margin: 0 0 1rem 0;
      font-size: 2rem;
      font-weight: 700;
      color: var(--color-text);
      line-height: 1.3;
    }

    .meta-info {
      display: flex;
      gap: 0.75rem;
      margin-bottom: 1rem;
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

    .tags {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1.5rem;
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

    .stats {
      display: flex;
      gap: 2rem;
      padding-top: 1rem;
      border-top: 1px solid var(--color-border);
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

    .detail-content {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .content-section {
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: 12px;
      padding: 2rem;
    }

    .content-section.highlight {
      border-left: 4px solid var(--color-primary);
      background: var(--color-glass);
    }

    .section-title {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin: 0 0 1rem 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--color-text);
    }

    .section-title svg {
      stroke-width: 2;
      color: var(--color-primary);
    }

    .content-text {
      margin: 0;
      color: var(--color-text);
      line-height: 1.8;
      white-space: pre-wrap;
      word-wrap: break-word;
    }

    .mermaid-container {
      background: var(--color-background);
      border: 1px solid var(--color-border);
      border-radius: 8px;
      padding: 2rem;
      overflow-x: auto;
    }

    .mermaid {
      display: flex;
      justify-content: center;
    }

    .loading {
      text-align: center;
      padding: 4rem;
      color: var(--color-textSecondary);
      font-size: 1.1rem;
    }
  `]
})
export class FaqDetailComponent implements OnInit, AfterViewInit {
    faq?: FaqItem;
    @ViewChild('mermaidDiv') mermaidDiv?: ElementRef;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private faqService: FaqService
    ) {
        // Initialize mermaid
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
                // Increment view count
                this.faqService.updateFaq(id, { views: data.views + 1 }).subscribe();
            });
        }
    }

    ngAfterViewInit() {
        // Render mermaid diagram after view init
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
