import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  OnDestroy,
  OnInit,
  effect,
  inject,
  output,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { Store } from '@ngrx/store';
import { PlanContratado } from '../../../store/SolicitudesDocumentosPropietario/solicitud-documento-form.model';
import { SolicitudesDocumentosPropietarioActions } from '../../../store/SolicitudesDocumentosPropietario/solicitudes-documentos-propietario.actions';
import {
  selectSolicitudesDocumentosPropietarioError,
  selectSolicitudesDocumentosPropietarioLoading,
} from '../../../store/SolicitudesDocumentosPropietario/solicitudes-documentos-propietario.selectors';

const ALLOWED_DOCUMENT_TYPES = ['application/pdf'];
const MAX_DOCUMENT_SIZE_BYTES = 10 * 1024 * 1024;

type DocumentoKey = 'cedula' | 'certificadoLibertad' | 'escritura' | 'poder' | 'comprobantePago';

type FormFieldName = 'nombreCompleto' | 'numeroContacto' | 'planContratado';

const REQUIRED_MESSAGES: Record<FormFieldName, string> = {
  nombreCompleto: 'El nombre completo es obligatorio.',
  numeroContacto: 'El número de contacto es obligatorio.',
  planContratado: 'Selecciona el plan que contrataste.',
};

@Component({
  selector: 'app-carga-documentos-modal',
  standalone: true,
  imports: [ReactiveFormsModule, NgSelectModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './carga-documentos-modal.component.html',
  styleUrl: './carga-documentos-modal.component.scss',
})
export class CargaDocumentosModalComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(Store);

  readonly closed = output<void>();

  protected readonly submitting = this.store.selectSignal(
    selectSolicitudesDocumentosPropietarioLoading,
  );
  protected readonly error = this.store.selectSignal(selectSolicitudesDocumentosPropietarioError);

  protected readonly planOptions: { value: PlanContratado; label: string }[] = [
    { value: 'basico', label: 'Básico' },
    { value: 'estandar', label: 'Estándar' },
    { value: 'premium', label: 'Premium' },
    { value: 'asesoria_legal', label: 'Asesoría Legal Opcional' },
  ];

  protected readonly form = this.fb.group({
    nombreCompleto: ['', [Validators.required, Validators.maxLength(255)]],
    numeroContacto: ['', [Validators.required, Validators.pattern(/^[0-9+\s()-]{7,20}$/)]],
    planContratado: [null as PlanContratado | null, Validators.required],
  });

  protected readonly archivos = signal<Record<DocumentoKey, File | null>>({
    cedula: null,
    certificadoLibertad: null,
    escritura: null,
    poder: null,
    comprobantePago: null,
  });
  protected readonly archivosError = signal<string | null>(null);

  private wasSubmitting = false;

  constructor() {
    // El modal se cierra solo cuando termina un envío exitoso (loading true -> false sin error).
    effect(() => {
      const submitting = this.submitting();
      const error = this.error();
      if (this.wasSubmitting && !submitting && !error) {
        this.closed.emit();
      }
      this.wasSubmitting = submitting;
    });
  }

  ngOnInit(): void {
    document.body.style.overflow = 'hidden';
  }

  ngOnDestroy(): void {
    document.body.style.overflow = '';
  }

  protected close(): void {
    this.closed.emit();
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    this.close();
  }

  protected fieldError(name: FormFieldName): string | null {
    const control = this.form.get(name);
    if (!control || !control.invalid || !(control.dirty || control.touched)) return null;
    if (control.hasError('required')) return REQUIRED_MESSAGES[name];
    if (control.hasError('pattern')) return 'Ingresa un número de contacto válido.';
    return null;
  }

  protected onArchivoSeleccionado(event: Event, key: DocumentoKey): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    input.value = '';
    if (!file) return;

    const validationError = this.validarDocumento(file);
    if (validationError) {
      this.archivosError.set(validationError);
      return;
    }
    this.archivosError.set(null);
    this.archivos.update((actuales) => ({ ...actuales, [key]: file }));
  }

  protected quitarArchivo(key: DocumentoKey): void {
    this.archivos.update((actuales) => ({ ...actuales, [key]: null }));
  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const archivos = this.archivos();
    const faltantes: string[] = [];
    if (!archivos.cedula) faltantes.push('cédula del propietario');
    if (!archivos.certificadoLibertad) faltantes.push('certificado de libertad y tradición');
    if (!archivos.escritura) faltantes.push('escritura pública de adquisición');
    if (!archivos.comprobantePago) faltantes.push('comprobante de pago');
    if (faltantes.length > 0) {
      this.archivosError.set(`Falta adjuntar: ${faltantes.join(', ')}.`);
      return;
    }

    const raw = this.form.getRawValue();
    this.store.dispatch(
      SolicitudesDocumentosPropietarioActions.create({
        form: {
          nombre_completo: raw.nombreCompleto ?? '',
          numero_contacto: raw.numeroContacto ?? '',
          plan_contratado: raw.planContratado ?? 'basico',
        },
        cedula: archivos.cedula!,
        certificadoLibertad: archivos.certificadoLibertad!,
        escritura: archivos.escritura!,
        poder: archivos.poder,
        comprobantePago: archivos.comprobantePago!,
      }),
    );
  }

  private validarDocumento(file: File): string | null {
    if (!ALLOWED_DOCUMENT_TYPES.includes(file.type)) {
      return 'Cada documento debe ser un archivo PDF.';
    }
    if (file.size > MAX_DOCUMENT_SIZE_BYTES) {
      return 'Cada documento debe pesar menos de 10 MB.';
    }
    return null;
  }
}
