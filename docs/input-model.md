# Normalization Lab — Canonical Schema Input & Validation Model

**Phase**: Phase 2 Specification & Contracts  
**Status**: Implemented & Verified  
**Scope**: Schema definition, dependency construction, notation parsing, and layered validation.

---

## 1. Architectural Philosophy

The input workspace is strictly separated from downstream normalization mathematics (Phases 3–7).  
Its sole responsibility is:

```text
User Input (Guided Builder or Raw DBMS Notation)
                 ↓
      Parse & Canonicalize
                 ↓
Layered Validation (Field → Referential → Cross-Collection)
                 ↓
      CanonicalSchemaInput (Domain Contract)
                 ↓
 Downstream Normalization Engines (Phases 3–7)
```

Both **Structured Guided Mode** and **Raw Notation Mode** produce the **exact same canonical representation**.

---

## 2. The Canonical Schema Contract

All schemas in Normalization Lab conform to the following JSON/Pydantic data contract:

```json
{
  "name": "ENROLLMENT",
  "attributes": [
    "StudentID",
    "CourseID",
    "StudentName",
    "CourseName",
    "Grade"
  ],
  "candidate_keys": [
    ["StudentID", "CourseID"]
  ],
  "functional_dependencies": [
    {
      "id": "fd-1",
      "left": ["StudentID"],
      "right": ["StudentName"]
    },
    {
      "id": "fd-2",
      "left": ["CourseID"],
      "right": ["CourseName"]
    },
    {
      "id": "fd-3",
      "left": ["StudentID", "CourseID"],
      "right": ["Grade"]
    }
  ],
  "multivalued_dependencies": [],
  "sample_data": [
    {
      "StudentID": "S1",
      "CourseID": "C1",
      "StudentName": "Alice",
      "CourseName": "Database Systems",
      "Grade": "A"
    }
  ]
}
```

### Logical Set Semantics vs Display Order
- **Attributes**: Stored as an ordered list to preserve user-intended display order across tables and previews, but treated as a unique mathematical set.
- **Dependencies**: Determinants ($LHS$) and dependents ($RHS$) are ordered lists of attribute strings, validated to ensure uniqueness within each side and across dependencies.

---

## 3. Raw DBMS Notation Grammar

For advanced database engineering students and instructors, the raw parser supports standard textbook relational notation:

### Grammar Syntax
```text
Relation:
RELATION_NAME(Attr1, Attr2, Attr3, ...)

Candidate Keys:
(Attr1, Attr2), (Attr3)

FDs:
Attr1 -> Attr2
Attr1, Attr2 -> Attr3

MVDs:
Attr1 ->> Attr4
```

### Arrow Symbols
- `->` or `→`: Functional Dependency ($X \to Y$)
- `->>` or `↠`: Multivalued Dependency ($X \twoheadrightarrow Y$)

### Parser Error Handling
Errors pinpoint the exact line, section, and failure token:
- `Line 4: 'A ->' is incomplete. Add at least one right-hand-side attribute.`
- `Line 6: 'A ->>> B' is not recognized. Use '->' for FD or '->>' for MVD.`

---

## 4. Layered Validation Rules

Validation occurs across three distinct tiers before schema acceptance:

### Layer 1: Field Validation
- **Relation Name**: Non-empty, alphanumeric with underscores, trimmed.
- **Attributes**: At least one attribute required.
- **Dependency Sides**: Neither determinant nor dependent side may be empty.

### Layer 2: Referential Integrity
- All attributes in `candidate_keys` must exist in `attributes`.
- All attributes in `functional_dependencies` ($LHS$ and $RHS$) must exist in `attributes`.
- All attributes in `multivalued_dependencies` ($LHS$ and $RHS$) must exist in `attributes`.
- All keys in `sample_data` tuples must map to valid relation attributes.

### Layer 3: Cross-Collection & Redundancy Checks
- **Duplicate Attributes**: Disallowed (e.g. `StudentID` and `StudentID`).
- **Duplicate Candidate Keys**: Equivalent key sets detected (e.g. `(A, B)` vs `(B, A)`).
- **Duplicate Functional Dependencies**: Identical or permuted $LHS/RHS$ dependencies detected and flagged.
- **Duplicate Multivalued Dependencies**: Redundant MVD sets detected.

### Warnings vs Blocking Errors
- **Blocking Errors**: Prevent downstream analysis (e.g. referencing an unknown attribute).
- **Pedagogical Warnings**: Educational advisories that do not block processing:
  - *No Candidate Keys Provided*: Educational reminder that Phase 4 will compute minimal keys automatically from FDs.
  - *Trivial Dependencies*: Educational reminder that $A \to A$ or $(A, B) \to A$ is mathematically trivial according to Armstrong's Reflexivity axiom.
  - *Unverified User Keys*: Clear disclosure that manually provided keys have not yet been proven minimal in Phase 4.

---

## 5. REST API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/v1/schema/validate` | Validates a canonical schema input object with layered checks. |
| `POST` | `/api/v1/schema/parse-raw` | Parses raw DBMS text notation into a validated canonical schema. |
| `GET` | `/api/v1/schema/examples` | Retrieves 5 curated textbook reference schemas. |
