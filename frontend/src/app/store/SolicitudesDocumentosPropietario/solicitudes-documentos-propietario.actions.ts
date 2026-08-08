import { createAction, props } from '@ngrx/store';
import {
  SolicitudDocumentoPropietarioDetalle,
  SolicitudDocumentoPropietarioPublic,
} from '../../../client';
import { SolicitudDocumentoForm } from './solicitud-documento-form.model';

export const SolicitudesDocumentosPropietarioActions = {
  // Listado para el panel admin.
  load: createAction('[SolicitudesDocumentosPropietario] Load'),
  loadSuccess: createAction(
    '[SolicitudesDocumentosPropietario] Load Success',
    props<{ items: SolicitudDocumentoPropietarioPublic[]; count: number }>(),
  ),
  loadFailure: createAction(
    '[SolicitudesDocumentosPropietario] Load Failure',
    props<{ error: string }>(),
  ),

  // Detalle admin, con las URLs firmadas de los 5 documentos.
  loadOne: createAction('[SolicitudesDocumentosPropietario] Load One', props<{ id: string }>()),
  loadOneSuccess: createAction(
    '[SolicitudesDocumentosPropietario] Load One Success',
    props<{ item: SolicitudDocumentoPropietarioDetalle }>(),
  ),
  loadOneFailure: createAction(
    '[SolicitudesDocumentosPropietario] Load One Failure',
    props<{ error: string }>(),
  ),

  // Carga pública desde /publicar-por-tu-cuenta.
  create: createAction(
    '[SolicitudesDocumentosPropietario] Create',
    props<{
      form: SolicitudDocumentoForm;
      cedula: File;
      certificadoLibertad: File;
      escritura: File;
      poder: File | null;
      comprobantePago: File;
    }>(),
  ),
  createSuccess: createAction(
    '[SolicitudesDocumentosPropietario] Create Success',
    props<{ item: SolicitudDocumentoPropietarioPublic }>(),
  ),
  createFailure: createAction(
    '[SolicitudesDocumentosPropietario] Create Failure',
    props<{ error: string }>(),
  ),

  // Acción admin: valida y genera el link único de 48h.
  validar: createAction('[SolicitudesDocumentosPropietario] Validar', props<{ id: string }>()),
  validarSuccess: createAction(
    '[SolicitudesDocumentosPropietario] Validar Success',
    props<{ item: SolicitudDocumentoPropietarioPublic }>(),
  ),
  validarFailure: createAction(
    '[SolicitudesDocumentosPropietario] Validar Failure',
    props<{ error: string }>(),
  ),

  // Chequeo público del token antes de mostrar el formulario de /publicar-mi-propiedad/:token.
  checkToken: createAction(
    '[SolicitudesDocumentosPropietario] Check Token',
    props<{ token: string }>(),
  ),
  checkTokenSuccess: createAction(
    '[SolicitudesDocumentosPropietario] Check Token Success',
    props<{ valido: boolean; motivo: string | null }>(),
  ),
  checkTokenFailure: createAction(
    '[SolicitudesDocumentosPropietario] Check Token Failure',
    props<{ error: string }>(),
  ),
};
