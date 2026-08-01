import uuid
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field, model_validator

MedioComunicacion = Literal["whatsapp", "llamada"]
FormaPagoVenta = Literal["contado", "credito_hipotecario", "otros"]


class SolicitudVentaForm(BaseModel):
    nombre_completo: str = Field(max_length=255)
    medio_comunicacion: MedioComunicacion
    numero: str = Field(max_length=20)
    presupuesto_total: str = Field(max_length=100)
    forma_pago: FormaPagoVenta

    sectores_interes: str = Field(max_length=255)
    valor_disponible_credito: str | None = Field(default=None, max_length=100)
    valor_disponible_contado: str | None = Field(default=None, max_length=100)
    forma_pago_otro: str | None = None
    sugerencias: str | None = None

    @model_validator(mode="after")
    def _validar_segun_forma_pago(self) -> "SolicitudVentaForm":
        if self.forma_pago == "contado":
            self.valor_disponible_credito = None
            self.valor_disponible_contado = None
            self.forma_pago_otro = None
        elif self.forma_pago == "credito_hipotecario":
            if not self.valor_disponible_credito:
                raise ValueError("Indica el valor disponible a crédito.")
            if not self.valor_disponible_contado:
                raise ValueError(
                    "Indica el valor disponible de contado (usa 0 si es todo a crédito)."
                )
            self.forma_pago_otro = None
        else:
            if not self.forma_pago_otro:
                raise ValueError("Describe la forma de pago.")
            self.valor_disponible_credito = None
            self.valor_disponible_contado = None
        return self


class SolicitudVentaPublic(BaseModel):
    id: uuid.UUID
    nombre_completo: str
    medio_comunicacion: str
    numero: str | None
    presupuesto_total: str
    forma_pago: str
    sectores_interes: str | None
    valor_disponible_credito: str | None
    valor_disponible_contado: str | None
    forma_pago_otro: str | None
    sugerencias: str | None
    created_at: datetime

    model_config = {"from_attributes": True}


class SolicitudesVentaPublic(BaseModel):
    data: list[SolicitudVentaPublic]
    count: int
