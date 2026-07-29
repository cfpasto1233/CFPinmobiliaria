import { createReducer, on } from '@ngrx/store';
import { ProyectoPublic } from '../../../client';
import { ProyectosActions } from './proyectos.actions';

export interface ProyectosState {
  items: ProyectoPublic[];
  selected: ProyectoPublic | null;
  count: number;
  loading: boolean;
  error: string | null;
}

const initialState: ProyectosState = {
  items: [],
  selected: null,
  count: 0,
  loading: false,
  error: null,
};

function upsert(items: ProyectoPublic[], item: ProyectoPublic): ProyectoPublic[] {
  const index = items.findIndex((existing) => existing.id === item.id);
  if (index === -1) {
    return [...items, item];
  }
  const next = [...items];
  next[index] = item;
  return next;
}

export const proyectosReducer = createReducer(
  initialState,

  on(ProyectosActions.load, (state) => ({ ...state, loading: true, error: null })),
  on(ProyectosActions.loadSuccess, (state, { items, count }) => ({
    ...state,
    items,
    count,
    loading: false,
  })),
  on(ProyectosActions.loadFailure, (state, { error }) => ({ ...state, loading: false, error })),

  on(ProyectosActions.loadOne, (state) => ({ ...state, loading: true, error: null })),
  on(ProyectosActions.loadOneSuccess, (state, { item }) => ({
    ...state,
    selected: item,
    items: upsert(state.items, item),
    loading: false,
  })),
  on(ProyectosActions.loadOneFailure, (state, { error }) => ({ ...state, loading: false, error })),

  on(ProyectosActions.create, (state) => ({ ...state, loading: true, error: null })),
  on(ProyectosActions.createSuccess, (state, { item }) => ({
    ...state,
    items: upsert(state.items, item),
    selected: item,
    loading: false,
  })),
  on(ProyectosActions.createFailure, (state, { error }) => ({ ...state, loading: false, error })),

  on(ProyectosActions.update, (state) => ({ ...state, loading: true, error: null })),
  on(ProyectosActions.updateSuccess, (state, { item }) => ({
    ...state,
    items: upsert(state.items, item),
    selected: item,
    loading: false,
  })),
  on(ProyectosActions.updateFailure, (state, { error }) => ({ ...state, loading: false, error })),

  on(ProyectosActions.remove, (state) => ({ ...state, loading: true, error: null })),
  on(ProyectosActions.removeSuccess, (state, { id }) => ({
    ...state,
    items: state.items.filter((item) => item.id !== id),
    selected: state.selected?.id === id ? null : state.selected,
    loading: false,
  })),
  on(ProyectosActions.removeFailure, (state, { error }) => ({ ...state, loading: false, error })),

  on(ProyectosActions.replaceFotoPortadaSuccess, (state, { item }) => ({
    ...state,
    items: upsert(state.items, item),
    selected: item,
  })),
  on(ProyectosActions.replaceFotoPortadaFailure, (state, { error }) => ({ ...state, error })),

  // Reordena de inmediato en el cliente (drag & drop debe sentirse instantáneo);
  // reorderSuccess reconcilia con el orden confirmado por el backend.
  on(ProyectosActions.reorder, (state, { ids }) => {
    const byId = new Map(state.items.map((item) => [item.id, item]));
    const reordered = ids.flatMap((id) => {
      const item = byId.get(id);
      return item ? [item] : [];
    });
    const remaining = state.items.filter((item) => !ids.includes(item.id));
    return { ...state, items: [...reordered, ...remaining], error: null };
  }),
  on(ProyectosActions.reorderSuccess, (state, { items, count }) => ({
    ...state,
    items,
    count,
    error: null,
  })),
  on(ProyectosActions.reorderFailure, (state, { error }) => ({ ...state, error })),
);
