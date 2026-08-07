import uuid

from sqlalchemy import String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin


class SolicitudPublicarPropiedad(TimestampMixin, Base):
    __tablename__ = "solicitudes_publicar_propiedad"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    nombre_propietario: Mapped[str] = mapped_column(String(255), nullable=False)
    medio_comunicacion: Mapped[str | None] = mapped_column(String(20), nullable=True)
    numero_contacto: Mapped[str] = mapped_column(String(20), nullable=False)
    direccion_inmueble: Mapped[str] = mapped_column(String(255), nullable=False)
    precio_estimado: Mapped[str | None] = mapped_column(String(100), nullable=True)
    descripcion_caracteristicas: Mapped[str | None] = mapped_column(Text, nullable=True)
    observaciones: Mapped[str | None] = mapped_column(Text, nullable=True)
