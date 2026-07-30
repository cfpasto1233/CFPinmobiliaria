import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { Store } from '@ngrx/store';
import { PropiedadPublic } from '../../../client';
import { FooterComponent } from '../../layouts/footer/footer.component';
import { NavbarComponent } from '../../layouts/navbar/navbar.component';
import { PropertyCardComponent } from '../../shared/components/property-card/property-card.component';
import { PublicarWhatsappFabComponent } from '../../shared/components/publicar-whatsapp-fab/publicar-whatsapp-fab.component';
import { PropiedadesActions } from '../../store/Propiedades/propiedades.actions';
import { selectPropiedadesItems, selectPropiedadesLoading } from '../../store/Propiedades/propiedades.selectors';

type TipoFiltro = 'todas' | 'venta' | 'arriendo' | 'oferta';
type OrdenFiltro = 'destacadas' | 'precio-asc' | 'precio-desc';

@Component({
  selector: 'app-propiedades-listado',
  standalone: true,
  imports: [
    NavbarComponent,
    FooterComponent,
    PropertyCardComponent,
    PublicarWhatsappFabComponent,
    NgSelectModule,
    FormsModule,
    RouterLink,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './propiedades-listado.component.html',
  styleUrl: './propiedades-listado.component.scss',
})
export class PropiedadesListadoComponent implements OnInit {
  private readonly store = inject(Store);

  protected readonly items = this.store.selectSignal(selectPropiedadesItems);
  protected readonly loading = this.store.selectSignal(selectPropiedadesLoading);

  protected readonly tipo = signal<TipoFiltro>('todas');
  protected readonly busqueda = signal('');
  protected readonly precioMax = signal<number | null>(null);
  protected readonly orden = signal<OrdenFiltro>('destacadas');

  protected readonly ordenOptions: { value: OrdenFiltro; label: string }[] = [
    { value: 'destacadas', label: 'Destacadas primero' },
    { value: 'precio-asc', label: 'Menor precio' },
    { value: 'precio-desc', label: 'Mayor precio' },
  ];

  protected readonly hasActiveFilters = computed(
    () =>
      this.tipo() !== 'todas' ||
      this.busqueda().trim().length > 0 ||
      this.precioMax() !== null ||
      this.orden() !== 'destacadas',
  );

  protected readonly filtered = computed(() => {
    const tipo = this.tipo();
    const term = this.busqueda().trim().toLowerCase();
    const max = this.precioMax();

    const result = this.items().filter((item) => {
      if (tipo !== 'todas' && item.tipo !== tipo) return false;
      if (term && !item.nombre.toLowerCase().includes(term) && !item.ubicacion.toLowerCase().includes(term)) {
        return false;
      }
      const precio = Number(item.precio);
      if (max !== null && precio > max) return false;
      return true;
    });

    return this.sortItems(result, this.orden());
  });

  ngOnInit(): void {
    this.store.dispatch(PropiedadesActions.load());
  }

  protected setTipo(value: TipoFiltro): void {
    this.tipo.set(value);
  }

  protected onBusquedaInput(event: Event): void {
    this.busqueda.set((event.target as HTMLInputElement).value);
  }

  protected onPrecioMaxInput(event: Event): void {
    this.precioMax.set(this.parseNumber((event.target as HTMLInputElement).value));
  }

  protected clearFilters(): void {
    this.tipo.set('todas');
    this.busqueda.set('');
    this.precioMax.set(null);
    this.orden.set('destacadas');
  }

  private parseNumber(value: string): number | null {
    if (value.trim() === '') return null;
    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  }

  private sortItems(items: PropiedadPublic[], orden: OrdenFiltro): PropiedadPublic[] {
    if (orden === 'destacadas') return items;
    const sorted = [...items];
    sorted.sort((a, b) => {
      const diff = Number(a.precio) - Number(b.precio);
      return orden === 'precio-asc' ? diff : -diff;
    });
    return sorted;
  }
}
