import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { PropiedadPublic } from '../../../../client';
import { PropertyGalleryModalComponent } from '../property-gallery-modal/property-gallery-modal.component';

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

  protected openGallery(): void {
    this.galleryOpen.set(true);
  }

  protected closeGallery(): void {
    this.galleryOpen.set(false);
  }
}
