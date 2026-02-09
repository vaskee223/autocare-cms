import { Routes } from '@angular/router';

export default <Routes>[
  {
    path: '',
    loadComponent: () =>
      import('./pages/all-users/all-users.component').then(
        (m) => m.AllUsersComponent,
      ),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/single-user/single-user.component').then(
        (m) => m.SingleUserComponent,
      ),
  },
];
