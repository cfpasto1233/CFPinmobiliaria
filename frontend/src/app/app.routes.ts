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
    path: 'ventas',
    loadComponent: () =>
      import('./features/ventas/ventas.component').then((m) => m.VentasComponent),
  },
  {
    path: 'arrendar',
    loadComponent: () =>
      import('./features/arrendar/arrendar.component').then((m) => m.ArrendarComponent),
  },
  {
    path: 'arrendar-propiedad',
    loadComponent: () =>
      import('./features/arrendar-propiedad/arrendar-propiedad.component').then(
        (m) => m.ArrendarPropiedadComponent,
      ),
  },
  {
    path: 'recaudo',
    loadComponent: () =>
      import('./features/recaudo/recaudo.component').then((m) => m.RecaudoComponent),
  },
  {
    path: 'reportes',
    loadComponent: () =>
      import('./features/reportes/reportes.component').then((m) => m.ReportesComponent),
  },
  {
    path: 'proyectos',
    loadComponent: () =>
      import('./features/proyectos/proyectos-listado.component').then(
        (m) => m.ProyectosListadoComponent,
      ),
  },
  {
    path: 'publicar-propiedad',
    loadComponent: () =>
      import('./features/publicar-propiedad/publicar-propiedad.component').then(
        (m) => m.PublicarPropiedadComponent,
      ),
  },
  {
    path: 'publicar-por-tu-cuenta',
    loadComponent: () =>
      import('./features/publicar-por-tu-cuenta/publicar-por-tu-cuenta.component').then(
        (m) => m.PublicarPorTuCuentaComponent,
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
      {
        path: 'proyectos',
        loadComponent: () =>
          import('./features/admin/proyectos/proyectos-list/proyectos-list.component').then(
            (m) => m.ProyectosListComponent,
          ),
      },
      {
        path: 'proyectos/nuevo',
        loadComponent: () =>
          import('./features/admin/proyectos/proyecto-form/proyecto-form.component').then(
            (m) => m.ProyectoFormComponent,
          ),
      },
      {
        path: 'proyectos/:id/editar',
        loadComponent: () =>
          import('./features/admin/proyectos/proyecto-form/proyecto-form.component').then(
            (m) => m.ProyectoFormComponent,
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
