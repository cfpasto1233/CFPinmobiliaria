import logging

from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.db import engine
from app.crud.user import create_user, get_user_by_email
from app.schemas.user import UserCreate

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def init_db(session: Session) -> None:
    existing = get_user_by_email(session=session, email=settings.FIRST_SUPERUSER)
    if not existing:
        user_in = UserCreate(
            email=settings.FIRST_SUPERUSER,
            password=settings.FIRST_SUPERUSER_PASSWORD,
            is_superuser=True,
        )
        create_user(session=session, user_create=user_in)
        logger.info("Superuser created: %s", settings.FIRST_SUPERUSER)
    else:
        logger.info("Superuser already exists: %s", settings.FIRST_SUPERUSER)


if __name__ == "__main__":
    logger.info("Creating initial data...")
    with Session(engine) as session:
        init_db(session)
    logger.info("Done.")
