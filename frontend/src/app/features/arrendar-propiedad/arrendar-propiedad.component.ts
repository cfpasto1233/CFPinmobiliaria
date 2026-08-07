import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { Store } from '@ngrx/store';
import { FooterComponent } from '../../layouts/footer/footer.component';
import { NavbarComponent } from '../../layouts/navbar/navbar.component';
import { PublicarWhatsappFabComponent } from '../../shared/components/publicar-whatsapp-fab/publicar-whatsapp-fab.component';
import { SolicitudesArrendarPropiedadActions } from '../../store/SolicitudesArrendarPropiedad/solicitudes-arrendar-propiedad.actions';
import { selectSolicitudesArrendarPropiedadLoading } from '../../store/SolicitudesArrendarPropiedad/solicitudes-arrendar-propiedad.selectors';

type MedioComunicacion = 'whatsapp' | 'llamada' | 'correo';

type FormFieldName =
  | 'nombrePropietario'
  | 'medioComunicacion'
  | 'numeroContacto'
  | 'direccionInmueble'
  | 'precioEstimado'
  | 'observaciones';

const REQUIRED_MESSAGES: Partial<Record<FormFieldName, string>> = {
  nombrePropietario: 'El nombre completo es obligatorio.',
  medioComunicacion: 'Selecciona un medio de comunicación.',
  numeroContacto: 'El número de contacto es obligatorio.',
  direccionInmueble: 'La dirección del inmueble es obligatoria.',
  precioEstimado: 'El precio estimado es obligatorio.',
};

@Component({
  selector: 'app-arrendar-propiedad',
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
  templateUrl: './arrendar-propiedad.component.html',
  styleUrl: './arrendar-propiedad.component.scss',
})
export class ArrendarPropiedadComponent {
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(Store);

  protected readonly submitting = this.store.selectSignal(
    selectSolicitudesArrendarPropiedadLoading,
  );

  protected readonly medioComunicacionOptions: { value: MedioComunicacion; label: string }[] = [
    { value: 'whatsapp', label: 'WhatsApp' },
    { value: 'llamada', label: 'Llamada telefónica' },
    { value: 'correo', label: 'Correo electrónico' },
  ];

  protected readonly form = this.fb.group({
    nombrePropietario: ['', [Validators.required, Validators.maxLength(255)]],
    medioComunicacion: [null as MedioComunicacion | null, Validators.required],
    numeroContacto: ['', [Validators.required, Validators.pattern(/^[0-9+\s()-]{7,20}$/)]],
    direccionInmueble: ['', [Validators.required, Validators.maxLength(255)]],
    precioEstimado: ['', [Validators.required, Validators.maxLength(100)]],
    descripcionCaracteristicas: ['', Validators.maxLength(1000)],
    observaciones: ['', Validators.maxLength(500)],
  });

  protected fieldError(name: FormFieldName): string | null {
    const control = this.form.get(name);
    if (!control || !control.invalid || !(control.dirty || control.touched)) return null;
    if (control.hasError('required')) return REQUIRED_MESSAGES[name] ?? 'Este campo es obligatorio.';
    if (control.hasError('maxlength')) return 'El texto es demasiado largo.';
    if (control.hasError('pattern')) return 'Ingresa un número de contacto válido.';
    return null;
  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    this.store.dispatch(
      SolicitudesArrendarPropiedadActions.create({
        form: {
          nombre_propietario: raw.nombrePropietario ?? '',
          medio_comunicacion: raw.medioComunicacion ?? 'whatsapp',
          numero_contacto: raw.numeroContacto ?? '',
          direccion_inmueble: raw.direccionInmueble ?? '',
          precio_estimado: raw.precioEstimado ?? '',
          descripcion_caracteristicas: raw.descripcionCaracteristicas || undefined,
          observaciones: raw.observaciones || undefined,
        },
      }),
    );

    this.form.reset();
  }
}
