import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { CdkDrag, CdkDragDrop, CdkDragHandle, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { PropiedadPublic } from '../../../../../client';
import {
  selectPropiedadesError,
  selectPropiedadesItems,
  selectPropiedadesLoading,
} from '../../../../store/Propiedades/propiedades.selectors';
import { PropiedadesActions } from '../../../../store/Propiedades/propiedades.actions';

const DESTACADAS_COUNT = 4;

@Component({
  selector: 'app-propiedades-list',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, CdkDropList, CdkDrag, CdkDragHandle],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './propiedades-list.component.html',
  styleUrl: './propiedades-list.component.scss',
})
export class PropiedadesListComponent implements OnInit {
  private readonly store = inject(Store);

  protected readonly destacadasCount = DESTACADAS_COUNT;
  protected readonly items = this.store.selectSignal(selectPropiedadesItems);
  protected readonly loading = this.store.selectSignal(selectPropiedadesLoading);
  protected readonly error = this.store.selectSignal(selectPropiedadesError);

  ngOnInit(): void {
    this.store.dispatch(PropiedadesActions.load());
  }

  protected onDelete(id: string): void {
    if (!confirm('¿Eliminar esta propiedad? Esta acción no se puede deshacer.')) return;
    this.store.dispatch(PropiedadesActions.remove({ id }));
  }

  protected onDrop(event: CdkDragDrop<PropiedadPublic[]>): void {
    if (event.previousIndex === event.currentIndex) return;

    const reordered = [...this.items()];
    moveItemInArray(reordered, event.previousIndex, event.currentIndex);
    this.store.dispatch(PropiedadesActions.reorder({ ids: reordered.map((item) => item.id) }));
  }
}
