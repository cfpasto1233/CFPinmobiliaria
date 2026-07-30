import { createAction, props } from '@ngrx/store';
import { CampanaForm, CampanaPublic } from '../../../client';

export const CampanaActions = {
  load: createAction('[Campana] Load'),
  loadSuccess: createAction('[Campana] Load Success', props<{ item: CampanaPublic | null }>()),
  loadFailure: createAction('[Campana] Load Failure', props<{ error: string }>()),

  save: createAction('[Campana] Save', props<{ form: CampanaForm }>()),
  saveSuccess: createAction('[Campana] Save Success', props<{ item: CampanaPublic }>()),
  saveFailure: createAction('[Campana] Save Failure', props<{ error: string }>()),
};
