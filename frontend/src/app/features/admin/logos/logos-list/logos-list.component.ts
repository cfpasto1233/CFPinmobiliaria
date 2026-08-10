import { ChangeDetectionStrategy, Component, OnInit, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { LogosActions } from '../../../../store/Logos/logos.actions';
import {
  selectLogosError,
  selectLogosItems,
  selectLogosLoading,
} from '../../../../store/Logos/logos.selectors';

@Component({
  selector: 'app-logos-list',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './logos-list.component.html',
  styleUrl: './logos-list.component.scss',
})
export class LogosListComponent implements OnInit {
  private readonly store = inject(Store);

  protected readonly items = this.store.selectSignal(selectLogosItems);
  protected readonly loading = this.store.selectSignal(selectLogosLoading);
  protected readonly error = this.store.selectSignal(selectLogosError);

  protected readonly aliados = computed(() => this.items().filter((item) => item.tipo === 'aliado'));
  protected readonly inmobiliarias = computed(() =>
    this.items().filter((item) => item.tipo === 'inmobiliaria'),
  );

  ngOnInit(): void {
    this.store.dispatch(LogosActions.load());
  }

  protected onDelete(id: string): void {
    if (!confirm('¿Eliminar este logo? Esta acción no se puede deshacer.')) return;
    this.store.dispatch(LogosActions.remove({ id }));
  }
}
