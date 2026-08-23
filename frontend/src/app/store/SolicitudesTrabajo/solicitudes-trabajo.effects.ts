import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, exhaustMap, map, of, tap } from 'rxjs';
import { SolicitudesTrabajoService } from '../../../client';
import { extractErrorMessage } from '../../core/http/http-error.util';
import { NotificationService } from '../../core/notifications/notification.service';
import { SolicitudTrabajoUploadService } from '../../features/trabaja-con-nosotros/solicitud-trabajo-upload.service';
import { SolicitudesTrabajoActions } from './solicitudes-trabajo.actions';

@Injectable()
export class SolicitudesTrabajoEffects {
  private readonly actions$ = inject(Actions);
  private readonly uploadService = inject(SolicitudTrabajoUploadService);
  private readonly solicitudesService = inject(SolicitudesTrabajoService);
  private readonly notif = inject(NotificationService);

  load$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SolicitudesTrabajoActions.load),
      exhaustMap(() =>
        this.solicitudesService.readSolicitudesTrabajoApiV1SolicitudesTrabajoGet(0, 100).pipe(
          map((response) =>
            SolicitudesTrabajoActions.loadSuccess({
              items: response.data,
              count: response.count,
            }),
          ),
          catchError((error) =>
            of(
              SolicitudesTrabajoActions.loadFailure({
                error: extractErrorMessage(error, 'No pudimos cargar las postulaciones.'),
              }),
            ),
          ),
        ),
      ),
    ),
  );

  loadOne$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SolicitudesTrabajoActions.loadOne),
      exhaustMap(({ id }) =>
        this.solicitudesService
          .readSolicitudTrabajoApiV1SolicitudesTrabajoSolicitudIdGet(id)
          .pipe(
            map((item) => SolicitudesTrabajoActions.loadOneSuccess({ item })),
            catchError((error) =>
              of(
                SolicitudesTrabajoActions.loadOneFailure({
                  error: extractErrorMessage(error, 'No pudimos cargar la postulación.'),
                }),
              ),
            ),
          ),
      ),
    ),
  );

  create$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SolicitudesTrabajoActions.create),
      exhaustMap(({ form, hojaDeVida }) =>
        this.uploadService.crearSolicitud(form, hojaDeVida).pipe(
          map((item) => SolicitudesTrabajoActions.createSuccess({ item })),
          catchError((error) =>
            of(
              SolicitudesTrabajoActions.createFailure({
                error: extractErrorMessage(error, 'No pudimos registrar tu postulación.'),
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
        ofType(SolicitudesTrabajoActions.createSuccess),
        tap(() => this.notif.success('¡Postulación recibida! Nuestro equipo revisará tu hoja de vida.')),
      ),
    { dispatch: false },
  );

  createFailureNotify$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(SolicitudesTrabajoActions.createFailure),
        tap(({ error }) => this.notif.error(error)),
      ),
    { dispatch: false },
  );
}
