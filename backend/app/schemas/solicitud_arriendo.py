import uuid
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field

MedioContacto = Literal["whatsapp", "llamada", "correo"]


class SolicitudArriendoForm(BaseModel):
    nombre_completo: str = Field(max_length=255)
    numero_contacto: str = Field(max_length=20)
    sector_interes: str = Field(max_length=255)
    precio_maximo: str = Field(max_length=100)
    medio_contacto: MedioContacto
    observaciones: str | None = Field(default=None, max_length=500)


class SolicitudArriendoPublic(BaseModel):
    id: uuid.UUID
    nombre_completo: str
    numero_contacto: str
    sector_interes: str
    precio_maximo: str
    medio_contacto: str
    observaciones: str | None
    created_at: datetime

    model_config = {"from_attributes": True}


class SolicitudesArriendoPublic(BaseModel):
    data: list[SolicitudArriendoPublic]
    count: int
