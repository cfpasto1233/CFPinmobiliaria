import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Store } from '@ngrx/store';
import { SolicitudSugerenciaPublic } from '../../../../client';
import { SolicitudesSugerenciasActions } from '../../../store/SolicitudesSugerencias/solicitudes-sugerencias.actions';
import {
  selectSolicitudesSugerenciasError,
  selectSolicitudesSugerenciasItems,
  selectSolicitudesSugerenciasLoading,
} from '../../../store/SolicitudesSugerencias/solicitudes-sugerencias.selectors';
import { SolicitudSugerenciaDetalleModalComponent } from './solicitud-sugerencia-detalle-modal/solicitud-sugerencia-detalle-modal.component';

const MEDIO_LABELS: Record<string, string> = {
  whatsapp: 'WhatsApp',
  llamada: 'Llamada telefónica',
};

@Component({
  selector: 'app-solicitudes-sugerencias-list',
  standalone: true,
  imports: [DatePipe, SolicitudSugerenciaDetalleModalComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './solicitudes-sugerencias-list.component.html',
  styleUrl: './solicitudes-sugerencias-list.component.scss',
})
export class SolicitudesSugerenciasListComponent implements OnInit {
  private readonly store = inject(Store);

  protected readonly items = this.store.selectSignal(selectSolicitudesSugerenciasItems);
  protected readonly loading = this.store.selectSignal(selectSolicitudesSugerenciasLoading);
  protected readonly error = this.store.selectSignal(selectSolicitudesSugerenciasError);

  protected readonly selected = signal<SolicitudSugerenciaPublic | null>(null);

  ngOnInit(): void {
    this.store.dispatch(SolicitudesSugerenciasActions.load());
  }

  protected openDetalle(item: SolicitudSugerenciaPublic): void {
    this.selected.set(item);
  }

  protected closeDetalle(): void {
    this.selected.set(null);
  }

  protected medioLabel(item: SolicitudSugerenciaPublic): string {
    if (!item.medio_comunicacion) return '—';
    return MEDIO_LABELS[item.medio_comunicacion] ?? item.medio_comunicacion;
  }
}
