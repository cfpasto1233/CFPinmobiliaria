import { createReducer, on } from '@ngrx/store';
import { EventoPublic } from '../../../client';
import { EventosActions } from './eventos.actions';

export interface EventosState {
  items: EventoPublic[];
  selected: EventoPublic | null;
  count: number;
  loading: boolean;
  error: string | null;
}

const initialState: EventosState = {
  items: [],
  selected: null,
  count: 0,
  loading: false,
  error: null,
};

function upsert(items: EventoPublic[], item: EventoPublic): EventoPublic[] {
  const index = items.findIndex((existing) => existing.id === item.id);
  if (index === -1) {
    return [...items, item];
  }
  const next = [...items];
  next[index] = item;
  return next;
}

export const eventosReducer = createReducer(
  initialState,

  on(EventosActions.load, (state) => ({ ...state, loading: true, error: null })),
  on(EventosActions.loadSuccess, (state, { items, count }) => ({
    ...state,
    items,
    count,
    loading: false,
  })),
  on(EventosActions.loadFailure, (state, { error }) => ({ ...state, loading: false, error })),

  on(EventosActions.loadOne, (state) => ({ ...state, loading: true, error: null })),
  on(EventosActions.loadOneSuccess, (state, { item }) => ({
    ...state,
    selected: item,
    items: upsert(state.items, item),
    loading: false,
  })),
  on(EventosActions.loadOneFailure, (state, { error }) => ({ ...state, loading: false, error })),

  on(EventosActions.create, (state) => ({ ...state, loading: true, error: null })),
  on(EventosActions.createSuccess, (state, { item }) => ({
    ...state,
    items: upsert(state.items, item),
    selected: item,
    loading: false,
  })),
  on(EventosActions.createFailure, (state, { error }) => ({ ...state, loading: false, error })),

  on(EventosActions.update, (state) => ({ ...state, loading: true, error: null })),
  on(EventosActions.updateSuccess, (state, { item }) => ({
    ...state,
    items: upsert(state.items, item),
    selected: item,
    loading: false,
  })),
  on(EventosActions.updateFailure, (state, { error }) => ({ ...state, loading: false, error })),

  on(EventosActions.remove, (state) => ({ ...state, loading: true, error: null })),
  on(EventosActions.removeSuccess, (state, { id }) => ({
    ...state,
    items: state.items.filter((item) => item.id !== id),
    selected: state.selected?.id === id ? null : state.selected,
    loading: false,
  })),
  on(EventosActions.removeFailure, (state, { error }) => ({ ...state, loading: false, error })),

  on(EventosActions.replaceFotoSuccess, (state, { item }) => ({
    ...state,
    items: upsert(state.items, item),
    selected: item,
  })),
  on(EventosActions.replaceFotoFailure, (state, { error }) => ({ ...state, error })),
);
