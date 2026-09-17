"""
Functional Dependency (FD) Engine.

Implements canonical representation, semantic validation, equality,
triviality checks, and FD-set management according to relational database theory.
"""

from typing import List, Set, FrozenSet, Optional, Tuple, Iterable
from app.schemas.domain_contracts import (
    FunctionalDependency,
    TrivialFDCheckResult,
)
from app.normalization.attribute_set import (
    normalize_attribute_set,
    to_attribute_set,
    is_subset,
    set_intersection,
    set_difference,
    attribute_set_key,
)


class CanonicalFD:
    """
    Mathematical, hashable representation of a Functional Dependency X -> Y.
    
    Equality is order-insensitive: (A, B -> C) == (B, A -> C).
    Original display order is preserved for readable presentation.
    """
    id: Optional[str]
    left: List[str]
    right: List[str]
    _left_set: FrozenSet[str]
    _right_set: FrozenSet[str]

    def __init__(self, left: Iterable[str], right: Iterable[str], id: Optional[str] = None):
        self.id = id
        self.left = normalize_attribute_set(left, preserve_order=True)
        self.right = normalize_attribute_set(right, preserve_order=True)
        self._left_set = attribute_set_key(self.left)
        self._right_set = attribute_set_key(self.right)

    def to_contract(self) -> FunctionalDependency:
        """Converts back to the public Pydantic FunctionalDependency model."""
        return FunctionalDependency(
            id=self.id,
            left=list(self.left),
            right=list(self.right),
        )

    def notation(self) -> str:
        return f"{', '.join(self.left)} → {', '.join(self.right)}"

    def is_trivial(self) -> bool:
        """Returns True if any attribute in RHS is determined by reflexivity (RHS ∩ LHS != ∅)."""
        return bool(self._right_set.intersection(self._left_set))

    def is_completely_trivial(self) -> bool:
        """Returns True if RHS is entirely a subset of LHS (RHS ⊆ LHS)."""
        return self._right_set.issubset(self._left_set)

    def decompose_rhs(self) -> List["CanonicalFD"]:
        """
        Decomposes X -> (Y1, Y2) into individual singleton dependencies:
        X -> Y1, X -> Y2 based on Armstrong's Decomposition Axiom.
        """
        return [
            CanonicalFD(left=self.left, right=[attr], id=f"{self.id or 'fd'}-{idx}")
            for idx, attr in enumerate(self.right)
        ]

    def __eq__(self, other: object) -> bool:
        if not isinstance(other, CanonicalFD):
            return False
        return self._left_set == other._left_set and self._right_set == other._right_set

    def __hash__(self) -> int:
        return hash((self._left_set, self._right_set))

    def __repr__(self) -> str:
        return f"CanonicalFD({self.notation()})"


def canonicalize_fd(fd: FunctionalDependency) -> CanonicalFD:
    """Normalizes a Pydantic FunctionalDependency into a CanonicalFD."""
    return CanonicalFD(left=fd.left, right=fd.right, id=fd.id)


def check_trivial_fd(fd: FunctionalDependency) -> TrivialFDCheckResult:
    """
    Checks whether an FD is trivial according to Armstrong's Reflexivity Axiom:
    'If Y ⊆ X, then X → Y holds unconditionally in any relation instance.'
    """
    left_attrs = normalize_attribute_set(fd.left)
    right_attrs = normalize_attribute_set(fd.right)
    
    left_set = to_attribute_set(left_attrs)
    right_set = to_attribute_set(right_attrs)
    
    trivial_attrs = [a for a in right_attrs if a in left_set]
    non_trivial_attrs = [a for a in right_attrs if a not in left_set]
    
    is_completely_trivial = len(non_trivial_attrs) == 0
    is_partially_trivial = len(trivial_attrs) > 0 and not is_completely_trivial
    is_trivial = is_completely_trivial or is_partially_trivial

    if is_completely_trivial:
        explanation = (
            f"The dependency {', '.join(left_attrs)} → {', '.join(right_attrs)} is completely trivial "
            f"because all dependent attributes {{{', '.join(trivial_attrs)}}} already belong to the determinant. "
            f"By Armstrong's Reflexivity Axiom, any attribute set automatically determines its own subsets."
        )
    elif is_partially_trivial:
        explanation = (
            f"The dependency {', '.join(left_attrs)} → {', '.join(right_attrs)} is partially trivial: "
            f"attribute(s) {{{', '.join(trivial_attrs)}}} already appear on the left-hand side, while "
            f"{{{', '.join(non_trivial_attrs)}}} are non-trivial."
        )
    else:
        explanation = (
            f"The dependency {', '.join(left_attrs)} → {', '.join(right_attrs)} is completely non-trivial "
            f"because none of the dependent attributes belong to the determinant ({', '.join(left_attrs)})."
        )

    return TrivialFDCheckResult(
        is_trivial=is_trivial,
        is_completely_trivial=is_completely_trivial,
        trivial_attributes=trivial_attrs,
        non_trivial_attributes=non_trivial_attrs,
        explanation=explanation,
    )


class FDSet:
    """
    Container managing a unique collection of CanonicalFDs.
    Eliminates exact and permuted duplicate dependencies while preserving insertion order.
    """
    _dependencies: List[CanonicalFD]
    _seen: Set[Tuple[FrozenSet[str], FrozenSet[str]]]

    def __init__(self, fds: Optional[Iterable[FunctionalDependency]] = None):
        self._dependencies = []
        self._seen = set()
        if fds:
            for fd in fds:
                self.add(canonicalize_fd(fd))

    def add(self, fd: CanonicalFD) -> bool:
        """Adds a dependency if its LHS and RHS sets are not already present."""
        key = (fd._left_set, fd._right_set)
        if key in self._seen:
            return False
        self._seen.add(key)
        self._dependencies.append(fd)
        return True

    def to_contracts(self) -> List[FunctionalDependency]:
        """Converts all managed FDs to Pydantic models."""
        return [fd.to_contract() for fd in self._dependencies]

    def get_decomposed(self) -> List[CanonicalFD]:
        """Returns all FDs with single-attribute RHS collections."""
        result: List[CanonicalFD] = []
        for fd in self._dependencies:
            result.extend(fd.decompose_rhs())
        return result

    def __iter__(self):
        return iter(self._dependencies)

    def __len__(self) -> int:
        return len(self._dependencies)

    def __repr__(self) -> str:
        return f"FDSet({[fd.notation() for fd in self._dependencies]})"
