import uuid
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field

PlanContratado = Literal["basico", "estandar", "premium", "asesoria_legal"]


class SolicitudDocumentoPropietarioForm(BaseModel):
    nombre_completo: str = Field(max_length=255)
    numero_contacto: str = Field(max_length=20)
    plan_contratado: PlanContratado


class SolicitudDocumentoPropietarioPublic(BaseModel):
    id: uuid.UUID
    nombre_completo: str
    numero_contacto: str
    plan_contratado: str
    validado: bool
    token: str | None
    token_expires_at: datetime | None
    token_used_at: datetime | None
    created_at: datetime

    model_config = {"from_attributes": True}


class SolicitudDocumentoPropietarioDetalle(SolicitudDocumentoPropietarioPublic):
    cedula_url: str
    certificado_libertad_url: str
    escritura_url: str
    poder_url: str | None
    comprobante_pago_url: str


class SolicitudesDocumentosPropietarioPublic(BaseModel):
    data: list[SolicitudDocumentoPropietarioPublic]
    count: int


class SolicitudDocumentoTokenCheck(BaseModel):
    valido: bool
    motivo: str | None = None
