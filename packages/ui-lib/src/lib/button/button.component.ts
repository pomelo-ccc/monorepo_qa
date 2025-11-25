import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'lib-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      [class]="'btn btn-' + variant + ' btn-' + size + (block ? ' btn-block' : '')"
      [disabled]="disabled"
      (click)="handleClick($event)"
    >
      <span class="btn-content">
        <ng-content></ng-content>
      </span>
    </button>
  `,
  styles: [
    `
      :host {
        display: inline-block;
      }

      .btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border: 1px solid transparent;
        border-radius: 10px;
        cursor: pointer;
        font-family: inherit;
        font-weight: 500;
        transition: all 0.2s ease;
        outline: none;
        white-space: nowrap;
        box-shadow: var(--color-buttonShadow, none);
        position: relative;
        overflow: hidden;
      }

      /* 按钮高光效果 */
      .btn::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 50%;
        background: linear-gradient(
          180deg,
          var(--color-glassHighlight, transparent) 0%,
          transparent 100%
        );
        pointer-events: none;
        border-radius: 10px 10px 0 0;
      }

      .btn:active:not(:disabled) {
        transform: translateY(1px);
        box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2);
      }

      .btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      .btn-content {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      /* Sizes */
      .btn-sm {
        padding: 0.25rem 0.5rem;
        font-size: 0.75rem;
        height: 28px;
      }

      .btn-md {
        padding: 0.5rem 1rem;
        font-size: 0.875rem;
        height: 36px;
      }

      .btn-lg {
        padding: 0.75rem 1.5rem;
        font-size: 1rem;
        height: 44px;
      }

      .btn-block {
        display: flex;
        width: 100%;
      }

      /* Variants */
      .btn-primary {
        background-color: var(--color-primary);
        color: #fff;
        border-color: var(--color-primary);
      }
      .btn-primary:hover:not(:disabled) {
        background-color: var(--color-primaryLight);
        border-color: var(--color-primaryLight);
      }

      .btn-secondary {
        background-color: var(--color-surfaceHover);
        color: var(--color-text);
        border-color: var(--color-border);
      }
      .btn-secondary:hover:not(:disabled) {
        background-color: var(--color-border);
      }

      .btn-outline {
        background-color: transparent;
        color: var(--color-text);
        border-color: var(--color-border);
      }
      .btn-outline:hover:not(:disabled) {
        background-color: var(--color-surfaceHover);
        border-color: var(--color-textSecondary);
      }

      .btn-ghost {
        background-color: transparent;
        color: var(--color-textSecondary);
        border-color: transparent;
      }
      .btn-ghost:hover:not(:disabled) {
        background-color: var(--color-surfaceHover);
        color: var(--color-text);
      }

      .btn-danger {
        background-color: #ef4444;
        color: white;
        border-color: #ef4444;
      }
      .btn-danger:hover:not(:disabled) {
        background-color: #dc2626;
      }
    `,
  ],
})
export class ButtonComponent {
  @Input() variant: ButtonVariant = 'primary';
  @Input() size: ButtonSize = 'md';
  @Input() disabled = false;
  @Input() block = false;
  @Output() btnClick = new EventEmitter<MouseEvent>();

  handleClick(event: MouseEvent) {
    if (!this.disabled) {
      this.btnClick.emit(event);
    }
  }
}
