import { Injectable, inject } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';

interface ConfirmOptions {
  accept: () => void;
  reject?: () => void;
}

@Injectable({ providedIn: 'root' })
export class ConfirmService {
  private confirmationService = inject(ConfirmationService);
  private translate = inject(TranslateService);

  confirm(event: Event, options: ConfirmOptions): void {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: this.translate.instant('confirmations.delete'),
      acceptLabel: this.translate.instant('buttons.delete'),
      rejectLabel: this.translate.instant('buttons.cancel'),
      icon: 'pi pi-exclamation-triangle',
      accept: options.accept,
      reject: options.reject,
    });
  }
}
