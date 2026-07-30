import uuid

from sqlalchemy import String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin


class SolicitudVenta(TimestampMixin, Base):
    __tablename__ = "solicitudes_venta"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    nombre_completo: Mapped[str] = mapped_column(String(255), nullable=False)
    medio_comunicacion: Mapped[str] = mapped_column(String(20), nullable=False)
    presupuesto_total: Mapped[str] = mapped_column(String(100), nullable=False)
    forma_pago: Mapped[str] = mapped_column(String(30), nullable=False)

    sectores_interes: Mapped[str | None] = mapped_column(String(255), nullable=True)
    valor_disponible_credito: Mapped[str | None] = mapped_column(String(100), nullable=True)
    valor_disponible_contado: Mapped[str | None] = mapped_column(String(100), nullable=True)
    forma_pago_otro: Mapped[str | None] = mapped_column(Text, nullable=True)
