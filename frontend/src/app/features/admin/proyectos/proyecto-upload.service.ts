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
    if (form.credito_hipotecario_descripcion) {
      body.append('credito_hipotecario_descripcion', form.credito_hipotecario_descripcion);
    }
    body.append('tiene_zonas_comunes', String(form.tiene_zonas_comunes));
    if (form.zonas_comunes && form.zonas_comunes.length > 0) {
      body.append('zonas_comunes', JSON.stringify(form.zonas_comunes));
    }
    body.append('ascensor', String(form.ascensor));
    body.append('conjunto_cerrado', String(form.conjunto_cerrado));
    body.append('valor_administracion_por_definir', String(form.valor_administracion_por_definir));
    if (form.valor_administracion !== null) {
      body.append('valor_administracion', String(form.valor_administracion));
    }
    if (form.area_m2 !== null) {
      body.append('area_m2', String(form.area_m2));
    }
    body.append('tipos', JSON.stringify(form.tipos));
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

  addFoto(proyectoId: string, file: File, descripcion: string | null): Observable<ProyectoPublic> {
    const body = new FormData();
    body.append('file', file);
    if (descripcion) {
      body.append('descripcion', descripcion);
    }

    return this.httpClient.post<ProyectoPublic>(
      `${this.basePath}/api/v1/proyectos/${proyectoId}/fotos`,
      body,
    );
  }
}
