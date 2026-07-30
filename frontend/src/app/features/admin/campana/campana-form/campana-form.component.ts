import { ChangeDetectionStrategy, Component, OnInit, effect, inject } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { CampanaForm } from '../../../../../client';
import { CampanaActions } from '../../../../store/Campana/campana.actions';
import {
  selectCampanaError,
  selectCampanaItem,
  selectCampanaLoading,
} from '../../../../store/Campana/campana.selectors';

type FormFieldName = 'nombre' | 'fecha_inicio' | 'fecha_fin' | 'descripcion_corta';

const REQUIRED_MESSAGES: Record<FormFieldName, string> = {
  nombre: 'El nombre de la campaña es obligatorio.',
  fecha_inicio: 'La fecha de inicio es obligatoria.',
  fecha_fin: 'La fecha de fin es obligatoria.',
  descripcion_corta: 'La descripción corta es obligatoria.',
};

function rangoFechasValidator(control: AbstractControl): ValidationErrors | null {
  const inicio = control.get('fecha_inicio')?.value;
  const fin = control.get('fecha_fin')?.value;
  if (inicio && fin && fin < inicio) {
    return { rangoInvalido: true };
  }
  return null;
}

@Component({
  selector: 'app-campana-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './campana-form.component.html',
  styleUrl: './campana-form.component.scss',
})
export class CampanaFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(Store);

  protected readonly loading = this.store.selectSignal(selectCampanaLoading);
  protected readonly error = this.store.selectSignal(selectCampanaError);
  protected readonly item = this.store.selectSignal(selectCampanaItem);

  protected readonly form = this.fb.group(
    {
      nombre: ['', [Validators.required, Validators.maxLength(255)]],
      fecha_inicio: ['', Validators.required],
      fecha_fin: ['', Validators.required],
      descripcion_corta: ['', Validators.required],
    },
    { validators: rangoFechasValidator },
  );

  constructor() {
    effect(() => {
      const campana = this.item();
      if (campana) {
        this.form.patchValue({
          nombre: campana.nombre,
          fecha_inicio: campana.fecha_inicio,
          fecha_fin: campana.fecha_fin,
          descripcion_corta: campana.descripcion_corta,
        });
      }
    });
  }

  ngOnInit(): void {
    this.store.dispatch(CampanaActions.load());
  }

  protected fieldError(name: FormFieldName): string | null {
    const control = this.form.get(name);
    if (!control || !control.invalid || !(control.dirty || control.touched)) return null;
    if (control.hasError('required')) return REQUIRED_MESSAGES[name];
    if (control.hasError('maxlength')) return 'Máximo 255 caracteres.';
    return null;
  }

  protected get rangoInvalido(): boolean {
    const fin = this.form.get('fecha_fin');
    return this.form.hasError('rangoInvalido') && !!(fin?.dirty || fin?.touched);
  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const form: CampanaForm = {
      nombre: raw.nombre ?? '',
      fecha_inicio: raw.fecha_inicio ?? '',
      fecha_fin: raw.fecha_fin ?? '',
      descripcion_corta: raw.descripcion_corta ?? '',
    };

    this.store.dispatch(CampanaActions.save({ form }));
  }
}
