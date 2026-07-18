import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, catchError, throwError } from 'rxjs';
import { RootReducerState } from '../../store';
import { AuthActions } from '../../store/Authentication/authentication.actions';

@Injectable()
export class RefreshInterceptor implements HttpInterceptor {
  private readonly store = inject(Store<RootReducerState>);

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(req).pipe(
      catchError((err) => {
        if (err.status === 401 && !req.url.includes('/auth/refresh')) {
          this.store.dispatch(AuthActions.logout());
        }
        return throwError(() => err);
      }),
    );
  }
}
