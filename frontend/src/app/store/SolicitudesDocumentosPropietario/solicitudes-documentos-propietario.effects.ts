import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, exhaustMap, map, of, tap } from 'rxjs';
import { SolicitudesDocumentosPropietarioService } from '../../../client';
import { SolicitudDocumentoUploadService } from '../../features/publicar-por-tu-cuenta/solicitud-documento-upload.service';
import { extractErrorMessage } from '../../core/http/http-error.util';
import { NotificationService } from '../../core/notifications/notification.service';
import { SolicitudesDocumentosPropietarioActions } from './solicitudes-documentos-propietario.actions';

@Injectable()
export class SolicitudesDocumentosPropietarioEffects {
  private readonly actions$ = inject(Actions);
  private readonly uploadService = inject(SolicitudDocumentoUploadService);
  private readonly solicitudesService = inject(SolicitudesDocumentosPropietarioService);
  private readonly notif = inject(NotificationService);

  load$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SolicitudesDocumentosPropietarioActions.load),
      exhaustMap(() =>
        this.solicitudesService
          .readSolicitudesDocumentosPropietarioApiV1SolicitudesDocumentosPropietarioGet(0, 100)
          .pipe(
            map((response) =>
              SolicitudesDocumentosPropietarioActions.loadSuccess({
                items: response.data,
                count: response.count,
              }),
            ),
            catchError((error) =>
              of(
                SolicitudesDocumentosPropietarioActions.loadFailure({
                  error: extractErrorMessage(error, 'No pudimos cargar las solicitudes de documentos.'),
                }),
              ),
            ),
          ),
      ),
    ),
  );

  loadOne$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SolicitudesDocumentosPropietarioActions.loadOne),
      exhaustMap(({ id }) =>
        this.solicitudesService
          .readSolicitudDocumentoPropietarioApiV1SolicitudesDocumentosPropietarioSolicitudIdGet(id)
          .pipe(
            map((item) => SolicitudesDocumentosPropietarioActions.loadOneSuccess({ item })),
            catchError((error) =>
              of(
                SolicitudesDocumentosPropietarioActions.loadOneFailure({
                  error: extractErrorMessage(error, 'No pudimos cargar la solicitud.'),
                }),
              ),
            ),
          ),
      ),
    ),
  );

  create$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SolicitudesDocumentosPropietarioActions.create),
      exhaustMap(({ form, cedula, certificadoLibertad, escritura, poder, comprobantePago }) =>
        this.uploadService
          .crearSolicitud(form, cedula, certificadoLibertad, escritura, poder, comprobantePago)
          .pipe(
            map((item) => SolicitudesDocumentosPropietarioActions.createSuccess({ item })),
            catchError((error) =>
              of(
                SolicitudesDocumentosPropietarioActions.createFailure({
                  error: extractErrorMessage(error, 'No pudimos registrar tus documentos.'),
                }),
              ),
            ),
          ),
      ),
    ),
  );

  createSuccessNotify$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(SolicitudesDocumentosPropietarioActions.createSuccess),
        tap(() =>
          this.notif.success('Documentos recibidos. Nuestro equipo los revisará pronto.'),
        ),
      ),
    { dispatch: false },
  );

  createFailureNotify$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(SolicitudesDocumentosPropietarioActions.createFailure),
        tap(({ error }) => this.notif.error(error)),
      ),
    { dispatch: false },
  );

  validar$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SolicitudesDocumentosPropietarioActions.validar),
      exhaustMap(({ id }) =>
        this.solicitudesService
          .validarSolicitudDocumentoPropietarioEndpointApiV1SolicitudesDocumentosPropietarioSolicitudIdValidarPost(
            id,
          )
          .pipe(
            map((item) => SolicitudesDocumentosPropietarioActions.validarSuccess({ item })),
            catchError((error) =>
              of(
                SolicitudesDocumentosPropietarioActions.validarFailure({
                  error: extractErrorMessage(error, 'No pudimos validar la solicitud.'),
                }),
              ),
            ),
          ),
      ),
    ),
  );

  validarFailureNotify$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(SolicitudesDocumentosPropietarioActions.validarFailure),
        tap(({ error }) => this.notif.error(error)),
      ),
    { dispatch: false },
  );

  checkToken$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SolicitudesDocumentosPropietarioActions.checkToken),
      exhaustMap(({ token }) =>
        this.solicitudesService
          .checkTokenEndpointApiV1SolicitudesDocumentosPropietarioTokenTokenGet(token)
          .pipe(
            map((response) =>
              SolicitudesDocumentosPropietarioActions.checkTokenSuccess({
                valido: response.valido,
                motivo: response.motivo ?? null,
              }),
            ),
            catchError((error) =>
              of(
                SolicitudesDocumentosPropietarioActions.checkTokenFailure({
                  error: extractErrorMessage(error, 'No pudimos validar este link.'),
                }),
              ),
            ),
          ),
      ),
    ),
  );
}
