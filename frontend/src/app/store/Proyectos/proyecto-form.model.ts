export type EstadoProyecto = 'planos' | 'construccion_1' | 'construccion_2' | 'entrega_inmediata';

export type ZonaComun =
  | 'piscina'
  | 'parque_infantil'
  | 'cancha'
  | 'parqueadero_visitantes'
  | 'zonas_verdes'
  | 'salon_social'
  | 'zona_bbq'
  | 'gimnasio'
  | 'lobby'
  | 'zona_humeda'
  | 'porteria_digital';

export type TipoUnidadProyecto = 'local' | 'apartaestudio' | 'apartamento' | 'penthouse';
export type VistaUnidad = 'interna' | 'externa';

export interface ProyectoTipoForm {
  categoria: TipoUnidadProyecto;
  area_m2: number | null;
  precio: number | null;
  habitaciones: number;
  banos: number;
  balcon: boolean;
  terraza: boolean;
  parqueadero: boolean;
  patio: boolean;
  vista: VistaUnidad;
}

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
  credito_hipotecario_descripcion: string | null;

  tiene_zonas_comunes: boolean;
  zonas_comunes: ZonaComun[] | null;
  ascensor: boolean;

  conjunto_cerrado: boolean;
  valor_administracion_por_definir: boolean;
  valor_administracion: number | null;

  area_m2: number | null;

  tipos: ProyectoTipoForm[];
}
