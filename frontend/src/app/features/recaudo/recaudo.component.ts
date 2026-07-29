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
  | 'tipoCliente'
  | 'referenciaInmueble'
  | 'motivoSolicitud'
  | 'mensaje';

const REQUIRED_MESSAGES: Partial<Record<FormFieldName, string>> = {
  nombreCompleto: 'El nombre completo es obligatorio.',
  numeroContacto: 'El número de contacto es obligatorio.',
  tipoCliente: 'Selecciona el tipo de cliente.',
  referenciaInmueble: 'Indica el inmueble o número de contrato.',
  motivoSolicitud: 'Selecciona el motivo de tu solicitud.',
};

@Component({
  selector: 'app-recaudo',
  standalone: true,
  imports: [ReactiveFormsModule, NgSelectModule, NavbarComponent, FooterComponent, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './recaudo.component.html',
  styleUrl: './recaudo.component.scss',
})
export class RecaudoComponent {
  private readonly fb = inject(FormBuilder);
  private readonly notif = inject(NotificationService);

  protected readonly tipoClienteOptions = [
    { value: 'propietario', label: 'Propietario' },
    { value: 'arrendatario', label: 'Arrendatario' },
  ];

  protected readonly motivoOptions = [
    { value: 'estado_cuenta', label: 'Consultar estado de cuenta' },
    { value: 'reportar_pago', label: 'Reportar un pago' },
    { value: 'certificado_pagos', label: 'Solicitar certificado de pagos' },
    { value: 'actualizar_datos_pago', label: 'Actualizar datos de pago' },
    { value: 'otro', label: 'Otro' },
  ];

  protected readonly form = this.fb.group({
    nombreCompleto: ['', [Validators.required, Validators.maxLength(255)]],
    numeroContacto: ['', [Validators.required, Validators.pattern(/^[0-9+\s()-]{7,20}$/)]],
    tipoCliente: [null as string | null, Validators.required],
    referenciaInmueble: ['', [Validators.required, Validators.maxLength(255)]],
    motivoSolicitud: [null as string | null, Validators.required],
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

    this.notif.success('Tu solicitud de recaudo fue registrada correctamente.');
    this.form.reset();
  }
}
