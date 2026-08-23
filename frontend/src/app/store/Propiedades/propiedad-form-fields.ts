import { RuralUrbano, TipoInmueble, TipoParqueadero, Vista } from './propiedad-form.model';

// Matriz de campos "detalle" por tipo de inmueble, compartida entre el formulario de
// admin (propiedad-form.component.ts) y el formulario público con token
// (publicar-mi-propiedad.component.ts) — ambos publican el mismo PropiedadForm contra
// endpoints backend que aplican exactamente las mismas reglas. Espejo de la matriz en
// backend/app/schemas/propiedad.py — cualquier cambio acá debe reflejarse allá (y
// viceversa) para que la validación del form coincida con la del backend.

export type CampoDetalle =
  | 'banos'
  | 'habitaciones'
  | 'areaConstruida'
  | 'areaLote'
  | 'frente'
  | 'fondo'
  | 'antiguedad'
  | 'piso'
  | 'vista'
  | 'valorAdministracion'
  | 'zonasComunes'
  | 'actividad'
  | 'ruralUrbano';

export const TODOS_LOS_CAMPOS_DETALLE: CampoDetalle[] = [
  'banos',
  'habitaciones',
  'areaConstruida',
  'areaLote',
  'frente',
  'fondo',
  'antiguedad',
  'piso',
  'vista',
  'valorAdministracion',
  'zonasComunes',
  'actividad',
  'ruralUrbano',
];

export const CAMPOS_REQUERIDOS: Record<TipoInmueble, CampoDetalle[]> = {
  casa: ['banos', 'habitaciones'],
  apartamento: ['banos', 'habitaciones', 'piso', 'vista'],
  apartaestudio: ['banos', 'habitaciones'],
  finca: ['banos', 'habitaciones'],
  oficina: ['banos', 'piso', 'vista'],
  local: ['banos', 'actividad'],
  lote: ['ruralUrbano'],
};

// Los campos de área/medida (areaConstruida, areaLote, frente, fondo) nunca son
// obligatorios en ningún tipo — son datos que quien publica puede no tener a mano.
export const CAMPOS_OPCIONALES: Record<TipoInmueble, CampoDetalle[]> = {
  casa: ['antiguedad', 'valorAdministracion', 'zonasComunes', 'areaConstruida', 'areaLote', 'frente', 'fondo'],
  apartamento: ['antiguedad', 'valorAdministracion', 'zonasComunes', 'areaConstruida'],
  apartaestudio: ['valorAdministracion', 'zonasComunes', 'areaConstruida'],
  finca: ['valorAdministracion', 'zonasComunes', 'areaConstruida', 'areaLote'],
  oficina: ['valorAdministracion', 'areaConstruida'],
  local: ['areaConstruida', 'frente', 'fondo'],
  lote: ['areaLote', 'frente', 'fondo'],
};

// Checkboxes propios de cada tipo: siempre tienen valor, nunca son "obligatorios".
export const CAMPOS_BOOL_PROPIOS: Record<TipoInmueble, string[]> = {
  casa: ['balcon', 'terraza', 'patio', 'conjuntoCerrado', 'zonaLavanderia'],
  apartamento: ['balcon', 'bodega', 'conjuntoCerrado', 'tieneAdministracion', 'zonaLavanderia'],
  apartaestudio: ['bodega', 'conjuntoCerrado', 'tieneAdministracion', 'zonaLavanderia'],
  finca: ['balcon', 'terraza', 'zonaBbq', 'piscina', 'conjuntoCerrado', 'zonaLavanderia'],
  oficina: ['cocina', 'patio', 'tieneAdministracion', 'zonaLavanderia'],
  local: ['cocina', 'patio', 'zonaLavanderia'],
  lote: ['tieneServicios', 'tieneAlcantarillado', 'tieneAcueducto'],
};

// Cotas mínimas por campo, espejo de los Field(ge=.../gt=...) del backend. Los campos
// que no aparecen acá (vista, ruralUrbano, zonasComunes, actividad) no llevan
// validador numérico.
export const CAMPOS_DETALLE_MIN: Partial<Record<CampoDetalle, number>> = {
  banos: 0,
  habitaciones: 0,
  antiguedad: 0,
  areaConstruida: 0.01,
  areaLote: 0.01,
  frente: 0.01,
  fondo: 0.01,
  valorAdministracion: 0,
};

export const TIPOS_CON_PARQUEADERO_DETALLE: TipoInmueble[] = ['casa', 'apartamento', 'finca'];
export const TIPOS_CON_PARQUEADERO_SIMPLE: TipoInmueble[] = ['apartaestudio', 'oficina'];

export const OPCIONES_TIPO_PARQUEADERO: Partial<Record<TipoInmueble, { value: TipoParqueadero; label: string }[]>> = {
  casa: [
    { value: 'interno', label: 'Interno' },
    { value: 'externo', label: 'Externo' },
  ],
  finca: [
    { value: 'interno', label: 'Interno' },
    { value: 'externo', label: 'Externo' },
  ],
  apartamento: [
    { value: 'carro', label: 'Carro' },
    { value: 'moto', label: 'Moto' },
  ],
};

export const TIPOS_CON_CONJUNTO_CERRADO: TipoInmueble[] = ['casa', 'apartamento', 'finca', 'apartaestudio'];
export const TIPOS_CON_ADMIN_ANIDADA: TipoInmueble[] = ['apartamento', 'apartaestudio'];
export const TIPOS_CON_ADMIN_DIRECTA: TipoInmueble[] = ['oficina'];

export const VISTA_OPTIONS: { value: Vista; label: string }[] = [
  { value: 'interna', label: 'Interna' },
  { value: 'externa', label: 'Externa' },
];

export const RURAL_URBANO_OPTIONS: { value: RuralUrbano; label: string }[] = [
  { value: 'rural', label: 'Rural' },
  { value: 'urbano', label: 'Urbano' },
];
