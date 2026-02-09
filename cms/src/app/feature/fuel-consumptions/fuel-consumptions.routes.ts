import { Routes } from '@angular/router';

export default <Routes>[
  {
    path: '',
    loadComponent: () =>
      import(
        './pages/all-fuel-consumptions/all-fuel-consumptions.component'
      ).then((m) => m.AllFuelConsumptionsComponent),
  },
  {
    path: ':id',
    loadComponent: () =>
      import(
        './pages/single-fuel-consumption/single-fuel-consumption.component'
      ).then((m) => m.SingleFuelConsumptionComponent),
  },
];
