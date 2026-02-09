import { Component, input, output } from '@angular/core';
import { PaginatorModule } from 'primeng/paginator';

import { Pagination } from '../core/interfaces/pagination.interface';

interface PageChangeEvent {
  page: number;
  rows: number;
}

@Component({
  selector: 'app-paginator',
  standalone: true,
  imports: [PaginatorModule],
  template: `
    @if (pagination(); as pag) {
      <p-paginator
        [rows]="pag.per_page"
        [totalRecords]="pag.total"
        [first]="(pag.current_page - 1) * pag.per_page"
        [rowsPerPageOptions]="[5, 10, 25, 50]"
        (onPageChange)="onPageChange($event)"
      />
    }
  `,
})
export class PaginatorComponent {
  pagination = input<Pagination | null>(null);
  pageChange = output<PageChangeEvent>();

  onPageChange(event: { first?: number; rows?: number; page?: number }): void {
    this.pageChange.emit({
      page: (event.page ?? 0) + 1,
      rows: event.rows ?? 10,
    });
  }
}
