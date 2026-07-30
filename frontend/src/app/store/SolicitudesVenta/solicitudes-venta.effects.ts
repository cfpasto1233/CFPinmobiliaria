import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, exhaustMap, map, of, tap } from 'rxjs';
import { SolicitudesVentaService } from '../../../client';
import { extractErrorMessage } from '../../core/http/http-error.util';
import { NotificationService } from '../../core/notifications/notification.service';
import { SolicitudesVentaActions } from './solicitudes-venta.actions';

@Injectable()
export class SolicitudesVentaEffects {
  private readonly actions$ = inject(Actions);
  private readonly solicitudesVentaService = inject(SolicitudesVentaService);
  private readonly notif = inject(NotificationService);

  load$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SolicitudesVentaActions.load),
      exhaustMap(() =>
        this.solicitudesVentaService.readSolicitudesVentaApiV1SolicitudesVentaGet(0, 100).pipe(
          map((response) =>
            SolicitudesVentaActions.loadSuccess({ items: response.data, count: response.count }),
          ),
          catchError((error) =>
            of(
              SolicitudesVentaActions.loadFailure({
                error: extractErrorMessage(error, 'No pudimos cargar las solicitudes de venta.'),
              }),
            ),
          ),
        ),
      ),
    ),
  );

  create$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SolicitudesVentaActions.create),
      exhaustMap(({ form }) =>
        this.solicitudesVentaService
          .createSolicitudVentaEndpointApiV1SolicitudesVentaPost(form)
          .pipe(
            map((item) => SolicitudesVentaActions.createSuccess({ item })),
            catchError((error) =>
              of(
                SolicitudesVentaActions.createFailure({
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
        ofType(SolicitudesVentaActions.createSuccess),
        tap(() =>
          this.notif.success('Tu solicitud fue registrada. Un asesor te contactará pronto.'),
        ),
      ),
    { dispatch: false },
  );

  createFailureNotify$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(SolicitudesVentaActions.createFailure),
        tap(({ error }) => this.notif.error(error)),
      ),
    { dispatch: false },
  );
}
