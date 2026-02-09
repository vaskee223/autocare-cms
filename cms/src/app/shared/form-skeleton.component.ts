import { Component, computed, input } from '@angular/core';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
  selector: 'app-form-skeleton',
  standalone: true,
  imports: [SkeletonModule],
  template: `
    <div [class]="'wrapper !p-6 ' + styleClass()">
      <div class="grid grid-cols-12 gap-4">
        @for (i of items(); track i) {
          <div class="col-span-12 md:col-span-6">
            <p-skeleton width="30%" height="1rem" styleClass="mb-2" />
            <p-skeleton width="100%" height="2.5rem" />
          </div>
        }
      </div>
    </div>
  `,
})
export class FormSkeletonComponent {
  count = input.required<number>();
  styleClass = input<string>('');

  items = computed(() => Array.from({ length: this.count() }, (_, i) => i + 1));
}
