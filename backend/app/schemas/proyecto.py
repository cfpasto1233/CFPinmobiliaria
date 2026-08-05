import uuid
from typing import Literal

from pydantic import BaseModel, Field, model_validator

EstadoProyecto = Literal["planos", "construccion_1", "construccion_2", "entrega_inmediata"]


class ProyectoForm(BaseModel):
    nombre: str = Field(max_length=255)
    descripcion: str
    ubicacion: str = Field(max_length=255)
    estado: EstadoProyecto
    precio: int = Field(gt=0)
    financiacion: bool = False
    financiacion_descripcion: str | None = None
    credito_hipotecario: bool = False

    @model_validator(mode="after")
    def _validar_financiacion(self) -> "ProyectoForm":
        _normalizar_financiacion(self)
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

    @model_validator(mode="after")
    def _validar_financiacion(self) -> "ProyectoUpdate":
        # El formulario de edición siempre reenvía el objeto completo (no es un PATCH
        # parcial real desde la UI), así que si se especifica financiacion aquí,
        # aplican las mismas reglas que en la creación.
        if self.financiacion is not None:
            _normalizar_financiacion(self)
        return self


def _normalizar_financiacion(obj: "ProyectoForm | ProyectoUpdate") -> None:
    if not obj.financiacion:
        obj.financiacion_descripcion = None
        return
    if not obj.financiacion_descripcion:
        raise ValueError("Indica la descripción de la financiación.")


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

    model_config = {"from_attributes": True}


class ProyectosPublic(BaseModel):
    data: list[ProyectoPublic]
    count: int


class ProyectosReorder(BaseModel):
    ids: list[uuid.UUID]
