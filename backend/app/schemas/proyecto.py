import uuid
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, Field, model_validator

EstadoProyecto = Literal["planos", "construccion_1", "construccion_2", "entrega_inmediata"]

ZonaComun = Literal[
    "piscina",
    "parque_infantil",
    "cancha",
    "parqueadero_visitantes",
    "zonas_verdes",
    "salon_social",
    "zona_bbq",
    "gimnasio",
    "lobby",
    "zona_humeda",
    "porteria_digital",
]

TipoUnidadProyecto = Literal["local", "apartaestudio", "apartamento", "penthouse"]
VistaUnidad = Literal["interna", "externa"]


class ProyectoTipoForm(BaseModel):
    categoria: TipoUnidadProyecto
    area_m2: Decimal | None = Field(default=None, gt=0)
    precio: Decimal | None = Field(default=None, gt=0)
    habitaciones: int = Field(ge=0)
    banos: int = Field(ge=0)
    balcon: bool = False
    terraza: bool = False
    parqueadero: bool = False
    patio: bool = False
    vista: VistaUnidad


class ProyectoTipoPublic(BaseModel):
    id: uuid.UUID
    categoria: str
    area_m2: Decimal | None
    precio: Decimal | None
    habitaciones: int
    banos: int
    balcon: bool
    terraza: bool
    parqueadero: bool
    patio: bool
    vista: str

    model_config = {"from_attributes": True}


class ProyectoFotoPublic(BaseModel):
    id: uuid.UUID
    orden: int
    url: str
    descripcion: str | None

    model_config = {"from_attributes": True}


class ProyectoForm(BaseModel):
    nombre: str = Field(max_length=255)
    descripcion: str
    ubicacion: str = Field(max_length=255)
    estado: EstadoProyecto
    precio: int = Field(gt=0)
    financiacion: bool = False
    financiacion_descripcion: str | None = None
    credito_hipotecario: bool = False
    credito_hipotecario_descripcion: str | None = None

    tiene_zonas_comunes: bool = False
    zonas_comunes: list[ZonaComun] | None = None
    ascensor: bool = False

    conjunto_cerrado: bool = False
    valor_administracion_por_definir: bool = False
    valor_administracion: Decimal | None = Field(default=None, ge=0)

    area_m2: Decimal | None = Field(default=None, gt=0)

    tipos: list[ProyectoTipoForm] = Field(default_factory=list)

    @model_validator(mode="after")
    def _validar_financiacion(self) -> "ProyectoForm":
        _normalizar_financiacion(self)
        return self

    @model_validator(mode="after")
    def _validar_zonas_comunes(self) -> "ProyectoForm":
        _normalizar_zonas_comunes(self)
        return self

    @model_validator(mode="after")
    def _validar_conjunto_cerrado(self) -> "ProyectoForm":
        _normalizar_conjunto_cerrado(self)
        return self

    @model_validator(mode="after")
    def _validar_credito_hipotecario(self) -> "ProyectoForm":
        _normalizar_credito_hipotecario(self)
        return self


class ProyectoUpdate(BaseModel):
    nombre: str | None = Field(default=None, max_length=255)
    descripcion: str | None = None
    ubicacion: str | None = Field(default=None, max_length=255)
    estado: EstadoProyecto | None = None
    precio: int | None = Field(default=None, gt=0)
    financiacion: bool | None = None
    financiacion_descripcion: str | None = None
    credito_hipotecario: bool | None = None
    credito_hipotecario_descripcion: str | None = None

    tiene_zonas_comunes: bool | None = None
    zonas_comunes: list[ZonaComun] | None = None
    ascensor: bool | None = None

    conjunto_cerrado: bool | None = None
    valor_administracion_por_definir: bool | None = None
    valor_administracion: Decimal | None = Field(default=None, ge=0)

    area_m2: Decimal | None = Field(default=None, gt=0)

    # None = no tocar los tipos existentes; una lista (incluso vacía) reemplaza
    # por completo los ProyectoTipo del proyecto.
    tipos: list[ProyectoTipoForm] | None = None

    @model_validator(mode="after")
    def _validar_financiacion(self) -> "ProyectoUpdate":
        # El formulario de edición siempre reenvía el objeto completo (no es un PATCH
        # parcial real desde la UI), así que si se especifica financiacion aquí,
        # aplican las mismas reglas que en la creación.
        if self.financiacion is not None:
            _normalizar_financiacion(self)
        return self

    @model_validator(mode="after")
    def _validar_zonas_comunes(self) -> "ProyectoUpdate":
        if self.tiene_zonas_comunes is not None:
            _normalizar_zonas_comunes(self)
        return self

    @model_validator(mode="after")
    def _validar_conjunto_cerrado(self) -> "ProyectoUpdate":
        if self.conjunto_cerrado is not None:
            _normalizar_conjunto_cerrado(self)
        return self

    @model_validator(mode="after")
    def _validar_credito_hipotecario(self) -> "ProyectoUpdate":
        if self.credito_hipotecario is not None:
            _normalizar_credito_hipotecario(self)
        return self


def _normalizar_financiacion(obj: "ProyectoForm | ProyectoUpdate") -> None:
    if not obj.financiacion:
        obj.financiacion_descripcion = None
        return
    if not obj.financiacion_descripcion:
        raise ValueError("Indica la descripción de la financiación.")


def _normalizar_zonas_comunes(obj: "ProyectoForm | ProyectoUpdate") -> None:
    if not obj.tiene_zonas_comunes:
        obj.zonas_comunes = None


def _normalizar_conjunto_cerrado(obj: "ProyectoForm | ProyectoUpdate") -> None:
    if not obj.conjunto_cerrado:
        obj.valor_administracion_por_definir = False
        obj.valor_administracion = None
        return
    if obj.valor_administracion_por_definir:
        obj.valor_administracion = None


def _normalizar_credito_hipotecario(obj: "ProyectoForm | ProyectoUpdate") -> None:
    # A diferencia de financiacion_descripcion, la descripción del crédito
    # hipotecario es opcional incluso cuando credito_hipotecario=True.
    if not obj.credito_hipotecario:
        obj.credito_hipotecario_descripcion = None


class ProyectoPublic(BaseModel):
    id: uuid.UUID
    nombre: str
    descripcion: str
    ubicacion: str
    estado: str
    orden: int
    foto_portada_url: str
    precio: int
    financiacion: bool
    financiacion_descripcion: str | None
    credito_hipotecario: bool
    credito_hipotecario_descripcion: str | None

    tiene_zonas_comunes: bool
    zonas_comunes: list[str] | None
    ascensor: bool

    conjunto_cerrado: bool
    valor_administracion_por_definir: bool
    valor_administracion: Decimal | None

    area_m2: Decimal | None

    tipos: list[ProyectoTipoPublic]
    fotos: list[ProyectoFotoPublic]

    model_config = {"from_attributes": True}


class ProyectosPublic(BaseModel):
    data: list[ProyectoPublic]
    count: int


class ProyectosReorder(BaseModel):
    ids: list[uuid.UUID]
