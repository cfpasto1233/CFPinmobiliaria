import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-admin-overview',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h2>Resumen</h2>
    @if (auth.user(); as user) {
      <p>Bienvenido, <strong>{{ user.full_name || user.email }}</strong>.</p>
    }
    <p class="text-muted">
      Desde aquí podrás administrar los módulos del panel a medida que se vayan habilitando.
    </p>
  `,
})
export class AdminOverviewComponent {
  protected readonly auth = inject(AuthService);
}
