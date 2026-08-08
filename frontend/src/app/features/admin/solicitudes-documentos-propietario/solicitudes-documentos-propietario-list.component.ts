import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { Store } from '@ngrx/store';
import { SolicitudDocumentoPropietarioPublic } from '../../../../client';
import { SolicitudesDocumentosPropietarioActions } from '../../../store/SolicitudesDocumentosPropietario/solicitudes-documentos-propietario.actions';
import {
  selectSolicitudesDocumentosPropietarioError,
  selectSolicitudesDocumentosPropietarioItems,
  selectSolicitudesDocumentosPropietarioLoading,
} from '../../../store/SolicitudesDocumentosPropietario/solicitudes-documentos-propietario.selectors';
import { SolicitudDocumentoPropietarioDetalleModalComponent } from './solicitud-documento-propietario-detalle-modal/solicitud-documento-propietario-detalle-modal.component';

const PLAN_LABELS: Record<string, string> = {
  basico: 'Básico',
  estandar: 'Estándar',
  premium: 'Premium',
  asesoria_legal: 'Asesoría Legal Opcional',
};

@Component({
  selector: 'app-solicitudes-documentos-propietario-list',
  standalone: true,
  imports: [DatePipe, SolicitudDocumentoPropietarioDetalleModalComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './solicitudes-documentos-propietario-list.component.html',
  styleUrl: './solicitudes-documentos-propietario-list.component.scss',
})
export class SolicitudesDocumentosPropietarioListComponent implements OnInit {
  private readonly store = inject(Store);

  protected readonly items = this.store.selectSignal(selectSolicitudesDocumentosPropietarioItems);
  protected readonly loading = this.store.selectSignal(selectSolicitudesDocumentosPropietarioLoading);
  protected readonly error = this.store.selectSignal(selectSolicitudesDocumentosPropietarioError);

  protected readonly selected = signal<SolicitudDocumentoPropietarioPublic | null>(null);

  ngOnInit(): void {
    this.store.dispatch(SolicitudesDocumentosPropietarioActions.load());
  }

  protected openDetalle(item: SolicitudDocumentoPropietarioPublic): void {
    this.selected.set(item);
  }

  protected closeDetalle(): void {
    this.selected.set(null);
  }

  protected planLabel(item: SolicitudDocumentoPropietarioPublic): string {
    return PLAN_LABELS[item.plan_contratado] ?? item.plan_contratado;
  }
}
