import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface TreeNode {
  id: string;
  label: string;
  children?: TreeNode[];
  expanded?: boolean;
  data?: unknown;
  isLeaf?: boolean;
  count?: number;
}

@Component({
  selector: 'lib-tree',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="tree">
      @for (node of nodes; track node.id) {
        <div class="tree-node">
          <!-- Parent Node -->
          @if (!node.isLeaf && node.children && node.children.length > 0) {
            <div
              class="node-content parent"
              (click)="toggle(node)"
              (keydown.enter)="toggle(node)"
              tabindex="0"
              role="button"
            >
              <span class="arrow" [class.expanded]="node.expanded">▶</span>
              <span class="label">{{ node.label }}</span>
              @if (node.count !== undefined) {
                <span class="count">{{ node.count }}</span>
              }
            </div>

            @if (node.expanded) {
              <div class="children">
                <lib-tree
                  [nodes]="node.children || []"
                  [activeId]="activeId"
                  (nodeClick)="onChildClick($event)"
                ></lib-tree>
              </div>
            }
          } @else {
            <!-- Leaf Node -->
            <div
              class="node-content leaf"
              [class.active]="activeId === node.id"
              (click)="select(node)"
              (keydown.enter)="select(node)"
              tabindex="0"
              role="button"
            >
              <span class="label">{{ node.label }}</span>
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
      }

      .tree {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .node-content {
        display: flex;
        align-items: center;
        padding: 0.4rem 0.6rem;
        cursor: pointer;
        border-radius: 4px;
        color: var(--color-textSecondary, #6b7280);
        font-size: 0.9rem;
        transition: all 0.2s;
        border-left: 2px solid transparent;
      }

      .node-content:hover {
        background: var(--color-surfaceHover, #f3f4f6);
        color: var(--color-text, #111827);
      }

      .node-content.parent {
        font-weight: 500;
      }

      .node-content.leaf {
        font-size: 0.85rem;
        padding-left: 1.5rem; /* Indent leaf nodes if they are at root, but usually they are in children div */
      }

      /* If leaf is inside children div, the div handles indentation. 
       But here we are recursive. The 'children' div has padding. */
      .children {
        padding-left: 1rem;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      /* Active State */
      .node-content.active {
        background: var(--color-primaryLight, #eff6ff);
        color: var(--color-primary, #2563eb);
        border-left-color: var(--color-primary, #2563eb);
        font-weight: 500;
        /* Override hover for active */
        background-color: rgba(var(--color-primary-rgb), 0.1);
      }
      /* Since we use hex vars, we can't easily use rgba. 
       Let's just use a lighter background or the surfaceHover. */

      .arrow {
        font-size: 0.7rem;
        margin-right: 0.5rem;
        transition: transform 0.2s;
        color: var(--color-textSecondary, #9ca3af);
        display: inline-block;
        width: 12px;
        text-align: center;
      }

      .arrow.expanded {
        transform: rotate(90deg);
      }

      .label {
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .count {
        font-size: 0.75rem;
        color: var(--color-textSecondary, #9ca3af);
        background: var(--color-surfaceHover, #f3f4f6);
        padding: 1px 6px;
        border-radius: 10px;
        margin-left: 0.5rem;
      }
    `,
  ],
})
export class TreeComponent {
  @Input() nodes: TreeNode[] = [];
  @Input() activeId: string | null = null;
  @Output() nodeClick = new EventEmitter<TreeNode>();
  @Output() nodeToggle = new EventEmitter<TreeNode>();

  toggle(node: TreeNode) {
    node.expanded = !node.expanded;
    this.nodeToggle.emit(node);
  }

  select(node: TreeNode) {
    this.nodeClick.emit(node);
  }

  onChildClick(node: TreeNode) {
    this.nodeClick.emit(node);
  }
}
