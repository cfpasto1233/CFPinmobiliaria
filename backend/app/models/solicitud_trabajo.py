import uuid

from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin


class SolicitudTrabajo(TimestampMixin, Base):
    __tablename__ = "solicitudes_trabajo"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    nombre: Mapped[str] = mapped_column(String(255), nullable=False)
    correo: Mapped[str] = mapped_column(String(255), nullable=False)
    numero_contacto: Mapped[str] = mapped_column(String(20), nullable=False)
    hoja_de_vida_key: Mapped[str] = mapped_column(String(500), nullable=False)
