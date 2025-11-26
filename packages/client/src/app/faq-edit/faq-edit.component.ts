import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FaqService, ConfigService } from '../services';
import { FaqItem } from '../models';
import {
  ButtonComponent,
  CardComponent,
  MermaidComponent,
  SelectComponent,
  TagComponent,
} from '@repo/ui-lib';
import mermaid from 'mermaid';

@Component({
  selector: 'app-faq-edit',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ButtonComponent,
    CardComponent,
    MermaidComponent,
    SelectComponent,
    TagComponent,
  ],
  template: `
    <div class="page-wrapper">
      <!-- 顶部 Header -->
      <header class="top-header">
        <div class="header-left">
          <div class="icon-box">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <input
            type="text"
            class="title-input"
            [(ngModel)]="formData.title"
            placeholder="输入 FAQ 标题，例如：[Form] 异步校验失败后仍可提交表单..."
          />
        </div>
        <div class="header-right">
          <lib-button variant="ghost" (click)="onCancel()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
            取消
          </lib-button>
          @if (!showFlowchart) {
            <lib-button variant="ghost" (click)="toggleFlowchart()" title="显示流程图">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <line x1="15" y1="3" x2="15" y2="21" />
              </svg>
              显示流程图
            </lib-button>
          }
          <lib-button variant="primary" (click)="onSave()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
              <polyline points="17 21 17 13 7 13 7 21" />
              <polyline points="7 3 7 8 15 8" />
            </svg>
            {{ isEdit ? '保存修改' : '创建 FAQ' }}
          </lib-button>
        </div>
      </header>

      <div class="main-layout">
        <!-- 左侧边栏：基础信息 -->
        <aside class="left-sidebar">
          <lib-card title="基础信息" [hasHeader]="true">
            <ng-container ngProjectAs="[header-icon]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <line x1="3" y1="9" x2="21" y2="9" />
                <line x1="9" y1="21" x2="9" y2="9" />
              </svg>
            </ng-container>

            <div class="form-group">
              <div class="form-label">所属模块 <span class="required">*</span></div>
              <lib-select
                [(ngModel)]="formData.component"
                [options]="moduleOptions"
                placeholder="选择模块"
              ></lib-select>
            </div>

            <div class="form-group">
              <div class="form-label">适用版本</div>
              <lib-select
                [(ngModel)]="formData.version"
                [options]="versionOptions"
                placeholder="选择版本"
              ></lib-select>
            </div>

            <div class="form-group">
              <div class="form-label">相关标签 <span class="required">*</span></div>

              @if (formData.tags.length > 0) {
                <div class="selected-tags-list">
                  @for (tag of formData.tags; track tag) {
                    <lib-tag [selected]="true" (tagClick)="toggleTag(tag)" class="removable-tag">
                      {{ tag }} <span class="remove-icon">×</span>
                    </lib-tag>
                  }
                </div>
              }

              <div class="tags-list">
                @for (tag of tagOptions; track tag.value) {
                  <lib-tag
                    [selectable]="true"
                    [selected]="isTagSelected(tag.value)"
                    (selectedChange)="toggleTag(tag.value)"
                  >
                    {{ tag.label }}
                  </lib-tag>
                }
              </div>
            </div>
          </lib-card>
        </aside>

        <!-- 中间内容区：网格布局 -->
        <main class="center-content">
          <div class="content-grid">
            <!-- 问题描述 -->
            <fieldset class="edit-card warning">
              <legend class="card-legend">
                <div class="legend-content">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <span>问题描述</span>
                  <span class="required-mark">*</span>
                </div>
              </legend>
              <textarea
                [(ngModel)]="formData.summary"
                placeholder="详细描述遇到的问题..."
                class="text-area"
              ></textarea>
            </fieldset>

            <!-- 现象描述 -->
            <fieldset class="edit-card warning">
              <legend class="card-legend">
                <div class="legend-content">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                  </svg>
                  <span>现象描述</span>
                  <span class="required-mark">*</span>
                </div>
              </legend>
              <textarea
                [(ngModel)]="formData.phenomenon"
                placeholder="详细描述如何复现该问题..."
                class="text-area"
              ></textarea>
            </fieldset>

            <!-- 解决方案 -->
            <fieldset class="edit-card success">
              <legend class="card-legend">
                <div class="legend-content">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  <span>解决方案</span>
                  <span class="required-mark">*</span>
                </div>
              </legend>
              <textarea
                [(ngModel)]="formData.solution"
                placeholder="详细说明如何修复该问题..."
                class="text-area"
              ></textarea>
            </fieldset>

            <!-- 验证方法 -->
            <fieldset class="edit-card info">
              <legend class="card-legend">
                <div class="legend-content">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <polyline points="9 11 12 14 22 4" />
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                  </svg>
                  <span>验证方法</span>
                </div>
              </legend>
              <textarea
                [(ngModel)]="formData.validationMethod"
                placeholder="如何验证修复是否有效..."
                class="text-area"
              ></textarea>
            </fieldset>
          </div>
        </main>

        <!-- 右侧边栏：流程图 -->
        @if (showFlowchart) {
          <aside class="right-sidebar" [class.fullscreen-mode]="isFullscreen">
            <lib-card title="排查流程图" class="full-height-card">
              <ng-container ngProjectAs="[header-icon]">
                <button class="icon-btn toggle-btn" (click)="toggleFlowchart()" title="隐藏流程图">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <polyline points="13 17 18 12 13 7" />
                    <polyline points="6 17 11 12 6 7" />
                  </svg>
                </button>
              </ng-container>
              <ng-container ngProjectAs="[header-extra]">
                <button class="icon-btn" title="全屏" (click)="toggleFullscreen()">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <polyline points="15 3 21 3 21 9" />
                    <polyline points="9 21 3 21 3 15" />
                    <line x1="21" y1="3" x2="14" y2="10" />
                    <line x1="3" y1="21" x2="10" y2="14" />
                  </svg>
                  全屏
                </button>
              </ng-container>

              <div class="editor-container">
                <div class="code-editor">
                  <div class="line-numbers">
                    @for (line of getLineNumbers(); track line) {
                      <span>{{ line }}</span>
                    }
                  </div>
                  <textarea
                    [(ngModel)]="formData.troubleshootingFlow"
                    (ngModelChange)="onFlowChange()"
                    class="code-textarea"
                    spellcheck="false"
                  ></textarea>
                </div>
              </div>

              <div class="preview-container">
                <lib-mermaid [code]="formData.troubleshootingFlow || ''"></lib-mermaid>
              </div>

              <lib-button variant="secondary" [block]="true" (click)="showExamples()">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path
                    d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"
                  />
                </svg>
                打开流程图构建器
              </lib-button>
            </lib-card>
          </aside>
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

      .page-wrapper {
        display: flex;
        flex-direction: column;
        height: 100vh;
        overflow: hidden;
      }

      /* Header */
      .top-header {
        height: 64px;
        background: var(--color-surface);
        border-bottom: 1px solid var(--color-border);
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 1.5rem;
        flex-shrink: 0;
        backdrop-filter: blur(10px);
      }

      .header-left {
        display: flex;
        align-items: center;
        gap: 1rem;
        flex: 1;
      }

      .icon-box {
        width: 32px;
        height: 32px;
        background: var(--color-primary);
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
      }

      .title-input {
        border: none;
        font-size: 1.1rem;
        width: 100%;
        max-width: 600px;
        outline: none;
        color: var(--color-text);
        background: transparent;
      }

      .title-input::placeholder {
        color: var(--color-text-secondary);
      }

      .header-right {
        display: flex;
        align-items: center;
        gap: 1rem;
      }

      /* Main Layout */
      .main-layout {
        display: flex;
        flex: 1;
        overflow: hidden;
        padding: 1.5rem;
        gap: 1.5rem;
      }

      /* Left Sidebar */
      .left-sidebar {
        width: 280px;
        flex-shrink: 0;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }

      .form-group {
        margin-bottom: 1.2rem;
      }

      .form-group .form-label {
        display: block;
        font-size: 0.85rem;
        color: var(--color-text-secondary);
        margin-bottom: 0.4rem;
        font-weight: 600;
      }

      .required {
        color: var(--color-error);
      }

      .selected-tags-list {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        margin-bottom: 0.8rem;
        padding: 0.5rem;
        background: var(--color-surface-hover);
        border-radius: 6px;
        border: 1px dashed var(--color-border);
      }

      .removable-tag {
        cursor: pointer;
      }

      .removable-tag:hover {
        opacity: 0.8;
      }

      .remove-icon {
        margin-left: 4px;
        font-weight: bold;
        font-size: 1.1em;
        line-height: 1;
      }

      .tags-list {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        gap: 0.5rem;
        overflow-y: auto;
        max-height: 300px; /* Fixed height as requested */
        padding: 4px;
        border: 1px solid var(--color-border);
        border-radius: 6px;
      }

      .tags-list::-webkit-scrollbar {
        width: 4px;
      }
      .tags-list::-webkit-scrollbar-track {
        background: transparent;
      }
      .tags-list::-webkit-scrollbar-thumb {
        background-color: var(--color-border);
        border-radius: 4px;
      }

      /* Center Content */
      .center-content {
        flex: 1;
        overflow-y: auto;
        min-width: 0; /* Prevent flex item from overflowing */
        padding-right: 0.5rem; /* Add some spacing for scrollbar */
      }

      .content-grid {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        padding-bottom: 2rem;
      }

      .card-wrapper {
        display: flex;
        flex-direction: column;
      }

      /* Custom Fieldset Styles */
      .edit-card {
        border-radius: 12px;
        padding: 0.8rem 1.2rem 1rem;
        margin: 0;
        min-height: 180px;
        display: flex;
        flex-direction: column;
        transition: all 0.2s ease;
        background: var(--color-surface);
        border: 1px solid var(--color-border);
      }

      .card-legend {
        padding: 0 0.5rem;
        font-size: 0.95rem;
        font-weight: 600;
        display: flex;
        align-items: center;
      }

      .legend-content {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .required-mark {
        color: var(--color-error);
        margin-left: 2px;
      }

      /* Warning Variant (Yellow) */
      .edit-card.warning {
        border: 1px solid var(--color-warning);
        background-color: color-mix(in srgb, var(--color-warning), transparent 90%);
      }
      .edit-card.warning .card-legend {
        color: var(--color-warning);
      }
      .edit-card.warning .text-area {
        color: var(--color-text);
      }
      .edit-card.warning .text-area::placeholder {
        color: var(--color-text-secondary);
        opacity: 0.7;
      }

      /* Success Variant (Green) */
      .edit-card.success {
        border: 1px solid var(--color-success);
        background-color: color-mix(in srgb, var(--color-success), transparent 90%);
      }
      .edit-card.success .card-legend {
        color: var(--color-success);
      }
      .edit-card.success .text-area {
        color: var(--color-text);
      }
      .edit-card.success .text-area::placeholder {
        color: var(--color-text-secondary);
        opacity: 0.7;
      }

      /* Info Variant (Blue) */
      .edit-card.info {
        border: 1px solid var(--color-primary);
        background-color: color-mix(in srgb, var(--color-primary), transparent 90%);
      }
      .edit-card.info .card-legend {
        color: var(--color-primary);
      }
      .edit-card.info .text-area {
        color: var(--color-text);
      }
      .edit-card.info .text-area::placeholder {
        color: var(--color-text-secondary);
        opacity: 0.7;
      }

      .text-area {
        flex: 1;
        width: 100%;
        min-height: 120px;
        background: transparent;
        border: none;
        resize: vertical;
        outline: none;
        font-size: 0.9rem;
        line-height: 1.5;
        font-family: inherit;
        margin-top: 0.25rem;
      }

      /* Right Sidebar */
      .right-sidebar {
        width: 50%;
        flex-shrink: 0;
        display: flex;
        flex-direction: column;
        transition: width 0.3s ease;
      }

      .right-sidebar.fullscreen-mode {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        z-index: 1000;
        background: var(--color-background);
        padding: 1.5rem;
      }

      .full-height-card {
        height: 100%;
        display: flex;
        flex-direction: column;
      }

      /* Ensure inner card structure takes full height */
      .full-height-card ::ng-deep .card {
        height: 100%;
        display: flex;
        flex-direction: column;
        background: var(--color-surface);
        border-color: var(--color-border);
      }

      .full-height-card ::ng-deep .card-body {
        flex: 1;
        overflow: hidden;
        display: flex;
        flex-direction: column;
      }

      .icon-btn {
        background: none;
        border: none;
        color: var(--color-text-secondary);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 0.8rem;
      }

      .editor-container {
        background: #0f172a; /* Keep dark for code editor */
        border-radius: 8px;
        padding: 1rem;
        margin-bottom: 1rem;
        flex: 1;
        min-height: 200px;
        overflow: hidden;
        border: 1px solid var(--color-border);
      }

      .code-editor {
        display: flex;
        height: 100%;
        gap: 1rem;
      }

      .line-numbers {
        display: flex;
        flex-direction: column;
        color: #475569;
        font-family: monospace;
        font-size: 0.85rem;
        line-height: 1.5;
        text-align: right;
        user-select: none;
      }

      .code-textarea {
        flex: 1;
        background: transparent;
        border: none;
        color: #e2e8f0; // text-slate-200
        font-family: monospace;
        font-size: 0.85rem;
        line-height: 1.5;
        resize: none;
        outline: none;
        white-space: pre;
      }

      .preview-container {
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: 8px;
        padding: 1rem;
        margin-bottom: 1rem;
        flex: 1;
        min-height: 200px;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
      }

      @media (max-width: 1200px) {
        .main-layout {
          flex-direction: column;
          overflow-y: auto;
        }
        .left-sidebar,
        .right-sidebar {
          width: 100%;
          flex: none;
        }
        .content-grid {
          grid-template-columns: 1fr;
          grid-template-rows: auto;
        }
      }
    `,
  ],
})
export class FaqEditComponent implements OnInit, AfterViewInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private faqService = inject(FaqService);
  private configService = inject(ConfigService);

  isEdit = false;
  faqId: string | null = null;
  faqData?: FaqItem;
  showFlowchart = false;
  isFullscreen = false;
  @ViewChild('mermaidDiv') mermaidDiv?: ElementRef;

  formData: Partial<FaqItem> & { tags: string[] } = {
    title: '',
    component: '',
    version: '',
    tags: [],
    summary: '',
    phenomenon: '',
    solution: '',
    troubleshootingFlow: '',
    validationMethod: '',
  };

  moduleOptions: { label: string; value: string }[] = [];
  tagOptions: { label: string; value: string }[] = [];
  versionOptions: { label: string; value: string }[] = [];

  private renderTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'default',
      securityLevel: 'loose',
    });
  }

  ngOnInit() {
    // 加载配置数据
    this.loadConfigData();

    this.faqId = this.route.snapshot.paramMap.get('id');
    if (this.faqId) {
      this.isEdit = true;
      this.faqService.getById(this.faqId).subscribe((data) => {
        this.faqData = data;
        this.formData = { ...data, tags: data.tags || [] };
        setTimeout(() => this.renderMermaid(), 100);
      });
    }
  }

  private loadConfigData() {
    this.configService.getModuleOptions().subscribe((options) => {
      this.moduleOptions = options;
    });
    this.configService.getTagOptions().subscribe((options) => {
      this.tagOptions = options;
    });
    this.configService.getVersionOptions().subscribe((options) => {
      this.versionOptions = options;
    });
  }

  ngAfterViewInit() {
    this.renderMermaid();
  }

  isTagSelected(tag: string): boolean {
    return this.formData.tags.includes(tag);
  }

  toggleTag(tag: string) {
    const index = this.formData.tags.indexOf(tag);
    if (index > -1) {
      this.formData.tags.splice(index, 1);
    } else {
      this.formData.tags.push(tag);
    }
  }

  getLineNumbers(): number[] {
    const lines = (this.formData.troubleshootingFlow || '').split('\n').length;
    return Array.from({ length: Math.max(lines, 6) }, (_, i) => i + 1);
  }

  onFlowChange() {
    if (this.renderTimeout) {
      clearTimeout(this.renderTimeout);
    }
    this.renderTimeout = setTimeout(() => {
      this.renderMermaid();
    }, 500);
  }

  async renderMermaid() {
    if (!this.mermaidDiv || !this.formData.troubleshootingFlow) return;

    try {
      const element = this.mermaidDiv.nativeElement;
      element.innerHTML = ''; // Clear previous
      const { svg } = await mermaid.render(
        'mermaid-svg-' + Date.now(),
        this.formData.troubleshootingFlow,
      );
      element.innerHTML = svg;
    } catch (e) {
      console.error('Mermaid render error:', e);
      // Optionally show error in UI
    }
  }

  showExamples() {
    const example = `graph TD;
  A[开始] --> B{检查?};
  B -->|是| C[操作];
  B -->|否| D[其他];
  C --> E[结束];
  D --> E;`;

    this.formData.troubleshootingFlow = example;
    this.onFlowChange();
  }

  toggleFlowchart() {
    this.showFlowchart = !this.showFlowchart;
    // Re-render mermaid when showing
    if (this.showFlowchart) {
      this.onFlowChange();
    }
  }

  toggleFullscreen() {
    this.isFullscreen = !this.isFullscreen;
    this.onFlowChange();
  }

  onSave() {
    if (
      !this.formData.title ||
      !this.formData.component ||
      !this.formData.tags.length ||
      !this.formData.summary ||
      !this.formData.phenomenon ||
      !this.formData.solution
    ) {
      alert('请填写所有必填字段');
      return;
    }

    const errorCode = this.generateErrorCode(this.formData.component || '', this.formData.tags);
    const faqData: Partial<FaqItem> = {
      ...this.formData,
      errorCode,
      views: this.faqData?.views || 0,
      solveTimeMinutes: this.faqData?.solveTimeMinutes || 0,
    };

    if (this.isEdit && this.faqId) {
      this.faqService.update(this.faqId, faqData).subscribe(() => {
        this.router.navigate(['/detail', this.faqId]);
      });
    } else {
      this.faqService.create(faqData).subscribe((newFaq) => {
        if (newFaq && newFaq.id) {
          this.router.navigate(['/detail', newFaq.id]);
        } else {
          this.router.navigate(['/']);
        }
      });
    }
  }

  private generateErrorCode(module: string, tags: string[]): string {
    const modulePrefix = module.toUpperCase().substring(0, 3);
    const tagPrefix = tags.length > 0 ? tags[0].substring(0, 3).toUpperCase() : 'GEN';
    const timestamp = Date.now().toString().slice(-4);
    return `${modulePrefix}_${tagPrefix}_${timestamp}`;
  }

  onCancel() {
    if (this.isEdit && this.faqId) {
      this.router.navigate(['/detail', this.faqId]);
    } else {
      this.router.navigate(['/']);
    }
  }
}
