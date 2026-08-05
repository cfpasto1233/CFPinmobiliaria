import asyncio
import logging
from collections.abc import AsyncGenerator, Callable
from contextlib import asynccontextmanager
from datetime import date
from typing import Any

import sentry_sdk
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware

from app.api.main import api_router
from app.core.config import settings
from app.core.redis import redis_client
from app.services.purga_solicitudes import purgar_solicitudes_antiguas

if settings.SENTRY_DSN and settings.ENVIRONMENT != "local":
    sentry_sdk.init(dsn=settings.SENTRY_DSN, enable_tracing=True)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

_is_local = settings.ENVIRONMENT == "local"


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: Callable[..., Any]) -> Response:
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        if settings.ENVIRONMENT == "production":
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        return response


PURGA_CHECK_INTERVAL_SECONDS = 6 * 60 * 60


async def _purga_solicitudes_loop() -> None:
    while True:
        lock_key = f"lock:purga-solicitudes:{date.today().isoformat()}"
        try:
            if redis_client.set(lock_key, "1", nx=True, ex=90000):
                await asyncio.to_thread(purgar_solicitudes_antiguas)
        except Exception:
            logger.exception("Error al purgar solicitudes antiguas")
        await asyncio.sleep(PURGA_CHECK_INTERVAL_SECONDS)


@asynccontextmanager
async def lifespan(_app: FastAPI) -> AsyncGenerator[None, None]:
    logger.info("Starting up Cfpasto API...")
    purga_task = asyncio.create_task(_purga_solicitudes_loop())
    yield
    purga_task.cancel()
    logger.info("Shutting down Cfpasto API...")


app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json" if _is_local else None,
    docs_url="/docs" if _is_local else None,
    redoc_url="/redoc" if _is_local else None,
    lifespan=lifespan,
)

origins = [str(origin).rstrip("/") for origin in settings.BACKEND_CORS_ORIGINS]
if origins:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

app.include_router(api_router, prefix=settings.API_V1_STR)
