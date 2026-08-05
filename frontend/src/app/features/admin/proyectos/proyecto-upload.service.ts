import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { BASE_PATH_DEFAULT, ProyectoPublic } from '../../../../client';
import { ProyectoForm } from '../../../store/Proyectos/proyecto-form.model';

/**
 * El cliente ng-openapi generado no arma correctamente el body multipart para estos
 * endpoints — mismo problema que PropiedadUploadService. Este servicio hace las llamadas
 * directo con HttpClient + FormData; solo lo consume ProyectosEffects, nunca un
 * componente, para no romper la regla de "todo dato de API vive en el store".
 */
@Injectable({ providedIn: 'root' })
export class ProyectoUploadService {
  private readonly httpClient = inject(HttpClient);
  private readonly basePath = inject(BASE_PATH_DEFAULT);

  createProyecto(form: ProyectoForm, fotoPortada: File): Observable<ProyectoPublic> {
    const body = new FormData();
    body.append('nombre', form.nombre);
    body.append('descripcion', form.descripcion);
    body.append('ubicacion', form.ubicacion);
    body.append('estado', form.estado);
    body.append('precio', String(form.precio));
    body.append('financiacion', String(form.financiacion));
    if (form.financiacion_descripcion) {
      body.append('financiacion_descripcion', form.financiacion_descripcion);
    }
    body.append('credito_hipotecario', String(form.credito_hipotecario));
    body.append('foto_portada', fotoPortada);

    return this.httpClient.post<ProyectoPublic>(`${this.basePath}/api/v1/proyectos/`, body);
  }

  replaceFotoPortada(proyectoId: string, file: File): Observable<ProyectoPublic> {
    const body = new FormData();
    body.append('file', file);

    return this.httpClient.post<ProyectoPublic>(
      `${this.basePath}/api/v1/proyectos/${proyectoId}/foto-portada`,
      body,
    );
  }
}
