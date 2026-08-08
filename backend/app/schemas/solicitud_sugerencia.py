import uuid
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field

MedioComunicacionSugerencia = Literal["whatsapp", "llamada"]


class SolicitudSugerenciaForm(BaseModel):
    nombre: str = Field(max_length=255)
    medio_comunicacion: MedioComunicacionSugerencia
    numero_contacto: str = Field(max_length=20)
    sugerencia: str = Field(max_length=2000)
    desea_contacto: bool


class SolicitudSugerenciaPublic(BaseModel):
    id: uuid.UUID
    nombre: str
    medio_comunicacion: str | None
    numero_contacto: str
    sugerencia: str
    desea_contacto: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class SolicitudesSugerenciasPublic(BaseModel):
    data: list[SolicitudSugerenciaPublic]
    count: int
