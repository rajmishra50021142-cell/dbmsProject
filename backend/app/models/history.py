"""
SQLAlchemy Application Model for Execution & Analysis History.
Stores past normalization runs, candidate key analyses, closure calculations, and user snapshots.
"""

from datetime import datetime, timezone
import json
from typing import Any, Dict, Optional
from sqlalchemy import Column, String, Text, DateTime
from app.database.base import Base


class AnalysisHistoryItem(Base):
    __tablename__ = "analysis_history"

    id = Column(String(64), primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    analysis_type = Column(String(32), nullable=False, index=True)  # 'normalization', 'keys', 'closure', 'snapshot'
    relation_name = Column(String(128), nullable=False, index=True)
    highest_normal_form = Column(String(32), nullable=True)
    schema_json = Column(Text, nullable=False)  # Canonical relation schema serialized as JSON
    result_json = Column(Text, nullable=True)   # Analysis result object serialized as JSON
    summary_json = Column(Text, nullable=True)  # Lightweight summary metrics (violations count, keys, etc.)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False, index=True)

    def to_dict(self) -> Dict[str, Any]:
        schema_data = {}
        result_data = {}
        summary_data = {}
        try:
            schema_data = json.loads(self.schema_json) if self.schema_json else {}
        except Exception:
            pass
        try:
            result_data = json.loads(self.result_json) if self.result_json else {}
        except Exception:
            pass
        try:
            summary_data = json.loads(self.summary_json) if self.summary_json else {}
        except Exception:
            pass

        return {
            "id": self.id,
            "title": self.title,
            "analysis_type": self.analysis_type,
            "relation_name": self.relation_name,
            "highest_normal_form": self.highest_normal_form,
            "schema_data": schema_data,
            "analysis_result": result_data,
            "summary": summary_data,
            "created_at": self.created_at.isoformat() if self.created_at else datetime.now(timezone.utc).isoformat(),
        }
