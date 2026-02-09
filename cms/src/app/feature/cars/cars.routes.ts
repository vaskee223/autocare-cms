import { Routes } from '@angular/router';

export default <Routes>[
  {
    path: '',
    loadComponent: () =>
      import('./pages/all-cars/all-cars.component').then(
        (m) => m.AllCarsComponent,
      ),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/single-car/single-car.component').then(
        (m) => m.SingleCarComponent,
      ),
  },
];
