import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FaqService } from '../faq.service';
import { FaqItem } from '../models/faq.model';
import { MODULES, PREDEFINED_TAGS, VERSION_OPTIONS, generateErrorCode } from '../models/config';
import mermaid from 'mermaid';

@Component({
    selector: 'app-faq-edit',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    template: `
    <div class="page-wrapper">
      <!-- 顶部 Header -->
      <header class="top-header">
        <div class="header-left">
          <div class="icon-box">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
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
          <button class="btn-text" (click)="onCancel()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
            取消
          </button>
          <button class="btn-primary" (click)="onSave()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
              <polyline points="17 21 17 13 7 13 7 21"/>
              <polyline points="7 3 7 8 15 8"/>
            </svg>
            {{ isEdit ? '保存修改' : '创建 FAQ' }}
          </button>
        </div>
      </header>

      <div class="main-layout">
        <!-- 左侧边栏：基础信息 -->
        <aside class="left-sidebar">
          <div class="sidebar-card">
            <div class="card-title">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <line x1="3" y1="9" x2="21" y2="9"/>
                <line x1="9" y1="21" x2="9" y2="9"/>
              </svg>
              基础信息
            </div>
            
            <div class="form-group">
              <label>所属模块 <span class="required">*</span></label>
              <select [(ngModel)]="formData.component" class="select-input">
                <option value="">选择模块</option>
                @for (opt of moduleOptions; track opt.value) {
                  <option [value]="opt.value">{{ opt.label }}</option>
                }
              </select>
            </div>

            <div class="form-group">
              <label>适用版本</label>
              <select [(ngModel)]="formData.version" class="select-input">
                <option value="">选择版本</option>
                @for (opt of versionOptions; track opt.value) {
                  <option [value]="opt.value">{{ opt.label }}</option>
                }
              </select>
            </div>

            <div class="form-group">
              <label>相关标签 <span class="required">*</span></label>
              <div class="tags-list">
                @for (tag of tagOptions; track tag.value) {
                  <label class="checkbox-item">
                    <input 
                      type="checkbox" 
                      [checked]="isTagSelected(tag.value)"
                      (change)="toggleTag(tag.value)"
                    />
                    <span class="checkbox-label">{{ tag.label }}</span>
                  </label>
                }
              </div>
            </div>
          </div>
        </aside>

        <!-- 中间内容区：网格布局 -->
        <main class="center-content">
          <div class="content-grid">
            <!-- 问题描述 -->
            <div class="content-card beige">
              <div class="card-header warning">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                问题描述 <span class="required">*</span>
              </div>
              <textarea 
                [(ngModel)]="formData.summary" 
                placeholder="详细描述遇到的问题..."
                class="text-area"
              ></textarea>
            </div>

            <!-- 现象描述 -->
            <div class="content-card beige">
              <div class="card-header warning">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <polyline points="10 9 9 9 8 9"/>
                </svg>
                现象描述 <span class="required">*</span>
              </div>
              <textarea 
                [(ngModel)]="formData.phenomenon" 
                placeholder="详细描述如何复现该问题..."
                class="text-area"
              ></textarea>
            </div>

            <!-- 解决方案 -->
            <div class="content-card green">
              <div class="card-header success">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
                解决方案 <span class="required">*</span>
              </div>
              <textarea 
                [(ngModel)]="formData.solution" 
                placeholder="详细说明如何修复该问题..."
                class="text-area"
              ></textarea>
            </div>

            <!-- 验证方法 -->
            <div class="content-card blue">
              <div class="card-header info">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <polyline points="9 11 12 14 22 4"/>
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                </svg>
                验证方法
              </div>
              <textarea 
                [(ngModel)]="formData.validationMethod" 
                placeholder="如何验证修复是否有效..."
                class="text-area"
              ></textarea>
            </div>
          </div>
        </main>

        <!-- 右侧边栏：流程图 -->
        <aside class="right-sidebar">
          <div class="sidebar-card full-height">
            <div class="card-header-row">
              <div class="card-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <rect x="3" y="3" width="7" height="7"/>
                  <rect x="14" y="3" width="7" height="7"/>
                  <rect x="14" y="14" width="7" height="7"/>
                  <rect x="3" y="14" width="7" height="7"/>
                </svg>
                排查流程图
              </div>
              <button class="icon-btn" title="全屏">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <polyline points="15 3 21 3 21 9"/>
                  <polyline points="9 21 3 21 3 15"/>
                  <line x1="21" y1="3" x2="14" y2="10"/>
                  <line x1="3" y1="21" x2="10" y2="14"/>
                </svg>
                全屏
              </button>
            </div>

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
              <div #mermaidDiv class="mermaid-preview"></div>
              @if (!formData.troubleshootingFlow) {
                <div class="empty-preview">
                  <div class="node-box">开始</div>
                  <div class="arrow-down">↓</div>
                  <div class="node-diamond">检查?</div>
                </div>
              }
            </div>

            <button class="btn-dark-block" (click)="showExamples()">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
              </svg>
              打开流程图构建器
            </button>
          </div>
        </aside>
      </div>
    </div>
  `,
    styles: [`
    :host {
      display: block;
      background: #f5f7fa;
      min-height: 100vh;
      color: #333;
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
      background: #fff;
      border-bottom: 1px solid #e5e7eb;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 1.5rem;
      flex-shrink: 0;
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
      background: #4f46e5;
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
      color: #1f2937;
    }

    .title-input::placeholder {
      color: #9ca3af;
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .btn-text {
      background: none;
      border: none;
      color: #6b7280;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.9rem;
      padding: 0.5rem 1rem;
    }

    .btn-text:hover {
      color: #374151;
    }

    .btn-primary {
      background: #4f46e5;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.9rem;
      font-weight: 500;
      transition: background 0.2s;
    }

    .btn-primary:hover {
      background: #4338ca;
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
      width: 260px;
      flex-shrink: 0;
      overflow-y: auto;
    }

    .sidebar-card {
      background: #fff;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }

    .sidebar-card.full-height {
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .card-title {
      font-size: 0.9rem;
      font-weight: 600;
      color: #374151;
      margin-bottom: 1.5rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    .form-group label {
      display: block;
      font-size: 0.8rem;
      color: #6b7280;
      margin-bottom: 0.5rem;
      font-weight: 500;
    }

    .required {
      color: #ef4444;
    }

    .select-input {
      width: 100%;
      padding: 0.6rem;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      background: #fff;
      color: #374151;
      font-size: 0.9rem;
    }

    .tags-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .checkbox-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
    }

    .checkbox-label {
      font-size: 0.9rem;
      color: #4b5563;
    }

    /* Center Content */
    .center-content {
      flex: 1;
      overflow-y: auto;
      min-width: 0; /* Prevent flex item from overflowing */
    }

    .content-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      grid-template-rows: 1fr 1fr;
      gap: 1.5rem;
      height: 100%;
      min-height: 600px;
    }

    .content-card {
      border-radius: 12px;
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      box-shadow: 0 1px 2px rgba(0,0,0,0.05);
    }

    .content-card.beige { background: #fffbeb; border: 1px solid #fef3c7; }
    .content-card.green { background: #ecfdf5; border: 1px solid #d1fae5; }
    .content-card.blue { background: #eff6ff; border: 1px solid #dbeafe; }

    .card-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.9rem;
      font-weight: 600;
      margin-bottom: 1rem;
    }

    .card-header.warning { color: #b45309; }
    .card-header.success { color: #047857; }
    .card-header.info { color: #1d4ed8; }

    .text-area {
      flex: 1;
      width: 100%;
      background: transparent;
      border: none;
      resize: none;
      outline: none;
      font-size: 0.95rem;
      line-height: 1.6;
      color: #374151;
    }

    .text-area::placeholder {
      color: rgba(55, 65, 81, 0.4);
    }

    /* Right Sidebar */
    .right-sidebar {
      width: 360px;
      flex-shrink: 0;
      display: flex;
      flex-direction: column;
    }

    .card-header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .icon-btn {
      background: none;
      border: none;
      color: #6b7280;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 0.8rem;
    }

    .editor-container {
      background: #0f172a;
      border-radius: 8px;
      padding: 1rem;
      margin-bottom: 1rem;
      flex: 1;
      min-height: 200px;
      overflow: hidden;
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
      background: #fff;
      border: 1px solid #e5e7eb;
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

    .mermaid-preview {
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
    }

    .empty-preview {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      opacity: 0.5;
    }

    .node-box {
      border: 1px solid #94a3b8;
      padding: 4px 12px;
      border-radius: 4px;
      font-size: 0.8rem;
      color: #64748b;
    }

    .node-diamond {
      border: 1px solid #f59e0b;
      padding: 4px 8px;
      transform: rotate(45deg);
      font-size: 0.7rem;
      color: #d97706;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .arrow-down {
      color: #94a3b8;
      font-size: 0.8rem;
    }

    .btn-dark-block {
      width: 100%;
      background: #1e293b;
      color: white;
      border: none;
      padding: 0.75rem;
      border-radius: 6px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      font-size: 0.9rem;
      transition: background 0.2s;
    }

    .btn-dark-block:hover {
      background: #334155;
    }

    @media (max-width: 1200px) {
      .main-layout {
        flex-direction: column;
        overflow-y: auto;
      }
      .left-sidebar, .right-sidebar {
        width: 100%;
        flex: none;
      }
      .content-grid {
        grid-template-columns: 1fr;
        grid-template-rows: auto;
      }
    }
  `]
})
export class FaqEditComponent implements OnInit, AfterViewInit {
    isEdit = false;
    faqId: string | null = null;
    faqData?: FaqItem;
    @ViewChild('mermaidDiv') mermaidDiv?: ElementRef;

    formData: any = {
        title: '',
        component: '',
        version: '',
        tags: [],
        summary: '',
        phenomenon: '',
        solution: '',
        troubleshootingFlow: '',
        validationMethod: ''
    };

    moduleOptions = [
        ...MODULES.frontend.children.map(c => ({ label: `前端 - ${c.name}`, value: c.id })),
        { label: '后端', value: MODULES.backend.id }
    ];

    tagOptions = PREDEFINED_TAGS.map(tag => ({ label: tag, value: tag }));
    versionOptions = VERSION_OPTIONS.map(v => ({ label: v, value: v }));

    private renderTimeout: any;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private faqService: FaqService
    ) {
        mermaid.initialize({
            startOnLoad: false,
            theme: 'default',
            securityLevel: 'loose',
        });
    }

    ngOnInit() {
        this.faqId = this.route.snapshot.paramMap.get('id');
        if (this.faqId) {
            this.isEdit = true;
            this.faqService.getFaq(this.faqId).subscribe(data => {
                this.faqData = data;
                this.formData = { ...data };
                // Trigger render after data load
                setTimeout(() => this.renderMermaid(), 100);
            });
        }
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
            const { svg } = await mermaid.render('mermaid-svg-' + Date.now(), this.formData.troubleshootingFlow);
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

    onSave() {
        if (!this.formData.title || !this.formData.component || !this.formData.tags.length ||
            !this.formData.summary || !this.formData.phenomenon || !this.formData.solution) {
            alert('请填写所有必填字段');
            return;
        }

        const errorCode = generateErrorCode(this.formData.component, this.formData.tags);
        const faqData: Partial<FaqItem> = {
            ...this.formData,
            errorCode,
            views: this.faqData?.views || 0,
            solveTimeMinutes: this.faqData?.solveTimeMinutes || 0
        };

        if (this.isEdit && this.faqId) {
            this.faqService.updateFaq(this.faqId, faqData).subscribe(() => {
                this.router.navigate(['/']);
            });
        } else {
            this.faqService.createFaq(faqData).subscribe(() => {
                this.router.navigate(['/']);
            });
        }
    }

    onCancel() {
        this.router.navigate(['/']);
    }
}
