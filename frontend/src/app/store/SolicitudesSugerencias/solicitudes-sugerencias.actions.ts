import { createAction, props } from '@ngrx/store';
import { SolicitudSugerenciaForm, SolicitudSugerenciaPublic } from '../../../client';

export const SolicitudesSugerenciasActions = {
  load: createAction('[SolicitudesSugerencias] Load'),
  loadSuccess: createAction(
    '[SolicitudesSugerencias] Load Success',
    props<{ items: SolicitudSugerenciaPublic[]; count: number }>(),
  ),
  loadFailure: createAction('[SolicitudesSugerencias] Load Failure', props<{ error: string }>()),

  create: createAction(
    '[SolicitudesSugerencias] Create',
    props<{ form: SolicitudSugerenciaForm }>(),
  ),
  createSuccess: createAction(
    '[SolicitudesSugerencias] Create Success',
    props<{ item: SolicitudSugerenciaPublic }>(),
  ),
  createFailure: createAction(
    '[SolicitudesSugerencias] Create Failure',
    props<{ error: string }>(),
  ),
};
