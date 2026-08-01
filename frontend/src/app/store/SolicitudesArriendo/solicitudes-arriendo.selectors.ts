import { createFeatureSelector, createSelector } from '@ngrx/store';
import { SolicitudesArriendoState } from './solicitudes-arriendo.reducer';

export const selectSolicitudesArriendoState =
  createFeatureSelector<SolicitudesArriendoState>('solicitudesArriendo');

export const selectSolicitudesArriendoItems = createSelector(
  selectSolicitudesArriendoState,
  (s) => s.items,
);
export const selectSolicitudesArriendoCount = createSelector(
  selectSolicitudesArriendoState,
  (s) => s.count,
);
export const selectSolicitudesArriendoLoading = createSelector(
  selectSolicitudesArriendoState,
  (s) => s.loading,
);
export const selectSolicitudesArriendoError = createSelector(
  selectSolicitudesArriendoState,
  (s) => s.error,
);
