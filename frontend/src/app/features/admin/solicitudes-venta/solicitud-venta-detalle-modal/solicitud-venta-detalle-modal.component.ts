import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, HostListener, OnDestroy, OnInit, computed, input, output } from '@angular/core';
import { SolicitudVentaPublic } from '../../../../../client';

interface DetalleField {
  label: string;
  value: string;
}

const MEDIO_LABELS: Record<string, string> = {
  whatsapp: 'WhatsApp',
  llamada: 'Llamada',
};

const FORMA_PAGO_LABELS: Record<string, string> = {
  contado: 'De contado',
  credito_hipotecario: 'Crédito hipotecario',
  otros: 'Otra forma de pago',
};

@Component({
  selector: 'app-solicitud-venta-detalle-modal',
  standalone: true,
  imports: [DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './solicitud-venta-detalle-modal.component.html',
  styleUrl: './solicitud-venta-detalle-modal.component.scss',
})
export class SolicitudVentaDetalleModalComponent implements OnInit, OnDestroy {
  readonly solicitud = input.required<SolicitudVentaPublic>();
  readonly closed = output<void>();

  protected readonly medioLabel = computed(
    () => MEDIO_LABELS[this.solicitud().medio_comunicacion] ?? this.solicitud().medio_comunicacion,
  );

  protected readonly formaPagoLabel = computed(
    () => FORMA_PAGO_LABELS[this.solicitud().forma_pago] ?? this.solicitud().forma_pago,
  );

  protected readonly detalleFields = computed<DetalleField[]>(() => {
    const solicitud = this.solicitud();
    const fields: DetalleField[] = [];

    if (solicitud.forma_pago === 'credito_hipotecario') {
      fields.push(
        { label: 'Valor disponible a crédito', value: solicitud.valor_disponible_credito ?? '—' },
        { label: 'Valor disponible de contado', value: solicitud.valor_disponible_contado ?? '—' },
      );
    } else if (solicitud.forma_pago === 'otros') {
      fields.push({
        label: 'Descripción de la forma de pago',
        value: solicitud.forma_pago_otro ?? '—',
      });
    }

    fields.push({ label: 'Sectores de interés', value: solicitud.sectores_interes ?? '—' });

    if (solicitud.sugerencias) {
      fields.push({ label: 'Sugerencias', value: solicitud.sugerencias });
    }

    return fields;
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
