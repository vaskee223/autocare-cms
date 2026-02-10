import { Component, input, output } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-content-layout',
  standalone: true,
  imports: [TranslatePipe, ButtonModule],
  template: `
    <div class="p-6">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">
            {{ title() | translate }}
          </h1>
          @if (description()) {
            <p class="text-gray-500">{{ description() | translate }}</p>
          }
        </div>
        @if (actionLabel()) {
          <p-button
            [label]="actionLabel()! | translate"
            icon="pi pi-plus"
            (onClick)="actionClick.emit()"
          />
        }
      </div>
      <ng-content />
    </div>
  `,
})
export class ContentLayoutComponent {
  title = input.required<string>();
  description = input<string>('');
  actionLabel = input<string | null>(null);
  actionClick = output<void>();
}
