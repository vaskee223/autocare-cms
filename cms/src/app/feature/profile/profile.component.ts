import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { FormSkeletonComponent } from '../../shared/form-skeleton.component';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { TranslatePipe } from '@ngx-translate/core';

import { ProfileService } from './services/profile.service';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/interfaces/user.interface';
import { ToastService } from '../../core/services/toast.service';
import { ConfirmService } from '../../core/services/confirm.service';
import { FieldErrorsComponent } from '../../shared/field-errors.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    FormSkeletonComponent,
    ConfirmPopupModule,
    TranslatePipe,
    FieldErrorsComponent,
  ],
  templateUrl: './profile.component.html',
})
export class ProfileComponent implements OnInit {
  private profileService = inject(ProfileService);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private toastService = inject(ToastService);
  private confirmService = inject(ConfirmService);
  private destroyRef = inject(DestroyRef);

  loading = signal(true);
  saving = signal(false);
  profile = signal<User | null>(null);
  form!: FormGroup;

  ngOnInit(): void {
    this.form = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: [''],
      passwordConfirm: [''],
    });

    this.loadProfile();
  }

  private loadProfile(): void {
    this.loading.set(true);
    this.profileService
      .getProfile()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.profile.set(res.data);
          this.form.patchValue({
            firstName: res.data.firstName,
            lastName: res.data.lastName,
            email: res.data.email,
          });
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          this.router.navigate(['/dashboard']);
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

    // Only include password fields if they are filled in
    const payload: Record<string, unknown> = {
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      email: formValue.email,
    };

    if (formValue.password) {
      payload['password'] = formValue.password;
      payload['passwordConfirm'] = formValue.passwordConfirm;
    }

    this.profileService
      .updateProfile(payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.toastService.addSuccess({ detail: res.message });
          this.saving.set(false);
          // Update stored user data
          this.authService.currentUser.set(res.data);
          localStorage.setItem('user', JSON.stringify(res.data));
          this.form.patchValue({ password: '', passwordConfirm: '' });
          this.loadProfile();
        },
        error: (err) => {
          this.toastService.addError({
            detail: err.error?.message || 'Update failed',
          });
          this.saving.set(false);
        },
      });
  }

  onDeleteAccount(event: Event): void {
    this.confirmService.confirm(event, {
      accept: () => {
        this.profileService
          .deleteProfile()
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: (res) => {
              this.toastService.addSuccess({ detail: res.message });
              this.authService.logout();
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
}
