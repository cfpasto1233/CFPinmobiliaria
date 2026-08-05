import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Store } from '@ngrx/store';
import { SolicitudArriendoPublic } from '../../../../client';
import { SolicitudesArriendoActions } from '../../../store/SolicitudesArriendo/solicitudes-arriendo.actions';
import {
  selectSolicitudesArriendoError,
  selectSolicitudesArriendoItems,
  selectSolicitudesArriendoLoading,
} from '../../../store/SolicitudesArriendo/solicitudes-arriendo.selectors';
import { SolicitudArriendoDetalleModalComponent } from './solicitud-arriendo-detalle-modal/solicitud-arriendo-detalle-modal.component';

const MEDIO_LABELS: Record<string, string> = {
  whatsapp: 'WhatsApp',
  llamada: 'Llamada telefónica',
  correo: 'Correo electrónico',
};

@Component({
  selector: 'app-solicitudes-arriendo-list',
  standalone: true,
  imports: [DatePipe, SolicitudArriendoDetalleModalComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './solicitudes-arriendo-list.component.html',
  styleUrl: './solicitudes-arriendo-list.component.scss',
})
export class SolicitudesArriendoListComponent implements OnInit {
  private readonly store = inject(Store);

  protected readonly items = this.store.selectSignal(selectSolicitudesArriendoItems);
  protected readonly loading = this.store.selectSignal(selectSolicitudesArriendoLoading);
  protected readonly error = this.store.selectSignal(selectSolicitudesArriendoError);

  protected readonly selected = signal<SolicitudArriendoPublic | null>(null);

  ngOnInit(): void {
    this.store.dispatch(SolicitudesArriendoActions.load());
  }

  protected openDetalle(item: SolicitudArriendoPublic): void {
    this.selected.set(item);
  }

  protected closeDetalle(): void {
    this.selected.set(null);
  }

  protected medioLabel(item: SolicitudArriendoPublic): string {
    return MEDIO_LABELS[item.medio_contacto] ?? item.medio_contacto;
  }
}
