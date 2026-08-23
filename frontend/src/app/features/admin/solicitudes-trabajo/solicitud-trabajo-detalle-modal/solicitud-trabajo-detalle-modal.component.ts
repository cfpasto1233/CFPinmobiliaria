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
import { SolicitudTrabajoPublic } from '../../../../../client';
import { SolicitudesTrabajoActions } from '../../../../store/SolicitudesTrabajo/solicitudes-trabajo.actions';
import {
  selectSolicitudTrabajoSelected,
  selectSolicitudesTrabajoLoading,
} from '../../../../store/SolicitudesTrabajo/solicitudes-trabajo.selectors';

@Component({
  selector: 'app-solicitud-trabajo-detalle-modal',
  standalone: true,
  imports: [DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './solicitud-trabajo-detalle-modal.component.html',
  styleUrl: './solicitud-trabajo-detalle-modal.component.scss',
})
export class SolicitudTrabajoDetalleModalComponent implements OnInit, OnDestroy {
  private readonly store = inject(Store);

  readonly solicitud = input.required<SolicitudTrabajoPublic>();
  readonly closed = output<void>();

  protected readonly detalle = this.store.selectSignal(selectSolicitudTrabajoSelected);
  protected readonly loading = this.store.selectSignal(selectSolicitudesTrabajoLoading);

  // Mientras la URL firmada de la hoja de vida no haya llegado, o pertenezca a otra
  // solicitud, no hay link para mostrar todavía.
  protected readonly hojaDeVidaUrl = computed(() => {
    const detalle = this.detalle();
    return detalle && detalle.id === this.solicitud().id ? detalle.hoja_de_vida_url : null;
  });

  ngOnInit(): void {
    document.body.style.overflow = 'hidden';
    this.store.dispatch(SolicitudesTrabajoActions.loadOne({ id: this.solicitud().id }));
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
