import uuid
from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


class SolicitudTrabajoForm(BaseModel):
    nombre: str = Field(max_length=255)
    correo: EmailStr = Field(max_length=255)
    numero_contacto: str = Field(max_length=20)


class SolicitudTrabajoPublic(BaseModel):
    id: uuid.UUID
    nombre: str
    correo: str
    numero_contacto: str
    created_at: datetime

    model_config = {"from_attributes": True}


class SolicitudTrabajoDetalle(SolicitudTrabajoPublic):
    hoja_de_vida_url: str


class SolicitudesTrabajoPublic(BaseModel):
    data: list[SolicitudTrabajoPublic]
    count: int
