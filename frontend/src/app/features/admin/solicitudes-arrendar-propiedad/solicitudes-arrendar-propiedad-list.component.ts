import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Store } from '@ngrx/store';
import { SolicitudArrendarPropiedadPublic } from '../../../../client';
import { SolicitudesArrendarPropiedadActions } from '../../../store/SolicitudesArrendarPropiedad/solicitudes-arrendar-propiedad.actions';
import {
  selectSolicitudesArrendarPropiedadError,
  selectSolicitudesArrendarPropiedadItems,
  selectSolicitudesArrendarPropiedadLoading,
} from '../../../store/SolicitudesArrendarPropiedad/solicitudes-arrendar-propiedad.selectors';
import { SolicitudArrendarPropiedadDetalleModalComponent } from './solicitud-arrendar-propiedad-detalle-modal/solicitud-arrendar-propiedad-detalle-modal.component';

const MEDIO_LABELS: Record<string, string> = {
  whatsapp: 'WhatsApp',
  llamada: 'Llamada telefónica',
  correo: 'Correo electrónico',
};

@Component({
  selector: 'app-solicitudes-arrendar-propiedad-list',
  standalone: true,
  imports: [DatePipe, SolicitudArrendarPropiedadDetalleModalComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './solicitudes-arrendar-propiedad-list.component.html',
  styleUrl: './solicitudes-arrendar-propiedad-list.component.scss',
})
export class SolicitudesArrendarPropiedadListComponent implements OnInit {
  private readonly store = inject(Store);

  protected readonly items = this.store.selectSignal(selectSolicitudesArrendarPropiedadItems);
  protected readonly loading = this.store.selectSignal(selectSolicitudesArrendarPropiedadLoading);
  protected readonly error = this.store.selectSignal(selectSolicitudesArrendarPropiedadError);

  protected readonly selected = signal<SolicitudArrendarPropiedadPublic | null>(null);

  ngOnInit(): void {
    this.store.dispatch(SolicitudesArrendarPropiedadActions.load());
  }

  protected openDetalle(item: SolicitudArrendarPropiedadPublic): void {
    this.selected.set(item);
  }

  protected closeDetalle(): void {
    this.selected.set(null);
  }

  protected medioLabel(item: SolicitudArrendarPropiedadPublic): string {
    if (!item.medio_comunicacion) return '—';
    return MEDIO_LABELS[item.medio_comunicacion] ?? item.medio_comunicacion;
  }
}
