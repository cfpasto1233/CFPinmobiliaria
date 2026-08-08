import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  OnDestroy,
  OnInit,
  computed,
  input,
  output,
} from '@angular/core';
import { SolicitudSugerenciaPublic } from '../../../../../client';

const MEDIO_LABELS: Record<string, string> = {
  whatsapp: 'WhatsApp',
  llamada: 'Llamada telefónica',
};

@Component({
  selector: 'app-solicitud-sugerencia-detalle-modal',
  standalone: true,
  imports: [DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './solicitud-sugerencia-detalle-modal.component.html',
  styleUrl: './solicitud-sugerencia-detalle-modal.component.scss',
})
export class SolicitudSugerenciaDetalleModalComponent implements OnInit, OnDestroy {
  readonly solicitud = input.required<SolicitudSugerenciaPublic>();
  readonly closed = output<void>();

  protected readonly medioLabel = computed(() => {
    const medio = this.solicitud().medio_comunicacion;
    if (!medio) return null;
    return MEDIO_LABELS[medio] ?? medio;
  });

  ngOnInit(): void {
    document.body.style.overflow = 'hidden';
  }

  ngOnDestroy(): void {
    document.body.style.overflow = '';
  }

  protected close(): void {
    this.closed.emit();
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    this.close();
  }
}
