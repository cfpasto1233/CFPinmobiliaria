import { createReducer, on } from '@ngrx/store';
import { SolicitudVentaPublic } from '../../../client';
import { SolicitudesVentaActions } from './solicitudes-venta.actions';

export interface SolicitudesVentaState {
  items: SolicitudVentaPublic[];
  count: number;
  loading: boolean;
  error: string | null;
}

const initialState: SolicitudesVentaState = {
  items: [],
  count: 0,
  loading: false,
  error: null,
};

export const solicitudesVentaReducer = createReducer(
  initialState,

  on(SolicitudesVentaActions.load, (state) => ({ ...state, loading: true, error: null })),
  on(SolicitudesVentaActions.loadSuccess, (state, { items, count }) => ({
    ...state,
    items,
    count,
    loading: false,
  })),
  on(SolicitudesVentaActions.loadFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  on(SolicitudesVentaActions.create, (state) => ({ ...state, loading: true, error: null })),
  on(SolicitudesVentaActions.createSuccess, (state) => ({ ...state, loading: false })),
  on(SolicitudesVentaActions.createFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),
);
