import { Component, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { TranslatePipe } from '@ngx-translate/core';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';

import { CarsService } from '../../services/cars.service';
import { CarsFieldsService } from '../../services/cars-fields.service';
import { ToastService } from '../../../../core/services/toast.service';
import { FieldErrorsComponent } from '../../../../shared/field-errors.component';
import { FormActionsComponent } from '../../../../shared/form-actions.component';

@Component({
  selector: 'app-car-form-modal',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    InputNumberModule,
    DatePickerModule,
    SelectModule,
    TranslatePipe,
    FieldErrorsComponent,
    FormActionsComponent,
  ],
  templateUrl: './car-form-modal.component.html',
})
export class CarFormModalComponent implements OnInit {
  private carsService = inject(CarsService);
  private fieldsService = inject(CarsFieldsService);
  private toastService = inject(ToastService);

  form!: FormGroup;
  mode: 'add' | 'edit' = 'add';
  loading = signal(false);

  get fuelTypeOptions() {
    return this.fieldsService.getFuelTypeOptions();
  }

  get bodyTypeOptions() {
    return this.fieldsService.getBodyTypeOptions();
  }

  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
  ) {}

  ngOnInit(): void {
    this.mode = this.config.data?.mode || 'add';

    if (this.mode === 'add') {
      this.form = this.fieldsService.createMainForm();
    } else {
      this.form = this.fieldsService.createEditForm();
      this.loadCar();
    }
  }

  private loadCar(): void {
    const id = this.config.data?.entityId;
    if (!id) return;

    this.loading.set(true);
    this.carsService.getOne(id).subscribe({
      next: (res) => {
        const car = res.data;
        this.form.patchValue({
          userId: car.userId,
          brand: car.brand,
          model: car.model,
          year: car.year,
          fuelType: car.fuelType,
          engineCode: car.engineCode,
          transmissionCode: car.transmissionCode,
          vinNumber: car.vinNumber,
          color: car.color,
          bodyType: car.bodyType,
          mileage: car.mileage,
          registrationDate: car.registrationDate
            ? new Date(car.registrationDate)
            : null,
        });
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.ref.close(false);
      },
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const formValue = this.form.getRawValue();

    if (formValue.registrationDate instanceof Date) {
      const d = formValue.registrationDate as Date;
      formValue.registrationDate = `${d.getFullYear()}-${String(
        d.getMonth() + 1,
      ).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }

    if (this.mode === 'add') {
      this.carsService.create(formValue).subscribe({
        next: (res) => {
          this.toastService.addSuccess({ detail: res.message });
          this.loading.set(false);
          this.ref.close(true);
        },
        error: (err) => {
          this.toastService.addError({
            detail: err.error?.message || 'Failed to create car',
          });
          this.loading.set(false);
        },
      });
    } else {
      const id = this.config.data?.entityId;
      this.carsService.update(id, formValue).subscribe({
        next: (res) => {
          this.toastService.addSuccess({ detail: res.message });
          this.loading.set(false);
          this.ref.close(true);
        },
        error: (err) => {
          this.toastService.addError({
            detail: err.error?.message || 'Failed to update car',
          });
          this.loading.set(false);
        },
      });
    }
  }

  onCancel(): void {
    this.ref.close(false);
  }
}
