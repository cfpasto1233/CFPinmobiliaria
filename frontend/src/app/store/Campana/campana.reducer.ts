import { createReducer, on } from '@ngrx/store';
import { CampanaPublic } from '../../../client';
import { CampanaActions } from './campana.actions';

export interface CampanaState {
  item: CampanaPublic | null;
  loading: boolean;
  error: string | null;
}

const initialState: CampanaState = {
  item: null,
  loading: false,
  error: null,
};

export const campanaReducer = createReducer(
  initialState,

  on(CampanaActions.load, (state) => ({ ...state, loading: true, error: null })),
  on(CampanaActions.loadSuccess, (state, { item }) => ({ ...state, item, loading: false })),
  on(CampanaActions.loadFailure, (state, { error }) => ({ ...state, loading: false, error })),

  on(CampanaActions.save, (state) => ({ ...state, loading: true, error: null })),
  on(CampanaActions.saveSuccess, (state, { item }) => ({ ...state, item, loading: false })),
  on(CampanaActions.saveFailure, (state, { error }) => ({ ...state, loading: false, error })),
);
