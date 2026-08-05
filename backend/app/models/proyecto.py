import uuid

from sqlalchemy import Boolean, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin


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

    @property
    def foto_portada_url(self) -> str:
        from app.services.storage import public_url

        return public_url(self.foto_portada_key)
