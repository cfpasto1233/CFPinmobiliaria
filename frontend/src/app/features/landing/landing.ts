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

    <section class="hero">
      <div class="hero-content">
        <h1 class="hero-title">T&iacute;tulo placeholder</h1>
        <p class="hero-subtitle">Subt&iacute;tulo placeholder para la plataforma</p>
        <a routerLink="/auth/login" class="btn btn-accent-hero">Comenzar ahora</a>
      </div>
    </section>
  `,
  styles: `
    :host {
      display: block;
    }

    .hero {
      position: relative;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #ffffff;
      overflow: hidden;
    }

    .hero-content {
      position: relative;
      text-align: center;
      padding: 2rem;
      max-width: 800px;
    }

    .hero-title {
      font-family: 'Outfit', sans-serif;
      font-weight: 700;
      font-size: 3.5rem;
      color: #1a1a2e;
      margin-bottom: 1rem;
      line-height: 1.1;
    }

    .hero-subtitle {
      font-family: 'Poppins', sans-serif;
      font-weight: 400;
      font-size: 1.15rem;
      color: #6b7280;
      margin-bottom: 2rem;
      max-width: 560px;
      margin-left: auto;
      margin-right: auto;
    }

    .btn-accent-hero {
      display: inline-block;
      font-family: 'Poppins', sans-serif;
      font-weight: 600;
      font-size: 1rem;
      padding: 0.8rem 2rem;
      border-radius: 0.5rem;
      background-color: #0C2C73;
      color: #ffffff;
      border: none;
      text-decoration: none;
      transition: background-color 0.2s ease, transform 0.2s ease;

      &:hover {
        background-color: #1a4399;
        color: #ffffff;
        transform: translateY(-1px);
      }
    }

    @media (max-width: 767.98px) {
      .hero-title {
        font-size: 2.25rem;
      }

      .hero-subtitle {
        font-size: 1rem;
      }
    }
  `,
})
export class Landing {}
