import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { BASE_PATH_DEFAULT, SolicitudDocumentoPropietarioPublic } from '../../../client';
import { SolicitudDocumentoForm } from '../../store/SolicitudesDocumentosPropietario/solicitud-documento-form.model';

/**
 * El cliente ng-openapi generado no arma correctamente el body multipart para este
 * endpoint (5 archivos PDF) — mismo problema documentado en ReporteDanoUploadService.
 * Este servicio hace la llamada directo con HttpClient + FormData; solo lo consume
 * SolicitudesDocumentosPropietarioEffects, nunca el componente.
 */
@Injectable({ providedIn: 'root' })
export class SolicitudDocumentoUploadService {
  private readonly httpClient = inject(HttpClient);
  private readonly basePath = inject(BASE_PATH_DEFAULT);

  crearSolicitud(
    form: SolicitudDocumentoForm,
    cedula: File,
    certificadoLibertad: File,
    escritura: File,
    poder: File | null,
    comprobantePago: File,
  ): Observable<SolicitudDocumentoPropietarioPublic> {
    const body = new FormData();
    body.append('nombre_completo', form.nombre_completo);
    body.append('numero_contacto', form.numero_contacto);
    body.append('plan_contratado', form.plan_contratado);
    body.append('cedula', cedula);
    body.append('certificado_libertad', certificadoLibertad);
    body.append('escritura', escritura);
    if (poder) body.append('poder', poder);
    body.append('comprobante_pago', comprobantePago);

    return this.httpClient.post<SolicitudDocumentoPropietarioPublic>(
      `${this.basePath}/api/v1/solicitudes-documentos-propietario/`,
      body,
    );
  }
}
