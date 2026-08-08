import { createReducer, on } from '@ngrx/store';
import { SolicitudSugerenciaPublic } from '../../../client';
import { SolicitudesSugerenciasActions } from './solicitudes-sugerencias.actions';

export interface SolicitudesSugerenciasState {
  items: SolicitudSugerenciaPublic[];
  count: number;
  loading: boolean;
  error: string | null;
}

const initialState: SolicitudesSugerenciasState = {
  items: [],
  count: 0,
  loading: false,
  error: null,
};

export const solicitudesSugerenciasReducer = createReducer(
  initialState,

  on(SolicitudesSugerenciasActions.load, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(SolicitudesSugerenciasActions.loadSuccess, (state, { items, count }) => ({
    ...state,
    items,
    count,
    loading: false,
  })),
  on(SolicitudesSugerenciasActions.loadFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  on(SolicitudesSugerenciasActions.create, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(SolicitudesSugerenciasActions.createSuccess, (state) => ({ ...state, loading: false })),
  on(SolicitudesSugerenciasActions.createFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),
);
