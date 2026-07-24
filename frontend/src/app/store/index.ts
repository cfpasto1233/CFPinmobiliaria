import { ActionReducerMap, MetaReducer } from '@ngrx/store';
import { AuthState, authReducer } from './Authentication/authentication.reducer';
import { PropiedadesState, propiedadesReducer } from './Propiedades/propiedades.reducer';

export interface RootReducerState {
  auth: AuthState;
  propiedades: PropiedadesState;
}

export const rootReducer: ActionReducerMap<RootReducerState> = {
  auth: authReducer,
  propiedades: propiedadesReducer,
};

export const metaReducers: MetaReducer<RootReducerState>[] = [];
