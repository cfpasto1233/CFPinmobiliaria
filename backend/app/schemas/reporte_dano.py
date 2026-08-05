import uuid
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field, model_validator

MedioComunicacionReporte = Literal["whatsapp", "llamada"]
TipoReporteDano = Literal[
    "tuberia", "techo", "estructura", "instalacion_electrica", "humedad", "otros"
]


class ReporteDanoForm(BaseModel):
    nombre_completo: str = Field(max_length=255)
    medio_comunicacion: MedioComunicacionReporte | None = None
    numero_contacto: str = Field(max_length=20)
    tipo_reporte: TipoReporteDano
    tipo_reporte_otro: str | None = Field(default=None, max_length=100)
    descripcion_dano: str = Field(max_length=1000)

    @model_validator(mode="after")
    def _validar_tipo_reporte_otro(self) -> "ReporteDanoForm":
        if self.tipo_reporte == "otros" and not (self.tipo_reporte_otro or "").strip():
            raise ValueError("Especifica el tipo de daño en 'Otro'.")
        return self


class ReporteDanoPublic(BaseModel):
    id: uuid.UUID
    nombre_completo: str
    medio_comunicacion: str | None
    numero_contacto: str
    tipo_reporte: str
    tipo_reporte_otro: str | None
    descripcion_dano: str
    fotos: list[str]
    created_at: datetime

    model_config = {"from_attributes": True}


class ReportesDanoPublic(BaseModel):
    data: list[ReporteDanoPublic]
    count: int


class ReporteDanoFotosPublic(BaseModel):
    # Solo URLs firmadas — a propósito sin nombre/contacto/descripción, este endpoint es
    # exclusivamente para entregar fotos vía un link compartido.
    fotos: list[str]
