import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, exhaustMap, map, of, switchMap, tap } from 'rxjs';
import { ProyectosService } from '../../../client';
import { ProyectoUploadService } from '../../features/admin/proyectos/proyecto-upload.service';
import { extractErrorMessage } from '../../core/http/http-error.util';
import { ProyectosActions } from './proyectos.actions';

@Injectable()
export class ProyectosEffects {
  private readonly actions$ = inject(Actions);
  private readonly router = inject(Router);
  private readonly proyectosService = inject(ProyectosService);
  private readonly uploadService = inject(ProyectoUploadService);

  load$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProyectosActions.load),
      exhaustMap(() =>
        this.proyectosService.readProyectosApiV1ProyectosGet(0, 100).pipe(
          map((response) => ProyectosActions.loadSuccess({ items: response.data, count: response.count })),
          catchError((error) =>
            of(
              ProyectosActions.loadFailure({
                error: extractErrorMessage(error, 'No pudimos cargar los proyectos.'),
              }),
            ),
          ),
        ),
      ),
    ),
  );

  loadOne$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProyectosActions.loadOne),
      exhaustMap(({ id }) =>
        this.proyectosService.readProyectoByIdApiV1ProyectosProyectoIdGet(id).pipe(
          map((item) => ProyectosActions.loadOneSuccess({ item })),
          catchError((error) =>
            of(
              ProyectosActions.loadOneFailure({
                error: extractErrorMessage(error, 'No pudimos cargar el proyecto.'),
              }),
            ),
          ),
        ),
      ),
    ),
  );

  create$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProyectosActions.create),
      exhaustMap(({ form, fotoPortada }) =>
        this.uploadService.createProyecto(form, fotoPortada).pipe(
          map((item) => ProyectosActions.createSuccess({ item })),
          catchError((error) =>
            of(
              ProyectosActions.createFailure({
                error: extractErrorMessage(error, 'No pudimos crear el proyecto.'),
              }),
            ),
          ),
        ),
      ),
    ),
  );

  update$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProyectosActions.update),
      exhaustMap(({ id, changes }) =>
        this.proyectosService.updateProyectoEndpointApiV1ProyectosProyectoIdPatch(id, changes).pipe(
          map((item) => ProyectosActions.updateSuccess({ item })),
          catchError((error) =>
            of(
              ProyectosActions.updateFailure({
                error: extractErrorMessage(error, 'No pudimos actualizar el proyecto.'),
              }),
            ),
          ),
        ),
      ),
    ),
  );

  remove$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProyectosActions.remove),
      exhaustMap(({ id }) =>
        this.proyectosService.deleteProyectoEndpointApiV1ProyectosProyectoIdDelete(id).pipe(
          map(() => ProyectosActions.removeSuccess({ id })),
          catchError((error) =>
            of(
              ProyectosActions.removeFailure({
                error: extractErrorMessage(error, 'No pudimos eliminar el proyecto.'),
              }),
            ),
          ),
        ),
      ),
    ),
  );

  // Navegación separada del éxito de create/update, igual que PropiedadesEffects.
  createSuccessNav$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(ProyectosActions.createSuccess),
        tap(() => void this.router.navigateByUrl('/admin/proyectos')),
      ),
    { dispatch: false },
  );

  updateSuccessNav$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(ProyectosActions.updateSuccess),
        tap(() => void this.router.navigateByUrl('/admin/proyectos')),
      ),
    { dispatch: false },
  );

  replaceFotoPortada$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProyectosActions.replaceFotoPortada),
      exhaustMap(({ proyectoId, file }) =>
        this.uploadService.replaceFotoPortada(proyectoId, file).pipe(
          map((item) => ProyectosActions.replaceFotoPortadaSuccess({ item })),
          catchError((error) =>
            of(
              ProyectosActions.replaceFotoPortadaFailure({
                error: extractErrorMessage(error, 'No pudimos reemplazar la foto de portada.'),
              }),
            ),
          ),
        ),
      ),
    ),
  );

  // switchMap (no exhaustMap): cada nuevo drag debe cancelar el guardado anterior en curso,
  // si no la respuesta de un reorder viejo podría llegar después y pisar el orden más reciente.
  reorder$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProyectosActions.reorder),
      switchMap(({ ids }) =>
        this.proyectosService.reorderProyectosEndpointApiV1ProyectosOrdenPatch({ ids }).pipe(
          map((response) => ProyectosActions.reorderSuccess({ items: response.data, count: response.count })),
          catchError((error) =>
            of(
              ProyectosActions.reorderFailure({
                error: extractErrorMessage(error, 'No pudimos guardar el nuevo orden.'),
              }),
            ),
          ),
        ),
      ),
    ),
  );
}
