export type PlanContratado = 'basico' | 'estandar' | 'premium' | 'asesoria_legal';

// Forma de los campos de texto del formulario de carga de documentos. No viene del
// cliente generado porque el endpoint de creación recibe cada campo como multipart
// Form() individual (incluye 5 archivos PDF), no como un body JSON.
export interface SolicitudDocumentoForm {
  nombre_completo: string;
  numero_contacto: string;
  plan_contratado: PlanContratado;
}
