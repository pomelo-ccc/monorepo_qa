import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'lib-avatar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="avatar"
      [title]="name"
      [style.width.px]="size"
      [style.height.px]="size"
      [style.font-size.px]="size * 0.4"
    >
      @if (src) {
        <img [src]="src" [alt]="name" />
      } @else {
        <span>{{ initials }}</span>
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: inline-block;
      }
      .avatar {
        border-radius: 50%;
        background: var(--color-border, #e5e7eb);
        border: 2px solid var(--color-background, #f5f7fa);
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--color-textSecondary, #6b7280);
        font-weight: 600;
        overflow: hidden;
        box-sizing: border-box;
      }
      .avatar img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    `,
  ],
})
export class AvatarComponent {
  @Input() name = '';
  @Input() src = '';
  @Input() size = 32;

  get initials(): string {
    return this.name ? this.name.slice(0, 2).toUpperCase() : '';
  }
}
