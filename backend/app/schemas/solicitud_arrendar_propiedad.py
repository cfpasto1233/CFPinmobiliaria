import uuid
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field

MedioComunicacion = Literal["whatsapp", "llamada", "correo"]


class SolicitudArrendarPropiedadForm(BaseModel):
    nombre_propietario: str = Field(max_length=255)
    medio_comunicacion: MedioComunicacion | None = None
    numero_contacto: str = Field(max_length=20)
    direccion_inmueble: str = Field(max_length=255)
    observaciones: str | None = Field(default=None, max_length=500)


class SolicitudArrendarPropiedadPublic(BaseModel):
    id: uuid.UUID
    nombre_propietario: str
    medio_comunicacion: str | None
    numero_contacto: str
    direccion_inmueble: str
    observaciones: str | None
    created_at: datetime

    model_config = {"from_attributes": True}


class SolicitudesArrendarPropiedadPublic(BaseModel):
    data: list[SolicitudArrendarPropiedadPublic]
    count: int
