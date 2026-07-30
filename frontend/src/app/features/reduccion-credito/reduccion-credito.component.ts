import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { NotificationService } from '../../core/notifications/notification.service';
import { FooterComponent } from '../../layouts/footer/footer.component';
import { NavbarComponent } from '../../layouts/navbar/navbar.component';

type FormFieldName =
  | 'nombreCompleto'
  | 'numeroContacto'
  | 'entidadFinanciera'
  | 'motivoSolicitud'
  | 'saldoActual'
  | 'mensaje';

const REQUIRED_MESSAGES: Partial<Record<FormFieldName, string>> = {
  nombreCompleto: 'El nombre completo es obligatorio.',
  numeroContacto: 'El número de contacto es obligatorio.',
  entidadFinanciera: 'Indica la entidad financiera actual.',
  motivoSolicitud: 'Selecciona el motivo de tu solicitud.',
};

@Component({
  selector: 'app-reduccion-credito',
  standalone: true,
  imports: [ReactiveFormsModule, NgSelectModule, NavbarComponent, FooterComponent, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './reduccion-credito.component.html',
  styleUrl: './reduccion-credito.component.scss',
})
export class ReduccionCreditoComponent {
  private readonly fb = inject(FormBuilder);
  private readonly notif = inject(NotificationService);

  protected readonly motivoOptions = [
    { value: 'refinanciacion', label: 'Refinanciación' },
    { value: 'reestructuracion', label: 'Reestructuración de deuda' },
    { value: 'prepago_parcial', label: 'Prepago parcial' },
    { value: 'cambio_plazo', label: 'Cambio de plazo' },
    { value: 'otro', label: 'Otro' },
  ];

  protected readonly form = this.fb.group({
    nombreCompleto: ['', [Validators.required, Validators.maxLength(255)]],
    numeroContacto: ['', [Validators.required, Validators.pattern(/^[0-9+\s()-]{7,20}$/)]],
    entidadFinanciera: ['', [Validators.required, Validators.maxLength(255)]],
    motivoSolicitud: [null as string | null, Validators.required],
    saldoActual: ['', Validators.maxLength(255)],
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

    this.notif.success('Tu solicitud de reducción de crédito fue registrada correctamente.');
    this.form.reset();
  }
}
