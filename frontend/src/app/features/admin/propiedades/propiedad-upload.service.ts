import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { BASE_PATH_DEFAULT, PropiedadPublic } from '../../../../client';
import { PropiedadForm } from '../../../store/Propiedades/propiedad-form.model';

/**
 * El cliente ng-openapi generado no arma correctamente el body multipart para estos
 * endpoints (serializa el archivo con `String(file)` en vez de adjuntarlo como binario) —
 * ver POST /propiedades, POST .../foto-principal, POST .../fotos. Este servicio hace las
 * llamadas directo con HttpClient + FormData; solo lo consume PropiedadesEffects, nunca un
 * componente, para no romper la regla de "todo dato de API vive en el store".
 */
@Injectable({ providedIn: 'root' })
export class PropiedadUploadService {
  private readonly httpClient = inject(HttpClient);
  private readonly basePath = inject(BASE_PATH_DEFAULT);

  createPropiedad(form: PropiedadForm, fotoPrincipal: File): Observable<PropiedadPublic> {
    const body = new FormData();
    body.append('nombre', form.nombre);
    body.append('descripcion', form.descripcion);
    body.append('ubicacion', form.ubicacion);
    body.append('precio', String(form.precio));
    body.append('tipo', form.tipo);
    body.append('foto_principal', fotoPrincipal);

    return this.httpClient.post<PropiedadPublic>(`${this.basePath}/api/v1/propiedades/`, body);
  }

  addFoto(propiedadId: string, file: File): Observable<PropiedadPublic> {
    const body = new FormData();
    body.append('file', file);

    return this.httpClient.post<PropiedadPublic>(
      `${this.basePath}/api/v1/propiedades/${propiedadId}/fotos`,
      body,
    );
  }

  replaceFotoPrincipal(propiedadId: string, file: File): Observable<PropiedadPublic> {
    const body = new FormData();
    body.append('file', file);

    return this.httpClient.post<PropiedadPublic>(
      `${this.basePath}/api/v1/propiedades/${propiedadId}/foto-principal`,
      body,
    );
  }
}
