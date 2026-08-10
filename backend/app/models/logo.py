import uuid

from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin


class Logo(TimestampMixin, Base):
    __tablename__ = "logos"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    nombre: Mapped[str] = mapped_column(String(255), nullable=False)
    # "aliado" | "inmobiliaria" — controla en qué franja del marquee de la landing aparece.
    tipo: Mapped[str] = mapped_column(String(20), nullable=False)
    imagen_key: Mapped[str] = mapped_column(String(500), nullable=False)

    @property
    def imagen_url(self) -> str:
        from app.services.storage import public_url

        return public_url(self.imagen_key)
