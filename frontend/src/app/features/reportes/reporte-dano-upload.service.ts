import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { BASE_PATH_DEFAULT, ReporteDanoPublic } from '../../../client';
import { ReporteDanoForm } from '../../store/ReportesDano/reporte-dano-form.model';

/**
 * El cliente ng-openapi generado no arma correctamente el body multipart para este
 * endpoint (serializa cada archivo con `String(file)` en vez de adjuntarlo como binario) —
 * mismo problema documentado en PropiedadUploadService. Este servicio hace la llamada
 * directo con HttpClient + FormData; solo lo consume ReportesDanoEffects, nunca el
 * componente, para no romper la regla de "todo dato de API vive en el store".
 */
@Injectable({ providedIn: 'root' })
export class ReporteDanoUploadService {
  private readonly httpClient = inject(HttpClient);
  private readonly basePath = inject(BASE_PATH_DEFAULT);

  crearReporteDano(form: ReporteDanoForm, fotos: File[], id: string): Observable<ReporteDanoPublic> {
    const body = new FormData();
    body.append('id', id);
    body.append('nombre_completo', form.nombre_completo);
    body.append('numero_contacto', form.numero_contacto);
    body.append('tipo_reporte', form.tipo_reporte);
    body.append('descripcion_dano', form.descripcion_dano);
    if (form.medio_comunicacion) body.append('medio_comunicacion', form.medio_comunicacion);
    if (form.tipo_reporte_otro) body.append('tipo_reporte_otro', form.tipo_reporte_otro);
    fotos.forEach((foto) => body.append('fotos', foto));

    return this.httpClient.post<ReporteDanoPublic>(`${this.basePath}/api/v1/reportes-dano/`, body);
  }
}
