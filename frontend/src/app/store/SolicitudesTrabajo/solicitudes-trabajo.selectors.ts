import { createFeatureSelector, createSelector } from '@ngrx/store';
import { SolicitudesTrabajoState } from './solicitudes-trabajo.reducer';

export const selectSolicitudesTrabajoState =
  createFeatureSelector<SolicitudesTrabajoState>('solicitudesTrabajo');

export const selectSolicitudesTrabajoItems = createSelector(
  selectSolicitudesTrabajoState,
  (s) => s.items,
);
export const selectSolicitudesTrabajoCount = createSelector(
  selectSolicitudesTrabajoState,
  (s) => s.count,
);
export const selectSolicitudesTrabajoLoading = createSelector(
  selectSolicitudesTrabajoState,
  (s) => s.loading,
);
export const selectSolicitudesTrabajoError = createSelector(
  selectSolicitudesTrabajoState,
  (s) => s.error,
);
export const selectSolicitudTrabajoSelected = createSelector(
  selectSolicitudesTrabajoState,
  (s) => s.selected,
);
