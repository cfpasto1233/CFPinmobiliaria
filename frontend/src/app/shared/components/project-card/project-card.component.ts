import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { ProyectoPublic } from '../../../../client';

const ESTADO_LABELS: Record<string, string> = {
  preventa: 'Preventa',
  en_construccion: 'En construcción',
  entrega_inmediata: 'Entrega inmediata',
};

@Component({
  selector: 'app-project-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './project-card.component.html',
  styleUrl: './project-card.component.scss',
})
export class ProjectCardComponent {
  readonly project = input.required<ProyectoPublic>();

  protected readonly estadoLabel = computed(() => ESTADO_LABELS[this.project().estado] ?? this.project().estado);
}
