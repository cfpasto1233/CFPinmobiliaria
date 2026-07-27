import { CurrencyPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  OnDestroy,
  OnInit,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import { PropiedadPublic } from '../../../../client';

@Component({
  selector: 'app-property-gallery-modal',
  standalone: true,
  imports: [CurrencyPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './property-gallery-modal.component.html',
  styleUrl: './property-gallery-modal.component.scss',
})
export class PropertyGalleryModalComponent implements OnInit, OnDestroy {
  readonly property = input.required<PropiedadPublic>();
  readonly closed = output<void>();

  protected readonly activeIndex = signal(0);

  protected readonly photos = computed(() => {
    const property = this.property();
    return [property.foto_principal_url, ...property.fotos.map((foto) => foto.url)];
  });

  protected readonly tipoInmuebleLabel = computed(() => {
    switch (this.property().tipo_inmueble) {
      case 'apartamento':
        return 'Apartamento';
      case 'lote':
        return 'Lote';
      default:
        return 'Casa';
    }
  });

  // Baños/habitaciones/área/antigüedad/parqueadero solo existen para casa y
  // apartamento — un lote no los tiene.
  protected readonly specs = computed(() => {
    const property = this.property();
    const items: string[] = [];
    if (property.habitaciones !== null) {
      items.push(`${property.habitaciones} ${property.habitaciones === 1 ? 'habitación' : 'habitaciones'}`);
    }
    if (property.banos !== null) {
      items.push(`${property.banos} ${property.banos === 1 ? 'baño' : 'baños'}`);
    }
    if (property.area_construida !== null) {
      items.push(`${property.area_construida} m² construidos`);
    }
    if (property.antiguedad !== null) {
      items.push(
        property.antiguedad === 0
          ? 'A estrenar'
          : `${property.antiguedad} ${property.antiguedad === 1 ? 'año' : 'años'} de antigüedad`,
      );
    }
    if (property.tiene_parqueadero) {
      items.push(
        property.num_parqueaderos
          ? `${property.num_parqueaderos} ${property.num_parqueaderos === 1 ? 'parqueadero' : 'parqueaderos'}`
          : 'Parqueadero',
      );
    }
    return items;
  });

  ngOnInit(): void {
    document.body.style.overflow = 'hidden';
  }

  ngOnDestroy(): void {
    document.body.style.overflow = '';
  }

  protected goTo(index: number): void {
    this.activeIndex.set(index);
  }

  protected next(): void {
    const total = this.photos().length;
    this.activeIndex.update((current) => (current + 1) % total);
  }

  protected prev(): void {
    const total = this.photos().length;
    this.activeIndex.update((current) => (current - 1 + total) % total);
  }

  protected close(): void {
    this.closed.emit();
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    this.close();
  }

  @HostListener('document:keydown.arrowright')
  protected onArrowRight(): void {
    this.next();
  }

  @HostListener('document:keydown.arrowleft')
  protected onArrowLeft(): void {
    this.prev();
  }
}
