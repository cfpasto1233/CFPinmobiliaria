import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, HostListener, OnDestroy, OnInit, computed, input, output } from '@angular/core';
import { SolicitudArriendoPublic } from '../../../../../client';

const MEDIO_LABELS: Record<string, string> = {
  whatsapp: 'WhatsApp',
  llamada: 'Llamada telefónica',
  correo: 'Correo electrónico',
};

@Component({
  selector: 'app-solicitud-arriendo-detalle-modal',
  standalone: true,
  imports: [DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './solicitud-arriendo-detalle-modal.component.html',
  styleUrl: './solicitud-arriendo-detalle-modal.component.scss',
})
export class SolicitudArriendoDetalleModalComponent implements OnInit, OnDestroy {
  readonly solicitud = input.required<SolicitudArriendoPublic>();
  readonly closed = output<void>();

  protected readonly medioLabel = computed(
    () => MEDIO_LABELS[this.solicitud().medio_contacto] ?? this.solicitud().medio_contacto,
  );

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
