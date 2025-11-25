import { Component, Input, OnChanges, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgGridAngular, ICellRendererAngularComp } from 'ag-grid-angular';
import {
  ColDef,
  ModuleRegistry,
  AllCommunityModule,
  ICellRendererParams,
  themeQuartz,
  iconSetQuartz,
} from 'ag-grid-community';
import { ButtonComponent } from '../button/button.component';

// Register all community modules
ModuleRegistry.registerModules([AllCommunityModule]);

export interface TableColumn {
  key: string;
  label: string;
  width?: string | number;
  sortable?: boolean;
  filter?: boolean;
  formatter?: (value: any) => string;
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
        gap: 0.75rem;
        align-items: center;
        height: 100%;
        padding: 8px 0;
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
        [domLayout]="autoHeight ? 'autoHeight' : 'normal'"
        [theme]="theme"
      >
      </ag-grid-angular>
    </div>
  `,
  styles: [
    `
      .table-container {
        width: 100%;
        border-radius: 12px;
        overflow: hidden;
        box-shadow:
          0 1px 3px 0 rgba(0, 0, 0, 0.1),
          0 1px 2px -1px rgba(0, 0, 0, 0.1);
        background: var(--color-surface);
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
  @Input() autoHeight = true;

  columnDefs: ColDef[] = [];

  defaultColDef: ColDef = {
    sortable: true,
    filter: true,
    resizable: true,
    flex: 1,
    minWidth: 100,
  };

  theme = themeQuartz.withParams({
    spacing: 12,
    accentColor: 'var(--color-primary)',
    backgroundColor: 'var(--color-surface)',
    foregroundColor: 'var(--color-text)',
    headerBackgroundColor: 'var(--color-background)',
    headerTextColor: 'var(--color-text)',
    borderColor: 'var(--color-border)',
    rowHeight: 56,
    headerHeight: 48,
    fontSize: 15,
    cellHorizontalPaddingScale: 1.5,
    headerFontSize: 14,
    headerFontWeight: 600,
    rowHoverColor: 'var(--color-surfaceHover)',
    oddRowBackgroundColor: 'color-mix(in srgb, var(--color-surface) 98%, var(--color-border))',
  });

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
        valueFormatter: col.formatter ? (params) => col.formatter!(params.value) : undefined,
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
        width: 220,
        flex: 0,
      });
    }

    this.columnDefs = cols;
  }
}
