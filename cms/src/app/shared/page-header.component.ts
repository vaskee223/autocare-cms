import { Component, inject, input, output } from '@angular/core';
import { Location } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [ButtonModule, TranslatePipe],
  template: `
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-4">
        <p-button
          icon="pi pi-arrow-left"
          [rounded]="true"
          [text]="true"
          (onClick)="handleBack()"
        />
        <div>
          <h1 class="text-2xl font-bold text-gray-900">
            {{ title() | translate }}
          </h1>
          @if (subtitle()) {
            <p class="text-gray-500">{{ subtitle() }}</p>
          }
          <ng-content select="[subtitle]" />
        </div>
      </div>
      @if (actionLabel()) {
        <p-button
          icon="pi pi-save"
          [label]="actionLabel() | translate"
          (onClick)="action.emit()"
          [loading]="loading()"
        />
      }
      <ng-content select="[actions]" />
    </div>
  `,
})
export class PageHeaderComponent {
  title = input.required<string>();
  subtitle = input<string>();
  actionLabel = input<string>();
  loading = input<boolean>(false);

  back = output<void>();
  action = output<void>();

  private location = inject(Location);

  handleBack(): void {
    this.location.back();
  }
}
