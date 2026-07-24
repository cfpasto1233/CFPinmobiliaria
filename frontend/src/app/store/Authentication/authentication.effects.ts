import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, exhaustMap, map, of, switchMap, tap } from 'rxjs';
import { AuthService as AuthApiService, LoginService, UsersService } from '../../../client';
import { clearAccessToken, setAccessToken } from '../../core/auth/auth-token';
import { extractErrorMessage } from '../../core/http/http-error.util';
import { AuthActions } from './authentication.actions';

@Injectable()
export class AuthenticationEffects {
  private readonly actions$ = inject(Actions);
  private readonly router = inject(Router);
  private readonly loginService = inject(LoginService);
  private readonly authApiService = inject(AuthApiService);
  private readonly usersService = inject(UsersService);

  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.login),
      exhaustMap(({ email, password, rememberMe }) =>
        this.loginService
          .loginAccessTokenApiV1LoginAccessTokenPost(
            email,
            password,
            'password',
            undefined,
            undefined,
            undefined,
            rememberMe,
          )
          .pipe(
            tap((token) => setAccessToken(token.access_token)),
            switchMap(() => this.usersService.readUserMeApiV1UsersMeGet()),
            map((user) => AuthActions.loginSuccess({ user })),
            catchError((error) =>
              of(
                AuthActions.loginFailure({
                  error: extractErrorMessage(error, 'No pudimos iniciar sesión. Intenta de nuevo.'),
                }),
              ),
            ),
          ),
      ),
    ),
  );

  // Navegación separada del éxito del login: loadCurrentUser/loadCurrentUserSuccess (usado en el
  // bootstrap de la app vía refreshToken$) nunca debe navegar, solo restaurar sesión en silencio.
  loginSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.loginSuccess),
        tap(({ user }) => {
          void this.router.navigateByUrl(user.is_superuser ? '/admin/propiedades' : '/dashboard');
        }),
      ),
    { dispatch: false },
  );

  refreshToken$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.refreshToken),
      exhaustMap(() =>
        // withCredentials: true es obligatorio aquí — el cliente generado no lo asume por
        // defecto, y sin esto el navegador no envía la cookie httpOnly refresh_token.
        this.authApiService.refreshTokenApiV1AuthRefreshPost(undefined, { withCredentials: true }).pipe(
          tap((token) => setAccessToken(token.access_token)),
          map(() => AuthActions.refreshTokenSuccess()),
          catchError(() => of(AuthActions.refreshTokenFailure())),
        ),
      ),
    ),
  );

  refreshTokenSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.refreshTokenSuccess),
      map(() => AuthActions.loadCurrentUser()),
    ),
  );

  loadCurrentUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loadCurrentUser),
      exhaustMap(() =>
        this.usersService.readUserMeApiV1UsersMeGet().pipe(
          map((user) => AuthActions.loadCurrentUserSuccess({ user })),
          catchError(() => {
            clearAccessToken();
            return of(AuthActions.loadCurrentUserFailure());
          }),
        ),
      ),
    ),
  );

  logout$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.logout),
        exhaustMap(() =>
          this.authApiService.logoutApiV1AuthLogoutPost(undefined, { withCredentials: true }).pipe(
            // Best-effort: el logout del cliente debe proceder aunque la llamada falle
            // (p. ej. el access token ya expiró).
            catchError(() => of(null)),
            tap(() => {
              clearAccessToken();
              void this.router.navigateByUrl('/auth/login');
            }),
          ),
        ),
      ),
    { dispatch: false },
  );
}
