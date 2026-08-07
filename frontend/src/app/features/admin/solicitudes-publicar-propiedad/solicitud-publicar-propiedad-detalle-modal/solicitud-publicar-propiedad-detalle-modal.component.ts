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
import { SolicitudPublicarPropiedadPublic } from '../../../../../client';

const MEDIO_LABELS: Record<string, string> = {
  whatsapp: 'WhatsApp',
  llamada: 'Llamada telefónica',
  correo: 'Correo electrónico',
};

@Component({
  selector: 'app-solicitud-publicar-propiedad-detalle-modal',
  standalone: true,
  imports: [DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './solicitud-publicar-propiedad-detalle-modal.component.html',
  styleUrl: './solicitud-publicar-propiedad-detalle-modal.component.scss',
})
export class SolicitudPublicarPropiedadDetalleModalComponent implements OnInit, OnDestroy {
  readonly solicitud = input.required<SolicitudPublicarPropiedadPublic>();
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
