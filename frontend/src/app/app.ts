import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Store } from '@ngrx/store';
import { ToastContainerComponent } from './shared/components/toast-container/toast-container.component';
import { AuthActions } from './store/Authentication/authentication.actions';
import { RootReducerState } from './store';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastContainerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <router-outlet />
    <app-toast-container />
  `,
})
export class App {
  private readonly store = inject(Store<RootReducerState>);

  constructor() {
    this.store.dispatch(AuthActions.refreshToken());
  }
}
