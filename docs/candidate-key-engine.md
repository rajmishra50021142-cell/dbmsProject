# Normalization Lab — Candidate-Key Engine, Superkeys & Attribute Classification

**Phase**: Phase 4 Specification & Mathematical Reference  
**Status**: Implemented & Verified  
**Scope**: Superkey testing, minimal candidate-key verification, automatic candidate-key discovery (single, composite, and multiple keys), user-provided key validation with redundant attribute diagnostics, prime/non-prime attribute classification, and educational derivation reasoning.

---

## 1. Core Mathematical Foundations

In relational database design theory, candidate keys are the fundamental anchors for normal forms (especially 2NF, 3NF, and BCNF). Normalization Lab establishes a rigorous, deterministic distinction between **superkeys** and **candidate keys** based on attribute closure.

### 1.1 Superkey Definition
Given a relation schema $R$ with attribute set $\text{attrs}(R)$ and a set of functional dependencies $F$, an attribute set $X \subseteq \text{attrs}(R)$ is a **superkey** of $R$ if and only if:
$$X^+_F = \text{attrs}(R)$$
That is, the attribute closure of $X$ with respect to $F$ covers all attributes in the relation.

### 1.2 Candidate Key Definition
An attribute set $K \subseteq \text{attrs}(R)$ is a **candidate key** of $R$ if and only if it satisfies two distinct conditions:
1. **Superkey Property**: $K^+_F = \text{attrs}(R)$ (completeness).
2. **Minimality Property (Irreducibility)**: For every proper subset $Y \subset K$ ($Y \neq \emptyset$), $Y^+_F \neq \text{attrs}(R)$.

> [!IMPORTANT]
> A set is **never** called a candidate key merely because its closure spans the relation. If any proper subset can also determine the entire relation, the set is a **non-minimal superkey**, not a candidate key.

---

## 2. User-Provided Candidate Key Verification

When users propose candidate keys (either during schema definition in Phase 2 or inside the interactive Key Analysis Lab), the engine verifies them across four distinct statuses:

```
                  ┌───────────────────────────────┐
                  │ User-Provided Key Candidate K │
                  └──────────────┬────────────────┘
                                 │
                     Does K+ cover all of R?
                                 │
                    ┌────────────┴────────────┐
                   YES                        NO
                    │                         │
      Does any proper subset Y ⊂ K     ┌──────────────┴──────────────┐
          have Y+ = R?                 │ INSUFFICIENT / NOT SUPERKEY │
                    │                  │   K+ does not span relation │
             ┌──────┴──────┐           └─────────────────────────────┘
            YES            NO
             │             │
┌───────────────────────┐ ┌──────────────────────┐
│  NON-MINIMAL SUPERKEY │ │ VALID CANDIDATE KEY  │
│  Superkey but bloated │ │ Minimal & Irreducible│
└───────────────────────┘ └──────────────────────┘
```

1. **`valid_candidate_key`**:
   - $K^+ = R$
   - $\forall Y \subset K$, $Y^+ \neq R$.
   - The user's proposal is mathematically sound and irreducible.
2. **`non_minimal_superkey`**:
   - $K^+ = R$
   - $\exists Y \subset K$ such that $Y^+ = R$.
   - The engine flags the redundant attributes that can be safely dropped to attain minimality.
3. **`insufficient`**:
   - $K^+ \neq R$.
   - Missing attributes are clearly enumerated for educational feedback.
4. **`invalid_attributes`**:
   - $K$ contains attributes not present in $R$.

---

## 3. Automatic Candidate Key Discovery Algorithm

To find **all** candidate keys for an arbitrary relation schema $R$ and dependency set $F$, Normalization Lab uses an optimized attribute-role partitioning algorithm combined with incremental subset search and aggressive superset pruning.

### 3.1 Attribute Role Partitioning
Every attribute $A \in \text{attrs}(R)$ is partitioned into exactly one of four disjoint categories based on its presence in non-trivial functional dependencies:

| Partition | Symbol | Definition | Role in Candidate Keys |
| :--- | :---: | :--- | :--- |
| **Left-Only** | $L$ | Appears on the LHS of at least one FD, but *never* on any RHS. | **Must be in EVERY candidate key.** (No FD can ever derive these attributes). |
| **Neither** | $N$ | Does not appear in *any* functional dependency in $F$. | **Must be in EVERY candidate key.** (Independent attributes). |
| **Right-Only** | $R_{only}$ | Appears on the RHS of at least one FD, but *never* on any LHS. | **Can NEVER be in ANY minimal candidate key.** (Derived by others, cannot help derive others). |
| **Both** | $B$ | Appears on both LHS and RHS of dependencies in $F$. | **Candidates for combinations.** May or may not be needed to complete the key. |

### 3.2 The Essential Core
The **essential core** is defined as:
$$E = L \cup N$$
Because no functional dependency in $F$ can ever generate any attribute in $L$ or $N$ from other attributes, **every candidate key of $R$ must contain $E$ as a subset**:
$$\forall K \in \mathcal{CK}(R), \quad E \subseteq K$$

#### Early Exit Theorem
If $E^+_F = \text{attrs}(R)$, then $E$ is a superkey. Because every candidate key must contain $E$, no proper subset can be a candidate key, and no proper superset can be minimal. Therefore:
$$\text{If } E^+ = R \implies E \text{ is the UNIQUE candidate key of } R.$$
In this case, search terminates immediately in $O(1)$ combination steps.

### 3.3 Incremental Combination Search
When $E^+ \neq R$, the search pool consists of subsets of $B$ (attributes that appear on both sides):
1. Candidate sets are generated by taking $X = E \cup S$ for $S \subseteq B$.
2. Subsets $S$ are generated in **strictly ascending order of size** ($|S| = 1, 2, \dots, |B|$).
3. **Superset Pruning**: Whenever a candidate $X$ is identified as a candidate key, all strict supersets of $X$ are pruned from future consideration because any superset $X \cup S'$ would violate minimality.
4. **Minimality Verification**: Each discovered candidate key undergoes explicit verification by computing the closure of all its immediate proper subsets ($|X|-1$), producing human-readable proof cards.

---

## 4. Prime vs. Non-Prime Attribute Classification

Once all candidate keys $\mathcal{CK} = \{K_1, K_2, \dots, K_m\}$ are determined, the relation's attributes are partitioned into prime and non-prime sets:

### 4.1 Prime Attributes
An attribute $A \in \text{attrs}(R)$ is **prime** if and only if it belongs to **at least one** candidate key:
$$\text{Prime}(R) = \bigcup_{K \in \mathcal{CK}} K$$

### 4.2 Non-Prime Attributes
An attribute $A \in \text{attrs}(R)$ is **non-prime** if and only if it does **not** belong to any candidate key:
$$\text{Non-Prime}(R) = \text{attrs}(R) \setminus \text{Prime}(R)$$

> [!TIP]
> This classification is the cornerstone for Phase 5 (2NF partial dependency analysis) and Phase 6 (3NF transitive dependency analysis). Exposing this precomputed and verified in Phase 4 ensures zero redundant calculations in downstream modules.

---

## 5. Algorithmic Complexity Analysis

### Time Complexity
- **Attribute Partitioning**: $O(|F| \cdot |R|)$ to scan all dependency LHS and RHS sets.
- **Essential Core Closure**: $O(|F| \cdot |R|)$ using the Phase 3 attribute closure algorithm.
- **Combination Search**:
  - In the theoretical worst case (e.g., cyclic dependencies where $B = \text{attrs}(R)$ and all combinations must be checked), the number of subsets of $B$ is $2^{|B|}$.
  - For each examined candidate $X$, computing $X^+$ takes $O(|F| \cdot |R|)$.
  - Hence, the theoretical upper bound is:
    $$\mathcal{O}\left(2^{|B|} \cdot |F| \cdot |R|\right)$$
  - **Pruning in Practice**: In realistic relational schemas:
    1. $L$ and $N$ typically comprise $30\text{--}70\%$ of attributes, leaving $|B|$ small.
    2. Ascending-order search with superset pruning terminates the search tree at low depths (usually size 1 or 2).
    3. The typical execution time is sub-millisecond ($< 5\text{ ms}$).

### Space Complexity
- Auxiliary space is $\mathcal{O}(|\mathcal{CK}| \cdot |R|)$ to store discovered keys, minimality proofs, and reasoning traces.

---

## 6. Architecture & Reusability Contracts

### 6.1 Reuse of Phase 3 Closure Service
The candidate-key engine strictly delegates all closure calculations to `backend/app/normalization/fd_engine.py`:
```python
from app.normalization.fd_engine import compute_attribute_closure

# Example: testing superkey property
closure_result = compute_attribute_closure(attrs, fds, rel_attrs)
is_superkey = set(closure_result.closure) == set(rel_attrs)
```
No duplicate closure algorithm exists.

### 6.2 API Contracts (`/api/v1/keys`)

| Endpoint | Method | Purpose |
| :--- | :---: | :--- |
| `/api/v1/keys/superkey-check` | `POST` | Check whether a single attribute set is a superkey of $R$. |
| `/api/v1/keys/verify` | `POST` | Verify a user-provided candidate key and evaluate minimality with subset proofs. |
| `/api/v1/keys/find` | `POST` | Discover all candidate keys, attribute partitions, prime/non-prime sets, and trace. |
| `/api/v1/keys/analysis` | `POST` | Comprehensive analysis: discovery + user keys verification. |

### 6.3 Downstream Handoff to Phase 5 (1NF / 2NF)
Phase 5 requires:
1. **Candidate Keys List**: To determine what constitutes a full candidate key.
2. **Prime / Non-Prime Attributes**: To determine whether a RHS attribute is non-prime.
3. **Proper Subsets of Candidate Keys**: To detect partial dependencies ($X \to A$ where $X \subset K$ for some candidate key $K$ and $A$ is non-prime).
All of these structures are fully provided by `CandidateKeyAnalysisResult` without requiring Phase 5 to re-implement any key logic.
