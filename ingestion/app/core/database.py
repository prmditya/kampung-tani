from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base
from contextlib import contextmanager
from app.core.config import settings
from app.utils.logger import logger

# Create engine
engine = create_engine(
    settings.DATABASE_URL, pool_pre_ping=True, pool_size=10, max_overflow=20, echo=False
)

# Session factory - bind to engine
# expire_on_commit=False keeps objects usable after commit
SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)

# Base class model
Base = declarative_base()


@contextmanager
def get_db():
    """Context manager for db session"""
    db = SessionLocal()
    try:
        yield db
        db.commit()
    except Exception as e:
        db.rollback()
        logger.error(f"Database error: {e}")
        raise
    finally:
        db.close()


def test_connection():
    """Test db connection"""
    try:
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1"))
            logger.info("DB Connected Successfully")
            return True
    except Exception as e:
        logger.error(f"Connection to db failed error: {e}")
        return False
