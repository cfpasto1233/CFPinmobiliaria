import { createFeatureSelector, createSelector } from '@ngrx/store';
import { UsersState } from './users.reducer';

export const selectUsersState = createFeatureSelector<UsersState>('users');

export const selectUsersList = createSelector(selectUsersState, (s) => s.items);
export const selectUsersLoading = createSelector(selectUsersState, (s) => s.loading);
export const selectUsersError = createSelector(selectUsersState, (s) => s.error);
