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
import { extractErrorMessage } from '../http/http-error.util';
import { NotificationService } from '../notifications/notification.service';

@Injectable()
export class RefreshInterceptor implements HttpInterceptor {
  private readonly store = inject(Store<RootReducerState>);
  private readonly notifications = inject(NotificationService);

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(req).pipe(
      catchError((err) => {
        if (err.status === 401 && !req.url.includes('/auth/refresh')) {
          // Antes de esto el usuario solo veía el formulario fallar en silencio (o con un
          // error crudo del backend); ahora sabe explícitamente que debe volver a iniciar sesión.
          this.notifications.warning(
            extractErrorMessage(err, 'Tu sesión expiró. Inicia sesión nuevamente.'),
          );
          this.store.dispatch(AuthActions.logout());
        }
        return throwError(() => err);
      }),
    );
  }
}
