import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { DatePickerModule } from 'primeng/datepicker';
import { ButtonModule } from 'primeng/button';
import { FormSkeletonComponent } from '../../../../shared/form-skeleton.component';
import { TranslatePipe } from '@ngx-translate/core';

import { UsersService } from '../../services/users.service';
import { UsersFieldsService } from '../../services/users-fields.service';
import { User } from '../../../../core/interfaces/user.interface';
import { ToastService } from '../../../../core/services/toast.service';
import { FieldErrorsComponent } from '../../../../shared/field-errors.component';

@Component({
  selector: 'app-single-user',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    DatePickerModule,
    ButtonModule,
    FormSkeletonComponent,
    TranslatePipe,
    FieldErrorsComponent,
  ],
  templateUrl: './single-user.component.html',
})
export class SingleUserComponent implements OnInit {
  private usersService = inject(UsersService);
  private fieldsService = inject(UsersFieldsService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toastService = inject(ToastService);
  private destroyRef = inject(DestroyRef);

  loading = signal(true);
  saving = signal(false);
  user = signal<User | null>(null);
  form!: FormGroup;
  userId!: string;

  ngOnInit(): void {
    this.userId = this.route.snapshot.params['id'];
    this.form = this.fieldsService.createEditForm();
    this.loadUser();
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

  goBack(): void {
    this.router.navigate(['/users']);
  }
}
