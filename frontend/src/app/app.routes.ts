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
    path: 'reportes/:id/fotos',
    loadComponent: () =>
      import('./features/reportes/reporte-dano-fotos/reporte-dano-fotos.component').then(
        (m) => m.ReporteDanoFotosComponent,
      ),
  },
  {
    path: 'credito-hipotecario',
    loadComponent: () =>
      import('./features/credito-hipotecario/credito-hipotecario.component').then(
        (m) => m.CreditoHipotecarioComponent,
      ),
  },
  {
    path: 'reduccion-credito',
    loadComponent: () =>
      import('./features/reduccion-credito/reduccion-credito.component').then(
        (m) => m.ReduccionCreditoComponent,
      ),
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
    path: 'publicar-mi-propiedad/:token',
    loadComponent: () =>
      import('./features/publicar-mi-propiedad/publicar-mi-propiedad.component').then(
        (m) => m.PublicarMiPropiedadComponent,
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
      {
        path: 'campana',
        loadComponent: () =>
          import('./features/admin/campana/campana-form/campana-form.component').then(
            (m) => m.CampanaFormComponent,
          ),
      },
      {
        path: 'citas',
        loadComponent: () =>
          import('./features/admin/citas/citas-calendar.component').then(
            (m) => m.CitasCalendarComponent,
          ),
      },
      {
        path: 'solicitudes-venta',
        loadComponent: () =>
          import('./features/admin/solicitudes-venta/solicitudes-venta-list.component').then(
            (m) => m.SolicitudesVentaListComponent,
          ),
      },
      {
        path: 'solicitudes-arriendo',
        loadComponent: () =>
          import('./features/admin/solicitudes-arriendo/solicitudes-arriendo-list.component').then(
            (m) => m.SolicitudesArriendoListComponent,
          ),
      },
      {
        path: 'solicitudes-arrendar-propiedad',
        loadComponent: () =>
          import(
            './features/admin/solicitudes-arrendar-propiedad/solicitudes-arrendar-propiedad-list.component'
          ).then((m) => m.SolicitudesArrendarPropiedadListComponent),
      },
      {
        path: 'solicitudes-publicar-propiedad',
        loadComponent: () =>
          import(
            './features/admin/solicitudes-publicar-propiedad/solicitudes-publicar-propiedad-list.component'
          ).then((m) => m.SolicitudesPublicarPropiedadListComponent),
      },
      {
        path: 'solicitudes-documentos-propietario',
        loadComponent: () =>
          import(
            './features/admin/solicitudes-documentos-propietario/solicitudes-documentos-propietario-list.component'
          ).then((m) => m.SolicitudesDocumentosPropietarioListComponent),
      },
      {
        path: 'reportes-dano',
        loadComponent: () =>
          import('./features/admin/reportes-dano/reportes-dano-list.component').then(
            (m) => m.ReportesDanoListComponent,
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
