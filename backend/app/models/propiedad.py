import uuid
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import Numeric, String, Text
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

    fotos: Mapped[list["PropiedadFoto"]] = relationship(
        cascade="all, delete-orphan",
        order_by="PropiedadFoto.orden",
    )

    @property
    def foto_principal_url(self) -> str:
        from app.services.storage import public_url

        return public_url(self.foto_principal_key)
