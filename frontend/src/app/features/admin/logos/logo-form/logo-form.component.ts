import { ChangeDetectionStrategy, Component, OnInit, computed, effect, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { NgSelectModule } from '@ng-select/ng-select';
import { LogoForm, TipoLogo } from '../../../../store/Logos/logo-form.model';
import { LogosActions } from '../../../../store/Logos/logos.actions';
import {
  selectLogosError,
  selectLogosItems,
  selectLogosLoading,
} from '../../../../store/Logos/logos.selectors';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

@Component({
  selector: 'app-logo-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, NgSelectModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './logo-form.component.html',
  styleUrl: './logo-form.component.scss',
})
export class LogoFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(Store);
  private readonly route = inject(ActivatedRoute);

  protected readonly logoId = this.route.snapshot.paramMap.get('id');
  protected readonly isEditMode = !!this.logoId;

  protected readonly items = this.store.selectSignal(selectLogosItems);
  protected readonly loading = this.store.selectSignal(selectLogosLoading);
  protected readonly error = this.store.selectSignal(selectLogosError);

  protected readonly selected = computed(
    () => this.items().find((item) => item.id === this.logoId) ?? null,
  );

  protected readonly tipoOptions: { value: TipoLogo; label: string }[] = [
    { value: 'aliado', label: 'Aliado' },
    { value: 'inmobiliaria', label: 'Inmobiliaria' },
  ];

  protected readonly form = this.fb.group({
    nombre: ['', [Validators.required, Validators.maxLength(255)]],
    tipo: ['aliado' as TipoLogo, Validators.required],
  });

  protected readonly imagenFile = signal<File | null>(null);
  protected readonly imagenPreview = signal<string | null>(null);
  protected readonly imagenError = signal<string | null>(null);
  protected readonly imagenDragOver = signal(false);

  constructor() {
    effect(() => {
      const item = this.selected();
      if (item && this.isEditMode) {
        this.form.patchValue({
          nombre: item.nombre,
          tipo: item.tipo as TipoLogo,
        });
      }
    });
  }

  ngOnInit(): void {
    this.store.dispatch(LogosActions.load());
  }

  protected fieldError(name: 'nombre' | 'tipo'): string | null {
    const control = this.form.get(name);
    if (!control || !control.invalid || !(control.dirty || control.touched)) return null;
    if (control.hasError('required')) {
      return name === 'nombre' ? 'El nombre es obligatorio.' : 'Selecciona el tipo de logo.';
    }
    if (control.hasError('maxlength')) return 'Máximo 255 caracteres.';
    return null;
  }

  protected onImagenDragOver(event: DragEvent): void {
    event.preventDefault();
    this.imagenDragOver.set(true);
  }

  protected onImagenDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.imagenDragOver.set(false);
  }

  protected onImagenDrop(event: DragEvent): void {
    event.preventDefault();
    this.imagenDragOver.set(false);
    this.handleImagen(event.dataTransfer?.files?.[0] ?? null);
  }

  protected onImagenSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.handleImagen(input.files?.[0] ?? null);
    input.value = '';
  }

  protected onRemoveImagenSeleccionada(): void {
    this.imagenFile.set(null);
    this.imagenPreview.set(null);
    this.imagenError.set(null);
  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();

    if (this.isEditMode && this.logoId) {
      this.store.dispatch(
        LogosActions.update({ id: this.logoId, changes: { nombre: raw.nombre, tipo: raw.tipo } }),
      );
      return;
    }

    if (!this.imagenFile()) {
      this.imagenError.set('La imagen del logo es obligatoria.');
      return;
    }

    const form: LogoForm = { nombre: raw.nombre ?? '', tipo: raw.tipo ?? 'aliado' };
    this.store.dispatch(LogosActions.create({ form, imagen: this.imagenFile()! }));
  }

  private handleImagen(file: File | null): void {
    if (!file) return;

    const validationError = this.validateImagen(file);
    if (validationError) {
      this.imagenError.set(validationError);
      return;
    }
    this.imagenError.set(null);

    if (this.isEditMode && this.logoId) {
      this.store.dispatch(LogosActions.replaceImagen({ logoId: this.logoId, file }));
      return;
    }

    this.imagenFile.set(file);
    this.imagenPreview.set(URL.createObjectURL(file));
  }

  private validateImagen(file: File): string | null {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return 'Formato no soportado. Usa JPEG, PNG o WEBP.';
    }
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      return 'La imagen supera el tamaño máximo permitido (5 MB).';
    }
    return null;
  }
}
