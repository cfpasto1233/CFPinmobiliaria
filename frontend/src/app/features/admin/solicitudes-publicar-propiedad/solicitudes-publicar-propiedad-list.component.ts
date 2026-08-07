import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Store } from '@ngrx/store';
import { SolicitudPublicarPropiedadPublic } from '../../../../client';
import { SolicitudesPublicarPropiedadActions } from '../../../store/SolicitudesPublicarPropiedad/solicitudes-publicar-propiedad.actions';
import {
  selectSolicitudesPublicarPropiedadError,
  selectSolicitudesPublicarPropiedadItems,
  selectSolicitudesPublicarPropiedadLoading,
} from '../../../store/SolicitudesPublicarPropiedad/solicitudes-publicar-propiedad.selectors';
import { SolicitudPublicarPropiedadDetalleModalComponent } from './solicitud-publicar-propiedad-detalle-modal/solicitud-publicar-propiedad-detalle-modal.component';

const MEDIO_LABELS: Record<string, string> = {
  whatsapp: 'WhatsApp',
  llamada: 'Llamada telefónica',
  correo: 'Correo electrónico',
};

@Component({
  selector: 'app-solicitudes-publicar-propiedad-list',
  standalone: true,
  imports: [DatePipe, SolicitudPublicarPropiedadDetalleModalComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './solicitudes-publicar-propiedad-list.component.html',
  styleUrl: './solicitudes-publicar-propiedad-list.component.scss',
})
export class SolicitudesPublicarPropiedadListComponent implements OnInit {
  private readonly store = inject(Store);

  protected readonly items = this.store.selectSignal(selectSolicitudesPublicarPropiedadItems);
  protected readonly loading = this.store.selectSignal(selectSolicitudesPublicarPropiedadLoading);
  protected readonly error = this.store.selectSignal(selectSolicitudesPublicarPropiedadError);

  protected readonly selected = signal<SolicitudPublicarPropiedadPublic | null>(null);

  ngOnInit(): void {
    this.store.dispatch(SolicitudesPublicarPropiedadActions.load());
  }

  protected openDetalle(item: SolicitudPublicarPropiedadPublic): void {
    this.selected.set(item);
  }

  protected closeDetalle(): void {
    this.selected.set(null);
  }

  protected medioLabel(item: SolicitudPublicarPropiedadPublic): string {
    if (!item.medio_comunicacion) return '—';
    return MEDIO_LABELS[item.medio_comunicacion] ?? item.medio_comunicacion;
  }
}
