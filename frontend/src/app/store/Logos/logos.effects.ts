import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, exhaustMap, map, of, tap } from 'rxjs';
import { LogosService } from '../../../client';
import { LogoUploadService } from '../../features/admin/logos/logo-upload.service';
import { extractErrorMessage } from '../../core/http/http-error.util';
import { NotificationService } from '../../core/notifications/notification.service';
import { LogosActions } from './logos.actions';

@Injectable()
export class LogosEffects {
  private readonly actions$ = inject(Actions);
  private readonly router = inject(Router);
  private readonly logosService = inject(LogosService);
  private readonly uploadService = inject(LogoUploadService);
  private readonly notif = inject(NotificationService);

  load$ = createEffect(() =>
    this.actions$.pipe(
      ofType(LogosActions.load),
      exhaustMap(() =>
        this.logosService.readLogosApiV1LogosGet(0, 100).pipe(
          map((response) => LogosActions.loadSuccess({ items: response.data, count: response.count })),
          catchError((error) =>
            of(
              LogosActions.loadFailure({
                error: extractErrorMessage(error, 'No pudimos cargar los logos.'),
              }),
            ),
          ),
        ),
      ),
    ),
  );

  create$ = createEffect(() =>
    this.actions$.pipe(
      ofType(LogosActions.create),
      exhaustMap(({ form, imagen }) =>
        this.uploadService.createLogo(form, imagen).pipe(
          map((item) => LogosActions.createSuccess({ item })),
          catchError((error) =>
            of(
              LogosActions.createFailure({
                error: extractErrorMessage(error, 'No pudimos crear el logo.'),
              }),
            ),
          ),
        ),
      ),
    ),
  );

  update$ = createEffect(() =>
    this.actions$.pipe(
      ofType(LogosActions.update),
      exhaustMap(({ id, changes }) =>
        this.logosService.updateLogoEndpointApiV1LogosLogoIdPatch(id, changes).pipe(
          map((item) => LogosActions.updateSuccess({ item })),
          catchError((error) =>
            of(
              LogosActions.updateFailure({
                error: extractErrorMessage(error, 'No pudimos actualizar el logo.'),
              }),
            ),
          ),
        ),
      ),
    ),
  );

  remove$ = createEffect(() =>
    this.actions$.pipe(
      ofType(LogosActions.remove),
      exhaustMap(({ id }) =>
        this.logosService.deleteLogoEndpointApiV1LogosLogoIdDelete(id).pipe(
          map(() => LogosActions.removeSuccess({ id })),
          catchError((error) =>
            of(
              LogosActions.removeFailure({
                error: extractErrorMessage(error, 'No pudimos eliminar el logo.'),
              }),
            ),
          ),
        ),
      ),
    ),
  );

  replaceImagen$ = createEffect(() =>
    this.actions$.pipe(
      ofType(LogosActions.replaceImagen),
      exhaustMap(({ logoId, file }) =>
        this.uploadService.replaceImagen(logoId, file).pipe(
          map((item) => LogosActions.replaceImagenSuccess({ item })),
          catchError((error) =>
            of(
              LogosActions.replaceImagenFailure({
                error: extractErrorMessage(error, 'No pudimos reemplazar la imagen.'),
              }),
            ),
          ),
        ),
      ),
    ),
  );

  // Navegación separada del éxito de create/update, igual que ProyectosEffects.
  createSuccessNav$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(LogosActions.createSuccess),
        tap(() => {
          this.notif.success('El logo se creó correctamente.');
          void this.router.navigateByUrl('/admin/logos');
        }),
      ),
    { dispatch: false },
  );

  updateSuccessNav$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(LogosActions.updateSuccess),
        tap(() => {
          this.notif.success('El logo se actualizó correctamente.');
          void this.router.navigateByUrl('/admin/logos');
        }),
      ),
    { dispatch: false },
  );

  removeSuccessNotify$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(LogosActions.removeSuccess),
        tap(() => this.notif.success('El logo se eliminó correctamente.')),
      ),
    { dispatch: false },
  );

  failureNotify$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(
          LogosActions.createFailure,
          LogosActions.updateFailure,
          LogosActions.removeFailure,
          LogosActions.replaceImagenFailure,
          LogosActions.loadFailure,
        ),
        tap(({ error }) => this.notif.error(error)),
      ),
    { dispatch: false },
  );
}
