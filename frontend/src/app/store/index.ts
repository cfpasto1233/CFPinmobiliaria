import { ActionReducerMap, MetaReducer } from '@ngrx/store';
import { AuthState, authReducer } from './Authentication/authentication.reducer';

export interface RootReducerState {
  auth: AuthState;
}

export const rootReducer: ActionReducerMap<RootReducerState> = {
  auth: authReducer,
};

export const metaReducers: MetaReducer<RootReducerState>[] = [];
