import { ChangeDetectionStrategy, Component, OnInit, effect, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { NgSelectModule } from '@ng-select/ng-select';
import { PropiedadForm } from '../../../../store/Propiedades/propiedad-form.model';
import { PropiedadesActions } from '../../../../store/Propiedades/propiedades.actions';
import {
  selectPropiedadSelected,
  selectPropiedadesError,
  selectPropiedadesLoading,
} from '../../../../store/Propiedades/propiedades.selectors';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

type FormFieldName = 'nombre' | 'descripcion' | 'ubicacion' | 'precio' | 'tipo';

const REQUIRED_MESSAGES: Record<FormFieldName, string> = {
  nombre: 'El nombre es obligatorio.',
  descripcion: 'La descripción es obligatoria.',
  ubicacion: 'La ubicación es obligatoria.',
  precio: 'El precio es obligatorio.',
  tipo: 'Selecciona un tipo.',
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
  ];

  protected readonly form = this.fb.group({
    nombre: ['', [Validators.required, Validators.maxLength(255)]],
    descripcion: ['', Validators.required],
    ubicacion: ['', [Validators.required, Validators.maxLength(255)]],
    precio: [null as number | null, [Validators.required, Validators.min(1)]],
    tipo: ['venta' as 'venta' | 'arriendo', Validators.required],
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
          tipo: item.tipo === 'arriendo' ? 'arriendo' : 'venta',
        });
      }
    });
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
    if (control.hasError('min')) return 'El precio debe ser mayor a 0.';
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
    const form: PropiedadForm = {
      nombre: raw.nombre ?? '',
      descripcion: raw.descripcion ?? '',
      ubicacion: raw.ubicacion ?? '',
      precio: raw.precio ?? 0,
      tipo: raw.tipo ?? 'venta',
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
