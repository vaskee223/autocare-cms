import { Routes } from '@angular/router';

export default <Routes>[
  {
    path: '',
    loadComponent: () =>
      import('./profile.component').then((m) => m.ProfileComponent),
  },
];
