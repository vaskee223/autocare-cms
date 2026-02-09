import { Component, input } from '@angular/core';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { TranslatePipe } from '@ngx-translate/core';

import { FilterField } from '../core/interfaces/filter-field.interface';

@Component({
  selector: 'app-filter-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    InputNumberModule,
    DatePickerModule,
    SelectModule,
    TranslatePipe,
  ],
  template: `
    <div class="wrapper !p-4 !mb-6">
      <h2 class="text-xl font-semibold mb-2">
        {{ 'common.filters' | translate }}
      </h2>
      <form [formGroup]="form()" class="grid grid-cols-12 gap-4">
        @for (field of fields(); track field.formControlName) {
          <div class="col-span-12" [class]="'md:col-span-' + field.colSpan">
            <label class="text-sm text-gray-600 mb-1 block">{{
              field.label | translate
            }}</label>
            @switch (field.type) {
              @case ('text') {
                <input
                  pInputText
                  [formControlName]="field.formControlName"
                  class="w-full"
                  [placeholder]="field.placeholder | translate"
                />
              }
              @case ('number') {
                <p-inputnumber
                  [formControlName]="field.formControlName"
                  [useGrouping]="false"
                  styleClass="w-full"
                  [placeholder]="field.placeholder | translate"
                />
              }
              @case ('date') {
                <p-datepicker
                  fluid
                  [formControlName]="field.formControlName"
                  dateFormat="yy-mm-dd"
                  styleClass="w-full"
                  [showIcon]="true"
                  [showClear]="true"
                  [placeholder]="field.placeholder | translate"
                />
              }
              @case ('select') {
                <p-select
                  [formControlName]="field.formControlName"
                  [options]="field.options ?? []"
                  optionLabel="label"
                  optionValue="value"
                  styleClass="w-full"
                  [showClear]="true"
                  [placeholder]="field.placeholder | translate"
                />
              }
            }
          </div>
        }
      </form>
    </div>
  `,
})
export class FilterFormComponent {
  form = input.required<FormGroup>();
  fields = input.required<FilterField[]>();

  // Tailwind safelist: md:col-span-3 md:col-span-4
}
