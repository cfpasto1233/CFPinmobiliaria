import { ChangeDetectionStrategy, Component, OnInit, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { NgSelectModule } from '@ng-select/ng-select';
import { PropiedadForm, TipoInmueble } from '../../../../store/Propiedades/propiedad-form.model';
import { PropiedadesActions } from '../../../../store/Propiedades/propiedades.actions';
import {
  selectPropiedadSelected,
  selectPropiedadesError,
  selectPropiedadesLoading,
} from '../../../../store/Propiedades/propiedades.selectors';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const TIPOS_INMUEBLE_CON_DETALLE: TipoInmueble[] = [
  'casa',
  'apartamento',
  'local',
  'finca',
  'apartaestudio',
  'oficina',
];

type FormFieldName =
  | 'nombre'
  | 'descripcion'
  | 'ubicacion'
  | 'precio'
  | 'tipo'
  | 'tipoInmueble'
  | 'banos'
  | 'habitaciones'
  | 'numParqueaderos'
  | 'areaConstruida'
  | 'antiguedad';

const REQUIRED_MESSAGES: Record<FormFieldName, string> = {
  nombre: 'El nombre es obligatorio.',
  descripcion: 'La descripción es obligatoria.',
  ubicacion: 'La ubicación es obligatoria.',
  precio: 'El precio es obligatorio.',
  tipo: 'Selecciona un tipo.',
  tipoInmueble: 'Selecciona el tipo de inmueble.',
  banos: 'Indica el número de baños.',
  habitaciones: 'Indica el número de habitaciones.',
  numParqueaderos: 'Indica el número de parqueaderos.',
  areaConstruida: 'Indica el área construida.',
  antiguedad: 'Indica la antigüedad.',
};

const MIN_MESSAGES: Partial<Record<FormFieldName, string>> = {
  precio: 'El precio debe ser mayor a 0.',
  areaConstruida: 'El área construida debe ser mayor a 0.',
  numParqueaderos: 'Debe ser al menos 1.',
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

  protected readonly form = this.fb.group({
    nombre: ['', [Validators.required, Validators.maxLength(255)]],
    descripcion: ['', Validators.required],
    ubicacion: ['', [Validators.required, Validators.maxLength(255)]],
    precio: [null as number | null, [Validators.required, Validators.min(1)]],
    tipo: ['venta' as 'venta' | 'arriendo' | 'oferta', Validators.required],
    tipoInmueble: ['casa' as TipoInmueble, Validators.required],
    banos: [null as number | null],
    habitaciones: [null as number | null],
    tieneParqueadero: [false],
    numParqueaderos: [null as number | null],
    areaConstruida: [null as number | null],
    antiguedad: [null as number | null],
  });

  // Signals derivados de los controles para poder mostrar/ocultar secciones del
  // template reactivamente (OnPush) sin suscribirse manualmente en la vista.
  private readonly tipoInmuebleValue = toSignal(this.form.controls.tipoInmueble.valueChanges, {
    initialValue: this.form.controls.tipoInmueble.value,
  });
  protected readonly mostrarDetalleInmueble = computed(() =>
    TIPOS_INMUEBLE_CON_DETALLE.includes(this.tipoInmuebleValue() ?? 'casa'),
  );

  protected readonly tieneParqueaderoValue = toSignal(this.form.controls.tieneParqueadero.valueChanges, {
    initialValue: this.form.controls.tieneParqueadero.value,
  });

  protected readonly fotoPrincipalFile = signal<File | null>(null);
  protected readonly fotoPrincipalPreview = signal<string | null>(null);
  protected readonly fotoPrincipalError = signal<string | null>(null);
  protected readonly fotoAdicionalError = signal<string | null>(null);
  protected readonly fotoPrincipalDragOver = signal(false);
  protected readonly fotoAdicionalDragOver = signal(false);

  constructor() {
    effect(() => {
      const item = this.selected();
      if (item && this.isEditMode) {
        this.form.patchValue({
          nombre: item.nombre,
          descripcion: item.descripcion,
          ubicacion: item.ubicacion,
          precio: Number(item.precio),
          tipo: item.tipo === 'arriendo' || item.tipo === 'oferta' ? item.tipo : 'venta',
          tipoInmueble: (item.tipo_inmueble as TipoInmueble | undefined) ?? 'casa',
          banos: item.banos,
          habitaciones: item.habitaciones,
          tieneParqueadero: item.tiene_parqueadero,
          numParqueaderos: item.num_parqueaderos,
          areaConstruida: item.area_construida !== null ? Number(item.area_construida) : null,
          antiguedad: item.antiguedad,
        });
      }
    });

    // Baños/habitaciones/área/antigüedad son obligatorios solo si el inmueble es casa
    // o apartamento; el número de parqueaderos solo si hay parqueadero. Se actualizan
    // los validators en caliente en vez de duplicar la condición en el template.
    this.form.controls.tipoInmueble.valueChanges.subscribe((tipo) => this.updateDetalleValidators(tipo));
    this.form.controls.tieneParqueadero.valueChanges.subscribe((tiene) =>
      this.updateParqueaderoValidators(tiene),
    );
    this.updateDetalleValidators(this.form.controls.tipoInmueble.value);
    this.updateParqueaderoValidators(this.form.controls.tieneParqueadero.value);
  }

  ngOnInit(): void {
    if (this.propiedadId) {
      this.store.dispatch(PropiedadesActions.loadOne({ id: this.propiedadId }));
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

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const esCasaOApartamento = TIPOS_INMUEBLE_CON_DETALLE.includes(raw.tipoInmueble ?? 'casa');
    const form: PropiedadForm = {
      nombre: raw.nombre ?? '',
      descripcion: raw.descripcion ?? '',
      ubicacion: raw.ubicacion ?? '',
      precio: raw.precio ?? 0,
      tipo: raw.tipo ?? 'venta',
      tipo_inmueble: raw.tipoInmueble ?? 'casa',
      banos: esCasaOApartamento ? raw.banos : null,
      habitaciones: esCasaOApartamento ? raw.habitaciones : null,
      tiene_parqueadero: esCasaOApartamento ? (raw.tieneParqueadero ?? false) : false,
      num_parqueaderos: esCasaOApartamento && raw.tieneParqueadero ? raw.numParqueaderos : null,
      area_construida: esCasaOApartamento ? raw.areaConstruida : null,
      antiguedad: esCasaOApartamento ? raw.antiguedad : null,
    };

    if (this.isEditMode && this.propiedadId) {
      this.store.dispatch(PropiedadesActions.update({ id: this.propiedadId, changes: form }));
      return;
    }

    if (!this.fotoPrincipalFile()) {
      this.fotoPrincipalError.set('La foto principal es obligatoria.');
      return;
    }

    this.store.dispatch(PropiedadesActions.create({ form, fotoPrincipal: this.fotoPrincipalFile()! }));
  }

  private updateDetalleValidators(tipo: TipoInmueble | null): void {
    const requerido = TIPOS_INMUEBLE_CON_DETALLE.includes(tipo ?? 'casa') ? [Validators.required] : [];
    this.form.controls.banos.setValidators([...requerido, Validators.min(0)]);
    this.form.controls.habitaciones.setValidators([...requerido, Validators.min(0)]);
    this.form.controls.areaConstruida.setValidators([...requerido, Validators.min(0.01)]);
    this.form.controls.antiguedad.setValidators([...requerido, Validators.min(0)]);
    this.form.controls.banos.updateValueAndValidity({ emitEvent: false });
    this.form.controls.habitaciones.updateValueAndValidity({ emitEvent: false });
    this.form.controls.areaConstruida.updateValueAndValidity({ emitEvent: false });
    this.form.controls.antiguedad.updateValueAndValidity({ emitEvent: false });
  }

  private updateParqueaderoValidators(tieneParqueadero: boolean | null): void {
    this.form.controls.numParqueaderos.setValidators(
      tieneParqueadero ? [Validators.required, Validators.min(1)] : [],
    );
    this.form.controls.numParqueaderos.updateValueAndValidity({ emitEvent: false });
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
}
