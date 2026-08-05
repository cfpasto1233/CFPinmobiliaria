import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ReportesDanoState } from './reportes-dano.reducer';

export const selectReportesDanoState =
  createFeatureSelector<ReportesDanoState>('reportesDano');

export const selectReportesDanoItems = createSelector(
  selectReportesDanoState,
  (s) => s.items,
);
export const selectReportesDanoCount = createSelector(selectReportesDanoState, (s) => s.count);
export const selectReportesDanoListLoading = createSelector(
  selectReportesDanoState,
  (s) => s.listLoading,
);
export const selectReportesDanoListError = createSelector(
  selectReportesDanoState,
  (s) => s.listError,
);

export const selectReportesDanoLoading = createSelector(
  selectReportesDanoState,
  (s) => s.loading,
);
export const selectReportesDanoError = createSelector(selectReportesDanoState, (s) => s.error);

export const selectReportesDanoFotosView = createSelector(
  selectReportesDanoState,
  (s) => s.fotosView,
);
