import uuid
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, Integer, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.propiedad_foto import PropiedadFoto


class Propiedad(TimestampMixin, Base):
    __tablename__ = "propiedades"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    nombre: Mapped[str] = mapped_column(String(255), nullable=False)
    descripcion: Mapped[str] = mapped_column(Text, nullable=False)
    ubicacion: Mapped[str] = mapped_column(String(255), nullable=False)
    whatsapp: Mapped[str | None] = mapped_column(String(20), nullable=True)
    precio: Mapped[Decimal] = mapped_column(Numeric(14, 2), nullable=False)
    tipo: Mapped[str] = mapped_column(String(20), nullable=False)
    foto_principal_key: Mapped[str] = mapped_column(String(500), nullable=False)
    orden: Mapped[int] = mapped_column(Integer, default=0, nullable=False, server_default="0")

    # Tipo de inmueble ("casa" | "apartamento" | "lote" | "local" | "finca" |
    # "apartaestudio" | "oficina"). Qué campos de detalle aplican y cuáles son
    # obligatorios depende del tipo — ver la matriz en schemas/propiedad.py. Los
    # que no aplican para un tipo dado quedan en NULL/false.
    tipo_inmueble: Mapped[str] = mapped_column(String(20), nullable=False, server_default="casa")
    banos: Mapped[int | None] = mapped_column(Integer, nullable=True)
    habitaciones: Mapped[int | None] = mapped_column(Integer, nullable=True)
    tiene_parqueadero: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default="false")
    num_parqueaderos: Mapped[int | None] = mapped_column(Integer, nullable=True)
    tipo_parqueadero: Mapped[str | None] = mapped_column(String(20), nullable=True)
    area_construida: Mapped[Decimal | None] = mapped_column(Numeric(10, 2), nullable=True)
    area_lote: Mapped[Decimal | None] = mapped_column(Numeric(10, 2), nullable=True)
    frente: Mapped[Decimal | None] = mapped_column(Numeric(10, 2), nullable=True)
    fondo: Mapped[Decimal | None] = mapped_column(Numeric(10, 2), nullable=True)
    antiguedad: Mapped[int | None] = mapped_column(Integer, nullable=True)
    piso: Mapped[int | None] = mapped_column(Integer, nullable=True)
    vista: Mapped[str | None] = mapped_column(String(20), nullable=True)

    balcon: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default="false")
    terraza: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default="false")
    patio: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default="false")
    bodega: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default="false")
    zona_bbq: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default="false")
    piscina: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default="false")
    cocina: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default="false")

    conjunto_cerrado: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default="false")
    tiene_administracion: Mapped[bool] = mapped_column(
        Boolean, nullable=False, server_default="false"
    )
    valor_administracion: Mapped[Decimal | None] = mapped_column(Numeric(14, 2), nullable=True)
    zonas_comunes: Mapped[str | None] = mapped_column(Text, nullable=True)

    actividad: Mapped[str | None] = mapped_column(Text, nullable=True)
    rural_urbano: Mapped[str | None] = mapped_column(String(10), nullable=True)
    tiene_servicios: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default="false")
    tiene_alcantarillado: Mapped[bool] = mapped_column(
        Boolean, nullable=False, server_default="false"
    )
    tiene_acueducto: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default="false")

    permite_permuta: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default="false")
    adicionales: Mapped[str | None] = mapped_column(Text, nullable=True)

    tiene_gravamenes: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default="false")
    tiene_hipoteca: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default="false")

    fotos: Mapped[list["PropiedadFoto"]] = relationship(
        cascade="all, delete-orphan",
        order_by="PropiedadFoto.orden",
    )

    @property
    def foto_principal_url(self) -> str:
        from app.services.storage import public_url

        return public_url(self.foto_principal_key)
