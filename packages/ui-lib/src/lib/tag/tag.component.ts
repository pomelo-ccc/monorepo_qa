import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'lib-tag',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span
      class="tag"
      [class.selectable]="selectable"
      [class.selected]="selected"
      [style.background-color]="!selected ? bgColor : null"
      [style.color]="!selected ? color : null"
      [style.border-color]="!selected ? borderColor : null"
      (click)="handleClick()"
    >
      <ng-content></ng-content>
    </span>
  `,
  styles: [
    `
      :host {
        display: inline-block;
        vertical-align: middle;
      }
      .tag {
        display: inline-flex;
        align-items: center;
        padding: 4px 12px;
        background: var(--color-surface, #fff);
        border: 1px solid var(--color-border, #e5e7eb);
        border-radius: 16px;
        font-size: 0.85rem;
        color: var(--color-textSecondary, #4b5563);
        white-space: nowrap;
        transition: all 0.2s ease;
        line-height: 1.4;
      }

      .tag.selectable {
        cursor: pointer;
        user-select: none;
      }

      .tag.selectable:hover {
        border-color: var(--color-primary, #4f46e5);
        color: var(--color-primary, #4f46e5);
      }

      .tag.selected {
        background-color: var(--color-primary, #4f46e5);
        color: white;
        border-color: var(--color-primary, #4f46e5);
      }

      .tag.selected:hover {
        opacity: 0.9;
        color: white;
      }
    `,
  ],
})
export class TagComponent {
  @Input() color = '';
  @Input() bgColor = '';
  @Input() borderColor = '';
  @Input() selectable = false;
  @Input() selected = false;
  @Output() selectedChange = new EventEmitter<boolean>();
  @Output() tagClick = new EventEmitter<void>();

  handleClick() {
    if (this.selectable) {
      this.selected = !this.selected;
      this.selectedChange.emit(this.selected);
    }
    this.tagClick.emit();
  }
}
