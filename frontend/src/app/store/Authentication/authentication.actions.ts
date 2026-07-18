import { createAction, props } from '@ngrx/store';

export interface UserInfo {
  id: string;
  email: string;
  full_name: string | null;
  is_active: boolean;
  is_superuser: boolean;
  role: string;
}

export const AuthActions = {
  login: createAction(
    '[Auth] Login',
    props<{ email: string; password: string; rememberMe: boolean }>(),
  ),
  loginSuccess: createAction('[Auth] Login Success', props<{ user: UserInfo }>()),
  loginFailure: createAction('[Auth] Login Failure', props<{ error: string }>()),

  refreshToken: createAction('[Auth] Refresh Token'),
  refreshTokenSuccess: createAction('[Auth] Refresh Token Success'),
  refreshTokenFailure: createAction('[Auth] Refresh Token Failure'),

  loadCurrentUser: createAction('[Auth] Load Current User'),
  loadCurrentUserSuccess: createAction(
    '[Auth] Load Current User Success',
    props<{ user: UserInfo }>(),
  ),
  loadCurrentUserFailure: createAction('[Auth] Load Current User Failure'),

  logout: createAction('[Auth] Logout'),
};
