import { ChangeDetectionStrategy, Component, ElementRef, OnInit, ViewChild, computed, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { Store } from '@ngrx/store';
import { FooterComponent } from '../../layouts/footer/footer.component';
import { NavbarComponent } from '../../layouts/navbar/navbar.component';
import { PropertyCardComponent } from '../../shared/components/property-card/property-card.component';
import { PublicarWhatsappFabComponent } from '../../shared/components/publicar-whatsapp-fab/publicar-whatsapp-fab.component';
import { PropiedadesActions } from '../../store/Propiedades/propiedades.actions';
import { selectPropiedadesItems, selectPropiedadesLoading } from '../../store/Propiedades/propiedades.selectors';
import { SolicitudesVentaActions } from '../../store/SolicitudesVenta/solicitudes-venta.actions';
import { selectSolicitudesVentaLoading } from '../../store/SolicitudesVenta/solicitudes-venta.selectors';

type MedioComunicacion = 'whatsapp' | 'llamada';
type FormaPagoVenta = 'contado' | 'credito_hipotecario' | 'otros';

type FormFieldName =
  | 'nombreCompleto'
  | 'medioComunicacion'
  | 'numero'
  | 'presupuestoTotal'
  | 'formaPago'
  | 'sectoresInteres'
  | 'valorDisponibleCredito'
  | 'valorDisponibleContado'
  | 'formaPagoOtro';

const REQUIRED_MESSAGES: Record<FormFieldName, string> = {
  nombreCompleto: 'El nombre completo es obligatorio.',
  medioComunicacion: 'Selecciona un medio de comunicación.',
  numero: 'El número de contacto es obligatorio.',
  presupuestoTotal: 'El presupuesto total es obligatorio.',
  formaPago: 'Selecciona una forma de pago.',
  sectoresInteres: 'Indica los sectores de interés.',
  valorDisponibleCredito: 'Indica el valor disponible a crédito.',
  valorDisponibleContado: 'Indica el valor disponible de contado (usa 0 si es todo a crédito).',
  formaPagoOtro: 'Describe la forma de pago.',
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
    PropertyCardComponent,
    PublicarWhatsappFabComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './ventas.component.html',
  styleUrl: './ventas.component.scss',
})
export class VentasComponent implements OnInit {
  @ViewChild('carouselTrack') private readonly carouselTrack?: ElementRef<HTMLDivElement>;

  private readonly fb = inject(FormBuilder);
  private readonly store = inject(Store);

  protected readonly loading = this.store.selectSignal(selectPropiedadesLoading);
  private readonly items = this.store.selectSignal(selectPropiedadesItems);
  protected readonly propiedadesVenta = computed(() => this.items().filter((item) => item.tipo === 'venta'));

  protected readonly submitting = this.store.selectSignal(selectSolicitudesVentaLoading);

  protected readonly medioComunicacionOptions: { value: MedioComunicacion; label: string }[] = [
    { value: 'whatsapp', label: 'WhatsApp' },
    { value: 'llamada', label: 'Llamada' },
  ];

  protected readonly formaPagoOptions: { value: FormaPagoVenta; label: string }[] = [
    { value: 'contado', label: 'De contado' },
    { value: 'credito_hipotecario', label: 'Crédito hipotecario' },
    { value: 'otros', label: 'Otra forma de pago' },
  ];

  protected readonly form = this.fb.group({
    nombreCompleto: ['', [Validators.required, Validators.maxLength(255)]],
    medioComunicacion: [null as MedioComunicacion | null, Validators.required],
    presupuestoTotal: ['', [Validators.required, Validators.maxLength(100)]],
    formaPago: [null as FormaPagoVenta | null, Validators.required],
    valorDisponibleCredito: ['', Validators.maxLength(100)],
    valorDisponibleContado: ['', Validators.maxLength(100)],
    formaPagoOtro: [''],
    numero: ['', [Validators.required, Validators.maxLength(20)]],
    sectoresInteres: ['', [Validators.required, Validators.maxLength(255)]],
    sugerencias: [''],
  });

  ngOnInit(): void {
    this.store.dispatch(PropiedadesActions.load());

    this.form.controls.formaPago.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((formaPago) => this.onFormaPagoChange(formaPago));
  }

  protected fieldError(name: FormFieldName): string | null {
    const control = this.form.get(name);
    if (!control || !control.invalid || !(control.dirty || control.touched)) return null;
    if (control.hasError('required')) return REQUIRED_MESSAGES[name];
    if (control.hasError('maxlength')) return 'El texto es demasiado largo.';
    return null;
  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    this.store.dispatch(
      SolicitudesVentaActions.create({
        form: {
          nombre_completo: raw.nombreCompleto ?? '',
          medio_comunicacion: raw.medioComunicacion ?? 'whatsapp',
          numero: raw.numero ?? '',
          presupuesto_total: raw.presupuestoTotal ?? '',
          forma_pago: raw.formaPago ?? 'contado',
          sectores_interes: raw.sectoresInteres ?? '',
          valor_disponible_credito: raw.valorDisponibleCredito || undefined,
          valor_disponible_contado: raw.valorDisponibleContado || undefined,
          forma_pago_otro: raw.formaPagoOtro || undefined,
          sugerencias: raw.sugerencias || undefined,
        },
      }),
    );

    this.form.reset();
    this.onFormaPagoChange(null);
  }

  protected scrollCarousel(direction: 1 | -1): void {
    const el = this.carouselTrack?.nativeElement;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.9, behavior: 'smooth' });
  }

  private onFormaPagoChange(formaPago: FormaPagoVenta | null): void {
    const valorDisponibleCredito = this.form.controls.valorDisponibleCredito;
    const valorDisponibleContado = this.form.controls.valorDisponibleContado;
    const formaPagoOtro = this.form.controls.formaPagoOtro;

    valorDisponibleCredito.clearValidators();
    valorDisponibleContado.clearValidators();
    formaPagoOtro.clearValidators();

    valorDisponibleCredito.setValue('');
    valorDisponibleContado.setValue('');
    formaPagoOtro.setValue('');

    if (formaPago === 'credito_hipotecario') {
      valorDisponibleCredito.setValidators([Validators.required, Validators.maxLength(100)]);
      valorDisponibleContado.setValidators([Validators.required, Validators.maxLength(100)]);
    } else if (formaPago === 'otros') {
      formaPagoOtro.setValidators([Validators.required]);
    }

    valorDisponibleCredito.updateValueAndValidity();
    valorDisponibleContado.updateValueAndValidity();
    formaPagoOtro.updateValueAndValidity();
  }
}
