import { createReducer, on } from '@ngrx/store';
import { CitaPublic } from '../../../client';
import { CitasActions } from './citas.actions';

export interface CitasState {
  items: CitaPublic[];
  count: number;
  loading: boolean;
  error: string | null;
  rangoActual: { desde: string; hasta: string } | null;
}

const initialState: CitasState = {
  items: [],
  count: 0,
  loading: false,
  error: null,
  rangoActual: null,
};

export const citasReducer = createReducer(
  initialState,

  on(CitasActions.load, (state) => ({ ...state, loading: true, error: null })),
  on(CitasActions.loadSuccess, (state, { items, count, desde, hasta }) => ({
    ...state,
    items,
    count,
    loading: false,
    rangoActual: { desde, hasta },
  })),
  on(CitasActions.loadFailure, (state, { error }) => ({ ...state, loading: false, error })),

  on(CitasActions.create, (state) => ({ ...state, loading: true, error: null })),
  on(CitasActions.createSuccess, (state, { item }) => ({
    ...state,
    items: [...state.items, item],
    loading: false,
  })),
  on(CitasActions.createFailure, (state, { error }) => ({ ...state, loading: false, error })),

  on(CitasActions.update, (state) => ({ ...state, loading: true, error: null })),
  on(CitasActions.updateSuccess, (state, { item }) => ({
    ...state,
    items: state.items.map((cita) => (cita.id === item.id ? item : cita)),
    loading: false,
  })),
  on(CitasActions.updateFailure, (state, { error }) => ({ ...state, loading: false, error })),

  on(CitasActions.delete, (state) => ({ ...state, loading: true, error: null })),
  on(CitasActions.deleteSuccess, (state, { id }) => ({
    ...state,
    items: state.items.filter((cita) => cita.id !== id),
    loading: false,
  })),
  on(CitasActions.deleteFailure, (state, { error }) => ({ ...state, loading: false, error })),
);
