import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.solicitud_arriendo import SolicitudArriendo
    from app.models.solicitud_venta import SolicitudVenta


class Cita(TimestampMixin, Base):
    __tablename__ = "citas"
    __table_args__ = (
        CheckConstraint(
            "NOT (solicitud_venta_id IS NOT NULL AND solicitud_arriendo_id IS NOT NULL)",
            name="ck_citas_un_solo_vinculo",
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    titulo: Mapped[str] = mapped_column(String(255), nullable=False)
    descripcion: Mapped[str | None] = mapped_column(Text, nullable=True)

    fecha_inicio: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, index=True
    )
    fecha_fin: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, index=True
    )

    estado: Mapped[str] = mapped_column(String(20), nullable=False, server_default="pendiente")

    ubicacion: Mapped[str | None] = mapped_column(String(255), nullable=True)
    nombre_contacto: Mapped[str | None] = mapped_column(String(255), nullable=True)
    telefono_contacto: Mapped[str | None] = mapped_column(String(20), nullable=True)

    solicitud_venta_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("solicitudes_venta.id", ondelete="SET NULL"), nullable=True, index=True
    )
    solicitud_arriendo_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("solicitudes_arriendo.id", ondelete="SET NULL"), nullable=True, index=True
    )

    solicitud_venta: Mapped["SolicitudVenta | None"] = relationship(viewonly=True, lazy="raise")
    solicitud_arriendo: Mapped["SolicitudArriendo | None"] = relationship(
        viewonly=True, lazy="raise"
    )
