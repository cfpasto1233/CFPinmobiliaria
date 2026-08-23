import { createReducer, on } from '@ngrx/store';
import { SolicitudTrabajoDetalle, SolicitudTrabajoPublic } from '../../../client';
import { SolicitudesTrabajoActions } from './solicitudes-trabajo.actions';

export interface SolicitudesTrabajoState {
  items: SolicitudTrabajoPublic[];
  selected: SolicitudTrabajoDetalle | null;
  count: number;
  loading: boolean;
  error: string | null;
}

const initialState: SolicitudesTrabajoState = {
  items: [],
  selected: null,
  count: 0,
  loading: false,
  error: null,
};

export const solicitudesTrabajoReducer = createReducer(
  initialState,

  on(SolicitudesTrabajoActions.load, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(SolicitudesTrabajoActions.loadSuccess, (state, { items, count }) => ({
    ...state,
    items,
    count,
    loading: false,
  })),
  on(SolicitudesTrabajoActions.loadFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  on(SolicitudesTrabajoActions.loadOne, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(SolicitudesTrabajoActions.loadOneSuccess, (state, { item }) => ({
    ...state,
    selected: item,
    loading: false,
  })),
  on(SolicitudesTrabajoActions.loadOneFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  on(SolicitudesTrabajoActions.create, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(SolicitudesTrabajoActions.createSuccess, (state) => ({
    ...state,
    loading: false,
  })),
  on(SolicitudesTrabajoActions.createFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),
);
