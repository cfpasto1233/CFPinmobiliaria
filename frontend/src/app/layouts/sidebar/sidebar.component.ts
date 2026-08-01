import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface AdminNavItem {
  label: string;
  path: string;
  icon: 'overview' | 'users' | 'properties' | 'projects' | 'campaign' | 'requests' | 'calendar';
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
    { label: 'Propiedades', path: '/admin/propiedades', icon: 'properties' },
    { label: 'Proyectos', path: '/admin/proyectos', icon: 'projects' },
    { label: 'Citas', path: '/admin/citas', icon: 'calendar' },
    { label: 'Campaña', path: '/admin/campana', icon: 'campaign' },
    { label: 'Solicitudes de venta', path: '/admin/solicitudes-venta', icon: 'requests' },
    { label: 'Solicitudes de arriendo', path: '/admin/solicitudes-arriendo', icon: 'requests' },
  ];
}
