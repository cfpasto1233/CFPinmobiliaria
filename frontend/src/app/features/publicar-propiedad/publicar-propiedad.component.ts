import { ChangeDetectionStrategy, Component, ElementRef, ViewChild, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { NotificationService } from '../../core/notifications/notification.service';
import { FooterComponent } from '../../layouts/footer/footer.component';
import { NavbarComponent } from '../../layouts/navbar/navbar.component';

interface PricingPlan {
  id: string;
  eyebrow: string;
  badge?: string;
  price: string;
  priceSuffix: string;
  features: string[];
  ctaLabel: string;
  highlighted: boolean;
}

type FormFieldName =
  | 'nombreCompleto'
  | 'numeroContacto'
  | 'tipoOperacion'
  | 'direccionInmueble'
  | 'sectorBarrio'
  | 'planInteres'
  | 'observaciones';

const REQUIRED_MESSAGES: Partial<Record<FormFieldName, string>> = {
  nombreCompleto: 'El nombre completo es obligatorio.',
  numeroContacto: 'El número de contacto es obligatorio.',
  tipoOperacion: 'Selecciona el tipo de operación.',
  direccionInmueble: 'La dirección del inmueble es obligatoria.',
  sectorBarrio: 'Indica el sector o barrio.',
  planInteres: 'Selecciona un plan.',
};

@Component({
  selector: 'app-publicar-propiedad',
  standalone: true,
  imports: [ReactiveFormsModule, NgSelectModule, NavbarComponent, FooterComponent, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './publicar-propiedad.component.html',
  styleUrl: './publicar-propiedad.component.scss',
})
export class PublicarPropiedadComponent {
  @ViewChild('formSection') private readonly formSection?: ElementRef<HTMLElement>;

  private readonly fb = inject(FormBuilder);
  private readonly notif = inject(NotificationService);

  protected readonly plans: readonly PricingPlan[] = [
    {
      id: 'fotos',
      eyebrow: 'Plan fotos',
      price: '$0',
      priceSuffix: 'primer mes',
      features: [
        'El propietario envía sus fotos',
        'Publicación en portal CFP',
        'Hasta 10 fotografías',
        'Descripción básica incluida',
        'Renovación mensual',
      ],
      ctaLabel: 'Comenzar gratis',
      highlighted: false,
    },
    {
      id: 'basico',
      eyebrow: 'Plan básico',
      badge: 'Más popular',
      price: '$150.000',
      priceSuffix: '/mes',
      features: [
        'CFP visita y fotografía la propiedad',
        'Revisión jurídica del inmueble',
        'Publicación en múltiples portales',
        'Hasta 25 fotografías profesionales',
        'Asesoría de precio de mercado',
        'Soporte por WhatsApp',
      ],
      ctaLabel: 'Publicar ahora',
      highlighted: true,
    },
    {
      id: 'estandar',
      eyebrow: 'Plan estándar',
      price: '$280.000',
      priceSuffix: '/mes',
      features: [
        'Todo lo del Plan Básico',
        'Video tour 360°',
        'Plano del inmueble incluido',
        'Publicidad en redes sociales',
        'Agente dedicado asignado',
        'Reporte quincenal de visitas',
      ],
      ctaLabel: 'Publicar ahora',
      highlighted: false,
    },
    {
      id: 'premium',
      eyebrow: 'Plan premium',
      price: '$480.000',
      priceSuffix: '/mes',
      features: [
        'Todo lo del Plan Estándar',
        'Fotografía aérea con dron',
        'Campaña pagada en redes',
        'Home staging virtual',
        'Prioridad en resultados de búsqueda',
        'Garantía de publicación 6 meses',
      ],
      ctaLabel: 'Publicar ahora',
      highlighted: false,
    },
  ];

  protected readonly planOptions = this.plans.map((plan) => ({ value: plan.id, label: plan.eyebrow }));

  protected readonly tipoOperacionOptions = [
    { value: 'venta', label: 'Venta' },
    { value: 'arriendo', label: 'Arriendo' },
  ];

  protected readonly form = this.fb.group({
    nombreCompleto: ['', [Validators.required, Validators.maxLength(255)]],
    numeroContacto: ['', [Validators.required, Validators.pattern(/^[0-9+\s()-]{7,20}$/)]],
    tipoOperacion: [null as string | null, Validators.required],
    direccionInmueble: ['', [Validators.required, Validators.maxLength(255)]],
    sectorBarrio: ['', [Validators.required, Validators.maxLength(255)]],
    planInteres: [null as string | null, Validators.required],
    observaciones: ['', Validators.maxLength(500)],
  });

  protected selectPlan(planId: string): void {
    this.form.controls.planInteres.setValue(planId);
    this.formSection?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

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

    this.notif.success('Tu solicitud de publicación fue registrada correctamente.');
    this.form.reset();
  }
}
