import { Injectable, inject } from '@angular/core';
import { MessageService } from 'primeng/api';

interface ToastOptions {
  detail: string;
  summary?: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private messageService = inject(MessageService);

  addSuccess(options: ToastOptions): void {
    this.messageService.add({
      severity: 'success',
      summary: options.summary || 'Success',
      detail: options.detail,
      life: 3000,
    });
  }

  addError(options: ToastOptions): void {
    this.messageService.add({
      severity: 'error',
      summary: options.summary || 'Error',
      detail: options.detail,
      life: 5000,
    });
  }

  addWarn(options: ToastOptions): void {
    this.messageService.add({
      severity: 'warn',
      summary: options.summary || 'Warning',
      detail: options.detail,
      life: 4000,
    });
  }
}
