import { createReducer, on } from '@ngrx/store';
import { SolicitudPublicarPropiedadPublic } from '../../../client';
import { SolicitudesPublicarPropiedadActions } from './solicitudes-publicar-propiedad.actions';

export interface SolicitudesPublicarPropiedadState {
  items: SolicitudPublicarPropiedadPublic[];
  count: number;
  loading: boolean;
  error: string | null;
}

const initialState: SolicitudesPublicarPropiedadState = {
  items: [],
  count: 0,
  loading: false,
  error: null,
};

export const solicitudesPublicarPropiedadReducer = createReducer(
  initialState,

  on(SolicitudesPublicarPropiedadActions.load, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(SolicitudesPublicarPropiedadActions.loadSuccess, (state, { items, count }) => ({
    ...state,
    items,
    count,
    loading: false,
  })),
  on(SolicitudesPublicarPropiedadActions.loadFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  on(SolicitudesPublicarPropiedadActions.create, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(SolicitudesPublicarPropiedadActions.createSuccess, (state) => ({ ...state, loading: false })),
  on(SolicitudesPublicarPropiedadActions.createFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),
);
