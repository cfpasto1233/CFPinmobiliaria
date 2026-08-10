import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface AdminNavItem {
  label: string;
  path: string;
  icon: 'overview' | 'users' | 'properties' | 'projects' | 'campaign' | 'requests' | 'calendar';
}

interface AdminNavSection {
  label: string;
  items: readonly AdminNavItem[];
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

  protected readonly navSections: readonly AdminNavSection[] = [
    {
      label: 'Catálogo',
      items: [
        { label: 'Propiedades', path: '/admin/propiedades', icon: 'properties' },
        { label: 'Proyectos', path: '/admin/proyectos', icon: 'projects' },
        { label: 'Eventos', path: '/admin/eventos', icon: 'calendar' },
      ],
    },
    {
      label: 'Leads y citas',
      items: [
        { label: 'Solicitudes de venta', path: '/admin/solicitudes-venta', icon: 'requests' },
        { label: 'Solicitudes de arriendo', path: '/admin/solicitudes-arriendo', icon: 'requests' },
        {
          label: 'Solicitudes de propietarios',
          path: '/admin/solicitudes-arrendar-propiedad',
          icon: 'requests',
        },
        {
          label: 'Solicitudes de publicación',
          path: '/admin/solicitudes-publicar-propiedad',
          icon: 'requests',
        },
        { label: 'Sugerencias', path: '/admin/solicitudes-sugerencias', icon: 'requests' },
        {
          label: 'Documentos de propietarios',
          path: '/admin/solicitudes-documentos-propietario',
          icon: 'requests',
        },
        { label: 'Reportes de daño', path: '/admin/reportes-dano', icon: 'requests' },
        { label: 'Citas', path: '/admin/citas', icon: 'calendar' },
      ],
    },
    {
      label: 'Marketing',
      items: [{ label: 'Campaña', path: '/admin/campana', icon: 'campaign' }],
    },
  ];
}
