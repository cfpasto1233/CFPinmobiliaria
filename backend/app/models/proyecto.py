import uuid
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, Integer, Numeric, String, Text
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.proyecto_foto import ProyectoFoto
    from app.models.proyecto_tipo import ProyectoTipo


class Proyecto(TimestampMixin, Base):
    __tablename__ = "proyectos"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    nombre: Mapped[str] = mapped_column(String(255), nullable=False)
    descripcion: Mapped[str] = mapped_column(Text, nullable=False)
    ubicacion: Mapped[str] = mapped_column(String(255), nullable=False)
    estado: Mapped[str] = mapped_column(String(30), nullable=False)
    foto_portada_key: Mapped[str] = mapped_column(String(500), nullable=False)
    orden: Mapped[int] = mapped_column(Integer, default=0, nullable=False, server_default="0")
    precio: Mapped[int] = mapped_column(Integer, nullable=False, server_default="0")
    financiacion: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default="false")
    financiacion_descripcion: Mapped[str | None] = mapped_column(Text, nullable=True)
    credito_hipotecario: Mapped[bool] = mapped_column(
        Boolean, nullable=False, server_default="false"
    )
    credito_hipotecario_descripcion: Mapped[str | None] = mapped_column(Text, nullable=True)

    tiene_zonas_comunes: Mapped[bool] = mapped_column(
        Boolean, nullable=False, server_default="false"
    )
    zonas_comunes: Mapped[list[str] | None] = mapped_column(ARRAY(String(30)), nullable=True)
    ascensor: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default="false")

    conjunto_cerrado: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default="false")
    valor_administracion_por_definir: Mapped[bool] = mapped_column(
        Boolean, nullable=False, server_default="false"
    )
    valor_administracion: Mapped[Decimal | None] = mapped_column(Numeric(14, 2), nullable=True)

    area_m2: Mapped[Decimal | None] = mapped_column(Numeric(10, 2), nullable=True)

    tipos: Mapped[list["ProyectoTipo"]] = relationship(
        cascade="all, delete-orphan",
        order_by="ProyectoTipo.orden",
    )
    fotos: Mapped[list["ProyectoFoto"]] = relationship(
        cascade="all, delete-orphan",
        order_by="ProyectoFoto.orden",
    )

    @property
    def foto_portada_url(self) -> str:
        from app.services.storage import public_url

        return public_url(self.foto_portada_key)
