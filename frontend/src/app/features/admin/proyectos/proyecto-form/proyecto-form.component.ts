import { ChangeDetectionStrategy, Component, OnInit, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { NgSelectModule } from '@ng-select/ng-select';
import { EstadoProyecto, ProyectoForm } from '../../../../store/Proyectos/proyecto-form.model';
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

  protected readonly form = this.fb.group({
    nombre: ['', [Validators.required, Validators.maxLength(255)]],
    descripcion: ['', Validators.required],
    ubicacion: ['', [Validators.required, Validators.maxLength(255)]],
    estado: ['planos' as EstadoProyecto, Validators.required],
    precio: [null as number | null, [Validators.required, Validators.min(1)]],
    financiacion: [false],
    financiacionDescripcion: [null as string | null],
    creditoHipotecario: [false],
  });

  // Signal derivado del control para poder mostrar/ocultar la descripción de
  // financiación reactivamente (OnPush) sin suscribirse manualmente en la vista.
  protected readonly financiacionValue = toSignal(this.form.controls.financiacion.valueChanges, {
    initialValue: this.form.controls.financiacion.value,
  });
  protected readonly mostrarFinanciacionDescripcion = computed(() => this.financiacionValue() === true);

  protected readonly fotoPortadaFile = signal<File | null>(null);
  protected readonly fotoPortadaPreview = signal<string | null>(null);
  protected readonly fotoPortadaError = signal<string | null>(null);
  protected readonly fotoPortadaDragOver = signal(false);

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
        });
      }
    });

    // La descripción de financiación es obligatoria solo cuando financiacion=true —
    // se actualiza el validator en caliente en vez de duplicar la regla en el template.
    this.form.controls.financiacion.valueChanges.subscribe((financiacion) =>
      this.updateFinanciacionValidators(financiacion),
    );
    this.updateFinanciacionValidators(this.form.controls.financiacion.value);
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

  private updateFinanciacionValidators(financiacion: boolean | null): void {
    this.form.controls.financiacionDescripcion.setValidators(
      financiacion ? [Validators.required] : [],
    );
    this.form.controls.financiacionDescripcion.updateValueAndValidity({ emitEvent: false });
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
