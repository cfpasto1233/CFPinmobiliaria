import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { Store } from '@ngrx/store';
import { ReporteDanoPublic } from '../../../../client';
import { ReportesDanoActions } from '../../../store/ReportesDano/reportes-dano.actions';
import {
  selectReportesDanoItems,
  selectReportesDanoListError,
  selectReportesDanoListLoading,
} from '../../../store/ReportesDano/reportes-dano.selectors';
import { ReporteDanoDetalleModalComponent } from './reporte-dano-detalle-modal/reporte-dano-detalle-modal.component';

const TIPO_REPORTE_LABELS: Record<string, string> = {
  tuberia: 'Tubería',
  techo: 'Techo',
  estructura: 'Estructura',
  instalacion_electrica: 'Instalación eléctrica',
  humedad: 'Humedad',
  otros: 'Otro',
};

@Component({
  selector: 'app-reportes-dano-list',
  standalone: true,
  imports: [DatePipe, ReporteDanoDetalleModalComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './reportes-dano-list.component.html',
  styleUrl: './reportes-dano-list.component.scss',
})
export class ReportesDanoListComponent implements OnInit {
  private readonly store = inject(Store);

  protected readonly items = this.store.selectSignal(selectReportesDanoItems);
  protected readonly loading = this.store.selectSignal(selectReportesDanoListLoading);
  protected readonly error = this.store.selectSignal(selectReportesDanoListError);

  protected readonly selected = signal<ReporteDanoPublic | null>(null);

  ngOnInit(): void {
    this.store.dispatch(ReportesDanoActions.load());
  }

  protected openDetalle(item: ReporteDanoPublic): void {
    this.selected.set(item);
  }

  protected closeDetalle(): void {
    this.selected.set(null);
  }

  protected tipoLabel(item: ReporteDanoPublic): string {
    const base = TIPO_REPORTE_LABELS[item.tipo_reporte] ?? item.tipo_reporte;
    return item.tipo_reporte === 'otros' && item.tipo_reporte_otro
      ? `${base} (${item.tipo_reporte_otro})`
      : base;
  }
}
