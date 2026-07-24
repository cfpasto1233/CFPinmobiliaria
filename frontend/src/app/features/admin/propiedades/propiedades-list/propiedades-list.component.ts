import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import {
  selectPropiedadesError,
  selectPropiedadesItems,
  selectPropiedadesLoading,
} from '../../../../store/Propiedades/propiedades.selectors';
import { PropiedadesActions } from '../../../../store/Propiedades/propiedades.actions';

@Component({
  selector: 'app-propiedades-list',
  standalone: true,
  imports: [RouterLink, CurrencyPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './propiedades-list.component.html',
  styleUrl: './propiedades-list.component.scss',
})
export class PropiedadesListComponent implements OnInit {
  private readonly store = inject(Store);

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
}
