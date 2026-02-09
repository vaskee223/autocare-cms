import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';

import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const toastService = inject(ToastService);

  return next(req).pipe(
    catchError((error) => {
      const message =
        error.error?.message || error.statusText || 'An error occurred';

      switch (error.status) {
        case 401:
          toastService.addError({ detail: message });
          authService.logout();
          break;
        case 403:
          toastService.addError({ detail: 'Access forbidden' });
          break;
        case 404:
          toastService.addWarn({ detail: message });
          break;
        case 409:
          toastService.addError({ detail: message });
          break;
        case 500:
          toastService.addError({ detail: 'Internal server error' });
          break;
      }

      return throwError(() => error);
    }),
  );
};
