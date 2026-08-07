import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { ProyectoPublic, ProyectoTipoPublic } from '../../../../client';
import { whatsappLink } from '../../../core/whatsapp/whatsapp.util';
import { ProjectFotosCarouselComponent } from '../project-fotos-carousel/project-fotos-carousel.component';

const ESTADO_LABELS: Record<string, string> = {
  planos: 'Planos',
  construccion_1: 'Construcción I',
  construccion_2: 'Construcción II',
  entrega_inmediata: 'Entrega inmediata',
};

const ZONA_COMUN_LABELS: Record<string, string> = {
  piscina: 'Piscina',
  parque_infantil: 'Parque infantil',
  cancha: 'Cancha',
  parqueadero_visitantes: 'Parqueadero visitantes',
  zonas_verdes: 'Zonas verdes',
  salon_social: 'Salón social',
  zona_bbq: 'Zona BBQ',
  gimnasio: 'Gimnasio',
  lobby: 'Lobby',
  zona_humeda: 'Zona húmeda',
  porteria_digital: 'Vigilante o portería digital',
};

const TIPO_UNIDAD_LABELS: Record<string, string> = {
  local: 'Local',
  apartaestudio: 'Apartaestudio',
  apartamento: 'Apartamento',
  penthouse: 'Penthouse',
};

const VISTA_LABELS: Record<string, string> = {
  interna: 'Vista interna',
  externa: 'Vista externa',
};

const CURRENCY_FORMATTER = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

@Component({
  selector: 'app-project-story',
  standalone: true,
  imports: [CurrencyPipe, DecimalPipe, ProjectFotosCarouselComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './project-story.component.html',
  styleUrl: './project-story.component.scss',
})
export class ProjectStoryComponent {
  readonly project = input.required<ProyectoPublic>();
  readonly index = input.required<number>();

  protected readonly estadoLabel = computed(() => ESTADO_LABELS[this.project().estado] ?? this.project().estado);
  protected readonly isReversed = computed(() => this.index() % 2 === 1);

  protected readonly whatsappHref = computed(() =>
    whatsappLink(`Hola, quisiera más información sobre el proyecto ${this.project().nombre}.`),
  );

  protected readonly zonasComunesLabels = computed(() =>
    this.project().tiene_zonas_comunes
      ? (this.project().zonas_comunes ?? []).map((zona) => ZONA_COMUN_LABELS[zona] ?? zona)
      : [],
  );

  protected readonly administracionLabel = computed(() => {
    const proyecto = this.project();
    if (!proyecto.conjunto_cerrado) return null;
    if (proyecto.valor_administracion_por_definir) return 'Por definir';
    if (proyecto.valor_administracion !== null) {
      return CURRENCY_FORMATTER.format(Number(proyecto.valor_administracion));
    }
    return null;
  });

  protected readonly tipos = computed(() => this.project().tipos);

  protected tipoLabel(tipo: ProyectoTipoPublic): string {
    return TIPO_UNIDAD_LABELS[tipo.categoria] ?? tipo.categoria;
  }

  protected vistaLabel(tipo: ProyectoTipoPublic): string {
    return VISTA_LABELS[tipo.vista] ?? tipo.vista;
  }
}
