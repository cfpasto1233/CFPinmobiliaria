import { ChangeDetectionStrategy, Component, ElementRef, OnInit, ViewChild, computed, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { Store } from '@ngrx/store';
import { NotificationService } from '../../core/notifications/notification.service';
import { FooterComponent } from '../../layouts/footer/footer.component';
import { NavbarComponent } from '../../layouts/navbar/navbar.component';
import { PropertyCardComponent } from '../../shared/components/property-card/property-card.component';
import { PropiedadesActions } from '../../store/Propiedades/propiedades.actions';
import { selectPropiedadesItems, selectPropiedadesLoading } from '../../store/Propiedades/propiedades.selectors';

type FormFieldName =
  | 'nombreCompleto'
  | 'numeroContacto'
  | 'sectorInteres'
  | 'precioMaximo'
  | 'medioContacto'
  | 'observaciones';

const REQUIRED_MESSAGES: Partial<Record<FormFieldName, string>> = {
  nombreCompleto: 'El nombre completo es obligatorio.',
  numeroContacto: 'El número de contacto es obligatorio.',
  sectorInteres: 'Indica el sector de interés.',
  precioMaximo: 'El precio máximo es obligatorio.',
  medioContacto: 'Selecciona un medio de contacto.',
};

@Component({
  selector: 'app-arrendar',
  standalone: true,
  imports: [ReactiveFormsModule, NgSelectModule, NavbarComponent, FooterComponent, RouterLink, PropertyCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './arrendar.component.html',
  styleUrl: './arrendar.component.scss',
})
export class ArrendarComponent implements OnInit {
  @ViewChild('carouselTrack') private readonly carouselTrack?: ElementRef<HTMLDivElement>;

  private readonly fb = inject(FormBuilder);
  private readonly notif = inject(NotificationService);
  private readonly store = inject(Store);

  protected readonly loading = this.store.selectSignal(selectPropiedadesLoading);
  private readonly items = this.store.selectSignal(selectPropiedadesItems);
  protected readonly propiedadesArriendo = computed(() =>
    this.items().filter((item) => item.tipo === 'arriendo'),
  );

  protected readonly medioContactoOptions = [
    { value: 'whatsapp', label: 'WhatsApp' },
    { value: 'llamada', label: 'Llamada telefónica' },
    { value: 'correo', label: 'Correo electrónico' },
  ];

  protected readonly form = this.fb.group({
    nombreCompleto: ['', [Validators.required, Validators.maxLength(255)]],
    numeroContacto: ['', [Validators.required, Validators.pattern(/^[0-9+\s()-]{7,20}$/)]],
    sectorInteres: ['', [Validators.required, Validators.maxLength(255)]],
    precioMaximo: ['', [Validators.required, Validators.maxLength(100)]],
    medioContacto: [null as string | null, Validators.required],
    observaciones: ['', Validators.maxLength(500)],
  });

  ngOnInit(): void {
    this.store.dispatch(PropiedadesActions.load());
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

    this.notif.success('Tu solicitud de arriendo fue registrada correctamente.');
    this.form.reset();
  }

  protected scrollCarousel(direction: 1 | -1): void {
    const el = this.carouselTrack?.nativeElement;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.9, behavior: 'smooth' });
  }
}
