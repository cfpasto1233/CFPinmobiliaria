import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin


class SolicitudDocumentoPropietario(TimestampMixin, Base):
    __tablename__ = "solicitudes_documentos_propietario"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    nombre_completo: Mapped[str] = mapped_column(String(255), nullable=False)
    numero_contacto: Mapped[str] = mapped_column(String(20), nullable=False)
    plan_contratado: Mapped[str] = mapped_column(String(30), nullable=False)

    cedula_key: Mapped[str] = mapped_column(String(500), nullable=False)
    certificado_libertad_key: Mapped[str] = mapped_column(String(500), nullable=False)
    escritura_key: Mapped[str] = mapped_column(String(500), nullable=False)
    poder_key: Mapped[str | None] = mapped_column(String(500), nullable=True)
    comprobante_pago_key: Mapped[str] = mapped_column(String(500), nullable=False)

    validado: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default="false")
    token: Mapped[str | None] = mapped_column(String(64), nullable=True, unique=True)
    token_expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    token_used_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
