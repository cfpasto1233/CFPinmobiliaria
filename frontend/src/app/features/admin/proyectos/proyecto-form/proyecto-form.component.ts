import { ChangeDetectionStrategy, Component, OnInit, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { NgSelectModule } from '@ng-select/ng-select';
import { ProyectoTipoPublic } from '../../../../../client';
import {
  EstadoProyecto,
  ProyectoForm,
  TipoUnidadProyecto,
  VistaUnidad,
  ZonaComun,
} from '../../../../store/Proyectos/proyecto-form.model';
import { ProyectosActions } from '../../../../store/Proyectos/proyectos.actions';
import {
  selectProyectoSelected,
  selectProyectosError,
  selectProyectosLoading,
} from '../../../../store/Proyectos/proyectos.selectors';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

type FormFieldName =
  | 'nombre'
  | 'descripcion'
  | 'ubicacion'
  | 'estado'
  | 'precio'
  | 'financiacionDescripcion';

const REQUIRED_MESSAGES: Record<FormFieldName, string> = {
  nombre: 'El nombre es obligatorio.',
  descripcion: 'La descripción es obligatoria.',
  ubicacion: 'La ubicación es obligatoria.',
  estado: 'Selecciona el estado del proyecto.',
  precio: 'El precio es obligatorio.',
  financiacionDescripcion: 'Indica la descripción de la financiación.',
};

const MIN_MESSAGES: Partial<Record<FormFieldName, string>> = {
  precio: 'El precio debe ser mayor a 0.',
};

interface TipoFormControls {
  categoria: FormControl<TipoUnidadProyecto>;
  areaM2: FormControl<number | null>;
  precio: FormControl<number | null>;
  habitaciones: FormControl<number | null>;
  banos: FormControl<number | null>;
  balcon: FormControl<boolean>;
  terraza: FormControl<boolean>;
  parqueadero: FormControl<boolean>;
  patio: FormControl<boolean>;
  vista: FormControl<VistaUnidad | null>;
}

@Component({
  selector: 'app-proyecto-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, NgSelectModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './proyecto-form.component.html',
  styleUrl: './proyecto-form.component.scss',
})
export class ProyectoFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(Store);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly proyectoId = this.route.snapshot.paramMap.get('id');
  protected readonly isEditMode = !!this.proyectoId;

  protected readonly loading = this.store.selectSignal(selectProyectosLoading);
  protected readonly error = this.store.selectSignal(selectProyectosError);
  protected readonly selected = this.store.selectSignal(selectProyectoSelected);

  protected readonly estadoOptions: { value: EstadoProyecto; label: string }[] = [
    { value: 'planos', label: 'Planos' },
    { value: 'construccion_1', label: 'Construcción I' },
    { value: 'construccion_2', label: 'Construcción II' },
    { value: 'entrega_inmediata', label: 'Entrega inmediata' },
  ];

  protected readonly zonaComunOptions: { value: ZonaComun; label: string }[] = [
    { value: 'piscina', label: 'Piscina' },
    { value: 'parque_infantil', label: 'Parque infantil' },
    { value: 'cancha', label: 'Cancha' },
    { value: 'parqueadero_visitantes', label: 'Parqueadero visitantes' },
    { value: 'zonas_verdes', label: 'Zonas verdes' },
    { value: 'salon_social', label: 'Salón social' },
    { value: 'zona_bbq', label: 'Zona BBQ' },
    { value: 'gimnasio', label: 'Gimnasio' },
    { value: 'lobby', label: 'Lobby' },
    { value: 'zona_humeda', label: 'Zona húmeda' },
    { value: 'porteria_digital', label: 'Vigilante o portería digital' },
  ];

  protected readonly tipoUnidadOptions: { value: TipoUnidadProyecto; label: string }[] = [
    { value: 'local', label: 'Local' },
    { value: 'apartaestudio', label: 'Apartaestudio' },
    { value: 'apartamento', label: 'Apartamento' },
    { value: 'penthouse', label: 'Penthouse' },
  ];

  protected readonly vistaOptions: { value: VistaUnidad; label: string }[] = [
    { value: 'interna', label: 'Interna' },
    { value: 'externa', label: 'Externa' },
  ];

  protected readonly form = this.fb.group({
    nombre: ['', [Validators.required, Validators.maxLength(255)]],
    descripcion: ['', Validators.required],

    tieneZonasComunes: [false],
    zonasComunes: [[] as ZonaComun[]],

    ascensor: [false],

    tipos: this.fb.array<FormGroup<TipoFormControls>>([]),

    conjuntoCerrado: [false],
    valorAdministracionPorDefinir: [false],
    valorAdministracion: [null as number | null],

    ubicacion: ['', [Validators.required, Validators.maxLength(255)]],
    estado: ['planos' as EstadoProyecto, Validators.required],
    areaM2: [null as number | null],
    precio: [null as number | null, [Validators.required, Validators.min(1)]],
    financiacion: [false],
    financiacionDescripcion: [null as string | null],
    creditoHipotecario: [false],
    creditoHipotecarioDescripcion: [null as string | null],
  });

  // Signals derivados de los controles para poder mostrar/ocultar secciones
  // reactivamente (OnPush) sin suscribirse manualmente en la vista.
  protected readonly financiacionValue = toSignal(this.form.controls.financiacion.valueChanges, {
    initialValue: this.form.controls.financiacion.value,
  });
  protected readonly mostrarFinanciacionDescripcion = computed(() => this.financiacionValue() === true);

  protected readonly tieneZonasComunesValue = toSignal(this.form.controls.tieneZonasComunes.valueChanges, {
    initialValue: this.form.controls.tieneZonasComunes.value,
  });
  protected readonly mostrarZonasComunes = computed(() => this.tieneZonasComunesValue() === true);

  protected readonly conjuntoCerradoValue = toSignal(this.form.controls.conjuntoCerrado.valueChanges, {
    initialValue: this.form.controls.conjuntoCerrado.value,
  });
  protected readonly mostrarAdministracion = computed(() => this.conjuntoCerradoValue() === true);

  protected readonly valorAdministracionPorDefinirValue = toSignal(
    this.form.controls.valorAdministracionPorDefinir.valueChanges,
    { initialValue: this.form.controls.valorAdministracionPorDefinir.value },
  );
  protected readonly mostrarValorAdministracionInput = computed(
    () => this.mostrarAdministracion() && this.valorAdministracionPorDefinirValue() !== true,
  );

  protected readonly creditoHipotecarioValue = toSignal(this.form.controls.creditoHipotecario.valueChanges, {
    initialValue: this.form.controls.creditoHipotecario.value,
  });
  protected readonly mostrarCreditoDescripcion = computed(() => this.creditoHipotecarioValue() === true);

  protected readonly fotoPortadaFile = signal<File | null>(null);
  protected readonly fotoPortadaPreview = signal<string | null>(null);
  protected readonly fotoPortadaError = signal<string | null>(null);
  protected readonly fotoPortadaDragOver = signal(false);

  protected readonly fotoAdicionalError = signal<string | null>(null);
  protected readonly fotoAdicionalDragOver = signal(false);

  constructor() {
    effect(() => {
      const item = this.selected();
      if (item && this.isEditMode) {
        this.form.patchValue({
          nombre: item.nombre,
          descripcion: item.descripcion,
          ubicacion: item.ubicacion,
          estado: item.estado as EstadoProyecto,
          precio: Number(item.precio),
          financiacion: item.financiacion,
          financiacionDescripcion: item.financiacion_descripcion,
          creditoHipotecario: item.credito_hipotecario,
          creditoHipotecarioDescripcion: item.credito_hipotecario_descripcion,
          tieneZonasComunes: item.tiene_zonas_comunes,
          zonasComunes: (item.zonas_comunes ?? []) as ZonaComun[],
          ascensor: item.ascensor,
          conjuntoCerrado: item.conjunto_cerrado,
          valorAdministracionPorDefinir: item.valor_administracion_por_definir,
          valorAdministracion:
            item.valor_administracion !== null ? Number(item.valor_administracion) : null,
          areaM2: item.area_m2 !== null ? Number(item.area_m2) : null,
        });

        const tiposArray = this.form.controls.tipos;
        tiposArray.clear();
        for (const tipo of item.tipos) {
          tiposArray.push(this.createTipoGroup(tipo));
        }
      }
    });

    // La descripción de financiación es obligatoria solo cuando financiacion=true —
    // se actualiza el validator en caliente en vez de duplicar la regla en el template.
    this.form.controls.financiacion.valueChanges.subscribe((financiacion) =>
      this.updateFinanciacionValidators(financiacion),
    );
    this.updateFinanciacionValidators(this.form.controls.financiacion.value);

    this.form.controls.tieneZonasComunes.valueChanges.subscribe((tiene) => {
      if (!tiene) this.form.controls.zonasComunes.setValue([]);
    });

    this.form.controls.conjuntoCerrado.valueChanges.subscribe((activo) => {
      if (!activo) {
        this.form.controls.valorAdministracionPorDefinir.setValue(false);
        this.form.controls.valorAdministracion.setValue(null);
      }
    });

    this.form.controls.valorAdministracionPorDefinir.valueChanges.subscribe((porDefinir) => {
      if (porDefinir) this.form.controls.valorAdministracion.setValue(null);
    });
  }

  ngOnInit(): void {
    if (this.proyectoId) {
      this.store.dispatch(ProyectosActions.loadOne({ id: this.proyectoId }));
    }
  }

  protected fieldError(name: FormFieldName): string | null {
    const control = this.form.get(name);
    if (!control || !control.invalid || !(control.dirty || control.touched)) return null;
    if (control.hasError('required')) return REQUIRED_MESSAGES[name];
    if (control.hasError('maxlength')) return 'Máximo 255 caracteres.';
    if (control.hasError('min')) return MIN_MESSAGES[name] ?? 'El valor no puede ser negativo.';
    return null;
  }

  protected addTipo(): void {
    this.form.controls.tipos.push(this.createTipoGroup());
  }

  protected removeTipo(index: number): void {
    this.form.controls.tipos.removeAt(index);
  }

  protected onFotoPortadaDragOver(event: DragEvent): void {
    event.preventDefault();
    this.fotoPortadaDragOver.set(true);
  }

  protected onFotoPortadaDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.fotoPortadaDragOver.set(false);
  }

  protected onFotoPortadaDrop(event: DragEvent): void {
    event.preventDefault();
    this.fotoPortadaDragOver.set(false);
    this.handleFotoPortada(event.dataTransfer?.files?.[0] ?? null);
  }

  protected onFotoPortadaSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.handleFotoPortada(input.files?.[0] ?? null);
    input.value = '';
  }

  protected onRemoveFotoPortadaSeleccionada(): void {
    this.fotoPortadaFile.set(null);
    this.fotoPortadaPreview.set(null);
    this.fotoPortadaError.set(null);
  }

  protected onFotoAdicionalDragOver(event: DragEvent): void {
    event.preventDefault();
    this.fotoAdicionalDragOver.set(true);
  }

  protected onFotoAdicionalDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.fotoAdicionalDragOver.set(false);
  }

  protected onFotoAdicionalDrop(event: DragEvent, descInput: HTMLInputElement): void {
    event.preventDefault();
    this.fotoAdicionalDragOver.set(false);
    this.handleFotoAdicional(event.dataTransfer?.files?.[0] ?? null, descInput);
  }

  protected onFotoAdicionalSelected(event: Event, descInput: HTMLInputElement): void {
    const input = event.target as HTMLInputElement;
    this.handleFotoAdicional(input.files?.[0] ?? null, descInput);
    input.value = '';
  }

  protected onRemoveFoto(fotoId: string): void {
    if (!this.proyectoId) return;
    if (!confirm('¿Eliminar esta foto?')) return;
    this.store.dispatch(ProyectosActions.removeFoto({ proyectoId: this.proyectoId, fotoId }));
  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const form: ProyectoForm = {
      nombre: raw.nombre ?? '',
      descripcion: raw.descripcion ?? '',
      ubicacion: raw.ubicacion ?? '',
      estado: raw.estado ?? 'planos',
      precio: raw.precio ?? 0,
      financiacion: raw.financiacion ?? false,
      financiacion_descripcion: raw.financiacionDescripcion,
      credito_hipotecario: raw.creditoHipotecario ?? false,
      credito_hipotecario_descripcion: raw.creditoHipotecarioDescripcion,
      tiene_zonas_comunes: raw.tieneZonasComunes ?? false,
      zonas_comunes: raw.zonasComunes && raw.zonasComunes.length > 0 ? raw.zonasComunes : null,
      ascensor: raw.ascensor ?? false,
      conjunto_cerrado: raw.conjuntoCerrado ?? false,
      valor_administracion_por_definir: raw.valorAdministracionPorDefinir ?? false,
      valor_administracion: raw.valorAdministracion,
      area_m2: raw.areaM2,
      tipos: this.form.controls.tipos.getRawValue().map((tipo) => ({
        categoria: tipo.categoria,
        area_m2: tipo.areaM2,
        precio: tipo.precio,
        habitaciones: tipo.habitaciones ?? 0,
        banos: tipo.banos ?? 0,
        balcon: tipo.balcon,
        terraza: tipo.terraza,
        parqueadero: tipo.parqueadero,
        patio: tipo.patio,
        vista: tipo.vista as VistaUnidad,
      })),
    };

    if (this.isEditMode && this.proyectoId) {
      this.store.dispatch(ProyectosActions.update({ id: this.proyectoId, changes: form }));
      return;
    }

    if (!this.fotoPortadaFile()) {
      this.fotoPortadaError.set('La foto de portada es obligatoria.');
      return;
    }

    this.store.dispatch(ProyectosActions.create({ form, fotoPortada: this.fotoPortadaFile()! }));
  }

  private createTipoGroup(tipo?: ProyectoTipoPublic): FormGroup<TipoFormControls> {
    return this.fb.group<TipoFormControls>({
      categoria: this.fb.control((tipo?.categoria as TipoUnidadProyecto) ?? 'apartamento', {
        nonNullable: true,
        validators: Validators.required,
      }),
      areaM2: this.fb.control(tipo?.area_m2 != null ? Number(tipo.area_m2) : null, Validators.min(0)),
      precio: this.fb.control(tipo?.precio != null ? Number(tipo.precio) : null, Validators.min(0)),
      habitaciones: this.fb.control(tipo?.habitaciones ?? null, [Validators.required, Validators.min(0)]),
      banos: this.fb.control(tipo?.banos ?? null, [Validators.required, Validators.min(0)]),
      balcon: this.fb.control(tipo?.balcon ?? false, { nonNullable: true }),
      terraza: this.fb.control(tipo?.terraza ?? false, { nonNullable: true }),
      parqueadero: this.fb.control(tipo?.parqueadero ?? false, { nonNullable: true }),
      patio: this.fb.control(tipo?.patio ?? false, { nonNullable: true }),
      vista: this.fb.control((tipo?.vista as VistaUnidad) ?? null, Validators.required),
    });
  }

  private updateFinanciacionValidators(financiacion: boolean | null): void {
    this.form.controls.financiacionDescripcion.setValidators(
      financiacion ? [Validators.required] : [],
    );
    this.form.controls.financiacionDescripcion.updateValueAndValidity({ emitEvent: false });
  }

  private handleFotoPortada(file: File | null): void {
    if (!file) return;

    const validationError = this.validateImage(file);
    if (validationError) {
      this.fotoPortadaError.set(validationError);
      return;
    }
    this.fotoPortadaError.set(null);

    if (this.isEditMode && this.proyectoId) {
      this.store.dispatch(ProyectosActions.replaceFotoPortada({ proyectoId: this.proyectoId, file }));
      return;
    }

    this.fotoPortadaFile.set(file);
    this.fotoPortadaPreview.set(URL.createObjectURL(file));
  }

  private handleFotoAdicional(file: File | null, descInput: HTMLInputElement): void {
    if (!file || !this.proyectoId) return;

    const validationError = this.validateImage(file);
    if (validationError) {
      this.fotoAdicionalError.set(validationError);
      return;
    }
    this.fotoAdicionalError.set(null);

    const descripcion = descInput.value.trim() || null;
    this.store.dispatch(ProyectosActions.addFoto({ proyectoId: this.proyectoId, file, descripcion }));
    descInput.value = '';
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
}
