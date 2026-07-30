import uuid
from datetime import date

from pydantic import BaseModel, Field, model_validator


class CampanaForm(BaseModel):
    nombre: str = Field(max_length=255)
    fecha_inicio: date
    fecha_fin: date
    descripcion_corta: str

    @model_validator(mode="after")
    def _validar_rango_fechas(self) -> "CampanaForm":
        if self.fecha_fin < self.fecha_inicio:
            raise ValueError("La fecha de fin no puede ser anterior a la fecha de inicio.")
        return self


class CampanaPublic(BaseModel):
    id: uuid.UUID
    nombre: str
    fecha_inicio: date
    fecha_fin: date
    descripcion_corta: str

    model_config = {"from_attributes": True}


class CampanaOut(BaseModel):
    data: CampanaPublic | None
