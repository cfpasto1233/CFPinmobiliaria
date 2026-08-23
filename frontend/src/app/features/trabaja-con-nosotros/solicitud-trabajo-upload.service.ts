import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { BASE_PATH_DEFAULT, SolicitudTrabajoPublic } from '../../../client';
import { SolicitudTrabajoForm } from '../../store/SolicitudesTrabajo/solicitud-trabajo-form.model';

/**
 * El cliente ng-openapi generado no arma correctamente el body multipart para este
 * endpoint (serializa el PDF con `String(file)` en vez de adjuntarlo como binario) —
 * mismo problema documentado en SolicitudDocumentoUploadService. Este servicio hace la
 * llamada directo con HttpClient + FormData; solo lo consume SolicitudesTrabajoEffects,
 * nunca el componente.
 */
@Injectable({ providedIn: 'root' })
export class SolicitudTrabajoUploadService {
  private readonly httpClient = inject(HttpClient);
  private readonly basePath = inject(BASE_PATH_DEFAULT);

  crearSolicitud(form: SolicitudTrabajoForm, hojaDeVida: File): Observable<SolicitudTrabajoPublic> {
    const body = new FormData();
    body.append('nombre', form.nombre);
    body.append('correo', form.correo);
    body.append('numero_contacto', form.numero_contacto);
    body.append('hoja_de_vida', hojaDeVida);

    return this.httpClient.post<SolicitudTrabajoPublic>(
      `${this.basePath}/api/v1/solicitudes-trabajo/`,
      body,
    );
  }
}
