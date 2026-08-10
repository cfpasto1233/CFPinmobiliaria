import uuid
from typing import Literal

from pydantic import BaseModel, Field

TipoLogo = Literal["aliado", "inmobiliaria"]


class LogoForm(BaseModel):
    nombre: str = Field(max_length=255)
    tipo: TipoLogo


class LogoUpdate(BaseModel):
    nombre: str | None = Field(default=None, max_length=255)
    tipo: TipoLogo | None = None


class LogoPublic(BaseModel):
    id: uuid.UUID
    nombre: str
    tipo: str
    imagen_url: str

    model_config = {"from_attributes": True}


class LogosPublic(BaseModel):
    data: list[LogoPublic]
    count: int
