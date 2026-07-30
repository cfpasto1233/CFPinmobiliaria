import { createAction, props } from '@ngrx/store';
import { SolicitudVentaForm, SolicitudVentaPublic } from '../../../client';

export const SolicitudesVentaActions = {
  load: createAction('[SolicitudesVenta] Load'),
  loadSuccess: createAction(
    '[SolicitudesVenta] Load Success',
    props<{ items: SolicitudVentaPublic[]; count: number }>(),
  ),
  loadFailure: createAction('[SolicitudesVenta] Load Failure', props<{ error: string }>()),

  create: createAction('[SolicitudesVenta] Create', props<{ form: SolicitudVentaForm }>()),
  createSuccess: createAction(
    '[SolicitudesVenta] Create Success',
    props<{ item: SolicitudVentaPublic }>(),
  ),
  createFailure: createAction('[SolicitudesVenta] Create Failure', props<{ error: string }>()),
};
