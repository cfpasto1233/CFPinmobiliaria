import { createReducer, on } from '@ngrx/store';
import { CitaPublic, DisponibilidadDia } from '../../../client';
import { CitasActions } from './citas.actions';

export interface CitasState {
  items: CitaPublic[];
  count: number;
  loading: boolean;
  error: string | null;
  rangoActual: { desde: string; hasta: string } | null;
  disponibilidadRecaudo: DisponibilidadDia[];
  disponibilidadRecaudoLoading: boolean;
  creandoRecaudo: boolean;
}

const initialState: CitasState = {
  items: [],
  count: 0,
  loading: false,
  error: null,
  rangoActual: null,
  disponibilidadRecaudo: [],
  disponibilidadRecaudoLoading: false,
  creandoRecaudo: false,
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

  on(CitasActions.loadDisponibilidadRecaudo, (state) => ({
    ...state,
    disponibilidadRecaudoLoading: true,
    error: null,
  })),
  on(CitasActions.loadDisponibilidadRecaudoSuccess, (state, { dias }) => ({
    ...state,
    disponibilidadRecaudo: dias,
    disponibilidadRecaudoLoading: false,
  })),
  on(CitasActions.loadDisponibilidadRecaudoFailure, (state, { error }) => ({
    ...state,
    disponibilidadRecaudoLoading: false,
    error,
  })),

  on(CitasActions.crearRecaudo, (state) => ({ ...state, creandoRecaudo: true, error: null })),
  on(CitasActions.crearRecaudoSuccess, (state) => ({ ...state, creandoRecaudo: false })),
  on(CitasActions.crearRecaudoFailure, (state, { error }) => ({
    ...state,
    creandoRecaudo: false,
    error,
  })),
);
