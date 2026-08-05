import { ChangeDetectionStrategy, Component, OnDestroy, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { Store } from '@ngrx/store';
import { whatsappLink } from '../../core/whatsapp/whatsapp.util';
import { NotificationService } from '../../core/notifications/notification.service';
import { FooterComponent } from '../../layouts/footer/footer.component';
import { NavbarComponent } from '../../layouts/navbar/navbar.component';
import { PublicarWhatsappFabComponent } from '../../shared/components/publicar-whatsapp-fab/publicar-whatsapp-fab.component';
import {
  MedioComunicacionReporte,
  TipoReporteDano,
} from '../../store/ReportesDano/reporte-dano-form.model';
import { ReportesDanoActions } from '../../store/ReportesDano/reportes-dano.actions';
import { selectReportesDanoLoading } from '../../store/ReportesDano/reportes-dano.selectors';

const MAX_FOTOS = 5;

type FormFieldName =
  | 'nombreCompleto'
  | 'numeroContacto'
  | 'tipoReporte'
  | 'tipoReporteOtro'
  | 'descripcionDano';

const REQUIRED_MESSAGES: Partial<Record<FormFieldName, string>> = {
  nombreCompleto: 'El nombre completo es obligatorio.',
  numeroContacto: 'El número de contacto es obligatorio.',
  tipoReporte: 'Selecciona el tipo de reporte.',
  tipoReporteOtro: 'Especifica el tipo de daño.',
  descripcionDano: 'Describe el daño que presenta la propiedad.',
};

const TIPO_REPORTE_LABELS: Record<TipoReporteDano, string> = {
  tuberia: 'Tubería',
  techo: 'Techo',
  estructura: 'Estructura',
  instalacion_electrica: 'Instalación eléctrica',
  humedad: 'Humedad',
  otros: 'Otro',
};

const MEDIO_COMUNICACION_LABELS: Record<MedioComunicacionReporte, string> = {
  whatsapp: 'WhatsApp',
  llamada: 'Llamada telefónica',
};

interface FotoSeleccionada {
  file: File;
  previewUrl: string;
}

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgSelectModule,
    NavbarComponent,
    FooterComponent,
    RouterLink,
    PublicarWhatsappFabComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './reportes.component.html',
  styleUrl: './reportes.component.scss',
})
export class ReportesComponent implements OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(Store);
  private readonly notif = inject(NotificationService);

  protected readonly maxFotos = MAX_FOTOS;
  protected readonly submitting = this.store.selectSignal(selectReportesDanoLoading);

  protected readonly medioComunicacionOptions: { value: MedioComunicacionReporte; label: string }[] = [
    { value: 'whatsapp', label: 'WhatsApp' },
    { value: 'llamada', label: 'Llamada telefónica' },
  ];

  protected readonly tipoReporteOptions: { value: TipoReporteDano; label: string }[] = [
    { value: 'tuberia', label: 'Tubería' },
    { value: 'techo', label: 'Techo' },
    { value: 'estructura', label: 'Estructura' },
    { value: 'instalacion_electrica', label: 'Instalación eléctrica' },
    { value: 'humedad', label: 'Humedad' },
    { value: 'otros', label: 'Otro' },
  ];

  protected readonly form = this.fb.group({
    nombreCompleto: ['', [Validators.required, Validators.maxLength(255)]],
    medioComunicacion: [null as MedioComunicacionReporte | null],
    numeroContacto: ['', [Validators.required, Validators.pattern(/^[0-9+\s()-]{7,20}$/)]],
    tipoReporte: [null as TipoReporteDano | null, Validators.required],
    tipoReporteOtro: ['', Validators.maxLength(100)],
    descripcionDano: ['', [Validators.required, Validators.maxLength(1000)]],
  });

  protected readonly fotos = signal<FotoSeleccionada[]>([]);

  constructor() {
    // "Otros" exige especificar el daño en texto libre — se activa/desactiva el
    // required dinámicamente porque el resto del formulario no tiene este patrón.
    this.form.get('tipoReporte')!.valueChanges.subscribe((value) => {
      const control = this.form.get('tipoReporteOtro')!;
      control.setValidators(
        value === 'otros'
          ? [Validators.required, Validators.maxLength(100)]
          : [Validators.maxLength(100)],
      );
      control.updateValueAndValidity({ emitEvent: false });
    });
  }

  protected get mostrarTipoReporteOtro(): boolean {
    return this.form.get('tipoReporte')?.value === 'otros';
  }

  protected fieldError(name: FormFieldName): string | null {
    const control = this.form.get(name);
    if (!control || !control.invalid || !(control.dirty || control.touched)) return null;
    if (control.hasError('required')) return REQUIRED_MESSAGES[name] ?? 'Este campo es obligatorio.';
    if (control.hasError('maxlength')) return 'El texto es demasiado largo.';
    if (control.hasError('pattern')) return 'Ingresa un número de contacto válido.';
    return null;
  }

  protected onFotosSeleccionadas(event: Event): void {
    const input = event.target as HTMLInputElement;
    const nuevos = Array.from(input.files ?? []);
    input.value = '';
    if (!nuevos.length) return;

    const disponibles = MAX_FOTOS - this.fotos().length;
    if (disponibles <= 0) {
      this.notif.error(`Máximo ${MAX_FOTOS} fotos.`);
      return;
    }
    if (nuevos.length > disponibles) {
      this.notif.error(`Solo puedes agregar ${disponibles} foto(s) más (máximo ${MAX_FOTOS}).`);
    }

    const aAgregar = nuevos
      .slice(0, disponibles)
      .map((file) => ({ file, previewUrl: URL.createObjectURL(file) }));
    this.fotos.update((actuales) => [...actuales, ...aAgregar]);
  }

  protected quitarFoto(index: number): void {
    const actuales = this.fotos();
    URL.revokeObjectURL(actuales[index].previewUrl);
    this.fotos.set(actuales.filter((_, i) => i !== index));
  }

  ngOnDestroy(): void {
    this.fotos().forEach((foto) => URL.revokeObjectURL(foto.previewUrl));
  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const tipoReporte = raw.tipoReporte as TipoReporteDano;
    const tipoReporteOtro = tipoReporte === 'otros' ? raw.tipoReporteOtro || null : null;
    const tipoLabel = TIPO_REPORTE_LABELS[tipoReporte] + (tipoReporteOtro ? ` (${tipoReporteOtro})` : '');
    const medioLabel = raw.medioComunicacion ? MEDIO_COMUNICACION_LABELS[raw.medioComunicacion] : null;

    const mensaje = [
      'Hola, quiero reportar un daño en mi propiedad.',
      `Nombre: ${raw.nombreCompleto}`,
      `Tipo de daño: ${tipoLabel}`,
      `Contacto: ${raw.numeroContacto}${medioLabel ? ` (prefiero ${medioLabel})` : ''}`,
      `Descripción: ${raw.descripcionDano}`,
    ].join('\n');
    const fotos = this.fotos().map((foto) => foto.file);

    // Un link wa.me solo precarga texto — nunca puede adjuntar archivos, así que cuando hay
    // fotos, el mensaje incluye un link a /reportes/:id/fotos en vez de intentar adjuntarlas
    // directo. El id lo genera el propio navegador (crypto.randomUUID()) y se manda al backend
    // como parte del alta — así se conoce de entrada, sin esperar la respuesta del POST, y
    // wa.me se abre siempre de inmediato y síncrono dentro del clic (antes se esperaba la
    // respuesta del backend para armar el link, lo que hacía que el navegador bloqueara
    // window.open() como pop-up en silencio).
    const id = crypto.randomUUID();
    const mensajeConLink = fotos.length
      ? `${mensaje}\n\nFotos: ${window.location.origin}/reportes/${id}/fotos`
      : mensaje;

    window.open(whatsappLink(mensajeConLink), '_blank', 'noopener');

    this.store.dispatch(
      ReportesDanoActions.create({
        form: {
          nombre_completo: raw.nombreCompleto ?? '',
          medio_comunicacion: raw.medioComunicacion ?? null,
          numero_contacto: raw.numeroContacto ?? '',
          tipo_reporte: tipoReporte,
          tipo_reporte_otro: tipoReporteOtro,
          descripcion_dano: raw.descripcionDano ?? '',
        },
        fotos,
        id,
      }),
    );

    this.fotos().forEach((foto) => URL.revokeObjectURL(foto.previewUrl));
    this.fotos.set([]);
    this.form.reset();
  }
}
