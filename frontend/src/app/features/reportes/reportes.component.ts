import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { NotificationService } from '../../core/notifications/notification.service';
import { FooterComponent } from '../../layouts/footer/footer.component';
import { NavbarComponent } from '../../layouts/navbar/navbar.component';

type FormFieldName =
  | 'nombreCompleto'
  | 'contacto'
  | 'tipoReporte'
  | 'periodo'
  | 'mensaje';

const REQUIRED_MESSAGES: Partial<Record<FormFieldName, string>> = {
  nombreCompleto: 'El nombre completo es obligatorio.',
  contacto: 'El correo o celular de contacto es obligatorio.',
  tipoReporte: 'Selecciona el tipo de reporte.',
};

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [ReactiveFormsModule, NgSelectModule, NavbarComponent, FooterComponent, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './reportes.component.html',
  styleUrl: './reportes.component.scss',
})
export class ReportesComponent {
  private readonly fb = inject(FormBuilder);
  private readonly notif = inject(NotificationService);

  protected readonly tipoReporteOptions = [
    { value: 'estado_cuenta', label: 'Estado de cuenta' },
    { value: 'certificado_pagos', label: 'Certificado de pagos' },
    { value: 'historial_pagos', label: 'Historial de pagos' },
    { value: 'reporte_administracion', label: 'Reporte de administración' },
    { value: 'otro', label: 'Otro' },
  ];

  protected readonly form = this.fb.group({
    nombreCompleto: ['', [Validators.required, Validators.maxLength(255)]],
    contacto: ['', [Validators.required, Validators.maxLength(255)]],
    tipoReporte: [null as string | null, Validators.required],
    periodo: ['', Validators.maxLength(100)],
    mensaje: ['', Validators.maxLength(500)],
  });

  protected fieldError(name: FormFieldName): string | null {
    const control = this.form.get(name);
    if (!control || !control.invalid || !(control.dirty || control.touched)) return null;
    if (control.hasError('required')) return REQUIRED_MESSAGES[name] ?? 'Este campo es obligatorio.';
    if (control.hasError('maxlength')) return 'El texto es demasiado largo.';
    return null;
  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.notif.success('Tu solicitud de reporte fue registrada correctamente.');
    this.form.reset();
  }
}
