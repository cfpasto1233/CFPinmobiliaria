import uuid
from typing import Literal

from pydantic import BaseModel, Field

EstadoProyecto = Literal["preventa", "en_construccion", "entrega_inmediata"]


class ProyectoForm(BaseModel):
    nombre: str = Field(max_length=255)
    descripcion: str
    ubicacion: str = Field(max_length=255)
    estado: EstadoProyecto


class ProyectoUpdate(BaseModel):
    nombre: str | None = Field(default=None, max_length=255)
    descripcion: str | None = None
    ubicacion: str | None = Field(default=None, max_length=255)
    estado: EstadoProyecto | None = None


class ProyectoPublic(BaseModel):
    id: uuid.UUID
    nombre: str
    descripcion: str
    ubicacion: str
    estado: str
    orden: int
    foto_portada_url: str

    model_config = {"from_attributes": True}


class ProyectosPublic(BaseModel):
    data: list[ProyectoPublic]
    count: int


class ProyectosReorder(BaseModel):
    ids: list[uuid.UUID]
