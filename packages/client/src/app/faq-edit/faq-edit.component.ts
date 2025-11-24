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
            label: 'Title',
            type: 'text',
            required: true,
            placeholder: 'e.g., [Form] Async validation issue'
        },
        {
            key: 'component',
            label: 'Component',
            type: 'text',
            required: true,
            placeholder: 'e.g., Form, Table, Project'
        },
        {
            key: 'version',
            label: 'Version',
            type: 'text',
            placeholder: 'e.g., 1.2.x, ALL'
        },
        {
            key: 'tags',
            label: 'Tags',
            type: 'text',
            description: 'Comma-separated tags',
            placeholder: 'e.g., validation, async, form'
        },
        {
            key: 'errorCode',
            label: 'Error Code (Optional)',
            type: 'text',
            placeholder: 'e.g., ASYNC_VALIDATE_FAIL'
        },
        {
            key: 'summary',
            label: 'Summary',
            type: 'textarea',
            required: true,
            rows: 3,
            description: 'Brief description of the issue'
        },
        {
            key: 'phenomenon',
            label: 'Phenomenon',
            type: 'textarea',
            required: true,
            rows: 4,
            description: 'How to reproduce the issue'
        },
        {
            key: 'solution',
            label: 'Solution',
            type: 'textarea',
            required: true,
            rows: 4,
            description: 'How to fix the issue'
        },
        {
            key: 'troubleshootingFlow',
            label: 'Troubleshooting Flow',
            type: 'flow-builder',
            description: 'Mermaid flowchart diagram',
            placeholder: 'graph TD;\n  A[Start] --> B{Check?};\n  B -->|Yes| C[Action];\n  B -->|No| D[Other];'
        },
        {
            key: 'validationMethod',
            label: 'Validation Method',
            type: 'textarea',
            rows: 2,
            description: 'How to verify the fix works'
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
