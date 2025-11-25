import {
  Component,
  Input,
  forwardRef,
  Output,
  EventEmitter,
  ElementRef,
  HostListener,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';

export interface SelectOption {
  label: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any;
}

@Component({
  selector: 'lib-select',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectComponent),
      multi: true,
    },
  ],
  template: `
    <div class="select-container" [class.disabled]="disabled" [class.open]="isOpen">
      <!-- Trigger -->
      <div
        class="select-trigger"
        (click)="toggleDropdown()"
        (keydown.enter)="toggleDropdown()"
        (keydown.space)="toggleDropdown()"
        tabindex="0"
        role="button"
        [attr.aria-expanded]="isOpen"
      >
        <span class="selected-value" [class.placeholder]="!selectedLabel">
          {{ selectedLabel || placeholder }}
        </span>
        <div class="select-arrow">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path
              d="M6 9l6 6 6-6"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
      </div>

      <!-- Dropdown Menu -->
      @if (isOpen) {
        <div class="select-dropdown">
          @for (option of options; track option.value) {
            <div
              class="select-option"
              [class.selected]="isSelected(option)"
              (click)="selectOption(option)"
              (keydown.enter)="selectOption(option)"
              (keydown.space)="selectOption(option)"
              tabindex="0"
              role="option"
              [attr.aria-selected]="isSelected(option)"
            >
              <span class="check-icon">
                @if (isSelected(option)) {
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                }
              </span>
              <span class="option-label">{{ option.label }}</span>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
        font-family:
          -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      }

      .select-container {
        position: relative;
        width: 100%;
      }

      /* Trigger Styles */
      .select-trigger {
        width: 100%;
        padding: 0.6rem 1rem;
        background: #fff;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        cursor: pointer;
        transition: all 0.2s ease;
        min-height: 42px;
      }

      .select-trigger:hover {
        border-color: #d1d5db;
      }

      .select-container.open .select-trigger {
        border-color: #4f46e5;
        box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
      }

      .selected-value {
        font-size: 0.95rem;
        color: #1f2937;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .selected-value.placeholder {
        color: #9ca3af;
      }

      .select-arrow {
        color: #6b7280;
        display: flex;
        align-items: center;
        transition: transform 0.2s;
      }

      .select-container.open .select-arrow {
        transform: rotate(180deg);
      }

      /* Dropdown Styles */
      .select-dropdown {
        position: absolute;
        top: calc(100% + 4px);
        left: 0;
        width: 100%;
        background: #fff;
        border: 1px solid #e5e7eb;
        border-radius: 12px;
        box-shadow:
          0 10px 15px -3px rgba(0, 0, 0, 0.1),
          0 4px 6px -2px rgba(0, 0, 0, 0.05);
        z-index: 50;
        max-height: 250px;
        overflow-y: auto;
        padding: 0.5rem;
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

      .select-option {
        padding: 0.6rem 0.8rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        cursor: pointer;
        border-radius: 6px;
        transition: background 0.15s;
        color: #374151;
        font-size: 0.95rem;
      }

      .select-option:hover {
        background: #f3f4f6;
      }

      .select-option.selected {
        background: #eff6ff;
        color: #4f46e5;
        font-weight: 500;
      }

      .check-icon {
        width: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #4f46e5;
      }

      /* Disabled State */
      .select-container.disabled {
        opacity: 0.6;
        pointer-events: none;
      }

      .select-container.disabled .select-trigger {
        background: #f9fafb;
      }
    `,
  ],
})
export class SelectComponent implements ControlValueAccessor {
  @Input() options: SelectOption[] = [];
  @Input() placeholder = '请选择';
  @Input() disabled = false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @Output() selectionChange = new EventEmitter<any>();

  private elementRef = inject(ElementRef);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any = null;
  isOpen = false;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onChange: (value: any) => void = () => {
    // empty
  };
  onTouch: () => void = () => {
    // empty
  };

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen = false;
    }
  }

  get selectedLabel(): string {
    const selected = this.options.find((o) => o.value === this.value);
    return selected ? selected.label : '';
  }

  toggleDropdown() {
    if (this.disabled) return;
    this.isOpen = !this.isOpen;
    this.onTouch();
  }

  selectOption(option: SelectOption) {
    this.value = option.value;
    this.onChange(this.value);
    this.selectionChange.emit(this.value);
    this.isOpen = false;
  }

  isSelected(option: SelectOption): boolean {
    return this.value === option.value;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  writeValue(value: any): void {
    this.value = value;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  registerOnChange(fn: (value: any) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouch = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
