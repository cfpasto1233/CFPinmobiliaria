import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { Store } from '@ngrx/store';
import {
  CalendarDayViewComponent,
  CalendarEvent,
  CalendarEventTimesChangedEvent,
  CalendarMonthViewComponent,
  CalendarMonthViewDay,
  CalendarView,
  CalendarWeekViewComponent,
  DateAdapter,
  provideCalendar,
} from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import {
  addDays,
  addMonths,
  addWeeks,
  endOfDay,
  endOfMonth,
  endOfWeek,
  format,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import { es } from 'date-fns/locale';
import { CitaPublic } from '../../../../client';
import { CitasActions } from '../../../store/Citas/citas.actions';
import {
  selectCitasError,
  selectCitasItems,
  selectCitasLoading,
} from '../../../store/Citas/citas.selectors';
import { CitaFormModalComponent, CitaModalData } from './cita-form-modal/cita-form-modal.component';
import { colorForEstado } from './citas-event-color.util';

@Component({
  selector: 'app-citas-calendar',
  standalone: true,
  imports: [
    CalendarMonthViewComponent,
    CalendarWeekViewComponent,
    CalendarDayViewComponent,
    CitaFormModalComponent,
  ],
  providers: [provideCalendar({ provide: DateAdapter, useFactory: adapterFactory })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './citas-calendar.component.html',
  styleUrl: './citas-calendar.component.scss',
})
export class CitasCalendarComponent {
  private readonly store = inject(Store);

  protected readonly Vistas = CalendarView;

  protected readonly viewDate = signal(new Date());
  protected readonly view = signal<CalendarView>(CalendarView.Month);

  protected readonly items = this.store.selectSignal(selectCitasItems);
  protected readonly loading = this.store.selectSignal(selectCitasLoading);
  protected readonly error = this.store.selectSignal(selectCitasError);

  protected readonly modalState = signal<CitaModalData | null>(null);

  protected readonly events = computed<CalendarEvent<{ cita: CitaPublic }>[]>(() =>
    this.items().map((cita) => ({
      id: cita.id,
      start: new Date(cita.fecha_inicio),
      end: new Date(cita.fecha_fin),
      title: cita.nombre_contacto ? `${cita.titulo} — ${cita.nombre_contacto}` : cita.titulo,
      color: colorForEstado(cita.estado),
      meta: { cita },
      resizable: { beforeStart: true, afterEnd: true },
      draggable: cita.estado !== 'cancelada',
    })),
  );

  protected readonly tituloRango = computed(() => {
    const date = this.viewDate();
    switch (this.view()) {
      case CalendarView.Month:
        return format(date, 'MMMM yyyy', { locale: es });
      case CalendarView.Week: {
        const inicio = startOfWeek(date, { weekStartsOn: 1 });
        const fin = endOfWeek(date, { weekStartsOn: 1 });
        return `${format(inicio, 'd MMM', { locale: es })} – ${format(fin, 'd MMM yyyy', { locale: es })}`;
      }
      case CalendarView.Day:
        return format(date, "EEEE d 'de' MMMM 'de' yyyy", { locale: es });
    }
  });

  constructor() {
    effect(() => {
      const date = this.viewDate();
      const view = this.view();
      const { desde, hasta } = this.calcularRango(date, view);
      this.store.dispatch(
        CitasActions.load({ desde: desde.toISOString(), hasta: hasta.toISOString() }),
      );
    });
  }

  protected hoy(): void {
    this.viewDate.set(new Date());
  }

  protected anterior(): void {
    this.viewDate.update((date) => this.navegar(date, -1));
  }

  protected siguiente(): void {
    this.viewDate.update((date) => this.navegar(date, 1));
  }

  protected cambiarVista(view: CalendarView): void {
    this.view.set(view);
  }

  protected onDayClicked({ day }: { day: CalendarMonthViewDay }): void {
    this.abrirCrear(day.date);
  }

  protected onHourSegmentClicked({ date }: { date: Date }): void {
    this.abrirCrear(date);
  }

  protected onEventClicked({ event }: { event: CalendarEvent<{ cita: CitaPublic }> }): void {
    this.modalState.set({ mode: 'edit', cita: event.meta?.cita ?? null, fechaInicio: null });
  }

  protected onEventTimesChanged({
    event,
    newStart,
    newEnd,
  }: CalendarEventTimesChangedEvent<{ cita: CitaPublic }>): void {
    const cita = event.meta?.cita;
    if (!cita || !newEnd) return;
    this.store.dispatch(
      CitasActions.update({
        id: cita.id,
        form: { fecha_inicio: newStart.toISOString(), fecha_fin: newEnd.toISOString() },
      }),
    );
  }

  protected cerrarModal(): void {
    this.modalState.set(null);
  }

  private abrirCrear(fecha: Date): void {
    this.modalState.set({ mode: 'create', cita: null, fechaInicio: fecha });
  }

  private navegar(date: Date, direction: 1 | -1): Date {
    switch (this.view()) {
      case CalendarView.Month:
        return addMonths(date, direction);
      case CalendarView.Week:
        return addWeeks(date, direction);
      case CalendarView.Day:
        return addDays(date, direction);
    }
  }

  private calcularRango(date: Date, view: CalendarView): { desde: Date; hasta: Date } {
    switch (view) {
      case CalendarView.Month:
        return { desde: startOfMonth(date), hasta: endOfMonth(date) };
      case CalendarView.Week:
        return {
          desde: startOfWeek(date, { weekStartsOn: 1 }),
          hasta: endOfWeek(date, { weekStartsOn: 1 }),
        };
      case CalendarView.Day:
        return { desde: startOfDay(date), hasta: endOfDay(date) };
    }
  }
}
