import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../layouts/navbar/navbar.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink, NavbarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-navbar />

    <main class="landing-hero min-vh-100 d-flex flex-column align-items-center justify-content-center">
      <h1 class="display-4 fw-bold">Cfpasto</h1>
      <p class="lead text-muted">Bienvenido a la plataforma.</p>
      <div class="d-flex gap-3 mt-3">
        <a routerLink="/auth/login" class="btn btn-primary">Iniciar sesi&oacute;n</a>
        <a routerLink="/auth/register" class="btn btn-outline-secondary">Registrarse</a>
      </div>
    </main>
  `,
  styles: `
    :host {
      display: block;
      background-color: #ffffff;
    }

    .landing-hero {
      padding-top: 5rem;
    }
  `,
})
export class Landing {}
