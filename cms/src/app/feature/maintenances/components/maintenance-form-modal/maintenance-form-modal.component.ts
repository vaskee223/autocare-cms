import { Component, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormArray } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { TranslatePipe } from '@ngx-translate/core';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';

import { MaintenancesService } from '../../services/maintenances.service';
import { MaintenancesFieldsService } from '../../services/maintenances-fields.service';
import { ToastService } from '../../../../core/services/toast.service';
import { FieldErrorsComponent } from '../../../../shared/field-errors.component';
import { FormActionsComponent } from '../../../../shared/form-actions.component';

@Component({
  selector: 'app-maintenance-form-modal',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    InputNumberModule,
    DatePickerModule,
    SelectModule,
    ButtonModule,
    TranslatePipe,
    FieldErrorsComponent,
    FormActionsComponent,
  ],
  templateUrl: './maintenance-form-modal.component.html',
})
export class MaintenanceFormModalComponent implements OnInit {
  private maintenancesService = inject(MaintenancesService);
  private fieldsService = inject(MaintenancesFieldsService);
  private toastService = inject(ToastService);

  form!: FormGroup;
  mode: 'add' | 'edit' = 'add';
  loading = signal(false);

  maintenanceNameOptions = this.fieldsService.maintenanceNameOptions;

  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
  ) {}

  ngOnInit(): void {
    this.mode = this.config.data?.mode || 'add';

    if (this.mode === 'add') {
      this.form = this.fieldsService.createMainForm();
      this.form.patchValue({ carId: this.config.data?.carId });
    } else {
      this.form = this.fieldsService.createEditForm();
      this.loadMaintenance();
    }
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
    const id = this.config.data?.entityId;
    if (!id) return;

    this.loading.set(true);
    this.maintenancesService.getOne(id).subscribe({
      next: (res) => {
        const m = res.data;
        this.form.patchValue({
          name: m.name,
          mileage: m.mileage,
          date: m.date ? new Date(m.date) : null,
          servicePrice: m.servicePrice,
        });

        this.replacedParts.clear();
        if (m.replacedParts) {
          for (const part of m.replacedParts) {
            this.replacedParts.push(
              this.fieldsService.createPartGroup(part.name, part.price),
            );
          }
        }

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

    if (formValue.date instanceof Date) {
      const d = formValue.date as Date;
      formValue.date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }

    if (this.mode === 'add') {
      this.maintenancesService.create(formValue).subscribe({
        next: (res) => {
          this.toastService.addSuccess({ detail: res.message });
          this.loading.set(false);
          this.ref.close(true);
        },
        error: (err) => {
          this.toastService.addError({
            detail: err.error?.message || 'Failed to create maintenance',
          });
          this.loading.set(false);
        },
      });
    } else {
      const id = this.config.data?.entityId;
      this.maintenancesService.update(id, formValue).subscribe({
        next: (res) => {
          this.toastService.addSuccess({ detail: res.message });
          this.loading.set(false);
          this.ref.close(true);
        },
        error: (err) => {
          this.toastService.addError({
            detail: err.error?.message || 'Failed to update maintenance',
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
