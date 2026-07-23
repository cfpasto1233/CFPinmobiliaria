import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { AuthService } from '../../../core/auth/auth.service';
import { AuthActions } from '../../../store/Authentication/authentication.actions';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(Store);
  protected readonly auth = inject(AuthService);

  readonly loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(1)]],
    rememberMe: [false],
  });

  onSubmit(): void {
    if (this.loginForm.invalid) return;
    const { email, password, rememberMe } = this.loginForm.getRawValue();
    this.store.dispatch(
      AuthActions.login({ email: email ?? '', password: password ?? '', rememberMe: rememberMe ?? false }),
    );
  }
}
