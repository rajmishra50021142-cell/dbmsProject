"""
Service orchestrator for What-If / Experiment Mode.

Executes active normalization analysis on immutable original schema and working copy,
then computes mathematical diffs and educational reasoning.
"""

from app.schemas.domain_contracts import CanonicalSchemaInput
from app.normalization.normalization_engine import analyze_full_normalization
from app.experiments.schemas import (
    ExperimentAnalyzeRequest,
    ExperimentAnalyzeResponse,
)
from app.experiments.diff import ExperimentDiffEngine


class ExperimentService:
    """Orchestrates What-If experiment analysis without side effects on original state."""

    @classmethod
    def run_experiment(cls, payload: ExperimentAnalyzeRequest) -> ExperimentAnalyzeResponse:
        # Run real normalization engines on both inputs
        orig_analysis = analyze_full_normalization(payload.original_input)
        mod_analysis = analyze_full_normalization(payload.modified_input)

        # Compute mathematical diff and reasoning
        diff, reasoning = ExperimentDiffEngine.compute_diff(
            orig_input=payload.original_input,
            mod_input=payload.modified_input,
            orig_res=orig_analysis,
            mod_res=mod_analysis,
        )

        return ExperimentAnalyzeResponse(
            original_analysis=orig_analysis,
            modified_analysis=mod_analysis,
            diff=diff,
            reasoning_changes=reasoning,
        )
