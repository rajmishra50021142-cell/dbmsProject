"""
Context Resolver for Normalization Assistant.

Resolves pronouns, selected entities, stages, dependencies, and violations
from the AssistantContext and user input.
"""

import re
from typing import Optional, List, Dict, Any, Tuple
from app.assistant.schemas import AssistantContext
from app.schemas.domain_contracts import FunctionalDependency


class ContextResolver:
    """Extracts explicit or implicit entities from question and AssistantContext."""

    @classmethod
    def resolve_stage(cls, question: str, entity: Optional[str], context: Optional[AssistantContext]) -> str:
        """Determines the relevant normal form stage (1NF, 2NF, 3NF, 4NF)."""
        if entity in ["1NF", "2NF", "3NF", "4NF"]:
            return entity

        q_lower = question.lower()
        if "1nf" in q_lower or "first" in q_lower:
            return "1NF"
        if "2nf" in q_lower or "second" in q_lower:
            return "2NF"
        if "3nf" in q_lower or "third" in q_lower:
            return "3NF"
        if "4nf" in q_lower or "fourth" in q_lower:
            return "4NF"

        if context and context.last_selected_stage:
            return context.last_selected_stage

        # Fallback to the lowest failing stage in context, if any
        if context and context.normal_forms:
            for s in ["1NF", "2NF", "3NF", "4NF"]:
                if context.normal_forms.get(s) == "VIOLATED":
                    return s

        return "3NF"  # Default canonical educational stage

    @classmethod
    def resolve_closure_target(
        cls, question: str, entity: Optional[str], context: Optional[AssistantContext]
    ) -> List[str]:
        """Resolves the set of attributes whose closure is requested."""
        raw_target = entity
        if not raw_target:
            # Try to match in question
            m = re.search(r"closure\s+of\s+([a-zA-Z0-9_,\s]+)|([a-zA-Z0-9_]+)\s*\+", question, re.IGNORECASE)
            if m:
                raw_target = m.group(1) or m.group(2)

        if raw_target and context and context.attributes:
            # Clean target tokens
            tokens = re.split(r"[,+\s]+", raw_target.strip())
            valid_attrs = [t for t in tokens if t and t.upper() in [a.upper() for a in context.attributes]]
            # Preserve matching casing from context
            resolved = []
            for t in valid_attrs:
                for a in context.attributes:
                    if a.upper() == t.upper() and a not in resolved:
                        resolved.append(a)
            if resolved:
                return resolved

            # Try character-based matching if attributes are single letters (e.g. "AB" -> ["A", "B"])
            single_letters = list(raw_target.replace(" ", "").replace("+", "").replace(",", ""))
            char_resolved = []
            for c in single_letters:
                for a in context.attributes:
                    if a.upper() == c.upper() and a not in char_resolved:
                        char_resolved.append(a)
            if char_resolved:
                return char_resolved

        # Fallback: if last_selected_dependency LHS exists
        if context and context.last_selected_dependency and "→" in context.last_selected_dependency:
            lhs_part = context.last_selected_dependency.split("→")[0].strip()
            lhs_tokens = [x.strip() for x in lhs_part.split(",") if x.strip()]
            if lhs_tokens:
                return lhs_tokens

        # Fallback: first candidate key or first attribute
        if context and context.candidate_keys and len(context.candidate_keys) > 0:
            return context.candidate_keys[0]
        if context and context.attributes and len(context.attributes) > 0:
            return [context.attributes[0]]

        return ["A"]

    @classmethod
    def resolve_relevant_violation(
        cls, stage: str, context: Optional[AssistantContext]
    ) -> Optional[Dict[str, Any]]:
        """Finds violation matching the requested stage."""
        if not context or not context.violations:
            return None

        # Check last selected violation first
        if context.last_selected_violation:
            for v in context.violations:
                if str(v.get("id")) == context.last_selected_violation or context.last_selected_violation in str(v):
                    return v

        # Find first violation belonging to stage
        for v in context.violations:
            v_stage = v.get("stage") or v.get("violation_type")
            if v_stage and stage in str(v_stage):
                return v

        return context.violations[0] if context.violations else None
