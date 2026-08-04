import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  OnDestroy,
  OnInit,
  computed,
  inject,
  input,
  output,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { ReporteDanoPublic } from '../../../../../client';
import { ReportesDanoActions } from '../../../../store/ReportesDano/reportes-dano.actions';
import { selectReportesDanoFotosView } from '../../../../store/ReportesDano/reportes-dano.selectors';

const TIPO_REPORTE_LABELS: Record<string, string> = {
  tuberia: 'Tubería',
  techo: 'Techo',
  estructura: 'Estructura',
  instalacion_electrica: 'Instalación eléctrica',
  humedad: 'Humedad',
  otros: 'Otro',
};

const MEDIO_LABELS: Record<string, string> = {
  whatsapp: 'WhatsApp',
  llamada: 'Llamada telefónica',
};

@Component({
  selector: 'app-reporte-dano-detalle-modal',
  standalone: true,
  imports: [DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './reporte-dano-detalle-modal.component.html',
  styleUrl: './reporte-dano-detalle-modal.component.scss',
})
export class ReporteDanoDetalleModalComponent implements OnInit, OnDestroy {
  private readonly store = inject(Store);

  readonly reporte = input.required<ReporteDanoPublic>();
  readonly closed = output<void>();

  protected readonly fotosView = this.store.selectSignal(selectReportesDanoFotosView);

  protected readonly tipoLabel = computed(() => {
    const reporte = this.reporte();
    const base = TIPO_REPORTE_LABELS[reporte.tipo_reporte] ?? reporte.tipo_reporte;
    return reporte.tipo_reporte === 'otros' && reporte.tipo_reporte_otro
      ? `${base} (${reporte.tipo_reporte_otro})`
      : base;
  });

  protected readonly medioLabel = computed(() => {
    const medio = this.reporte().medio_comunicacion;
    if (!medio) return null;
    return MEDIO_LABELS[medio] ?? medio;
  });

  ngOnInit(): void {
    document.body.style.overflow = 'hidden';
    if (this.reporte().fotos.length) {
      this.store.dispatch(ReportesDanoActions.loadFotos({ id: this.reporte().id }));
    }
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
