import uuid

from sqlalchemy import ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin


class PropiedadFoto(TimestampMixin, Base):
    __tablename__ = "propiedad_fotos"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    propiedad_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("propiedades.id", ondelete="CASCADE"), nullable=False, index=True
    )
    key: Mapped[str] = mapped_column(String(500), nullable=False)
    orden: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    @property
    def url(self) -> str:
        from app.services.storage import public_url

        return public_url(self.key)
