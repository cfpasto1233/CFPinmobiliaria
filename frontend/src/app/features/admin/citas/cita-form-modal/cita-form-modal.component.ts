import { ChangeDetectionStrategy, Component, HostListener, OnDestroy, OnInit, computed, effect, inject, input, output } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import { NgSelectModule } from '@ng-select/ng-select';
import { format } from 'date-fns';
import { CitaForm, CitaPublic, CitaUpdate } from '../../../../../client';
import { CitasActions } from '../../../../store/Citas/citas.actions';
import { SolicitudesArriendoActions } from '../../../../store/SolicitudesArriendo/solicitudes-arriendo.actions';
import { selectSolicitudesArriendoItems } from '../../../../store/SolicitudesArriendo/solicitudes-arriendo.selectors';
import { SolicitudesVentaActions } from '../../../../store/SolicitudesVenta/solicitudes-venta.actions';
import { selectSolicitudesVentaItems } from '../../../../store/SolicitudesVenta/solicitudes-venta.selectors';
import { labelForEstado } from '../citas-event-color.util';

export interface CitaModalData {
  mode: 'create' | 'edit';
  cita: CitaPublic | null;
  fechaInicio: Date | null;
}

type VinculoTipo = 'ninguno' | 'venta' | 'arriendo';

type FormFieldName = 'titulo' | 'fecha' | 'horaInicio' | 'horaFin' | 'estado';

const REQUIRED_MESSAGES: Record<FormFieldName, string> = {
  titulo: 'El título es obligatorio.',
  fecha: 'La fecha es obligatoria.',
  horaInicio: 'La hora de inicio es obligatoria.',
  horaFin: 'La hora de fin es obligatoria.',
  estado: 'El estado es obligatorio.',
};

const ESTADO_OPTIONS = ['pendiente', 'confirmada', 'cancelada', 'completada'].map((value) => ({
  value,
  label: labelForEstado(value),
}));

const VINCULO_OPTIONS: { value: VinculoTipo; label: string }[] = [
  { value: 'ninguno', label: 'Ninguno' },
  { value: 'venta', label: 'Solicitud de venta' },
  { value: 'arriendo', label: 'Solicitud de arriendo' },
];

function rangoHorasValidator(control: AbstractControl): ValidationErrors | null {
  const fecha = control.get('fecha')?.value;
  const horaInicio = control.get('horaInicio')?.value;
  const horaFin = control.get('horaFin')?.value;
  if (fecha && horaInicio && horaFin && horaFin <= horaInicio) {
    return { rangoInvalido: true };
  }
  return null;
}

function combinarFechaHora(fecha: string, hora: string): Date {
  return new Date(`${fecha}T${hora}:00`);
}

@Component({
  selector: 'app-cita-form-modal',
  standalone: true,
  imports: [ReactiveFormsModule, NgSelectModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './cita-form-modal.component.html',
  styleUrl: './cita-form-modal.component.scss',
})
export class CitaFormModalComponent implements OnInit, OnDestroy {
  readonly data = input.required<CitaModalData>();
  readonly closed = output<void>();

  private readonly fb = inject(FormBuilder);
  private readonly store = inject(Store);

  protected readonly estadoOptions = ESTADO_OPTIONS;
  protected readonly vinculoOptions = VINCULO_OPTIONS;

  protected readonly solicitudesVentaItems = this.store.selectSignal(selectSolicitudesVentaItems);
  protected readonly solicitudesArriendoItems = this.store.selectSignal(
    selectSolicitudesArriendoItems,
  );

  protected readonly form = this.fb.group(
    {
      titulo: ['', [Validators.required, Validators.maxLength(255)]],
      descripcion: [''],
      fecha: ['', Validators.required],
      horaInicio: ['', Validators.required],
      horaFin: ['', Validators.required],
      estado: ['pendiente', Validators.required],
      ubicacion: [''],
      nombre_contacto: [''],
      telefono_contacto: [''],
      vinculoTipo: ['ninguno' as VinculoTipo],
      solicitudId: [null as string | null],
    },
    { validators: rangoHorasValidator },
  );

  private readonly vinculoTipoValue = toSignal(this.form.controls.vinculoTipo.valueChanges, {
    initialValue: this.form.controls.vinculoTipo.value,
  });

  protected readonly mostrarSolicitudVenta = computed(() => this.vinculoTipoValue() === 'venta');
  protected readonly mostrarSolicitudArriendo = computed(
    () => this.vinculoTipoValue() === 'arriendo',
  );

  protected readonly solicitudVentaOptions = computed(() =>
    this.solicitudesVentaItems().map((s) => ({ value: s.id, label: s.nombre_completo })),
  );
  protected readonly solicitudArriendoOptions = computed(() =>
    this.solicitudesArriendoItems().map((s) => ({ value: s.id, label: s.nombre_completo })),
  );

  constructor() {
    effect(() => {
      const data = this.data();
      if (data.mode === 'edit' && data.cita) {
        const cita = data.cita;
        const inicio = new Date(cita.fecha_inicio);
        const fin = new Date(cita.fecha_fin);
        this.form.patchValue({
          titulo: cita.titulo,
          descripcion: cita.descripcion ?? '',
          fecha: format(inicio, 'yyyy-MM-dd'),
          horaInicio: format(inicio, 'HH:mm'),
          horaFin: format(fin, 'HH:mm'),
          estado: cita.estado,
          ubicacion: cita.ubicacion ?? '',
          nombre_contacto: cita.nombre_contacto ?? '',
          telefono_contacto: cita.telefono_contacto ?? '',
          vinculoTipo: cita.solicitud_venta_id
            ? 'venta'
            : cita.solicitud_arriendo_id
              ? 'arriendo'
              : 'ninguno',
          solicitudId: cita.solicitud_venta_id ?? cita.solicitud_arriendo_id ?? null,
        });
      } else if (data.mode === 'create' && data.fechaInicio) {
        const inicio = data.fechaInicio;
        const fin = new Date(inicio.getTime() + 60 * 60 * 1000);
        this.form.patchValue({
          fecha: format(inicio, 'yyyy-MM-dd'),
          horaInicio: format(inicio, 'HH:mm'),
          horaFin: format(fin, 'HH:mm'),
        });
      }
    });
  }

  ngOnInit(): void {
    document.body.style.overflow = 'hidden';
    this.store.dispatch(SolicitudesVentaActions.load());
    this.store.dispatch(SolicitudesArriendoActions.load());
  }

  ngOnDestroy(): void {
    document.body.style.overflow = '';
  }

  protected fieldError(name: FormFieldName): string | null {
    const control = this.form.get(name);
    if (!control || !control.invalid || !(control.dirty || control.touched)) return null;
    if (control.hasError('required')) return REQUIRED_MESSAGES[name];
    if (control.hasError('maxlength')) return 'Máximo 255 caracteres.';
    return null;
  }

  protected get rangoInvalido(): boolean {
    const horaFin = this.form.get('horaFin');
    return this.form.hasError('rangoInvalido') && !!(horaFin?.dirty || horaFin?.touched);
  }

  protected close(): void {
    this.closed.emit();
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    this.close();
  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const fechaInicio = combinarFechaHora(raw.fecha ?? '', raw.horaInicio ?? '');
    const fechaFin = combinarFechaHora(raw.fecha ?? '', raw.horaFin ?? '');

    const payload = {
      titulo: raw.titulo ?? '',
      descripcion: raw.descripcion || null,
      fecha_inicio: fechaInicio.toISOString(),
      fecha_fin: fechaFin.toISOString(),
      estado: raw.estado as CitaForm['estado'],
      ubicacion: raw.ubicacion || null,
      nombre_contacto: raw.nombre_contacto || null,
      telefono_contacto: raw.telefono_contacto || null,
      solicitud_venta_id: raw.vinculoTipo === 'venta' ? raw.solicitudId : null,
      solicitud_arriendo_id: raw.vinculoTipo === 'arriendo' ? raw.solicitudId : null,
    };

    const data = this.data();
    if (data.mode === 'edit' && data.cita) {
      this.store.dispatch(
        CitasActions.update({ id: data.cita.id, form: payload as CitaUpdate }),
      );
    } else {
      this.store.dispatch(CitasActions.create({ form: payload as CitaForm }));
    }
    this.close();
  }

  protected cancelarCita(): void {
    const data = this.data();
    if (data.mode !== 'edit' || !data.cita) return;
    this.store.dispatch(
      CitasActions.update({ id: data.cita.id, form: { estado: 'cancelada' } }),
    );
    this.close();
  }

  protected eliminarCita(): void {
    const data = this.data();
    if (data.mode !== 'edit' || !data.cita) return;
    if (!confirm('¿Eliminar esta cita? Esta acción no se puede deshacer.')) return;
    this.store.dispatch(CitasActions.delete({ id: data.cita.id }));
    this.close();
  }
}
