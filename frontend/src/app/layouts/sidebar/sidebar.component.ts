import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface AdminNavItem {
  label: string;
  path: string;
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

  protected readonly navItems: readonly AdminNavItem[] = [
    { label: 'Resumen', path: '/admin/resumen' },
    { label: 'Usuarios', path: '/admin/usuarios' },
  ];
}
