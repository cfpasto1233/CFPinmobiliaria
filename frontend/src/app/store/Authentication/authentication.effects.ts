import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, exhaustMap, map, of, switchMap, tap } from 'rxjs';
import { clearAccessToken, setAccessToken } from '../../core/auth/auth-token';
import { AuthActions } from './authentication.actions';

@Injectable()
export class AuthenticationEffects {
  private readonly actions$ = inject(Actions);
  private readonly router = inject(Router);

  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.login),
      exhaustMap(({ email, password, rememberMe }) => {
        // TODO (M0.5): conectar LoginService generado por ng-openapi
        return of(AuthActions.loginFailure({ error: 'Not implemented' }));
      }),
    ),
  );

  refreshToken$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.refreshToken),
      exhaustMap(() => {
        // Se delega al AuthService generado por ng-openapi
        return of(AuthActions.refreshTokenFailure());
      }),
    ),
  );

  loadCurrentUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loadCurrentUser),
      exhaustMap(() => {
        // Se delega al UsersService generado por ng-openapi
        return of(AuthActions.loadCurrentUserFailure());
      }),
    ),
  );

  logout$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.logout),
        tap(() => {
          clearAccessToken();
          void this.router.navigateByUrl('/auth/login');
        }),
      ),
    { dispatch: false },
  );
}
