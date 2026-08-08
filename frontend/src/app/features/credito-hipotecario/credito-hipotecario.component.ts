import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { whatsappLink } from '../../core/whatsapp/whatsapp.util';
import { FooterComponent } from '../../layouts/footer/footer.component';
import { NavbarComponent } from '../../layouts/navbar/navbar.component';

interface CreditoFeature {
  numero: string;
  titulo: string;
  texto: string;
}

@Component({
  selector: 'app-credito-hipotecario',
  standalone: true,
  imports: [NavbarComponent, FooterComponent, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './credito-hipotecario.component.html',
  styleUrl: './credito-hipotecario.component.scss',
})
export class CreditoHipotecarioComponent {
  protected readonly whatsappHref = whatsappLink(
    'Hola, quiero comparar mi crédito hipotecario con CFP Inmobiliaria.',
  );

  protected readonly bancos: string[] = [
    'Banco AV Villas',
    'Banco de Bogotá',
    'BBVA Colombia',
    'Credifamilia',
    'Itaú',
    'Banco de Occidente',
    'Caja Social',
    'Hipocredit',
    'Banco W',
  ];

  protected readonly features: CreditoFeature[] = [
    {
      numero: '01',
      titulo: 'Comparación inteligente',
      texto:
        'Evaluamos tasas, plazos y condiciones entre los 9 bancos líderes del país para que elijas la mejor opción.',
    },
    {
      numero: '02',
      titulo: 'Análisis completo',
      texto: 'Tasas, plazos, cuotas y todos los costos asociados a una decisión informada.',
    },
    {
      numero: '03',
      titulo: 'Plataforma multibanca digital',
      texto:
        'Tecnología que agiliza procesos y te permite comparar y aplicar desde un solo lugar.',
    },
    {
      numero: '04',
      titulo: 'Acompañamiento total',
      texto: 'Te guiamos en cada etapa, desde la solicitud hasta el desembolso de tu crédito.',
    },
  ];
}
