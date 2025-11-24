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
      @for (field of fields; track field.key) {
        <div class="form-field">
          <label [for]="field.key">
            {{ field.label }}
            @if (field.required) {
              <span class="required">*</span>
            }
          </label>
          
          <!-- Text Input -->
          @if (field.type === 'text') {
            <input 
              [id]="field.key"
              type="text"
              [formControlName]="field.key"
              [placeholder]="field.placeholder || ''"
              class="form-control"
            />
          }
          
          <!-- Textarea -->
          @if (field.type === 'textarea') {
            <textarea 
              [id]="field.key"
              [formControlName]="field.key"
              [rows]="field.rows || 3"
              [placeholder]="field.placeholder || ''"
              class="form-control"
            ></textarea>
          }
          
          <!-- Select (Single) -->
          @if (field.type === 'select') {
            <select 
              [id]="field.key"
              [formControlName]="field.key"
              class="form-control"
            >
              <option value="">-- 请选择 --</option>
              @for (opt of field.options; track opt.value) {
                <option [value]="opt.value">{{ opt.label }}</option>
              }
            </select>
          }
          
          <!-- Multi-Select -->
          @if (field.type === 'multi-select') {
            <div class="multi-select-container">
              @for (opt of field.options; track opt.value) {
                <label class="checkbox-label">
                  <input 
                    type="checkbox"
                    [value]="opt.value"
                    (change)="onCheckboxChange($event, field.key)"
                    [checked]="isChecked(field.key, opt.value)"
                  />
                  <span>{{ opt.label }}</span>
                </label>
              }
            </div>
          }
          
          <!-- Flow Builder -->
          @if (field.type === 'flow-builder') {
            <div class="flow-builder-container">
              <textarea 
                [id]="field.key"
                [formControlName]="field.key"
                rows="6"
                class="form-control mono"
                [placeholder]="field.placeholder || '输入 Mermaid 流程图或使用构建器'"
              ></textarea>
              <button type="button" (click)="openFlowBuilder(field.key)" class="btn-secondary btn-sm">
                打开流程图构建器
              </button>
            </div>
          }
          
          @if (field.description) {
            <small class="field-description">{{ field.description }}</small>
          }
          
          @if (form.get(field.key)?.invalid && form.get(field.key)?.touched) {
            <div class="error">此字段为必填项</div>
          }
        </div>
      }

      <div class="form-actions">
        <button type="submit" [disabled]="form.invalid" class="btn-primary">
          {{ submitLabel }}
        </button>
        <button type="button" (click)="onCancel()" class="btn-secondary">
          取消
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
      background: var(--color-surface);
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
      color: var(--color-text);
      font-size: 0.95rem;
    }
    
    .required {
      color: #dc3545;
      margin-left: 4px;
    }
    
    .form-control {
      padding: 0.75rem;
      border: 1px solid var(--color-border);
      border-radius: 4px;
      font-size: 1rem;
      transition: border-color 0.2s;
      background: var(--color-background);
      color: var(--color-text);
    }
    
    .form-control:focus {
      outline: none;
      border-color: var(--color-primary);
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }
    
    .mono {
      font-family: 'Courier New', monospace;
      font-size: 0.9rem;
    }
    
    .multi-select-container {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      padding: 1rem;
      background: var(--color-background);
      border: 1px solid var(--color-border);
      border-radius: 4px;
      max-height: 200px;
      overflow-y: auto;
    }
    
    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 4px;
      transition: background 0.2s;
    }
    
    .checkbox-label:hover {
      background: var(--color-surfaceHover);
    }
    
    .checkbox-label input[type="checkbox"] {
      width: 18px;
      height: 18px;
      cursor: pointer;
    }
    
    .checkbox-label span {
      color: var(--color-text);
      font-size: 0.95rem;
    }
    
    .flow-builder-container {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    
    .field-description {
      color: var(--color-textSecondary);
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
      border-top: 1px solid var(--color-border);
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
      background: var(--color-primary);
      color: white;
    }
    
    .btn-primary:hover:not(:disabled) {
      background: var(--color-primaryLight);
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
  @Input() initialData?: Record<string, unknown>;
  @Input() submitLabel = '提交';

  @Output() formSubmit = new EventEmitter<Record<string, unknown>>();
  @Output() formCancel = new EventEmitter<void>();
  @Output() flowBuilderOpen = new EventEmitter<string>();

  form!: FormGroup;
  private checkboxValues: Map<string, Set<unknown>> = new Map();

  constructor(private fb: FormBuilder) { }

  ngOnInit() {
    this.buildForm();
    if (this.initialData) {
      this.form.patchValue(this.initialData);
      // Initialize checkbox values for multi-select fields
      this.fields.forEach(field => {
        if (field.type === 'multi-select' && this.initialData![field.key]) {
          const values = this.initialData![field.key] as unknown[];
          this.checkboxValues.set(field.key, new Set(values));
        }
      });
    }
  }

  private buildForm() {
    const group: Record<string, unknown[]> = {};

    this.fields.forEach(field => {
      const validators = field.required ? [Validators.required] : [];
      const initialValue = this.initialData?.[field.key] || (field.type === 'multi-select' ? [] : '');
      group[field.key] = [initialValue, validators];

      if (field.type === 'multi-select') {
        this.checkboxValues.set(field.key, new Set());
      }
    });

    this.form = this.fb.group(group);
  }

  onCheckboxChange(event: Event, fieldKey: string) {
    const checkbox = event.target as HTMLInputElement;
    const value = checkbox.value;
    const values = this.checkboxValues.get(fieldKey) || new Set();

    if (checkbox.checked) {
      values.add(value);
    } else {
      values.delete(value);
    }

    this.checkboxValues.set(fieldKey, values);
    this.form.get(fieldKey)?.setValue(Array.from(values));
  }

  isChecked(fieldKey: string, value: unknown): boolean {
    const values = this.checkboxValues.get(fieldKey);
    return values ? values.has(value) : false;
  }

  onSubmit() {
    if (this.form.valid) {
      this.formSubmit.emit(this.form.value as Record<string, unknown>);
    }
  }

  onCancel() {
    formCancel.emit();
  }

  openFlowBuilder(fieldKey: string) {
    this.flowBuilderOpen.emit(fieldKey);
  }
}
