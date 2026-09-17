# PHASE 5 — 1NF & 2NF Analysis, Violation Detection, and Decomposition Foundation
## 1NF–4NF Normalization Visualizer & Analyzer / "Normalization Lab"

**This is the execution specification for Phase 5.**

Use this file together with:

- `normalization_lab_master_project_reference.md`
- `phase_1_project_foundation_prompt.md`
- `phase_2_schema_input_builder_validation_prompt.md`
- `phase_3_fd_engine_attribute_closure_prompt.md`
- `phase_4_candidate_key_engine_prompt.md`

The master reference defines the complete project vision.
Phases 1–4 established the project foundation, input/validation layer, functional-dependency/closure engine, and candidate-key/superkey/prime-attribute engine.

Phase 5 now implements the first two actual normalization stages:

> **First Normal Form (1NF)**  
> **Second Normal Form (2NF)**

This phase must be academically rigorous, deterministic, explainable, reusable, and fully integrated with the previous phases.

**Implement Phase 5 only. Do not automatically start Phase 6.**

---

# 0. WHERE PHASE 5 FITS

Overall project:

```text
PHASE 1
Foundation / Architecture / UI System
        ↓
PHASE 2
Schema / Input Builder / Validation
        ↓
PHASE 3
FD Engine + Attribute Closure
        ↓
PHASE 4
Candidate Keys + Superkeys + Prime Attributes
        ↓
PHASE 5  ← CURRENT
1NF + 2NF Analysis
        ↓
PHASE 6
3NF + 4NF Analysis
        ↓
PHASE 7
Decomposition + Verification
        ↓
PHASE 8
Complete Visualization Engine
        ↓
PHASE 9
Creativity Features + Contextual Assistant
        ↓
PHASE 10
Learn / Help / Developed By / Download
        ↓
PHASE 11
Complete Testing
        ↓
PHASE 12
Deployment + Final Polish
```

---

# 1. PRIMARY OBJECTIVE OF PHASE 5

Implement a reliable normalization engine for:

- 1NF detection and explanation,
- 1NF transformation guidance,
- 2NF detection and explanation,
- partial-dependency detection,
- multiple candidate-key support,
- composite candidate-key handling,
- prime/non-prime attribute handling,
- 2NF decomposition planning,
- structured processing steps,
- educational reasoning,
- frontend normalization-stage results,
- API endpoints,
- extensive testing.

The engine must reuse the existing services from Phases 2–4.

Do not duplicate:

- input validation,
- attribute-set utilities,
- attribute closure,
- candidate-key detection,
- prime/non-prime calculation.

---

# 2. CRITICAL ACADEMIC RULE

The system must distinguish between:

```text
INPUT VALIDATION
```

and:

```text
NORMALIZATION ANALYSIS
```

Phase 2 validates whether the user supplied a structurally valid relation, FD set, MVD set, and sample data.

Phase 5 determines whether that relation satisfies 1NF/2NF.

Do not reject valid input merely because it is not normalized.

A relation that violates 1NF or 2NF is still valid input to the analyzer.

---

# 3. CORE NORMALIZATION PRINCIPLE

The application must never behave like a black box.

Every result must be traceable:

```text
Input
 ↓
Relevant rule
 ↓
Evidence
 ↓
Conclusion
 ↓
Recommended transformation/decomposition
```

For example:

```text
Candidate Key:
(StudentID, CourseID)

FD:
StudentID → StudentName

StudentID ⊂ (StudentID, CourseID)

StudentName:
non-prime

Therefore:
partial dependency exists

Conclusion:
2NF is violated
```

The exact explanation must be generated from the actual analysis data.

---

# 4. 1NF — SCOPE

The 1NF implementation must cover the aspects relevant to the assigned topic:

- atomic values,
- non-atomic values,
- repeating groups,
- multi-valued cells,
- repeated attribute groups where represented in input/sample data,
- identifying a violation,
- explaining the violation,
- showing how the structure/data can be converted to 1NF.

The system must be honest about what it can determine.

---

# 5. 1NF — IMPORTANT INPUT LIMITATION

1NF is fundamentally concerned with the structure of relation values.

The application may receive:

1. A relation schema only.
2. A relation schema plus sample tuples.

If the user provides only a schema with attribute names, the system generally cannot reliably inspect actual stored values for atomicity.

Therefore:

- do not invent a 1NF violation,
- do not invent sample values,
- do not claim to have detected non-atomic values without evidence.

The UI should state something such as:

> "No sample tuples were supplied. 1NF data-level atomicity cannot be fully inspected from schema metadata alone."

The result can still explain the 1NF condition and indicate what information is missing.

---

# 6. 1NF — DATA-LEVEL ANALYSIS

When sample data is provided, inspect cells for obvious non-atomic/multi-valued representations according to the application's documented assumptions.

Examples that may be flagged for user review:

```text
"DBMS, OS, CN"
```

```text
"Cricket | Music | Chess"
```

or repeating groups represented as separate fields:

```text
Phone1
Phone2
Phone3
```

The analyzer should distinguish:

- observed evidence,
- heuristic warning,
- confirmed structural representation if the input format explicitly identifies repeating groups.

Do not claim that every comma-containing text value is mathematically non-atomic in all possible domains. Present it as a detected/flagged multi-valued representation when the user-provided structure indicates that interpretation.

---

# 7. 1NF RESULT MODEL

Create a structured result.

Conceptually:

```text
NF1Result
    status
    confidence / evidenceLevel if useful
    violations[]
    attributesInvolved[]
    sampleCellsInvolved[]
    reasoningSteps[]
    suggestedTransformation[]
    limitations[]
```

Possible statuses:

```text
SATISFIED
VIOLATED
INSUFFICIENT_DATA
```

Do not force an incorrect true/false result when there is insufficient evidence.

---

# 8. 1NF EXPLANATION

Example:

```text
1NF Analysis

Status:
✗ Potential 1NF violation

Evidence:
Attribute: Courses
Observed value: "DBMS, OS, CN"

Reason:
The supplied sample data represents multiple logical values
within a single cell.

Recommended transformation:
Represent each Course as a separate tuple or place the
multi-valued data in a separate relation.
```

The exact wording must be dynamically generated from the actual offending field/value.

---

# 9. 1NF TRANSFORMATION GUIDANCE

When a user provides data such as:

```text
StudentID | Name | Courses
101       | Raj  | DBMS, OS, CN
```

show a conceptual normalized representation:

```text
StudentID | Name | Course
101       | Raj  | DBMS
101       | Raj  | OS
101       | Raj  | CN
```

Do not overwrite the user's original input.

Show:

```text
Original
```

and:

```text
1NF Representation
```

as separate views.

---

# 10. 1NF AND SCHEMA-ONLY INPUT

If sample data is absent:

```text
1NF:
Cannot fully inspect data atomicity.

Required evidence:
Sample tuples / explicit structural information.
```

This is preferable to falsely marking the relation as normalized.

If the schema explicitly contains a known repeating-group design, the engine may report that structural issue if the input model represents it unambiguously.

---

# 11. 2NF — DEFINITION TO IMPLEMENT

The application must implement the standard definition:

A relation is in 2NF if:

1. It is in 1NF.
2. No non-prime attribute is partially dependent on a proper subset of a candidate key.

The engine must explicitly account for:

- 1NF prerequisite,
- candidate keys,
- composite candidate keys,
- proper subsets,
- non-prime attributes,
- functional dependencies.

---

# 12. 2NF — CRITICAL DISTINCTION

A partial dependency is relevant to 2NF only when:

- the candidate key is composite,
- the determinant is a proper subset of that candidate key,
- the dependency determines a non-prime attribute.

Do not label every dependency involving a subset of some arbitrary key-like input as a 2NF violation.

Use **verified candidate keys from Phase 4**.

---

# 13. 2NF — SINGLE-ATTRIBUTE CANDIDATE KEY

If every candidate key is a single attribute, then a proper non-empty subset of the key does not exist.

Therefore, there cannot be a partial dependency on a proper subset of a one-attribute candidate key.

The UI should be able to explain:

> "The verified candidate keys are single-attribute keys, so a partial dependency on a proper subset of a candidate key cannot occur. Subject to the 1NF result, the relation satisfies the 2NF condition."

Do not automatically declare 2NF solely from this statement if the 1NF prerequisite is not satisfied/confirmed.

---

# 14. 2NF — MULTIPLE CANDIDATE KEYS

This is mandatory.

Suppose:

```text
Candidate Key 1 = (A,B)
Candidate Key 2 = (A,C)
```

A non-prime attribute must be checked against proper subsets of **each composite candidate key**.

Do not analyze only the first key.

Do not stop after finding one violation.

Return all relevant violations.

---

# 15. 2NF — PRIME/NON-PRIME ATTRIBUTES

Reuse Phase 4's verified candidate-key analysis.

Do not ask the user to manually classify attributes again.

Example:

```text
Candidate Keys:
(A,B)

Prime:
A
B

Non-Prime:
C
D
E
```

The 2NF engine uses this classification.

---

# 16. 2NF — PARTIAL DEPENDENCY DETECTION

Given:

```text
Candidate Key K
```

and FD:

```text
X → Y
```

a relevant partial dependency exists when:

1. `X ⊂ K`,
2. `Y` contains at least one non-prime attribute,
3. the dependency is supported by the supplied FD set / actual determinant relationship.

The engine must carefully handle multi-attribute RHS.

For:

```text
A → B,C
```

if `C` is non-prime and `A` is a proper subset of a candidate key, then `C` is partially dependent.

If `B` is prime and `C` is non-prime, the violation concerns `C`, not `B`.

---

# 17. DIRECT VS IMPLIED PARTIAL DEPENDENCIES

The engine should consider the actual supplied FD set and the functional dependencies implied by it where necessary.

Example:

```text
A → B
B → C
```

If a candidate key is:

```text
(A,D)
```

then:

```text
A → C
```

is implied.

If `C` is non-prime, this can matter to partial-dependency analysis.

Do not implement a separate FD-closure algorithm.

Use Phase 3's dependency-determination/closure services.

The implementation should document how implied dependencies are detected.

---

# 18. DO NOT NAIVELY CHECK ONLY EXACT FDS

A relation's 2NF analysis must not fail simply because the user did not explicitly type every implied dependency.

Use closure-based reasoning where necessary.

Example:

```text
A → B
B → C
```

means:

```text
A → C
```

is implied.

The 2NF engine should be able to recognize relevant implications through the Phase 3 engine.

---

# 19. 2NF — PROPER SUBSET CHECK

For composite candidate key:

```text
(A,B,C)
```

potential proper subsets include:

```text
A
B
C
A,B
A,C
B,C
```

The implementation should not blindly enumerate all subsets if there is a more efficient correct method.

It should identify whether an FD determinant is a proper subset of the candidate key.

For multi-attribute dependencies, use true set semantics.

---

# 20. 2NF — PARTIAL DEPENDENCY EXAMPLE

Input:

```text
R(StudentID, CourseID, StudentName, CourseName, Grade)

Candidate Key:
(StudentID, CourseID)

FDs:
StudentID → StudentName
CourseID → CourseName
StudentID,CourseID → Grade
```

Prime:

```text
StudentID
CourseID
```

Non-prime:

```text
StudentName
CourseName
Grade
```

Detected partial dependencies:

```text
StudentID → StudentName
CourseID → CourseName
```

Result:

```text
2NF = VIOLATED
```

The explanation must identify both dependencies.

---

# 21. 2NF — NO PARTIAL DEPENDENCY EXAMPLE

Suppose:

```text
R(A,B,C)

Candidate Key:
(A,B)

FD:
(A,B) → C
```

Then:

```text
(A,B)
```

is not a proper subset of the key.

Therefore no partial dependency is introduced by this FD.

The relation can satisfy 2NF subject to 1NF and other conditions.

---

# 22. 2NF RESULT MODEL

Create a structured result such as:

```text
NF2Result
    status
    prerequisite
    candidateKeys[]
    primeAttributes[]
    nonPrimeAttributes[]
    partialDependencies[]
    affectedCandidateKeys[]
    affectedAttributes[]
    reasoningSteps[]
    decompositionRecommendations[]
    limitations[]
```

This result must be serializable.

---

# 23. 2NF REASONING STEPS

For each composite candidate key, generate structured reasoning.

Example:

```text
Step 1:
Verified candidate key = (StudentID, CourseID)

Step 2:
Prime attributes = {StudentID, CourseID}

Step 3:
Non-prime attributes =
{StudentName, CourseName, Grade}

Step 4:
Examine dependency:
StudentID → StudentName

Step 5:
StudentID is a proper subset of the candidate key.

Step 6:
StudentName is non-prime.

Step 7:
Therefore, a partial dependency exists.

Conclusion:
2NF is violated.
```

The UI can display these steps.

---

# 24. 2NF WITH MULTIPLE VIOLATIONS

If several partial dependencies exist, show all of them.

Example:

```text
StudentID → StudentName
CourseID → CourseName
```

Do not stop after the first.

Group them by affected candidate key where useful.

---

# 25. 2NF WITH MULTIPLE KEYS

When multiple candidate keys exist:

```text
K1 = (A,B)
K2 = (C,D)
```

track which dependencies relate to which keys.

The result should preserve:

```text
affectedCandidateKey
dependency
nonPrimeAttributes
reason
```

This will be useful later in 3NF and reports.

---

# 26. 2NF DECOMPOSITION FOUNDATION

This phase should produce a decomposition recommendation/plan where the 2NF violation is identified.

Do not yet build the full general-purpose decomposition engine of Phase 7.

However, Phase 5 should be capable of creating a structured **2NF decomposition proposal**.

Example:

```text
Original:
ENROLLMENT(StudentID, CourseID, StudentName, CourseName, Grade)

Partial dependency:
StudentID → StudentName

Proposal:
STUDENT(StudentID, StudentName)
Remainder relation containing the key and remaining attributes.
```

For multiple partial dependencies, the plan may produce multiple relations.

The precise final decomposition engine is Phase 7, but Phase 5 should preserve the decomposition intent.

---

# 27. DECOMPOSITION SAFETY

Do not destroy the original schema.

Store:

```text
Original relation
```

separately from:

```text
Proposed 2NF relations
```

The user must be able to compare them.

---

# 28. 1NF → 2NF PROCESSING

The phase should support a conceptual result:

```text
Input
 ↓
1NF assessment
 ↓
2NF assessment
```

If 1NF is violated, the application should explain that 2NF is evaluated only after the 1NF prerequisite is satisfied.

Do not blindly declare 2NF status as if the prerequisite did not matter.

Possible status:

```text
BLOCKED_BY_PREREQUISITE
```

with:

> 2NF analysis requires the relation to satisfy 1NF. Resolve the identified 1NF issue first.

If the system can independently analyze dependency structure for educational purposes, it may provide a separate preview, but the official normal-form status must respect the prerequisite.

---

# 29. NORMALIZATION STAGE RESULT STATUS

Define consistent status types.

For example:

```text
SATISFIED
VIOLATED
BLOCKED_BY_PREREQUISITE
INSUFFICIENT_DATA
```

Use these consistently.

Do not overload a boolean.

---

# 30. COMBINED NORMALIZATION RESULT

At the end of Phase 5, the backend may provide a partial stage summary:

```text
NormalizationAnalysis
    nf1
    nf2
```

Future phases will add:

```text
nf3
nf4
```

Do not fake them.

---

# 31. API DESIGN

Create versioned endpoints consistent with existing phases.

Possible endpoints:

```text
POST /api/v1/normalize/1nf
POST /api/v1/normalize/2nf
POST /api/v1/normalize/analyze
```

A unified endpoint may be preferable if it returns 1NF and 2NF results together.

Choose a clean design that avoids duplicated processing.

---

# 32. RECOMMENDED ANALYSIS ENDPOINT

A practical endpoint:

```text
POST /api/v1/normalize/analyze/basic
```

Input:

```text
validated AnalysisInput
```

Output:

```text
nf1Result
nf2Result
```

plus shared key/dependency metadata if useful.

Do not include 3NF/4NF placeholders pretending to be implemented unless the response clearly marks them as not yet implemented.

---

# 33. API INPUT SOURCE

The endpoint must consume the canonical model produced by Phase 2.

Do not create a second incompatible request schema.

The engine should reuse:

- relation,
- attributes,
- FDs,
- MVDs,
- sample data,
- manually supplied keys.

Candidate-key results should come from Phase 4.

---

# 34. API RESULT TRACE

Responses should preserve:

- violations,
- reasoning,
- dependencies involved,
- attributes involved,
- decomposition proposals.

Do not flatten all of this to a single explanatory string.

---

# 35. FRONTEND NORMALIZATION PANEL

Turn the Phase 2/3/4 Analyzer into a real 1NF/2NF analysis workspace.

Conceptually:

```text
NORMALIZATION JOURNEY

[1NF]──────[2NF]──────[3NF]──────[4NF]
  ●           ○          ○          ○
```

In this phase:

- 1NF becomes functional,
- 2NF becomes functional,
- 3NF and 4NF remain clearly unavailable/not implemented.

Do not show fake statuses for 3NF/4NF.

---

# 36. 1NF RESULT PANEL

Display:

```text
1NF

✓ Satisfied
```

or:

```text
1NF

✗ Violation detected

Why?
...
```

If evidence is insufficient:

```text
1NF

⚠ Insufficient data

Sample tuples are required to inspect
cell-level atomicity.
```

---

# 37. 2NF RESULT PANEL

Display:

```text
2NF

✗ Violated

Partial dependencies:
StudentID → StudentName
CourseID → CourseName

Affected candidate key:
(StudentID, CourseID)

[Why?]
[Show Logic]
[Show Decomposition Proposal]
```

Everything must come from actual engine results.

---

# 38. SHOW LOGIC

The existing/future "Why?" feature should now have real data to display.

For 2NF:

```text
Why did this relation fail 2NF?

Candidate key:
(StudentID, CourseID)

Proper subset:
StudentID

Dependency:
StudentID → StudentName

StudentName:
Non-prime

Therefore:
Partial dependency exists.
```

This is deterministic.

No LLM needed.

---

# 39. CANDIDATE-KEY INTEGRATION

If Phase 4 has identified:

```text
Candidate Keys:
(A,B)
(C,D)
```

the 2NF engine must use those results.

If the key set is missing or mathematically unavailable:

- explain why,
- do not fabricate prime/non-prime attributes,
- provide an actionable message.

---

# 40. USER-PROVIDED KEY VS ENGINE-VERIFIED KEY

Use Phase 4 results.

Display:

```text
User-provided:
(A,B)

Verified:
✓ Candidate key
```

or:

```text
User-provided:
(A,B,C)

Verification:
⚠ Superkey but not candidate key
```

The 2NF engine should use only verified candidate keys in its formal classification.

---

# 41. 1NF INTERACTIVE TRANSFORMATION

When a 1NF issue is detected, show an expandable transformation.

Example:

```text
Original

Student | Courses
Raj     | DBMS, OS

       ↓

1NF representation

Student | Course
Raj     | DBMS
Raj     | OS
```

Do not modify the source data silently.

Allow the user to inspect the transformation.

---

# 42. 2NF DECOMPOSITION PREVIEW

Where a 2NF violation exists, show:

```text
BEFORE

ENROLLMENT
────────────────────────────
StudentID
CourseID
StudentName
CourseName
Grade

        ↓
Partial dependency detected

AFTER / PROPOSAL

STUDENT
StudentID
StudentName

COURSE
CourseID
CourseName

ENROLLMENT
StudentID
CourseID
Grade
```

This is a proposal for now.

The full decomposition/verification engine belongs to Phase 7.

---

# 43. DECOMPOSITION LOGIC CAUTION

Do not blindly decompose using a simplistic "remove every RHS" rule.

A correct decomposition must retain the necessary key/relationship information and should be validated later by the dedicated decomposition engine.

Phase 5 should emit a structured proposal, not claim final lossless/dependency-preservation guarantees unless such verification has actually been implemented.

---

# 44. EDUCATIONAL "WHAT HAPPENED?" SUMMARY

For each analysis, provide a short summary.

Example:

> The relation is not in 2NF because two non-prime attributes depend on only part of the composite candidate key. The relation can be separated into entity/detail relations so that those attributes depend on their appropriate determinants.

The exact wording should be generated from actual results.

---

# 45. EDUCATIONAL "WHAT TO DO NEXT?" SUMMARY

Example:

```text
Next step

Resolve the 1NF issue first.
Then re-analyze 2NF.

[Review 1NF Issue]
```

For 2NF violation:

```text
Next step

Decompose the relation around the identified partial
dependencies and re-check normalization.
```

Do not pretend Phase 7 has already verified the decomposition.

---

# 46. CURRENT SCHEMA / INPUT SNAPSHOT

At analysis time, preserve the exact input version.

Results should correspond to the input that produced them.

If user modifies:

- relation,
- attributes,
- FDs,
- keys,
- sample data,

invalidate previous normalization results.

Show:

> Input changed — re-run normalization analysis.

---

# 47. STALE-RESULT PROTECTION

This is mandatory.

Do not allow the UI to show:

```text
2NF ✗
```

from an old FD set after the user changes a dependency.

Use:

```text
inputFingerprint
analysisFingerprint
```

or a version counter.

If mismatched:

```text
Result is outdated.
[Re-analyze]
```

---

# 48. WHAT-IF COMPATIBILITY

Do not implement the complete What-If Mode now.

But the Phase 5 analyzer must be callable repeatedly with new input.

No hidden global state.

The analyzer function should behave like a pure/reusable service where possible:

```text
analyzeBasicNormalization(input)
```

---

# 49. ERROR HANDLING

Examples:

### No attributes

Use Phase 2 validation rather than attempting analysis.

### No candidate keys

Provide:

> Candidate keys are not currently available. Run candidate-key analysis first or provide a valid key.

### No sample data for 1NF

Use:

> Sample tuples were not supplied, so cell-level atomicity cannot be fully evaluated.

### Invalid dependencies

Block analysis and show the existing validation errors.

---

# 50. NO NORMALIZATION AI

Do not use a paid LLM for:

- 1NF detection,
- 2NF detection,
- partial-dependency detection,
- candidate-key identification,
- explanations of deterministic results.

All of this must come from the project's own DBMS logic.

---

# 51. PERFORMANCE

For normal educational/classroom inputs:

- 1NF analysis should be very fast,
- 2NF analysis should be very fast,
- repeated closure/key calls should remain responsive.

Reuse Phase 3/4 services.

Avoid recalculating the same candidate-key/closure data unnecessarily within one analysis.

---

# 52. TESTING — 1NF

Test at minimum:

### Test 1 — Atomic sample data

All cells represent single values.

Expected:

```text
1NF satisfied
```

### Test 2 — Multi-valued cell

```text
Courses = "DBMS, OS"
```

Expected appropriate 1NF warning/violation based on the application's documented data interpretation.

### Test 3 — No sample data

Expected:

```text
Insufficient data for data-level atomicity inspection.
```

### Test 4 — Repeating-group structure

If represented in the input format, verify detection.

### Test 5 — Multiple offending rows

All relevant evidence should be captured.

---

# 53. TESTING — 2NF

## Test A — Clear 2NF violation

```text
R(StudentID, CourseID, StudentName, CourseName, Grade)

K = (StudentID, CourseID)

FDs:
StudentID → StudentName
CourseID → CourseName
StudentID,CourseID → Grade
```

Expected:

```text
1NF ✓ / subject to provided data
2NF ✗
```

with two partial dependencies.

## Test B — No partial dependency

```text
R(A,B,C)

K = (A,B)

(A,B) → C
```

Expected:

```text
2NF ✓
```

subject to 1NF.

## Test C — Single-attribute key

Verify that a partial dependency cannot occur because no proper subset of a one-attribute key exists.

## Test D — Multiple candidate keys

Ensure every composite candidate key is examined.

## Test E — Prime RHS

A dependency on a prime attribute should not by itself create a 2NF violation.

## Test F — Implied dependency

```text
A → B
B → C
```

with a composite key containing A and another attribute, verify closure-based reasoning where C is non-prime.

## Test G — Multiple RHS

Test:

```text
A → B,C
```

where only one RHS attribute is non-prime.

## Test H — No FDs

Correctly handle the empty dependency set.

---

# 54. TESTING — MULTIPLE CANDIDATE KEYS

Create test cases where the relation has:

```text
K1
K2
```

and ensure:

- both are analyzed,
- no key is ignored,
- relevant partial dependencies are associated correctly,
- prime attributes come from Phase 4.

---

# 55. TESTING — REGRESSION

Verify that these earlier features still work:

Phase 1:

- routing,
- navigation,
- Day/Night,
- UI design system.

Phase 2:

- structured input,
- raw input,
- validation,
- examples,
- sample data.

Phase 3:

- FD engine,
- closure,
- dependency determination.

Phase 4:

- key discovery,
- superkey verification,
- prime/non-prime attributes.

Do not break any previous phase.

---

# 56. API TESTS

Test:

- valid basic-normalization request,
- missing sample data,
- valid sample data,
- 1NF violation,
- 2NF violation,
- no partial dependency,
- multiple candidate keys,
- invalid prerequisite,
- stale-input handling where API versioning supports it.

---

# 57. FRONTEND TESTS

Test:

- 1NF result renders,
- 2NF result renders,
- status changes,
- Why panel,
- reasoning steps,
- dependency list,
- affected keys,
- decomposition proposal,
- insufficient-data state,
- prerequisite-blocked state,
- re-analysis after input changes,
- stale-result indicator.

---

# 58. API AND FRONTEND CONTRACT

Document the schema for:

```text
NF1Result
NF2Result
BasicNormalizationResult
```

The frontend must not infer mathematical status itself.

The backend result is authoritative.

---

# 59. NORMALIZATION RESULT TYPES

Use explicit status values.

For example:

```text
NFStatus:
    SATISFIED
    VIOLATED
    BLOCKED_BY_PREREQUISITE
    INSUFFICIENT_DATA
```

Avoid ambiguous values.

---

# 60. EXPLANATION DATA

Do not send only final explanation strings.

Return structured facts:

```text
reasonCode
dependency
candidateKey
properSubset
affectedAttributes
prime/nonPrime classification
```

Then generate UI explanation from those facts.

This will help later:

- contextual assistant,
- reports,
- visualizer,
- testing.

---

# 61. REASON CODES

Use stable machine-readable reason identifiers.

Examples:

```text
NON_ATOMIC_VALUE
REPEATING_GROUP
MISSING_1NF_EVIDENCE
PARTIAL_DEPENDENCY
NO_COMPOSITE_KEY
NO_PARTIAL_DEPENDENCY
```

Exact names can follow project conventions.

---

# 62. UI DESIGN — 1NF

1NF result should look educational, not like an error console.

Example:

```text
1NF
────────────────────────────

✗ Not in 1NF

Courses contains multiple values.

Observed:
"DBMS, OS, CN"

Why it matters:
Each relation cell should represent a single atomic value.

[Show 1NF transformation]
```

Use subtle status styling.

---

# 63. UI DESIGN — 2NF

Example:

```text
2NF
────────────────────────────

✗ Not in 2NF

2 partial dependencies detected.

🔑 (StudentID, CourseID)

StudentID → StudentName
CourseID → CourseName

[Show Logic]
[Show Decomposition]
```

Make the candidate key and determinant visually connected.

---

# 64. DEPENDENCY HIGHLIGHTING

For 2NF:

When selecting:

```text
StudentID → StudentName
```

highlight:

- StudentID,
- StudentName,
- composite key,
- proper-subset relationship.

This provides the basis for the full dependency graph in Phase 8.

---

# 65. STEP-BY-STEP NORMALIZATION JOURNEY

Phase 5 can make the first two steps interactive.

Example:

```text
INPUT
  ↓
1NF
  ↓
2NF
  ↓
3NF
  ↓
4NF
```

At this phase:

- 1NF active,
- 2NF active,
- 3NF/4NF visually disabled or marked "Upcoming".

Do not falsely report results for 3NF/4NF.

---

# 66. NAVIGATION BETWEEN STAGES

Allow users to click:

```text
1NF
2NF
```

to inspect the relevant analysis.

Do not allow them to access a fake 3NF or 4NF result.

If clicked:

> 3NF analysis will be available in a later stage of the project.

Only if such a placeholder is needed.

---

# 67. INTERMEDIATE REPRESENTATION

Keep the original relation and proposed 2NF relations separately.

Conceptually:

```text
OriginalRelation
NF1Representation
NF2Proposals[]
```

Do not overwrite the canonical user input.

---

# 68. DECOMPOSITION PROPOSAL DATA

Conceptually:

```text
DecompositionProposal
    sourceRelation
    reasonCode
    violatingDependency
    determinant
    affectedAttributes
    proposedRelations[]
    explanation
    verificationStatus
```

For Phase 5:

```text
verificationStatus:
NOT_YET_VERIFIED
```

unless a later verification engine is somehow used, which is not required now.

---

# 69. DO NOT CLAIM LOSSLESSNESS YET

Do not display:

```text
Lossless ✓
```

unless a real verification algorithm has been implemented and applied.

Phase 7 owns that responsibility.

For now:

> Decomposition proposal generated. Formal lossless/dependency-preservation verification is performed in a later verification stage.

---

# 70. DO NOT CLAIM DEPENDENCY PRESERVATION YET

Same rule.

Do not fabricate dependency-preservation results.

---

# 71. EDUCATIONAL SUMMARY OF 2NF

The application can provide a concise learning box:

> A relation violates 2NF when a non-prime attribute depends on only part of a composite candidate key.

Then connect it to the actual detected dependency.

---

# 72. USER ACTIONS AFTER 2NF VIOLATION

Available actions:

```text
Show Logic
View Partial Dependencies
View Decomposition Proposal
Back to Input
Edit Dependencies
Re-analyze
```

Do not implement complete editing workflow differently from Phase 2.

Reuse it.

---

# 73. OPTIONAL 2NF AUTO-TRANSFORM PREVIEW

If practical, show:

```text
Apply Proposal
```

but be careful.

If this is implemented, it should create a new **working normalized representation** rather than destroying the original relation.

Label it clearly:

> Preview only

until the final decomposition engine/verification phase exists.

If it creates too much complexity, defer this interaction while still showing the proposal.

---

# 74. INPUT-TO-RESULT TRACE

The analyzer should retain enough metadata to answer:

> Which input produced this result?

Store:

- relation,
- candidate keys used,
- FD set used,
- sample data used,
- input version/fingerprint.

This is useful for stale-result protection.

---

# 75. NO HARD-CODED EXAMPLES

The five prepared examples must use the same actual analysis engine.

Do not create:

```text
if example === "2NF":
    result = "2NF false"
```

Use actual computation.

---

# 76. NO SPECIAL-CASE CHEATING

Do not hardcode logic for known sample relation names.

The engine must work with arbitrary valid supported inputs.

---

# 77. DOCUMENTATION

Create/update:

```text
docs/normal-form-engine-basic.md
```

Document:

- 1NF rules,
- 1NF evidence limitations,
- 2NF definition,
- partial dependencies,
- candidate-key dependency,
- prime/non-prime attributes,
- algorithm,
- decomposition proposal logic,
- status model,
- API,
- test cases,
- limitations.

Update:

```text
README.md
```

with Phase 5 status.

Update:

```text
docs/development.md
```

with relevant commands.

---

# 78. ALGORITHM DOCUMENTATION — 1NF

Document the actual implemented approach.

For example:

```text
1. Inspect supplied sample rows when present.
2. Validate row/column structure.
3. Identify explicitly represented multi-valued/repeating structures.
4. Record evidence.
5. Produce status.
6. Generate transformation proposal when appropriate.
```

Do not claim general semantic understanding of arbitrary free-form strings.

---

# 79. ALGORITHM DOCUMENTATION — 2NF

Document:

```text
1. Obtain 1NF result.
2. Obtain verified candidate keys from Phase 4.
3. Obtain prime/non-prime attributes.
4. For every composite candidate key:
    a. inspect relevant dependency determinants;
    b. determine whether determinant is a proper subset;
    c. determine whether RHS contains non-prime attributes;
    d. use FD/closure reasoning when necessary.
5. Record all partial dependencies.
6. Produce 2NF result.
7. Generate decomposition proposal metadata.
```

The exact implementation can differ, but it must remain mathematically correct.

---

# 80. CLOSURE REUSE

Whenever checking whether:

```text
X → Y
```

is implied, use Phase 3's:

```text
computeClosure(X)
```

and determine:

```text
Y ⊆ X+
```

Do not implement another closure routine.

---

# 81. CANDIDATE-KEY REUSE

Use Phase 4's key-analysis services.

Do not compute candidate keys independently inside the 2NF engine.

The 2NF engine should consume verified candidate keys.

---

# 82. PRIME ATTRIBUTE REUSE

Use Phase 4's verified prime-attribute set.

Do not rederive prime attributes independently.

---

# 83. MVD PRESERVATION

MVDs remain in the canonical input but are not used by the 2NF engine.

Do not delete them.

Do not alter them.

They are needed later for Phase 6 4NF.

---

# 84. PERFORMANCE

For typical classroom-sized schemas:

- 1NF analysis should be near-instant,
- 2NF analysis should be near-instant,
- UI should remain responsive.

Avoid unnecessary repeated candidate-key enumeration.

Cache or reuse the Phase 4 key-analysis result for the current input version where appropriate.

---

# 85. SECURITY / INPUT SAFETY

Continue the earlier rules:

- backend validates input,
- no arbitrary SQL execution,
- no secrets,
- no external LLM,
- no untrusted HTML rendering,
- sanitize any user-provided strings rendered into UI where needed.

---

# 86. PHASE 5 BROWSER DEMONSTRATION

Use a clear 2NF example:

```text
Relation:
ENROLLMENT

Attributes:
StudentID
CourseID
StudentName
CourseName
Grade

Candidate Key:
(StudentID, CourseID)

FDs:
StudentID → StudentName
CourseID → CourseName
(StudentID, CourseID) → Grade
```

Run analysis.

Expected:

```text
1NF:
based on supplied data/evidence

2NF:
✗ Violated
```

Show:

```text
StudentID → StudentName
CourseID → CourseName
```

Then show the reasoning.

Then show the decomposition proposal.

---

# 87. 1NF DEMONSTRATION

Use:

```text
Student | Courses
Raj     | DBMS, OS, CN
```

Show:

```text
1NF:
✗ Violation / flagged non-atomic representation
```

Then:

```text
Student | Course
Raj     | DBMS
Raj     | OS
Raj     | CN
```

Clearly label this as a transformation representation, not a mutation of the original user input.

---

# 88. 2NF PASS DEMONSTRATION

Use:

```text
R(A,B,C)

Candidate Key:
(A,B)

FD:
(A,B) → C
```

Show:

```text
1NF:
appropriate result based on input

2NF:
✓ No partial dependency detected
```

Provide:

> The only determinant of the non-prime attribute is the complete candidate key, so no partial dependency has been identified.

---

# 89. 2NF SINGLE-KEY DEMONSTRATION

Use a relation with:

```text
Candidate Key:
A
```

Show:

```text
No composite candidate key exists.

Therefore no proper-subset partial dependency
can cause a 2NF violation.
```

Again, respect the 1NF prerequisite.

---

# 90. PHASE 5 ACCEPTANCE CRITERIA

Phase 5 is complete only when all of the following are true.

## 1NF

- [ ] 1NF result model exists.
- [ ] Atomicity/data evidence can be represented.
- [ ] Non-atomic/multi-valued sample data can be flagged appropriately.
- [ ] Repeating-group representations can be handled where represented.
- [ ] Schema-only limitations are explicit.
- [ ] 1NF reasoning exists.
- [ ] 1NF transformation preview exists where appropriate.

## 2NF

- [ ] 1NF prerequisite is respected.
- [ ] Verified candidate keys from Phase 4 are used.
- [ ] Single-attribute keys handled.
- [ ] Composite keys handled.
- [ ] Multiple candidate keys handled.
- [ ] Prime/non-prime attributes reused.
- [ ] Proper-subset logic implemented.
- [ ] Partial dependencies detected.
- [ ] Multiple violations detected.
- [ ] Multi-attribute RHS handled correctly.
- [ ] Implied dependencies can be considered through closure.
- [ ] Superkey/candidate-key semantics are not confused.
- [ ] 2NF reasoning exists.
- [ ] Decomposition proposal data exists.

## Frontend

- [ ] 1NF result panel works.
- [ ] 2NF result panel works.
- [ ] Why/Show Logic works.
- [ ] Partial dependencies are displayed.
- [ ] Candidate key context shown.
- [ ] Prime/non-prime context shown.
- [ ] Decomposition proposal can be viewed.
- [ ] Input editing invalidates stale results.
- [ ] No fake 3NF/4NF result appears.

## API

- [ ] basic normalization endpoint works.
- [ ] structured request/response models exist.
- [ ] 1NF/2NF result structures documented.
- [ ] errors are structured.

## Testing

- [ ] 1NF tests pass.
- [ ] 2NF tests pass.
- [ ] multiple-key tests pass.
- [ ] implied-dependency tests pass.
- [ ] edge tests pass.
- [ ] frontend tests pass.
- [ ] API tests pass.
- [ ] regression tests for Phases 1–4 pass.

## Documentation

- [ ] 1NF theory/algorithm documented.
- [ ] 2NF theory/algorithm documented.
- [ ] limitations documented.
- [ ] decomposition-proposal limitation documented.
- [ ] complexity documented where applicable.

## Browser

- [ ] 1NF violation demo.
- [ ] 1NF pass/insufficient-data demo.
- [ ] 2NF violation demo.
- [ ] 2NF pass demo.
- [ ] multiple candidate keys demo.
- [ ] composite key demo.
- [ ] stale-result behavior checked.
- [ ] Day/Night checked.
- [ ] no critical console errors.

---

# 91. IMPORTANT NON-GOALS

Do not implement:

- 3NF.
- 4NF.
- MVD reasoning.
- 3NF decomposition.
- 4NF decomposition.
- final lossless verification.
- dependency preservation.
- final normalization visualization engine.
- full What-If mode.
- Practice Mode.
- paid LLM.
- final reports.

These belong to later phases.

---

# 92. PHASE 6 HANDOFF

Phase 6 will consume Phase 5 output.

It should be able to access:

```text
NF1Result
NF2Result
candidateKeys
primeAttributes
nonPrimeAttributes
partialDependencies
reasoningSteps
decompositionProposals
```

Phase 6 will add:

```text
3NF
4NF
```

Do not make Phase 6 repeat 1NF/2NF logic.

---

# 93. PHASE 7 HANDOFF

Phase 7 will take decomposition proposals and implement formal verification.

Therefore, Phase 5 must preserve:

```text
source relation
violating dependency
determinant
affected attributes
proposed relations
reason
```

without falsely claiming final correctness.

---

# 94. PHASE 8 HANDOFF

The complete visualizer will need structured stage data.

Phase 5 should expose:

```text
status
violations
dependencies
attributes
reasoning steps
decomposition proposals
```

so Phase 8 can animate them.

---

# 95. PHASE 9 HANDOFF

The deterministic assistant will later need to answer:

> Why not 2NF?

Phase 5 must therefore preserve structured facts that can support:

```text
why2NF()
```

without an LLM.

---

# 96. NO LLM/API REQUIREMENT

Everything in Phase 5 must work without:

- OpenAI,
- Gemini API,
- Claude API,
- Ollama,
- any paid AI service.

This includes:

- detection,
- analysis,
- reasoning,
- explanations,
- decomposition proposals.

---

# 97. FINAL DEVELOPMENT WORKFLOW

Before coding:

1. Read all master/previous-phase references.
2. Inspect the existing repository.
3. Inspect Phase 2 canonical input model.
4. Inspect Phase 3 closure API/service.
5. Inspect Phase 4 candidate-key API/service.
6. Verify previous tests pass.
7. Plan Phase 5.

During coding:

- reuse existing services,
- do not duplicate algorithms,
- keep normalization logic in backend/domain services,
- keep frontend focused on presentation/state,
- write tests with implementation,
- keep outputs structured.

After coding:

1. run all tests,
2. run build,
3. start backend,
4. start frontend,
5. execute 1NF test,
6. execute 2NF violation test,
7. execute 2NF pass test,
8. inspect reasoning,
9. inspect decomposition proposal,
10. change input and confirm stale-result invalidation,
11. inspect browser,
12. fix issues,
13. rerun tests.

---

# 98. FINAL PHASE 5 REPORT

At completion report:

1. Files created/modified.
2. 1NF engine implementation.
3. 2NF engine implementation.
4. Candidate-key integration.
5. Closure integration.
6. Prime/non-prime integration.
7. Reasoning model.
8. Decomposition proposal model.
9. API endpoints.
10. Frontend changes.
11. Test results.
12. Browser verification.
13. Complexity/limitations.
14. Phase 6 handoff information.
15. Features intentionally deferred.

Do not claim Phase 6 functionality has been implemented.

---

# 99. FINAL COMMAND

Execute **PHASE 5 ONLY**.

Read and follow:

- `normalization_lab_master_project_reference.md`
- `phase_1_project_foundation_prompt.md`
- `phase_2_schema_input_builder_validation_prompt.md`
- `phase_3_fd_engine_attribute_closure_prompt.md`
- `phase_4_candidate_key_engine_prompt.md`

Implement the complete 1NF and 2NF analysis layer described here.

Preserve all previous phases.

Do not implement 3NF or 4NF.

Do not implement MVD analysis.

Do not implement the final decomposition/verification engine.

Do not integrate a paid LLM.

Run comprehensive tests.

Verify the actual website in the browser.

Fix all blocking issues.

Do not begin Phase 6 automatically.

Stop after Phase 5 is stable and verified.
