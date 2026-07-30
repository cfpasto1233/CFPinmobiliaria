import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { NotificationService } from '../../core/notifications/notification.service';
import { FooterComponent } from '../../layouts/footer/footer.component';
import { NavbarComponent } from '../../layouts/navbar/navbar.component';
import { PublicarWhatsappFabComponent } from '../../shared/components/publicar-whatsapp-fab/publicar-whatsapp-fab.component';

type FormFieldName =
  | 'nombreCompleto'
  | 'numeroContacto'
  | 'tipoCredito'
  | 'valorInmueble'
  | 'ingresosMensuales'
  | 'mensaje';

const REQUIRED_MESSAGES: Partial<Record<FormFieldName, string>> = {
  nombreCompleto: 'El nombre completo es obligatorio.',
  numeroContacto: 'El número de contacto es obligatorio.',
  tipoCredito: 'Selecciona el tipo de crédito.',
  valorInmueble: 'Indica el valor aproximado del inmueble.',
};

@Component({
  selector: 'app-credito-hipotecario',
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
  templateUrl: './credito-hipotecario.component.html',
  styleUrl: './credito-hipotecario.component.scss',
})
export class CreditoHipotecarioComponent {
  private readonly fb = inject(FormBuilder);
  private readonly notif = inject(NotificationService);

  protected readonly tipoCreditoOptions = [
    { value: 'vivienda_nueva', label: 'Vivienda nueva' },
    { value: 'vivienda_usada', label: 'Vivienda usada' },
    { value: 'vivienda_vis', label: 'Vivienda VIS' },
    { value: 'leasing_habitacional', label: 'Leasing habitacional' },
    { value: 'otro', label: 'Otro' },
  ];

  protected readonly form = this.fb.group({
    nombreCompleto: ['', [Validators.required, Validators.maxLength(255)]],
    numeroContacto: ['', [Validators.required, Validators.pattern(/^[0-9+\s()-]{7,20}$/)]],
    tipoCredito: [null as string | null, Validators.required],
    valorInmueble: ['', [Validators.required, Validators.maxLength(255)]],
    ingresosMensuales: ['', Validators.maxLength(255)],
    mensaje: ['', Validators.maxLength(500)],
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

    this.notif.success('Tu solicitud de crédito hipotecario fue registrada correctamente.');
    this.form.reset();
  }
}
