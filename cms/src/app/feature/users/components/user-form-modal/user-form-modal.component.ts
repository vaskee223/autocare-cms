import { Component, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { DatePickerModule } from 'primeng/datepicker';
import { ButtonModule } from 'primeng/button';
import { TranslatePipe } from '@ngx-translate/core';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';

import { UsersService } from '../../services/users.service';
import { UsersFieldsService } from '../../services/users-fields.service';
import { ToastService } from '../../../../core/services/toast.service';
import { FieldErrorsComponent } from '../../../../shared/field-errors.component';
import { FormActionsComponent } from '../../../../shared/form-actions.component';

@Component({
  selector: 'app-user-form-modal',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    PasswordModule,
    DatePickerModule,
    TranslatePipe,
    FieldErrorsComponent,
    FormActionsComponent,
  ],
  templateUrl: './user-form-modal.component.html',
})
export class UserFormModalComponent implements OnInit {
  private usersService = inject(UsersService);
  private fieldsService = inject(UsersFieldsService);
  private toastService = inject(ToastService);

  form!: FormGroup;
  mode: 'add' | 'edit' = 'add';
  loading = signal(false);

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
      this.loadUser();
    }
  }

  private loadUser(): void {
    const id = this.config.data?.entityId;
    if (!id) return;

    this.loading.set(true);
    this.usersService.getOne(id).subscribe({
      next: (res) => {
        const user = res.data;
        this.form.patchValue({
          firstName: user.firstName,
          lastName: user.lastName,
          dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth) : null,
          email: user.email,
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

    if (formValue.dateOfBirth instanceof Date) {
      const d = formValue.dateOfBirth as Date;
      formValue.dateOfBirth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }

    if (this.mode === 'add') {
      this.usersService.create(formValue).subscribe({
        next: (res) => {
          this.toastService.addSuccess({ detail: res.message });
          this.loading.set(false);
          this.ref.close(true);
        },
        error: (err) => {
          this.toastService.addError({
            detail: err.error?.message || 'Failed to create user',
          });
          this.loading.set(false);
        },
      });
    } else {
      const id = this.config.data?.entityId;
      this.usersService.update(id, formValue).subscribe({
        next: (res) => {
          this.toastService.addSuccess({ detail: res.message });
          this.loading.set(false);
          this.ref.close(true);
        },
        error: (err) => {
          this.toastService.addError({
            detail: err.error?.message || 'Failed to update user',
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
