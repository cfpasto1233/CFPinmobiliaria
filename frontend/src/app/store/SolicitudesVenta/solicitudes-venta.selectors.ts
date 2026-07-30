import { createFeatureSelector, createSelector } from '@ngrx/store';
import { SolicitudesVentaState } from './solicitudes-venta.reducer';

export const selectSolicitudesVentaState =
  createFeatureSelector<SolicitudesVentaState>('solicitudesVenta');

export const selectSolicitudesVentaItems = createSelector(
  selectSolicitudesVentaState,
  (s) => s.items,
);
export const selectSolicitudesVentaCount = createSelector(
  selectSolicitudesVentaState,
  (s) => s.count,
);
export const selectSolicitudesVentaLoading = createSelector(
  selectSolicitudesVentaState,
  (s) => s.loading,
);
export const selectSolicitudesVentaError = createSelector(
  selectSolicitudesVentaState,
  (s) => s.error,
);
