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
import { SolicitudDocumentoPropietarioPublic } from '../../../../../client';
import { whatsappLink } from '../../../../core/whatsapp/whatsapp.util';
import { SolicitudesDocumentosPropietarioActions } from '../../../../store/SolicitudesDocumentosPropietario/solicitudes-documentos-propietario.actions';
import {
  selectSolicitudDocumentoPropietarioSelected,
  selectSolicitudesDocumentosPropietarioLoading,
} from '../../../../store/SolicitudesDocumentosPropietario/solicitudes-documentos-propietario.selectors';

const PLAN_LABELS: Record<string, string> = {
  basico: 'Básico',
  estandar: 'Estándar',
  premium: 'Premium',
  asesoria_legal: 'Asesoría Legal Opcional',
};

@Component({
  selector: 'app-solicitud-documento-propietario-detalle-modal',
  standalone: true,
  imports: [DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './solicitud-documento-propietario-detalle-modal.component.html',
  styleUrl: './solicitud-documento-propietario-detalle-modal.component.scss',
})
export class SolicitudDocumentoPropietarioDetalleModalComponent implements OnInit, OnDestroy {
  private readonly store = inject(Store);

  readonly solicitud = input.required<SolicitudDocumentoPropietarioPublic>();
  readonly closed = output<void>();

  protected readonly detalle = this.store.selectSignal(selectSolicitudDocumentoPropietarioSelected);
  protected readonly loading = this.store.selectSignal(selectSolicitudesDocumentosPropietarioLoading);

  // Mientras el detalle (con las URLs firmadas) no haya llegado, o pertenezca a otra
  // solicitud, se usa el item de la lista — que ya trae validado/token actualizados
  // tras un validar() exitoso (el reducer hace upsert sobre `items`).
  protected readonly actual = computed(() => {
    const detalle = this.detalle();
    return detalle && detalle.id === this.solicitud().id ? detalle : this.solicitud();
  });

  protected readonly planLabel = computed(() => PLAN_LABELS[this.solicitud().plan_contratado] ?? this.solicitud().plan_contratado);

  protected readonly linkVigente = computed(() => {
    const item = this.actual();
    if (!item.validado || !item.token || item.token_used_at) return false;
    if (!item.token_expires_at) return false;
    return new Date(item.token_expires_at).getTime() > Date.now();
  });

  protected readonly publicarLink = computed(() => {
    const item = this.actual();
    return item.token ? `${window.location.origin}/publicar-mi-propiedad/${item.token}` : null;
  });

  protected readonly whatsappHref = computed(() => {
    const link = this.publicarLink();
    if (!link) return null;
    const item = this.actual();
    const mensaje = `Hola ${item.nombre_completo}, ya validamos tus documentos. Publica tu propiedad aquí (link válido por 48 horas): ${link}`;
    return whatsappLink(mensaje, this.telefonoWhatsapp(item.numero_contacto));
  });

  ngOnInit(): void {
    document.body.style.overflow = 'hidden';
    this.store.dispatch(SolicitudesDocumentosPropietarioActions.loadOne({ id: this.solicitud().id }));
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

  protected validar(): void {
    this.store.dispatch(SolicitudesDocumentosPropietarioActions.validar({ id: this.solicitud().id }));
  }

  private telefonoWhatsapp(numero: string): string {
    const digits = numero.replace(/\D/g, '');
    return digits.length === 10 ? `57${digits}` : digits;
  }
}
