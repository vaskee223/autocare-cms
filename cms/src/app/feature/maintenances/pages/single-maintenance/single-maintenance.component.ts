import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule, FormGroup, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { FormSkeletonComponent } from '../../../../shared/form-skeleton.component';
import { TranslatePipe } from '@ngx-translate/core';

import { MaintenancesService } from '../../services/maintenances.service';
import { MaintenancesFieldsService } from '../../services/maintenances-fields.service';
import { Maintenance } from '../../../../core/interfaces/maintenance.interface';
import { ToastService } from '../../../../core/services/toast.service';
import { FieldErrorsComponent } from '../../../../shared/field-errors.component';
import { PageHeaderComponent } from '../../../../shared/page-header.component';

@Component({
  selector: 'app-single-maintenance',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    InputNumberModule,
    DatePickerModule,
    SelectModule,
    FormSkeletonComponent,
    TranslatePipe,
    FieldErrorsComponent,
    PageHeaderComponent,
    ButtonModule,
  ],
  templateUrl: './single-maintenance.component.html',
})
export class SingleMaintenanceComponent implements OnInit {
  private maintenancesService = inject(MaintenancesService);
  private fieldsService = inject(MaintenancesFieldsService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toastService = inject(ToastService);
  private destroyRef = inject(DestroyRef);

  loading = signal(true);
  saving = signal(false);
  maintenance = signal<Maintenance | null>(null);
  form!: FormGroup;
  maintenanceId!: string;

  get maintenanceNameOptions() {
    return this.fieldsService.getMaintenanceNameOptions();
  }

  ngOnInit(): void {
    this.maintenanceId = this.route.snapshot.params['id'];
    this.form = this.fieldsService.createEditForm();
    this.loadMaintenance();
  }

  get replacedParts(): FormArray {
    return this.form.get('replacedParts') as FormArray;
  }

  addPart(): void {
    this.replacedParts.push(this.fieldsService.createPartGroup());
  }

  removePart(index: number): void {
    this.replacedParts.removeAt(index);
  }

  private loadMaintenance(): void {
    this.loading.set(true);
    this.maintenancesService
      .getOne(this.maintenanceId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.maintenance.set(res.data);
          this.form.patchValue({
            name: res.data.name,
            mileage: res.data.mileage,
            date: res.data.date ? new Date(res.data.date) : null,
            servicePrice: res.data.servicePrice,
          });

          this.replacedParts.clear();
          if (res.data.replacedParts) {
            for (const part of res.data.replacedParts) {
              this.replacedParts.push(
                this.fieldsService.createPartGroup(part.name, part.price)
              );
            }
          }

          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          this.router.navigate(['/maintenances']);
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

    if (formValue.date instanceof Date) {
      const d = formValue.date as Date;
      formValue.date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
        2,
        '0'
      )}-${String(d.getDate()).padStart(2, '0')}`;
    }

    this.maintenancesService
      .update(this.maintenanceId, formValue)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.toastService.addSuccess({ detail: res.message });
          this.saving.set(false);
          this.loadMaintenance();
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
