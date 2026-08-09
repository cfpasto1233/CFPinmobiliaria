import { ChangeDetectionStrategy, Component, ElementRef, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { whatsappLink } from '../../core/whatsapp/whatsapp.util';
import { FooterComponent } from '../../layouts/footer/footer.component';
import { NavbarComponent } from '../../layouts/navbar/navbar.component';

interface Pilar {
  tituloAcento: string;
  tituloResto: string;
  texto: string;
}

@Component({
  selector: 'app-quienes-somos',
  standalone: true,
  imports: [NavbarComponent, FooterComponent, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './quienes-somos.component.html',
  styleUrl: './quienes-somos.component.scss',
})
export class QuienesSomosComponent {
  @ViewChild('serviciosSection') private readonly serviciosSection?: ElementRef<HTMLElement>;
  @ViewChild('pilaresSection') private readonly pilaresSection?: ElementRef<HTMLElement>;

  protected readonly whatsappAyudaHref = whatsappLink(
    'Hola, quiero conocer más sobre los servicios de CFP Inmobiliaria.',
  );

  protected readonly whatsappAsesoriasHref = whatsappLink(
    'Hola, quiero agendar una asesoría con CFP Inmobiliaria.',
  );

  protected readonly pilares: Pilar[] = [
    {
      tituloAcento: 'Innovación',
      tituloResto: 'que genera resultados',
      texto:
        'Estrategias digitales avanzadas, producción audiovisual con drones e inteligencia artificial para posicionar tu inmueble y conectar con más compradores.',
    },
    {
      tituloAcento: 'Respaldo jurídico',
      tituloResto: 'en cada paso',
      texto:
        'Revisión de títulos, análisis detallado del inmueble y acompañamiento legal desde la visita hasta la entrega de la escritura.',
    },
    {
      tituloAcento: 'Gestión integral',
      tituloResto: 'y eficiente',
      texto:
        'Administración de recursos, solución de conflictos con servicios públicos y trámites notariales ágiles para una experiencia sin complicaciones.',
    },
  ];

  protected scrollToServicios(): void {
    this.serviciosSection?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  protected scrollToPilares(): void {
    this.pilaresSection?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
