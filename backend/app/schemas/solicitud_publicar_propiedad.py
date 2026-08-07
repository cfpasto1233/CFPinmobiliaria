import uuid
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field

MedioComunicacion = Literal["whatsapp", "llamada", "correo"]


class SolicitudPublicarPropiedadForm(BaseModel):
    nombre_propietario: str = Field(max_length=255)
    medio_comunicacion: MedioComunicacion
    numero_contacto: str = Field(max_length=20)
    direccion_inmueble: str = Field(max_length=255)
    precio_estimado: str = Field(max_length=100)
    descripcion_caracteristicas: str | None = Field(default=None, max_length=1000)
    observaciones: str | None = Field(default=None, max_length=500)


class SolicitudPublicarPropiedadPublic(BaseModel):
    id: uuid.UUID
    nombre_propietario: str
    medio_comunicacion: str | None
    numero_contacto: str
    direccion_inmueble: str
    precio_estimado: str | None
    descripcion_caracteristicas: str | None
    observaciones: str | None
    created_at: datetime

    model_config = {"from_attributes": True}


class SolicitudesPublicarPropiedadPublic(BaseModel):
    data: list[SolicitudPublicarPropiedadPublic]
    count: int
