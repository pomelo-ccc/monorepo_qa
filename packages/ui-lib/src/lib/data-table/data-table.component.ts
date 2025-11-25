import { Component, Input, OnChanges, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgGridAngular, ICellRendererAngularComp } from 'ag-grid-angular';
import { ColDef, ModuleRegistry, AllCommunityModule, ICellRendererParams } from 'ag-grid-community';
import { ButtonComponent } from '../button/button.component';

// Register all community modules
ModuleRegistry.registerModules([AllCommunityModule]);

export interface TableColumn {
  key: string;
  label: string;
  width?: string | number;
  sortable?: boolean;
  filter?: boolean;
}

export interface TableAction {
  label: string;
  icon?: string;
  type?: 'primary' | 'danger' | 'default';
  handler: (row: any) => void;
}

@Component({
  selector: 'lib-action-cell-renderer',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  template: `
    <div class="actions-cell">
      @for (action of actions; track action.label) {
        <lib-button [variant]="getVariant(action.type)" size="sm" (click)="onClick($event, action)">
          @if (action.icon) {
            <span [innerHTML]="action.icon"></span>
          }
          {{ action.label }}
        </lib-button>
      }
    </div>
  `,
  styles: [
    `
      .actions-cell {
        display: flex;
        gap: 0.5rem;
        align-items: center;
        height: 100%;
      }
    `,
  ],
})
export class ActionCellRendererComponent implements ICellRendererAngularComp {
  params!: ICellRendererParams;
  actions: TableAction[] = [];

  agInit(params: ICellRendererParams): void {
    this.params = params;
    this.actions = (params as any).actions || [];
  }

  refresh(params: ICellRendererParams): boolean {
    this.params = params;
    this.actions = (params as any).actions || [];
    return true;
  }

  onClick(event: Event, action: TableAction) {
    event.stopPropagation();
    if (action.handler) {
      action.handler(this.params.data);
    }
  }

  getVariant(type?: string): 'primary' | 'danger' | 'outline' {
    if (type === 'primary') return 'primary';
    if (type === 'danger') return 'danger';
    return 'outline';
  }
}

@Component({
  selector: 'lib-data-table',
  standalone: true,
  imports: [CommonModule, AgGridAngular],
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="table-container">
      <ag-grid-angular
        style="width: 100%; height: 100%;"
        [rowData]="data"
        [columnDefs]="columnDefs"
        [defaultColDef]="defaultColDef"
        [pagination]="pagination"
        [paginationPageSize]="10"
        [domLayout]="'autoHeight'"
        class="ag-theme-quartz"
      >
      </ag-grid-angular>
    </div>
  `,
  styles: [
    `
      .table-container {
        width: 100%;
        --ag-background-color: var(--color-surface, #fff);
        --ag-foreground-color: var(--color-text, #333);
        --ag-header-background-color: var(--color-background, #f8fafc);
        --ag-row-hover-color: var(--color-surfaceHover, #f1f5f9);
        --ag-border-color: var(--color-border, #e2e8f0);
        --ag-header-foreground-color: var(--color-textSecondary, #64748b);
        --ag-row-border-color: var(--color-border, #e2e8f0);
        --ag-input-focus-border-color: var(--color-primary, #3b82f6);
        --ag-range-selection-border-color: var(--color-primary, #3b82f6);
        --ag-selected-row-background-color: rgba(59, 130, 246, 0.1);
      }

      .ag-theme-quartz {
        font-family: inherit;
      }

      .ag-theme-quartz .ag-header-cell-label {
        font-weight: 600;
      }

      .ag-theme-quartz .ag-cell {
        display: flex;
        align-items: center;
        font-size: 0.9rem;
      }

      /* Hide pagination border if needed */
      .ag-theme-quartz .ag-paging-panel {
        border-top: 1px solid var(--ag-border-color);
      }
    `,
  ],
})
export class DataTableComponent implements OnChanges {
  @Input() columns: TableColumn[] = [];
  @Input() data: any[] = [];
  @Input() actions?: TableAction[];
  @Input() rowKey?: string;
  @Input() pagination = true;

  columnDefs: ColDef[] = [];

  defaultColDef: ColDef = {
    sortable: true,
    filter: true,
    resizable: true,
    flex: 1,
    minWidth: 100,
  };

  ngOnChanges(changes: SimpleChanges) {
    if (changes['columns'] || changes['actions']) {
      this.updateColumnDefs();
    }
  }

  private updateColumnDefs() {
    const cols: ColDef[] = this.columns.map((col) => {
      let width: number | undefined;
      if (typeof col.width === 'number') {
        width = col.width;
      } else if (typeof col.width === 'string') {
        width = parseInt(col.width, 10);
      }

      return {
        field: col.key,
        headerName: col.label,
        width: width,
        sortable: col.sortable !== false,
        filter: col.filter !== false,
      };
    });

    if (this.actions && this.actions.length > 0) {
      cols.push({
        headerName: '操作',
        field: 'actions',
        cellRenderer: ActionCellRendererComponent,
        cellRendererParams: {
          actions: this.actions,
        },
        sortable: false,
        filter: false,
        pinned: 'right',
        width: 200,
        flex: 0,
      });
    }

    this.columnDefs = cols;
  }
}
