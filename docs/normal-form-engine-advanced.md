# Advanced Normal Form Engine: 3NF & 4NF Analysis, MVD Reasoning & Decomposition Planning

## Overview

The Advanced Normal Form Engine extends **Normalization Lab** to cover **Third Normal Form (3NF)** and **Fourth Normal Form (4NF)** as specified in Phase 6.

Together with Phase 5 (1NF & 2NF), the system provides an end-to-end, mathematically rigorous, deterministic pipeline that evaluates relational schemas against the formal normal form hierarchy:

$$\text{1NF} \Longleftarrow \text{2NF} \Longleftarrow \text{3NF} \Longleftarrow \text{4NF}$$

---

## 1. Third Normal Form (3NF)

### 1.1 Formal Definition

A relation schema $R$ is in **Third Normal Form (3NF)** with respect to a set of functional dependencies $F$ if and only if:
1. $R$ is in **Second Normal Form (2NF)**.
2. For every non-trivial functional dependency $X \to A$ in $F^+$ (or in a minimal basis of $F$), at least one of the following conditions holds:
   - **Superkey Condition**: $X$ is a superkey of $R$ ($X^+ = R$).
   - **Prime Attribute Exception**: $A$ is a **prime attribute** (i.e., $A$ belongs to *at least one* candidate key of $R$).

### 1.2 Minimality & Non-Trivial Dependencies

A functional dependency $X \to Y$ is **trivial** if $Y \subseteq X$. Trivial dependencies always hold in any relation and are vacuously satisfied in 3NF analysis.

For multi-attribute right-hand sides $X \to \{A_1, A_2, \dots, A_k\}$, the engine evaluates the 3NF condition attribute-by-attribute using the standard decomposition rule:
$$X \to \{A_1, \dots, A_k\} \equiv X \to A_1, X \to A_2, \dots, X \to A_k$$

An FD violates 3NF if $X$ is not a superkey and there exists *at least one* attribute $A_i \in Y \setminus X$ such that $A_i$ is non-prime.

### 1.3 Prime Attribute Exception & Multiple Candidate Keys

In schemas with multiple or composite candidate keys, an attribute is prime if it appears in **any** candidate key.
For example, in relation $R(A, B, C, D)$ with candidate keys $\{ (A, B), (B, C) \}$:
- Prime attributes: $\{A, B, C\}$.
- Non-prime attributes: $\{D\}$.

If a dependency is $D \to A$, $D$ is not a superkey, but $A$ is a prime attribute (it belongs to candidate key $(A, B)$). Therefore, $D \to A$ **satisfies** 3NF under the prime attribute exception (even though it would violate BCNF).

### 1.4 Transitive Dependency Reasoning

A transitive dependency arises when a non-key determinant determines a non-prime attribute, creating an indirect chain from candidate key $K$:
$$K \to X \quad \text{and} \quad X \to A \quad (X \not\to K, A \notin X, A \text{ non-prime})$$

The engine traces and outputs pedagogical transitive chains such as:
$$\text{StaffNo} \to \text{BranchNo} \to \text{BAddress}$$

---

## 2. Fourth Normal Form (4NF)

### 2.1 Formal Definition

A relation schema $R$ is in **Fourth Normal Form (4NF)** with respect to a set of functional dependencies $F$ and multivalued dependencies $M$ if and only if:
1. $R$ is in **Third Normal Form (3NF)** (or BCNF).
2. For every non-trivial multivalued dependency $X \twoheadrightarrow Y$ that holds on $R$, $X$ is a **superkey** of $R$.

### 2.2 Trivial Multivalued Dependencies

An MVD $X \twoheadrightarrow Y$ in relation $R$ is **trivial** if:
1. $Y \subseteq X$ (the dependent is a subset of the determinant), OR
2. $X \cup Y = R$ (the determinant and dependent together encompass all attributes of $R$).

Trivial MVDs hold identically in any relation and never introduce redundancy.

### 2.3 Cartesian Product Redundancy

When a relation attempts to model two or more independent 1-to-many or many-to-many relationships (e.g., $Course \twoheadrightarrow Teacher$ and $Course \twoheadrightarrow Text$), every teacher must be paired with every textbook for a given course. This forces a Cartesian product of tuples:
$$|Tuples| = |Teachers| \times |Texts|$$

This redundancy leads directly to insertion anomalies, deletion anomalies, and update anomalies.

---

## 3. Structural Decomposition Proposals

When 3NF or 4NF violations are detected, the engine generates conceptual decomposition proposals:

### 3.1 3NF Synthesis Projection
For each non-superkey determinant $X$ violating 3NF with non-prime dependents $Y$:
- Proposed sub-relation: $R_X(X \cup Y)$ with primary key $X$.
- Remainder sub-relation: $R_{rem}(K \cup (R \setminus Y))$ preserving candidate key $K$.

### 3.2 4NF Projection
For each non-trivial MVD $X \twoheadrightarrow Y$ where $X$ is not a superkey:
- Proposed sub-relation $R_1$: $X \cup Y$.
- Proposed sub-relation $R_2$: $X \cup (R \setminus (X \cup Y))$.

### 3.3 Scope & Phase 7 Boundary Notice
All decomposition proposals generated in Phase 6 carry:
```json
"verification_status": "NOT_YET_VERIFIED"
```
Formal verification algorithms for:
- **Lossless-Join Decomposition** (via Chase algorithm / tableau method)
- **Dependency Preservation** (via FD projection and closure testing)

are strictly scoped for implementation in **Phase 7**.

---

## 4. API Endpoints

### 4.1 `POST /api/v1/normalize/3nf`
Evaluates Third Normal Form independently on a given schema.

### 4.2 `POST /api/v1/normalize/4nf`
Evaluates Fourth Normal Form independently on schema FDs and MVDs.

### 4.3 `POST /api/v1/normalize/analyze`
Unified pipeline executing 1NF $\to$ 2NF $\to$ 3NF $\to$ 4NF, returning `FullNormalizationAnalysisResult` with `highest_confirmed_normal_form`.
