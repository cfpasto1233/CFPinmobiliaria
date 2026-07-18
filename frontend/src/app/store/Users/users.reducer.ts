import { createReducer, on } from '@ngrx/store';
import { AdminUser, UsersActions } from './users.actions';

export interface UsersState {
  items: AdminUser[];
  loading: boolean;
  error: string | null;
}

const initialState: UsersState = {
  items: [],
  loading: false,
  error: null,
};

export const usersReducer = createReducer(
  initialState,

  on(UsersActions.load, (state) => ({ ...state, loading: true, error: null })),
  on(UsersActions.loadSuccess, (state, { users }) => ({
    ...state,
    items: users,
    loading: false,
  })),
  on(UsersActions.loadFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),
);
