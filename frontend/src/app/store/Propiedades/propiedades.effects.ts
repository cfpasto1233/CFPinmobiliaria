import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, exhaustMap, map, of, tap } from 'rxjs';
import { PropiedadesService } from '../../../client';
import { PropiedadUploadService } from '../../features/admin/propiedades/propiedad-upload.service';
import { extractErrorMessage } from '../../core/http/http-error.util';
import { PropiedadesActions } from './propiedades.actions';

@Injectable()
export class PropiedadesEffects {
  private readonly actions$ = inject(Actions);
  private readonly router = inject(Router);
  private readonly propiedadesService = inject(PropiedadesService);
  private readonly uploadService = inject(PropiedadUploadService);

  load$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PropiedadesActions.load),
      exhaustMap(() =>
        this.propiedadesService.readPropiedadesApiV1PropiedadesGet(0, 100).pipe(
          map((response) => PropiedadesActions.loadSuccess({ items: response.data, count: response.count })),
          catchError((error) =>
            of(
              PropiedadesActions.loadFailure({
                error: extractErrorMessage(error, 'No pudimos cargar las propiedades.'),
              }),
            ),
          ),
        ),
      ),
    ),
  );

  loadOne$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PropiedadesActions.loadOne),
      exhaustMap(({ id }) =>
        this.propiedadesService.readPropiedadByIdApiV1PropiedadesPropiedadIdGet(id).pipe(
          map((item) => PropiedadesActions.loadOneSuccess({ item })),
          catchError((error) =>
            of(
              PropiedadesActions.loadOneFailure({
                error: extractErrorMessage(error, 'No pudimos cargar la propiedad.'),
              }),
            ),
          ),
        ),
      ),
    ),
  );

  create$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PropiedadesActions.create),
      exhaustMap(({ form, fotoPrincipal }) =>
        this.uploadService.createPropiedad(form, fotoPrincipal).pipe(
          map((item) => PropiedadesActions.createSuccess({ item })),
          catchError((error) =>
            of(
              PropiedadesActions.createFailure({
                error: extractErrorMessage(error, 'No pudimos crear la propiedad.'),
              }),
            ),
          ),
        ),
      ),
    ),
  );

  update$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PropiedadesActions.update),
      exhaustMap(({ id, changes }) =>
        this.propiedadesService.updatePropiedadEndpointApiV1PropiedadesPropiedadIdPatch(id, changes).pipe(
          map((item) => PropiedadesActions.updateSuccess({ item })),
          catchError((error) =>
            of(
              PropiedadesActions.updateFailure({
                error: extractErrorMessage(error, 'No pudimos actualizar la propiedad.'),
              }),
            ),
          ),
        ),
      ),
    ),
  );

  remove$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PropiedadesActions.remove),
      exhaustMap(({ id }) =>
        this.propiedadesService.deletePropiedadEndpointApiV1PropiedadesPropiedadIdDelete(id).pipe(
          map(() => PropiedadesActions.removeSuccess({ id })),
          catchError((error) =>
            of(
              PropiedadesActions.removeFailure({
                error: extractErrorMessage(error, 'No pudimos eliminar la propiedad.'),
              }),
            ),
          ),
        ),
      ),
    ),
  );

  addFoto$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PropiedadesActions.addFoto),
      exhaustMap(({ propiedadId, file }) =>
        this.uploadService.addFoto(propiedadId, file).pipe(
          map((item) => PropiedadesActions.addFotoSuccess({ item })),
          catchError((error) =>
            of(
              PropiedadesActions.addFotoFailure({
                error: extractErrorMessage(error, 'No pudimos agregar la foto.'),
              }),
            ),
          ),
        ),
      ),
    ),
  );

  removeFoto$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PropiedadesActions.removeFoto),
      exhaustMap(({ propiedadId, fotoId }) =>
        this.propiedadesService
          .deleteFotoEndpointApiV1PropiedadesPropiedadIdFotosFotoIdDelete(propiedadId, fotoId)
          .pipe(
            map((item) => PropiedadesActions.removeFotoSuccess({ item })),
            catchError((error) =>
              of(
                PropiedadesActions.removeFotoFailure({
                  error: extractErrorMessage(error, 'No pudimos eliminar la foto.'),
                }),
              ),
            ),
          ),
      ),
    ),
  );

  // Navegación separada del éxito de create/update, igual que AuthenticationEffects.loginSuccess$.
  createSuccessNav$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(PropiedadesActions.createSuccess),
        tap(() => void this.router.navigateByUrl('/admin/propiedades')),
      ),
    { dispatch: false },
  );

  updateSuccessNav$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(PropiedadesActions.updateSuccess),
        tap(() => void this.router.navigateByUrl('/admin/propiedades')),
      ),
    { dispatch: false },
  );

  replaceFotoPrincipal$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PropiedadesActions.replaceFotoPrincipal),
      exhaustMap(({ propiedadId, file }) =>
        this.uploadService.replaceFotoPrincipal(propiedadId, file).pipe(
          map((item) => PropiedadesActions.replaceFotoPrincipalSuccess({ item })),
          catchError((error) =>
            of(
              PropiedadesActions.replaceFotoPrincipalFailure({
                error: extractErrorMessage(error, 'No pudimos reemplazar la foto principal.'),
              }),
            ),
          ),
        ),
      ),
    ),
  );
}
