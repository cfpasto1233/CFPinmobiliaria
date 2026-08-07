export type TipoInmueble =
  | 'casa'
  | 'apartamento'
  | 'lote'
  | 'local'
  | 'finca'
  | 'apartaestudio'
  | 'oficina';

export type Vista = 'interna' | 'externa';
export type TipoParqueadero = 'interno' | 'externo' | 'carro' | 'moto';
export type RuralUrbano = 'rural' | 'urbano';

// Forma de los campos que arma el formulario de alta/edición. No viene del cliente
// generado porque el endpoint de creación recibe cada campo como multipart Form()
// individual, no como un body JSON — ng-openapi no expone un schema para eso.
// Nombres en snake_case (no camelCase) a propósito: el efecto de edición pasa este
// mismo objeto como `PropiedadUpdate` (tipo del cliente generado, JSON body) sin
// mapear campo por campo, así que los nombres deben calzar exactamente.
//
// Qué campos aplican y cuáles son obligatorios depende de tipo_inmueble — ver la
// matriz en propiedad-form.component.ts (espejo de la de backend/app/schemas/propiedad.py).
export interface PropiedadForm {
  nombre: string;
  descripcion: string;
  ubicacion: string;
  whatsapp: string;
  precio: number;
  tipo: 'venta' | 'arriendo' | 'oferta';
  tipo_inmueble: TipoInmueble;

  banos: number | null;
  habitaciones: number | null;
  tiene_parqueadero: boolean;
  num_parqueaderos: number | null;
  tipo_parqueadero: TipoParqueadero | null;
  area_construida: number | null;
  area_lote: number | null;
  frente: number | null;
  fondo: number | null;
  antiguedad: number | null;
  piso: number | null;
  vista: Vista | null;

  balcon: boolean;
  terraza: boolean;
  patio: boolean;
  bodega: boolean;
  zona_bbq: boolean;
  piscina: boolean;
  cocina: boolean;

  conjunto_cerrado: boolean;
  tiene_administracion: boolean;
  valor_administracion: number | null;
  zonas_comunes: string | null;

  actividad: string | null;
  rural_urbano: RuralUrbano | null;
  tiene_servicios: boolean;
  tiene_alcantarillado: boolean;
  tiene_acueducto: boolean;

  permite_permuta: boolean;
  adicionales: string | null;

  tiene_gravamenes: boolean;
  tiene_hipoteca: boolean;
}
