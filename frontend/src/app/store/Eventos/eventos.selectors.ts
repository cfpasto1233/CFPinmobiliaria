import { createFeatureSelector, createSelector } from '@ngrx/store';
import { EventosState } from './eventos.reducer';

export const selectEventosState = createFeatureSelector<EventosState>('eventos');

export const selectEventosItems = createSelector(selectEventosState, (s) => s.items);
export const selectEventosCount = createSelector(selectEventosState, (s) => s.count);
export const selectEventosLoading = createSelector(selectEventosState, (s) => s.loading);
export const selectEventosError = createSelector(selectEventosState, (s) => s.error);
export const selectEventoSelected = createSelector(selectEventosState, (s) => s.selected);
