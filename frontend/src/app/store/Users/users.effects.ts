import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, exhaustMap, map, of } from 'rxjs';
import { UsersService } from '../../../client';
import { extractErrorMessage } from '../../core/http/http-error.util';
import { UsersActions } from './users.actions';

@Injectable()
export class UsersEffects {
  private readonly actions$ = inject(Actions);
  private readonly usersService = inject(UsersService);

  load$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UsersActions.load),
      exhaustMap(() =>
        this.usersService.readUsersApiV1UsersGet(0, 100).pipe(
          map((response) => UsersActions.loadSuccess({ users: response.data })),
          catchError((error) =>
            of(
              UsersActions.loadFailure({
                error: extractErrorMessage(error, 'No pudimos cargar los usuarios.'),
              }),
            ),
          ),
        ),
      ),
    ),
  );
}
