import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';

import { AuthService } from '../core/services/auth.service';
import { LanguagePickerComponent } from '../shared/language-picker.component';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    TranslatePipe,
    ButtonModule,
    LanguagePickerComponent,
  ],
  template: `
    @if (mobileOpen()) {
      <div
        class="fixed inset-0 bg-black/50 z-40 md:hidden"
        (click)="mobileOpen.set(false)"
      ></div>
    }

    <button
      class="fixed bottom-4 left-4 z-50 md:hidden w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center shadow-lg"
      (click)="mobileOpen.set(!mobileOpen())"
    >
      <i
        [class]="mobileOpen() ? 'pi pi-times' : 'pi pi-bars'"
        class="text-xl"
      ></i>
    </button>

    <aside
      class="group h-full bg-gray-900 text-white flex-col transition-all duration-300 ease-in-out hidden md:flex"
      [class.md:w-16]="!pinned()"
      [class.md:hover:w-64]="!pinned()"
      [class.md:w-64]="pinned()"
      [class.sidebar-pinned]="pinned()"
      [class.mobile-open]="mobileOpen()"
    >
      <div
        class="p-4 border-b border-gray-700 h-16 flex items-center overflow-hidden"
      >
        <i class="pi pi-car text-xl min-w-[2rem] text-center"></i>
        <h2
          class="text-lg font-bold whitespace-nowrap ml-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        >
          {{ 'sidebar.title' | translate }}
        </h2>
      </div>

      <nav class="flex-1 p-2 overflow-hidden">
        <ul class="space-y-1">
          @for (item of menuItems; track item.route) {
            <li>
              <a
                [routerLink]="item.route"
                routerLinkActive="bg-blue-600"
                [routerLinkActiveOptions]="{
                  exact: item.route === '/dashboard',
                }"
                class="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-800 transition-colors overflow-hidden"
                (click)="mobileOpen.set(false)"
              >
                <i
                  [class]="item.icon"
                  class="text-lg min-w-[1.5rem] text-center"
                ></i>
                <span
                  class="whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                >
                  {{ item.label | translate }}
                </span>
              </a>
            </li>
          }
        </ul>
      </nav>

      <div class="p-2 border-t border-gray-700 overflow-hidden">
        <div class="language-picker-wrapper">
          <app-language-picker [forceShowText]="mobileOpen()" />
        </div>

        @if (authService.currentUser(); as user) {
          <div class="flex items-center gap-3 mb-2 p-2">
            <div
              class="w-8 h-8 min-w-[2rem] rounded-full bg-blue-500 flex items-center justify-center text-sm font-bold"
            >
              {{ user.firstName.charAt(0) }}{{ user.lastName.charAt(0) }}
            </div>
            <div
              class="text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            >
              <p class="font-medium leading-3">
                {{ user.firstName }} {{ user.lastName }}
              </p>
              <p class="text-gray-400 text-xs">{{ user.email }}</p>
            </div>
          </div>
        }
        <div class="flex items-center">
          <button
            class="logout-button flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-800 transition-colors flex-1 text-red-400"
            (click)="onLogout()"
          >
            <i class="pi pi-sign-out text-lg min-w-[1.5rem] text-center"></i>
            <span
              class="whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 mb-[2px]"
            >
              {{ 'sidebar.logout' | translate }}
            </span>
          </button>
          <button
            class="hidden md:flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-800 transition-colors"
            [class.text-blue-400]="pinned()"
            [class.text-gray-400]="!pinned()"
            (click)="pinned.set(!pinned())"
          >
            <i
              class="pi pi-thumbtack text-lg transition-transform duration-200"
              [class.rotate-45]="!pinned()"
            ></i>
          </button>
        </div>
      </div>
    </aside>
  `,
  styles: `
    .mobile-open {
      display: flex !important;
      position: fixed !important;
      inset: 0 !important;
      width: 100% !important;
      z-index: 45;
    }

    .mobile-open h2,
    .mobile-open nav span,
    .mobile-open .text-sm,
    .mobile-open button span,
    .mobile-open .language-picker-wrapper span {
      opacity: 1 !important;
    }

    .mobile-open .logout-button {
      justify-content: center !important;
    }

    .sidebar-pinned h2,
    .sidebar-pinned nav span,
    .sidebar-pinned .text-sm,
    .sidebar-pinned button span,
    .sidebar-pinned .language-picker-wrapper span {
      opacity: 1 !important;
    }
  `,
})
export class SidebarComponent {
  authService = inject(AuthService);
  mobileOpen = signal(false);
  pinned = signal(false);

  menuItems: MenuItem[] = [
    { label: 'sidebar.dashboard', icon: 'pi pi-home', route: '/dashboard' },
    { label: 'sidebar.users', icon: 'pi pi-users', route: '/users' },
    { label: 'sidebar.cars', icon: 'pi pi-car', route: '/cars' },
    {
      label: 'sidebar.maintenances',
      icon: 'pi pi-wrench',
      route: '/maintenances',
    },
    {
      label: 'sidebar.fuelConsumptions',
      icon: 'pi pi-bolt',
      route: '/fuel-consumptions',
    },
    { label: 'sidebar.profile', icon: 'pi pi-user', route: '/profile' },
  ];

  onLogout(): void {
    this.authService.logout();
  }
}
