"""
Tests for Mathematical Attribute Set Utilities.
"""

from app.normalization.attribute_set import (
    normalize_attribute_set,
    is_subset,
    is_proper_subset,
    set_equals,
    set_union,
    set_intersection,
    set_difference,
    to_attribute_set,
)


def test_normalize_attribute_set():
    raw = ["  StudentID  ", "CourseID", "StudentID", "", "  "]
    result = normalize_attribute_set(raw)
    assert result == ["StudentID", "CourseID"]


def test_is_subset():
    assert is_subset(["A", "B"], ["B", "C", "A"])
    assert is_subset([], ["A", "B"])
    assert is_subset(["A"], ["A"])
    assert not is_subset(["A", "D"], ["A", "B", "C"])


def test_is_proper_subset():
    assert is_proper_subset(["A"], ["A", "B"])
    assert not is_proper_subset(["A", "B"], ["B", "A"])
    assert not is_proper_subset(["A", "B", "C"], ["A", "B"])


def test_set_equals():
    assert set_equals(["A", "B", "C"], ["C", "A", "B"])
    assert not set_equals(["A", "B"], ["A", "B", "C"])


def test_set_union():
    union = set_union(["A", "B"], ["B", "C", "D"])
    assert union == ["A", "B", "C", "D"]


def test_set_intersection():
    inter = set_intersection(["A", "B", "C"], ["B", "C", "D"])
    assert inter == ["B", "C"]


def test_set_difference():
    diff = set_difference(["A", "B", "C"], ["B", "D"])
    assert diff == ["A", "C"]
