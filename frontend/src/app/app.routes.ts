import { Routes } from '@angular/router';
import { authGuard, superAdminGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/landing/landing').then((m) => m.Landing),
  },
  {
    path: 'propiedades',
    loadComponent: () =>
      import('./features/propiedades/propiedades-listado.component').then(
        (m) => m.PropiedadesListadoComponent,
      ),
  },
  {
    path: 'auth/login',
    loadComponent: () =>
      import('./features/auth/login/login').then((m) => m.LoginComponent),
  },
  {
    path: 'auth/register',
    loadComponent: () =>
      import('./features/auth/register/register.component').then(
        (m) => m.RegisterComponent,
      ),
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then(
        (m) => m.DashboardComponent,
      ),
  },
  {
    path: 'admin',
    canActivate: [authGuard, superAdminGuard],
    loadComponent: () =>
      import('./layouts/admin-layout/admin-layout.component').then(
        (m) => m.AdminLayoutComponent,
      ),
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'propiedades',
      },
      {
        path: 'propiedades',
        loadComponent: () =>
          import('./features/admin/propiedades/propiedades-list/propiedades-list.component').then(
            (m) => m.PropiedadesListComponent,
          ),
      },
      {
        path: 'propiedades/nueva',
        loadComponent: () =>
          import('./features/admin/propiedades/propiedad-form/propiedad-form.component').then(
            (m) => m.PropiedadFormComponent,
          ),
      },
      {
        path: 'propiedades/:id/editar',
        loadComponent: () =>
          import('./features/admin/propiedades/propiedad-form/propiedad-form.component').then(
            (m) => m.PropiedadFormComponent,
          ),
      },
    ],
  },
  {
    path: 'design-system',
    loadComponent: () =>
      import('./features/design-system/design-system.component').then(
        (m) => m.DesignSystemComponent,
      ),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
