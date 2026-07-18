import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { filter, map, take } from 'rxjs';
import { RootReducerState } from '../../store';
import { selectAuthInitialized, selectIsSuperAdmin } from '../../store/Authentication/authentication.selectors';
import { getAccessToken } from './auth-token';

export const authGuard: CanActivateFn = () => {
  const store = inject(Store<RootReducerState>);
  const router = inject(Router);

  if (getAccessToken()) {
    return true;
  }

  return store.select(selectAuthInitialized).pipe(
    filter((init) => init),
    take(1),
    map(() => {
      if (getAccessToken()) return true;
      return router.createUrlTree(['/auth/login']);
    }),
  );
};

export const superAdminGuard: CanActivateFn = () => {
  const store = inject(Store<RootReducerState>);
  const router = inject(Router);

  return store.select(selectIsSuperAdmin).pipe(
    filter((_, index) => index > 0 || !!getAccessToken()),
    map((isSuperAdmin) => isSuperAdmin || router.createUrlTree(['/dashboard'])),
    take(1),
  );
};
