import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, exhaustMap, map, of, tap } from 'rxjs';
import { EventosService } from '../../../client';
import { EventoUploadService } from '../../features/admin/eventos/evento-upload.service';
import { extractErrorMessage } from '../../core/http/http-error.util';
import { EventosActions } from './eventos.actions';

@Injectable()
export class EventosEffects {
  private readonly actions$ = inject(Actions);
  private readonly router = inject(Router);
  private readonly eventosService = inject(EventosService);
  private readonly uploadService = inject(EventoUploadService);

  load$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EventosActions.load),
      exhaustMap(() =>
        this.eventosService.readEventosApiV1EventosGet(0, 100).pipe(
          map((response) => EventosActions.loadSuccess({ items: response.data, count: response.count })),
          catchError((error) =>
            of(
              EventosActions.loadFailure({
                error: extractErrorMessage(error, 'No pudimos cargar los eventos.'),
              }),
            ),
          ),
        ),
      ),
    ),
  );

  loadOne$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EventosActions.loadOne),
      exhaustMap(({ id }) =>
        this.eventosService.readEventoByIdApiV1EventosEventoIdGet(id).pipe(
          map((item) => EventosActions.loadOneSuccess({ item })),
          catchError((error) =>
            of(
              EventosActions.loadOneFailure({
                error: extractErrorMessage(error, 'No pudimos cargar el evento.'),
              }),
            ),
          ),
        ),
      ),
    ),
  );

  create$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EventosActions.create),
      exhaustMap(({ form, foto }) =>
        this.uploadService.createEvento(form, foto).pipe(
          map((item) => EventosActions.createSuccess({ item })),
          catchError((error) =>
            of(
              EventosActions.createFailure({
                error: extractErrorMessage(error, 'No pudimos crear el evento.'),
              }),
            ),
          ),
        ),
      ),
    ),
  );

  update$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EventosActions.update),
      exhaustMap(({ id, changes }) =>
        this.eventosService.updateEventoEndpointApiV1EventosEventoIdPatch(id, changes).pipe(
          map((item) => EventosActions.updateSuccess({ item })),
          catchError((error) =>
            of(
              EventosActions.updateFailure({
                error: extractErrorMessage(error, 'No pudimos actualizar el evento.'),
              }),
            ),
          ),
        ),
      ),
    ),
  );

  remove$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EventosActions.remove),
      exhaustMap(({ id }) =>
        this.eventosService.deleteEventoEndpointApiV1EventosEventoIdDelete(id).pipe(
          map(() => EventosActions.removeSuccess({ id })),
          catchError((error) =>
            of(
              EventosActions.removeFailure({
                error: extractErrorMessage(error, 'No pudimos eliminar el evento.'),
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
        ofType(EventosActions.createSuccess),
        tap(() => void this.router.navigateByUrl('/admin/eventos')),
      ),
    { dispatch: false },
  );

  updateSuccessNav$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(EventosActions.updateSuccess),
        tap(() => void this.router.navigateByUrl('/admin/eventos')),
      ),
    { dispatch: false },
  );

  replaceFoto$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EventosActions.replaceFoto),
      exhaustMap(({ eventoId, file }) =>
        this.uploadService.replaceFoto(eventoId, file).pipe(
          map((item) => EventosActions.replaceFotoSuccess({ item })),
          catchError((error) =>
            of(
              EventosActions.replaceFotoFailure({
                error: extractErrorMessage(error, 'No pudimos reemplazar la foto.'),
              }),
            ),
          ),
        ),
      ),
    ),
  );
}
