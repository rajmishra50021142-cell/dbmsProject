# Normalization Lab — Functional Dependency Engine & Attribute Closure

**Phase**: Phase 3 Specification & Mathematics  
**Status**: Implemented & Verified  
**Scope**: Pure attribute set theory, canonical FD representation, deterministic attribute closure ($X^+$), step-by-step educational trace generation, superkey testing, and logical implication verification ($X \to Y$).

---

## 1. Mathematical Foundation & Set Theory

In relational database theory, attribute closure and functional dependency reasoning operate strictly on mathematical set primitives. To ensure complete consistency across all database normalization phases (Phases 3–7), Normalization Lab implements pure, immutable set theory operations in `backend/app/normalization/attribute_set.py`.

### Pure Set Primitives

- **Set Normalization**: Attributes are stored as ordered lists for consistent UI presentation, but compared as mathematical sets ($O(1)$ hashing and set equivalence). Duplicate attributes are purged, whitespace is stripped, and casing is preserved.
- **Subsets & Proper Subsets**: 
  - $X \subseteq Y$: Evaluates whether every attribute in $X$ belongs to $Y$.
  - $X \subset Y$: Evaluates whether $X \subseteq Y$ and $X \neq Y$.
- **Set Operations**: Pure union ($X \cup Y$), intersection ($X \cap Y$), and set difference ($X \setminus Y$).
- **Hashable Set Keys**: Frozen sets are converted into deterministic tuple representations (`attribute_set_key`), allowing sets of attributes to be used safely as dictionary keys, cache keys, and graph node identifiers.

---

## 2. Canonical Functional Dependency Representation

A functional dependency $X \to Y$ is an assertion that whenever two tuples in relation $R$ agree on attribute set $X$, they must also agree on attribute set $Y$.

### The `CanonicalFD` Class

In `backend/app/normalization/fd_engine.py`, functional dependencies are normalized into `CanonicalFD`:

```python
class CanonicalFD:
    lhs: frozenset[str]
    rhs: frozenset[str]
    ordered_lhs: list[str]
    ordered_rhs: list[str]
    id: str | None
```

Key guarantees:
1. **Order Insensitivity**: $\{A, B\} \to \{C\}$ and $\{B, A\} \to \{C\}$ produce identical hash codes and compare as equal (`==`).
2. **Decomposition Axiom**: Any FD $X \to \{A_1, A_2, \dots, A_k\}$ can be decomposed into an equivalent set of singleton FDs:
   $$\{X \to A_1, X \to A_2, \dots, X \to A_k\}$$
3. **Immutability & Hashability**: Enables deduplication within an `FDSet` container.

### Armstrong's Axioms & Trivial Dependencies

Given $X \to Y$:
- **Completely Trivial**: $Y \subseteq X$. By Armstrong's Reflexivity Axiom, any attribute set automatically determines itself and all its subsets without consulting the relational instance.
- **Partially Trivial**: $Y \cap X \neq \emptyset$ and $Y \setminus X \neq \emptyset$. Contains both reflexively known attributes and newly determined attributes.
- **Completely Non-Trivial**: $Y \cap X = \emptyset$. Every attribute in $Y$ is strictly determined by $X$.

---

## 3. Deterministic Attribute Closure Algorithm ($X^+$)

The attribute closure of a set of attributes $X$ with respect to a set of functional dependencies $F$, denoted $X^+$, is the set of all attributes functionally determined by $X$ under $F$.

### Algorithm Specification

```text
Algorithm: ComputeAttributeClosure(R, F, X)
Input:
  R: Relation attribute set
  F: Set of functional dependencies
  X: Starting attribute set (X ⊆ R)
Output:
  X+: Attribute closure of X
  Steps: Step-by-step trace of applied FDs and intermediate closure sets

1. closure ← X
2. steps ← [Step 1: Initialize closure with X (Reflexivity)]
3. applied_fds ← []
4. repeat:
     changed ← false
     for each fd (LHS → RHS) in F:
       if LHS ⊆ closure and not (RHS ⊆ closure):
         new_attrs ← RHS \ closure
         closure ← closure ∪ new_attrs
         applied_fds.append(fd)
         steps.append(Step: Applied LHS → RHS, added new_attrs)
         changed ← true
   until not changed
5. return closure, steps, applied_fds
```

### Complexity & Termination Proof

- **Monotonic Expansion**: At each iteration $i$, $\text{closure}^{(i)} \subseteq \text{closure}^{(i+1)}$. Attributes are only added, never removed.
- **Bounded Domain**: $\text{closure} \subseteq R$. Since $R$ is finite, the closure can grow at most $|R| - |X|$ times.
- **Convergence**: The algorithm is guaranteed to terminate at a fixed point in at most $|R|$ outer passes.
- **Worst-Case Time Complexity**: $O(|F| \cdot |R|)$ with $O(1)$ set membership lookups using hash sets.
- **Deterministic Traversal**: For academic predictability, FDs are evaluated in a stable sequence, ensuring identical step traces across runs.

---

## 4. Educational Superkey Evaluation & Minimality Disclaimer

When $X^+ = R$ (the closure contains all attributes of the relation schema), $X$ is mathematically proven to be a **Superkey** of relation $R$.

> [!IMPORTANT]
> **Superkey vs. Candidate Key**:  
> A superkey satisfies the *uniqueness condition* ($X^+ = R$), but is not necessarily *minimal*. In Phase 3, an educational badge displays **Superkey Criteria Satisfied** with an explicit pedagogical disclaimer:  
> *"Whether $X$ is a minimal candidate key will be verified during candidate-key discovery in Phase 4."*

---

## 5. Functional Implication Testing ($X \to Y$)

To verify whether an arbitrary dependency $X \to Y$ is logically implied by $F$ (denoted $F \models X \to Y$):

1. Compute the attribute closure of the determinant: $X^+$.
2. Check if $Y \subseteq X^+$.
3. If $Y \subseteq X^+$, then $X \to Y$ holds under $F$; otherwise, it does not. Any attribute in $Y \setminus X^+$ serves as a concrete counterexample demonstrating why the implication fails.

---

## 6. API Endpoints & Contracts

All Phase 3 endpoints are mounted under `/api/v1/closure`:

### 1. `POST /api/v1/closure/compute`
Computes the full attribute closure with step-by-step trace.

**Request Body (`ClosureRequest`)**:
```json
{
  "relation_name": "ENROLLMENT",
  "attributes": ["StudentID", "CourseID", "Grade", "StudentName"],
  "functional_dependencies": [
    {"left": ["StudentID"], "right": ["StudentName"]},
    {"left": ["StudentID", "CourseID"], "right": ["Grade"]}
  ],
  "target_attributes": ["StudentID", "CourseID"]
}
```

**Response Body (`ClosureResult`)**:
```json
{
  "relation_name": "ENROLLMENT",
  "input_attributes": ["StudentID", "CourseID"],
  "closure_attributes": ["StudentID", "CourseID", "StudentName", "Grade"],
  "steps": [
    {
      "step_number": 1,
      "before_attributes": [],
      "applied_fd": null,
      "added_attributes": ["StudentID", "CourseID"],
      "after_attributes": ["StudentID", "CourseID"],
      "explanation": "Initial attribute set: (StudentID, CourseID)+ begins with its starting attributes {StudentID, CourseID} by reflexivity."
    },
    {
      "step_number": 2,
      "before_attributes": ["StudentID", "CourseID"],
      "applied_fd": {"left": ["StudentID"], "right": ["StudentName"]},
      "added_attributes": ["StudentName"],
      "after_attributes": ["StudentID", "CourseID", "StudentName"],
      "explanation": "Applied StudentID → StudentName: Determinant {StudentID} is contained in current closure {StudentID, CourseID}. Added newly determined attribute(s): {StudentName}."
    }
  ],
  "iterations": 2,
  "applied_fds": [...],
  "fixed_point_reached": true,
  "is_superkey": true,
  "superkey_reason": "The closure (StudentID, CourseID)+ contains all 4 attributes of relation ENROLLMENT. Therefore, (StudentID, CourseID) is a superkey of ENROLLMENT. Note: Whether it is a minimal candidate key will be verified in Phase 4."
}
```

### 2. `POST /api/v1/closure/determination`
Tests whether LHS functionally determines RHS ($X \to Y$).

### 3. `POST /api/v1/closure/trivial-check`
Checks whether an individual dependency is completely trivial, partially trivial, or non-trivial.
