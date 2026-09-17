"""
SQLAlchemy Application Models (Reserved for Phase 10 / Persistence).

Contains application data models such as AnalysisRun, SavedSchema, and HistoryItem.
Note: This is strictly for application persistence and not student-entered schemas.
"""
from app.database.base import Base
from app.models.history import AnalysisHistoryItem

__all__ = ["Base", "AnalysisHistoryItem"]
