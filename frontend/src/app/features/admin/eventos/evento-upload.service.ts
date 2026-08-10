import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { BASE_PATH_DEFAULT, EventoPublic } from '../../../../client';
import { EventoForm } from '../../../store/Eventos/evento-form.model';

/**
 * El cliente ng-openapi generado no arma correctamente el body multipart para estos
 * endpoints — mismo problema que ProyectoUploadService. Este servicio hace las llamadas
 * directo con HttpClient + FormData; solo lo consume EventosEffects, nunca un
 * componente, para no romper la regla de "todo dato de API vive en el store".
 */
@Injectable({ providedIn: 'root' })
export class EventoUploadService {
  private readonly httpClient = inject(HttpClient);
  private readonly basePath = inject(BASE_PATH_DEFAULT);

  createEvento(form: EventoForm, foto: File): Observable<EventoPublic> {
    const body = new FormData();
    body.append('nombre', form.nombre);
    body.append('descripcion', form.descripcion);
    body.append('fecha', form.fecha);
    body.append('foto', foto);

    return this.httpClient.post<EventoPublic>(`${this.basePath}/api/v1/eventos/`, body);
  }

  replaceFoto(eventoId: string, file: File): Observable<EventoPublic> {
    const body = new FormData();
    body.append('file', file);

    return this.httpClient.post<EventoPublic>(
      `${this.basePath}/api/v1/eventos/${eventoId}/foto`,
      body,
    );
  }
}
