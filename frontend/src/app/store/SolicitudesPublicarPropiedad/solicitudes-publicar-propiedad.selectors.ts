import { createFeatureSelector, createSelector } from '@ngrx/store';
import { SolicitudesPublicarPropiedadState } from './solicitudes-publicar-propiedad.reducer';

export const selectSolicitudesPublicarPropiedadState =
  createFeatureSelector<SolicitudesPublicarPropiedadState>('solicitudesPublicarPropiedad');

export const selectSolicitudesPublicarPropiedadItems = createSelector(
  selectSolicitudesPublicarPropiedadState,
  (s) => s.items,
);
export const selectSolicitudesPublicarPropiedadCount = createSelector(
  selectSolicitudesPublicarPropiedadState,
  (s) => s.count,
);
export const selectSolicitudesPublicarPropiedadLoading = createSelector(
  selectSolicitudesPublicarPropiedadState,
  (s) => s.loading,
);
export const selectSolicitudesPublicarPropiedadError = createSelector(
  selectSolicitudesPublicarPropiedadState,
  (s) => s.error,
);
