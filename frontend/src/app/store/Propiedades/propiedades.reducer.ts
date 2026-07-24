import { createReducer, on } from '@ngrx/store';
import { PropiedadPublic } from '../../../client';
import { PropiedadesActions } from './propiedades.actions';

export interface PropiedadesState {
  items: PropiedadPublic[];
  selected: PropiedadPublic | null;
  count: number;
  loading: boolean;
  error: string | null;
}

const initialState: PropiedadesState = {
  items: [],
  selected: null,
  count: 0,
  loading: false,
  error: null,
};

function upsert(items: PropiedadPublic[], item: PropiedadPublic): PropiedadPublic[] {
  const index = items.findIndex((existing) => existing.id === item.id);
  if (index === -1) {
    return [...items, item];
  }
  const next = [...items];
  next[index] = item;
  return next;
}

export const propiedadesReducer = createReducer(
  initialState,

  on(PropiedadesActions.load, (state) => ({ ...state, loading: true, error: null })),
  on(PropiedadesActions.loadSuccess, (state, { items, count }) => ({
    ...state,
    items,
    count,
    loading: false,
  })),
  on(PropiedadesActions.loadFailure, (state, { error }) => ({ ...state, loading: false, error })),

  on(PropiedadesActions.loadOne, (state) => ({ ...state, loading: true, error: null })),
  on(PropiedadesActions.loadOneSuccess, (state, { item }) => ({
    ...state,
    selected: item,
    items: upsert(state.items, item),
    loading: false,
  })),
  on(PropiedadesActions.loadOneFailure, (state, { error }) => ({ ...state, loading: false, error })),

  on(PropiedadesActions.create, (state) => ({ ...state, loading: true, error: null })),
  on(PropiedadesActions.createSuccess, (state, { item }) => ({
    ...state,
    items: upsert(state.items, item),
    selected: item,
    loading: false,
  })),
  on(PropiedadesActions.createFailure, (state, { error }) => ({ ...state, loading: false, error })),

  on(PropiedadesActions.update, (state) => ({ ...state, loading: true, error: null })),
  on(PropiedadesActions.updateSuccess, (state, { item }) => ({
    ...state,
    items: upsert(state.items, item),
    selected: item,
    loading: false,
  })),
  on(PropiedadesActions.updateFailure, (state, { error }) => ({ ...state, loading: false, error })),

  on(PropiedadesActions.remove, (state) => ({ ...state, loading: true, error: null })),
  on(PropiedadesActions.removeSuccess, (state, { id }) => ({
    ...state,
    items: state.items.filter((item) => item.id !== id),
    selected: state.selected?.id === id ? null : state.selected,
    loading: false,
  })),
  on(PropiedadesActions.removeFailure, (state, { error }) => ({ ...state, loading: false, error })),

  on(PropiedadesActions.addFotoSuccess, (state, { item }) => ({
    ...state,
    items: upsert(state.items, item),
    selected: item,
  })),
  on(PropiedadesActions.addFotoFailure, (state, { error }) => ({ ...state, error })),

  on(PropiedadesActions.removeFotoSuccess, (state, { item }) => ({
    ...state,
    items: upsert(state.items, item),
    selected: item,
  })),
  on(PropiedadesActions.removeFotoFailure, (state, { error }) => ({ ...state, error })),

  on(PropiedadesActions.replaceFotoPrincipalSuccess, (state, { item }) => ({
    ...state,
    items: upsert(state.items, item),
    selected: item,
  })),
  on(PropiedadesActions.replaceFotoPrincipalFailure, (state, { error }) => ({ ...state, error })),
);
