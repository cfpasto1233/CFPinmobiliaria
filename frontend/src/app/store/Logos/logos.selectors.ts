import { createFeatureSelector, createSelector } from '@ngrx/store';
import { LogosState } from './logos.reducer';

export const selectLogosState = createFeatureSelector<LogosState>('logos');

export const selectLogosItems = createSelector(selectLogosState, (s) => s.items);
export const selectLogosCount = createSelector(selectLogosState, (s) => s.count);
export const selectLogosLoading = createSelector(selectLogosState, (s) => s.loading);
export const selectLogosError = createSelector(selectLogosState, (s) => s.error);
