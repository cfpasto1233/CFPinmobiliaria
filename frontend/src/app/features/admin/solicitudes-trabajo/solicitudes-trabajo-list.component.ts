import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { Store } from '@ngrx/store';
import { SolicitudTrabajoPublic } from '../../../../client';
import { SolicitudesTrabajoActions } from '../../../store/SolicitudesTrabajo/solicitudes-trabajo.actions';
import {
  selectSolicitudesTrabajoError,
  selectSolicitudesTrabajoItems,
  selectSolicitudesTrabajoLoading,
} from '../../../store/SolicitudesTrabajo/solicitudes-trabajo.selectors';
import { SolicitudTrabajoDetalleModalComponent } from './solicitud-trabajo-detalle-modal/solicitud-trabajo-detalle-modal.component';

@Component({
  selector: 'app-solicitudes-trabajo-list',
  standalone: true,
  imports: [DatePipe, SolicitudTrabajoDetalleModalComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './solicitudes-trabajo-list.component.html',
  styleUrl: './solicitudes-trabajo-list.component.scss',
})
export class SolicitudesTrabajoListComponent implements OnInit {
  private readonly store = inject(Store);

  protected readonly items = this.store.selectSignal(selectSolicitudesTrabajoItems);
  protected readonly loading = this.store.selectSignal(selectSolicitudesTrabajoLoading);
  protected readonly error = this.store.selectSignal(selectSolicitudesTrabajoError);

  protected readonly selected = signal<SolicitudTrabajoPublic | null>(null);

  ngOnInit(): void {
    this.store.dispatch(SolicitudesTrabajoActions.load());
  }

  protected openDetalle(item: SolicitudTrabajoPublic): void {
    this.selected.set(item);
  }

  protected closeDetalle(): void {
    this.selected.set(null);
  }
}
