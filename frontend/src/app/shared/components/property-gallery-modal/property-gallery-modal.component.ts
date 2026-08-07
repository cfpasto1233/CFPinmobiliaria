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

type SpecIcon =
  | 'bed'
  | 'bath'
  | 'area'
  | 'age'
  | 'parking'
  | 'floor'
  | 'eye'
  | 'land'
  | 'balcony'
  | 'terrace'
  | 'patio'
  | 'storage'
  | 'grill'
  | 'pool'
  | 'kitchen'
  | 'gated'
  | 'fee'
  | 'utilities'
  | 'exchange';

interface SpecItem {
  icon: SpecIcon;
  label: string;
}

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

  // Ancho de cada slide y superposición (%) que produce el efecto "coverflow":
  // las vecinas quedan parcialmente tapadas por la activa en vez de ocupar
  // todo el ancho una a la vez.
  private readonly slideWidthPct = 68;
  private readonly slideOverlapPct = 8;
  private readonly slideStepPct = this.slideWidthPct - 2 * this.slideOverlapPct;
  private readonly slideCenterOffsetPct = 50 + this.slideOverlapPct - this.slideWidthPct / 2;

  protected readonly activeIndex = signal(0);
  protected readonly isDragging = signal(false);
  protected readonly dragOffset = signal(0);
  private dragStartX = 0;
  private dragPointerId: number | null = null;
  private dragMoved = false;

  protected readonly photos = computed(() => {
    const property = this.property();
    return [property.foto_principal_url, ...property.fotos.map((foto) => foto.url)];
  });

  // Con una sola foto no hay vecinas que asomar — el efecto "coverflow" se
  // desactiva y la imagen ocupa todo el ancho (ver .is-single en el SCSS).
  protected readonly hasMultiplePhotos = computed(() => this.photos().length > 1);

  protected readonly trackTransform = computed(() => {
    if (!this.hasMultiplePhotos()) {
      return 'translateX(0)';
    }
    const base = this.slideCenterOffsetPct - this.slideStepPct * this.activeIndex();
    return `translateX(calc(${base}% + ${this.dragOffset()}px))`;
  });

  protected readonly tipoInmuebleLabel = computed(() => {
    switch (this.property().tipo_inmueble) {
      case 'apartamento':
        return 'Apartamento';
      case 'apartaestudio':
        return 'Apartaestudio';
      case 'finca':
        return 'Finca';
      case 'local':
        return 'Local';
      case 'oficina':
        return 'Oficina';
      case 'lote':
        return 'Lote';
      default:
        return 'Casa';
    }
  });

  private tipoParqueaderoLabel(tipo: string): string {
    switch (tipo) {
      case 'interno':
        return 'interno';
      case 'externo':
        return 'externo';
      case 'carro':
        return 'carro';
      case 'moto':
        return 'moto';
      default:
        return tipo;
    }
  }

  // Qué campos aplican depende de tipo_inmueble — ver la matriz en
  // backend/app/schemas/propiedad.py. Acá simplemente se muestra lo que venga
  // con valor (los que no aplican llegan en null/false desde el backend).
  protected readonly specs = computed<SpecItem[]>(() => {
    const property = this.property();
    const items: SpecItem[] = [];
    if (property.habitaciones !== null) {
      items.push({
        icon: 'bed',
        label: `${property.habitaciones} ${property.habitaciones === 1 ? 'habitación' : 'habitaciones'}`,
      });
    }
    if (property.banos !== null) {
      items.push({
        icon: 'bath',
        label: `${property.banos} ${property.banos === 1 ? 'baño' : 'baños'}`,
      });
    }
    if (property.piso !== null) {
      items.push({ icon: 'floor', label: `Piso ${property.piso}` });
    }
    if (property.vista !== null) {
      items.push({ icon: 'eye', label: `Vista ${property.vista}` });
    }
    if (property.area_construida !== null) {
      items.push({ icon: 'area', label: `${property.area_construida} m² construidos` });
    }
    if (property.area_lote !== null) {
      items.push({ icon: 'area', label: `${property.area_lote} m² de lote` });
    }
    if (property.frente !== null && property.fondo !== null) {
      items.push({ icon: 'area', label: `Frente ${property.frente} m × Fondo ${property.fondo} m` });
    }
    if (property.antiguedad !== null) {
      items.push({
        icon: 'age',
        label:
          property.antiguedad === 0
            ? 'A estrenar'
            : `${property.antiguedad} ${property.antiguedad === 1 ? 'año' : 'años'} de antigüedad`,
      });
    }
    if (property.rural_urbano !== null) {
      items.push({ icon: 'land', label: property.rural_urbano === 'rural' ? 'Rural' : 'Urbano' });
    }
    if (property.tiene_parqueadero) {
      const cantidad = property.num_parqueaderos
        ? `${property.num_parqueaderos} ${property.num_parqueaderos === 1 ? 'parqueadero' : 'parqueaderos'}`
        : 'Parqueadero';
      const tipo = property.tipo_parqueadero ? ` (${this.tipoParqueaderoLabel(property.tipo_parqueadero)})` : '';
      items.push({ icon: 'parking', label: `${cantidad}${tipo}` });
    }
    if (property.balcon) items.push({ icon: 'balcony', label: 'Balcón' });
    if (property.terraza) {
      items.push({ icon: 'terrace', label: property.tipo_inmueble === 'finca' ? 'Terraza y/o patio' : 'Terraza' });
    }
    if (property.patio) {
      items.push({ icon: 'patio', label: property.tipo_inmueble === 'local' ? 'Patio/zona de lavado' : 'Patio' });
    }
    if (property.bodega) items.push({ icon: 'storage', label: 'Bodega' });
    if (property.zona_bbq) items.push({ icon: 'grill', label: 'Zona BBQ' });
    if (property.piscina) items.push({ icon: 'pool', label: 'Piscina' });
    if (property.cocina) items.push({ icon: 'kitchen', label: 'Cocina' });
    if (property.conjunto_cerrado) items.push({ icon: 'gated', label: 'Conjunto cerrado o edificio' });
    if (property.valor_administracion !== null) {
      items.push({
        icon: 'fee',
        label: `Administración: ${new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(Number(property.valor_administracion))}`,
      });
    }
    if (property.tiene_servicios) {
      const servicios = [
        property.tiene_alcantarillado ? 'alcantarillado' : null,
        property.tiene_acueducto ? 'acueducto' : null,
      ].filter((s): s is string => s !== null);
      items.push({
        icon: 'utilities',
        label: servicios.length > 0 ? `Servicios: ${servicios.join(', ')}` : 'Servicios',
      });
    }
    if (property.permite_permuta) items.push({ icon: 'exchange', label: 'Recibe permuta' });
    return items;
  });

  protected readonly notasAdicionales = computed(() => {
    const property = this.property();
    const notas: { label: string; texto: string }[] = [];
    if (property.actividad) notas.push({ label: 'Actividad', texto: property.actividad });
    if (property.zonas_comunes) notas.push({ label: 'Zonas comunes', texto: property.zonas_comunes });
    if (property.adicionales) notas.push({ label: 'Adicionales', texto: property.adicionales });
    return notas;
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

  protected onSlideClick(index: number): void {
    if (this.dragMoved) {
      this.dragMoved = false;
      return;
    }
    this.goTo(index);
  }

  protected slideScale(index: number): number {
    const distance = Math.abs(index - this.activeIndex());
    if (distance === 0) return 1;
    if (distance === 1) return 0.9;
    return 0.8;
  }

  protected slideOpacity(index: number): number {
    const distance = Math.abs(index - this.activeIndex());
    if (distance === 0) return 1;
    if (distance === 1) return 0.75;
    return 0.4;
  }

  protected slideZIndex(index: number): number {
    return 10 - Math.abs(index - this.activeIndex());
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

  protected onPointerDown(event: PointerEvent): void {
    if (this.photos().length <= 1) {
      return;
    }
    this.dragStartX = event.clientX;
    this.dragPointerId = event.pointerId;
    this.dragMoved = false;
    this.isDragging.set(true);
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  }

  protected onPointerMove(event: PointerEvent): void {
    if (!this.isDragging()) {
      return;
    }
    const offset = event.clientX - this.dragStartX;
    if (Math.abs(offset) > 5) {
      this.dragMoved = true;
    }
    this.dragOffset.set(offset);
  }

  protected onPointerUp(event: PointerEvent): void {
    if (!this.isDragging()) {
      return;
    }
    const delta = this.dragOffset();
    const threshold = 60;
    if (delta <= -threshold) {
      this.next();
    } else if (delta >= threshold) {
      this.prev();
    }
    this.isDragging.set(false);
    this.dragOffset.set(0);
    if (this.dragPointerId !== null) {
      (event.currentTarget as HTMLElement).releasePointerCapture(this.dragPointerId);
      this.dragPointerId = null;
    }
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
