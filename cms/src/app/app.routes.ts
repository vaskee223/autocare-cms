import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth.guard';
import { PrivateLayoutComponent } from './layout/private-layout.component';
import { AuthLayoutComponent } from './layout/auth-layout.component';

export const routes: Routes = [
  {
    path: 'auth',
    component: AuthLayoutComponent,
    children: [
      {
        path: '',
        loadChildren: () => import('./feature/auth/auth.routes'),
      },
    ],
  },
  {
    path: '',
    component: PrivateLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadChildren: () => import('./feature/dashboard/dashboard.routes'),
      },
      {
        path: 'users',
        loadChildren: () => import('./feature/users/users.routes'),
      },
      {
        path: 'cars',
        loadChildren: () => import('./feature/cars/cars.routes'),
      },
      {
        path: 'maintenances',
        loadChildren: () =>
          import('./feature/maintenances/maintenances.routes'),
      },
      {
        path: 'fuel-consumptions',
        loadChildren: () =>
          import('./feature/fuel-consumptions/fuel-consumptions.routes'),
      },
      {
        path: 'profile',
        loadChildren: () => import('./feature/profile/profile.routes'),
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
