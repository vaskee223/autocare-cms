import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { DatePickerModule } from 'primeng/datepicker';
import { ButtonModule } from 'primeng/button';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { FormSkeletonComponent } from '../../../../shared/form-skeleton.component';
import { TranslatePipe } from '@ngx-translate/core';
import { DialogService } from 'primeng/dynamicdialog';

import { UsersService } from '../../services/users.service';
import { UsersFieldsService } from '../../services/users-fields.service';
import { CarsService } from '../../../cars/services/cars.service';
import { CarsFieldsService } from '../../../cars/services/cars-fields.service';
import { User } from '../../../../core/interfaces/user.interface';
import { Car } from '../../../../core/interfaces/car.interface';
import { Pagination } from '../../../../core/interfaces/pagination.interface';
import { PAGINATION_DEFAULTS } from '../../../../core/constants';
import { ToastService } from '../../../../core/services/toast.service';
import { ConfirmService } from '../../../../core/services/confirm.service';
import { FieldErrorsComponent } from '../../../../shared/field-errors.component';
import { PageHeaderComponent } from '../../../../shared/page-header.component';
import { TableComponent } from '../../../../shared/table/table.component';
import { ColumnTableDirective } from '../../../../shared/table/column-table.directive';
import { CarFormModalComponent } from '../../../cars/components/car-form-modal/car-form-modal.component';

@Component({
  selector: 'app-single-user',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    DatePickerModule,
    FormSkeletonComponent,
    ConfirmPopupModule,
    TranslatePipe,
    FieldErrorsComponent,
    PageHeaderComponent,
    TableComponent,
    ColumnTableDirective,
    RouterLink,
    ButtonModule,
  ],
  providers: [DialogService],
  templateUrl: './single-user.component.html',
})
export class SingleUserComponent implements OnInit {
  private usersService = inject(UsersService);
  private fieldsService = inject(UsersFieldsService);
  private carsService = inject(CarsService);
  private carsFieldsService = inject(CarsFieldsService);
  private dialogService = inject(DialogService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toastService = inject(ToastService);
  private confirmService = inject(ConfirmService);
  private destroyRef = inject(DestroyRef);

  loading = signal(true);
  saving = signal(false);
  user = signal<User | null>(null);
  form!: FormGroup;
  userId!: string;

  carsLoading = signal(false);
  carsData = signal<Car[]>([]);
  carsPagination = signal<Pagination | null>(null);
  carsTableHeaders = this.carsFieldsService.nestedTableHeaders;
  carsPage = PAGINATION_DEFAULTS.page;
  carsPerPage = PAGINATION_DEFAULTS.perPage;

  ngOnInit(): void {
    this.userId = this.route.snapshot.params['id'];
    this.form = this.fieldsService.createEditForm();
    this.loadUser();
    this.loadCars();
  }

  private loadUser(): void {
    this.loading.set(true);
    this.usersService
      .getOne(this.userId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.user.set(res.data);
          this.form.patchValue({
            firstName: res.data.firstName,
            lastName: res.data.lastName,
            dateOfBirth: res.data.dateOfBirth
              ? new Date(res.data.dateOfBirth)
              : null,
            email: res.data.email,
          });
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          this.router.navigate(['/users']);
        },
      });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    const formValue = this.form.getRawValue();

    if (formValue.dateOfBirth instanceof Date) {
      const d = formValue.dateOfBirth as Date;
      formValue.dateOfBirth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }

    this.usersService
      .update(this.userId, formValue)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.toastService.addSuccess({ detail: res.message });
          this.saving.set(false);
          this.loadUser();
        },
        error: (err) => {
          this.toastService.addError({
            detail: err.error?.message || 'Update failed',
          });
          this.saving.set(false);
        },
      });
  }

  loadCars(): void {
    this.carsLoading.set(true);
    this.usersService
      .getUserCars(this.userId, this.carsPage, this.carsPerPage, {})
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.carsData.set(res.data);
          this.carsPagination.set(res.pagination);
          this.carsLoading.set(false);
        },
        error: () => {
          this.carsLoading.set(false);
        },
      });
  }

  onAddCar(): void {
    const ref = this.dialogService.open(CarFormModalComponent, {
      header: 'Add Car',
      width: '700px',
      contentStyle: { overflow: 'auto' },
      data: { mode: 'add', userId: +this.userId },
    });

    ref?.onClose
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        if (result) {
          this.loadCars();
        }
      });
  }

  onCarPreview(event: { id: number }): void {
    this.router.navigate(['/cars', event.id]);
  }

  onCarDelete(event: { id: number; event: Event }): void {
    this.confirmService.confirm(event.event, {
      accept: () => {
        this.carsService
          .delete(event.id)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: (res) => {
              this.toastService.addSuccess({ detail: res.message });
              this.loadCars();
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

  onCarsPageChange(event: { page: number; rows: number }): void {
    this.carsPage = event.page;
    this.carsPerPage = event.rows;
    this.loadCars();
  }
}
