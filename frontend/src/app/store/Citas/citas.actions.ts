import { createAction, props } from '@ngrx/store';
import { CitaForm, CitaPublic, CitaUpdate } from '../../../client';

export const CitasActions = {
  load: createAction('[Citas] Load', props<{ desde: string; hasta: string }>()),
  loadSuccess: createAction(
    '[Citas] Load Success',
    props<{ items: CitaPublic[]; count: number; desde: string; hasta: string }>(),
  ),
  loadFailure: createAction('[Citas] Load Failure', props<{ error: string }>()),

  create: createAction('[Citas] Create', props<{ form: CitaForm }>()),
  createSuccess: createAction('[Citas] Create Success', props<{ item: CitaPublic }>()),
  createFailure: createAction('[Citas] Create Failure', props<{ error: string }>()),

  update: createAction('[Citas] Update', props<{ id: string; form: CitaUpdate }>()),
  updateSuccess: createAction('[Citas] Update Success', props<{ item: CitaPublic }>()),
  updateFailure: createAction('[Citas] Update Failure', props<{ error: string }>()),

  delete: createAction('[Citas] Delete', props<{ id: string }>()),
  deleteSuccess: createAction('[Citas] Delete Success', props<{ id: string }>()),
  deleteFailure: createAction('[Citas] Delete Failure', props<{ error: string }>()),
};
