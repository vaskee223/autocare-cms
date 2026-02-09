import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { InputNumberModule } from 'primeng/inputnumber';
import { DatePickerModule } from 'primeng/datepicker';
import { ButtonModule } from 'primeng/button';
import { FormSkeletonComponent } from '../../../../shared/form-skeleton.component';
import { TranslatePipe } from '@ngx-translate/core';
import { DecimalPipe } from '@angular/common';

import { FuelConsumptionsService } from '../../services/fuel-consumptions.service';
import { FuelConsumptionsFieldsService } from '../../services/fuel-consumptions-fields.service';
import { FuelConsumption } from '../../../../core/interfaces/fuel-consumption.interface';
import { ToastService } from '../../../../core/services/toast.service';
import { FieldErrorsComponent } from '../../../../shared/field-errors.component';
import { PageHeaderComponent } from '../../../../shared/page-header.component';

@Component({
  selector: 'app-single-fuel-consumption',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    InputNumberModule,
    DatePickerModule,
    FormSkeletonComponent,
    TranslatePipe,
    DecimalPipe,
    FieldErrorsComponent,
    PageHeaderComponent,
  ],
  templateUrl: './single-fuel-consumption.component.html',
})
export class SingleFuelConsumptionComponent implements OnInit {
  private fuelConsumptionsService = inject(FuelConsumptionsService);
  private fieldsService = inject(FuelConsumptionsFieldsService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toastService = inject(ToastService);
  private destroyRef = inject(DestroyRef);

  loading = signal(true);
  saving = signal(false);
  fuelConsumption = signal<FuelConsumption | null>(null);
  form!: FormGroup;
  fuelConsumptionId!: string;

  ngOnInit(): void {
    this.fuelConsumptionId = this.route.snapshot.params['id'];
    this.form = this.fieldsService.createEditForm();
    this.loadFuelConsumption();
  }

  private loadFuelConsumption(): void {
    this.loading.set(true);
    this.fuelConsumptionsService
      .getOne(this.fuelConsumptionId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.fuelConsumption.set(res.data);
          this.form.patchValue({
            refuelDate: res.data.refuelDate
              ? new Date(res.data.refuelDate)
              : null,
            litersRefueled: res.data.litersRefueled,
            pricePerLiter: res.data.pricePerLiter,
            startMileage: res.data.startMileage,
            emptyDate: res.data.emptyDate ? new Date(res.data.emptyDate) : null,
            endMileage: res.data.endMileage,
          });
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          this.router.navigate(['/fuel-consumptions']);
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

    if (formValue.refuelDate instanceof Date) {
      const d = formValue.refuelDate as Date;
      formValue.refuelDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }
    if (formValue.emptyDate instanceof Date) {
      const d = formValue.emptyDate as Date;
      formValue.emptyDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }

    this.fuelConsumptionsService
      .update(this.fuelConsumptionId, formValue)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.toastService.addSuccess({ detail: res.message });
          this.saving.set(false);
          this.loadFuelConsumption();
        },
        error: (err) => {
          this.toastService.addError({
            detail: err.error?.message || 'Update failed',
          });
          this.saving.set(false);
        },
      });
  }
}
