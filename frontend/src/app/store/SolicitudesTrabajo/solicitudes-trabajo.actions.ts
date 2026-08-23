import { createAction, props } from '@ngrx/store';
import { SolicitudTrabajoDetalle, SolicitudTrabajoPublic } from '../../../client';
import { SolicitudTrabajoForm } from './solicitud-trabajo-form.model';

export const SolicitudesTrabajoActions = {
  // Listado para el panel admin.
  load: createAction('[SolicitudesTrabajo] Load'),
  loadSuccess: createAction(
    '[SolicitudesTrabajo] Load Success',
    props<{ items: SolicitudTrabajoPublic[]; count: number }>(),
  ),
  loadFailure: createAction('[SolicitudesTrabajo] Load Failure', props<{ error: string }>()),

  // Detalle admin, con la URL firmada de la hoja de vida.
  loadOne: createAction('[SolicitudesTrabajo] Load One', props<{ id: string }>()),
  loadOneSuccess: createAction(
    '[SolicitudesTrabajo] Load One Success',
    props<{ item: SolicitudTrabajoDetalle }>(),
  ),
  loadOneFailure: createAction('[SolicitudesTrabajo] Load One Failure', props<{ error: string }>()),

  // Postulación pública desde /trabaja-con-nosotros.
  create: createAction(
    '[SolicitudesTrabajo] Create',
    props<{ form: SolicitudTrabajoForm; hojaDeVida: File }>(),
  ),
  createSuccess: createAction(
    '[SolicitudesTrabajo] Create Success',
    props<{ item: SolicitudTrabajoPublic }>(),
  ),
  createFailure: createAction('[SolicitudesTrabajo] Create Failure', props<{ error: string }>()),
};
