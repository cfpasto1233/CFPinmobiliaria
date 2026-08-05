import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { ProyectoPublic } from '../../../../client';
import { whatsappLink } from '../../../core/whatsapp/whatsapp.util';

const ESTADO_LABELS: Record<string, string> = {
  planos: 'Planos',
  construccion_1: 'Construcción I',
  construccion_2: 'Construcción II',
  entrega_inmediata: 'Entrega inmediata',
};

@Component({
  selector: 'app-project-story',
  standalone: true,
  imports: [CurrencyPipe, DecimalPipe],
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
}
