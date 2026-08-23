import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { whatsappLink } from '../../../core/whatsapp/whatsapp.util';

@Component({
  selector: 'app-publicar-whatsapp-fab',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './publicar-whatsapp-fab.component.html',
  styleUrl: './publicar-whatsapp-fab.component.scss',
})
export class PublicarWhatsappFabComponent {
  readonly message = input.required<string>();
  protected readonly link = computed(() => whatsappLink(this.message()));
}
