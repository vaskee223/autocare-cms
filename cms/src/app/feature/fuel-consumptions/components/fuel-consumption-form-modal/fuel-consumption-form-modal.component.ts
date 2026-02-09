import { Component, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
import { DatePickerModule } from 'primeng/datepicker';
import { ButtonModule } from 'primeng/button';
import { TranslatePipe } from '@ngx-translate/core';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';

import { FuelConsumptionsService } from '../../services/fuel-consumptions.service';
import { FuelConsumptionsFieldsService } from '../../services/fuel-consumptions-fields.service';
import { ToastService } from '../../../../core/services/toast.service';
import { FieldErrorsComponent } from '../../../../shared/field-errors.component';

@Component({
  selector: 'app-fuel-consumption-form-modal',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    InputNumberModule,
    DatePickerModule,
    ButtonModule,
    TranslatePipe,
    FieldErrorsComponent,
  ],
  templateUrl: './fuel-consumption-form-modal.component.html',
})
export class FuelConsumptionFormModalComponent implements OnInit {
  private fuelConsumptionsService = inject(FuelConsumptionsService);
  private fieldsService = inject(FuelConsumptionsFieldsService);
  private toastService = inject(ToastService);

  form!: FormGroup;
  loading = signal(false);

  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
  ) {}

  ngOnInit(): void {
    this.form = this.fieldsService.createMainForm();
    this.form.patchValue({ carId: this.config.data?.carId });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const formValue = this.form.getRawValue();

    if (formValue.refuelDate instanceof Date) {
      const d = formValue.refuelDate as Date;
      formValue.refuelDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }

    this.fuelConsumptionsService.create(formValue).subscribe({
      next: (res) => {
        this.toastService.addSuccess({ detail: res.message });
        this.loading.set(false);
        this.ref.close(true);
      },
      error: (err) => {
        this.toastService.addError({
          detail: err.error?.message || 'Failed to create fuel consumption',
        });
        this.loading.set(false);
      },
    });
  }

  onCancel(): void {
    this.ref.close(false);
  }
}
