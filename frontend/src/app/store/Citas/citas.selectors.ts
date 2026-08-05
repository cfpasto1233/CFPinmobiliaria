import { createFeatureSelector, createSelector } from '@ngrx/store';
import { CitasState } from './citas.reducer';

export const selectCitasState = createFeatureSelector<CitasState>('citas');

export const selectCitasItems = createSelector(selectCitasState, (s) => s.items);
export const selectCitasLoading = createSelector(selectCitasState, (s) => s.loading);
export const selectCitasError = createSelector(selectCitasState, (s) => s.error);

export const selectDisponibilidadRecaudo = createSelector(
  selectCitasState,
  (s) => s.disponibilidadRecaudo,
);
export const selectDisponibilidadRecaudoLoading = createSelector(
  selectCitasState,
  (s) => s.disponibilidadRecaudoLoading,
);
export const selectCreandoRecaudo = createSelector(selectCitasState, (s) => s.creandoRecaudo);
