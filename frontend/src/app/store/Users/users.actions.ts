import { createAction, props } from '@ngrx/store';

export interface AdminUser {
  id: string;
  email: string;
  full_name: string | null;
  is_active: boolean;
  is_superuser: boolean;
  role: string;
}

export const UsersActions = {
  load: createAction('[Users] Load'),
  loadSuccess: createAction('[Users] Load Success', props<{ users: AdminUser[] }>()),
  loadFailure: createAction('[Users] Load Failure', props<{ error: string }>()),
};
