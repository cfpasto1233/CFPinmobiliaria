import uuid
from decimal import Decimal

from sqlalchemy import Boolean, ForeignKey, Integer, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin


class ProyectoTipo(TimestampMixin, Base):
    __tablename__ = "proyecto_tipos"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    proyecto_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("proyectos.id", ondelete="CASCADE"), nullable=False, index=True
    )
    categoria: Mapped[str] = mapped_column(String(20), nullable=False)
    area_m2: Mapped[Decimal | None] = mapped_column(Numeric(10, 2), nullable=True)
    precio: Mapped[Decimal | None] = mapped_column(Numeric(14, 2), nullable=True)
    habitaciones: Mapped[int] = mapped_column(Integer, nullable=False)
    banos: Mapped[int] = mapped_column(Integer, nullable=False)
    balcon: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default="false")
    terraza: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default="false")
    parqueadero: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default="false")
    patio: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default="false")
    vista: Mapped[str] = mapped_column(String(20), nullable=False)
    orden: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
