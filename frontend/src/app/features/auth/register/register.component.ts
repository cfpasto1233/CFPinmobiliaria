import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NotificationService } from '../../../core/notifications/notification.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div class="card shadow-sm" style="width: 100%; max-width: 420px">
        <div class="card-body p-4">
          <h2 class="card-title text-center mb-4">Crear cuenta</h2>
          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <div class="mb-3">
              <label for="email" class="form-label">Correo electrónico</label>
              <input id="email" type="email" class="form-control" formControlName="email" />
            </div>
            <div class="mb-3">
              <label for="password" class="form-label">Contraseña</label>
              <input id="password" type="password" class="form-control" formControlName="password" />
            </div>
            <button type="submit" class="btn btn-primary w-100" [disabled]="form.invalid || submitting()">
              Registrarse
            </button>
          </form>
          <p class="text-center mt-3 mb-0">
            ¿Ya tienes cuenta? <a routerLink="/auth/login">Inicia sesión</a>
          </p>
        </div>
      </div>
    </div>
  `,
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly notif = inject(NotificationService);

  readonly submitting = signal(false);

  readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  onSubmit(): void {
    if (this.form.invalid) return;
    this.notif.info('Funcionalidad disponible tras generar el cliente HTTP.');
  }
}
