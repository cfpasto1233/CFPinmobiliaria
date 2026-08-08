import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { BASE_PATH_DEFAULT, PropiedadPublic } from '../../../../client';
import { PropiedadForm } from '../../../store/Propiedades/propiedad-form.model';

/**
 * El cliente ng-openapi generado no arma correctamente el body multipart para estos
 * endpoints (serializa el archivo con `String(file)` en vez de adjuntarlo como binario) —
 * ver POST /propiedades, POST .../publicar-con-token/{token}, POST .../foto-principal,
 * POST .../fotos. Este servicio hace las llamadas directo con HttpClient + FormData; solo
 * lo consume PropiedadesEffects, nunca un componente, para no romper la regla de "todo
 * dato de API vive en el store".
 */
@Injectable({ providedIn: 'root' })
export class PropiedadUploadService {
  private readonly httpClient = inject(HttpClient);
  private readonly basePath = inject(BASE_PATH_DEFAULT);

  createPropiedad(form: PropiedadForm, fotoPrincipal: File): Observable<PropiedadPublic> {
    const body = this.buildPropiedadFormData(form, fotoPrincipal);
    return this.httpClient.post<PropiedadPublic>(`${this.basePath}/api/v1/propiedades/`, body);
  }

  createPropiedadConToken(
    token: string,
    form: PropiedadForm,
    fotoPrincipal: File,
  ): Observable<PropiedadPublic> {
    const body = this.buildPropiedadFormData(form, fotoPrincipal);
    return this.httpClient.post<PropiedadPublic>(
      `${this.basePath}/api/v1/propiedades/publicar-con-token/${token}`,
      body,
    );
  }

  private buildPropiedadFormData(form: PropiedadForm, fotoPrincipal: File): FormData {
    const body = new FormData();
    body.append('nombre', form.nombre);
    body.append('descripcion', form.descripcion);
    body.append('ubicacion', form.ubicacion);
    body.append('whatsapp', form.whatsapp);
    body.append('precio', String(form.precio));
    body.append('tipo', form.tipo);
    body.append('tipo_inmueble', form.tipo_inmueble);
    body.append('tiene_parqueadero', String(form.tiene_parqueadero));
    if (form.banos !== null) body.append('banos', String(form.banos));
    if (form.habitaciones !== null) body.append('habitaciones', String(form.habitaciones));
    if (form.num_parqueaderos !== null) body.append('num_parqueaderos', String(form.num_parqueaderos));
    if (form.tipo_parqueadero !== null) body.append('tipo_parqueadero', form.tipo_parqueadero);
    if (form.area_construida !== null) body.append('area_construida', String(form.area_construida));
    if (form.area_lote !== null) body.append('area_lote', String(form.area_lote));
    if (form.frente !== null) body.append('frente', String(form.frente));
    if (form.fondo !== null) body.append('fondo', String(form.fondo));
    if (form.antiguedad !== null) body.append('antiguedad', String(form.antiguedad));
    if (form.piso !== null) body.append('piso', String(form.piso));
    if (form.vista !== null) body.append('vista', form.vista);
    body.append('balcon', String(form.balcon));
    body.append('terraza', String(form.terraza));
    body.append('patio', String(form.patio));
    body.append('bodega', String(form.bodega));
    body.append('zona_bbq', String(form.zona_bbq));
    body.append('piscina', String(form.piscina));
    body.append('cocina', String(form.cocina));
    body.append('conjunto_cerrado', String(form.conjunto_cerrado));
    body.append('tiene_administracion', String(form.tiene_administracion));
    if (form.valor_administracion !== null) body.append('valor_administracion', String(form.valor_administracion));
    if (form.zonas_comunes !== null) body.append('zonas_comunes', form.zonas_comunes);
    if (form.actividad !== null) body.append('actividad', form.actividad);
    if (form.rural_urbano !== null) body.append('rural_urbano', form.rural_urbano);
    body.append('tiene_servicios', String(form.tiene_servicios));
    body.append('tiene_alcantarillado', String(form.tiene_alcantarillado));
    body.append('tiene_acueducto', String(form.tiene_acueducto));
    body.append('permite_permuta', String(form.permite_permuta));
    body.append('tiene_gravamenes', String(form.tiene_gravamenes));
    body.append('tiene_hipoteca', String(form.tiene_hipoteca));
    if (form.adicionales !== null) body.append('adicionales', form.adicionales);
    body.append('foto_principal', fotoPrincipal);

    return body;
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
