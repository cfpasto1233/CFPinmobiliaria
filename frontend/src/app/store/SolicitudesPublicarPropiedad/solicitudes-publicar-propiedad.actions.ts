import { createAction, props } from '@ngrx/store';
import { SolicitudPublicarPropiedadForm, SolicitudPublicarPropiedadPublic } from '../../../client';

export const SolicitudesPublicarPropiedadActions = {
  load: createAction('[SolicitudesPublicarPropiedad] Load'),
  loadSuccess: createAction(
    '[SolicitudesPublicarPropiedad] Load Success',
    props<{ items: SolicitudPublicarPropiedadPublic[]; count: number }>(),
  ),
  loadFailure: createAction(
    '[SolicitudesPublicarPropiedad] Load Failure',
    props<{ error: string }>(),
  ),

  create: createAction(
    '[SolicitudesPublicarPropiedad] Create',
    props<{ form: SolicitudPublicarPropiedadForm }>(),
  ),
  createSuccess: createAction(
    '[SolicitudesPublicarPropiedad] Create Success',
    props<{ item: SolicitudPublicarPropiedadPublic }>(),
  ),
  createFailure: createAction(
    '[SolicitudesPublicarPropiedad] Create Failure',
    props<{ error: string }>(),
  ),
};
