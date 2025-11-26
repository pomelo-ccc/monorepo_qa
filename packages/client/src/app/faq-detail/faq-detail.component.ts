import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FaqService, AuthService } from '../services';
import { FaqItem } from '../models';
import {
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
    MermaidComponent,
    TreeComponent,
  ],
  template: `
    <div class="view-container">
      <!-- 左侧导航栏 (Fixed Left) - 保持不变，作为全局导航 -->
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

      <!-- 主内容区域 -->
      <div class="main-scroll-area">
        @if (faq) {
          <!-- 固定顶部栏 -->
          <div class="sticky-header">
            <button class="back-btn" (click)="goBack()">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              返回
            </button>
            
            <div class="header-actions">
              <!-- 分享按钮 -->
              <div class="share-dropdown">
                <button class="action-btn outline" (click)="toggleShareMenu()">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                    <polyline points="16 6 12 2 8 6" />
                    <line x1="12" y1="2" x2="12" y2="15" />
                  </svg>
                  分享
                </button>
                
                @if (shareMenuOpen) {
                  <div class="share-menu">
                    <button class="share-item" (click)="copyLink()">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                      </svg>
                      复制链接
                    </button>
                    <button class="share-item" (click)="shareWechat()">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                      </svg>
                      分享到微信
                    </button>
                  </div>
                }
              </div>

              @if (authService.isAdmin()) {
                <button class="action-btn primary" [routerLink]="['/edit', faq.id]">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  编辑
                </button>
              }
            </div>
          </div>

          <div class="article-container">
            <!-- 文章头部 -->
            <header class="article-header">
              <h1 class="article-title">{{ faq.title }}</h1>
              
              <div class="article-meta">
                <div class="meta-left">
                  <span class="version-tag">v{{ faq.version }}</span>
                  <span class="status-dot" [class.resolved]="faq.status === 'resolved'"></span>
                  <span class="meta-text">{{ faq.status === 'resolved' ? '已解决' : '处理中' }}</span>
                  <span class="divider-dot">·</span>
                  <span class="meta-text">{{ faq.createTime || '最近更新' }}</span>
                </div>
              </div>
            </header>

            <!-- 微信分享弹窗 -->
            @if (showWechatModal) {
              <div class="modal-overlay" (click)="closeWechatModal()">
                <div class="wechat-modal" (click)="$event.stopPropagation()">
                  <div class="modal-header">
                    <h3>微信扫一扫分享</h3>
                    <button class="close-btn" (click)="closeWechatModal()">×</button>
                  </div>
                  <div class="qrcode-placeholder">
                    <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                      <rect x="7" y="7" width="3" height="3"></rect>
                      <rect x="14" y="7" width="3" height="3"></rect>
                      <rect x="7" y="14" width="3" height="3"></rect>
                      <rect x="14" y="14" width="3" height="3"></rect>
                    </svg>
                    <span>二维码生成中...</span>
                  </div>
                </div>
              </div>
            }

            <div class="content-with-toc">
              <!-- 核心内容流 -->
              <article class="article-body">
                
                <!-- 1. 现象描述 (醒目提示) -->
                <div class="problem-alert" id="section-phenomenon">
                  <div class="alert-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                  </div>
                  <div class="alert-content">
                    <h3 class="alert-title">问题现象</h3>
                    <p class="alert-desc">{{ faq.summary }}</p>
                    @if (faq.phenomenon) {
                      <div class="phenomenon-details">
                        <pre>{{ faq.phenomenon }}</pre>
                      </div>
                    }
                  </div>
                </div>

                <!-- 2. 排查流程 (如果有，作为核心步骤展示) -->
                @if (faq.troubleshootingFlow) {
                  <div class="flow-section" id="section-flow">
                    <h2 class="section-title">
                      <span class="title-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <rect x="3" y="3" width="7" height="7"></rect>
                          <rect x="14" y="3" width="7" height="7"></rect>
                          <rect x="14" y="14" width="7" height="7"></rect>
                          <rect x="3" y="14" width="7" height="7"></rect>
                        </svg>
                      </span>
                      排查逻辑
                    </h2>
                    <div class="mermaid-viewer">
                      <lib-mermaid [code]="faq.troubleshootingFlow"></lib-mermaid>
                    </div>
                  </div>
                }

                <!-- 3. 解决方案 -->
                <div class="solution-section" id="section-solution">
                  <h2 class="section-title">
                    <span class="title-icon success">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                      </svg>
                    </span>
                    解决方案
                  </h2>
                  
                  <div class="solution-card">
                    <div class="code-window">
                      <div class="window-header">
                        <div class="window-controls">
                          <span class="control red"></span>
                          <span class="control yellow"></span>
                          <span class="control green"></span>
                        </div>
                        <span class="window-title">Solution</span>
                      </div>
                      <pre class="window-body"><code>{{ faq.solution }}</code></pre>
                    </div>
                  </div>
                </div>

                <!-- 底部信息 -->
                <div class="article-footer">
                  <div class="tags-row">
                    @for (tag of faq.tags; track tag) {
                      <span class="footer-tag"># {{ tag }}</span>
                    }
                  </div>
                  
                  <div class="contributors-row">
                    <span class="label">贡献者:</span>
                    <div class="avatars">
                      @if (faq.contributors && faq.contributors.length) {
                        @for (contributor of faq.contributors; track contributor) {
                          <span class="text-avatar" title="{{ contributor }}">{{ contributor.charAt(0).toUpperCase() }}</span>
                        }
                      } @else {
                        <span class="text-avatar">?</span>
                      }
                    </div>
                  </div>
                </div>

              </article>

              <!-- 右侧悬浮目录 -->
              <aside class="toc-sidebar">
                <div class="toc-container">
                  <h4 class="toc-title">目录</h4>
                  <ul class="toc-list">
                    <li>
                      <a (click)="scrollToSection('section-phenomenon')" [class.active]="activeSection === 'section-phenomenon'">问题现象</a>
                    </li>
                    @if (faq.troubleshootingFlow) {
                      <li>
                        <a (click)="scrollToSection('section-flow')" [class.active]="activeSection === 'section-flow'">排查逻辑</a>
                      </li>
                    }
                    <li>
                      <a (click)="scrollToSection('section-solution')" [class.active]="activeSection === 'section-solution'">解决方案</a>
                    </li>
                  </ul>
                </div>
              </aside>
            </div>
          </div>
        } @else {
          <div class="loading-state">
            <div class="spinner"></div>
          </div>
        }
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

      /* Nav Sidebar - 融合风格 */
      .nav-sidebar {
        width: 260px;
        background: transparent;
        border-right: 1px solid var(--color-border);
        height: calc(100vh - 70px);
        position: sticky;
        top: 70px;
        overflow-y: auto;
        flex-shrink: 0;
        padding: 2rem 1rem;
        box-sizing: border-box;
        transition: all 0.3s ease;
      }

      .sidebar-header {
        margin-bottom: 1.5rem;
        padding-left: 0.75rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .section-title {
        font-size: 0.8rem;
        color: var(--color-textSecondary);
        margin: 0;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        opacity: 0.8;
      }

      .nav-tree-wrapper {
        /* 自定义滚动条 */
        scrollbar-width: thin;
        scrollbar-color: var(--color-border) transparent;
      }

      /* 树组件样式穿透覆盖 (假设 lib-tree 内部使用了标准类名，如果不是可能需要调整) */
      :host ::ng-deep .tree-node {
        padding: 0.5rem 0.75rem;
        border-radius: 8px;
        margin-bottom: 2px;
        color: var(--color-textSecondary);
        transition: all 0.2s;
        font-size: 0.9rem;
      }

      :host ::ng-deep .tree-node:hover {
        background: var(--color-surfaceHover);
        color: var(--color-text);
      }

      :host ::ng-deep .tree-node.active {
        background: color-mix(in srgb, var(--color-primary), transparent 90%);
        color: var(--color-primary);
        font-weight: 500;
      }

      /* Main Scroll Area - 背景处理 */
      .main-scroll-area {
        flex: 1;
        min-width: 0;
        /* 给一个微妙的背景区分，或者保持透明让全局背景透出来 */
        background: linear-gradient(
          to bottom right,
          var(--color-background),
          color-mix(in srgb, var(--color-background), var(--color-surface) 30%)
        );
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

      /* 固定顶部栏 */
      .sticky-header {
        position: sticky;
        top: 0;
        z-index: 50;
        background: var(--color-background);
        border-bottom: 1px solid var(--color-border);
        padding: 0.75rem 2rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
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

      /* Article Layout - 左对齐，右侧留空给 TOC */
      .article-container {
        max-width: 1200px;
        margin: 0;
        padding: 1.5rem 2rem 2rem 3rem;
      }

      /* Content with TOC - 主内容 + 右侧目录 */
      .content-with-toc {
        display: flex;
        gap: 3rem;
        align-items: flex-start;
      }

      .article-body {
        flex: 1;
        min-width: 0;
        max-width: 720px;
      }

      /* 右侧悬浮目录 */
      .toc-sidebar {
        width: 180px;
        flex-shrink: 0;
        position: sticky;
        top: 100px;
      }

      .toc-container {
        padding: 1rem;
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: 12px;
      }

      .toc-title {
        font-size: 0.75rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--color-textSecondary);
        margin: 0 0 0.75rem 0;
        padding-bottom: 0.5rem;
        border-bottom: 1px solid var(--color-border);
      }

      .toc-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      }

      .toc-list li a {
        display: block;
        padding: 0.5rem 0.75rem;
        font-size: 0.85rem;
        color: var(--color-textSecondary);
        text-decoration: none;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s;
        border-left: 2px solid transparent;
      }

      .toc-list li a:hover {
        color: var(--color-text);
        background: var(--color-surfaceHover);
      }

      .toc-list li a.active {
        color: var(--color-primary);
        background: color-mix(in srgb, var(--color-primary), transparent 92%);
        border-left-color: var(--color-primary);
        font-weight: 500;
      }

      /* 简洁面包屑 */
      .breadcrumb-simple {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.85rem;
        margin-bottom: 1rem;
      }

      .breadcrumb-simple .crumb {
        color: var(--color-textSecondary);
        text-decoration: none;
        transition: color 0.2s;
      }

      .breadcrumb-simple .crumb:hover {
        color: var(--color-primary);
      }

      .breadcrumb-simple .crumb.current {
        color: var(--color-text);
        font-weight: 500;
      }

      .breadcrumb-simple .sep {
        color: var(--color-border);
        font-size: 0.8rem;
      }

      /* Article Header */
      .article-header {
        margin-bottom: 2rem;
        padding-bottom: 1.5rem;
        border-bottom: 1px solid var(--color-border);
      }

      .article-title {
        font-size: 1.75rem;
        font-weight: 700;
        line-height: 1.3;
        color: var(--color-text);
        margin: 0 0 1rem 0;
      }

      .article-meta {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .meta-left {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        font-size: 0.9rem;
      }

      .version-tag {
        background: var(--color-surfaceHover);
        padding: 2px 8px;
        border-radius: 6px;
        font-size: 0.8rem;
        font-weight: 600;
        color: var(--color-text);
        border: 1px solid var(--color-border);
      }

      .status-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--color-error);
      }

      .status-dot.resolved {
        background: var(--color-success);
      }

      .divider-dot {
        color: var(--color-border);
      }

      .meta-text {
        color: var(--color-textSecondary);
      }

      .edit-link {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 1rem;
        border-radius: 8px;
        background: var(--color-surfaceHover);
        border: none;
        color: var(--color-text);
        font-size: 0.9rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
      }

      .edit-link:hover {
        background: var(--color-border);
      }

      /* Article Body - 已在 content-with-toc 中定义 flex: 1 */
      .article-body {
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      .section-title {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--color-text);
        margin: 0 0 1.5rem 0;
      }

      .title-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        border-radius: 8px;
        background: var(--color-surfaceHover);
        color: var(--color-text);
      }

      .title-icon.success {
        background: color-mix(in srgb, var(--color-success), transparent 90%);
        color: var(--color-success);
      }

      /* Problem Alert */
      .problem-alert {
        background: color-mix(in srgb, var(--color-warning), transparent 95%);
        border: 1px solid color-mix(in srgb, var(--color-warning), transparent 85%);
        border-radius: 16px;
        padding: 1.5rem;
        display: flex;
        gap: 1.25rem;
      }

      .alert-icon {
        flex-shrink: 0;
        color: var(--color-warning);
      }

      .alert-content {
        flex: 1;
      }

      .alert-title {
        font-size: 1.1rem;
        font-weight: 700;
        color: var(--color-warning);
        margin: 0 0 0.5rem 0;
      }

      .alert-desc {
        font-size: 1.05rem;
        line-height: 1.6;
        color: var(--color-text);
        margin: 0;
      }

      .phenomenon-details {
        margin-top: 1.25rem;
        padding-top: 1.25rem;
        border-top: 1px solid color-mix(in srgb, var(--color-warning), transparent 85%);
      }

      .phenomenon-details pre {
        margin: 0;
        white-space: pre-wrap;
        font-family: 'Menlo', monospace;
        font-size: 0.9rem;
        line-height: 1.6;
        color: var(--color-text);
        opacity: 0.9;
      }

      /* Flow Section */
      .flow-section {
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: 16px;
        padding: 2rem;
      }

      .mermaid-viewer {
        display: flex;
        justify-content: center;
        padding: 1rem 0;
        overflow-x: auto;
      }

      /* Solution Card */
      .solution-card {
        border-radius: 16px;
        overflow: hidden;
        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
        border: 1px solid var(--color-border);
      }

      .code-window {
        background: #1e1e1e;
      }

      .window-header {
        background: #2d2d2d;
        padding: 0.75rem 1rem;
        display: flex;
        align-items: center;
        border-bottom: 1px solid #3d3d3d;
      }

      .window-controls {
        display: flex;
        gap: 0.5rem;
        margin-right: 1rem;
      }

      .control {
        width: 12px;
        height: 12px;
        border-radius: 50%;
      }

      .control.red { background: #ff5f56; }
      .control.yellow { background: #ffbd2e; }
      .control.green { background: #27c93f; }

      .window-title {
        color: #999;
        font-size: 0.85rem;
        font-family: system-ui;
      }

      .window-body {
        margin: 0;
        padding: 1.5rem;
        color: #d4d4d4;
        font-family: 'Menlo', 'Monaco', monospace;
        font-size: 0.95rem;
        line-height: 1.6;
        overflow-x: auto;
      }

      /* Share Menu */
      .share-dropdown {
        position: relative;
      }

      .action-btn {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 1rem;
        border-radius: 8px;
        font-size: 0.9rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
        text-decoration: none;
      }

      .action-btn.outline {
        background: var(--color-surfaceHover);
        color: var(--color-text);
        border: 1px solid var(--color-border);
      }

      .action-btn.outline:hover {
        background: var(--color-border);
      }

      .action-btn.primary {
        background: var(--color-primary);
        color: white;
        border: none;
        box-shadow: 0 2px 4px rgba(var(--color-primary-rgb), 0.3);
      }

      .action-btn.primary:hover {
        background: var(--color-primaryLight);
        transform: translateY(-1px);
      }

      .share-menu {
        position: absolute;
        top: calc(100% + 0.5rem);
        right: 0;
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: 12px;
        padding: 0.5rem;
        min-width: 160px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
        z-index: 100;
        animation: slideDown 0.2s ease-out;
      }

      @keyframes slideDown {
        from {
          opacity: 0;
          transform: translateY(-10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .share-item {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        width: 100%;
        padding: 0.75rem 1rem;
        background: transparent;
        border: none;
        border-radius: 8px;
        color: var(--color-text);
        font-size: 0.9rem;
        cursor: pointer;
        text-align: left;
        transition: all 0.2s;
      }

      .share-item:hover {
        background: var(--color-surfaceHover);
      }

      /* Modal */
      .modal-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.6);
        backdrop-filter: blur(4px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        animation: fadeIn 0.2s ease-out;
      }

      .wechat-modal {
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: 16px;
        padding: 1.5rem;
        width: 300px;
        box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
        animation: scaleUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      }

      @keyframes scaleUp {
        from {
          opacity: 0;
          transform: scale(0.9);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }

      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
      }

      .modal-header h3 {
        margin: 0;
        font-size: 1.1rem;
        font-weight: 600;
        color: var(--color-text);
      }

      .close-btn {
        background: transparent;
        border: none;
        color: var(--color-textSecondary);
        font-size: 1.5rem;
        cursor: pointer;
        padding: 0;
        line-height: 1;
      }

      .qrcode-placeholder {
        background: white;
        border-radius: 12px;
        padding: 1.5rem;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
        color: #333;
      }

      .qrcode-placeholder svg {
        color: #333;
      }

      .qrcode-placeholder span {
        font-size: 0.85rem;
        font-weight: 500;
        color: #666;
      }

      /* Footer */
      .article-footer {
        margin-top: 2rem;
        padding-top: 2rem;
        border-top: 1px solid var(--color-border);
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .tags-row {
        display: flex;
        flex-wrap: wrap;
        gap: 0.75rem;
      }

      .footer-tag {
        font-size: 0.9rem;
        color: var(--color-primary);
        background: color-mix(in srgb, var(--color-primary), transparent 92%);
        padding: 4px 12px;
        border-radius: 20px;
        font-weight: 500;
      }

      .contributors-row {
        display: flex;
        align-items: center;
        gap: 1rem;
      }

      .contributors-row .label {
        color: var(--color-textSecondary);
        font-size: 0.9rem;
      }

      .avatars {
        display: flex;
        gap: 0.5rem;
      }

      .text-avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: var(--color-surfaceHover);
        color: var(--color-text);
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        font-size: 0.9rem;
        border: 1px solid var(--color-border);
      }
    `,
  ],
})
export class FaqDetailComponent implements OnInit {
  faq?: FaqItem;
  treeNodes: TreeNode[] = [];
  shareMenuOpen = false;
  showWechatModal = false;
  activeSection = 'section-phenomenon';

  /* eslint-disable @angular-eslint/prefer-inject */
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private faqService: FaqService,
    public authService: AuthService,
  ) {
  /* eslint-enable @angular-eslint/prefer-inject */
    // Close share menu when clicking outside
    if (typeof window !== 'undefined') {
      document.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        if (!target.closest('.share-dropdown')) {
          this.shareMenuOpen = false;
        }
      });
    }
  }

  ngOnInit() {
    // Load all FAQs to build the nav tree
    this.faqService.getAll().subscribe((faqs: FaqItem[]) => {
      this.buildNavTree(faqs);
    });

    // Subscribe to route params to update current FAQ
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.loadFaq(id);
      }
    });

    // Setup intersection observer for TOC
    if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              this.activeSection = entry.target.id;
            }
          });
        },
        { rootMargin: '-100px 0px -50% 0px' },
      );

      // Wait for DOM to render
      setTimeout(() => {
        const sections = document.querySelectorAll(
          '#section-phenomenon, #section-flow, #section-solution',
        );
        sections.forEach((section) => observer.observe(section));
      }, 500);
    }
  }

  loadFaq(id: string) {
    this.faqService.getById(id).subscribe((data: FaqItem) => {
      this.faq = data;
      this.faqService.update(id, { views: data.views + 1 }).subscribe();
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

  toggleShareMenu() {
    this.shareMenuOpen = !this.shareMenuOpen;
  }

  copyLink() {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      alert('链接已复制到剪贴板');
      this.shareMenuOpen = false;
    });
  }

  shareWechat() {
    this.shareMenuOpen = false;
    this.showWechatModal = true;
  }

  closeWechatModal() {
    this.showWechatModal = false;
  }

  scrollToSection(id: string) {
    this.activeSection = id;
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}
