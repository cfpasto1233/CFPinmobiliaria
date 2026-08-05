import uuid

from sqlalchemy import String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin


class SolicitudArriendo(TimestampMixin, Base):
    __tablename__ = "solicitudes_arriendo"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    nombre_completo: Mapped[str] = mapped_column(String(255), nullable=False)
    numero_contacto: Mapped[str] = mapped_column(String(20), nullable=False)
    sector_interes: Mapped[str] = mapped_column(String(255), nullable=False)
    precio_maximo: Mapped[str] = mapped_column(String(100), nullable=False)
    medio_contacto: Mapped[str] = mapped_column(String(20), nullable=False)
    observaciones: Mapped[str | None] = mapped_column(Text, nullable=True)
