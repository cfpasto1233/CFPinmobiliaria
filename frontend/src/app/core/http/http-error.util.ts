import { HttpErrorResponse } from '@angular/common/http';

interface FastApiValidationError {
  loc?: (string | number)[];
  msg?: string;
}

const FIELD_LABELS: Record<string, string> = {
  nombre: 'Nombre',
  descripcion: 'Descripción',
  ubicacion: 'Ubicación',
  precio: 'Precio',
  tipo: 'Tipo',
  foto_principal: 'Foto principal',
  file: 'Archivo',
};

export function extractErrorMessage(error: unknown, fallback: string): string {
  if (!(error instanceof HttpErrorResponse)) {
    return fallback;
  }

  const detail = error.error?.detail;

  if (typeof detail === 'string' && detail.trim().length > 0) {
    return detail;
  }

  if (Array.isArray(detail) && detail.length > 0) {
    return formatValidationErrors(detail);
  }

  if (error.status === 0) {
    return 'No pudimos conectar con el servidor. Verifica tu conexión a internet.';
  }

  return fallback;
}

function formatValidationErrors(errors: FastApiValidationError[]): string {
  return errors
    .map((err) => {
      const field = err.loc?.[err.loc.length - 1];
      const label = typeof field === 'string' ? (FIELD_LABELS[field] ?? field) : null;
      const message = translateValidationMessage(err.msg ?? 'Valor inválido.');
      return label ? `${label}: ${message}` : message;
    })
    .join(' ');
}

function translateValidationMessage(msg: string): string {
  if (/field required|missing/i.test(msg)) return 'es obligatorio.';

  const maxLength = msg.match(/at most (\d+) character/i);
  if (maxLength) return `no puede superar los ${maxLength[1]} caracteres.`;

  const minLength = msg.match(/at least (\d+) character/i);
  if (minLength) return `debe tener al menos ${minLength[1]} caracteres.`;

  if (/greater than 0/i.test(msg)) return 'debe ser mayor a 0.';
  if (/valid number|valid decimal/i.test(msg)) return 'debe ser un número válido.';
  if (/should be '.*'/i.test(msg) || /literal/i.test(msg)) return 'tiene un valor no permitido.';

  return msg;
}
