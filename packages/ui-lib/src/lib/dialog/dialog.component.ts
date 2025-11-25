import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../button/button.component';
import { CardComponent } from '../card/card.component';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'lib-dialog',
  standalone: true,
  imports: [CommonModule, ButtonComponent, CardComponent],
  template: `
    <div
      class="dialog-overlay"
      (click)="onBackdropClick()"
      (keyup.escape)="onBackdropClick()"
      tabindex="0"
    >
      <div class="dialog-wrapper" (click)="$event.stopPropagation()" (keyup)="(null)" tabindex="-1">
        <lib-card [title]="title" [hasHeader]="true">
          <ng-container ngProjectAs="[header-extra]">
            <button class="close-btn" (click)="close()">×</button>
          </ng-container>

          <div class="dialog-content">
            <ng-content></ng-content>
          </div>

          <div class="dialog-footer">
            <ng-content select="[footer]"></ng-content>
            @if (!customFooter) {
              <lib-button variant="ghost" (click)="onCancel()">{{ cancelText }}</lib-button>
              <lib-button [variant]="confirmVariant" (click)="onConfirm()">{{
                confirmText
              }}</lib-button>
            }
          </div>
        </lib-card>
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
        z-index: 1000;
        backdrop-filter: blur(2px);
      }
      .dialog-wrapper {
        width: 90%;
        max-width: 500px;
        max-height: 90vh;
        display: flex;
        flex-direction: column;
        animation: dialog-zoom 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      }
      @keyframes dialog-zoom {
        from {
          transform: scale(0.95);
          opacity: 0;
        }
        to {
          transform: scale(1);
          opacity: 1;
        }
      }
      .close-btn {
        background: none;
        border: none;
        font-size: 1.5rem;
        line-height: 1;
        cursor: pointer;
        color: var(--color-textSecondary);
        padding: 0 0.5rem;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .close-btn:hover {
        color: var(--color-text);
      }
      .dialog-content {
        padding: 1rem 0;
        overflow-y: auto;
        max-height: 60vh;
        color: var(--color-text);
      }
      .dialog-footer {
        display: flex;
        justify-content: flex-end;
        gap: 1rem;
        margin-top: 1rem;
        padding-top: 1rem;
        border-top: 1px solid var(--color-border);
      }
    `,
  ],
})
export class DialogComponent {
  @Input() title = '';
  @Input() cancelText = '取消';
  @Input() confirmText = '确定';
  @Input() confirmVariant: 'primary' | 'danger' | 'outline' | 'ghost' | 'secondary' = 'primary';
  @Input() closeOnOverlayClick = true;
  @Input() customFooter = false;

  @Output() cancelEvent = new EventEmitter<void>();
  @Output() confirmEvent = new EventEmitter<void>();

  onBackdropClick() {
    if (this.closeOnOverlayClick) {
      this.onCancel();
    }
  }

  close() {
    this.onCancel();
  }

  onCancel() {
    this.cancelEvent.emit();
  }

  onConfirm() {
    this.confirmEvent.emit();
  }
}
