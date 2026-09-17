"""
Comprehensive Unit Tests for Attribute Closure and Determination Engine.
"""

import pytest
from app.schemas.domain_contracts import FunctionalDependency
from app.normalization.closure_engine import (
    compute_attribute_closure,
    check_functional_determination,
    ClosureEngineError,
)


def test_closure_basic_chain():
    attrs = ["A", "B", "C", "D"]
    fds = [
        FunctionalDependency(left=["A"], right=["B"]),
        FunctionalDependency(left=["B"], right=["C"]),
        FunctionalDependency(left=["C"], right=["D"]),
    ]
    result = compute_attribute_closure(attrs, fds, target_attributes=["A"])

    assert set(result.closure_attributes) == {"A", "B", "C", "D"}
    assert result.is_superkey is True
    assert len(result.steps) == 4  # 1 initial + 3 applied FDs
    assert result.applied_fds[0].left == ["A"]
    assert result.applied_fds[1].left == ["B"]
    assert result.applied_fds[2].left == ["C"]


def test_closure_reverse_order_dependencies():
    attrs = ["A", "B", "C", "D"]
    # Dependencies supplied in reverse chronological order
    fds = [
        FunctionalDependency(left=["C"], right=["D"]),
        FunctionalDependency(left=["B"], right=["C"]),
        FunctionalDependency(left=["A"], right=["B"]),
    ]
    result = compute_attribute_closure(attrs, fds, target_attributes=["A"])

    assert set(result.closure_attributes) == {"A", "B", "C", "D"}
    assert result.fixed_point_reached is True


def test_closure_composite_determinant():
    attrs = ["A", "B", "C", "D"]
    fds = [
        FunctionalDependency(left=["A", "B"], right=["C"]),
        FunctionalDependency(left=["C"], right=["D"]),
    ]

    # Target A alone should NOT fire A, B -> C
    res_a = compute_attribute_closure(attrs, fds, target_attributes=["A"])
    assert set(res_a.closure_attributes) == {"A"}
    assert res_a.is_superkey is False

    # Target A, B should fire both
    res_ab = compute_attribute_closure(attrs, fds, target_attributes=["A", "B"])
    assert set(res_ab.closure_attributes) == {"A", "B", "C", "D"}
    assert res_ab.is_superkey is True


def test_closure_multiple_rhs():
    attrs = ["A", "B", "C", "D"]
    fds = [
        FunctionalDependency(left=["A"], right=["B", "C"]),
        FunctionalDependency(left=["C"], right=["D"]),
    ]
    result = compute_attribute_closure(attrs, fds, target_attributes=["A"])
    assert set(result.closure_attributes) == {"A", "B", "C", "D"}


def test_closure_independent_components():
    attrs = ["A", "B", "C", "D"]
    fds = [
        FunctionalDependency(left=["A"], right=["B"]),
        FunctionalDependency(left=["C"], right=["D"]),
    ]
    result = compute_attribute_closure(attrs, fds, target_attributes=["A"])
    assert set(result.closure_attributes) == {"A", "B"}
    assert result.is_superkey is False


def test_closure_cyclic_dependencies():
    attrs = ["A", "B", "C"]
    fds = [
        FunctionalDependency(left=["A"], right=["B"]),
        FunctionalDependency(left=["B"], right=["C"]),
        FunctionalDependency(left=["C"], right=["A"]),
    ]
    result = compute_attribute_closure(attrs, fds, target_attributes=["A"])
    assert set(result.closure_attributes) == {"A", "B", "C"}
    assert result.fixed_point_reached is True


def test_closure_no_applicable_dependencies():
    attrs = ["A", "B", "C", "D"]
    fds = [
        FunctionalDependency(left=["C"], right=["D"]),
    ]
    result = compute_attribute_closure(attrs, fds, target_attributes=["A"])
    assert set(result.closure_attributes) == {"A"}
    assert len(result.steps) == 1  # only initial step


def test_check_functional_determination():
    attrs = ["A", "B", "C", "D"]
    fds = [
        FunctionalDependency(left=["A"], right=["B"]),
        FunctionalDependency(left=["B"], right=["C"]),
    ]

    # Does A determine C? Yes
    res_yes = check_functional_determination(attrs, fds, lhs=["A"], rhs=["C"])
    assert res_yes.determined is True
    assert res_yes.missing_attributes == []

    # Does A determine D? No
    res_no = check_functional_determination(attrs, fds, lhs=["A"], rhs=["D"])
    assert res_no.determined is False
    assert res_no.missing_attributes == ["D"]


def test_closure_validation_errors():
    attrs = ["A", "B", "C"]
    fds = [FunctionalDependency(left=["A"], right=["B"])]

    # Unknown target
    with pytest.raises(ClosureEngineError, match="do not exist in relation"):
        compute_attribute_closure(attrs, fds, target_attributes=["Z"])

    # Unknown FD attribute
    bad_fds = [FunctionalDependency(left=["A"], right=["UNKNOWN"])]
    with pytest.raises(ClosureEngineError, match="references unknown attribute"):
        compute_attribute_closure(attrs, bad_fds, target_attributes=["A"])
