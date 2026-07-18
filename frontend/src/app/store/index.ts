import { ActionReducerMap, MetaReducer } from '@ngrx/store';
import { AuthState, authReducer } from './Authentication/authentication.reducer';
import { UsersState, usersReducer } from './Users/users.reducer';

export interface RootReducerState {
  auth: AuthState;
  users: UsersState;
}

export const rootReducer: ActionReducerMap<RootReducerState> = {
  auth: authReducer,
  users: usersReducer,
};

export const metaReducers: MetaReducer<RootReducerState>[] = [];
