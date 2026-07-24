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

  protected onFotoPrincipalSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const validationError = this.validateImage(file);
    if (validationError) {
      this.fotoPrincipalError.set(validationError);
      input.value = '';
      return;
    }
    this.fotoPrincipalError.set(null);

    if (this.isEditMode && this.propiedadId) {
      this.store.dispatch(PropiedadesActions.replaceFotoPrincipal({ propiedadId: this.propiedadId, file }));
      input.value = '';
      return;
    }

    this.fotoPrincipalFile.set(file);
    this.fotoPrincipalPreview.set(URL.createObjectURL(file));
  }

  protected onFotosAdicionalesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files;
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
    input.value = '';
  }

  protected onRemoveFoto(fotoId: string): void {
    if (!this.propiedadId) return;
    if (!confirm('¿Eliminar esta foto?')) return;
    this.store.dispatch(PropiedadesActions.removeFoto({ propiedadId: this.propiedadId, fotoId }));
  }

  protected onSubmit(): void {
    if (this.form.invalid) return;

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
