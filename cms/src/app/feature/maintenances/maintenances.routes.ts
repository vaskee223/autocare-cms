import { Routes } from '@angular/router';

export default <Routes>[
  {
    path: '',
    loadComponent: () =>
      import('./pages/all-maintenances/all-maintenances.component').then(
        (m) => m.AllMaintenancesComponent,
      ),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/single-maintenance/single-maintenance.component').then(
        (m) => m.SingleMaintenanceComponent,
      ),
  },
];
