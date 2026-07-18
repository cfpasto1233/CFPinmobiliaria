import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container py-5">
      <h2>Dashboard</h2>
      @if (auth.user(); as user) {
        <p>Bienvenido, <strong>{{ user.email }}</strong></p>
      }
      <button class="btn btn-outline-danger mt-3" (click)="auth.logout()">
        Cerrar sesión
      </button>
    </div>
  `,
})
export class DashboardComponent {
  readonly auth = inject(AuthService);
}
