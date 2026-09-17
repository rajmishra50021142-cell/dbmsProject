# Normalization Lab: 1NF & 2NF Normalization Engine

## 1. Executive Summary & Architectural Scope

The **1NF & 2NF Normalization Engine** implemented in **Phase 5** provides deterministic, mathematically rigorous analysis, violation detection, and decomposition guidance for First Normal Form (1NF) and Second Normal Form (2NF).

As established in the *Normalization Lab Master Architecture*:
- **Phase 3** implemented the canonical Functional Dependency Engine and deterministic Attribute Closure algorithm ($X^+$).
- **Phase 4** implemented complete Candidate Key and Superkey discovery, minimality verification, and Prime/Non-Prime attribute partitioning.
- **Phase 5** directly reuses Phase 3's closure engine and Phase 4's candidate key and prime attribute engine to evaluate 1NF atomicity and 2NF partial dependencies without duplication.
- **Phase 6** will evaluate 3NF (transitive dependencies) and 4NF (multivalued dependencies).
- **Phase 7** will evaluate formal Lossless-Join verification and Dependency Preservation. All 2NF decompositions generated in Phase 5 are marked as `NOT_YET_VERIFIED` to maintain strict academic integrity.

---

## 2. First Normal Form (1NF) Engine

### 2.1 Theoretical Definition
A relation $R$ is in **First Normal Form (1NF)** if and only if:
1. Every attribute domain contains only atomic (indivisible) values.
2. Every cell (row-attribute intersection) holds exactly one value from its domain.
3. There are no repeating attribute groups (e.g., `Phone1`, `Phone2`, `Phone3`) embedded in the schema definition.

### 2.2 Violation Detection Mechanics

The engine applies a dual-layer inspection:

#### Layer 1: Schema-Level Repeating Groups
Scans the attribute list using regular expressions to detect numbered column families representing flattened multi-valued sets:
$$\text{Pattern}: \quad \text{\^{}([a-zA-Z\_]+?)(\d+)\$}$$
When multiple columns share a stem prefix and distinct numerical suffixes (e.g., `Phone1` and `Phone2`, `Skill_1` and `Skill_2`), a `REPEATING_GROUPS_IN_SCHEMA` violation is flagged.

#### Layer 2: Data-Level Cell Atomicity Inspection
When sample tuples are provided, each string cell is inspected for common delimiter patterns indicating nested arrays or multi-valued lists:
- Comma: `,`
- Semicolon: `;`
- Pipe: `|`
- Newline: `\n`

Values enclosed in quotes or parentheses (e.g., coordinates `(10, 20)` or full addresses `"Suite 400, NY"`) are protected from false-positive splitting.

### 2.3 Honest Handling of Schema-Only Inputs (`INSUFFICIENT_DATA`)
In relational theory, 1NF is fundamentally a data-level property. When a user submits an analysis input containing only attributes and functional dependencies without sample rows:
- The engine does **not** falsely mark 1NF as satisfied.
- The engine assigns status `INSUFFICIENT_DATA` with reason code `NO_SAMPLE_DATA_PROVIDED`.
- An explicit academic limitation notice is included in `limitations`.
- Downstream 2NF analysis proceeds conditionally on the schema's functional dependency structure.

### 2.4 Conceptual 1NF Unnesting Transformation
When cell-level atomicity violations are detected, the engine generates a non-destructive conceptual 1NF transformation preview:
1. Each non-atomic cell is parsed into its component atomic values.
2. The Cartesian product across multi-valued attributes for each row is generated.
3. Unnested atomic tuples are synthesized and displayed alongside the original tuples with an explanatory summary.

---

## 3. Second Normal Form (2NF) Engine

### 3.1 Theoretical Definition
A relation $R$ is in **Second Normal Form (2NF)** if and only if:
1. $R$ satisfies First Normal Form (1NF).
2. Every non-prime attribute $A \in R$ is **fully functionally dependent** on every candidate key $K$ of $R$.

Equivalently, $R$ is in 2NF if no non-prime attribute depends on a proper subset of any candidate key:
$$\forall K \in \mathcal{CK}(R), \quad \forall S \subset K \; (S \neq \emptyset, S \neq K), \quad \forall A \in \text{Non-Prime}(R): \quad S \not\to A$$

### 3.2 Key Definitions
- **Candidate Key ($K$)**: A minimal superkey. Determined deterministically by Phase 4's candidate key engine.
- **Prime Attribute ($P$)**: An attribute that belongs to *at least one* candidate key:
  $$P \in \bigcup_{K \in \mathcal{CK}(R)} K$$
- **Non-Prime Attribute ($NP$)**: An attribute that belongs to *no* candidate key:
  $$NP = R \setminus \bigcup_{K \in \mathcal{CK}(R)} K$$
- **Proper Subset ($S \subset K$)**: A non-empty subset of a composite candidate key such that $|S| < |K|$.
- **Partial Functional Dependency**: A functional dependency $S \to A$ where $S \subset K$ for some candidate key $K$, and $A$ is a non-prime attribute ($A \notin P$).

### 3.3 Evaluation Algorithm

```text
Algorithm: Analyze2NF(R, FDs, CKs, NF1_Status)
1. Verify 1NF Prerequisite:
   If NF1_Status == VIOLATED:
     prerequisite_blocked = True
   Else If NF1_Status == INSUFFICIENT_DATA:
     prerequisite_blocked = False, record warning

2. Classify Attributes:
   PrimeAttributes = ∪ {K | K ∈ CKs}
   NonPrimeAttributes = R \ PrimeAttributes

3. Check Fast-Path Optimizations:
   If all K ∈ CKs have |K| == 1:
     Return 2NF_SATISFIED (Single-attribute keys have no non-empty proper subsets)
   If NonPrimeAttributes is empty:
     Return 2NF_SATISFIED (All attributes are prime; partial dependency impossible)

4. Identify Composite Keys:
   CompositeKeys = {K ∈ CKs | |K| > 1}

5. Enumerate Proper Subsets & Compute Closures:
   PartialDependencies = []
   For each K ∈ CompositeKeys:
     Subsets = PowerSet(K) \ {∅, K}
     For each S ∈ Subsets:
       Closure_S = ComputeAttributeClosure(R, FDs, S)
       DeterminedNonPrime = (Closure_S ∩ NonPrimeAttributes) \ S
       If DeterminedNonPrime is not empty:
         Record PartialDependency(
           determinant = S,
           dependent_attributes = DeterminedNonPrime,
           affected_candidate_key = K,
           is_implied = (S → DeterminedNonPrime not in explicit FDs)
         )

6. Determine Verdict:
   If PartialDependencies is not empty:
     If prerequisite_blocked:
       Status = BLOCKED_BY_PREREQUISITE
     Else:
       Status = VIOLATED
     Generate 2NF Decomposition Proposal (verification_status = "NOT_YET_VERIFIED")
   Else:
     If prerequisite_blocked:
       Status = BLOCKED_BY_PREREQUISITE
     Else:
       Status = SATISFIED
```

### 3.4 Multi-Candidate Key Correctness
The engine analyzes partial dependencies against **all** candidate keys. If an attribute $A$ is functionally determined by a proper subset of Candidate Key $K_1$, but $A$ is part of another Candidate Key $K_2$, $A$ is **prime** and does **not** violate 2NF according to Codd's formal definition:
$$\text{Violation requires } A \in \text{Non-Prime}(R)$$
Only dependencies onto strictly non-prime attributes are classified as partial dependency violations.

### 3.5 Direct vs. Implied Partial Dependencies
A partial dependency may be:
1. **Direct**: Expressly declared in the relation's functional dependencies (e.g., $StudentID \to StudentName$).
2. **Implied**: Derived transitively through attribute closure ($S^+_{\mathcal{F}}$) even if not written directly in the initial FD set.
The engine distinguishes these and tags implied dependencies with `is_implied: true` and an explanation of the closure derivation.

---

## 4. 2NF Decomposition Foundation

### 4.1 Decomposition Strategy
When 2NF is violated, the engine provides a structured decomposition proposal that eliminates partial dependencies:
1. **Partial Entity Relations**: For each distinct partial dependency determinant $S$, create a sub-relation $R_S$:
   $$R_S = S \cup \{A \in \text{Non-Prime} \mid S \to A\}$$
   with Primary Key $S$.
2. **Remainder Relation**: Create a remainder relation containing the original composite candidate key $K$ and any remaining attributes that depend on the full key:
   $$R_{\text{remainder}} = K \cup (R \setminus \bigcup \text{ExtractedAttributes})$$
   with Primary Key $K$.

### 4.2 Academic Caveat (`NOT_YET_VERIFIED`)
In keeping with academic rigor:
- Phase 5 creates the **structural proposal**.
- Formal **Lossless-Join Verification** (testing if $\Pi_{R_1}(r) \bowtie \Pi_{R_2}(r) = r$) and **Dependency Preservation Verification** ($\mathcal{F}^+ = (\mathcal{F}_1 \cup \mathcal{F}_2)^+$) are scheduled for **Phase 7**.
- All Phase 5 proposals are explicitly marked with `verification_status: "NOT_YET_VERIFIED"`.

---

## 5. Machine-Readable Reason Codes

| Reason Code | Normal Form | Meaning |
| :--- | :--- | :--- |
| `ATOMIC_CELLS_VERIFIED` | 1NF | All sample data cells contain atomic values; no repeating groups. |
| `NON_ATOMIC_VALUES_DETECTED` | 1NF | Multi-valued delimiter-separated values detected in sample tuples. |
| `REPEATING_GROUPS_IN_SCHEMA` | 1NF | Numbered column families (e.g., `Phone1`, `Phone2`) detected in schema. |
| `NO_SAMPLE_DATA_PROVIDED` | 1NF | Schema-only input; cell-level atomicity cannot be inspected. |
| `NO_PARTIAL_DEPENDENCIES` | 2NF | No proper subset of any candidate key determines any non-prime attribute. |
| `SINGLE_ATTRIBUTE_KEYS_NO_PARTIAL_DEPENDENCY` | 2NF | All candidate keys are single attributes; proper subsets cannot exist. |
| `ALL_ATTRIBUTES_PRIME` | 2NF | Every attribute belongs to at least one candidate key; non-prime set is empty. |
| `PARTIAL_DEPENDENCIES_DETECTED` | 2NF | One or more non-prime attributes depend on proper subsets of candidate keys. |
| `PREREQUISITE_1NF_VIOLATED` | 2NF | 2NF evaluation is formally blocked because 1NF is violated. |
| `DECOMPOSE_PARTIAL_DEPENDENCIES` | 2NF | Decomposition recommended to isolate partial dependencies into sub-relations. |

---

## 6. Verification Metrics

- **Backend Pytest Tests**: 75 tests passing (0.06s), covering 1NF atomicity, repeating groups, Cartesian unnesting, 2NF partial dependencies, multiple candidate keys, single-attribute key optimization, and API endpoints.
- **Frontend Vitest Tests**: 33 tests passing (1.39s), covering UI rendering, stepper interactions, 1NF modal previews, 2NF partial dependency cards, decomposition proposals, and Phase 6 roadmaps.
- **TypeScript Strict Build**: 0 errors, 0 warnings.
