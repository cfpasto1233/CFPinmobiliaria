export type TipoInmueble =
  | 'casa'
  | 'apartamento'
  | 'lote'
  | 'local'
  | 'finca'
  | 'apartaestudio'
  | 'oficina';

// Forma de los campos que arma el formulario de alta/edición. No viene del cliente
// generado porque el endpoint de creación recibe cada campo como multipart Form()
// individual, no como un body JSON — ng-openapi no expone un schema para eso.
// Nombres en snake_case (no camelCase) a propósito: el efecto de edición pasa este
// mismo objeto como `PropiedadUpdate` (tipo del cliente generado, JSON body) sin
// mapear campo por campo, así que los nombres deben calzar exactamente.
export interface PropiedadForm {
  nombre: string;
  descripcion: string;
  ubicacion: string;
  precio: number;
  tipo: 'venta' | 'arriendo' | 'oferta';
  tipo_inmueble: TipoInmueble;
  banos: number | null;
  habitaciones: number | null;
  tiene_parqueadero: boolean;
  num_parqueaderos: number | null;
  area_construida: number | null;
  antiguedad: number | null;
}
