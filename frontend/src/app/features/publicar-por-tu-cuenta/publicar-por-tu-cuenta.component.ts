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
  | 'tipoOperacion'
  | 'direccionInmueble'
  | 'observaciones';

const REQUIRED_MESSAGES: Partial<Record<FormFieldName, string>> = {
  nombreCompleto: 'El nombre completo es obligatorio.',
  numeroContacto: 'El número de contacto es obligatorio.',
  tipoOperacion: 'Selecciona el tipo de operación.',
  direccionInmueble: 'La dirección o el sector del inmueble es obligatorio.',
};

@Component({
  selector: 'app-publicar-por-tu-cuenta',
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
  templateUrl: './publicar-por-tu-cuenta.component.html',
  styleUrl: './publicar-por-tu-cuenta.component.scss',
})
export class PublicarPorTuCuentaComponent {
  private readonly fb = inject(FormBuilder);
  private readonly notif = inject(NotificationService);

  protected readonly tipoOperacionOptions = [
    { value: 'venta', label: 'Venta' },
    { value: 'arriendo', label: 'Arriendo' },
  ];

  protected readonly form = this.fb.group({
    nombreCompleto: ['', [Validators.required, Validators.maxLength(255)]],
    numeroContacto: ['', [Validators.required, Validators.pattern(/^[0-9+\s()-]{7,20}$/)]],
    tipoOperacion: [null as string | null, Validators.required],
    direccionInmueble: ['', [Validators.required, Validators.maxLength(255)]],
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

    this.notif.success('Tu solicitud fue registrada. Te contactaremos pronto.');
    this.form.reset();
  }
}
