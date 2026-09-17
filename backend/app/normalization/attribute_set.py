"""
Mathematical Attribute Set Utilities for Relational Normalization.

In relational database theory, attribute collections are mathematical sets.
This module provides pure, deterministic, order-insensitive set operations
while maintaining consistent, clean list representations for UI and API contracts.
"""

from typing import Iterable, List, Set, FrozenSet


def to_attribute_set(attrs: Iterable[str]) -> Set[str]:
    """Converts an iterable of attribute names into a clean Python set of trimmed strings."""
    return {a.strip() for a in attrs if a and a.strip()}


def normalize_attribute_set(attrs: Iterable[str], preserve_order: bool = True) -> List[str]:
    """
    Normalizes an attribute collection by trimming whitespace and removing duplicates.
    
    If preserve_order is True, preserves the original sequence of first appearance.
    Otherwise, returns sorted order for canonical comparisons.
    """
    seen: Set[str] = set()
    result: List[str] = []
    
    for a in attrs:
        trimmed = a.strip() if a else ""
        if trimmed and trimmed not in seen:
            seen.add(trimmed)
            result.append(trimmed)
            
    if not preserve_order:
        result.sort()
    return result


def is_subset(subset: Iterable[str], superset: Iterable[str]) -> bool:
    """Returns True if every attribute in subset is present in superset (X ⊆ Y)."""
    sub = to_attribute_set(subset)
    sup = to_attribute_set(superset)
    return sub.issubset(sup)


def is_proper_subset(subset: Iterable[str], superset: Iterable[str]) -> bool:
    """Returns True if subset is a strict proper subset of superset (X ⊂ Y, X != Y)."""
    sub = to_attribute_set(subset)
    sup = to_attribute_set(superset)
    return sub < sup


def set_equals(s1: Iterable[str], s2: Iterable[str]) -> bool:
    """Returns True if two attribute collections contain identical attributes regardless of order."""
    return to_attribute_set(s1) == to_attribute_set(s2)


def set_union(s1: Iterable[str], s2: Iterable[str]) -> List[str]:
    """Returns the union of two attribute sets (S1 ∪ S2) preserving S1 order followed by new items."""
    result = list(normalize_attribute_set(s1, preserve_order=True))
    seen = set(result)
    for a in s2:
        trimmed = a.strip() if a else ""
        if trimmed and trimmed not in seen:
            seen.add(trimmed)
            result.append(trimmed)
    return result


def set_intersection(s1: Iterable[str], s2: Iterable[str]) -> List[str]:
    """Returns the intersection of two attribute sets (S1 ∩ S2)."""
    s2_set = to_attribute_set(s2)
    return [a for a in normalize_attribute_set(s1, preserve_order=True) if a in s2_set]


def set_difference(s1: Iterable[str], s2: Iterable[str]) -> List[str]:
    """Returns the set difference (S1 \\ S2) representing attributes in S1 but not in S2."""
    s2_set = to_attribute_set(s2)
    return [a for a in normalize_attribute_set(s1, preserve_order=True) if a not in s2_set]


def attribute_set_key(attrs: Iterable[str]) -> FrozenSet[str]:
    """Creates a hashable, order-insensitive key suitable for dictionaries and sets."""
    return frozenset(to_attribute_set(attrs))
