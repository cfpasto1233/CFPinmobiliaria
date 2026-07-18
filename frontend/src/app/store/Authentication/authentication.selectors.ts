import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AuthState } from './authentication.reducer';

export const selectAuthState = createFeatureSelector<AuthState>('auth');

export const selectUser = createSelector(selectAuthState, (s) => s.user);
export const selectAuthLoading = createSelector(selectAuthState, (s) => s.loading);
export const selectAuthInitialized = createSelector(selectAuthState, (s) => s.initialized);
export const selectAuthError = createSelector(selectAuthState, (s) => s.error);
export const selectIsSuperAdmin = createSelector(
  selectAuthState,
  (s) => s.user?.is_superuser ?? false,
);
