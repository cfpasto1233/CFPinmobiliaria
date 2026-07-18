import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, ViewChild } from '@angular/core';
import { NavbarComponent } from '../../layouts/navbar/navbar.component';

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
