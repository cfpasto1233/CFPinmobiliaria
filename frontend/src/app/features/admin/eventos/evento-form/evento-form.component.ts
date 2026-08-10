import { ChangeDetectionStrategy, Component, OnInit, effect, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { EventoForm } from '../../../../store/Eventos/evento-form.model';
import { EventosActions } from '../../../../store/Eventos/eventos.actions';
import {
  selectEventoSelected,
  selectEventosError,
  selectEventosLoading,
} from '../../../../store/Eventos/eventos.selectors';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

type FormFieldName = 'nombre' | 'descripcion' | 'fecha';

const REQUIRED_MESSAGES: Record<FormFieldName, string> = {
  nombre: 'El nombre es obligatorio.',
  descripcion: 'La descripción es obligatoria.',
  fecha: 'La fecha es obligatoria.',
};

@Component({
  selector: 'app-evento-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './evento-form.component.html',
  styleUrl: './evento-form.component.scss',
})
export class EventoFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(Store);
  private readonly route = inject(ActivatedRoute);

  protected readonly eventoId = this.route.snapshot.paramMap.get('id');
  protected readonly isEditMode = !!this.eventoId;

  protected readonly loading = this.store.selectSignal(selectEventosLoading);
  protected readonly error = this.store.selectSignal(selectEventosError);
  protected readonly selected = this.store.selectSignal(selectEventoSelected);

  protected readonly form = this.fb.group({
    nombre: ['', [Validators.required, Validators.maxLength(255)]],
    descripcion: ['', Validators.required],
    fecha: ['', Validators.required],
  });

  protected readonly fotoFile = signal<File | null>(null);
  protected readonly fotoPreview = signal<string | null>(null);
  protected readonly fotoError = signal<string | null>(null);
  protected readonly fotoDragOver = signal(false);

  constructor() {
    effect(() => {
      const item = this.selected();
      if (item && this.isEditMode) {
        this.form.patchValue({
          nombre: item.nombre,
          descripcion: item.descripcion,
          fecha: item.fecha,
        });
      }
    });
  }

  ngOnInit(): void {
    if (this.eventoId) {
      this.store.dispatch(EventosActions.loadOne({ id: this.eventoId }));
    }
  }

  protected fieldError(name: FormFieldName): string | null {
    const control = this.form.get(name);
    if (!control || !control.invalid || !(control.dirty || control.touched)) return null;
    if (control.hasError('required')) return REQUIRED_MESSAGES[name];
    if (control.hasError('maxlength')) return 'Máximo 255 caracteres.';
    return null;
  }

  protected onFotoDragOver(event: DragEvent): void {
    event.preventDefault();
    this.fotoDragOver.set(true);
  }

  protected onFotoDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.fotoDragOver.set(false);
  }

  protected onFotoDrop(event: DragEvent): void {
    event.preventDefault();
    this.fotoDragOver.set(false);
    this.handleFoto(event.dataTransfer?.files?.[0] ?? null);
  }

  protected onFotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.handleFoto(input.files?.[0] ?? null);
    input.value = '';
  }

  protected onRemoveFotoSeleccionada(): void {
    this.fotoFile.set(null);
    this.fotoPreview.set(null);
    this.fotoError.set(null);
  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const form: EventoForm = {
      nombre: raw.nombre ?? '',
      descripcion: raw.descripcion ?? '',
      fecha: raw.fecha ?? '',
    };

    if (this.isEditMode && this.eventoId) {
      this.store.dispatch(EventosActions.update({ id: this.eventoId, changes: form }));
      return;
    }

    if (!this.fotoFile()) {
      this.fotoError.set('La foto es obligatoria.');
      return;
    }

    this.store.dispatch(EventosActions.create({ form, foto: this.fotoFile()! }));
  }

  private handleFoto(file: File | null): void {
    if (!file) return;

    const validationError = this.validateImage(file);
    if (validationError) {
      this.fotoError.set(validationError);
      return;
    }
    this.fotoError.set(null);

    if (this.isEditMode && this.eventoId) {
      this.store.dispatch(EventosActions.replaceFoto({ eventoId: this.eventoId, file }));
      return;
    }

    this.fotoFile.set(file);
    this.fotoPreview.set(URL.createObjectURL(file));
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
