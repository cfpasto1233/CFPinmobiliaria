import { createAction, props } from '@ngrx/store';
import { ReporteDanoPublic } from '../../../client';
import { ReporteDanoForm } from './reporte-dano-form.model';

export const ReportesDanoActions = {
  // Listado para el panel admin (Reportes de daño).
  load: createAction('[ReportesDano] Load'),
  loadSuccess: createAction(
    '[ReportesDano] Load Success',
    props<{ items: ReporteDanoPublic[]; count: number }>(),
  ),
  loadFailure: createAction('[ReportesDano] Load Failure', props<{ error: string }>()),

  create: createAction(
    '[ReportesDano] Create',
    props<{ form: ReporteDanoForm; fotos: File[]; id: string }>(),
  ),
  createSuccess: createAction('[ReportesDano] Create Success', props<{ item: ReporteDanoPublic }>()),
  createFailure: createAction('[ReportesDano] Create Failure', props<{ error: string }>()),

  // Fotos de un reporte puntual vía el link temporal compartido por WhatsApp — no es un
  // listado, solo la vista de fotos de /reportes/:id/fotos.
  loadFotos: createAction('[ReportesDano] Load Fotos', props<{ id: string }>()),
  loadFotosSuccess: createAction(
    '[ReportesDano] Load Fotos Success',
    props<{ fotos: string[] }>(),
  ),
  loadFotosFailure: createAction(
    '[ReportesDano] Load Fotos Failure',
    props<{ error: string }>(),
  ),
};
