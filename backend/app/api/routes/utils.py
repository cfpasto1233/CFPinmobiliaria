from fastapi import APIRouter

router = APIRouter(prefix="/utils", tags=["utils"])


@router.get("/health-check/")
def health_check() -> dict[str, str]:
    return {"status": "ok"}
