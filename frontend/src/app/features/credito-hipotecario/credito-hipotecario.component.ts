import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FooterComponent } from '../../layouts/footer/footer.component';
import { NavbarComponent } from '../../layouts/navbar/navbar.component';

interface CreditoFeature {
  numero: string;
  titulo: string;
  texto: string;
}

interface BancoLogo {
  nombre: string;
  logo: string;
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
  protected readonly ctaHref =
    'https://loquenecesito.co/store?referrerCode=hp06286&isCreditOnly=ok';

  protected readonly bancos: BancoLogo[] = [
    { nombre: 'Banco AV Villas', logo: 'images/av-villas.webp' },
    { nombre: 'Banco de Bogotá', logo: 'images/bbogota.webp' },
    { nombre: 'BBVA Colombia', logo: 'images/bbva.webp' },
    { nombre: 'Credifamilia', logo: 'images/credifamilia.webp' },
    { nombre: 'Itaú', logo: 'images/itau.webp' },
    { nombre: 'Banco de Occidente', logo: 'images/b-occidente.webp' },
    { nombre: 'Caja Social', logo: 'images/banco-caja-social.webp' },
    { nombre: 'Hipocredit', logo: 'images/hipo.webp' },
    { nombre: 'Banco W', logo: 'images/banco-w.webp' },
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
