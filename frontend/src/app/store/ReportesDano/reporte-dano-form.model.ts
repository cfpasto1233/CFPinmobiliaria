export type MedioComunicacionReporte = 'whatsapp' | 'llamada';
export type TipoReporteDano =
  | 'tuberia'
  | 'techo'
  | 'estructura'
  | 'instalacion_electrica'
  | 'humedad'
  | 'otros';

// Forma de los campos que arma el formulario. No viene del cliente generado porque el
// endpoint de creación recibe cada campo como multipart Form() individual (incluye
// archivos), no como un body JSON — ng-openapi no expone un schema utilizable para eso.
export interface ReporteDanoForm {
  nombre_completo: string;
  medio_comunicacion: MedioComunicacionReporte | null;
  numero_contacto: string;
  tipo_reporte: TipoReporteDano;
  tipo_reporte_otro: string | null;
  descripcion_dano: string;
}
