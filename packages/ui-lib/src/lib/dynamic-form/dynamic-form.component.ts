import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormField } from '../types';

@Component({
    selector: 'lib-dynamic-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()" class="dynamic-form">
      <div *ngFor="let field of fields" class="form-field">
        <label [for]="field.key">
          {{ field.label }}
          <span *ngIf="field.required" class="required">*</span>
        </label>
        
        <!-- Text Input -->
        <input 
          *ngIf="field.type === 'text'"
          [id]="field.key"
          type="text"
          [formControlName]="field.key"
          [placeholder]="field.placeholder || ''"
          class="form-control"
        />
        
        <!-- Textarea -->
        <textarea 
          *ngIf="field.type === 'textarea'"
          [id]="field.key"
          [formControlName]="field.key"
          [rows]="field.rows || 3"
          [placeholder]="field.placeholder || ''"
          class="form-control"
        ></textarea>
        
        <!-- Select -->
        <select 
          *ngIf="field.type === 'select'"
          [id]="field.key"
          [formControlName]="field.key"
          class="form-control"
        >
          <option value="">-- Select --</option>
          <option *ngFor="let opt of field.options" [value]="opt.value">
            {{ opt.label }}
          </option>
        </select>
        
        <!-- Flow Builder - emit event for custom handling -->
        <div *ngIf="field.type === 'flow-builder'" class="flow-builder-container">
          <textarea 
            [id]="field.key"
            [formControlName]="field.key"
            rows="6"
            class="form-control mono"
            [placeholder]="field.placeholder || 'Enter Mermaid flowchart or use builder'"
          ></textarea>
          <button type="button" (click)="openFlowBuilder(field.key)" class="btn-secondary btn-sm">
            Open Flow Builder
          </button>
        </div>
        
        <small *ngIf="field.description" class="field-description">
          {{ field.description }}
        </small>
        
        <div *ngIf="form.get(field.key)?.invalid && form.get(field.key)?.touched" class="error">
          This field is required
        </div>
      </div>

      <div class="form-actions">
        <button type="submit" [disabled]="form.invalid" class="btn-primary">
          {{ submitLabel }}
        </button>
        <button type="button" (click)="onCancel()" class="btn-secondary">
          Cancel
        </button>
      </div>
    </form>
  `,
    styles: [`
    .dynamic-form {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
      background: #ffffff;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    
    .form-field {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    
    label {
      font-weight: 600;
      color: #333;
      font-size: 0.95rem;
    }
    
    .required {
      color: #dc3545;
      margin-left: 4px;
    }
    
    .form-control {
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1rem;
      transition: border-color 0.2s;
    }
    
    .form-control:focus {
      outline: none;
      border-color: #007bff;
      box-shadow: 0 0 0 3px rgba(0,123,255,0.1);
    }
    
    .mono {
      font-family: 'Courier New', monospace;
      font-size: 0.9rem;
    }
    
    .flow-builder-container {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    
    .field-description {
      color: #666;
      font-size: 0.85rem;
      font-style: italic;
    }
    
    .error {
      color: #dc3545;
      font-size: 0.85rem;
    }
    
    .form-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid #eee;
    }
    
    button {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 4px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .btn-primary {
      background: #007bff;
      color: white;
    }
    
    .btn-primary:hover:not(:disabled) {
      background: #0056b3;
    }
    
    .btn-primary:disabled {
      background: #ccc;
      cursor: not-allowed;
    }
    
    .btn-secondary {
      background: #6c757d;
      color: white;
    }
    
    .btn-secondary:hover {
      background: #545b62;
    }
    
    .btn-sm {
      padding: 0.5rem 1rem;
      font-size: 0.875rem;
    }
  `]
})
export class DynamicFormComponent implements OnInit {
    @Input() fields: FormField[] = [];
    @Input() initialData?: any;
    @Input() submitLabel = 'Submit';

    @Output() formSubmit = new EventEmitter<any>();
    @Output() formCancel = new EventEmitter<void>();
    @Output() flowBuilderOpen = new EventEmitter<string>(); // Emit field key

    form!: FormGroup;

    constructor(private fb: FormBuilder) { }

    ngOnInit() {
        this.buildForm();
        if (this.initialData) {
            this.form.patchValue(this.initialData);
        }
    }

    private buildForm() {
        const group: any = {};

        this.fields.forEach(field => {
            const validators = field.required ? [Validators.required] : [];
            group[field.key] = [this.initialData?.[field.key] || '', validators];
        });

        this.form = this.fb.group(group);
    }

    onSubmit() {
        if (this.form.valid) {
            this.formSubmit.emit(this.form.value);
        }
    }

    onCancel() {
        this.formCancel.emit();
    }

    openFlowBuilder(fieldKey: string) {
        this.flowBuilderOpen.emit(fieldKey);
    }
}
