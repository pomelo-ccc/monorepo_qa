import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FaqService } from '../faq.service';
import { FaqItem } from '../models/faq.model';
import { DynamicFormComponent, FormField } from '@repo/ui-lib';
import { FlowGenerator } from '@repo/utils';
import { MODULES, PREDEFINED_TAGS, VERSION_OPTIONS, generateErrorCode } from '../models/config';

@Component({
    selector: 'app-faq-edit',
    standalone: true,
    imports: [CommonModule, DynamicFormComponent],
    template: `
    <div class="edit-container">
      <h2>{{ isEdit ? '编辑 FAQ' : '新建 FAQ' }}</h2>
      @if (!isEdit || faqData) {
        <lib-dynamic-form 
          [fields]="formFields"
          [initialData]="formData"
          [submitLabel]="isEdit ? '更新' : '创建'"
          (formSubmit)="onSave($event)" 
          (formCancel)="onCancel()"
          (flowBuilderOpen)="onFlowBuilderOpen($event)">
        </lib-dynamic-form>
      }
    </div>
  `,
    styles: [`
    .edit-container { 
      padding: 20px; 
      max-width: 900px; 
      margin: 0 auto; 
      min-height: 100vh;
    }
    h2 { 
      text-align: center; 
      margin-bottom: 30px;
      color: var(--color-text);
      font-size: 2rem;
    }
  `]
})
export class FaqEditComponent implements OnInit {
    isEdit = false;
    faqId: string | null = null;
    faqData?: FaqItem;
    formData: Record<string, unknown> = {};

    // 构建模块选项
    moduleOptions = [
        ...MODULES.frontend.children.map(c => ({ label: `前端 - ${c.name}`, value: c.id })),
        { label: '后端', value: MODULES.backend.id }
    ];

    // 构建标签选项
    tagOptions = PREDEFINED_TAGS.map(tag => ({ label: tag, value: tag }));

    // 构建版本选项
    versionOptions = VERSION_OPTIONS.map(v => ({ label: v, value: v }));

    formFields: FormField[] = [
        {
            key: 'title',
            label: '标题',
            type: 'text',
            required: true,
            placeholder: '例如：[Form] 异步校验失败后仍可提交表单'
        },
        {
            key: 'component',
            label: '所属模块',
            type: 'select',
            required: true,
            options: this.moduleOptions,
            description: '选择问题所属的模块'
        },
        {
            key: 'version',
            label: '版本',
            type: 'select',
            options: this.versionOptions,
            description: '选择适用的版本'
        },
        {
            key: 'tags',
            label: '标签',
            type: 'multi-select',
            required: true,
            options: this.tagOptions,
            description: '选择相关标签（可多选）'
        },
        {
            key: 'summary',
            label: '问题概述',
            type: 'textarea',
            required: true,
            rows: 3,
            description: '简要描述问题'
        },
        {
            key: 'phenomenon',
            label: '现象描述',
            type: 'textarea',
            required: true,
            rows: 4,
            description: '详细描述如何复现该问题'
        },
        {
            key: 'solution',
            label: '解决方案',
            type: 'textarea',
            required: true,
            rows: 4,
            description: '详细说明如何修复该问题'
        },
        {
            key: 'troubleshootingFlow',
            label: '排查流程',
            type: 'flow-builder',
            description: 'Mermaid 流程图（可选）',
            placeholder: 'graph TD;\n  A[开始] --> B{检查?};\n  B -->|是| C[操作];\n  B -->|否| D[其他];'
        },
        {
            key: 'validationMethod',
            label: '验证方法',
            type: 'textarea',
            rows: 2,
            description: '如何验证修复是否有效'
        }
    ];

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
                this.formData = {
                    ...data,
                    // tags is already an array, no need to convert
                };
            });
        }
    }

    onSave(formValue: Record<string, unknown>) {
        // Generate error code automatically
        const component = formValue['component'] as string;
        const tags = formValue['tags'] as string[];
        const errorCode = generateErrorCode(component, tags);

        const faqData: Partial<FaqItem> = {
            ...formValue as Partial<FaqItem>,
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

    onFlowBuilderOpen(fieldKey: string) {
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
            // Copy first example to clipboard
            navigator.clipboard.writeText(examples[0].code);
            alert('已复制第一个示例到剪贴板！');
        }
    }
}
