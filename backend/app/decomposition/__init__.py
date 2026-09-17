"""
Decomposition Engine Module (Phase 7).

Provides formal relational decomposition algorithms, lossless-join verification
(via Tableau Chase & Fagin's Theorem), dependency-preservation verification
(via polynomial-time projected closure analysis), canonical/minimal cover derivation,
and normalized schema synthesis for 2NF, 3NF, and 4NF.
"""

from app.decomposition.minimal_cover import compute_minimal_cover
from app.decomposition.lossless_join import verify_lossless_join_chase, verify_lossless_join_mvd
from app.decomposition.dependency_preservation import (
    project_functional_dependencies,
    verify_dependency_preservation,
)
from app.decomposition.decomposition_engine import (
    decompose_2nf,
    decompose_3nf,
    decompose_4nf,
    analyze_decomposition_pipeline,
    verify_decomposition,
)

__all__ = [
    "compute_minimal_cover",
    "verify_lossless_join_chase",
    "verify_lossless_join_mvd",
    "project_functional_dependencies",
    "verify_dependency_preservation",
    "decompose_2nf",
    "decompose_3nf",
    "decompose_4nf",
    "analyze_decomposition_pipeline",
    "verify_decomposition",
]
