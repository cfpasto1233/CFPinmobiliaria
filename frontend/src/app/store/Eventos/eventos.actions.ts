import { createAction, props } from '@ngrx/store';
import { EventoPublic, EventoUpdate } from '../../../client';
import { EventoForm } from './evento-form.model';

export const EventosActions = {
  load: createAction('[Eventos] Load'),
  loadSuccess: createAction('[Eventos] Load Success', props<{ items: EventoPublic[]; count: number }>()),
  loadFailure: createAction('[Eventos] Load Failure', props<{ error: string }>()),

  loadOne: createAction('[Eventos] Load One', props<{ id: string }>()),
  loadOneSuccess: createAction('[Eventos] Load One Success', props<{ item: EventoPublic }>()),
  loadOneFailure: createAction('[Eventos] Load One Failure', props<{ error: string }>()),

  create: createAction('[Eventos] Create', props<{ form: EventoForm; foto: File }>()),
  createSuccess: createAction('[Eventos] Create Success', props<{ item: EventoPublic }>()),
  createFailure: createAction('[Eventos] Create Failure', props<{ error: string }>()),

  update: createAction('[Eventos] Update', props<{ id: string; changes: EventoUpdate }>()),
  updateSuccess: createAction('[Eventos] Update Success', props<{ item: EventoPublic }>()),
  updateFailure: createAction('[Eventos] Update Failure', props<{ error: string }>()),

  remove: createAction('[Eventos] Remove', props<{ id: string }>()),
  removeSuccess: createAction('[Eventos] Remove Success', props<{ id: string }>()),
  removeFailure: createAction('[Eventos] Remove Failure', props<{ error: string }>()),

  replaceFoto: createAction('[Eventos] Replace Foto', props<{ eventoId: string; file: File }>()),
  replaceFotoSuccess: createAction('[Eventos] Replace Foto Success', props<{ item: EventoPublic }>()),
  replaceFotoFailure: createAction('[Eventos] Replace Foto Failure', props<{ error: string }>()),
};
