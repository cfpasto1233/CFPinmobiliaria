import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, exhaustMap, map, of, tap } from 'rxjs';
import { CampanasService } from '../../../client';
import { extractErrorMessage } from '../../core/http/http-error.util';
import { NotificationService } from '../../core/notifications/notification.service';
import { CampanaActions } from './campana.actions';

@Injectable()
export class CampanaEffects {
  private readonly actions$ = inject(Actions);
  private readonly campanasService = inject(CampanasService);
  private readonly notif = inject(NotificationService);

  load$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CampanaActions.load),
      exhaustMap(() =>
        this.campanasService.readCampanaApiV1CampanasGet().pipe(
          map((response) => CampanaActions.loadSuccess({ item: response.data })),
          catchError((error) =>
            of(
              CampanaActions.loadFailure({
                error: extractErrorMessage(error, 'No pudimos cargar la campaña.'),
              }),
            ),
          ),
        ),
      ),
    ),
  );

  save$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CampanaActions.save),
      exhaustMap(({ form }) =>
        this.campanasService.upsertCampanaEndpointApiV1CampanasPut(form).pipe(
          map((item) => CampanaActions.saveSuccess({ item })),
          catchError((error) =>
            of(
              CampanaActions.saveFailure({
                error: extractErrorMessage(error, 'No pudimos guardar la campaña.'),
              }),
            ),
          ),
        ),
      ),
    ),
  );

  saveSuccessNotify$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(CampanaActions.saveSuccess),
        tap(() => this.notif.success('Los cambios de la campaña se han guardado correctamente.')),
      ),
    { dispatch: false },
  );

  saveFailureNotify$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(CampanaActions.saveFailure),
        tap(({ error }) => this.notif.error(error)),
      ),
    { dispatch: false },
  );
}
