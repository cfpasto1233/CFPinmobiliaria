import { Injectable, computed, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { RootReducerState } from '../../store';
import { AuthActions } from '../../store/Authentication/authentication.actions';
import {
  selectAuthError,
  selectAuthLoading,
  selectIsSuperAdmin,
  selectUser,
} from '../../store/Authentication/authentication.selectors';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly store = inject(Store<RootReducerState>);

  private readonly userSignal = this.store.selectSignal(selectUser);
  private readonly loadingSignal = this.store.selectSignal(selectAuthLoading);
  private readonly isSuperAdminSignal = this.store.selectSignal(selectIsSuperAdmin);
  private readonly errorSignal = this.store.selectSignal(selectAuthError);

  readonly user = computed(() => this.userSignal());
  readonly isAuthenticated = computed(() => !!this.userSignal());
  readonly isLoading = computed(() => this.loadingSignal());
  readonly isSuperAdmin = computed(() => this.isSuperAdminSignal());
  readonly error = computed(() => this.errorSignal());

  logout(): void {
    this.store.dispatch(AuthActions.logout());
  }

  getDefaultRedirectPath(): string {
    const user = this.userSignal();
    if (!user) return '/auth/login';
    if (user.is_superuser) return '/admin';
    return '/dashboard';
  }
}
