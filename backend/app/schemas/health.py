from datetime import datetime, timezone
from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    status: str = Field(default="ok", description="Overall health status of the API service")
    version: str = Field(..., description="Application semantic version")
    service: str = Field(..., description="Service name")
    environment: str = Field(..., description="Runtime environment")
    timestamp: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="UTC timestamp of the health check"
    )

    model_config = {
        "json_schema_extra": {
            "example": {
                "status": "ok",
                "version": "1.0.0",
                "service": "Normalization Lab API",
                "environment": "development",
                "timestamp": "2026-09-17T03:30:00Z"
            }
        }
    }
