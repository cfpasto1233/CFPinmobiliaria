import uuid
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, Field, model_validator

TipoPropiedad = Literal["venta", "arriendo", "oferta"]
TipoInmueble = Literal["casa", "apartamento", "lote", "local", "finca", "apartaestudio", "oficina"]

# Tipos de inmueble para los que se piden baños, habitaciones, parqueadero, área
# construida y antigüedad. Un lote no los tiene.
_TIPOS_INMUEBLE_CON_DETALLE: set[str] = {
    "casa",
    "apartamento",
    "local",
    "finca",
    "apartaestudio",
    "oficina",
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
    area_construida: Decimal | None = Field(default=None, gt=0)
    antiguedad: int | None = Field(default=None, ge=0)

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
    area_construida: Decimal | None = Field(default=None, gt=0)
    antiguedad: int | None = Field(default=None, ge=0)

    @model_validator(mode="after")
    def _validar_detalle_segun_tipo_inmueble(self) -> "PropiedadUpdate":
        # El formulario de edición siempre reenvía el objeto completo (no es un PATCH
        # parcial real desde la UI), así que si se especifica tipo_inmueble aquí,
        # aplican las mismas reglas que en la creación.
        if self.tipo_inmueble is not None:
            _normalizar_y_validar_detalle_inmueble(self)
        return self


def _normalizar_y_validar_detalle_inmueble(obj: "PropiedadForm | PropiedadUpdate") -> None:
    if obj.tipo_inmueble in _TIPOS_INMUEBLE_CON_DETALLE:
        faltantes = []
        if obj.banos is None:
            faltantes.append("baños")
        if obj.habitaciones is None:
            faltantes.append("habitaciones")
        if obj.area_construida is None:
            faltantes.append("área construida")
        if obj.antiguedad is None:
            faltantes.append("antigüedad")
        if faltantes:
            raise ValueError(
                "Para casas y apartamentos son obligatorios: " + ", ".join(faltantes) + "."
            )
        if obj.tiene_parqueadero and not obj.num_parqueaderos:
            raise ValueError("Indica el número de parqueaderos.")
        if not obj.tiene_parqueadero:
            obj.num_parqueaderos = None
    else:
        obj.banos = None
        obj.habitaciones = None
        obj.tiene_parqueadero = False
        obj.num_parqueaderos = None
        obj.area_construida = None
        obj.antiguedad = None


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
    area_construida: Decimal | None
    antiguedad: int | None

    model_config = {"from_attributes": True}


class PropiedadesPublic(BaseModel):
    data: list[PropiedadPublic]
    count: int


class PropiedadesReorder(BaseModel):
    ids: list[uuid.UUID]
