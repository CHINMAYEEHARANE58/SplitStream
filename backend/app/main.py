import logging
from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select, text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from .auth import create_access_token, get_current_user, hash_password, verify_password
from .database import Base, engine, get_db
from .models import User
from .schemas import LoginRequest, RegisterRequest, TokenResponse, UserRead

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s %(message)s")
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(_: FastAPI):
    Base.metadata.create_all(engine)
    logger.info("SplitStream database schema is ready")
    yield


def create_app(*, initialize_database: bool = True) -> FastAPI:
    app = FastAPI(
        title="SplitStream API",
        version="0.1.0",
        description="Smart group expenses, settlements, and real-time spending analytics.",
        lifespan=lifespan if initialize_database else None,
    )
    # Vite serves the development UI separately. Restrict CORS to its local
    # origins so the browser can call this API without opening it to everyone.
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
        allow_credentials=False,
        allow_methods=["GET", "POST", "OPTIONS"],
        allow_headers=["Authorization", "Content-Type"],
    )

    @app.post("/auth/register", response_model=UserRead, status_code=status.HTTP_201_CREATED, tags=["authentication"])
    def register(payload: RegisterRequest, db: Session = Depends(get_db)) -> User:
        existing = db.scalar(select(User).where(User.email == payload.email))
        if existing:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email is already registered")
        user = User(name=payload.name, email=payload.email, password_hash=hash_password(payload.password))
        db.add(user)
        db.commit()
        db.refresh(user)
        logger.info("registered user_id=%s", user.id)
        return user

    @app.post("/auth/login", response_model=TokenResponse, tags=["authentication"])
    def login(payload: LoginRequest, db: Session = Depends(get_db)) -> TokenResponse:
        user = db.scalar(select(User).where(User.email == payload.email))
        if user is None or not verify_password(payload.password, user.password_hash):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
        return TokenResponse(access_token=create_access_token(user.id))

    @app.get("/users/me", response_model=UserRead, tags=["users"])
    def current_user(user: User = Depends(get_current_user)) -> User:
        return user

    @app.get("/health", tags=["system"])
    def health(db: Session = Depends(get_db)) -> dict[str, str]:
        try:
            db.execute(text("SELECT 1"))
        except SQLAlchemyError:
            logger.exception("database health check failed")
            return {"status": "degraded", "database": "unavailable"}
        return {"status": "ok", "database": "connected"}

    return app


app = create_app()
