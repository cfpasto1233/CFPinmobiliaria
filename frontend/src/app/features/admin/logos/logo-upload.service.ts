import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { BASE_PATH_DEFAULT, LogoPublic } from '../../../../client';
import { LogoForm } from '../../../store/Logos/logo-form.model';

/**
 * El cliente ng-openapi generado no arma correctamente el body multipart para estos
 * endpoints — mismo problema que ProyectoUploadService. Este servicio hace las llamadas
 * directo con HttpClient + FormData; solo lo consume LogosEffects, nunca un componente,
 * para no romper la regla de "todo dato de API vive en el store".
 */
@Injectable({ providedIn: 'root' })
export class LogoUploadService {
  private readonly httpClient = inject(HttpClient);
  private readonly basePath = inject(BASE_PATH_DEFAULT);

  createLogo(form: LogoForm, imagen: File): Observable<LogoPublic> {
    const body = new FormData();
    body.append('nombre', form.nombre);
    body.append('tipo', form.tipo);
    body.append('imagen', imagen);

    return this.httpClient.post<LogoPublic>(`${this.basePath}/api/v1/logos/`, body);
  }

  replaceImagen(logoId: string, file: File): Observable<LogoPublic> {
    const body = new FormData();
    body.append('file', file);

    return this.httpClient.post<LogoPublic>(`${this.basePath}/api/v1/logos/${logoId}/imagen`, body);
  }
}
