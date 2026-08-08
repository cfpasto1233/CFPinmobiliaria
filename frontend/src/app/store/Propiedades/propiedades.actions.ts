import { createAction, props } from '@ngrx/store';
import { PropiedadPublic, PropiedadUpdate } from '../../../client';
import { PropiedadForm } from './propiedad-form.model';

export const PropiedadesActions = {
  load: createAction('[Propiedades] Load'),
  loadSuccess: createAction(
    '[Propiedades] Load Success',
    props<{ items: PropiedadPublic[]; count: number }>(),
  ),
  loadFailure: createAction('[Propiedades] Load Failure', props<{ error: string }>()),

  loadOne: createAction('[Propiedades] Load One', props<{ id: string }>()),
  loadOneSuccess: createAction('[Propiedades] Load One Success', props<{ item: PropiedadPublic }>()),
  loadOneFailure: createAction('[Propiedades] Load One Failure', props<{ error: string }>()),

  create: createAction(
    '[Propiedades] Create',
    props<{ form: PropiedadForm; fotoPrincipal: File; video: File | null }>(),
  ),
  createSuccess: createAction('[Propiedades] Create Success', props<{ item: PropiedadPublic }>()),
  createFailure: createAction('[Propiedades] Create Failure', props<{ error: string }>()),

  // Publicación pública vía el link de un solo uso que entrega el superadmin al
  // validar los documentos del propietario (ver store/SolicitudesDocumentosPropietario).
  createConToken: createAction(
    '[Propiedades] Create Con Token',
    props<{ token: string; form: PropiedadForm; fotoPrincipal: File; video: File | null }>(),
  ),
  createConTokenSuccess: createAction(
    '[Propiedades] Create Con Token Success',
    props<{ item: PropiedadPublic }>(),
  ),
  createConTokenFailure: createAction(
    '[Propiedades] Create Con Token Failure',
    props<{ error: string }>(),
  ),

  update: createAction(
    '[Propiedades] Update',
    props<{ id: string; changes: PropiedadUpdate }>(),
  ),
  updateSuccess: createAction('[Propiedades] Update Success', props<{ item: PropiedadPublic }>()),
  updateFailure: createAction('[Propiedades] Update Failure', props<{ error: string }>()),

  remove: createAction('[Propiedades] Remove', props<{ id: string }>()),
  removeSuccess: createAction('[Propiedades] Remove Success', props<{ id: string }>()),
  removeFailure: createAction('[Propiedades] Remove Failure', props<{ error: string }>()),

  addFoto: createAction(
    '[Propiedades] Add Foto',
    props<{ propiedadId: string; file: File }>(),
  ),
  addFotoSuccess: createAction('[Propiedades] Add Foto Success', props<{ item: PropiedadPublic }>()),
  addFotoFailure: createAction('[Propiedades] Add Foto Failure', props<{ error: string }>()),

  removeFoto: createAction(
    '[Propiedades] Remove Foto',
    props<{ propiedadId: string; fotoId: string }>(),
  ),
  removeFotoSuccess: createAction('[Propiedades] Remove Foto Success', props<{ item: PropiedadPublic }>()),
  removeFotoFailure: createAction('[Propiedades] Remove Foto Failure', props<{ error: string }>()),

  setVideo: createAction(
    '[Propiedades] Set Video',
    props<{ propiedadId: string; file: File }>(),
  ),
  setVideoSuccess: createAction('[Propiedades] Set Video Success', props<{ item: PropiedadPublic }>()),
  setVideoFailure: createAction('[Propiedades] Set Video Failure', props<{ error: string }>()),

  removeVideo: createAction('[Propiedades] Remove Video', props<{ propiedadId: string }>()),
  removeVideoSuccess: createAction(
    '[Propiedades] Remove Video Success',
    props<{ item: PropiedadPublic }>(),
  ),
  removeVideoFailure: createAction('[Propiedades] Remove Video Failure', props<{ error: string }>()),

  replaceFotoPrincipal: createAction(
    '[Propiedades] Replace Foto Principal',
    props<{ propiedadId: string; file: File }>(),
  ),
  replaceFotoPrincipalSuccess: createAction(
    '[Propiedades] Replace Foto Principal Success',
    props<{ item: PropiedadPublic }>(),
  ),
  replaceFotoPrincipalFailure: createAction(
    '[Propiedades] Replace Foto Principal Failure',
    props<{ error: string }>(),
  ),

  reorder: createAction('[Propiedades] Reorder', props<{ ids: string[] }>()),
  reorderSuccess: createAction(
    '[Propiedades] Reorder Success',
    props<{ items: PropiedadPublic[]; count: number }>(),
  ),
  reorderFailure: createAction('[Propiedades] Reorder Failure', props<{ error: string }>()),
};
