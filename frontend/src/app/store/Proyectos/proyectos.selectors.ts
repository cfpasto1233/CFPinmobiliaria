import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ProyectosState } from './proyectos.reducer';

export const selectProyectosState = createFeatureSelector<ProyectosState>('proyectos');

export const selectProyectosItems = createSelector(selectProyectosState, (s) => s.items);
export const selectProyectosCount = createSelector(selectProyectosState, (s) => s.count);
export const selectProyectosLoading = createSelector(selectProyectosState, (s) => s.loading);
export const selectProyectosError = createSelector(selectProyectosState, (s) => s.error);
export const selectProyectoSelected = createSelector(selectProyectosState, (s) => s.selected);
