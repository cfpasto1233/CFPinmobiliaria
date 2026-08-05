import { createReducer, on } from '@ngrx/store';
import { SolicitudArrendarPropiedadPublic } from '../../../client';
import { SolicitudesArrendarPropiedadActions } from './solicitudes-arrendar-propiedad.actions';

export interface SolicitudesArrendarPropiedadState {
  items: SolicitudArrendarPropiedadPublic[];
  count: number;
  loading: boolean;
  error: string | null;
}

const initialState: SolicitudesArrendarPropiedadState = {
  items: [],
  count: 0,
  loading: false,
  error: null,
};

export const solicitudesArrendarPropiedadReducer = createReducer(
  initialState,

  on(SolicitudesArrendarPropiedadActions.load, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(SolicitudesArrendarPropiedadActions.loadSuccess, (state, { items, count }) => ({
    ...state,
    items,
    count,
    loading: false,
  })),
  on(SolicitudesArrendarPropiedadActions.loadFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  on(SolicitudesArrendarPropiedadActions.create, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(SolicitudesArrendarPropiedadActions.createSuccess, (state) => ({ ...state, loading: false })),
  on(SolicitudesArrendarPropiedadActions.createFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),
);
