import {
  Component,
  input,
  output,
  contentChildren,
  computed,
} from '@angular/core';
import { DatePipe, NgTemplateOutlet } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { TranslatePipe } from '@ngx-translate/core';

import { TableHeader } from '../../core/interfaces/table-header.interface';
import { Pagination } from '../../core/interfaces/pagination.interface';
import { PaginatorComponent } from '../paginator.component';
import { ColumnTableDirective } from './column-table.directive';

interface TableOptions {
  showEdit?: boolean;
  showDelete?: boolean;
  showPreview?: boolean;
}

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [
    TableModule,
    ButtonModule,
    SkeletonModule,
    TranslatePipe,
    DatePipe,
    NgTemplateOutlet,
    PaginatorComponent,
  ],
  templateUrl: './table.component.html',
})
export class TableComponent {
  tableHeader = input<TableHeader[]>([]);
  tableData = input<unknown[]>([]);
  pagination = input<Pagination | null>(null);
  loading = input(false);
  options = input<TableOptions>({
    showEdit: false,
    showDelete: true,
    showPreview: true,
  });

  handlePageChange = output<{ page: number; rows: number }>();
  handleDelete = output<{ id: number; event: Event }>();
  handleEdit = output<{ id: number }>();
  handlePreview = output<{ id: number }>();
  handleSort = output<{ field: string; direction: string }>();

  columnTemplates = contentChildren(ColumnTableDirective);

  skeletonRows = computed(() => {
    const rows = this.pagination()?.per_page ?? 10;
    return Array.from({ length: rows }, (_, i) => i);
  });

  getColumnTemplate(field: string): ColumnTableDirective | undefined {
    return this.columnTemplates().find((t) => t.appColumnTemplate() === field);
  }

  onSort(header: TableHeader): void {
    if (!header.sort) return;

    const headers = this.tableHeader();
    headers.forEach((h) => {
      if (h.sort && h !== header) {
        h.sort.activeSort = false;
        h.sort.sortDirection = '';
      }
    });

    if (!header.sort.activeSort || header.sort.sortDirection === '') {
      header.sort.activeSort = true;
      header.sort.sortDirection = 'asc';
    } else if (header.sort.sortDirection === 'asc') {
      header.sort.sortDirection = 'desc';
    } else {
      header.sort.activeSort = false;
      header.sort.sortDirection = '';
    }

    this.handleSort.emit({
      field: header.sort.sortParam,
      direction: header.sort.sortDirection,
    });
  }

  onPageChange(event: { page: number; rows: number }): void {
    this.handlePageChange.emit(event);
  }

  onDelete(event: Event, id: number): void {
    this.handleDelete.emit({ id, event });
  }

  onPreview(id: number): void {
    this.handlePreview.emit({ id });
  }

  onEdit(id: number): void {
    this.handleEdit.emit({ id });
  }
}
