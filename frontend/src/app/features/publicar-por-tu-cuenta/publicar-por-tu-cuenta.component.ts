import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { whatsappLink } from '../../core/whatsapp/whatsapp.util';
import { FooterComponent } from '../../layouts/footer/footer.component';
import { NavbarComponent } from '../../layouts/navbar/navbar.component';
import { PublicarWhatsappFabComponent } from '../../shared/components/publicar-whatsapp-fab/publicar-whatsapp-fab.component';

interface PricingPlan {
  id: string;
  nombre: string;
  precio: string;
  badge?: string;
  features: string[];
  whatsappHref: string;
}

function planWhatsappHref(nombre: string, precio: string): string {
  return whatsappLink(
    `Hola, quiero información del Plan ${nombre} (${precio}) para publicar mi propiedad con CFP Inmobiliaria.`,
  );
}

@Component({
  selector: 'app-publicar-por-tu-cuenta',
  standalone: true,
  imports: [NavbarComponent, FooterComponent, RouterLink, PublicarWhatsappFabComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './publicar-por-tu-cuenta.component.html',
  styleUrl: './publicar-por-tu-cuenta.component.scss',
})
export class PublicarPorTuCuentaComponent {
  protected readonly plans: readonly PricingPlan[] = [
    {
      id: 'basico',
      nombre: 'Básico',
      precio: '$60.000',
      features: [
        'Publicación por 3 meses en la web con contacto directo con el propietario',
        '10 fotos enviadas por el propietario',
        'Revisión de títulos y descripción',
      ],
      whatsappHref: planWhatsappHref('Básico', '$60.000'),
    },
    {
      id: 'estandar',
      nombre: 'Estándar',
      precio: '$210.000',
      features: [
        'Fotos profesionales de la propiedad',
        'Video editado con recorrido por la propiedad',
        'Pieza gráfica con descripción y aspectos relevantes',
        'Contacto directo con el propietario',
      ],
      whatsappHref: planWhatsappHref('Estándar', '$210.000'),
    },
    {
      id: 'premium',
      nombre: 'Premium',
      precio: '$380.000',
      badge: 'Más popular',
      features: [
        'Todo lo anterior del Plan Estándar',
        'Video con dron (2 minutos editados)',
        'Presentación completa que destaca tu propiedad',
        'Inclusión en catálogo compartido en grupos privados de Facebook',
      ],
      whatsappHref: planWhatsappHref('Premium', '$380.000'),
    },
    {
      id: 'asesoria-legal',
      nombre: 'Asesoría Legal Opcional',
      precio: '$250.000',
      features: [
        'Promesa de compraventa con respaldo legal',
        'Verificación de recursos para mayor seguridad',
        'Gestión documental completa',
        'Certificados y escrituras sin complicaciones',
      ],
      whatsappHref: planWhatsappHref('Asesoría Legal Opcional', '$250.000'),
    },
  ];
}
