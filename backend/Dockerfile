FROM python:3.12-slim-bookworm

ENV PYTHONUNBUFFERED=1

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

ENV UV_COMPILE_BYTECODE=1
ENV UV_LINK_MODE=copy

WORKDIR /app/
ENV PATH="/app/.venv/bin:$PATH"

# Instalar dependencias (layer cacheado por uv.lock)
COPY uv.lock pyproject.toml /app/
COPY ./backend/pyproject.toml /app/backend/pyproject.toml
RUN uv sync --frozen --no-install-workspace --package app

# Copiar código
COPY ./backend/scripts /app/backend/scripts
COPY ./backend/pyproject.toml ./backend/alembic.ini /app/backend/
COPY ./backend/app /app/backend/app

RUN uv sync --frozen --package app

WORKDIR /app/backend/

CMD ["bash", "/app/backend/scripts/start.sh"]
