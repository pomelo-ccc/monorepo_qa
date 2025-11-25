import { Component, Input, forwardRef, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';

@Component({
  selector: 'lib-checkbox',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CheckboxComponent),
      multi: true,
    },
  ],
  template: `
    <label class="checkbox-wrapper" [class.disabled]="disabled">
      <input
        type="checkbox"
        [ngModel]="value"
        (ngModelChange)="onValueChange($event)"
        [disabled]="disabled"
        class="checkbox-input"
      />
      <span class="checkbox-custom">
        @if (value) {
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        }
      </span>
      @if (label) {
        <span class="checkbox-label">
          {{ label }}
          <ng-content></ng-content>
        </span>
      }
    </label>
  `,
  styles: [
    `
      :host {
        display: inline-block;
      }

      .checkbox-wrapper {
        display: inline-flex;
        align-items: center;
        cursor: pointer;
        user-select: none;
        gap: 0.5rem;
      }

      .checkbox-input {
        position: absolute;
        opacity: 0;
        cursor: pointer;
        height: 0;
        width: 0;
      }

      .checkbox-custom {
        position: relative;
        height: 18px;
        width: 18px;
        background-color: var(--color-surface, #fff);
        border: 1px solid var(--color-border, #d1d5db);
        border-radius: 4px;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
      }

      .checkbox-wrapper:hover .checkbox-input ~ .checkbox-custom {
        border-color: var(--color-primary, #3b82f6);
      }

      .checkbox-input:checked ~ .checkbox-custom {
        background-color: var(--color-primary, #3b82f6);
        border-color: var(--color-primary, #3b82f6);
      }

      .checkbox-custom svg {
        width: 12px;
        height: 12px;
      }

      .checkbox-label {
        font-size: 0.9rem;
        color: var(--color-text, #374151);
      }

      .disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      .disabled .checkbox-custom {
        background-color: var(--color-surfaceHover, #f3f4f6);
      }
    `,
  ],
})
export class CheckboxComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() disabled = false;
  @Output() checkedChange = new EventEmitter<boolean>();

  value = false;

  onChange: (value: boolean) => void = () => {};
  onTouch: () => void = () => {};

  onValueChange(val: boolean) {
    this.value = val;
    this.onChange(val);
    this.onTouch();
    this.checkedChange.emit(val);
  }

  writeValue(value: boolean): void {
    this.value = value;
  }

  registerOnChange(fn: (value: boolean) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouch = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
