import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, exhaustMap, map, of, tap } from 'rxjs';
import { CitasService } from '../../../client';
import { extractErrorMessage } from '../../core/http/http-error.util';
import { NotificationService } from '../../core/notifications/notification.service';
import { CitasActions } from './citas.actions';

@Injectable()
export class CitasEffects {
  private readonly actions$ = inject(Actions);
  private readonly citasService = inject(CitasService);
  private readonly notif = inject(NotificationService);

  load$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CitasActions.load),
      exhaustMap(({ desde, hasta }) =>
        this.citasService.readCitasApiV1CitasGet(desde, hasta).pipe(
          map((response) =>
            CitasActions.loadSuccess({
              items: response.data,
              count: response.count,
              desde,
              hasta,
            }),
          ),
          catchError((error) =>
            of(
              CitasActions.loadFailure({
                error: extractErrorMessage(error, 'No pudimos cargar las citas.'),
              }),
            ),
          ),
        ),
      ),
    ),
  );

  create$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CitasActions.create),
      exhaustMap(({ form }) =>
        this.citasService.createCitaEndpointApiV1CitasPost(form).pipe(
          map((item) => CitasActions.createSuccess({ item })),
          catchError((error) =>
            of(
              CitasActions.createFailure({
                error: extractErrorMessage(error, 'No pudimos crear la cita.'),
              }),
            ),
          ),
        ),
      ),
    ),
  );

  update$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CitasActions.update),
      exhaustMap(({ id, form }) =>
        this.citasService.updateCitaEndpointApiV1CitasCitaIdPatch(id, form).pipe(
          map((item) => CitasActions.updateSuccess({ item })),
          catchError((error) =>
            of(
              CitasActions.updateFailure({
                error: extractErrorMessage(error, 'No pudimos actualizar la cita.'),
              }),
            ),
          ),
        ),
      ),
    ),
  );

  delete$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CitasActions.delete),
      exhaustMap(({ id }) =>
        this.citasService.deleteCitaEndpointApiV1CitasCitaIdDelete(id).pipe(
          map(() => CitasActions.deleteSuccess({ id })),
          catchError((error) =>
            of(
              CitasActions.deleteFailure({
                error: extractErrorMessage(error, 'No pudimos eliminar la cita.'),
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
        ofType(CitasActions.createSuccess),
        tap(() => this.notif.success('La cita se creó correctamente.')),
      ),
    { dispatch: false },
  );

  createFailureNotify$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(CitasActions.createFailure),
        tap(({ error }) => this.notif.error(error)),
      ),
    { dispatch: false },
  );

  updateSuccessNotify$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(CitasActions.updateSuccess),
        tap(() => this.notif.success('La cita se actualizó correctamente.')),
      ),
    { dispatch: false },
  );

  updateFailureNotify$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(CitasActions.updateFailure),
        tap(({ error }) => this.notif.error(error)),
      ),
    { dispatch: false },
  );

  deleteSuccessNotify$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(CitasActions.deleteSuccess),
        tap(() => this.notif.success('La cita se eliminó correctamente.')),
      ),
    { dispatch: false },
  );

  deleteFailureNotify$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(CitasActions.deleteFailure),
        tap(({ error }) => this.notif.error(error)),
      ),
    { dispatch: false },
  );

  loadDisponibilidadRecaudo$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CitasActions.loadDisponibilidadRecaudo),
      exhaustMap(({ desde, hasta }) =>
        this.citasService
          .readDisponibilidadRecaudoApiV1CitasRecaudoDisponibilidadGet(desde, hasta)
          .pipe(
            map((response) =>
              CitasActions.loadDisponibilidadRecaudoSuccess({ dias: response.dias }),
            ),
            catchError((error) =>
              of(
                CitasActions.loadDisponibilidadRecaudoFailure({
                  error: extractErrorMessage(error, 'No pudimos cargar la disponibilidad.'),
                }),
              ),
            ),
          ),
      ),
    ),
  );

  crearRecaudo$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CitasActions.crearRecaudo),
      exhaustMap(({ form }) =>
        this.citasService.createCitaRecaudoEndpointApiV1CitasRecaudoPost(form).pipe(
          map((item) => CitasActions.crearRecaudoSuccess({ item })),
          catchError((error) =>
            of(
              CitasActions.crearRecaudoFailure({
                error: extractErrorMessage(
                  error,
                  'No pudimos agendar tu visita. Elige otro horario.',
                ),
              }),
            ),
          ),
        ),
      ),
    ),
  );

  crearRecaudoSuccessNotify$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(CitasActions.crearRecaudoSuccess),
        tap(() => this.notif.success('Tu visita de recaudo fue agendada correctamente.')),
      ),
    { dispatch: false },
  );

  crearRecaudoFailureNotify$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(CitasActions.crearRecaudoFailure),
        tap(({ error }) => this.notif.error(error)),
      ),
    { dispatch: false },
  );
}
