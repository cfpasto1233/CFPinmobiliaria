import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, exhaustMap, map, of, tap } from 'rxjs';
import { ReportesDanoService } from '../../../client';
import { extractErrorMessage } from '../../core/http/http-error.util';
import { NotificationService } from '../../core/notifications/notification.service';
import { ReporteDanoUploadService } from '../../features/reportes/reporte-dano-upload.service';
import { ReportesDanoActions } from './reportes-dano.actions';

@Injectable()
export class ReportesDanoEffects {
  private readonly actions$ = inject(Actions);
  private readonly uploadService = inject(ReporteDanoUploadService);
  private readonly reportesDanoService = inject(ReportesDanoService);
  private readonly notif = inject(NotificationService);

  load$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ReportesDanoActions.load),
      exhaustMap(() =>
        this.reportesDanoService.readReportesDanoApiV1ReportesDanoGet(0, 100).pipe(
          map((response) =>
            ReportesDanoActions.loadSuccess({ items: response.data, count: response.count }),
          ),
          catchError((error) =>
            of(
              ReportesDanoActions.loadFailure({
                error: extractErrorMessage(error, 'No pudimos cargar los reportes de daño.'),
              }),
            ),
          ),
        ),
      ),
    ),
  );

  create$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ReportesDanoActions.create),
      exhaustMap(({ form, fotos }) =>
        this.uploadService.crearReporteDano(form, fotos).pipe(
          map((item) => ReportesDanoActions.createSuccess({ item })),
          catchError((error) =>
            of(
              ReportesDanoActions.createFailure({
                error: extractErrorMessage(error, 'No pudimos registrar tu reporte.'),
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
        ofType(ReportesDanoActions.createSuccess),
        tap(() =>
          this.notif.success('Tu reporte fue registrado. Un asesor te contactará pronto.'),
        ),
      ),
    { dispatch: false },
  );

  createFailureNotify$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(ReportesDanoActions.createFailure),
        tap(({ error }) => this.notif.error(error)),
      ),
    { dispatch: false },
  );

  loadFotos$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ReportesDanoActions.loadFotos),
      exhaustMap(({ id }) =>
        this.reportesDanoService.readReporteDanoFotosApiV1ReportesDanoReporteIdFotosGet(id).pipe(
          map((response) => ReportesDanoActions.loadFotosSuccess({ fotos: response.fotos })),
          catchError((error) =>
            of(
              ReportesDanoActions.loadFotosFailure({
                error: extractErrorMessage(error, 'Este reporte no existe o el link ya expiró.'),
              }),
            ),
          ),
        ),
      ),
    ),
  );
}
