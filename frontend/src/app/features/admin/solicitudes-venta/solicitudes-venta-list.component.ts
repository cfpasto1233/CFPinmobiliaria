import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Store } from '@ngrx/store';
import { SolicitudVentaPublic } from '../../../../client';
import { SolicitudesVentaActions } from '../../../store/SolicitudesVenta/solicitudes-venta.actions';
import {
  selectSolicitudesVentaError,
  selectSolicitudesVentaItems,
  selectSolicitudesVentaLoading,
} from '../../../store/SolicitudesVenta/solicitudes-venta.selectors';
import { SolicitudVentaDetalleModalComponent } from './solicitud-venta-detalle-modal/solicitud-venta-detalle-modal.component';

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
  selector: 'app-solicitudes-venta-list',
  standalone: true,
  imports: [DatePipe, SolicitudVentaDetalleModalComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './solicitudes-venta-list.component.html',
  styleUrl: './solicitudes-venta-list.component.scss',
})
export class SolicitudesVentaListComponent implements OnInit {
  private readonly store = inject(Store);

  protected readonly items = this.store.selectSignal(selectSolicitudesVentaItems);
  protected readonly loading = this.store.selectSignal(selectSolicitudesVentaLoading);
  protected readonly error = this.store.selectSignal(selectSolicitudesVentaError);

  protected readonly selected = signal<SolicitudVentaPublic | null>(null);

  ngOnInit(): void {
    this.store.dispatch(SolicitudesVentaActions.load());
  }

  protected openDetalle(item: SolicitudVentaPublic): void {
    this.selected.set(item);
  }

  protected closeDetalle(): void {
    this.selected.set(null);
  }

  protected medioLabel(item: SolicitudVentaPublic): string {
    return MEDIO_LABELS[item.medio_comunicacion] ?? item.medio_comunicacion;
  }

  protected formaPagoLabel(item: SolicitudVentaPublic): string {
    return FORMA_PAGO_LABELS[item.forma_pago] ?? item.forma_pago;
  }

  protected detalle(item: SolicitudVentaPublic): string {
    const partes = [`Sectores: ${item.sectores_interes ?? '—'}`];
    if (item.forma_pago === 'credito_hipotecario') {
      partes.push(
        `Crédito: ${item.valor_disponible_credito ?? '—'} · Contado: ${item.valor_disponible_contado ?? '—'}`,
      );
    } else if (item.forma_pago === 'otros') {
      partes.push(item.forma_pago_otro ?? '—');
    }
    return partes.join(' · ');
  }
}
