import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface TableColumn {
    key: string;
    label: string;
    width?: string;
    sortable?: boolean;
}

export interface TableAction {
    label: string;
    icon?: string;
    type?: 'primary' | 'danger' | 'default';
    handler: (row: any) => void;
}

@Component({
    selector: 'lib-data-table',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            @for (column of columns; track column.key) {
              <th [style.width]="column.width">
                {{ column.label }}
              </th>
            }
            @if (actions && actions.length > 0) {
              <th class="actions-column">操作</th>
            }
          </tr>
        </thead>
        <tbody>
          @if (data && data.length > 0) {
            @for (row of data; track row[rowKey || 'id']) {
              <tr>
                @for (column of columns; track column.key) {
                  <td>{{ row[column.key] }}</td>
                }
                @if (actions && actions.length > 0) {
                  <td class="actions-cell">
                    @for (action of actions; track action.label) {
                      <button 
                        class="action-btn"
                        [class.btn-primary]="action.type === 'primary'"
                        [class.btn-danger]="action.type === 'danger'"
                        (click)="action.handler(row)">
                        @if (action.icon) {
                          <span [innerHTML]="action.icon"></span>
                        }
                        {{ action.label }}
                      </button>
                    }
                  </td>
                }
              </tr>
            }
          } @else {
            <tr>
              <td [attr.colspan]="columns.length + (actions?.length ? 1 : 0)" class="empty-cell">
                暂无数据
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
    styles: [`
    .table-container {
      overflow-x: auto;
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: 8px;
    }

    .data-table {
      width: 100%;
      border-collapse: collapse;
    }

    thead {
      background: var(--color-surfaceHover);
    }

    th {
      padding: 1rem;
      text-align: left;
      font-weight: 600;
      color: var(--color-text);
      border-bottom: 2px solid var(--color-border);
      font-size: 0.9rem;
    }

    td {
      padding: 1rem;
      color: var(--color-text);
      border-bottom: 1px solid var(--color-border);
    }

    tbody tr:hover {
      background: var(--color-surfaceHover);
    }

    tbody tr:last-child td {
      border-bottom: none;
    }

    .actions-column {
      width: 200px;
      text-align: center;
    }

    .actions-cell {
      display: flex;
      gap: 0.5rem;
      justify-content: center;
    }

    .action-btn {
      padding: 0.4rem 0.8rem;
      border: 1px solid var(--color-border);
      border-radius: 4px;
      background: var(--color-surface);
      color: var(--color-text);
      cursor: pointer;
      transition: all 0.2s;
      font-size: 0.85rem;
      display: flex;
      align-items: center;
      gap: 0.3rem;
    }

    .action-btn:hover {
      background: var(--color-surfaceHover);
    }

    .action-btn.btn-primary {
      background: var(--color-primary);
      color: white;
      border-color: var(--color-primary);
    }

    .action-btn.btn-primary:hover {
      background: var(--color-primaryLight);
    }

    .action-btn.btn-danger {
      background: #dc3545;
      color: white;
      border-color: #dc3545;
    }

    .action-btn.btn-danger:hover {
      background: #c82333;
    }

    .empty-cell {
      text-align: center;
      padding: 3rem;
      color: var(--color-textSecondary);
      font-style: italic;
    }
  `]
})
export class DataTableComponent {
    @Input() columns: TableColumn[] = [];
    @Input() data: any[] = [];
    @Input() actions?: TableAction[];
    @Input() rowKey?: string;
}
