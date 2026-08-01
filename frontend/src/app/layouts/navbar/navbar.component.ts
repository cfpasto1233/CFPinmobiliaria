import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { whatsappLink } from '../../core/whatsapp/whatsapp.util';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class NavbarComponent {
  protected readonly asesorWhatsappLink = whatsappLink(
    'Hola, quiero más información sobre las propiedades de CFP Inmobiliaria.',
  );

  protected readonly searchMenuOpen = signal(false);

  protected toggleSearchMenu(): void {
    this.searchMenuOpen.update((v) => !v);
  }

  protected closeSearchMenu(): void {
    this.searchMenuOpen.set(false);
    this.isArriendosMenuOpen.set(false);
    this.isClientesMenuOpen.set(false);
    this.isPublicarMenuOpen.set(false);
  }

  protected readonly isArriendosMenuOpen = signal(false);

  protected toggleArriendosMenu(): void {
    this.isArriendosMenuOpen.update((open) => !open);
    this.isClientesMenuOpen.set(false);
    this.isPublicarMenuOpen.set(false);
  }

  protected readonly isClientesMenuOpen = signal(false);

  protected toggleClientesMenu(): void {
    this.isClientesMenuOpen.update((open) => !open);
    this.isArriendosMenuOpen.set(false);
    this.isPublicarMenuOpen.set(false);
  }

  protected readonly isPublicarMenuOpen = signal(false);

  protected togglePublicarMenu(): void {
    this.isPublicarMenuOpen.update((open) => !open);
    this.isArriendosMenuOpen.set(false);
    this.isClientesMenuOpen.set(false);
  }
}
