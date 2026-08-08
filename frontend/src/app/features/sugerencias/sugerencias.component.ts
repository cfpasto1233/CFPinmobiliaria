import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { Store } from '@ngrx/store';
import { FooterComponent } from '../../layouts/footer/footer.component';
import { NavbarComponent } from '../../layouts/navbar/navbar.component';
import { PublicarWhatsappFabComponent } from '../../shared/components/publicar-whatsapp-fab/publicar-whatsapp-fab.component';
import { SolicitudesSugerenciasActions } from '../../store/SolicitudesSugerencias/solicitudes-sugerencias.actions';
import { selectSolicitudesSugerenciasLoading } from '../../store/SolicitudesSugerencias/solicitudes-sugerencias.selectors';

type MedioComunicacionSugerencia = 'whatsapp' | 'llamada';

type FormFieldName = 'nombre' | 'medioComunicacion' | 'numeroContacto' | 'sugerencia' | 'deseaContacto';

const REQUIRED_MESSAGES: Record<FormFieldName, string> = {
  nombre: 'El nombre es obligatorio.',
  medioComunicacion: 'Selecciona un medio de comunicación.',
  numeroContacto: 'El número de contacto es obligatorio.',
  sugerencia: 'Cuéntanos tu sugerencia.',
  deseaContacto: 'Indica si deseas que te contactemos.',
};

@Component({
  selector: 'app-sugerencias',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgSelectModule,
    NavbarComponent,
    FooterComponent,
    RouterLink,
    PublicarWhatsappFabComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './sugerencias.component.html',
  styleUrl: './sugerencias.component.scss',
})
export class SugerenciasComponent {
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(Store);

  protected readonly submitting = this.store.selectSignal(selectSolicitudesSugerenciasLoading);

  protected readonly medioComunicacionOptions: { value: MedioComunicacionSugerencia; label: string }[] = [
    { value: 'whatsapp', label: 'WhatsApp' },
    { value: 'llamada', label: 'Llamada telefónica' },
  ];

  protected readonly form = this.fb.group({
    nombre: ['', [Validators.required, Validators.maxLength(255)]],
    medioComunicacion: [null as MedioComunicacionSugerencia | null, Validators.required],
    numeroContacto: ['', [Validators.required, Validators.pattern(/^[0-9+\s()-]{7,20}$/)]],
    sugerencia: ['', [Validators.required, Validators.maxLength(2000)]],
    deseaContacto: [null as boolean | null, Validators.required],
  });

  protected fieldError(name: FormFieldName): string | null {
    const control = this.form.get(name);
    if (!control || !control.invalid || !(control.dirty || control.touched)) return null;
    if (control.hasError('required')) return REQUIRED_MESSAGES[name];
    if (control.hasError('maxlength')) return 'El texto es demasiado largo.';
    if (control.hasError('pattern')) return 'Ingresa un número de contacto válido.';
    return null;
  }

  protected setDeseaContacto(value: boolean): void {
    this.form.get('deseaContacto')?.setValue(value);
    this.form.get('deseaContacto')?.markAsTouched();
  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    this.store.dispatch(
      SolicitudesSugerenciasActions.create({
        form: {
          nombre: raw.nombre ?? '',
          medio_comunicacion: raw.medioComunicacion ?? 'whatsapp',
          numero_contacto: raw.numeroContacto ?? '',
          sugerencia: raw.sugerencia ?? '',
          desea_contacto: raw.deseaContacto ?? false,
        },
      }),
    );

    this.form.reset();
  }
}
