import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { addMonths, eachDayOfInterval, endOfMonth, format, getDay, startOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import { CitaRecaudoForm, DisponibilidadDia } from '../../../client';
import { FooterComponent } from '../../layouts/footer/footer.component';
import { NavbarComponent } from '../../layouts/navbar/navbar.component';
import { PublicarWhatsappFabComponent } from '../../shared/components/publicar-whatsapp-fab/publicar-whatsapp-fab.component';
import { CitasActions } from '../../store/Citas/citas.actions';
import {
  selectCreandoRecaudo,
  selectDisponibilidadRecaudo,
} from '../../store/Citas/citas.selectors';

type HoraRecaudo = CitaRecaudoForm['hora'];

interface DiaCalendario {
  iso: string;
  numero: number;
  disponibilidad: DisponibilidadDia | null;
}

type FormFieldName = 'nombreCompleto' | 'numeroContacto' | 'direccionRecaudo' | 'observaciones';

const REQUIRED_MESSAGES: Partial<Record<FormFieldName, string>> = {
  nombreCompleto: 'El nombre completo es obligatorio.',
  numeroContacto: 'El número de contacto es obligatorio.',
  direccionRecaudo: 'La dirección de recaudo es obligatoria.',
};

@Component({
  selector: 'app-recaudo',
  standalone: true,
  imports: [ReactiveFormsModule, NavbarComponent, FooterComponent, RouterLink, PublicarWhatsappFabComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './recaudo.component.html',
  styleUrl: './recaudo.component.scss',
})
export class RecaudoComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(Store);

  protected readonly submitting = this.store.selectSignal(selectCreandoRecaudo);
  private readonly disponibilidad = this.store.selectSignal(selectDisponibilidadRecaudo);

  protected readonly mesOffset = signal<0 | 1>(0);
  protected readonly fechaSeleccionada = signal<string | null>(null);
  protected readonly horaSeleccionada = signal<HoraRecaudo | null>(null);

  private readonly disponibilidadPorFecha = computed(() => {
    const mapa = new Map<string, DisponibilidadDia>();
    for (const dia of this.disponibilidad()) {
      mapa.set(dia.fecha, dia);
    }
    return mapa;
  });

  protected readonly mesVisible = computed(() => addMonths(new Date(), this.mesOffset()));
  protected readonly etiquetaMes = computed(() =>
    format(this.mesVisible(), 'MMMM yyyy', { locale: es }),
  );

  protected readonly semanas = computed<(DiaCalendario | null)[][]>(() => {
    const inicioMes = startOfMonth(this.mesVisible());
    const finMes = endOfMonth(this.mesVisible());
    const mapa = this.disponibilidadPorFecha();

    const celdas: (DiaCalendario | null)[] = [];
    const offsetInicial = (getDay(inicioMes) + 6) % 7;
    for (let i = 0; i < offsetInicial; i++) celdas.push(null);

    for (const fecha of eachDayOfInterval({ start: inicioMes, end: finMes })) {
      const iso = format(fecha, 'yyyy-MM-dd');
      celdas.push({
        iso,
        numero: fecha.getDate(),
        disponibilidad: mapa.get(iso) ?? null,
      });
    }
    while (celdas.length % 7 !== 0) celdas.push(null);

    const semanas: (DiaCalendario | null)[][] = [];
    for (let i = 0; i < celdas.length; i += 7) {
      semanas.push(celdas.slice(i, i + 7));
    }
    return semanas;
  });

  protected readonly horasDelDiaSeleccionado = computed(() => {
    const iso = this.fechaSeleccionada();
    if (!iso) return [];
    return this.disponibilidadPorFecha().get(iso)?.horas_disponibles ?? [];
  });

  protected readonly form = this.fb.group({
    nombreCompleto: ['', [Validators.required, Validators.maxLength(255)]],
    numeroContacto: ['', [Validators.required, Validators.pattern(/^[0-9+\s()-]{7,20}$/)]],
    direccionRecaudo: ['', [Validators.required, Validators.maxLength(255)]],
    observaciones: ['', Validators.maxLength(500)],
  });

  ngOnInit(): void {
    this.cargarDisponibilidad();
  }

  protected fieldError(name: FormFieldName): string | null {
    const control = this.form.get(name);
    if (!control || !control.invalid || !(control.dirty || control.touched)) return null;
    if (control.hasError('required')) return REQUIRED_MESSAGES[name] ?? 'Este campo es obligatorio.';
    if (control.hasError('maxlength')) return 'El texto es demasiado largo.';
    if (control.hasError('pattern')) return 'Ingresa un número de contacto válido.';
    return null;
  }

  protected cambiarMes(delta: -1 | 1): void {
    const nuevo = this.mesOffset() + delta;
    if (nuevo < 0 || nuevo > 1) return;
    this.mesOffset.set(nuevo as 0 | 1);
    this.fechaSeleccionada.set(null);
    this.horaSeleccionada.set(null);
    this.cargarDisponibilidad();
  }

  protected seleccionarDia(dia: DiaCalendario | null): void {
    if (!dia?.disponibilidad?.horas_disponibles.length) return;
    this.fechaSeleccionada.set(dia.iso);
    this.horaSeleccionada.set(null);
  }

  protected seleccionarHora(hora: string): void {
    this.horaSeleccionada.set(hora as HoraRecaudo);
  }

  protected onSubmit(): void {
    const fecha = this.fechaSeleccionada();
    const hora = this.horaSeleccionada();
    if (this.form.invalid || !fecha || !hora) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    this.store.dispatch(
      CitasActions.crearRecaudo({
        form: {
          nombre_contacto: raw.nombreCompleto ?? '',
          telefono_contacto: raw.numeroContacto ?? '',
          direccion_recaudo: raw.direccionRecaudo ?? '',
          observaciones: raw.observaciones || undefined,
          fecha,
          hora,
        },
      }),
    );

    this.form.reset();
    this.fechaSeleccionada.set(null);
    this.horaSeleccionada.set(null);
  }

  private cargarDisponibilidad(): void {
    const inicioMes = startOfMonth(this.mesVisible());
    const finMes = endOfMonth(this.mesVisible());
    this.store.dispatch(
      CitasActions.loadDisponibilidadRecaudo({
        desde: format(inicioMes, 'yyyy-MM-dd'),
        hasta: format(finMes, 'yyyy-MM-dd'),
      }),
    );
  }
}
