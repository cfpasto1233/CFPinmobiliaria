import { createAction, props } from '@ngrx/store';
import { SolicitudArrendarPropiedadForm, SolicitudArrendarPropiedadPublic } from '../../../client';

export const SolicitudesArrendarPropiedadActions = {
  load: createAction('[SolicitudesArrendarPropiedad] Load'),
  loadSuccess: createAction(
    '[SolicitudesArrendarPropiedad] Load Success',
    props<{ items: SolicitudArrendarPropiedadPublic[]; count: number }>(),
  ),
  loadFailure: createAction(
    '[SolicitudesArrendarPropiedad] Load Failure',
    props<{ error: string }>(),
  ),

  create: createAction(
    '[SolicitudesArrendarPropiedad] Create',
    props<{ form: SolicitudArrendarPropiedadForm }>(),
  ),
  createSuccess: createAction(
    '[SolicitudesArrendarPropiedad] Create Success',
    props<{ item: SolicitudArrendarPropiedadPublic }>(),
  ),
  createFailure: createAction(
    '[SolicitudesArrendarPropiedad] Create Failure',
    props<{ error: string }>(),
  ),
};
