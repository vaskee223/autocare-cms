import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { FormSkeletonComponent } from '../../../../shared/form-skeleton.component';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { TranslatePipe } from '@ngx-translate/core';
import { DialogService } from 'primeng/dynamicdialog';

import { CarsService } from '../../services/cars.service';
import { CarsFieldsService } from '../../services/cars-fields.service';
import { MaintenancesFieldsService } from '../../../maintenances/services/maintenances-fields.service';
import { FuelConsumptionsFieldsService } from '../../../fuel-consumptions/services/fuel-consumptions-fields.service';
import { MaintenancesService } from '../../../maintenances/services/maintenances.service';
import { FuelConsumptionsService } from '../../../fuel-consumptions/services/fuel-consumptions.service';
import { Car } from '../../../../core/interfaces/car.interface';
import { Maintenance } from '../../../../core/interfaces/maintenance.interface';
import { FuelConsumption } from '../../../../core/interfaces/fuel-consumption.interface';
import { Pagination } from '../../../../core/interfaces/pagination.interface';
import { PAGINATION_DEFAULTS } from '../../../../core/constants';
import { ToastService } from '../../../../core/services/toast.service';
import { ConfirmService } from '../../../../core/services/confirm.service';
import { FieldErrorsComponent } from '../../../../shared/field-errors.component';
import { TableComponent } from '../../../../shared/table/table.component';
import { ColumnTableDirective } from '../../../../shared/table/column-table.directive';
import { RouterLink } from '@angular/router';
import { MaintenanceFormModalComponent } from '../../../maintenances/components/maintenance-form-modal/maintenance-form-modal.component';
import { FuelConsumptionFormModalComponent } from '../../../fuel-consumptions/components/fuel-consumption-form-modal/fuel-consumption-form-modal.component';
import { PageHeaderComponent } from '../../../../shared/page-header.component';

@Component({
  selector: 'app-single-car',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    InputNumberModule,
    DatePickerModule,
    SelectModule,
    FormSkeletonComponent,
    ConfirmPopupModule,
    TranslatePipe,
    FieldErrorsComponent,
    TableComponent,
    ColumnTableDirective,
    PageHeaderComponent,
    RouterLink,
    ButtonModule,
  ],
  providers: [DialogService],
  templateUrl: './single-car.component.html',
})
export class SingleCarComponent implements OnInit {
  private carsService = inject(CarsService);
  private fieldsService = inject(CarsFieldsService);
  private maintenancesFieldsService = inject(MaintenancesFieldsService);
  private fuelConsumptionsFieldsService = inject(FuelConsumptionsFieldsService);
  private maintenancesService = inject(MaintenancesService);
  private fuelConsumptionsService = inject(FuelConsumptionsService);
  private dialogService = inject(DialogService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toastService = inject(ToastService);
  private confirmService = inject(ConfirmService);
  private destroyRef = inject(DestroyRef);

  loading = signal(true);
  saving = signal(false);
  car = signal<Car | null>(null);
  form!: FormGroup;
  carId!: string;

  get fuelTypeOptions() {
    return this.fieldsService.getFuelTypeOptions();
  }

  get bodyTypeOptions() {
    return this.fieldsService.getBodyTypeOptions();
  }

  // Maintenances nested table
  maintenancesLoading = signal(false);
  maintenancesData = signal<Maintenance[]>([]);
  maintenancesPagination = signal<Pagination | null>(null);
  maintenancesTableHeaders = this.maintenancesFieldsService.nestedTableHeaders;
  maintenancesPage = PAGINATION_DEFAULTS.page;
  maintenancesPerPage = PAGINATION_DEFAULTS.perPage;

  // Fuel consumptions nested table
  fuelConsumptionsLoading = signal(false);
  fuelConsumptionsData = signal<FuelConsumption[]>([]);
  fuelConsumptionsPagination = signal<Pagination | null>(null);
  fuelConsumptionsTableHeaders =
    this.fuelConsumptionsFieldsService.nestedTableHeaders;
  fuelConsumptionsPage = PAGINATION_DEFAULTS.page;
  fuelConsumptionsPerPage = PAGINATION_DEFAULTS.perPage;

  ngOnInit(): void {
    this.carId = this.route.snapshot.params['id'];
    this.form = this.fieldsService.createEditForm();
    this.loadCar();
    this.loadMaintenances();
    this.loadFuelConsumptions();
  }

  private loadCar(): void {
    this.loading.set(true);
    this.carsService
      .getOne(this.carId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.car.set(res.data);
          this.form.patchValue({
            userId: res.data.userId,
            brand: res.data.brand,
            model: res.data.model,
            year: res.data.year,
            fuelType: res.data.fuelType,
            engineCode: res.data.engineCode,
            transmissionCode: res.data.transmissionCode,
            vinNumber: res.data.vinNumber,
            color: res.data.color,
            bodyType: res.data.bodyType,
            mileage: res.data.mileage,
            registrationDate: res.data.registrationDate
              ? new Date(res.data.registrationDate)
              : null,
          });
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          this.router.navigate(['/cars']);
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

    if (formValue.registrationDate instanceof Date) {
      const d = formValue.registrationDate as Date;
      formValue.registrationDate = `${d.getFullYear()}-${String(
        d.getMonth() + 1
      ).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }

    this.carsService
      .update(this.carId, formValue)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.toastService.addSuccess({ detail: res.message });
          this.saving.set(false);
          this.loadCar();
        },
        error: (err) => {
          this.toastService.addError({
            detail: err.error?.message || 'Update failed',
          });
          this.saving.set(false);
        },
      });
  }

  // --- Maintenances ---

  loadMaintenances(): void {
    this.maintenancesLoading.set(true);
    this.carsService
      .getCarMaintenances(
        this.carId,
        this.maintenancesPage,
        this.maintenancesPerPage,
        {}
      )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.maintenancesData.set(res.data);
          this.maintenancesPagination.set(res.pagination);
          this.maintenancesLoading.set(false);
        },
        error: () => {
          this.maintenancesLoading.set(false);
        },
      });
  }

  onAddMaintenance(): void {
    const ref = this.dialogService.open(MaintenanceFormModalComponent, {
      header: 'Add Maintenance',
      width: '700px',
      contentStyle: { overflow: 'auto' },
      data: { mode: 'add', carId: +this.carId },
    });

    ref?.onClose
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        if (result) {
          this.loadMaintenances();
        }
      });
  }

  onMaintenancePreview(event: { id: number }): void {
    this.router.navigate(['/maintenances', event.id]);
  }

  onMaintenanceDelete(event: { id: number; event: Event }): void {
    this.confirmService.confirm(event.event, {
      accept: () => {
        this.maintenancesService
          .delete(event.id)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: (res) => {
              this.toastService.addSuccess({ detail: res.message });
              this.loadMaintenances();
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

  onMaintenancesPageChange(event: { page: number; rows: number }): void {
    this.maintenancesPage = event.page;
    this.maintenancesPerPage = event.rows;
    this.loadMaintenances();
  }

  // --- Fuel Consumptions ---

  loadFuelConsumptions(): void {
    this.fuelConsumptionsLoading.set(true);
    this.carsService
      .getCarFuelConsumptions(
        this.carId,
        this.fuelConsumptionsPage,
        this.fuelConsumptionsPerPage,
        {}
      )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.fuelConsumptionsData.set(res.data);
          this.fuelConsumptionsPagination.set(res.pagination);
          this.fuelConsumptionsLoading.set(false);
        },
        error: () => {
          this.fuelConsumptionsLoading.set(false);
        },
      });
  }

  onAddFuelConsumption(): void {
    const ref = this.dialogService.open(FuelConsumptionFormModalComponent, {
      header: 'Add Fuel Consumption',
      width: '600px',
      contentStyle: { overflow: 'auto' },
      data: { mode: 'add', carId: +this.carId },
    });

    ref?.onClose
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        if (result) {
          this.loadFuelConsumptions();
        }
      });
  }

  onFuelConsumptionPreview(event: { id: number }): void {
    this.router.navigate(['/fuel-consumptions', event.id]);
  }

  onFuelConsumptionDelete(event: { id: number; event: Event }): void {
    this.confirmService.confirm(event.event, {
      accept: () => {
        this.fuelConsumptionsService
          .delete(event.id)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: (res) => {
              this.toastService.addSuccess({ detail: res.message });
              this.loadFuelConsumptions();
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

  onFuelConsumptionsPageChange(event: { page: number; rows: number }): void {
    this.fuelConsumptionsPage = event.page;
    this.fuelConsumptionsPerPage = event.rows;
    this.loadFuelConsumptions();
  }
}
