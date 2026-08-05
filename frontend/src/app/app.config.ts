import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { ApplicationConfig, LOCALE_ID, isDevMode, provideZoneChangeDetection } from '@angular/core';
import {
  PreloadAllModules,
  provideRouter,
  withInMemoryScrolling,
  withPreloading,
  withRouterConfig,
} from '@angular/router';
import { provideEffects } from '@ngrx/effects';
import { provideStore } from '@ngrx/store';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { provideDefaultClient } from '../client';
import { environment } from '../environments/environment';
import { AuthClientInterceptor } from './core/auth/auth.interceptor';
import { RefreshInterceptor } from './core/auth/refresh.interceptor';
import { AuthenticationEffects } from './store/Authentication/authentication.effects';
import { CampanaEffects } from './store/Campana/campana.effects';
import { CitasEffects } from './store/Citas/citas.effects';
import { PropiedadesEffects } from './store/Propiedades/propiedades.effects';
import { ProyectosEffects } from './store/Proyectos/proyectos.effects';
import { ReportesDanoEffects } from './store/ReportesDano/reportes-dano.effects';
import { SolicitudesArrendarPropiedadEffects } from './store/SolicitudesArrendarPropiedad/solicitudes-arrendar-propiedad.effects';
import { SolicitudesArriendoEffects } from './store/SolicitudesArriendo/solicitudes-arriendo.effects';
import { SolicitudesVentaEffects } from './store/SolicitudesVenta/solicitudes-venta.effects';
import { metaReducers, rootReducer } from './store';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: LOCALE_ID, useValue: 'es-CO' },
    provideZoneChangeDetection({ eventCoalescing: true }),

    provideRouter(
      routes,
      withPreloading(PreloadAllModules),
      withRouterConfig({ paramsInheritanceStrategy: 'always' }),
      withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'top' }),
    ),

    provideHttpClient(withInterceptorsFromDi()),
    { provide: HTTP_INTERCEPTORS, useClass: RefreshInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: AuthClientInterceptor, multi: true },
    // El token BASE_PATH_DEFAULT del cliente generado cae en '/api' si no se registra esto,
    // y cada servicio ya arma la URL como `${basePath}/api/v1/...` — sin este override
    // termina pidiendo /api/api/v1/... (404).
    provideDefaultClient({ basePath: environment.apiUrl }),

    provideStore(rootReducer, { metaReducers }),
    provideEffects([
      AuthenticationEffects,
      PropiedadesEffects,
      ProyectosEffects,
      CampanaEffects,
      CitasEffects,
      SolicitudesVentaEffects,
      SolicitudesArriendoEffects,
      SolicitudesArrendarPropiedadEffects,
      ReportesDanoEffects,
    ]),
    provideStoreDevtools({ maxAge: 25, logOnly: !isDevMode() }),
  ],
};
