import { createReducer, on } from '@ngrx/store';
import { AuthActions, UserInfo } from './authentication.actions';

export interface AuthState {
  user: UserInfo | null;
  loading: boolean;
  initialized: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  loading: false,
  initialized: false,
  error: null,
};

export const authReducer = createReducer(
  initialState,

  on(AuthActions.login, (state) => ({ ...state, loading: true, error: null })),
  on(AuthActions.loginSuccess, (state, { user }) => ({
    ...state,
    user,
    loading: false,
    initialized: true,
    error: null,
  })),
  on(AuthActions.loginFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  on(AuthActions.refreshToken, (state) => ({ ...state, loading: true })),
  on(AuthActions.refreshTokenSuccess, (state) => ({ ...state, loading: false })),
  on(AuthActions.refreshTokenFailure, (state) => ({
    ...state,
    loading: false,
    initialized: true,
  })),

  on(AuthActions.loadCurrentUserSuccess, (state, { user }) => ({
    ...state,
    user,
    initialized: true,
    loading: false,
  })),
  on(AuthActions.loadCurrentUserFailure, (state) => ({
    ...state,
    initialized: true,
    loading: false,
  })),

  on(AuthActions.logout, () => ({ ...initialState, initialized: true })),
);
