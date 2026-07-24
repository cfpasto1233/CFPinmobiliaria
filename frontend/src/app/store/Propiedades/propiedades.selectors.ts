import { createFeatureSelector, createSelector } from '@ngrx/store';
import { PropiedadesState } from './propiedades.reducer';

export const selectPropiedadesState = createFeatureSelector<PropiedadesState>('propiedades');

export const selectPropiedadesItems = createSelector(selectPropiedadesState, (s) => s.items);
export const selectPropiedadesCount = createSelector(selectPropiedadesState, (s) => s.count);
export const selectPropiedadesLoading = createSelector(selectPropiedadesState, (s) => s.loading);
export const selectPropiedadesError = createSelector(selectPropiedadesState, (s) => s.error);
export const selectPropiedadSelected = createSelector(selectPropiedadesState, (s) => s.selected);
