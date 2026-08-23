import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { FooterComponent } from '../../layouts/footer/footer.component';
import { NavbarComponent } from '../../layouts/navbar/navbar.component';
import { PublicarWhatsappFabComponent } from '../../shared/components/publicar-whatsapp-fab/publicar-whatsapp-fab.component';
import { SolicitudesTrabajoActions } from '../../store/SolicitudesTrabajo/solicitudes-trabajo.actions';
import { selectSolicitudesTrabajoLoading } from '../../store/SolicitudesTrabajo/solicitudes-trabajo.selectors';

const ALLOWED_DOCUMENT_TYPES = ['application/pdf'];
const MAX_DOCUMENT_SIZE_BYTES = 10 * 1024 * 1024;

type FormFieldName = 'nombre' | 'correo' | 'numeroContacto';

const REQUIRED_MESSAGES: Record<FormFieldName, string> = {
  nombre: 'El nombre es obligatorio.',
  correo: 'El correo es obligatorio.',
  numeroContacto: 'El teléfono de contacto es obligatorio.',
};

@Component({
  selector: 'app-trabaja-con-nosotros',
  standalone: true,
  imports: [ReactiveFormsModule, NavbarComponent, FooterComponent, RouterLink, PublicarWhatsappFabComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './trabaja-con-nosotros.component.html',
  styleUrl: './trabaja-con-nosotros.component.scss',
})
export class TrabajaConNosotrosComponent {
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(Store);

  protected readonly submitting = this.store.selectSignal(selectSolicitudesTrabajoLoading);

  protected readonly form = this.fb.group({
    nombre: ['', [Validators.required, Validators.maxLength(255)]],
    correo: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
    numeroContacto: ['', [Validators.required, Validators.pattern(/^[0-9+\s()-]{7,20}$/)]],
  });

  protected readonly hojaDeVida = signal<File | null>(null);
  protected readonly hojaDeVidaError = signal<string | null>(null);

  protected fieldError(name: FormFieldName): string | null {
    const control = this.form.get(name);
    if (!control || !control.invalid || !(control.dirty || control.touched)) return null;
    if (control.hasError('required')) return REQUIRED_MESSAGES[name];
    if (control.hasError('email')) return 'Ingresa un correo válido.';
    if (control.hasError('maxlength')) return 'El texto es demasiado largo.';
    if (control.hasError('pattern')) return 'Ingresa un número de contacto válido.';
    return null;
  }

  protected onHojaDeVidaSeleccionada(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    input.value = '';
    if (!file) return;

    const validationError = this.validarDocumento(file);
    if (validationError) {
      this.hojaDeVidaError.set(validationError);
      return;
    }
    this.hojaDeVidaError.set(null);
    this.hojaDeVida.set(file);
  }

  protected quitarHojaDeVida(): void {
    this.hojaDeVida.set(null);
  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const hojaDeVida = this.hojaDeVida();
    if (!hojaDeVida) {
      this.hojaDeVidaError.set('Adjunta tu hoja de vida en PDF.');
      return;
    }

    const raw = this.form.getRawValue();
    this.store.dispatch(
      SolicitudesTrabajoActions.create({
        form: {
          nombre: raw.nombre ?? '',
          correo: raw.correo ?? '',
          numero_contacto: raw.numeroContacto ?? '',
        },
        hojaDeVida,
      }),
    );

    this.form.reset();
    this.hojaDeVida.set(null);
  }

  private validarDocumento(file: File): string | null {
    if (!ALLOWED_DOCUMENT_TYPES.includes(file.type)) {
      return 'La hoja de vida debe ser un archivo PDF.';
    }
    if (file.size > MAX_DOCUMENT_SIZE_BYTES) {
      return 'La hoja de vida debe pesar menos de 10 MB.';
    }
    return null;
  }
}
