import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { EventosActions } from '../../../../store/Eventos/eventos.actions';
import {
  selectEventosError,
  selectEventosItems,
  selectEventosLoading,
} from '../../../../store/Eventos/eventos.selectors';

const FECHA_FORMAT: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };

@Component({
  selector: 'app-eventos-list',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './eventos-list.component.html',
  styleUrl: './eventos-list.component.scss',
})
export class EventosListComponent implements OnInit {
  private readonly store = inject(Store);

  protected readonly items = this.store.selectSignal(selectEventosItems);
  protected readonly loading = this.store.selectSignal(selectEventosLoading);
  protected readonly error = this.store.selectSignal(selectEventosError);

  ngOnInit(): void {
    this.store.dispatch(EventosActions.load());
  }

  protected formatFecha(isoDate: string): string {
    const [year, month, day] = isoDate.split('-').map(Number);
    return new Date(year, month - 1, day).toLocaleDateString('es-CO', FECHA_FORMAT);
  }

  protected onDelete(id: string): void {
    if (!confirm('¿Eliminar este evento? Esta acción no se puede deshacer.')) return;
    this.store.dispatch(EventosActions.remove({ id }));
  }
}
