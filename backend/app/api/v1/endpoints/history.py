"""
FastAPI Endpoints for Execution & Analysis History.
Provides persistent storage, retrieval, and management of past DBMS normalization runs.
"""

from datetime import datetime, timezone
import json
from typing import List, Optional
import uuid
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.database.session import get_db
from app.models.history import AnalysisHistoryItem
from app.schemas.history import (
    HistoryCreateRequest,
    HistoryItemResponse,
    HistoryListResponse,
)

router = APIRouter()


@router.post("", response_model=HistoryItemResponse, status_code=status.HTTP_201_CREATED, summary="Record analysis run")
def create_history_item(
    payload: HistoryCreateRequest,
    db: Session = Depends(get_db),
):
    """
    Persist an analysis run (normalization, keys, closure, or snapshot) in application history.
    """
    item_id = payload.id or f"hist-{uuid.uuid4().hex[:12]}"

    # Check if item with this ID already exists (upsert)
    existing = db.query(AnalysisHistoryItem).filter(AnalysisHistoryItem.id == item_id).first()
    if existing:
        existing.title = payload.title
        existing.analysis_type = payload.analysis_type
        existing.relation_name = payload.relation_name
        existing.highest_normal_form = payload.highest_normal_form
        existing.schema_json = json.dumps(payload.schema_data)
        existing.result_json = json.dumps(payload.analysis_result) if payload.analysis_result else None
        existing.summary_json = json.dumps(payload.summary) if payload.summary else None
        existing.created_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(existing)
        return existing.to_dict()

    new_item = AnalysisHistoryItem(
        id=item_id,
        title=payload.title,
        analysis_type=payload.analysis_type,
        relation_name=payload.relation_name,
        highest_normal_form=payload.highest_normal_form,
        schema_json=json.dumps(payload.schema_data),
        result_json=json.dumps(payload.analysis_result) if payload.analysis_result else None,
        summary_json=json.dumps(payload.summary) if payload.summary else None,
        created_at=datetime.now(timezone.utc),
    )
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return new_item.to_dict()


@router.get("", response_model=HistoryListResponse, summary="List analysis history")
def list_history_items(
    type: Optional[str] = Query(None, description="Filter by analysis_type"),
    limit: int = Query(50, ge=1, le=200, description="Max items to retrieve"),
    db: Session = Depends(get_db),
):
    """
    Retrieve stored analysis history items ordered newest first.
    """
    query = db.query(AnalysisHistoryItem)
    if type:
        query = query.filter(AnalysisHistoryItem.analysis_type == type)

    total = query.count()
    items = query.order_by(desc(AnalysisHistoryItem.created_at)).limit(limit).all()

    return {
        "total": total,
        "items": [item.to_dict() for item in items],
    }


@router.get("/{item_id}", response_model=HistoryItemResponse, summary="Get analysis history item")
def get_history_item(
    item_id: str,
    db: Session = Depends(get_db),
):
    """
    Retrieve a single analysis run by ID including full canonical schema and analysis results.
    """
    item = db.query(AnalysisHistoryItem).filter(AnalysisHistoryItem.id == item_id).first()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"History item with ID '{item_id}' not found.",
        )
    return item.to_dict()


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete history item")
def delete_history_item(
    item_id: str,
    db: Session = Depends(get_db),
):
    """
    Delete a specific history entry.
    """
    item = db.query(AnalysisHistoryItem).filter(AnalysisHistoryItem.id == item_id).first()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"History item with ID '{item_id}' not found.",
        )
    db.delete(item)
    db.commit()
    return None


@router.delete("", status_code=status.HTTP_204_NO_CONTENT, summary="Clear all history")
def clear_all_history(
    db: Session = Depends(get_db),
):
    """
    Clear all application analysis history records.
    """
    db.query(AnalysisHistoryItem).delete()
    db.commit()
    return None
