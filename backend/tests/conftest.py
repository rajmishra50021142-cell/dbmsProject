import sys
import os
from pathlib import Path
import pytest
from httpx import AsyncClient, ASGITransport

# Add backend root to Python path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.main import app


@pytest.fixture
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as c:
        yield c
