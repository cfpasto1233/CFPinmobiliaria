import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { whatsappLink } from '../../core/whatsapp/whatsapp.util';
import { FooterComponent } from '../../layouts/footer/footer.component';
import { NavbarComponent } from '../../layouts/navbar/navbar.component';

@Component({
  selector: 'app-reduccion-credito',
  standalone: true,
  imports: [NavbarComponent, FooterComponent, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './reduccion-credito.component.html',
  styleUrl: './reduccion-credito.component.scss',
})
export class ReduccionCreditoComponent {
  protected readonly whatsappHref = whatsappLink(
    'Hola, quiero solicitar un diagnóstico gratuito de reducción de crédito con Avanzar y CFP Inmobiliaria.',
  );
}
