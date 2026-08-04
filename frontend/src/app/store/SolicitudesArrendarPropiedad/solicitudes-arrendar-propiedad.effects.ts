import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, exhaustMap, map, of, tap } from 'rxjs';
import { SolicitudesArrendarPropiedadService } from '../../../client';
import { extractErrorMessage } from '../../core/http/http-error.util';
import { NotificationService } from '../../core/notifications/notification.service';
import { SolicitudesArrendarPropiedadActions } from './solicitudes-arrendar-propiedad.actions';

@Injectable()
export class SolicitudesArrendarPropiedadEffects {
  private readonly actions$ = inject(Actions);
  private readonly solicitudesArrendarPropiedadService = inject(
    SolicitudesArrendarPropiedadService,
  );
  private readonly notif = inject(NotificationService);

  load$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SolicitudesArrendarPropiedadActions.load),
      exhaustMap(() =>
        this.solicitudesArrendarPropiedadService
          .readSolicitudesArrendarPropiedadApiV1SolicitudesArrendarPropiedadGet(0, 100)
          .pipe(
            map((response) =>
              SolicitudesArrendarPropiedadActions.loadSuccess({
                items: response.data,
                count: response.count,
              }),
            ),
            catchError((error) =>
              of(
                SolicitudesArrendarPropiedadActions.loadFailure({
                  error: extractErrorMessage(
                    error,
                    'No pudimos cargar las solicitudes de propietarios.',
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
      ofType(SolicitudesArrendarPropiedadActions.create),
      exhaustMap(({ form }) =>
        this.solicitudesArrendarPropiedadService
          .createSolicitudArrendarPropiedadEndpointApiV1SolicitudesArrendarPropiedadPost(form)
          .pipe(
            map((item) => SolicitudesArrendarPropiedadActions.createSuccess({ item })),
            catchError((error) =>
              of(
                SolicitudesArrendarPropiedadActions.createFailure({
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
        ofType(SolicitudesArrendarPropiedadActions.createSuccess),
        tap(() =>
          this.notif.success('Tu solicitud fue registrada. Un asesor te contactará pronto.'),
        ),
      ),
    { dispatch: false },
  );

  createFailureNotify$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(SolicitudesArrendarPropiedadActions.createFailure),
        tap(({ error }) => this.notif.error(error)),
      ),
    { dispatch: false },
  );
}
