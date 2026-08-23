// Forma de los campos de texto del formulario de "Trabaja con nosotros". No viene del
// cliente generado porque el endpoint de creación recibe cada campo como multipart
// Form() individual (incluye la hoja de vida en PDF), no como un body JSON.
export interface SolicitudTrabajoForm {
  nombre: string;
  correo: string;
  numero_contacto: string;
}
