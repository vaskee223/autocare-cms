import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslatePipe } from '@ngx-translate/core';
import { SkeletonModule } from 'primeng/skeleton';

import { environment } from '../../../environments/environment';
import { DashboardStats } from '../../core/interfaces/user.interface';
import { ToastService } from '../../core/services/toast.service';

interface StatCard {
  label: string;
  value: number;
  icon: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [TranslatePipe, SkeletonModule],
  template: `
    <div class="p-6">
      <h1 class="text-2xl font-bold text-gray-900">
        {{ 'dashboard.title' | translate }}
      </h1>
      <p class="text-gray-500 mb-8">{{ 'dashboard.subtitle' | translate }}</p>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        @if (loading()) {
          @for (i of [1, 2, 3, 4]; track i) {
            <div
              class="bg-white rounded-xl shadow-sm border border-gray-900/70 p-6"
            >
              <p-skeleton width="60%" height="1rem" styleClass="mb-3" />
              <p-skeleton width="40%" height="2rem" />
            </div>
          }
        } @else {
          @for (card of cards(); track card.label) {
            <div
              class="bg-white rounded-xl shadow-sm border border-gray-900/70 p-6"
            >
              <div class="flex items-center justify-between mb-3">
                <span class="text-sm text-gray-500">{{
                  card.label | translate
                }}</span>
                <i [class]="card.icon + ' text-blue-500 text-xl'"></i>
              </div>
              <p class="text-3xl font-bold text-gray-900">{{ card.value }}</p>
            </div>
          }
        }
      </div>
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  private http = inject(HttpClient);
  private destroyRef = inject(DestroyRef);
  private toastService = inject(ToastService);

  loading = signal(true);
  cards = signal<StatCard[]>([]);

  ngOnInit(): void {
    this.loadStats();
  }

  private loadStats(): void {
    this.loading.set(true);
    this.http
      .get<{ data: DashboardStats }>(`${environment.apiUrl}/dashboard`)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.cards.set([
            {
              label: 'dashboard.totalUsers',
              value: res.data.totalUsers,
              icon: 'pi pi-users',
            },
            {
              label: 'dashboard.totalCars',
              value: res.data.totalCars,
              icon: 'pi pi-car',
            },
            {
              label: 'dashboard.totalMaintenances',
              value: res.data.totalMaintenances,
              icon: 'pi pi-wrench',
            },
            {
              label: 'dashboard.totalFuelConsumptions',
              value: res.data.totalFuelConsumptions,
              icon: 'pi pi-bolt',
            },
          ]);
          this.loading.set(false);
        },
        error: (err) => {
          this.toastService.addError({
            detail: err.error?.message || 'Failed to load dashboard',
          });
          this.loading.set(false);
        },
      });
  }
}
