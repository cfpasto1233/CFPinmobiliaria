import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { ProyectoFotoPublic } from '../../../../client';

@Component({
  selector: 'app-project-fotos-carousel',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './project-fotos-carousel.component.html',
  styleUrl: './project-fotos-carousel.component.scss',
})
export class ProjectFotosCarouselComponent {
  readonly fotos = input.required<ProyectoFotoPublic[]>();

  protected readonly activeIndex = signal(0);
  protected readonly active = computed(() => this.fotos()[this.activeIndex()]);

  protected prev(): void {
    const total = this.fotos().length;
    this.activeIndex.update((i) => (i - 1 + total) % total);
  }

  protected next(): void {
    const total = this.fotos().length;
    this.activeIndex.update((i) => (i + 1) % total);
  }

  protected goTo(index: number): void {
    this.activeIndex.set(index);
  }
}
