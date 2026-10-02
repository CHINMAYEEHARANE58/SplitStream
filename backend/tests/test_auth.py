from collections.abc import Generator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from backend.app.database import Base, get_db
from backend.app.main import create_app


@pytest.fixture()
def client() -> Generator[TestClient, None, None]:
    test_engine = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)
    Base.metadata.create_all(test_engine)
    test_session_factory = sessionmaker(bind=test_engine, autoflush=False, autocommit=False)

    def override_get_db() -> Generator[Session, None, None]:
        session = test_session_factory()
        try:
            yield session
        finally:
            session.close()

    app = create_app(initialize_database=False)
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client


def register(client: TestClient) -> dict[str, str]:
    response = client.post("/auth/register", json={"name": "Chinmayee", "email": "chinmayee@example.com", "password": "strong-password-123"})
    assert response.status_code == 201
    return response.json()


def test_register_login_and_protected_profile(client: TestClient) -> None:
    created = register(client)
    assert created["email"] == "chinmayee@example.com"
    assert "password" not in created

    login = client.post("/auth/login", json={"email": "chinmayee@example.com", "password": "strong-password-123"})
    assert login.status_code == 200
    token = login.json()["access_token"]

    profile = client.get("/users/me", headers={"Authorization": f"Bearer {token}"})
    assert profile.status_code == 200
    assert profile.json()["name"] == "Chinmayee"


def test_duplicate_email_and_invalid_login_are_rejected(client: TestClient) -> None:
    register(client)
    assert client.post("/auth/register", json={"name": "Other", "email": "chinmayee@example.com", "password": "different-password"}).status_code == 409
    assert client.post("/auth/login", json={"email": "chinmayee@example.com", "password": "wrong-password"}).status_code == 401


def test_profile_requires_a_valid_token(client: TestClient) -> None:
    assert client.get("/users/me").status_code == 401
    assert client.get("/users/me", headers={"Authorization": "Bearer invalid"}).status_code == 401
