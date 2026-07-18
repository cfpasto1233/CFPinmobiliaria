import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, ViewChild } from '@angular/core';
import { NavbarComponent } from '../../layouts/navbar/navbar.component';

interface FeaturedProperty {
  location: string;
  title: string;
  price: string;
  type: 'venta' | 'arriendo';
}

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [NavbarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './landing.html',
  styleUrl: './landing.scss',
})
export class Landing implements AfterViewInit {
  @ViewChild('heroVideo') private readonly heroVideo?: ElementRef<HTMLVideoElement>;

  // Datos visuales de ejemplo: aún no existe módulo de propiedades/backend.
  protected readonly featuredProperties: readonly FeaturedProperty[] = [
    { location: 'Cartagena, Bolívar', title: 'Apartamento Vista al Mar', price: '$450.000.000', type: 'venta' },
    { location: 'Sopó, Cundinamarca', title: 'Casa Campestre con Piscina', price: '$1.200.000.000', type: 'venta' },
    { location: 'Chapinero, Bogotá', title: 'Oficina Centro Empresarial', price: '$4.500.000', type: 'arriendo' },
    { location: 'El Poblado, Medellín', title: 'Penthouse Moderno', price: '$890.000.000', type: 'venta' },
  ];

  ngAfterViewInit(): void {
    const video = this.heroVideo?.nativeElement;
    if (!video || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    // El atributo `muted` del template no siempre se refleja a tiempo como propiedad DOM
    // para que el navegador autorice el autoplay — se fuerza aquí explícitamente.
    video.muted = true;
    video.play().catch(() => {
      // Autoplay bloqueado por el navegador: el poster/overlay queda como fallback visual.
    });
  }
}
