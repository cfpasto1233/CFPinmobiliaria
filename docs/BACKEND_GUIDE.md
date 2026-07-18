# Backend Guide — FastAPI + SQLAlchemy + Alembic (Cfpasto)

## Stack

- Python 3.12+ gestionado con **UV**
- FastAPI + Pydantic v2
- SQLAlchemy 2.x (modelos declarativos, `mapped_column`, `Mapped`)
- Alembic para migraciones
- PostgreSQL 17
- Redis 7 (caché + rate limiting)
- MinIO (S3) para archivos
- pwdlib (Argon2id + bcrypt fallback)
- slowapi para rate limiting

## Reglas

- **NO SQLModel** — usar SQLAlchemy 2.x puro
- **Contract-first**: todo endpoint tiene schema Pydantic de request/response
- Password hashing irreversible (Argon2id). Nunca loggear passwords ni tokens
- Validaciones server-side siempre

## Estructura

```
backend/app/
├── api/
│   ├── deps.py          # SessionDep, CurrentUser, SuperUser, RefreshTokenDep
│   ├── main.py          # api_router con include_router de todos los módulos
│   └── routes/
│       ├── auth.py      # POST /auth/refresh, POST /auth/logout
│       ├── login.py     # POST /login/access-token
│       ├── users.py     # /me CRUD + admin CRUD
│       └── utils.py     # GET /utils/health-check/
├── core/
│   ├── config.py        # Settings (pydantic-settings)
│   ├── security.py      # create_token, verify_password, hash_password
│   └── db.py            # engine, SessionLocal, get_db
├── crud/
│   └── user.py          # get_user_by_email, create_user, update_user, authenticate
├── db/
│   └── base.py          # Base (DeclarativeBase), TimestampMixin
├── models/
│   ├── __init__.py      # Importa todos los modelos (para Alembic)
│   └── user.py          # User model
├── schemas/
│   ├── token.py         # Token, TokenPayload
│   └── user.py          # UserCreate, UserUpdate, UserPublic, UsersPublic
├── services/            # Lógica de negocio compleja (vacío inicialmente)
├── alembic/             # migraciones (env.py, script.py.mako, versions/)
├── main.py              # FastAPI app + lifespan + CORS + middleware
├── backend_pre_start.py # Espera a que la BD esté lista (tenacity)
└── initial_data.py      # Crea superusuario inicial
```

## Patrones clave

### Dependencias de auth

```python
from app.api.deps import SessionDep, CurrentUser, SuperUser

@router.get("/me")
def read_me(current_user: CurrentUser) -> UserPublic:
    return current_user

@router.post("/admin-only")
def admin_route(_: SuperUser) -> dict:
    ...
```

### CRUD de usuario

```python
from app.crud.user import create_user, update_user, get_user_by_email, authenticate

user = get_user_by_email(session=session, email=email)
user = authenticate(session=session, email=email, password=password)
user = create_user(session=session, user_create=UserCreate(...))
user = update_user(session=session, db_user=user, user_in=UserUpdate(...))
```

### Crear un nuevo modelo

```python
# backend/app/models/mi_entidad.py
import uuid
from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base, TimestampMixin

class MiEntidad(TimestampMixin, Base):
    __tablename__ = "mi_entidades"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    nombre: Mapped[str] = mapped_column(String(255), nullable=False)
    descripcion: Mapped[str | None] = mapped_column(String(500))
```

Agregar a `backend/app/models/__init__.py`:
```python
from app.models.mi_entidad import MiEntidad
__all__ = [..., "MiEntidad"]
```

### Schema Pydantic

```python
# backend/app/schemas/mi_entidad.py
import uuid
from pydantic import BaseModel, Field

class MiEntidadCreate(BaseModel):
    nombre: str = Field(max_length=255)
    descripcion: str | None = Field(default=None, max_length=500)

class MiEntidadUpdate(BaseModel):
    nombre: str | None = Field(default=None, max_length=255)
    descripcion: str | None = Field(default=None, max_length=500)

class MiEntidadPublic(BaseModel):
    id: uuid.UUID
    nombre: str
    descripcion: str | None
    model_config = {"from_attributes": True}

class MiEntidadesPublic(BaseModel):
    data: list[MiEntidadPublic]
    count: int
```

### CRUD function

```python
# backend/app/crud/mi_entidad.py
from sqlalchemy import func, select
from sqlalchemy.orm import Session
from app.models.mi_entidad import MiEntidad
from app.schemas.mi_entidad import MiEntidadCreate, MiEntidadUpdate

def create_mi_entidad(*, session: Session, obj_in: MiEntidadCreate) -> MiEntidad:
    db_obj = MiEntidad(**obj_in.model_dump())
    session.add(db_obj)
    session.commit()
    session.refresh(db_obj)
    return db_obj

def list_mi_entidades(*, session: Session, skip: int = 0, limit: int = 100) -> tuple[list[MiEntidad], int]:
    count = session.scalar(select(func.count()).select_from(MiEntidad))
    items = session.scalars(select(MiEntidad).offset(skip).limit(limit)).all()
    return list(items), count or 0
```

### Router

```python
# backend/app/api/routes/mi_entidad.py
import uuid
from fastapi import APIRouter, HTTPException
from app.api.deps import CurrentUser, SessionDep
from app.crud.mi_entidad import create_mi_entidad, list_mi_entidades
from app.schemas.mi_entidad import MiEntidadCreate, MiEntidadPublic, MiEntidadesPublic

router = APIRouter(prefix="/mi-entidad", tags=["mi-entidad"])

@router.get("/", response_model=MiEntidadesPublic)
def list_endpoint(session: SessionDep, _: CurrentUser, skip: int = 0, limit: int = 100):
    items, count = list_mi_entidades(session=session, skip=skip, limit=limit)
    return MiEntidadesPublic(data=items, count=count)

@router.post("/", response_model=MiEntidadPublic)
def create_endpoint(session: SessionDep, _: CurrentUser, obj_in: MiEntidadCreate):
    return create_mi_entidad(session=session, obj_in=obj_in)
```

Registrar en `backend/app/api/main.py`:
```python
from app.api.routes import mi_entidad
api_router.include_router(mi_entidad.router)
```

## Flujo de migraciones

```bash
cd backend

# Generar migración (con la DB corriendo)
POSTGRES_SERVER=localhost uv run alembic revision --autogenerate -m "descripcion"

# Revisar el archivo generado en app/alembic/versions/
# Aplicar
POSTGRES_SERVER=localhost uv run alembic upgrade head

# Estado
POSTGRES_SERVER=localhost uv run alembic current

# Historial
uv run alembic history

# Revertir último
POSTGRES_SERVER=localhost uv run alembic downgrade -1
```

## Variables de entorno clave

```env
POSTGRES_SERVER=db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=...
POSTGRES_DB=app
SECRET_KEY=...                    # mínimo 32 chars
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_MINUTES=10080  # 7 días
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=...
MINIO_ENDPOINT=minio:9000
MINIO_BUCKET=cfpasto
SMTP_HOST=mailcatcher
EMAILS_FROM_EMAIL=noreply@cfpasto.com
FIRST_SUPERUSER=admin@example.com
FIRST_SUPERUSER_PASSWORD=...
```

## Respuestas de error consistentes

```python
from fastapi import HTTPException

# 400 — Datos inválidos
raise HTTPException(status_code=400, detail="Mensaje descriptivo del error")

# 401 — No autenticado
raise HTTPException(status_code=401, detail="Not authenticated")

# 403 — Sin permisos
raise HTTPException(status_code=403, detail="Insufficient privileges")

# 404 — Recurso no encontrado
raise HTTPException(status_code=404, detail="Resource not found")

# 409 — Conflicto (ej. email duplicado)
raise HTTPException(status_code=409, detail="Email already registered")
```
