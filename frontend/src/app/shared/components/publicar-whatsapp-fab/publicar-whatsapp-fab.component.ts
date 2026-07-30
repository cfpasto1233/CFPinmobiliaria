import { ChangeDetectionStrategy, Component } from '@angular/core';
import { whatsappLink } from '../../../core/whatsapp/whatsapp.util';

@Component({
  selector: 'app-publicar-whatsapp-fab',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './publicar-whatsapp-fab.component.html',
  styleUrl: './publicar-whatsapp-fab.component.scss',
})
export class PublicarWhatsappFabComponent {
  protected readonly link = whatsappLink(
    'Hola, quiero publicar mi propiedad con CFP Inmobiliaria.',
  );
}
