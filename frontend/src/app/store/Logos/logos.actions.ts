import { createAction, props } from '@ngrx/store';
import { LogoPublic, LogoUpdate } from '../../../client';
import { LogoForm } from './logo-form.model';

export const LogosActions = {
  load: createAction('[Logos] Load'),
  loadSuccess: createAction('[Logos] Load Success', props<{ items: LogoPublic[]; count: number }>()),
  loadFailure: createAction('[Logos] Load Failure', props<{ error: string }>()),

  create: createAction('[Logos] Create', props<{ form: LogoForm; imagen: File }>()),
  createSuccess: createAction('[Logos] Create Success', props<{ item: LogoPublic }>()),
  createFailure: createAction('[Logos] Create Failure', props<{ error: string }>()),

  update: createAction('[Logos] Update', props<{ id: string; changes: LogoUpdate }>()),
  updateSuccess: createAction('[Logos] Update Success', props<{ item: LogoPublic }>()),
  updateFailure: createAction('[Logos] Update Failure', props<{ error: string }>()),

  remove: createAction('[Logos] Remove', props<{ id: string }>()),
  removeSuccess: createAction('[Logos] Remove Success', props<{ id: string }>()),
  removeFailure: createAction('[Logos] Remove Failure', props<{ error: string }>()),

  replaceImagen: createAction('[Logos] Replace Imagen', props<{ logoId: string; file: File }>()),
  replaceImagenSuccess: createAction('[Logos] Replace Imagen Success', props<{ item: LogoPublic }>()),
  replaceImagenFailure: createAction('[Logos] Replace Imagen Failure', props<{ error: string }>()),
};
