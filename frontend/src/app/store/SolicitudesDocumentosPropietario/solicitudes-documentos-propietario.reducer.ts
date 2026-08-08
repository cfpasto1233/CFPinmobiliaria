import { createReducer, on } from '@ngrx/store';
import {
  SolicitudDocumentoPropietarioDetalle,
  SolicitudDocumentoPropietarioPublic,
} from '../../../client';
import { SolicitudesDocumentosPropietarioActions } from './solicitudes-documentos-propietario.actions';

export interface TokenCheckState {
  valido: boolean;
  motivo: string | null;
}

export interface SolicitudesDocumentosPropietarioState {
  items: SolicitudDocumentoPropietarioPublic[];
  selected: SolicitudDocumentoPropietarioDetalle | null;
  count: number;
  loading: boolean;
  error: string | null;
  tokenCheck: TokenCheckState | null;
  tokenChecking: boolean;
}

const initialState: SolicitudesDocumentosPropietarioState = {
  items: [],
  selected: null,
  count: 0,
  loading: false,
  error: null,
  tokenCheck: null,
  tokenChecking: false,
};

function upsert(
  items: SolicitudDocumentoPropietarioPublic[],
  item: SolicitudDocumentoPropietarioPublic,
): SolicitudDocumentoPropietarioPublic[] {
  const index = items.findIndex((existing) => existing.id === item.id);
  if (index === -1) return [...items, item];
  const next = [...items];
  next[index] = item;
  return next;
}

export const solicitudesDocumentosPropietarioReducer = createReducer(
  initialState,

  on(SolicitudesDocumentosPropietarioActions.load, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(SolicitudesDocumentosPropietarioActions.loadSuccess, (state, { items, count }) => ({
    ...state,
    items,
    count,
    loading: false,
  })),
  on(SolicitudesDocumentosPropietarioActions.loadFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  on(SolicitudesDocumentosPropietarioActions.loadOne, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(SolicitudesDocumentosPropietarioActions.loadOneSuccess, (state, { item }) => ({
    ...state,
    selected: item,
    loading: false,
  })),
  on(SolicitudesDocumentosPropietarioActions.loadOneFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  on(SolicitudesDocumentosPropietarioActions.create, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(SolicitudesDocumentosPropietarioActions.createSuccess, (state) => ({
    ...state,
    loading: false,
  })),
  on(SolicitudesDocumentosPropietarioActions.createFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  on(SolicitudesDocumentosPropietarioActions.validar, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(SolicitudesDocumentosPropietarioActions.validarSuccess, (state, { item }) => ({
    ...state,
    items: upsert(state.items, item),
    selected: state.selected && state.selected.id === item.id ? { ...state.selected, ...item } : state.selected,
    loading: false,
  })),
  on(SolicitudesDocumentosPropietarioActions.validarFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  on(SolicitudesDocumentosPropietarioActions.checkToken, (state) => ({
    ...state,
    tokenChecking: true,
    tokenCheck: null,
  })),
  on(SolicitudesDocumentosPropietarioActions.checkTokenSuccess, (state, { valido, motivo }) => ({
    ...state,
    tokenChecking: false,
    tokenCheck: { valido, motivo },
  })),
  on(SolicitudesDocumentosPropietarioActions.checkTokenFailure, (state) => ({
    ...state,
    tokenChecking: false,
    tokenCheck: { valido: false, motivo: 'No pudimos validar este link.' },
  })),
);
