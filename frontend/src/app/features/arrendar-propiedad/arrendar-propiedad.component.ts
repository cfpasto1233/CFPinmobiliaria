import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NotificationService } from '../../core/notifications/notification.service';
import { FooterComponent } from '../../layouts/footer/footer.component';
import { NavbarComponent } from '../../layouts/navbar/navbar.component';
import { PublicarWhatsappFabComponent } from '../../shared/components/publicar-whatsapp-fab/publicar-whatsapp-fab.component';

type FormFieldName =
  | 'nombrePropietario'
  | 'numeroContacto'
  | 'direccionInmueble'
  | 'sectorBarrio'
  | 'canonEsperado'
  | 'observaciones';

const REQUIRED_MESSAGES: Partial<Record<FormFieldName, string>> = {
  nombrePropietario: 'El nombre del propietario es obligatorio.',
  numeroContacto: 'El número de contacto es obligatorio.',
  direccionInmueble: 'La dirección del inmueble es obligatoria.',
  sectorBarrio: 'Indica el sector o barrio.',
  canonEsperado: 'El canon esperado es obligatorio.',
};

@Component({
  selector: 'app-arrendar-propiedad',
  standalone: true,
  imports: [ReactiveFormsModule, NavbarComponent, FooterComponent, RouterLink, PublicarWhatsappFabComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './arrendar-propiedad.component.html',
  styleUrl: './arrendar-propiedad.component.scss',
})
export class ArrendarPropiedadComponent {
  private readonly fb = inject(FormBuilder);
  private readonly notif = inject(NotificationService);

  protected readonly form = this.fb.group({
    nombrePropietario: ['', [Validators.required, Validators.maxLength(255)]],
    numeroContacto: ['', [Validators.required, Validators.pattern(/^[0-9+\s()-]{7,20}$/)]],
    direccionInmueble: ['', [Validators.required, Validators.maxLength(255)]],
    sectorBarrio: ['', [Validators.required, Validators.maxLength(255)]],
    canonEsperado: ['', [Validators.required, Validators.maxLength(100)]],
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

    this.notif.success('Los datos de tu propiedad fueron registrados correctamente.');
    this.form.reset();
  }
}
