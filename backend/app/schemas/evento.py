import uuid
from datetime import date

from pydantic import BaseModel, Field


class EventoForm(BaseModel):
    nombre: str = Field(max_length=255)
    descripcion: str
    fecha: date


class EventoUpdate(BaseModel):
    nombre: str | None = Field(default=None, max_length=255)
    descripcion: str | None = None
    fecha: date | None = None


class EventoPublic(BaseModel):
    id: uuid.UUID
    nombre: str
    descripcion: str
    fecha: date
    foto_url: str

    model_config = {"from_attributes": True}


class EventosPublic(BaseModel):
    data: list[EventoPublic]
    count: int
