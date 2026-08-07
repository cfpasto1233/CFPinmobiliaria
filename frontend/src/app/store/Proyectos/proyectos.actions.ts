import { createAction, props } from '@ngrx/store';
import { ProyectoPublic, ProyectoUpdate } from '../../../client';
import { ProyectoForm } from './proyecto-form.model';

export const ProyectosActions = {
  load: createAction('[Proyectos] Load'),
  loadSuccess: createAction('[Proyectos] Load Success', props<{ items: ProyectoPublic[]; count: number }>()),
  loadFailure: createAction('[Proyectos] Load Failure', props<{ error: string }>()),

  loadOne: createAction('[Proyectos] Load One', props<{ id: string }>()),
  loadOneSuccess: createAction('[Proyectos] Load One Success', props<{ item: ProyectoPublic }>()),
  loadOneFailure: createAction('[Proyectos] Load One Failure', props<{ error: string }>()),

  create: createAction('[Proyectos] Create', props<{ form: ProyectoForm; fotoPortada: File }>()),
  createSuccess: createAction('[Proyectos] Create Success', props<{ item: ProyectoPublic }>()),
  createFailure: createAction('[Proyectos] Create Failure', props<{ error: string }>()),

  update: createAction('[Proyectos] Update', props<{ id: string; changes: ProyectoUpdate }>()),
  updateSuccess: createAction('[Proyectos] Update Success', props<{ item: ProyectoPublic }>()),
  updateFailure: createAction('[Proyectos] Update Failure', props<{ error: string }>()),

  remove: createAction('[Proyectos] Remove', props<{ id: string }>()),
  removeSuccess: createAction('[Proyectos] Remove Success', props<{ id: string }>()),
  removeFailure: createAction('[Proyectos] Remove Failure', props<{ error: string }>()),

  replaceFotoPortada: createAction(
    '[Proyectos] Replace Foto Portada',
    props<{ proyectoId: string; file: File }>(),
  ),
  replaceFotoPortadaSuccess: createAction(
    '[Proyectos] Replace Foto Portada Success',
    props<{ item: ProyectoPublic }>(),
  ),
  replaceFotoPortadaFailure: createAction(
    '[Proyectos] Replace Foto Portada Failure',
    props<{ error: string }>(),
  ),

  addFoto: createAction(
    '[Proyectos] Add Foto',
    props<{ proyectoId: string; file: File; descripcion: string | null }>(),
  ),
  addFotoSuccess: createAction('[Proyectos] Add Foto Success', props<{ item: ProyectoPublic }>()),
  addFotoFailure: createAction('[Proyectos] Add Foto Failure', props<{ error: string }>()),

  removeFoto: createAction(
    '[Proyectos] Remove Foto',
    props<{ proyectoId: string; fotoId: string }>(),
  ),
  removeFotoSuccess: createAction('[Proyectos] Remove Foto Success', props<{ item: ProyectoPublic }>()),
  removeFotoFailure: createAction('[Proyectos] Remove Foto Failure', props<{ error: string }>()),

  reorder: createAction('[Proyectos] Reorder', props<{ ids: string[] }>()),
  reorderSuccess: createAction('[Proyectos] Reorder Success', props<{ items: ProyectoPublic[]; count: number }>()),
  reorderFailure: createAction('[Proyectos] Reorder Failure', props<{ error: string }>()),
};
