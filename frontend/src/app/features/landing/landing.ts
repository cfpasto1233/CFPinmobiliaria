import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="min-vh-100 d-flex flex-column align-items-center justify-content-center">
      <h1 class="display-4 fw-bold">Cfpasto</h1>
      <p class="lead text-muted">Bienvenido a la plataforma.</p>
      <div class="d-flex gap-3 mt-3">
        <a routerLink="/auth/login" class="btn btn-primary">Iniciar sesión</a>
        <a routerLink="/auth/register" class="btn btn-outline-secondary">Registrarse</a>
      </div>
    </main>
  `,
})
export class Landing {}
