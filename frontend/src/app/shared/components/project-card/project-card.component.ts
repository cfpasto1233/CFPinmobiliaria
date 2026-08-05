import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { ProyectoPublic } from '../../../../client';

const ESTADO_LABELS: Record<string, string> = {
  planos: 'Planos',
  construccion_1: 'Construcción I',
  construccion_2: 'Construcción II',
  entrega_inmediata: 'Entrega inmediata',
};

@Component({
  selector: 'app-project-card',
  standalone: true,
  imports: [CurrencyPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './project-card.component.html',
  styleUrl: './project-card.component.scss',
})
export class ProjectCardComponent {
  readonly project = input.required<ProyectoPublic>();

  protected readonly estadoLabel = computed(() => ESTADO_LABELS[this.project().estado] ?? this.project().estado);
}
