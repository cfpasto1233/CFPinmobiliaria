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
  | 'celular'
  | 'sectoresInteres'
  | 'presupuestoTotal'
  | 'formaPago'
  | 'valorDisponibleCredito';

const REQUIRED_MESSAGES: Record<FormFieldName, string> = {
  nombreCompleto: 'El nombre completo es obligatorio.',
  celular: 'El celular es obligatorio.',
  sectoresInteres: 'Indica los sectores de interés.',
  presupuestoTotal: 'El presupuesto total es obligatorio.',
  formaPago: 'Selecciona una forma de pago.',
  valorDisponibleCredito: 'Indica el valor disponible a crédito.',
};

@Component({
  selector: 'app-ventas',
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
  templateUrl: './ventas.component.html',
  styleUrl: './ventas.component.scss',
})
export class VentasComponent {
  private readonly fb = inject(FormBuilder);
  private readonly notif = inject(NotificationService);

  protected readonly formaPagoOptions = [
    { value: 'contado', label: 'Contado' },
    { value: 'credito_hipotecario', label: 'Crédito hipotecario' },
    { value: 'leasing_habitacional', label: 'Leasing habitacional' },
    { value: 'recursos_propios', label: 'Recursos propios' },
    { value: 'combinado', label: 'Combinado (crédito + recursos propios)' },
  ];

  protected readonly form = this.fb.group({
    nombreCompleto: ['', [Validators.required, Validators.maxLength(255)]],
    celular: ['', [Validators.required, Validators.pattern(/^[0-9+\s()-]{7,20}$/)]],
    sectoresInteres: ['', [Validators.required, Validators.maxLength(255)]],
    presupuestoTotal: ['', [Validators.required, Validators.maxLength(100)]],
    formaPago: [null as string | null, Validators.required],
    valorDisponibleCredito: ['', [Validators.required, Validators.maxLength(100)]],
  });

  protected fieldError(name: FormFieldName): string | null {
    const control = this.form.get(name);
    if (!control || !control.invalid || !(control.dirty || control.touched)) return null;
    if (control.hasError('required')) return REQUIRED_MESSAGES[name];
    if (control.hasError('maxlength')) return 'Máximo 255 caracteres.';
    if (control.hasError('pattern')) return 'Ingresa un número de celular válido.';
    return null;
  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.notif.success('Datos del comprador registrados correctamente.');
    this.form.reset();
  }
}
