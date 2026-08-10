import { createReducer, on } from '@ngrx/store';
import { LogoPublic } from '../../../client';
import { LogosActions } from './logos.actions';

export interface LogosState {
  items: LogoPublic[];
  count: number;
  loading: boolean;
  error: string | null;
}

const initialState: LogosState = {
  items: [],
  count: 0,
  loading: false,
  error: null,
};

function upsert(items: LogoPublic[], item: LogoPublic): LogoPublic[] {
  const index = items.findIndex((existing) => existing.id === item.id);
  if (index === -1) {
    return [...items, item];
  }
  const next = [...items];
  next[index] = item;
  return next;
}

export const logosReducer = createReducer(
  initialState,

  on(LogosActions.load, (state) => ({ ...state, loading: true, error: null })),
  on(LogosActions.loadSuccess, (state, { items, count }) => ({
    ...state,
    items,
    count,
    loading: false,
  })),
  on(LogosActions.loadFailure, (state, { error }) => ({ ...state, loading: false, error })),

  on(LogosActions.create, (state) => ({ ...state, loading: true, error: null })),
  on(LogosActions.createSuccess, (state, { item }) => ({
    ...state,
    items: upsert(state.items, item),
    loading: false,
  })),
  on(LogosActions.createFailure, (state, { error }) => ({ ...state, loading: false, error })),

  on(LogosActions.update, (state) => ({ ...state, loading: true, error: null })),
  on(LogosActions.updateSuccess, (state, { item }) => ({
    ...state,
    items: upsert(state.items, item),
    loading: false,
  })),
  on(LogosActions.updateFailure, (state, { error }) => ({ ...state, loading: false, error })),

  on(LogosActions.remove, (state) => ({ ...state, loading: true, error: null })),
  on(LogosActions.removeSuccess, (state, { id }) => ({
    ...state,
    items: state.items.filter((item) => item.id !== id),
    loading: false,
  })),
  on(LogosActions.removeFailure, (state, { error }) => ({ ...state, loading: false, error })),

  on(LogosActions.replaceImagenSuccess, (state, { item }) => ({
    ...state,
    items: upsert(state.items, item),
  })),
  on(LogosActions.replaceImagenFailure, (state, { error }) => ({ ...state, error })),
);
