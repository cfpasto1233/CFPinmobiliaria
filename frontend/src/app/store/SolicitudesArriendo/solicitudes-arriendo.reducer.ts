import { createReducer, on } from '@ngrx/store';
import { SolicitudArriendoPublic } from '../../../client';
import { SolicitudesArriendoActions } from './solicitudes-arriendo.actions';

export interface SolicitudesArriendoState {
  items: SolicitudArriendoPublic[];
  count: number;
  loading: boolean;
  error: string | null;
}

const initialState: SolicitudesArriendoState = {
  items: [],
  count: 0,
  loading: false,
  error: null,
};

export const solicitudesArriendoReducer = createReducer(
  initialState,

  on(SolicitudesArriendoActions.load, (state) => ({ ...state, loading: true, error: null })),
  on(SolicitudesArriendoActions.loadSuccess, (state, { items, count }) => ({
    ...state,
    items,
    count,
    loading: false,
  })),
  on(SolicitudesArriendoActions.loadFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  on(SolicitudesArriendoActions.create, (state) => ({ ...state, loading: true, error: null })),
  on(SolicitudesArriendoActions.createSuccess, (state) => ({ ...state, loading: false })),
  on(SolicitudesArriendoActions.createFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),
);
