import { ChangeDetectionStrategy, Component, computed, inject, output } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-topbar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './topbar.html',
  styleUrl: './topbar.scss',
})
export class TopbarComponent {
  protected readonly auth = inject(AuthService);

  readonly toggleSidebar = output<void>();

  protected readonly userInitial = computed(() => this.auth.user()?.email?.charAt(0).toUpperCase() ?? '?');
}
