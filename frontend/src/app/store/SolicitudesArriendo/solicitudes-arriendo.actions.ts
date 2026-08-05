import { createAction, props } from '@ngrx/store';
import { SolicitudArriendoForm, SolicitudArriendoPublic } from '../../../client';

export const SolicitudesArriendoActions = {
  load: createAction('[SolicitudesArriendo] Load'),
  loadSuccess: createAction(
    '[SolicitudesArriendo] Load Success',
    props<{ items: SolicitudArriendoPublic[]; count: number }>(),
  ),
  loadFailure: createAction('[SolicitudesArriendo] Load Failure', props<{ error: string }>()),

  create: createAction('[SolicitudesArriendo] Create', props<{ form: SolicitudArriendoForm }>()),
  createSuccess: createAction(
    '[SolicitudesArriendo] Create Success',
    props<{ item: SolicitudArriendoPublic }>(),
  ),
  createFailure: createAction('[SolicitudesArriendo] Create Failure', props<{ error: string }>()),
};
