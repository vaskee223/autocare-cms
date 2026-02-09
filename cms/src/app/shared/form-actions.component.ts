import { Component, input, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-form-actions',
  standalone: true,
  imports: [ButtonModule, TranslatePipe],
  template: `
    <div class="flex justify-end gap-2 p-4 border-t">
      <p-button
        [label]="cancelLabel() | translate"
        severity="secondary"
        [outlined]="true"
        (onClick)="cancel.emit()"
      />
      <p-button
        [label]="submitLabel() | translate"
        (onClick)="submit.emit()"
        [loading]="loading()"
      />
    </div>
  `,
})
export class FormActionsComponent {
  loading = input<boolean>(false);
  cancelLabel = input<string>('buttons.cancel');
  submitLabel = input<string>('buttons.save');

  cancel = output<void>();
  submit = output<void>();
}
