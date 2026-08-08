import { ChangeDetectionStrategy, Component, OnInit, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { NgSelectModule } from '@ng-select/ng-select';
import {
  PropiedadForm,
  RuralUrbano,
  TipoInmueble,
  TipoParqueadero,
  Vista,
} from '../../../../store/Propiedades/propiedad-form.model';
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
} from '../../../../store/Propiedades/propiedad-form-fields';
import { PropiedadesActions } from '../../../../store/Propiedades/propiedades.actions';
import {
  selectPropiedadSelected,
  selectPropiedadesError,
  selectPropiedadesLoading,
} from '../../../../store/Propiedades/propiedades.selectors';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_VIDEO_TYPES = ['video/mp4'];
const MAX_VIDEO_SIZE_BYTES = 50 * 1024 * 1024;

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
  selector: 'app-propiedad-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, NgSelectModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './propiedad-form.component.html',
  styleUrl: './propiedad-form.component.scss',
})
export class PropiedadFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(Store);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly propiedadId = this.route.snapshot.paramMap.get('id');
  protected readonly isEditMode = !!this.propiedadId;

  protected readonly loading = this.store.selectSignal(selectPropiedadesLoading);
  protected readonly error = this.store.selectSignal(selectPropiedadesError);
  protected readonly selected = this.store.selectSignal(selectPropiedadSelected);

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

  // terraza/patio son columnas compartidas entre tipos, pero el enunciado cambia:
  // en finca "terraza" representa "Terraza y/o Patio"; en local/oficina "patio"
  // se reutiliza con su propio rótulo.
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

  // ¿Se muestra el input de valor de administración? Para casa/finca va directo
  // (sin el booleano "tiene administración" de por medio); para apartamento y
  // apartaestudio depende de ese booleano.
  protected readonly mostrarValorAdministracion = computed(() => {
    if (!this.mostrarCampo('valorAdministracion')) return false;
    if (this.mostrarAdminAnidada()) return this.tieneAdministracionValue() === true;
    return this.conjuntoCerradoValue() === true || this.mostrarAdminDirecta();
  });

  protected readonly fotoPrincipalFile = signal<File | null>(null);
  protected readonly fotoPrincipalPreview = signal<string | null>(null);
  protected readonly fotoPrincipalError = signal<string | null>(null);
  protected readonly fotoAdicionalError = signal<string | null>(null);
  protected readonly fotoPrincipalDragOver = signal(false);
  protected readonly fotoAdicionalDragOver = signal(false);

  // Video opcional — sin restricción de plan en el form de admin (a diferencia del
  // formulario público por token, ver publicar-mi-propiedad.component.ts).
  protected readonly videoFile = signal<File | null>(null);
  protected readonly videoError = signal<string | null>(null);
  protected readonly videoDragOver = signal(false);

  constructor() {
    effect(() => {
      const item = this.selected();
      if (item && this.isEditMode) {
        this.form.patchValue({
          nombre: item.nombre,
          descripcion: item.descripcion,
          ubicacion: item.ubicacion,
          whatsapp: item.whatsapp ?? '',
          precio: Number(item.precio),
          tipo: item.tipo === 'arriendo' || item.tipo === 'oferta' ? item.tipo : 'venta',
          tipoInmueble: (item.tipo_inmueble as TipoInmueble | undefined) ?? 'casa',
          banos: item.banos,
          habitaciones: item.habitaciones,
          tieneParqueadero: item.tiene_parqueadero,
          numParqueaderos: item.num_parqueaderos,
          tipoParqueadero: (item.tipo_parqueadero as TipoParqueadero | null) ?? null,
          areaConstruida: item.area_construida !== null ? Number(item.area_construida) : null,
          areaLote: item.area_lote !== null ? Number(item.area_lote) : null,
          frente: item.frente !== null ? Number(item.frente) : null,
          fondo: item.fondo !== null ? Number(item.fondo) : null,
          antiguedad: item.antiguedad,
          piso: item.piso,
          vista: (item.vista as Vista | null) ?? null,
          balcon: item.balcon,
          terraza: item.terraza,
          patio: item.patio,
          bodega: item.bodega,
          zonaBbq: item.zona_bbq,
          piscina: item.piscina,
          cocina: item.cocina,
          conjuntoCerrado: item.conjunto_cerrado,
          tieneAdministracion: item.tiene_administracion,
          valorAdministracion: item.valor_administracion !== null ? Number(item.valor_administracion) : null,
          zonasComunes: item.zonas_comunes,
          actividad: item.actividad,
          ruralUrbano: (item.rural_urbano as RuralUrbano | null) ?? null,
          tieneServicios: item.tiene_servicios,
          tieneAlcantarillado: item.tiene_alcantarillado,
          tieneAcueducto: item.tiene_acueducto,
          permitePermuta: item.permite_permuta,
          adicionales: item.adicionales,
          tieneGravamenes: item.tiene_gravamenes,
          tieneHipoteca: item.tiene_hipoteca,
        });
      }
    });

    // Qué campos son obligatorios depende del tipo de inmueble — se actualizan
    // los validators en caliente en vez de duplicar la matriz en el template.
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
    if (this.propiedadId) {
      this.store.dispatch(PropiedadesActions.loadOne({ id: this.propiedadId }));
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

  protected onFotoAdicionalDragOver(event: DragEvent): void {
    event.preventDefault();
    this.fotoAdicionalDragOver.set(true);
  }

  protected onFotoAdicionalDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.fotoAdicionalDragOver.set(false);
  }

  protected onFotosAdicionalesDrop(event: DragEvent): void {
    event.preventDefault();
    this.fotoAdicionalDragOver.set(false);
    this.handleFotosAdicionales(event.dataTransfer?.files ?? null);
  }

  protected onFotosAdicionalesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.handleFotosAdicionales(input.files);
    input.value = '';
  }

  protected onRemoveFotoPrincipalSeleccionada(): void {
    this.fotoPrincipalFile.set(null);
    this.fotoPrincipalPreview.set(null);
    this.fotoPrincipalError.set(null);
  }

  protected onRemoveFoto(fotoId: string): void {
    if (!this.propiedadId) return;
    if (!confirm('¿Eliminar esta foto?')) return;
    this.store.dispatch(PropiedadesActions.removeFoto({ propiedadId: this.propiedadId, fotoId }));
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

  protected onRemoveVideo(): void {
    if (!this.propiedadId) return;
    if (!confirm('¿Eliminar el video?')) return;
    this.store.dispatch(PropiedadesActions.removeVideo({ propiedadId: this.propiedadId }));
  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    // La limpieza de campos que no aplican para el tipo de inmueble elegido (p.
    // ej. "balcón" en un lote) la hace el backend en PropiedadForm/PropiedadUpdate
    // — acá solo se arma el objeto con los valores crudos del formulario.
    const raw = this.form.getRawValue();
    const form: PropiedadForm = {
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
    };

    if (this.isEditMode && this.propiedadId) {
      this.store.dispatch(PropiedadesActions.update({ id: this.propiedadId, changes: form }));
      return;
    }

    if (!this.fotoPrincipalFile()) {
      this.fotoPrincipalError.set('La foto principal es obligatoria.');
      return;
    }

    this.store.dispatch(
      PropiedadesActions.create({
        form,
        fotoPrincipal: this.fotoPrincipalFile()!,
        video: this.videoFile(),
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

    if (this.isEditMode && this.propiedadId) {
      this.store.dispatch(PropiedadesActions.replaceFotoPrincipal({ propiedadId: this.propiedadId, file }));
      return;
    }

    this.fotoPrincipalFile.set(file);
    this.fotoPrincipalPreview.set(URL.createObjectURL(file));
  }

  private handleFotosAdicionales(files: FileList | null): void {
    if (!files || !this.propiedadId) return;

    this.fotoAdicionalError.set(null);
    for (const file of Array.from(files)) {
      const validationError = this.validateImage(file);
      if (validationError) {
        this.fotoAdicionalError.set(validationError);
        continue;
      }
      this.store.dispatch(PropiedadesActions.addFoto({ propiedadId: this.propiedadId, file }));
    }
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

    if (this.isEditMode && this.propiedadId) {
      this.store.dispatch(PropiedadesActions.setVideo({ propiedadId: this.propiedadId, file }));
      return;
    }

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
