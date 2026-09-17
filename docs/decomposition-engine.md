# Decomposition, Lossless-Join Verification & Dependency Preservation Engine

## 1. Overview

The **Decomposition & Verification Engine** implements **Phase 7** of the *Normalization Lab*. It provides mathematically rigorous, deterministic algorithms for:

1. **Schema Decomposition**:
   - **2NF Decomposition**: Isolating partial functional dependencies into dedicated sub-relations while preserving the composite primary/candidate key remainder.
   - **3NF Bernstein's Synthesis**: Constructing a dependency-preserving, lossless-join 3NF schema using canonical/minimal cover derivation.
   - **4NF Multivalued Dependency (MVD) Decomposition**: Eliminating non-trivial MVD violations via orthogonal binary projections.
2. **Formal Lossless-Join Verification**:
   - The standard relational database **Tableau Chase** algorithm ($k \times n$ tableau) with distinguished ($a_j$) and non-distinguished ($b_{i,j}$) symbols.
   - **Fagin's Theorem** verification for binary multivalued dependency splits.
3. **Formal Dependency Preservation Verification**:
   - **Polynomial-Time Fixpoint Closure Algorithm**: Verifying whether every original dependency $X \to Y$ can be derived from the decomposed relations in $O(|F| \cdot k \cdot n^2)$ time without computing exponential projections.
   - **Projected Dependency Extraction ($\pi_{R_i}(F)$)**: Explicit derivation of active functional dependencies local to each sub-relation for schema generation.
4. **Interactive Verification Workspace**:
   - Interactive Tableau Chase visualizer with step-by-step matrix playback.
   - Per-relation projected dependency inspector and per-FD preservation status traces.
   - Before/after schema comparison and decomposition lineage tracking.

---

## 2. Theoretical Foundations & Algorithms

### 2.1 Minimal Cover (Canonical Cover) Derivation

Bernstein's 3NF synthesis requires a minimal cover $F_c$ of the functional dependency set $F$. A minimal cover satisfies three conditions:
1. Every right-hand side is a singleton attribute ($X \to A$).
2. No left-hand side contains an extraneous attribute (minimality of determinants).
3. No functional dependency is redundant ($F_c \setminus \{f\} \not\equiv F$).

#### Algorithm Steps:
```text
Step 1: RHS Decomposition
For every X -> {A1, ..., Ak} in F:
    Replace with X -> A1, ..., X -> Ak

Step 2: Eliminate Extraneous LHS Attributes
For every X -> A in F:
    For every attribute B in X:
        Let X' = X \ {B}
        If A in (X')+_F:
            Replace X -> A with X' -> A in F

Step 3: Eliminate Redundant Functional Dependencies
For every f: X -> A in F:
    Let F' = F \ {f}
    If A in (X)+_{F'}:
        F = F'  (remove f)
```

---

### 2.2 3NF Synthesis (Bernstein's Algorithm)

To decompose relation $R$ into 3NF:
1. Compute the minimal cover $F_c$ of $F$.
2. Group all dependencies in $F_c$ with identical left-hand sides:
   $$\{ X \to A_1, X \to A_2, \dots, X \to A_m \} \implies R_X(X \cup \{A_1, \dots, A_m\})$$
3. **Candidate Key Relation Guarantee**:
   Check if at least one generated sub-relation contains a candidate key $K$ of $R$. If no generated relation contains any candidate key of $R$, construct an additional relation $R_K(K)$ where $K$ is an arbitrary candidate key. This step mathematically guarantees the lossless join property.
4. **Subset Elimination**:
   If $R_i \subseteq R_j$ for any $i \neq j$, remove $R_i$ from the decomposition.

---

### 2.3 2NF Partial Dependency Decomposition

For relation $R$ violating 2NF:
1. Identify all partial dependencies $X \to Y$ where $X \subset K$ for some candidate key $K$ and $Y$ is non-prime.
2. Group partial dependencies with identical determinants $X$.
3. For each group, create sub-relation $R_X(X \cup Y)$ with primary key $X$.
4. Remove the determined non-prime attributes $Y$ from the main relation:
   $$R_{\text{main}} = R \setminus \bigcup Y$$
   The main relation retains the full candidate keys and any non-violating attributes.

---

### 2.4 4NF MVD Decomposition

For relation $R$ violating 4NF with non-trivial MVD $X \twoheadrightarrow Y$ where $X$ is not a superkey:
1. Form sub-relation $R_1 = X \cup Y$.
2. Form sub-relation $R_2 = X \cup (R \setminus (X \cup Y))$.
3. By Fagin's Theorem, decomposing $R$ into $R_1$ and $R_2$ is guaranteed to be a lossless join if and only if $X \twoheadrightarrow Y$ holds in $R$.
4. Apply recursively if $R_1$ or $R_2$ contains remaining non-trivial MVD violations.

---

### 2.5 Tableau Chase Algorithm for Lossless Join

The Tableau Chase is the decision procedure for testing lossless join under functional dependencies.

#### Matrix Initialization:
Given relation $R(A_1, A_2, \dots, A_n)$ and decomposition $D = \{ R_1, R_2, \dots, R_k \}$:
- Construct a $k \times n$ matrix $T$.
- For each row $i \in \{1, \dots, k\}$ and column $j \in \{1, \dots, n\}$:
  $$T[i][j] = \begin{cases} a_j & \text{if } A_j \in R_i \text{ (distinguished symbol)} \\ b_{i,j} & \text{if } A_j \notin R_i \text{ (non-distinguished symbol)} \end{cases}$$

#### Equate Loop:
Repeat until no symbol in $T$ changes:
- For each functional dependency $X \to Y \in F$:
  - Find all rows $r_1, r_2$ that have identical symbols across all columns in $X$:
    $$\forall A \in X: T[r_1][A] = T[r_2][A]$$
  - For each attribute $B \in Y$:
    - If $T[r_1][B] \neq T[r_2][B]$:
      - If one of the symbols is distinguished ($a_B$), set all occurrences of the other symbol in column $B$ to $a_B$.
      - If both are non-distinguished ($b_{u, B}$ and $b_{v, B}$), equate all occurrences of the higher-indexed symbol to the lower-indexed symbol.

#### Decision Criterion:
The decomposition is **lossless** if and only if after the Chase terminates (or halts early), there exists at least one row in $T$ containing **only distinguished symbols** $(a_1, a_2, \dots, a_n)$.

---

### 2.6 Dependency Preservation (Polynomial Fixpoint Algorithm)

Rather than computing the exponential full projection set $O(2^n)$, each original functional dependency $X \to Y \in F$ is tested using the polynomial-time fixpoint algorithm:

```text
Input: Decomposed relations D = {R_1, ..., R_k}, FDs F, target FD X -> Y

1. Initialize: Z = X
2. Repeat until Z does not change:
     For each sub-relation R_i in D:
         Let intersection = Z ∩ R_i
         Compute closure: C = (intersection)+_F
         Z = Z ∪ (C ∩ R_i)
3. Return True if Y ⊆ Z, else False.
```

The decomposition preserves $F$ if and only if every $f \in F$ passes this test.

---

## 3. Computational Complexity & Scalability Bounds

| Algorithm | Worst-Case Time Complexity | Space Complexity | Practical Scaling Notes |
| :--- | :--- | :--- | :--- |
| **Tableau Chase** | $O(|F| \cdot k \cdot n)$ | $O(k \cdot n)$ | Blazing fast for realistic schemas ($k \le 20, n \le 50$). Monotonically decreases non-distinguished symbols. |
| **Fixpoint Dependency Preservation** | $O(|F|^2 \cdot k \cdot n)$ | $O(n)$ | Runs in polynomial time; completely avoids exponential powerset enumeration. |
| **Projected FD Derivation** | $O(k \cdot 2^{|R_i|} \cdot |F|)$ | $O(|F_{\text{proj}}|)$ | Bounded by max subset size $m=4$ to prevent explosion on relations with $>15$ attributes. |
| **Minimal Cover Derivation** | $O(|F|^2 \cdot |X_{\text{avg}}| \cdot n)$ | $O(|F| \cdot n)$ | Deterministic, stable output independent of iteration order. |
| **Bernstein 3NF Synthesis** | $O(|F_c| \log |F_c| + k^2 \cdot n)$ | $O(k \cdot n)$ | Guaranteed polynomial execution. |

---

## 4. API Endpoints Reference

All endpoints are mounted under `/api/v1/decomposition`:

### 4.1 POST `/verify-lossless`
Evaluates lossless join using Tableau Chase.
- **Request Body**:
  ```json
  {
    "attributes": ["A", "B", "C", "D"],
    "relations": [["A", "B"], ["B", "C"], ["C", "D"]],
    "functionalDependencies": [
      {"left": ["A"], "right": ["B"]},
      {"left": ["B"], "right": ["C"]},
      {"left": ["C"], "right": ["D"]}
    ]
  }
  ```
- **Response**:
  ```json
  {
    "isLossless": true,
    "method": "TABLEAU_CHASE",
    "tableauInitial": [...],
    "tableauFinal": [...],
    "chaseSteps": [...],
    "explanation": "Lossless join verified: Tableau chase successfully produced a row of all distinguished symbols (a_j) at iteration 3."
  }
  ```

### 4.2 POST `/verify-dependencies`
Evaluates dependency preservation via polynomial fixpoint checking and projected FD extraction.
- **Request Body**:
  ```json
  {
    "attributes": ["A", "B", "C"],
    "relations": [["A", "B"], ["B", "C"]],
    "functionalDependencies": [
      {"left": ["A"], "right": ["B"]},
      {"left": ["B"], "right": ["C"]}
    ]
  }
  ```
- **Response**:
  ```json
  {
    "isPreserved": true,
    "projectedDependencies": {"R1": [...], "R2": [...]},
    "preservedDependencies": [...],
    "nonPreservedDependencies": [],
    "checks": [...]
  }
  ```

### 4.3 POST `/minimal-cover`
Derives the canonical minimal cover with full audit steps.

### 4.4 POST `/analyze`
Unified pipeline executing decomposition for target normal forms (2NF, 3NF, or 4NF), generating full before/after schemas, Tableau Chase verification, dependency preservation proofs, and lineage records.

---

## 5. Architectural Safeguards & Known Limitations

1. **Stale Snapshot Protection**: The frontend tracks schema fingerprint hashes (`relation_name`, `attributes`, `fds`, `candidate_keys`). If the schema changes in the builder, decomposition results invalidate gracefully.
2. **Deterministic Symbol Equating**: Non-distinguished symbols are subscripted deterministically ($b_{i,j}$) and equated to the minimum index to guarantee identical proof traces across runs.
3. **MVD Chase Scope**: Lossless join for functional dependencies uses the full relational Tableau Chase. Multivalued dependencies are verified using Fagin's Theorem for binary decompositions. Arbitrary multi-way non-binary MVD Chase tableaux are flagged with an explicit limitation notice.
4. **No LLM / No Heuristics**: All verifications are direct, deterministic implementations of relational database theory.
