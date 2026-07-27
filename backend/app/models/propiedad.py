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
    precio: Mapped[Decimal] = mapped_column(Numeric(14, 2), nullable=False)
    tipo: Mapped[str] = mapped_column(String(20), nullable=False)
    foto_principal_key: Mapped[str] = mapped_column(String(500), nullable=False)
    orden: Mapped[int] = mapped_column(Integer, default=0, nullable=False, server_default="0")

    # Tipo de inmueble ("casa" | "apartamento" | "lote"). Los campos siguientes solo
    # aplican a casa/apartamento; para lote quedan en NULL/false.
    tipo_inmueble: Mapped[str] = mapped_column(String(20), nullable=False, server_default="casa")
    banos: Mapped[int | None] = mapped_column(Integer, nullable=True)
    habitaciones: Mapped[int | None] = mapped_column(Integer, nullable=True)
    tiene_parqueadero: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default="false")
    num_parqueaderos: Mapped[int | None] = mapped_column(Integer, nullable=True)
    area_construida: Mapped[Decimal | None] = mapped_column(Numeric(10, 2), nullable=True)
    antiguedad: Mapped[int | None] = mapped_column(Integer, nullable=True)

    fotos: Mapped[list["PropiedadFoto"]] = relationship(
        cascade="all, delete-orphan",
        order_by="PropiedadFoto.orden",
    )

    @property
    def foto_principal_url(self) -> str:
        from app.services.storage import public_url

        return public_url(self.foto_principal_key)
