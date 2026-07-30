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

type SpecIcon = 'bed' | 'bath' | 'area' | 'age' | 'parking';

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

  // Baños/habitaciones/área/antigüedad/parqueadero existen para todos los tipos
  // de inmueble excepto lote.
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
    if (property.area_construida !== null) {
      items.push({ icon: 'area', label: `${property.area_construida} m² construidos` });
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
    if (property.tiene_parqueadero) {
      items.push({
        icon: 'parking',
        label: property.num_parqueaderos
          ? `${property.num_parqueaderos} ${property.num_parqueaderos === 1 ? 'parqueadero' : 'parqueaderos'}`
          : 'Parqueadero',
      });
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
