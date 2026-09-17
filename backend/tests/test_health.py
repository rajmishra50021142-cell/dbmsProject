import pytest
from httpx import AsyncClient


@pytest.mark.anyio
async def test_health_endpoint(client: AsyncClient):
    response = await client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["service"] == "Normalization Lab API"
    assert data["version"] == "1.0.0"
    assert data["environment"] == "development"
    assert "timestamp" in data


@pytest.mark.anyio
async def test_root_redirect_or_info(client: AsyncClient):
    response = await client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "health" in data
    assert "/api/v1/health" in data["health"]
