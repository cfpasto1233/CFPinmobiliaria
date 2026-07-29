import { ActionReducerMap, MetaReducer } from '@ngrx/store';
import { AuthState, authReducer } from './Authentication/authentication.reducer';
import { PropiedadesState, propiedadesReducer } from './Propiedades/propiedades.reducer';
import { ProyectosState, proyectosReducer } from './Proyectos/proyectos.reducer';

export interface RootReducerState {
  auth: AuthState;
  propiedades: PropiedadesState;
  proyectos: ProyectosState;
}

export const rootReducer: ActionReducerMap<RootReducerState> = {
  auth: authReducer,
  propiedades: propiedadesReducer,
  proyectos: proyectosReducer,
};

export const metaReducers: MetaReducer<RootReducerState>[] = [];
