import { Component, input } from '@angular/core';
import { AbstractControl, ValidationErrors } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-field-errors',
  standalone: true,
  imports: [TranslatePipe],
  template: `
    @if (control()?.touched && errors()) {
      @if (errors()?.['required']) {
        <small class="text-red-500 text-xs mt-1 block">{{
          'validation.required' | translate
        }}</small>
      }
      @if (errors()?.['email']) {
        <small class="text-red-500 text-xs mt-1 block">{{
          'validation.email' | translate
        }}</small>
      }
      @if (errors()?.['minlength']) {
        <small class="text-red-500 text-xs mt-1 block">{{
          'validation.minlength' | translate
        }}</small>
      }
    }
  `,
})
export class FieldErrorsComponent {
  errors = input<ValidationErrors | null>(null);
  control = input<AbstractControl | null>(null);
}
