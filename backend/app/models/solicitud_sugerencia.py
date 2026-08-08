import uuid

from sqlalchemy import Boolean, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin


class SolicitudSugerencia(TimestampMixin, Base):
    __tablename__ = "solicitudes_sugerencias"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    nombre: Mapped[str] = mapped_column(String(255), nullable=False)
    medio_comunicacion: Mapped[str | None] = mapped_column(String(20), nullable=True)
    numero_contacto: Mapped[str] = mapped_column(String(20), nullable=False)
    sugerencia: Mapped[str] = mapped_column(Text, nullable=False)
    desea_contacto: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default="false")
