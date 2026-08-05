import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, exhaustMap, map, of, tap } from 'rxjs';
import { SolicitudesArriendoService } from '../../../client';
import { extractErrorMessage } from '../../core/http/http-error.util';
import { NotificationService } from '../../core/notifications/notification.service';
import { SolicitudesArriendoActions } from './solicitudes-arriendo.actions';

@Injectable()
export class SolicitudesArriendoEffects {
  private readonly actions$ = inject(Actions);
  private readonly solicitudesArriendoService = inject(SolicitudesArriendoService);
  private readonly notif = inject(NotificationService);

  load$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SolicitudesArriendoActions.load),
      exhaustMap(() =>
        this.solicitudesArriendoService
          .readSolicitudesArriendoApiV1SolicitudesArriendoGet(0, 100)
          .pipe(
            map((response) =>
              SolicitudesArriendoActions.loadSuccess({
                items: response.data,
                count: response.count,
              }),
            ),
            catchError((error) =>
              of(
                SolicitudesArriendoActions.loadFailure({
                  error: extractErrorMessage(error, 'No pudimos cargar las solicitudes de arriendo.'),
                }),
              ),
            ),
          ),
      ),
    ),
  );

  create$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SolicitudesArriendoActions.create),
      exhaustMap(({ form }) =>
        this.solicitudesArriendoService
          .createSolicitudArriendoEndpointApiV1SolicitudesArriendoPost(form)
          .pipe(
            map((item) => SolicitudesArriendoActions.createSuccess({ item })),
            catchError((error) =>
              of(
                SolicitudesArriendoActions.createFailure({
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
        ofType(SolicitudesArriendoActions.createSuccess),
        tap(() =>
          this.notif.success('Tu solicitud fue registrada. Un asesor te contactará pronto.'),
        ),
      ),
    { dispatch: false },
  );

  createFailureNotify$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(SolicitudesArriendoActions.createFailure),
        tap(({ error }) => this.notif.error(error)),
      ),
    { dispatch: false },
  );
}
