from fastapi import APIRouter
from app.api.v1.endpoints import (
    health,
    schema,
    closure,
    keys,
    normalization,
    decomposition,
    visualization,
    assistant,
    experiments,
    practice,
    reports,
    history,
)

api_router = APIRouter()

# Mount health check endpoint
api_router.include_router(health.router, tags=["Health"])

# Phase 2 Schema & Input Builder
api_router.include_router(schema.router, prefix="/schema", tags=["Schema Input & Validation"])

# Phase 3 Attribute Closure & FD Engine
api_router.include_router(closure.router, prefix="/closure", tags=["Attribute Closure & FD Engine"])

# Phase 4 Candidate-Key Engine & Superkeys
api_router.include_router(keys.router, prefix="/keys", tags=["Candidate Keys & Superkeys"])

# Phase 5 & 6 1NF-4NF Normalization Analysis
api_router.include_router(normalization.router, prefix="/normalize", tags=["Normalization (1NF–4NF)"])

# Phase 7 Formal Decomposition, Lossless Join & Dependency Preservation
api_router.include_router(decomposition.router, prefix="/decomposition", tags=["Decomposition & Verification"])

# Phase 8 Interactive Visualization Engine & Normalization Journey
api_router.include_router(visualization.router, tags=["Visualization Engine"])

# Phase 9 Contextual Assistant, What-If Experiments & Practice Mode
api_router.include_router(assistant.router, prefix="/assistant", tags=["Normalization Assistant"])
api_router.include_router(experiments.router, prefix="/experiments", tags=["What-If Experiments"])
api_router.include_router(practice.router, prefix="/practice", tags=["Practice Mode"])

# Phase 10 Academic Reports & Downloads (PDF, DOCX, TXT)
api_router.include_router(reports.router, prefix="/reports", tags=["Reports & Downloads"])

# Application Execution & Analysis History
api_router.include_router(history.router, prefix="/history", tags=["Execution & Analysis History"])

