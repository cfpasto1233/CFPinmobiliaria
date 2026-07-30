import { createFeatureSelector, createSelector } from '@ngrx/store';
import { CampanaState } from './campana.reducer';

export const selectCampanaState = createFeatureSelector<CampanaState>('campana');

export const selectCampanaItem = createSelector(selectCampanaState, (s) => s.item);
export const selectCampanaLoading = createSelector(selectCampanaState, (s) => s.loading);
export const selectCampanaError = createSelector(selectCampanaState, (s) => s.error);
