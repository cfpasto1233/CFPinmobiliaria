import uuid
from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, Field, model_validator

EstadoCita = Literal["pendiente", "confirmada", "cancelada", "completada"]
HoraRecaudo = Literal["09:00", "11:00", "15:00", "18:00"]


class CitaForm(BaseModel):
    titulo: str = Field(max_length=255)
    descripcion: str | None = None
    fecha_inicio: datetime
    fecha_fin: datetime
    estado: EstadoCita = "pendiente"
    ubicacion: str | None = Field(default=None, max_length=255)
    nombre_contacto: str | None = Field(default=None, max_length=255)
    telefono_contacto: str | None = Field(default=None, max_length=20)
    solicitud_venta_id: uuid.UUID | None = None
    solicitud_arriendo_id: uuid.UUID | None = None

    @model_validator(mode="after")
    def _validar(self) -> "CitaForm":
        if self.fecha_fin <= self.fecha_inicio:
            raise ValueError("La fecha de fin debe ser posterior a la fecha de inicio.")
        if self.solicitud_venta_id and self.solicitud_arriendo_id:
            raise ValueError(
                "Una cita solo puede vincularse a una solicitud de venta o de arriendo, no a ambas."
            )
        return self


class CitaUpdate(BaseModel):
    titulo: str | None = Field(default=None, max_length=255)
    descripcion: str | None = None
    fecha_inicio: datetime | None = None
    fecha_fin: datetime | None = None
    estado: EstadoCita | None = None
    ubicacion: str | None = Field(default=None, max_length=255)
    nombre_contacto: str | None = Field(default=None, max_length=255)
    telefono_contacto: str | None = Field(default=None, max_length=20)
    solicitud_venta_id: uuid.UUID | None = None
    solicitud_arriendo_id: uuid.UUID | None = None

    @model_validator(mode="after")
    def _validar(self) -> "CitaUpdate":
        if self.fecha_inicio and self.fecha_fin and self.fecha_fin <= self.fecha_inicio:
            raise ValueError("La fecha de fin debe ser posterior a la fecha de inicio.")
        if self.solicitud_venta_id and self.solicitud_arriendo_id:
            raise ValueError(
                "Una cita solo puede vincularse a una solicitud de venta o de arriendo, no a ambas."
            )
        return self


class CitaPublic(BaseModel):
    id: uuid.UUID
    titulo: str
    descripcion: str | None
    fecha_inicio: datetime
    fecha_fin: datetime
    estado: str
    ubicacion: str | None
    nombre_contacto: str | None
    telefono_contacto: str | None
    solicitud_venta_id: uuid.UUID | None
    solicitud_arriendo_id: uuid.UUID | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class CitasPublic(BaseModel):
    data: list[CitaPublic]
    count: int


class CitaOut(BaseModel):
    data: CitaPublic | None


class CitaRecaudoForm(BaseModel):
    nombre_contacto: str = Field(max_length=255)
    telefono_contacto: str = Field(max_length=20)
    direccion_recaudo: str = Field(max_length=255)
    observaciones: str | None = Field(default=None, max_length=500)
    fecha: date
    hora: HoraRecaudo


class DisponibilidadDia(BaseModel):
    fecha: date
    color: Literal["verde", "amarillo", "no_disponible"]
    horas_disponibles: list[str]


class DisponibilidadRecaudoPublic(BaseModel):
    dias: list[DisponibilidadDia]
