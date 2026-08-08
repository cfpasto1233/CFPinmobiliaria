import { createFeatureSelector, createSelector } from '@ngrx/store';
import { SolicitudesSugerenciasState } from './solicitudes-sugerencias.reducer';

export const selectSolicitudesSugerenciasState =
  createFeatureSelector<SolicitudesSugerenciasState>('solicitudesSugerencias');

export const selectSolicitudesSugerenciasItems = createSelector(
  selectSolicitudesSugerenciasState,
  (s) => s.items,
);
export const selectSolicitudesSugerenciasCount = createSelector(
  selectSolicitudesSugerenciasState,
  (s) => s.count,
);
export const selectSolicitudesSugerenciasLoading = createSelector(
  selectSolicitudesSugerenciasState,
  (s) => s.loading,
);
export const selectSolicitudesSugerenciasError = createSelector(
  selectSolicitudesSugerenciasState,
  (s) => s.error,
);
