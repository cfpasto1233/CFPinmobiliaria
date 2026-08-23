import { ChangeDetectionStrategy, Component, OnInit, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Meta } from '@angular/platform-browser';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { Store } from '@ngrx/store';
import { FooterComponent } from '../../layouts/footer/footer.component';
import { NavbarComponent } from '../../layouts/navbar/navbar.component';
import {
  RuralUrbano,
  TipoInmueble,
  TipoParqueadero,
  Vista,
} from '../../store/Propiedades/propiedad-form.model';
import {
  CAMPOS_BOOL_PROPIOS,
  CAMPOS_DETALLE_MIN,
  CAMPOS_OPCIONALES,
  CAMPOS_REQUERIDOS,
  CampoDetalle,
  OPCIONES_TIPO_PARQUEADERO,
  RURAL_URBANO_OPTIONS,
  TIPOS_CON_ADMIN_ANIDADA,
  TIPOS_CON_ADMIN_DIRECTA,
  TIPOS_CON_CONJUNTO_CERRADO,
  TIPOS_CON_PARQUEADERO_DETALLE,
  TIPOS_CON_PARQUEADERO_SIMPLE,
  TODOS_LOS_CAMPOS_DETALLE,
  VISTA_OPTIONS,
} from '../../store/Propiedades/propiedad-form-fields';
import { PropiedadesActions } from '../../store/Propiedades/propiedades.actions';
import { selectPropiedadesError, selectPropiedadesLoading } from '../../store/Propiedades/propiedades.selectors';
import { SolicitudesDocumentosPropietarioActions } from '../../store/SolicitudesDocumentosPropietario/solicitudes-documentos-propietario.actions';
import {
  selectSolicitudDocumentoTokenCheck,
  selectSolicitudDocumentoTokenChecking,
} from '../../store/SolicitudesDocumentosPropietario/solicitudes-documentos-propietario.selectors';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_VIDEO_TYPES = ['video/mp4'];
const MAX_VIDEO_SIZE_BYTES = 50 * 1024 * 1024;
const PLANES_CON_VIDEO = ['estandar', 'premium'];

type FormFieldName =
  | 'nombre'
  | 'descripcion'
  | 'ubicacion'
  | 'whatsapp'
  | 'precio'
  | 'tipo'
  | 'tipoInmueble'
  | 'banos'
  | 'habitaciones'
  | 'numParqueaderos'
  | 'tipoParqueadero'
  | 'areaConstruida'
  | 'areaLote'
  | 'frente'
  | 'fondo'
  | 'antiguedad'
  | 'piso'
  | 'vista'
  | 'actividad'
  | 'ruralUrbano'
  | 'valorAdministracion';

const REQUIRED_MESSAGES: Partial<Record<FormFieldName, string>> = {
  nombre: 'El nombre es obligatorio.',
  descripcion: 'La descripción es obligatoria.',
  ubicacion: 'La ubicación es obligatoria.',
  whatsapp:
    'El número de WhatsApp es obligatorio — a este número llegarán los interesados en agendar una cita.',
  precio: 'El precio es obligatorio.',
  tipo: 'Selecciona un tipo.',
  tipoInmueble: 'Selecciona el tipo de inmueble.',
  banos: 'Indica el número de baños.',
  habitaciones: 'Indica el número de habitaciones.',
  numParqueaderos: 'Indica el número de parqueaderos.',
  tipoParqueadero: 'Indica el tipo de parqueadero.',
  antiguedad: 'Indica la antigüedad.',
  piso: 'Indica el piso.',
  vista: 'Indica si la vista es interna o externa.',
  actividad: 'Indica la actividad del local.',
  ruralUrbano: 'Indica si el lote es rural o urbano.',
  valorAdministracion: 'Indica el valor de administración.',
};

const MIN_MESSAGES: Partial<Record<FormFieldName, string>> = {
  precio: 'El precio debe ser mayor a 0.',
  areaConstruida: 'El área construida debe ser mayor a 0.',
  areaLote: 'El área de lote debe ser mayor a 0.',
  frente: 'El frente debe ser mayor a 0.',
  fondo: 'El fondo debe ser mayor a 0.',
  numParqueaderos: 'Debe ser al menos 1.',
  valorAdministracion: 'El valor de administración no puede ser negativo.',
};

@Component({
  selector: 'app-publicar-mi-propiedad',
  standalone: true,
  imports: [NavbarComponent, FooterComponent, RouterLink, ReactiveFormsModule, NgSelectModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './publicar-mi-propiedad.component.html',
  styleUrl: './publicar-mi-propiedad.component.scss',
})
export class PublicarMiPropiedadComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(Store);
  private readonly route = inject(ActivatedRoute);
  private readonly meta = inject(Meta);

  protected readonly token = this.route.snapshot.paramMap.get('token') ?? '';

  protected readonly tokenChecking = this.store.selectSignal(selectSolicitudDocumentoTokenChecking);
  protected readonly tokenCheck = this.store.selectSignal(selectSolicitudDocumentoTokenCheck);

  protected readonly loading = this.store.selectSignal(selectPropiedadesLoading);
  protected readonly error = this.store.selectSignal(selectPropiedadesError);

  protected readonly publicado = signal(false);

  protected readonly tipoOptions = [
    { value: 'venta', label: 'Venta' },
    { value: 'arriendo', label: 'Arriendo' },
    { value: 'oferta', label: 'Oferta' },
  ];

  protected readonly tipoInmuebleOptions: { value: TipoInmueble; label: string }[] = [
    { value: 'casa', label: 'Casa' },
    { value: 'apartamento', label: 'Apartamento' },
    { value: 'apartaestudio', label: 'Apartaestudio' },
    { value: 'finca', label: 'Finca' },
    { value: 'local', label: 'Local' },
    { value: 'oficina', label: 'Oficina' },
    { value: 'lote', label: 'Lote' },
  ];

  protected readonly vistaOptions = VISTA_OPTIONS;
  protected readonly ruralUrbanoOptions = RURAL_URBANO_OPTIONS;

  protected readonly form = this.fb.group({
    nombre: ['', [Validators.required, Validators.maxLength(255)]],
    descripcion: ['', Validators.required],
    ubicacion: ['', [Validators.required, Validators.maxLength(255)]],
    whatsapp: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
    precio: [null as number | null, [Validators.required, Validators.min(1)]],
    tipo: ['venta' as 'venta' | 'arriendo' | 'oferta', Validators.required],
    tipoInmueble: ['casa' as TipoInmueble, Validators.required],

    banos: [null as number | null],
    habitaciones: [null as number | null],
    tieneParqueadero: [false],
    numParqueaderos: [null as number | null],
    tipoParqueadero: [null as TipoParqueadero | null],
    areaConstruida: [null as number | null],
    areaLote: [null as number | null],
    frente: [null as number | null],
    fondo: [null as number | null],
    antiguedad: [null as number | null],
    piso: [null as number | null],
    vista: [null as Vista | null],

    balcon: [false],
    terraza: [false],
    patio: [false],
    bodega: [false],
    zonaBbq: [false],
    piscina: [false],
    cocina: [false],
    zonaLavanderia: [false],

    conjuntoCerrado: [false],
    tieneAdministracion: [false],
    valorAdministracion: [null as number | null],
    zonasComunes: [null as string | null],

    actividad: [null as string | null],
    ruralUrbano: [null as RuralUrbano | null],
    tieneServicios: [false],
    tieneAlcantarillado: [false],
    tieneAcueducto: [false],

    permitePermuta: [false],
    adicionales: [null as string | null],

    tieneGravamenes: [false],
    tieneHipoteca: [false],
  });

  // Signals derivados de los controles para poder mostrar/ocultar secciones del
  // template reactivamente (OnPush) sin suscribirse manualmente en la vista.
  // Mismo patrón que PropiedadFormComponent (admin) — ver ese archivo para el detalle.
  private readonly tipoInmuebleValue = toSignal(this.form.controls.tipoInmueble.valueChanges, {
    initialValue: this.form.controls.tipoInmueble.value,
  });

  private readonly camposVisibles = computed(() => {
    const tipo = this.tipoInmuebleValue() ?? 'casa';
    return new Set<CampoDetalle>([...CAMPOS_REQUERIDOS[tipo], ...CAMPOS_OPCIONALES[tipo]]);
  });

  protected mostrarCampo(campo: CampoDetalle): boolean {
    return this.camposVisibles().has(campo);
  }

  private readonly camposBoolPropios = computed(
    () => new Set(CAMPOS_BOOL_PROPIOS[this.tipoInmuebleValue() ?? 'casa']),
  );

  protected mostrarBool(campo: string): boolean {
    return this.camposBoolPropios().has(campo);
  }

  protected readonly mostrarParqueaderoDetalle = computed(() =>
    TIPOS_CON_PARQUEADERO_DETALLE.includes(this.tipoInmuebleValue() ?? 'casa'),
  );
  protected readonly mostrarParqueaderoSimple = computed(() =>
    TIPOS_CON_PARQUEADERO_SIMPLE.includes(this.tipoInmuebleValue() ?? 'casa'),
  );
  protected readonly mostrarParqueadero = computed(
    () => this.mostrarParqueaderoDetalle() || this.mostrarParqueaderoSimple(),
  );
  protected readonly opcionesTipoParqueadero = computed(
    () => OPCIONES_TIPO_PARQUEADERO[this.tipoInmuebleValue() ?? 'casa'] ?? [],
  );

  protected readonly mostrarConjuntoCerrado = computed(() =>
    TIPOS_CON_CONJUNTO_CERRADO.includes(this.tipoInmuebleValue() ?? 'casa'),
  );
  protected readonly mostrarAdminAnidada = computed(() =>
    TIPOS_CON_ADMIN_ANIDADA.includes(this.tipoInmuebleValue() ?? 'casa'),
  );
  protected readonly mostrarAdminDirecta = computed(() =>
    TIPOS_CON_ADMIN_DIRECTA.includes(this.tipoInmuebleValue() ?? 'casa'),
  );

  protected readonly terrazaLabel = computed(() =>
    this.tipoInmuebleValue() === 'finca' ? 'Terraza y/o Patio' : 'Terraza',
  );
  protected readonly patioLabel = computed(() => {
    switch (this.tipoInmuebleValue()) {
      case 'local':
        return 'Patio/Zona de lavado';
      default:
        return 'Patio';
    }
  });

  protected readonly tieneParqueaderoValue = toSignal(this.form.controls.tieneParqueadero.valueChanges, {
    initialValue: this.form.controls.tieneParqueadero.value,
  });
  protected readonly conjuntoCerradoValue = toSignal(this.form.controls.conjuntoCerrado.valueChanges, {
    initialValue: this.form.controls.conjuntoCerrado.value,
  });
  protected readonly tieneAdministracionValue = toSignal(this.form.controls.tieneAdministracion.valueChanges, {
    initialValue: this.form.controls.tieneAdministracion.value,
  });
  protected readonly tieneServiciosValue = toSignal(this.form.controls.tieneServicios.valueChanges, {
    initialValue: this.form.controls.tieneServicios.value,
  });

  protected readonly mostrarValorAdministracion = computed(() => {
    if (!this.mostrarCampo('valorAdministracion')) return false;
    if (this.mostrarAdminAnidada()) return this.tieneAdministracionValue() === true;
    return this.conjuntoCerradoValue() === true || this.mostrarAdminDirecta();
  });

  protected readonly fotoPrincipalFile = signal<File | null>(null);
  protected readonly fotoPrincipalPreview = signal<string | null>(null);
  protected readonly fotoPrincipalError = signal<string | null>(null);
  protected readonly fotoPrincipalDragOver = signal(false);

  // Solo se ofrece si el plan contratado en la solicitud de documentos lo incluye
  // (ver planes en publicar-por-tu-cuenta.component.ts) — validado también en el
  // backend (create_propiedad_con_token_endpoint), no solo ocultando el campo acá.
  protected readonly mostrarVideo = computed(() =>
    PLANES_CON_VIDEO.includes(this.tokenCheck()?.planContratado ?? ''),
  );
  protected readonly videoFile = signal<File | null>(null);
  protected readonly videoError = signal<string | null>(null);
  protected readonly videoDragOver = signal(false);

  private wasSubmitting = false;

  constructor() {
    // El estado de confirmación se muestra solo cuando termina un envío exitoso
    // (loading true -> false sin error) — mismo patrón que CargaDocumentosModalComponent.
    effect(() => {
      const submitting = this.loading();
      const err = this.error();
      if (this.wasSubmitting && !submitting && !err) {
        this.publicado.set(true);
      }
      this.wasSubmitting = submitting;
    });

    this.form.controls.tipoInmueble.valueChanges.subscribe((tipo) => {
      this.updateDetalleValidators(tipo);
      this.updateParqueaderoValidators(tipo, this.form.controls.tieneParqueadero.value);
    });
    this.form.controls.tieneParqueadero.valueChanges.subscribe((tiene) =>
      this.updateParqueaderoValidators(this.form.controls.tipoInmueble.value, tiene),
    );
    this.updateDetalleValidators(this.form.controls.tipoInmueble.value);
    this.updateParqueaderoValidators(this.form.controls.tipoInmueble.value, this.form.controls.tieneParqueadero.value);
  }

  ngOnInit(): void {
    // Link de un solo uso enviado por WhatsApp — no debe aparecer en buscadores.
    this.meta.addTag({ name: 'robots', content: 'noindex, nofollow' });

    if (this.token) {
      this.store.dispatch(SolicitudesDocumentosPropietarioActions.checkToken({ token: this.token }));
    }
  }

  protected fieldError(name: FormFieldName): string | null {
    const control = this.form.get(name);
    if (!control || !control.invalid || !(control.dirty || control.touched)) return null;
    if (control.hasError('required')) return REQUIRED_MESSAGES[name] ?? null;
    if (control.hasError('maxlength')) return 'Máximo 255 caracteres.';
    if (control.hasError('min')) return MIN_MESSAGES[name] ?? 'El valor no puede ser negativo.';
    if (control.hasError('pattern')) {
      return name === 'whatsapp'
        ? 'Debe ser un número de 10 dígitos, sin indicativo (ej. 3001234567).'
        : null;
    }
    return null;
  }

  protected onFotoPrincipalDragOver(event: DragEvent): void {
    event.preventDefault();
    this.fotoPrincipalDragOver.set(true);
  }

  protected onFotoPrincipalDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.fotoPrincipalDragOver.set(false);
  }

  protected onFotoPrincipalDrop(event: DragEvent): void {
    event.preventDefault();
    this.fotoPrincipalDragOver.set(false);
    this.handleFotoPrincipal(event.dataTransfer?.files?.[0] ?? null);
  }

  protected onFotoPrincipalSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.handleFotoPrincipal(input.files?.[0] ?? null);
    input.value = '';
  }

  protected onRemoveFotoPrincipalSeleccionada(): void {
    this.fotoPrincipalFile.set(null);
    this.fotoPrincipalPreview.set(null);
    this.fotoPrincipalError.set(null);
  }

  protected onVideoDragOver(event: DragEvent): void {
    event.preventDefault();
    this.videoDragOver.set(true);
  }

  protected onVideoDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.videoDragOver.set(false);
  }

  protected onVideoDrop(event: DragEvent): void {
    event.preventDefault();
    this.videoDragOver.set(false);
    this.handleVideo(event.dataTransfer?.files?.[0] ?? null);
  }

  protected onVideoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.handleVideo(input.files?.[0] ?? null);
    input.value = '';
  }

  protected onRemoveVideoSeleccionado(): void {
    this.videoFile.set(null);
    this.videoError.set(null);
  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (!this.fotoPrincipalFile()) {
      this.fotoPrincipalError.set('La foto principal es obligatoria.');
      return;
    }

    const raw = this.form.getRawValue();
    this.store.dispatch(
      PropiedadesActions.createConToken({
        token: this.token,
        form: {
          nombre: raw.nombre ?? '',
          descripcion: raw.descripcion ?? '',
          ubicacion: raw.ubicacion ?? '',
          whatsapp: raw.whatsapp ?? '',
          precio: raw.precio ?? 0,
          tipo: raw.tipo ?? 'venta',
          tipo_inmueble: raw.tipoInmueble ?? 'casa',

          banos: raw.banos,
          habitaciones: raw.habitaciones,
          tiene_parqueadero: raw.tieneParqueadero ?? false,
          num_parqueaderos: raw.numParqueaderos,
          tipo_parqueadero: raw.tipoParqueadero,
          area_construida: raw.areaConstruida,
          area_lote: raw.areaLote,
          frente: raw.frente,
          fondo: raw.fondo,
          antiguedad: raw.antiguedad,
          piso: raw.piso,
          vista: raw.vista,

          balcon: raw.balcon ?? false,
          terraza: raw.terraza ?? false,
          patio: raw.patio ?? false,
          bodega: raw.bodega ?? false,
          zona_bbq: raw.zonaBbq ?? false,
          piscina: raw.piscina ?? false,
          cocina: raw.cocina ?? false,
          zona_lavanderia: raw.zonaLavanderia ?? false,

          conjunto_cerrado: raw.conjuntoCerrado ?? false,
          tiene_administracion: raw.tieneAdministracion ?? false,
          valor_administracion: raw.valorAdministracion,
          zonas_comunes: raw.zonasComunes,

          actividad: raw.actividad,
          rural_urbano: raw.ruralUrbano,
          tiene_servicios: raw.tieneServicios ?? false,
          tiene_alcantarillado: raw.tieneAlcantarillado ?? false,
          tiene_acueducto: raw.tieneAcueducto ?? false,

          permite_permuta: raw.permitePermuta ?? false,
          adicionales: raw.adicionales,

          tiene_gravamenes: raw.tieneGravamenes ?? false,
          tiene_hipoteca: raw.tieneHipoteca ?? false,
        },
        fotoPrincipal: this.fotoPrincipalFile()!,
        video: this.mostrarVideo() ? this.videoFile() : null,
      }),
    );
  }

  private updateDetalleValidators(tipo: TipoInmueble | null): void {
    const requeridos = new Set(CAMPOS_REQUERIDOS[tipo ?? 'casa']);
    for (const campo of TODOS_LOS_CAMPOS_DETALLE) {
      const control = this.form.controls[campo];
      const validators = requeridos.has(campo) ? [Validators.required] : [];
      const minValue = CAMPOS_DETALLE_MIN[campo];
      if (minValue !== undefined) {
        validators.push(Validators.min(minValue));
      }
      control.setValidators(validators);
      control.updateValueAndValidity({ emitEvent: false });
    }
  }

  private updateParqueaderoValidators(tipo: TipoInmueble | null, tieneParqueadero: boolean | null): void {
    const requerido = !!tieneParqueadero && TIPOS_CON_PARQUEADERO_DETALLE.includes(tipo ?? 'casa');
    this.form.controls.numParqueaderos.setValidators(requerido ? [Validators.required, Validators.min(1)] : []);
    this.form.controls.tipoParqueadero.setValidators(requerido ? [Validators.required] : []);
    this.form.controls.numParqueaderos.updateValueAndValidity({ emitEvent: false });
    this.form.controls.tipoParqueadero.updateValueAndValidity({ emitEvent: false });
  }

  private handleFotoPrincipal(file: File | null): void {
    if (!file) return;

    const validationError = this.validateImage(file);
    if (validationError) {
      this.fotoPrincipalError.set(validationError);
      return;
    }
    this.fotoPrincipalError.set(null);
    this.fotoPrincipalFile.set(file);
    this.fotoPrincipalPreview.set(URL.createObjectURL(file));
  }

  private validateImage(file: File): string | null {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return 'Formato no soportado. Usa JPEG, PNG o WEBP.';
    }
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      return 'La imagen supera el tamaño máximo permitido (5 MB).';
    }
    return null;
  }

  private handleVideo(file: File | null): void {
    if (!file) return;

    const validationError = this.validateVideo(file);
    if (validationError) {
      this.videoError.set(validationError);
      return;
    }
    this.videoError.set(null);
    this.videoFile.set(file);
  }

  private validateVideo(file: File): string | null {
    if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
      return 'Formato no soportado. Usa MP4.';
    }
    if (file.size > MAX_VIDEO_SIZE_BYTES) {
      return 'El video supera el tamaño máximo permitido (50 MB).';
    }
    return null;
  }
}
