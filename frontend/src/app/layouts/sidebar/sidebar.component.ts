import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface AdminNavItem {
  label: string;
  path: string;
  icon: 'overview' | 'users';
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class SidebarComponent {
  readonly open = input(false);

  // Sin módulos habilitados todavía para el superadmin.
  protected readonly navItems: readonly AdminNavItem[] = [];
}
