import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, exhaustMap, map, of, tap } from 'rxjs';
import { SolicitudesPublicarPropiedadService } from '../../../client';
import { extractErrorMessage } from '../../core/http/http-error.util';
import { NotificationService } from '../../core/notifications/notification.service';
import { SolicitudesPublicarPropiedadActions } from './solicitudes-publicar-propiedad.actions';

@Injectable()
export class SolicitudesPublicarPropiedadEffects {
  private readonly actions$ = inject(Actions);
  private readonly solicitudesPublicarPropiedadService = inject(
    SolicitudesPublicarPropiedadService,
  );
  private readonly notif = inject(NotificationService);

  load$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SolicitudesPublicarPropiedadActions.load),
      exhaustMap(() =>
        this.solicitudesPublicarPropiedadService
          .readSolicitudesPublicarPropiedadApiV1SolicitudesPublicarPropiedadGet(0, 100)
          .pipe(
            map((response) =>
              SolicitudesPublicarPropiedadActions.loadSuccess({
                items: response.data,
                count: response.count,
              }),
            ),
            catchError((error) =>
              of(
                SolicitudesPublicarPropiedadActions.loadFailure({
                  error: extractErrorMessage(
                    error,
                    'No pudimos cargar las solicitudes de publicación.',
                  ),
                }),
              ),
            ),
          ),
      ),
    ),
  );

  create$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SolicitudesPublicarPropiedadActions.create),
      exhaustMap(({ form }) =>
        this.solicitudesPublicarPropiedadService
          .createSolicitudPublicarPropiedadEndpointApiV1SolicitudesPublicarPropiedadPost(form)
          .pipe(
            map((item) => SolicitudesPublicarPropiedadActions.createSuccess({ item })),
            catchError((error) =>
              of(
                SolicitudesPublicarPropiedadActions.createFailure({
                  error: extractErrorMessage(error, 'No pudimos registrar tu solicitud.'),
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
        ofType(SolicitudesPublicarPropiedadActions.createSuccess),
        tap(() =>
          this.notif.success('Tu solicitud fue registrada. Un asesor te contactará pronto.'),
        ),
      ),
    { dispatch: false },
  );

  createFailureNotify$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(SolicitudesPublicarPropiedadActions.createFailure),
        tap(({ error }) => this.notif.error(error)),
      ),
    { dispatch: false },
  );
}
