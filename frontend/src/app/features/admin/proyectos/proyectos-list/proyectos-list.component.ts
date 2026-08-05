import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { CdkDrag, CdkDragDrop, CdkDragHandle, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { ProyectoPublic } from '../../../../../client';
import { ProyectosActions } from '../../../../store/Proyectos/proyectos.actions';
import {
  selectProyectosError,
  selectProyectosItems,
  selectProyectosLoading,
} from '../../../../store/Proyectos/proyectos.selectors';

const ESTADO_LABELS: Record<string, string> = {
  planos: 'Planos',
  construccion_1: 'Construcción I',
  construccion_2: 'Construcción II',
  entrega_inmediata: 'Entrega inmediata',
};

@Component({
  selector: 'app-proyectos-list',
  standalone: true,
  imports: [RouterLink, CdkDropList, CdkDrag, CdkDragHandle, CurrencyPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './proyectos-list.component.html',
  styleUrl: './proyectos-list.component.scss',
})
export class ProyectosListComponent implements OnInit {
  private readonly store = inject(Store);

  protected readonly items = this.store.selectSignal(selectProyectosItems);
  protected readonly loading = this.store.selectSignal(selectProyectosLoading);
  protected readonly error = this.store.selectSignal(selectProyectosError);

  ngOnInit(): void {
    this.store.dispatch(ProyectosActions.load());
  }

  protected estadoLabel(estado: string): string {
    return ESTADO_LABELS[estado] ?? estado;
  }

  protected onDelete(id: string): void {
    if (!confirm('¿Eliminar este proyecto? Esta acción no se puede deshacer.')) return;
    this.store.dispatch(ProyectosActions.remove({ id }));
  }

  protected onDrop(event: CdkDragDrop<ProyectoPublic[]>): void {
    if (event.previousIndex === event.currentIndex) return;

    const reordered = [...this.items()];
    moveItemInArray(reordered, event.previousIndex, event.currentIndex);
    this.store.dispatch(ProyectosActions.reorder({ ids: reordered.map((item) => item.id) }));
  }
}
