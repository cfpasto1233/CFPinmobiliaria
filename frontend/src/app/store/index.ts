import { ActionReducerMap, MetaReducer } from '@ngrx/store';
import { AuthState, authReducer } from './Authentication/authentication.reducer';
import { CampanaState, campanaReducer } from './Campana/campana.reducer';
import { PropiedadesState, propiedadesReducer } from './Propiedades/propiedades.reducer';
import { ProyectosState, proyectosReducer } from './Proyectos/proyectos.reducer';
import { SolicitudesVentaState, solicitudesVentaReducer } from './SolicitudesVenta/solicitudes-venta.reducer';

export interface RootReducerState {
  auth: AuthState;
  propiedades: PropiedadesState;
  proyectos: ProyectosState;
  campana: CampanaState;
  solicitudesVenta: SolicitudesVentaState;
}

export const rootReducer: ActionReducerMap<RootReducerState> = {
  auth: authReducer,
  propiedades: propiedadesReducer,
  proyectos: proyectosReducer,
  campana: campanaReducer,
  solicitudesVenta: solicitudesVentaReducer,
};

export const metaReducers: MetaReducer<RootReducerState>[] = [];
