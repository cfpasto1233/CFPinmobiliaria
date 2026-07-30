import uuid
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, Field, model_validator

TipoPropiedad = Literal["venta", "arriendo", "oferta"]
TipoInmueble = Literal["casa", "apartamento", "lote", "local", "finca", "apartaestudio", "oficina"]
Vista = Literal["interna", "externa"]
TipoParqueadero = Literal["interno", "externo", "carro", "moto"]
RuralUrbano = Literal["rural", "urbano"]

# ─── Matriz de campos "detalle" por tipo de inmueble ────────────────────────
# Cada tipo de inmueble solicita un set de campos distinto (ver docs/DECISIONS.md).
# Los campos que no aparecen para un tipo dado se limpian a None/False al guardar.

_CAMPOS_REQUERIDOS: dict[str, set[str]] = {
    "casa": {"banos", "habitaciones", "area_construida", "area_lote"},
    "apartamento": {"banos", "habitaciones", "area_construida", "piso", "vista"},
    "apartaestudio": {"banos", "habitaciones", "area_construida"},
    "finca": {"banos", "habitaciones", "area_construida", "area_lote"},
    "oficina": {"banos", "area_construida", "piso", "vista"},
    "local": {"banos", "frente", "fondo", "actividad"},
    "lote": {"frente", "fondo", "rural_urbano"},
}

# Aplican para el tipo pero pueden quedar vacíos. area_construida/area_lote en
# local/lote no las llena el usuario — se calculan de frente × fondo.
_CAMPOS_OPCIONALES: dict[str, set[str]] = {
    "casa": {"antiguedad", "valor_administracion", "zonas_comunes"},
    "apartamento": {"antiguedad", "valor_administracion", "zonas_comunes"},
    "apartaestudio": {"valor_administracion", "zonas_comunes"},
    "finca": {"valor_administracion", "zonas_comunes"},
    "oficina": {"valor_administracion"},
    "local": {"area_construida"},
    "lote": {"area_lote"},
}

# Checkboxes propios de cada tipo: siempre tienen un valor (True/False), nunca
# son "obligatorios" en el sentido de exigir que se marquen.
_CAMPOS_BOOL_PROPIOS: dict[str, set[str]] = {
    "casa": {"balcon", "terraza", "patio", "conjunto_cerrado"},
    "apartamento": {"balcon", "bodega", "conjunto_cerrado", "tiene_administracion"},
    "apartaestudio": {"bodega", "conjunto_cerrado", "tiene_administracion"},
    "finca": {"balcon", "terraza", "zona_bbq", "piscina", "conjunto_cerrado"},
    "oficina": {"cocina", "patio", "tiene_administracion"},
    "local": {"cocina", "patio"},
    "lote": {"tiene_servicios", "tiene_alcantarillado", "tiene_acueducto"},
}

_CAMPOS_BOOL: frozenset[str] = frozenset(
    {
        "balcon",
        "terraza",
        "patio",
        "bodega",
        "zona_bbq",
        "piscina",
        "conjunto_cerrado",
        "tiene_administracion",
        "cocina",
        "tiene_servicios",
        "tiene_alcantarillado",
        "tiene_acueducto",
    }
)

# Todos los campos "detalle" que existen en el modelo (sin contar parqueadero,
# que se maneja aparte, ni permite_permuta/adicionales, que son universales).
_TODOS_LOS_CAMPOS_DETALLE: frozenset[str] = frozenset(
    {
        "banos",
        "habitaciones",
        "area_construida",
        "area_lote",
        "frente",
        "fondo",
        "antiguedad",
        "piso",
        "vista",
        "valor_administracion",
        "zonas_comunes",
        "actividad",
        "rural_urbano",
    }
    | _CAMPOS_BOOL
)

_TIPOS_CON_PARQUEADERO_DETALLE: set[str] = {"casa", "apartamento", "finca"}
_TIPOS_CON_PARQUEADERO_SIMPLE: set[str] = {"apartaestudio", "oficina"}
_TIPOS_CON_PARQUEADERO: set[str] = _TIPOS_CON_PARQUEADERO_DETALLE | _TIPOS_CON_PARQUEADERO_SIMPLE

_VALORES_TIPO_PARQUEADERO: dict[str, set[str]] = {
    "casa": {"interno", "externo"},
    "finca": {"interno", "externo"},
    "apartamento": {"carro", "moto"},
}

_TIPOS_CON_CONJUNTO_CERRADO: set[str] = {"casa", "apartamento", "finca", "apartaestudio"}
_TIPOS_CON_ADMIN_ANIDADA: set[str] = {"apartamento", "apartaestudio"}
_TIPOS_CON_ADMIN_DIRECTA: set[str] = {"oficina"}
_TIPOS_CON_FRENTE_FONDO: set[str] = {"local", "lote"}

_LABELS: dict[str, str] = {
    "banos": "baños",
    "habitaciones": "habitaciones",
    "area_construida": "área construida",
    "area_lote": "área de lote",
    "antiguedad": "antigüedad",
    "piso": "piso",
    "vista": "vista (interna o externa)",
    "frente": "frente",
    "fondo": "fondo",
    "actividad": "actividad",
    "rural_urbano": "si es rural o urbano",
}

_TIPO_INMUEBLE_LABELS: dict[str, str] = {
    "casa": "una casa",
    "apartamento": "un apartamento",
    "apartaestudio": "un apartaestudio",
    "finca": "una finca",
    "oficina": "una oficina",
    "local": "un local",
    "lote": "un lote",
}


class PropiedadForm(BaseModel):
    nombre: str = Field(max_length=255)
    descripcion: str
    ubicacion: str = Field(max_length=255)
    precio: Decimal = Field(gt=0)
    tipo: TipoPropiedad
    tipo_inmueble: TipoInmueble

    banos: int | None = Field(default=None, ge=0)
    habitaciones: int | None = Field(default=None, ge=0)
    tiene_parqueadero: bool = False
    num_parqueaderos: int | None = Field(default=None, ge=0)
    tipo_parqueadero: TipoParqueadero | None = None
    area_construida: Decimal | None = Field(default=None, gt=0)
    area_lote: Decimal | None = Field(default=None, gt=0)
    frente: Decimal | None = Field(default=None, gt=0)
    fondo: Decimal | None = Field(default=None, gt=0)
    antiguedad: int | None = Field(default=None, ge=0)
    piso: int | None = None
    vista: Vista | None = None

    balcon: bool = False
    terraza: bool = False
    patio: bool = False
    bodega: bool = False
    zona_bbq: bool = False
    piscina: bool = False
    cocina: bool = False

    conjunto_cerrado: bool = False
    tiene_administracion: bool = False
    valor_administracion: Decimal | None = Field(default=None, ge=0)
    zonas_comunes: str | None = None

    actividad: str | None = None
    rural_urbano: RuralUrbano | None = None
    tiene_servicios: bool = False
    tiene_alcantarillado: bool = False
    tiene_acueducto: bool = False

    permite_permuta: bool = False
    adicionales: str | None = None

    @model_validator(mode="after")
    def _validar_detalle_segun_tipo_inmueble(self) -> "PropiedadForm":
        _normalizar_y_validar_detalle_inmueble(self)
        return self


class PropiedadUpdate(BaseModel):
    nombre: str | None = Field(default=None, max_length=255)
    descripcion: str | None = None
    ubicacion: str | None = Field(default=None, max_length=255)
    precio: Decimal | None = Field(default=None, gt=0)
    tipo: TipoPropiedad | None = None
    tipo_inmueble: TipoInmueble | None = None

    banos: int | None = Field(default=None, ge=0)
    habitaciones: int | None = Field(default=None, ge=0)
    tiene_parqueadero: bool | None = None
    num_parqueaderos: int | None = Field(default=None, ge=0)
    tipo_parqueadero: TipoParqueadero | None = None
    area_construida: Decimal | None = Field(default=None, gt=0)
    area_lote: Decimal | None = Field(default=None, gt=0)
    frente: Decimal | None = Field(default=None, gt=0)
    fondo: Decimal | None = Field(default=None, gt=0)
    antiguedad: int | None = Field(default=None, ge=0)
    piso: int | None = None
    vista: Vista | None = None

    balcon: bool | None = None
    terraza: bool | None = None
    patio: bool | None = None
    bodega: bool | None = None
    zona_bbq: bool | None = None
    piscina: bool | None = None
    cocina: bool | None = None

    conjunto_cerrado: bool | None = None
    tiene_administracion: bool | None = None
    valor_administracion: Decimal | None = Field(default=None, ge=0)
    zonas_comunes: str | None = None

    actividad: str | None = None
    rural_urbano: RuralUrbano | None = None
    tiene_servicios: bool | None = None
    tiene_alcantarillado: bool | None = None
    tiene_acueducto: bool | None = None

    permite_permuta: bool | None = None
    adicionales: str | None = None

    @model_validator(mode="after")
    def _validar_detalle_segun_tipo_inmueble(self) -> "PropiedadUpdate":
        # El formulario de edición siempre reenvía el objeto completo (no es un PATCH
        # parcial real desde la UI), así que si se especifica tipo_inmueble aquí,
        # aplican las mismas reglas que en la creación.
        if self.tipo_inmueble is not None:
            _normalizar_y_validar_detalle_inmueble(self)
        return self


def _normalizar_y_validar_detalle_inmueble(obj: "PropiedadForm | PropiedadUpdate") -> None:
    tipo = obj.tipo_inmueble
    if tipo is None:
        return

    requeridos = _CAMPOS_REQUERIDOS.get(tipo, set())
    opcionales = _CAMPOS_OPCIONALES.get(tipo, set())
    booleanos_propios = _CAMPOS_BOOL_PROPIOS.get(tipo, set())
    aplicables = requeridos | opcionales | booleanos_propios

    for campo in _TODOS_LOS_CAMPOS_DETALLE - aplicables:
        setattr(obj, campo, False if campo in _CAMPOS_BOOL else None)

    faltantes = [_LABELS[campo] for campo in requeridos if getattr(obj, campo) in (None, "")]
    if faltantes:
        raise ValueError(
            f"Para {_TIPO_INMUEBLE_LABELS[tipo]} son obligatorios: " + ", ".join(faltantes) + "."
        )

    _normalizar_parqueadero(obj, tipo)
    _normalizar_conjunto_cerrado_y_administracion(obj, tipo)
    _normalizar_frente_fondo(obj, tipo)


def _normalizar_parqueadero(obj: "PropiedadForm | PropiedadUpdate", tipo: str) -> None:
    if tipo not in _TIPOS_CON_PARQUEADERO:
        obj.tiene_parqueadero = False
        obj.num_parqueaderos = None
        obj.tipo_parqueadero = None
        return

    if not obj.tiene_parqueadero:
        obj.num_parqueaderos = None
        obj.tipo_parqueadero = None
        return

    if tipo in _TIPOS_CON_PARQUEADERO_DETALLE:
        faltantes = []
        if not obj.num_parqueaderos:
            faltantes.append("número de parqueaderos")
        if not obj.tipo_parqueadero:
            faltantes.append("tipo de parqueadero")
        if faltantes:
            raise ValueError("Indica " + " y ".join(faltantes) + ".")
        if obj.tipo_parqueadero not in _VALORES_TIPO_PARQUEADERO[tipo]:
            raise ValueError("Tipo de parqueadero inválido para este tipo de inmueble.")
    else:
        obj.num_parqueaderos = None
        obj.tipo_parqueadero = None


def _normalizar_conjunto_cerrado_y_administracion(
    obj: "PropiedadForm | PropiedadUpdate", tipo: str
) -> None:
    if tipo in _TIPOS_CON_CONJUNTO_CERRADO:
        if not obj.conjunto_cerrado:
            obj.tiene_administracion = False
            obj.valor_administracion = None
            obj.zonas_comunes = None
        elif tipo in _TIPOS_CON_ADMIN_ANIDADA:
            if not obj.tiene_administracion:
                obj.valor_administracion = None
        else:
            # casa/finca: sin el booleano intermedio, van directo al valor opcional.
            obj.tiene_administracion = False
    elif tipo in _TIPOS_CON_ADMIN_DIRECTA:
        obj.conjunto_cerrado = False
        obj.zonas_comunes = None
        if not obj.tiene_administracion:
            obj.valor_administracion = None
    else:
        obj.conjunto_cerrado = False
        obj.tiene_administracion = False
        obj.valor_administracion = None
        obj.zonas_comunes = None


def _normalizar_frente_fondo(obj: "PropiedadForm | PropiedadUpdate", tipo: str) -> None:
    if tipo not in _TIPOS_CON_FRENTE_FONDO:
        obj.frente = None
        obj.fondo = None
        return

    if obj.frente is None or obj.fondo is None:
        return

    area = obj.frente * obj.fondo
    if tipo == "local":
        obj.area_construida = area
    else:
        obj.area_lote = area


class PropiedadFotoPublic(BaseModel):
    id: uuid.UUID
    orden: int
    url: str

    model_config = {"from_attributes": True}


class PropiedadPublic(BaseModel):
    id: uuid.UUID
    nombre: str
    descripcion: str
    ubicacion: str
    precio: Decimal
    tipo: str
    orden: int
    foto_principal_url: str
    fotos: list[PropiedadFotoPublic]
    tipo_inmueble: str

    banos: int | None
    habitaciones: int | None
    tiene_parqueadero: bool
    num_parqueaderos: int | None
    tipo_parqueadero: str | None
    area_construida: Decimal | None
    area_lote: Decimal | None
    frente: Decimal | None
    fondo: Decimal | None
    antiguedad: int | None
    piso: int | None
    vista: str | None

    balcon: bool
    terraza: bool
    patio: bool
    bodega: bool
    zona_bbq: bool
    piscina: bool
    cocina: bool

    conjunto_cerrado: bool
    tiene_administracion: bool
    valor_administracion: Decimal | None
    zonas_comunes: str | None

    actividad: str | None
    rural_urbano: str | None
    tiene_servicios: bool
    tiene_alcantarillado: bool
    tiene_acueducto: bool

    permite_permuta: bool
    adicionales: str | None

    model_config = {"from_attributes": True}


class PropiedadesPublic(BaseModel):
    data: list[PropiedadPublic]
    count: int


class PropiedadesReorder(BaseModel):
    ids: list[uuid.UUID]
