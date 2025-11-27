import {
  Injectable,
  ApplicationRef,
  ComponentRef,
  EnvironmentInjector,
  createComponent,
  inject,
  EmbeddedViewRef,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ButtonComponent } from '../button/button.component';

// 确认对话框组件
@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'lib-confirm-dialog',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  template: `
    <div
      class="dialog-overlay"
      (click)="onCancel()"
      (keyup.escape)="onCancel()"
      tabindex="0"
      role="dialog"
    >
      <div
        class="dialog-wrapper"
        (click)="$event.stopPropagation()"
        (keydown)="$event.stopPropagation()"
        role="document"
      >
        <div class="dialog-card">
          <div class="dialog-header">
            <div class="dialog-icon" [class]="type">
              @if (type === 'danger') {
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
              } @else if (type === 'warning') {
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              } @else {
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
              }
            </div>
            <h3 class="dialog-title">{{ title }}</h3>
          </div>
          <div class="dialog-content">
            <p>{{ message }}</p>
          </div>
          <div class="dialog-footer">
            <lib-button variant="ghost" (click)="onCancel()">{{ cancelText }}</lib-button>
            <lib-button [variant]="type === 'danger' ? 'danger' : 'primary'" (click)="onConfirm()">
              {{ confirmText }}
            </lib-button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .dialog-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        backdrop-filter: blur(2px);
        animation: fade-in 0.15s ease;
      }

      @keyframes fade-in {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }

      .dialog-wrapper {
        animation: zoom-in 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      }

      @keyframes zoom-in {
        from {
          transform: scale(0.95);
          opacity: 0;
        }
        to {
          transform: scale(1);
          opacity: 1;
        }
      }

      .dialog-card {
        background: var(--color-surface, #fff);
        border-radius: 12px;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        width: 400px;
        max-width: 90vw;
        overflow: hidden;
      }

      .dialog-header {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1.5rem 1.5rem 0;
      }

      .dialog-icon {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .dialog-icon.info {
        background: rgba(59, 130, 246, 0.1);
        color: #3b82f6;
      }

      .dialog-icon.warning {
        background: rgba(245, 158, 11, 0.1);
        color: #f59e0b;
      }

      .dialog-icon.danger {
        background: rgba(239, 68, 68, 0.1);
        color: #ef4444;
      }

      .dialog-title {
        margin: 0;
        font-size: 1.125rem;
        font-weight: 600;
        color: var(--color-text, #1f2937);
      }

      .dialog-content {
        padding: 1rem 1.5rem;
      }

      .dialog-content p {
        margin: 0;
        color: var(--color-text-secondary, #6b7280);
        font-size: 0.95rem;
        line-height: 1.5;
      }

      .dialog-footer {
        display: flex;
        justify-content: flex-end;
        gap: 0.75rem;
        padding: 1rem 1.5rem 1.5rem;
      }
    `,
  ],
})
export class ConfirmDialogComponent {
  @Input() title = '确认';
  @Input() message = '';
  @Input() cancelText = '取消';
  @Input() confirmText = '确定';
  @Input() type: 'info' | 'warning' | 'danger' = 'info';

  @Output() cancelEvent = new EventEmitter<void>();
  @Output() confirmEvent = new EventEmitter<void>();

  onCancel() {
    this.cancelEvent.emit();
  }

  onConfirm() {
    this.confirmEvent.emit();
  }
}

// 输入对话框组件
@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'lib-prompt-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent],
  template: `
    <div
      class="dialog-overlay"
      (click)="onCancel()"
      (keyup.escape)="onCancel()"
      tabindex="0"
      role="dialog"
    >
      <div
        class="dialog-wrapper"
        (click)="$event.stopPropagation()"
        (keydown)="$event.stopPropagation()"
        role="document"
      >
        <div class="dialog-card">
          <div class="dialog-header">
            <h3 class="dialog-title">{{ title }}</h3>
          </div>
          <div class="dialog-content">
            @if (message) {
              <p class="dialog-message">{{ message }}</p>
            }
            <input
              type="text"
              class="dialog-input"
              [(ngModel)]="inputValue"
              [placeholder]="placeholder"
              (keydown.enter)="onConfirm()"
              #inputEl
            />
          </div>
          <div class="dialog-footer">
            <lib-button variant="ghost" (click)="onCancel()">{{ cancelText }}</lib-button>
            <lib-button variant="primary" (click)="onConfirm()">{{ confirmText }}</lib-button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .dialog-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        backdrop-filter: blur(2px);
        animation: fade-in 0.15s ease;
      }

      @keyframes fade-in {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }

      .dialog-wrapper {
        animation: zoom-in 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      }

      @keyframes zoom-in {
        from {
          transform: scale(0.95);
          opacity: 0;
        }
        to {
          transform: scale(1);
          opacity: 1;
        }
      }

      .dialog-card {
        background: var(--color-surface, #fff);
        border-radius: 12px;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        width: 400px;
        max-width: 90vw;
        overflow: hidden;
      }

      .dialog-header {
        padding: 1.5rem 1.5rem 0;
      }

      .dialog-title {
        margin: 0;
        font-size: 1.125rem;
        font-weight: 600;
        color: var(--color-text, #1f2937);
      }

      .dialog-content {
        padding: 1rem 1.5rem;
      }

      .dialog-message {
        margin: 0 0 1rem;
        color: var(--color-text-secondary, #6b7280);
        font-size: 0.95rem;
        line-height: 1.5;
      }

      .dialog-input {
        width: 100%;
        padding: 0.75rem 1rem;
        border: 1px solid var(--color-border, #e5e7eb);
        border-radius: 8px;
        font-size: 0.95rem;
        color: var(--color-text, #1f2937);
        background: var(--color-background, #fff);
        outline: none;
        transition: border-color 0.15s ease, box-shadow 0.15s ease;
        box-sizing: border-box;
      }

      .dialog-input:focus {
        border-color: var(--color-primary, #3b82f6);
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
      }

      .dialog-input::placeholder {
        color: var(--color-text-secondary, #9ca3af);
      }

      .dialog-footer {
        display: flex;
        justify-content: flex-end;
        gap: 0.75rem;
        padding: 1rem 1.5rem 1.5rem;
      }
    `,
  ],
})
export class PromptDialogComponent implements OnInit {
  @Input() title = '输入';
  @Input() message = '';
  @Input() placeholder = '';
  @Input() defaultValue = '';
  @Input() cancelText = '取消';
  @Input() confirmText = '确定';

  @Output() cancelEvent = new EventEmitter<void>();
  @Output() confirmEvent = new EventEmitter<string>();

  inputValue = '';

  ngOnInit() {
    this.inputValue = this.defaultValue;
    // 自动聚焦输入框
    setTimeout(() => {
      const input = document.querySelector('.dialog-input') as HTMLInputElement;
      if (input) {
        input.focus();
        input.select();
      }
    }, 100);
  }

  onCancel() {
    this.cancelEvent.emit();
  }

  onConfirm() {
    this.confirmEvent.emit(this.inputValue);
  }
}

export interface ConfirmOptions {
  title?: string;
  message: string;
  cancelText?: string;
  confirmText?: string;
  type?: 'info' | 'warning' | 'danger';
}

export interface PromptOptions {
  title?: string;
  message?: string;
  placeholder?: string;
  defaultValue?: string;
  cancelText?: string;
  confirmText?: string;
}

@Injectable({
  providedIn: 'root',
})
export class DialogService {
  private appRef = inject(ApplicationRef);
  private environmentInjector = inject(EnvironmentInjector);

  /**
   * 显示确认对话框
   * @returns Promise<boolean> - 用户点击确认返回 true，取消返回 false
   */
  confirm(options: ConfirmOptions | string): Promise<boolean> {
    return new Promise((resolve) => {
      const opts: ConfirmOptions =
        typeof options === 'string' ? { message: options } : options;

      const componentRef: ComponentRef<ConfirmDialogComponent> = createComponent(
        ConfirmDialogComponent,
        { environmentInjector: this.environmentInjector }
      );

      componentRef.instance.title = opts.title || '确认';
      componentRef.instance.message = opts.message;
      componentRef.instance.cancelText = opts.cancelText || '取消';
      componentRef.instance.confirmText = opts.confirmText || '确定';
      componentRef.instance.type = opts.type || 'info';

      const cleanup = () => {
        this.appRef.detachView(componentRef.hostView);
        componentRef.destroy();
      };

      componentRef.instance.cancelEvent.subscribe(() => {
        cleanup();
        resolve(false);
      });

      componentRef.instance.confirmEvent.subscribe(() => {
        cleanup();
        resolve(true);
      });

      this.appRef.attachView(componentRef.hostView);
      const domElem = (componentRef.hostView as EmbeddedViewRef<unknown>)
        .rootNodes[0] as HTMLElement;
      document.body.appendChild(domElem);
    });
  }

  /**
   * 显示输入对话框
   * @returns Promise<string | null> - 用户输入的值，取消返回 null
   */
  prompt(options: PromptOptions | string): Promise<string | null> {
    return new Promise((resolve) => {
      const opts: PromptOptions =
        typeof options === 'string' ? { title: options } : options;

      const componentRef: ComponentRef<PromptDialogComponent> = createComponent(
        PromptDialogComponent,
        { environmentInjector: this.environmentInjector }
      );

      componentRef.instance.title = opts.title || '输入';
      componentRef.instance.message = opts.message || '';
      componentRef.instance.placeholder = opts.placeholder || '';
      componentRef.instance.defaultValue = opts.defaultValue || '';
      componentRef.instance.cancelText = opts.cancelText || '取消';
      componentRef.instance.confirmText = opts.confirmText || '确定';

      const cleanup = () => {
        this.appRef.detachView(componentRef.hostView);
        componentRef.destroy();
      };

      componentRef.instance.cancelEvent.subscribe(() => {
        cleanup();
        resolve(null);
      });

      componentRef.instance.confirmEvent.subscribe((value: string) => {
        cleanup();
        resolve(value);
      });

      this.appRef.attachView(componentRef.hostView);
      const domElem = (componentRef.hostView as EmbeddedViewRef<unknown>)
        .rootNodes[0] as HTMLElement;
      document.body.appendChild(domElem);
    });
  }
}
