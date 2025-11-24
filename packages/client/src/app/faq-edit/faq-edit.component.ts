import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FaqService } from '../faq.service';
import { FaqItem } from '../models/faq.model';
import { MODULES, PREDEFINED_TAGS, VERSION_OPTIONS, generateErrorCode } from '../models/config';

@Component({
    selector: 'app-faq-edit',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    template: `
    <div class="edit-layout">
      <!-- 左侧边栏 -->
      <aside class="sidebar">
        <div class="sidebar-header">
          <h3>{{ isEdit ? '编辑' : '创建' }} FAQ</h3>
          <p>{{ isEdit ? '修改现有问题信息' : '添加新的常见问题' }}</p>
        </div>

        <nav class="nav-menu">
          <a href="#basic" class="nav-item active">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
            基础信息
          </a>
          <a href="#problem" class="nav-item">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="16" x2="12" y2="12"/>
              <line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
            问题描述
          </a>
          <a href="#solution" class="nav-item">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            解决方案
          </a>
          <a href="#flow" class="nav-item">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
            排查流程
          </a>
        </nav>

        <div class="sidebar-actions">
          <button type="button" (click)="onCancel()" class="btn-secondary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
            取消
          </button>
          <button type="button" (click)="onSave()" class="btn-primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            {{ isEdit ? '更新' : '创建' }} FAQ
          </button>
        </div>
      </aside>

      <!-- 主内容区 -->
      <main class="main-content">
        <form class="edit-form">
          <!-- 基础信息 -->
          <section id="basic" class="form-card">
            <h2>📋 基础信息</h2>
            <div class="form-row">
              <div class="form-group full-width">
                <label>标题 <span class="required">*</span></label>
                <input 
                  type="text" 
                  [(ngModel)]="formData.title" 
                  name="title"
                  placeholder="例如：[Form] 异步校验失败后仍可提交表单"
                  required
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>所属模块 <span class="required">*</span></label>
                <select [(ngModel)]="formData.component" name="component" required>
                  <option value="">-- 请选择 --</option>
                  @for (opt of moduleOptions; track opt.value) {
                    <option [value]="opt.value">{{ opt.label }}</option>
                  }
                </select>
              </div>

              <div class="form-group">
                <label>版本</label>
                <select [(ngModel)]="formData.version" name="version">
                  <option value="">-- 请选择 --</option>
                  @for (opt of versionOptions; track opt.value) {
                    <option [value]="opt.value">{{ opt.label }}</option>
                  }
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group full-width">
                <label>标签 <span class="required">*</span></label>
                <div class="tag-selector">
                  @for (tag of tagOptions; track tag.value) {
                    <label class="tag-checkbox">
                      <input 
                        type="checkbox" 
                        [value]="tag.value"
                        [checked]="isTagSelected(tag.value)"
                        (change)="toggleTag(tag.value)"
                      />
                      <span>{{ tag.label }}</span>
                    </label>
                  }
                </div>
              </div>
            </div>
          </section>

          <!-- 问题描述 -->
          <section id="problem" class="form-card">
            <h2>🔍 问题描述</h2>
            <div class="form-group">
              <label>问题概述 <span class="required">*</span></label>
              <textarea 
                [(ngModel)]="formData.summary" 
                name="summary"
                rows="3"
                placeholder="简要描述问题"
                required
              ></textarea>
            </div>

            <div class="form-group">
              <label>现象描述 <span class="required">*</span></label>
              <textarea 
                [(ngModel)]="formData.phenomenon" 
                name="phenomenon"
                rows="5"
                placeholder="详细描述如何复现该问题"
                required
              ></textarea>
            </div>
          </section>

          <!-- 解决方案 -->
          <section id="solution" class="form-card highlight">
            <h2>✅ 解决方案</h2>
            <div class="form-group">
              <label>解决方案 <span class="required">*</span></label>
              <textarea 
                [(ngModel)]="formData.solution" 
                name="solution"
                rows="6"
                placeholder="详细说明如何修复该问题"
                required
              ></textarea>
            </div>

            <div class="form-group">
              <label>验证方法</label>
              <textarea 
                [(ngModel)]="formData.validationMethod" 
                name="validationMethod"
                rows="3"
                placeholder="如何验证修复是否有效"
              ></textarea>
            </div>
          </section>

          <!-- 排查流程 -->
          <section id="flow" class="form-card">
            <h2>🔄 排查流程 (Flow)</h2>
            <div class="form-group">
              <label>Mermaid 流程图</label>
              <div class="flow-actions">
                <button type="button" class="btn-example" (click)="showExamples()">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                  查看示例
                </button>
              </div>
              <textarea 
                [(ngModel)]="formData.troubleshootingFlow" 
                name="troubleshootingFlow"
                rows="8"
                class="code-input"
                placeholder="graph TD;
  A[开始] --> B{检查?};
  B -->|是| C[操作];
  B -->|否| D[其他];"
              ></textarea>
              <small class="hint">使用 Mermaid 语法编写流程图</small>
            </div>
          </section>
        </form>
      </main>
    </div>
  `,
    styles: [`
    .edit-layout {
      display: flex;
      min-height: calc(100vh - 64px);
      background: var(--color-background);
    }

    .sidebar {
      width: 280px;
      background: var(--color-surface);
      border-right: 1px solid var(--color-border);
      padding: 2rem 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 2rem;
      position: sticky;
      top: 64px;
      height: calc(100vh - 64px);
      overflow-y: auto;
    }

    .sidebar-header h3 {
      margin: 0 0 0.5rem 0;
      color: var(--color-text);
      font-size: 1.5rem;
    }

    .sidebar-header p {
      margin: 0;
      color: var(--color-textSecondary);
      font-size: 0.9rem;
    }

    .nav-menu {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      flex: 1;
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

    .sidebar-actions {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      padding-top: 1.5rem;
      border-top: 1px solid var(--color-border);
    }

    .sidebar-actions button {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.75rem;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.2s;
    }

    .btn-primary {
      background: var(--color-primary);
      color: white;
    }

    .btn-primary:hover {
      background: var(--color-primaryLight);
    }

    .btn-secondary {
      background: var(--color-surfaceHover);
      color: var(--color-text);
      border: 1px solid var(--color-border);
    }

    .btn-secondary:hover {
      background: var(--color-border);
    }

    .main-content {
      flex: 1;
      padding: 2rem;
      overflow-y: auto;
    }

    .edit-form {
      max-width: 1000px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .form-card {
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: 12px;
      padding: 2rem;
    }

    .form-card.highlight {
      border-left: 4px solid var(--color-primary);
      background: var(--color-glass);
    }

    .form-card h2 {
      margin: 0 0 1.5rem 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--color-text);
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
      margin-bottom: 1.5rem;
    }

    .form-row:last-child {
      margin-bottom: 0;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .form-group.full-width {
      grid-column: 1 / -1;
    }

    label {
      color: var(--color-text);
      font-weight: 600;
      font-size: 0.95rem;
    }

    .required {
      color: #dc3545;
    }

    input, select, textarea {
      padding: 0.75rem;
      background: var(--color-background);
      border: 1px solid var(--color-border);
      border-radius: 6px;
      color: var(--color-text);
      font-size: 1rem;
      font-family: inherit;
      transition: all 0.2s;
    }

    input:focus, select:focus, textarea:focus {
      outline: none;
      border-color: var(--color-primary);
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .code-input {
      font-family: 'Courier New', monospace;
      font-size: 0.9rem;
    }

    .tag-selector {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 0.75rem;
      padding: 1rem;
      background: var(--color-background);
      border: 1px solid var(--color-border);
      border-radius: 6px;
      max-height: 200px;
      overflow-y: auto;
    }

    .tag-checkbox {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 4px;
      transition: background 0.2s;
    }

    .tag-checkbox:hover {
      background: var(--color-surfaceHover);
    }

    .tag-checkbox input {
      width: auto;
      cursor: pointer;
    }

    .tag-checkbox span {
      color: var(--color-text);
      font-size: 0.9rem;
    }

    .flow-actions {
      margin-bottom: 0.75rem;
    }

    .btn-example {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      background: var(--color-surfaceHover);
      border: 1px solid var(--color-border);
      border-radius: 6px;
      color: var(--color-text);
      cursor: pointer;
      font-size: 0.9rem;
      transition: all 0.2s;
    }

    .btn-example:hover {
      background: var(--color-primary);
      color: white;
      border-color: var(--color-primary);
    }

    .hint {
      color: var(--color-textSecondary);
      font-size: 0.85rem;
      font-style: italic;
    }
  `]
})
export class FaqEditComponent implements OnInit {
    isEdit = false;
    faqId: string | null = null;
    faqData?: FaqItem;

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

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private faqService: FaqService
    ) { }

    ngOnInit() {
        this.faqId = this.route.snapshot.paramMap.get('id');
        if (this.faqId) {
            this.isEdit = true;
            this.faqService.getFaq(this.faqId).subscribe(data => {
                this.faqData = data;
                this.formData = { ...data };
            });
        }
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

    showExamples() {
        const examples = [
            {
                title: '简单流程',
                code: `graph TD;
  A[开始] --> B{检查条件};
  B -->|是| C[执行操作];
  B -->|否| D[跳过];
  C --> E[结束];
  D --> E;`
            },
            {
                title: '问题排查流程',
                code: `graph TD;
  A[发现问题] --> B{能否复现?};
  B -->|是| C[记录复现步骤];
  B -->|否| D[收集更多信息];
  C --> E{查看日志};
  E -->|有错误| F[定位错误代码];
  E -->|无错误| G[检查配置];
  F --> H[修复并测试];
  G --> H;
  D --> B;`
            },
            {
                title: '表单验证流程',
                code: `graph TD;
  A[提交表单] --> B{表单状态?};
  B -->|PENDING| C[禁用提交按钮];
  B -->|INVALID| D[显示错误信息];
  B -->|VALID| E[发送请求];
  C --> F{异步验证完成?};
  F -->|通过| E;
  F -->|失败| D;
  E --> G[处理响应];`
            }
        ];

        const exampleText = examples.map((ex, i) =>
            `${i + 1}. ${ex.title}:\n${ex.code}\n`
        ).join('\n');

        const message = `流程图示例（点击确定后可复制）：\n\n${exampleText}\n\n提示：复制示例代码到"排查流程"字段中`;

        if (confirm(message)) {
            navigator.clipboard.writeText(examples[0].code);
            alert('已复制第一个示例到剪贴板！');
        }
    }

    onSave() {
        // Validate required fields
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
