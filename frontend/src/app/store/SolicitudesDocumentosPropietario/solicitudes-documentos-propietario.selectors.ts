import { createFeatureSelector, createSelector } from '@ngrx/store';
import { SolicitudesDocumentosPropietarioState } from './solicitudes-documentos-propietario.reducer';

export const selectSolicitudesDocumentosPropietarioState =
  createFeatureSelector<SolicitudesDocumentosPropietarioState>('solicitudesDocumentosPropietario');

export const selectSolicitudesDocumentosPropietarioItems = createSelector(
  selectSolicitudesDocumentosPropietarioState,
  (s) => s.items,
);
export const selectSolicitudesDocumentosPropietarioCount = createSelector(
  selectSolicitudesDocumentosPropietarioState,
  (s) => s.count,
);
export const selectSolicitudesDocumentosPropietarioLoading = createSelector(
  selectSolicitudesDocumentosPropietarioState,
  (s) => s.loading,
);
export const selectSolicitudesDocumentosPropietarioError = createSelector(
  selectSolicitudesDocumentosPropietarioState,
  (s) => s.error,
);
export const selectSolicitudDocumentoPropietarioSelected = createSelector(
  selectSolicitudesDocumentosPropietarioState,
  (s) => s.selected,
);
export const selectSolicitudDocumentoTokenCheck = createSelector(
  selectSolicitudesDocumentosPropietarioState,
  (s) => s.tokenCheck,
);
export const selectSolicitudDocumentoTokenChecking = createSelector(
  selectSolicitudesDocumentosPropietarioState,
  (s) => s.tokenChecking,
);
