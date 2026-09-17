"""
Automated Verification for Dedicated Test Fixtures (Sections 114–120).

Tests all conceptual fixture groups:
- tests/fixtures/2nf/
- tests/fixtures/3nf/
- tests/fixtures/4nf/
- tests/fixtures/lossless/
- tests/fixtures/dependency_preservation/
"""

import json
from pathlib import Path
import pytest
from app.schemas.domain_contracts import FunctionalDependency, MultivaluedDependency
from app.decomposition.decomposition_engine import (
    decompose_2nf,
    decompose_3nf,
    decompose_4nf,
)
from app.decomposition.lossless_join import verify_lossless_join_chase
from app.decomposition.dependency_preservation import verify_dependency_preservation

FIXTURES_DIR = Path(__file__).parent / "fixtures"


def test_fixture_2nf():
    fixture_path = FIXTURES_DIR / "2nf" / "enrollment_fixture.json"
    with open(fixture_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    fds = [FunctionalDependency(**fd) for fd in data["functional_dependencies"]]
    plan = decompose_2nf(
        relation_name=data["relation_name"],
        attributes=data["attributes"],
        fds=fds,
        candidate_keys=data["candidate_keys"],
    )

    actual_attr_sets = [set(r.attributes) for r in plan.proposed_relations]
    expected_attr_sets = [set(r) for r in data["expected_relations"]]
    assert set(map(frozenset, actual_attr_sets)) == set(map(frozenset, expected_attr_sets))
    assert plan.lossless_join.is_lossless == data["expected_lossless"]
    assert plan.dependency_preservation.is_preserved == data["expected_dependency_preservation"]


def test_fixture_3nf():
    fixture_path = FIXTURES_DIR / "3nf" / "employee_fixture.json"
    with open(fixture_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    fds = [FunctionalDependency(**fd) for fd in data["functional_dependencies"]]
    plan, min_cover = decompose_3nf(
        relation_name=data["relation_name"],
        attributes=data["attributes"],
        fds=fds,
        candidate_keys=data["candidate_keys"],
    )

    actual_attr_sets = [set(r.attributes) for r in plan.proposed_relations]
    expected_attr_sets = [set(r) for r in data["expected_relations"]]
    assert set(map(frozenset, actual_attr_sets)) == set(map(frozenset, expected_attr_sets))
    assert plan.lossless_join.is_lossless == data["expected_lossless"]
    assert plan.dependency_preservation.is_preserved == data["expected_dependency_preservation"]


def test_fixture_4nf():
    fixture_path = FIXTURES_DIR / "4nf" / "student_hobby_fixture.json"
    with open(fixture_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    mvds = [MultivaluedDependency(**mvd) for mvd in data["multivalued_dependencies"]]
    plan = decompose_4nf(
        relation_name=data["relation_name"],
        attributes=data["attributes"],
        fds=[],
        mvds=mvds,
        candidate_keys=data["candidate_keys"],
    )

    actual_attr_sets = [set(r.attributes) for r in plan.proposed_relations]
    expected_attr_sets = [set(r) for r in data["expected_relations"]]
    assert set(map(frozenset, actual_attr_sets)) == set(map(frozenset, expected_attr_sets))
    assert plan.lossless_join.is_lossless == data["expected_lossless"]


def test_fixture_lossless():
    fixture_path = FIXTURES_DIR / "lossless" / "lossless_fixture.json"
    with open(fixture_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    fds = [FunctionalDependency(**fd) for fd in data["functional_dependencies"]]
    result = verify_lossless_join_chase(
        attributes=data["attributes"],
        fds=fds,
        decomposed_relations=data["relations"],
    )
    assert result.is_lossless == data["expected_lossless"]


def test_fixture_lossy():
    fixture_path = FIXTURES_DIR / "lossless" / "lossy_fixture.json"
    with open(fixture_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    fds = [FunctionalDependency(**fd) for fd in data["functional_dependencies"]]
    result = verify_lossless_join_chase(
        attributes=data["attributes"],
        fds=fds,
        decomposed_relations=data["relations"],
    )
    assert result.is_lossless == data["expected_lossless"]


def test_fixture_dependency_preservation_preserved():
    fixture_path = FIXTURES_DIR / "dependency_preservation" / "preserved_fixture.json"
    with open(fixture_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    fds = [FunctionalDependency(**fd) for fd in data["functional_dependencies"]]
    result = verify_dependency_preservation(
        original_attrs=data["attributes"],
        original_fds=fds,
        decomposed_relations=data["relations"],
    )
    assert result.is_preserved == data["expected_preserved"]


def test_fixture_dependency_preservation_non_preserved():
    fixture_path = FIXTURES_DIR / "dependency_preservation" / "non_preserved_fixture.json"
    with open(fixture_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    fds = [FunctionalDependency(**fd) for fd in data["functional_dependencies"]]
    result = verify_dependency_preservation(
        original_attrs=data["attributes"],
        original_fds=fds,
        decomposed_relations=data["relations"],
    )
    assert result.is_preserved == data["expected_preserved"]
    assert len(result.non_preserved_dependencies) > 0
