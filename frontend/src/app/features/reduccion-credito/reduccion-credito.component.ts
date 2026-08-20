import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
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
  protected readonly ctaHref =
    'https://avanzar-reduccion-de-credito-hipotecario.bitrix24.site/andres-tello/';
}
