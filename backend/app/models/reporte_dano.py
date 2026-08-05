import uuid

from sqlalchemy import String, Text
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin


class ReporteDano(TimestampMixin, Base):
    __tablename__ = "reportes_dano"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    nombre_completo: Mapped[str] = mapped_column(String(255), nullable=False)
    medio_comunicacion: Mapped[str | None] = mapped_column(String(20), nullable=True)
    numero_contacto: Mapped[str] = mapped_column(String(20), nullable=False)
    tipo_reporte: Mapped[str] = mapped_column(String(30), nullable=False)
    tipo_reporte_otro: Mapped[str | None] = mapped_column(String(100), nullable=True)
    descripcion_dano: Mapped[str] = mapped_column(Text, nullable=False)
    fotos: Mapped[list[str]] = mapped_column(ARRAY(String(500)), nullable=False, default=list)
