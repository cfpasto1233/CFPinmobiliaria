import { ChangeDetectionStrategy, Component } from '@angular/core';

interface FooterLinkGroup {
  heading: string;
  links: readonly string[];
}

@Component({
  selector: 'app-footer',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class FooterComponent {
  protected readonly currentYear = new Date().getFullYear();

  protected readonly linkGroups: readonly FooterLinkGroup[] = [
    { heading: 'Servicios', links: ['Arriendos', 'Ventas', 'Asesorías', 'Publicar propiedad'] },
    { heading: 'Empresa', links: ['Nosotros', 'Equipo', 'Noticias', 'Trabaja con nosotros'] },
    { heading: 'Legal', links: ['Privacidad', 'Términos', 'Cookies', 'HABEAS DATA'] },
  ];
}
