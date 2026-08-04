import { createReducer, on } from '@ngrx/store';
import { ReporteDanoPublic } from '../../../client';
import { ReportesDanoActions } from './reportes-dano.actions';

export interface ReportesDanoFotosView {
  fotos: string[];
  loading: boolean;
  error: string | null;
}

export interface ReportesDanoState {
  items: ReporteDanoPublic[];
  count: number;
  listLoading: boolean;
  listError: string | null;
  loading: boolean;
  error: string | null;
  fotosView: ReportesDanoFotosView;
}

const initialFotosView: ReportesDanoFotosView = {
  fotos: [],
  loading: false,
  error: null,
};

const initialState: ReportesDanoState = {
  items: [],
  count: 0,
  listLoading: false,
  listError: null,
  loading: false,
  error: null,
  fotosView: initialFotosView,
};

export const reportesDanoReducer = createReducer(
  initialState,

  on(ReportesDanoActions.load, (state) => ({ ...state, listLoading: true, listError: null })),
  on(ReportesDanoActions.loadSuccess, (state, { items, count }) => ({
    ...state,
    items,
    count,
    listLoading: false,
  })),
  on(ReportesDanoActions.loadFailure, (state, { error }) => ({
    ...state,
    listLoading: false,
    listError: error,
  })),

  on(ReportesDanoActions.create, (state) => ({ ...state, loading: true, error: null })),
  on(ReportesDanoActions.createSuccess, (state) => ({ ...state, loading: false })),
  on(ReportesDanoActions.createFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  on(ReportesDanoActions.loadFotos, (state) => ({
    ...state,
    fotosView: { ...initialFotosView, loading: true },
  })),
  on(ReportesDanoActions.loadFotosSuccess, (state, { fotos }) => ({
    ...state,
    fotosView: { fotos, loading: false, error: null },
  })),
  on(ReportesDanoActions.loadFotosFailure, (state, { error }) => ({
    ...state,
    fotosView: { fotos: [], loading: false, error },
  })),
);
