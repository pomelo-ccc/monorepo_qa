import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type CardVariant = 'default' | 'warning' | 'success' | 'info';

@Component({
  selector: 'lib-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card">
      @if (title || hasHeader) {
        <div class="card-header" [ngClass]="variant">
          <div class="header-left">
            <ng-content select="[header-icon]"></ng-content>
            @if (title) {
              <h3 class="card-title">{{ title }}</h3>
            }
            <ng-content select="[header-title]"></ng-content>
          </div>
          <div class="header-right">
            <ng-content select="[header-extra]"></ng-content>
          </div>
        </div>
      }

      <div class="card-body" [class.no-padding]="noPadding">
        <ng-content></ng-content>
      </div>

      @if (hasFooter) {
        <div class="card-footer">
          <ng-content select="[footer]"></ng-content>
        </div>
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      :host-context(.full-height-card) {
        height: 100%;
      }

      :host-context(.full-height-card) .card {
        height: 100%;
        display: flex;
        flex-direction: column;
      }

      :host-context(.full-height-card) .card-body {
        flex: 1;
        min-height: 0;
        overflow: hidden;
        display: flex;
        flex-direction: column;
      }

      .card {
        background: var(--color-surface, #fff);
        border-radius: 16px;
        overflow: hidden;
        box-shadow: var(--color-cardShadow, 0 1px 3px rgba(0, 0, 0, 0.05));
        border: 1px solid var(--color-border, transparent);
        border-top-color: var(--color-glassBorderTop, var(--color-border, transparent));
        border-bottom-color: var(--color-glassBorderBottom, var(--color-border, transparent));
        transition: all 0.3s ease;
        backdrop-filter: blur(var(--color-glassBlur, 0px));
        -webkit-backdrop-filter: blur(var(--color-glassBlur, 0px));
        position: relative;
      }

      /* 玻璃反射效果 */
      .card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 50%;
        background: var(--color-glassReflection, none);
        pointer-events: none;
        border-radius: 16px 16px 0 0;
      }

      .card:hover {
        transform: translateY(-2px);
        box-shadow:
          var(--color-cardShadow, 0 1px 3px rgba(0, 0, 0, 0.05)),
          0 12px 40px rgba(0, 0, 0, 0.15);
      }

      .card-header {
        padding: 1rem 1.5rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 1px solid var(--color-surfaceHover, #f3f4f6);
        color: var(--color-text);
      }

      .header-left {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }

      .card-title {
        margin: 0;
        font-size: 1rem;
        font-weight: 600;
      }

      /* Variants */
      .card-header.warning {
        color: #f59e0b;
      }
      .card-header.success {
        color: #10b981;
      }
      .card-header.info {
        color: var(--color-accent);
      }

      .card-body {
        padding: 1.5rem;
        color: var(--color-text);
        position: relative;
      }

      .card-body.no-padding {
        padding: 0;
      }

      .card-footer {
        padding: 1rem 1.5rem;
        border-top: 1px solid var(--color-surfaceHover);
      }
    `,
  ],
})
export class CardComponent {
  @Input() title = '';
  @Input() variant: CardVariant = 'default';
  @Input() noPadding = false;

  // Simple check if footer content exists would require ContentChild,
  // but for simplicity we can rely on CSS :empty or just let it be empty.
  // Or user can pass hasFooter=true.
  @Input() hasFooter = false;
  @Input() hasHeader = false; // Force header render if no title
}
