import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FaqService } from '../faq.service';
import { FaqItem } from '../models/faq.model';
import { DynamicFormComponent, FormField } from '@repo/ui-lib';
import { FlowGenerator } from '@repo/utils';

@Component({
    selector: 'app-faq-edit',
    standalone: true,
    imports: [CommonModule, DynamicFormComponent],
    template: `
    <div class="edit-container">
      <h2>{{ isEdit ? 'Edit FAQ' : 'Create New FAQ' }}</h2>
      <lib-dynamic-form 
        *ngIf="!isEdit || faqData" 
        [fields]="formFields"
        [initialData]="formData"
        [submitLabel]="isEdit ? 'Update' : 'Create'"
        (formSubmit)="onSave($event)" 
        (formCancel)="onCancel()"
        (flowBuilderOpen)="onFlowBuilderOpen($event)">
      </lib-dynamic-form>
    </div>
  `,
    styles: [`
    .edit-container { 
      padding: 20px; 
      max-width: 900px; 
      margin: 0 auto; 
      min-height: 100vh;
      background: #f5f5f5;
    }
    h2 { 
      text-align: center; 
      margin-bottom: 30px;
      color: #333;
      font-size: 2rem;
    }
  `]
})
export class FaqEditComponent implements OnInit {
    isEdit = false;
    faqId: string | null = null;
    faqData?: FaqItem;
    formData: any = {};

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
            type: 'text',
            required: true,
            placeholder: '例如：Form, Table, Project'
        },
        {
            key: 'version',
            label: '版本',
            type: 'text',
            placeholder: '例如：1.2.x, ALL'
        },
        {
            key: 'tags',
            label: '标签',
            type: 'text',
            description: '多个标签用逗号分隔',
            placeholder: '例如：校验, 异步, 表单提交'
        },
        {
            key: 'errorCode',
            label: '错误代码（可选）',
            type: 'text',
            placeholder: '例如：ASYNC_VALIDATE_FAIL'
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
            description: '如何复现该问题'
        },
        {
            key: 'solution',
            label: '解决方案',
            type: 'textarea',
            required: true,
            rows: 4,
            description: '如何修复该问题'
        },
        {
            key: 'troubleshootingFlow',
            label: '排查流程',
            type: 'flow-builder',
            description: 'Mermaid 流程图',
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
                    tags: data.tags.join(', ')
                };
            });
        }
    }

    onSave(formValue: any) {
        const faqData: Partial<FaqItem> = {
            ...formValue,
            tags: formValue.tags ? formValue.tags.split(',').map((t: string) => t.trim()).filter((t: string) => t) : [],
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
        // TODO: Open a modal/dialog with visual flow builder
        // For now, just insert a default template
        const defaultFlow = FlowGenerator.generateMermaid(FlowGenerator.getDefaultFlow());
        alert('Flow Builder: This would open a visual editor.\n\nFor now, here\'s a template:\n\n' + defaultFlow);
    }
}
