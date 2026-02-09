import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormGroup } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { debounceTime } from 'rxjs';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { DialogService } from 'primeng/dynamicdialog';

import { UsersService } from '../../services/users.service';
import { UsersFieldsService } from '../../services/users-fields.service';
import { User } from '../../../../core/interfaces/user.interface';
import { Pagination } from '../../../../core/interfaces/pagination.interface';
import { PAGINATION_DEFAULTS, DEBOUNCE_TIME } from '../../../../core/constants';
import { ToastService } from '../../../../core/services/toast.service';
import { ConfirmService } from '../../../../core/services/confirm.service';
import { ContentLayoutComponent } from '../../../../shared/content-layout.component';
import { FilterFormComponent } from '../../../../shared/filter-form.component';
import { TableComponent } from '../../../../shared/table/table.component';
import { UserFormModalComponent } from '../../components/user-form-modal/user-form-modal.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-all-users',
  standalone: true,
  imports: [
    ConfirmPopupModule,
    ContentLayoutComponent,
    FilterFormComponent,
    TableComponent,
    TranslateModule,
  ],
  providers: [DialogService],
  templateUrl: './all-users.component.html',
})
export class AllUsersComponent implements OnInit {
  private usersService = inject(UsersService);
  private fieldsService = inject(UsersFieldsService);
  private dialogService = inject(DialogService);
  private toastService = inject(ToastService);
  private confirmService = inject(ConfirmService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);

  loading = signal(false);
  data = signal<User[]>([]);
  pagination = signal<Pagination | null>(null);

  filterForm!: FormGroup;
  tableHeaders = this.fieldsService.tableHeaders;
  filterFields = this.fieldsService.filterFields;

  currentPage = PAGINATION_DEFAULTS.page;
  perPage = PAGINATION_DEFAULTS.perPage;
  currentSort = { field: '', direction: '' };

  ngOnInit(): void {
    const queryParams = this.route.snapshot.queryParams;
    this.currentPage = queryParams['page']
      ? +queryParams['page']
      : PAGINATION_DEFAULTS.page;
    this.perPage = queryParams['rows']
      ? +queryParams['rows']
      : PAGINATION_DEFAULTS.perPage;

    this.filterForm = this.fieldsService.createFilterForm();

    this.filterForm.valueChanges
      .pipe(debounceTime(DEBOUNCE_TIME), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.currentPage = 1;
        this.getData();
      });

    this.getData();
  }

  getData(): void {
    this.loading.set(true);
    this.updateUrlParams();

    const filters = this.filterForm.getRawValue();
    const queryForm: Record<string, unknown> = { ...filters };

    if (filters.dateRangeFrom instanceof Date) {
      queryForm['dateRangeFrom'] = this.formatDate(filters.dateRangeFrom);
    }
    if (filters.dateRangeTo instanceof Date) {
      queryForm['dateRangeTo'] = this.formatDate(filters.dateRangeTo);
    }

    if (this.currentSort.field && this.currentSort.direction) {
      queryForm['sort'] = this.currentSort.field;
      queryForm['order'] = this.currentSort.direction;
    }

    this.usersService
      .getAll(this.currentPage, this.perPage, queryForm)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.data.set(res.data);
          this.pagination.set(res.pagination);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
        },
      });
  }

  onAdd(): void {
    const ref = this.dialogService.open(UserFormModalComponent, {
      header: 'Add User',
      width: '600px',
      contentStyle: { overflow: 'auto' },
      data: { mode: 'add' },
    });

    ref?.onClose
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        if (result) {
          this.getData();
        }
      });
  }

  onEdit(event: { id: number }): void {
    const ref = this.dialogService.open(UserFormModalComponent, {
      header: 'Edit User',
      width: '600px',
      contentStyle: { overflow: 'auto' },
      data: { mode: 'edit', entityId: event.id },
    });

    ref?.onClose
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        if (result) {
          this.getData();
        }
      });
  }

  onPreview(event: { id: number }): void {
    this.router.navigate(['/users', event.id]);
  }

  onDelete(event: { id: number; event: Event }): void {
    this.confirmService.confirm(event.event, {
      accept: () => {
        this.usersService
          .delete(event.id)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: (res) => {
              this.toastService.addSuccess({ detail: res.message });
              this.getData();
            },
            error: (err) => {
              this.toastService.addError({
                detail: err.error?.message || 'Delete failed',
              });
            },
          });
      },
    });
  }

  onSort(event: { field: string; direction: string }): void {
    this.currentSort = event;
    this.currentPage = 1;
    this.getData();
  }

  onPageChange(event: { page: number; rows: number }): void {
    this.currentPage = event.page;
    this.perPage = event.rows;
    this.getData();
  }

  private updateUrlParams(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page: this.currentPage, rows: this.perPage },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  private formatDate(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      '0'
    )}-${String(date.getDate()).padStart(2, '0')}`;
  }
}
