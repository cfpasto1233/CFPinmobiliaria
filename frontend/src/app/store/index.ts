import { ActionReducerMap, MetaReducer } from '@ngrx/store';
import { AuthState, authReducer } from './Authentication/authentication.reducer';
import { CampanaState, campanaReducer } from './Campana/campana.reducer';
import { CitasState, citasReducer } from './Citas/citas.reducer';
import { PropiedadesState, propiedadesReducer } from './Propiedades/propiedades.reducer';
import { ProyectosState, proyectosReducer } from './Proyectos/proyectos.reducer';
import {
  SolicitudesArrendarPropiedadState,
  solicitudesArrendarPropiedadReducer,
} from './SolicitudesArrendarPropiedad/solicitudes-arrendar-propiedad.reducer';
import { SolicitudesArriendoState, solicitudesArriendoReducer } from './SolicitudesArriendo/solicitudes-arriendo.reducer';
import { SolicitudesVentaState, solicitudesVentaReducer } from './SolicitudesVenta/solicitudes-venta.reducer';

export interface RootReducerState {
  auth: AuthState;
  propiedades: PropiedadesState;
  proyectos: ProyectosState;
  campana: CampanaState;
  citas: CitasState;
  solicitudesVenta: SolicitudesVentaState;
  solicitudesArriendo: SolicitudesArriendoState;
  solicitudesArrendarPropiedad: SolicitudesArrendarPropiedadState;
}

export const rootReducer: ActionReducerMap<RootReducerState> = {
  auth: authReducer,
  propiedades: propiedadesReducer,
  proyectos: proyectosReducer,
  campana: campanaReducer,
  citas: citasReducer,
  solicitudesVenta: solicitudesVentaReducer,
  solicitudesArriendo: solicitudesArriendoReducer,
  solicitudesArrendarPropiedad: solicitudesArrendarPropiedadReducer,
};

export const metaReducers: MetaReducer<RootReducerState>[] = [];
