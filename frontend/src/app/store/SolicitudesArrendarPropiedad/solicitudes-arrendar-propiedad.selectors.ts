import { createFeatureSelector, createSelector } from '@ngrx/store';
import { SolicitudesArrendarPropiedadState } from './solicitudes-arrendar-propiedad.reducer';

export const selectSolicitudesArrendarPropiedadState =
  createFeatureSelector<SolicitudesArrendarPropiedadState>('solicitudesArrendarPropiedad');

export const selectSolicitudesArrendarPropiedadItems = createSelector(
  selectSolicitudesArrendarPropiedadState,
  (s) => s.items,
);
export const selectSolicitudesArrendarPropiedadCount = createSelector(
  selectSolicitudesArrendarPropiedadState,
  (s) => s.count,
);
export const selectSolicitudesArrendarPropiedadLoading = createSelector(
  selectSolicitudesArrendarPropiedadState,
  (s) => s.loading,
);
export const selectSolicitudesArrendarPropiedadError = createSelector(
  selectSolicitudesArrendarPropiedadState,
  (s) => s.error,
);
