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
    body.append('tipo_inmueble', form.tipo_inmueble);
    body.append('tiene_parqueadero', String(form.tiene_parqueadero));
    if (form.banos !== null) body.append('banos', String(form.banos));
    if (form.habitaciones !== null) body.append('habitaciones', String(form.habitaciones));
    if (form.num_parqueaderos !== null) body.append('num_parqueaderos', String(form.num_parqueaderos));
    if (form.area_construida !== null) body.append('area_construida', String(form.area_construida));
    if (form.antiguedad !== null) body.append('antiguedad', String(form.antiguedad));
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
