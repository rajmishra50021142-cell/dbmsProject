from app.core.config import settings
from app.schemas.domain_contracts import FunctionalDependency, RelationInput


def test_settings_loaded():
    assert settings.PROJECT_NAME == "Normalization Lab API"
    assert settings.VERSION == "1.0.0"
    assert settings.API_V1_STR == "/api/v1"
    assert "http://localhost:5173" in settings.BACKEND_CORS_ORIGINS


def test_domain_contracts_schema():
    fd = FunctionalDependency(left=["StudentID"], right=["StudentName"])
    assert fd.notation() == "StudentID → StudentName"

    relation = RelationInput(
        name="STUDENT",
        attributes=["StudentID", "StudentName"],
        functional_dependencies=[fd]
    )
    assert relation.name == "STUDENT"
    assert len(relation.attributes) == 2
    assert relation.functional_dependencies[0].left == ["StudentID"]
