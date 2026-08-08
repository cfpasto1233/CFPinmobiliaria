import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, exhaustMap, map, of, tap } from 'rxjs';
import { SolicitudesSugerenciasService } from '../../../client';
import { extractErrorMessage } from '../../core/http/http-error.util';
import { NotificationService } from '../../core/notifications/notification.service';
import { SolicitudesSugerenciasActions } from './solicitudes-sugerencias.actions';

@Injectable()
export class SolicitudesSugerenciasEffects {
  private readonly actions$ = inject(Actions);
  private readonly solicitudesSugerenciasService = inject(SolicitudesSugerenciasService);
  private readonly notif = inject(NotificationService);

  load$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SolicitudesSugerenciasActions.load),
      exhaustMap(() =>
        this.solicitudesSugerenciasService
          .readSolicitudesSugerenciasApiV1SolicitudesSugerenciasGet(0, 100)
          .pipe(
            map((response) =>
              SolicitudesSugerenciasActions.loadSuccess({
                items: response.data,
                count: response.count,
              }),
            ),
            catchError((error) =>
              of(
                SolicitudesSugerenciasActions.loadFailure({
                  error: extractErrorMessage(error, 'No pudimos cargar las sugerencias.'),
                }),
              ),
            ),
          ),
      ),
    ),
  );

  create$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SolicitudesSugerenciasActions.create),
      exhaustMap(({ form }) =>
        this.solicitudesSugerenciasService
          .createSolicitudSugerenciaEndpointApiV1SolicitudesSugerenciasPost(form)
          .pipe(
            map((item) => SolicitudesSugerenciasActions.createSuccess({ item })),
            catchError((error) =>
              of(
                SolicitudesSugerenciasActions.createFailure({
                  error: extractErrorMessage(error, 'No pudimos registrar tu sugerencia.'),
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
        ofType(SolicitudesSugerenciasActions.createSuccess),
        tap(() => this.notif.success('Tu sugerencia fue registrada. ¡Gracias por tu aporte!')),
      ),
    { dispatch: false },
  );

  createFailureNotify$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(SolicitudesSugerenciasActions.createFailure),
        tap(({ error }) => this.notif.error(error)),
      ),
    { dispatch: false },
  );
}
