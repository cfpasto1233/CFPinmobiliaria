import { ChangeDetectionStrategy, Component, OnInit, effect, inject, signal } from '@angular/core';
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

type FormFieldName = 'nombre' | 'descripcion' | 'ubicacion' | 'estado';

const REQUIRED_MESSAGES: Record<FormFieldName, string> = {
  nombre: 'El nombre es obligatorio.',
  descripcion: 'La descripción es obligatoria.',
  ubicacion: 'La ubicación es obligatoria.',
  estado: 'Selecciona el estado del proyecto.',
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
    { value: 'preventa', label: 'Preventa' },
    { value: 'en_construccion', label: 'En construcción' },
    { value: 'entrega_inmediata', label: 'Entrega inmediata' },
  ];

  protected readonly form = this.fb.group({
    nombre: ['', [Validators.required, Validators.maxLength(255)]],
    descripcion: ['', Validators.required],
    ubicacion: ['', [Validators.required, Validators.maxLength(255)]],
    estado: ['preventa' as EstadoProyecto, Validators.required],
  });

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
        });
      }
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
      estado: raw.estado ?? 'preventa',
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
