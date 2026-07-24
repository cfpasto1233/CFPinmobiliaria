import uuid
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, Field

TipoPropiedad = Literal["venta", "arriendo"]


class PropiedadForm(BaseModel):
    nombre: str = Field(max_length=255)
    descripcion: str
    ubicacion: str = Field(max_length=255)
    precio: Decimal = Field(gt=0)
    tipo: TipoPropiedad


class PropiedadUpdate(BaseModel):
    nombre: str | None = Field(default=None, max_length=255)
    descripcion: str | None = None
    ubicacion: str | None = Field(default=None, max_length=255)
    precio: Decimal | None = Field(default=None, gt=0)
    tipo: TipoPropiedad | None = None


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

    model_config = {"from_attributes": True}


class PropiedadesPublic(BaseModel):
    data: list[PropiedadPublic]
    count: int


class PropiedadesReorder(BaseModel):
    ids: list[uuid.UUID]
