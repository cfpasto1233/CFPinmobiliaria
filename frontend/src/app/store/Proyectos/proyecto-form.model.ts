export type EstadoProyecto = 'planos' | 'construccion_1' | 'construccion_2' | 'entrega_inmediata';

// Igual que PropiedadForm: el endpoint de creación recibe cada campo como multipart
// Form() individual, no como body JSON, así que este modelo no viene del cliente
// generado. El efecto de edición reenvía este mismo objeto como `ProyectoUpdate`
// (tipo del cliente generado, JSON body) sin mapear campo por campo.
export interface ProyectoForm {
  nombre: string;
  descripcion: string;
  ubicacion: string;
  estado: EstadoProyecto;
  precio: number;
  financiacion: boolean;
  financiacion_descripcion: string | null;
  credito_hipotecario: boolean;
}
