import uuid

from sqlalchemy import Integer, String, Text
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

    @property
    def foto_portada_url(self) -> str:
        from app.services.storage import public_url

        return public_url(self.foto_portada_key)
