import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { PropiedadPublic } from '../../../../client';
import { PropertyGalleryModalComponent } from '../property-gallery-modal/property-gallery-modal.component';
import { whatsappLink } from '../../../core/whatsapp/whatsapp.util';

@Component({
  selector: 'app-property-card',
  standalone: true,
  imports: [CurrencyPipe, PropertyGalleryModalComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './property-card.component.html',
  styleUrl: './property-card.component.scss',
})
export class PropertyCardComponent {
  readonly property = input.required<PropiedadPublic>();

  protected readonly galleryOpen = signal(false);

  protected readonly whatsappHref = computed(() => {
    const numero = this.property().whatsapp;
    if (!numero) return null;
    return whatsappLink(
      `Hola, quiero agendar una cita para conocer la propiedad "${this.property().nombre}" ubicada en ${this.property().ubicacion}.`,
      `57${numero}`,
    );
  });

  protected openGallery(): void {
    this.galleryOpen.set(true);
  }

  protected closeGallery(): void {
    this.galleryOpen.set(false);
  }
}
