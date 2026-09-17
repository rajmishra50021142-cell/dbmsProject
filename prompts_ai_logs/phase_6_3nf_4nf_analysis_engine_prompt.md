# PHASE 6 — 3NF & 4NF Analysis, Violation Detection, MVD Reasoning & Decomposition Planning
## 1NF–4NF Normalization Visualizer & Analyzer / "Normalization Lab"

**This is the detailed execution specification for Phase 6.**

Use this file together with:

- `normalization_lab_master_project_reference.md`
- `phase_1_project_foundation_prompt.md`
- `phase_2_schema_input_builder_validation_prompt.md`
- `phase_3_fd_engine_attribute_closure_prompt.md`
- `phase_4_candidate_key_engine_prompt.md`
- `phase_5_1nf_2nf_normalization_engine_prompt.md`

The master reference defines the complete product vision.
Phases 1–5 have established:

- application architecture,
- UI/design system,
- input/validation layer,
- canonical relational input model,
- functional-dependency engine,
- attribute closure,
- superkey/candidate-key engine,
- prime/non-prime attributes,
- 1NF analysis,
- 2NF analysis,
- partial-dependency detection,
- initial decomposition proposals.

Phase 6 now implements the remaining assigned normal forms:

> **Third Normal Form (3NF)**  
> **Fourth Normal Form (4NF)**

This phase must complete the **core mathematical analysis for the entire assigned 1NF–4NF topic**.

**Implement Phase 6 only. Do not automatically start Phase 7.**

---

# 0. OVERALL PHASE SEQUENCE

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
PHASE 5
1NF + 2NF Analysis
        ↓
PHASE 6  ← CURRENT
3NF + 4NF Analysis
        ↓
PHASE 7
Formal Decomposition + Lossless Join + Dependency Preservation
        ↓
PHASE 8
Complete Visualization Engine
        ↓
PHASE 9
Creative Features + Contextual Assistant
        ↓
PHASE 10
Learn / Help / Developed By / Download
        ↓
PHASE 11
Testing / Verification
        ↓
PHASE 12
Deployment + Final Polish
```

---

# 1. PRIMARY OBJECTIVE

Implement a deterministic, academically correct, explainable and reusable analysis engine for:

- 3NF,
- 4NF,
- functional-dependency-based 3NF reasoning,
- transitive-dependency reasoning,
- prime/non-prime attribute usage,
- superkey usage,
- multivalued-dependency reasoning,
- trivial/non-trivial MVD identification,
- 4NF violation detection,
- 3NF decomposition proposals,
- 4NF decomposition proposals,
- detailed reasoning traces,
- stage result objects,
- API endpoints,
- frontend analysis experience,
- comprehensive tests.

At the end of Phase 6, the project should be able to analyze the user's relation through:

```text
1NF
 ↓
2NF
 ↓
3NF
 ↓
4NF
```

using actual implemented logic.

---

# 2. CRITICAL SCOPE BOUNDARY

## Implement now

- 3NF checking.
- 3NF FD-level reasoning.
- 3NF violation identification.
- Transitive-dependency explanations.
- 3NF decomposition planning.
- MVD domain model integration.
- Trivial/non-trivial MVD classification.
- 4NF checking.
- 4NF violation identification.
- Superkey tests for MVD determinants.
- 4NF decomposition planning.
- Unified 1NF–4NF stage result aggregation.
- Reasoning traces.
- Frontend 3NF/4NF result panels.
- API integration.
- Extensive tests.

## Do NOT implement yet

Do not build the full final decomposition/verification subsystem of Phase 7.

Do not yet claim:

- final lossless join proof,
- final dependency-preservation proof,
- formally verified decomposition,
- final complete visualization engine,
- final What-If mode,
- Practice Mode,
- report generation,
- final Learn content,
- final Help content,
- production deployment,
- paid LLM integration.

Phase 6 may produce **decomposition proposals** and structured decomposition metadata.

Phase 7 will be responsible for formally verifying and managing decomposition.

---

# 3. IMPORTANT ACADEMIC PRINCIPLE

The system must never confuse:

```text
3NF condition
```

with:

```text
"there is a transitive dependency" as a vague statement.
```

The engine must apply the formal 3NF condition to functional dependencies.

For a non-trivial FD:

```text
X → A
```

the relation satisfies the 3NF condition for that dependency if at least one is true:

1. `X` is a superkey, OR
2. `A` is a prime attribute.

The analyzer must reason in these terms.

It may also explain a common transitive-dependency pattern to help students understand why a violation exists.

Do not reduce 3NF to a simplistic "no transitive dependency" string rule without applying the formal condition.

---

# 4. IMPORTANT 4NF PRINCIPLE

For every non-trivial multivalued dependency:

```text
X →→ Y
```

the relation satisfies 4NF with respect to that MVD if:

```text
X is a superkey
```

Otherwise:

```text
4NF is violated
```

The system must distinguish:

- trivial MVD,
- non-trivial MVD,
- determinant/scope,
- superkey status.

Do not reduce 4NF to a vague "multiple values exist" test.

4NF is about multivalued dependencies and their determinants.

---

# 5. REUSE PREVIOUS ENGINES

Do not duplicate earlier logic.

Reuse:

## Phase 3

- attribute sets,
- FD representation,
- FD canonicalization,
- attribute closure,
- dependency determination.

## Phase 4

- superkey checking,
- candidate-key discovery,
- candidate-key verification,
- prime attributes,
- non-prime attributes.

## Phase 5

- 1NF result,
- 2NF result,
- partial-dependency analysis,
- existing reasoning framework,
- input-version/stale-result mechanisms.

The new Phase 6 services should compose these.

---

# 6. 3NF INPUTS

3NF analysis uses:

- relation attributes,
- functional dependencies,
- verified candidate keys,
- prime attributes,
- non-prime attributes,
- attribute closure where necessary.

MVDs are not required for the 3NF test.

Sample data is not required for ordinary FD-based 3NF analysis.

---

# 7. 3NF CONDITION — IMPLEMENTATION

For each relevant functional dependency:

```text
X → A
```

consider whether it is:

- trivial,
- non-trivial.

For non-trivial dependencies, determine:

```text
Is X a superkey?
OR
Is A a prime attribute?
```

If neither condition holds:

```text
3NF violation
```

Record:

- determinant `X`,
- dependent attribute(s),
- whether `X` is a superkey,
- whether each RHS attribute is prime/non-prime,
- reason,
- affected relation,
- reasoning steps.

---

# 8. MULTI-ATTRIBUTE RHS

If the user provides:

```text
X → B,C,D
```

the engine must analyze RHS attributes appropriately.

For example:

- `B` prime,
- `C` non-prime,
- `D` non-prime.

If `X` is not a superkey, the dependency can violate 3NF due to `C` and `D`, while `B` satisfies the prime-attribute alternative.

Do not classify the entire dependency as an undifferentiated pass/fail without preserving the attribute-level reasoning.

---

# 9. TRIVIAL FD HANDLING

A trivial FD:

```text
X → Y
```

where:

```text
Y ⊆ X
```

does not create a 3NF violation.

The system should identify it and state:

> This functional dependency is trivial because all attributes on the right-hand side are already contained in the determinant.

Do not apply the non-trivial 3NF violation logic to it.

---

# 10. SUPERKEY CHECKING

Reuse:

```text
isSuperkey(X)
```

from Phase 4.

If:

```text
X+
```

contains all relation attributes:

```text
X is a superkey.
```

If not:

```text
X is not a superkey.
```

The reasoning should be available.

---

# 11. PRIME-ATTRIBUTE CHECKING

Reuse Phase 4.

For each RHS attribute `A`:

```text
A ∈ primeAttributes
```

or:

```text
A ∈ nonPrimeAttributes
```

This must come from verified candidate keys.

Do not classify prime status from user-entered but invalid keys.

---

# 12. 3NF EXAMPLE — VIOLATION

Example:

```text
R(EmpID, EmpName, DeptID, DeptName)

FDs:
EmpID → EmpName, DeptID
DeptID → DeptName

Candidate Key:
EmpID
```

Prime:

```text
EmpID
```

Non-prime:

```text
EmpName
DeptID
DeptName
```

Analyze:

```text
DeptID → DeptName
```

`DeptID` is not a superkey.

`DeptName` is non-prime.

Therefore:

```text
3NF violated.
```

The system may explain the transitive pattern:

```text
EmpID → DeptID
DeptID → DeptName
therefore EmpID → DeptName
```

But the actual formal violation decision must be grounded in the 3NF condition.

---

# 13. 3NF EXAMPLE — PRIME ATTRIBUTE EXCEPTION

A determinant being a non-superkey does not automatically mean a 3NF violation if the dependent attribute is prime.

The engine must correctly implement the formal alternative:

```text
X is not a superkey
BUT
A is prime
```

Then that dependency does not violate 3NF.

This is an important edge case.

---

# 14. 3NF EXAMPLE — SUPERKEY DETERMINANT

If:

```text
X → A
```

and `X` is a superkey:

```text
3NF condition satisfied.
```

Even if `A` is non-prime.

The engine must recognize this correctly.

---

# 15. TRANSITIVE DEPENDENCY EXPLANATION

When applicable, provide a student-friendly explanation:

```text
EmpID → DeptID
DeptID → DeptName

EmpID is the candidate key.
DeptID is not a superkey.
DeptName is non-prime.

DeptName is therefore transitively dependent
on the candidate key through DeptID.

This corresponds to a 3NF violation.
```

Be precise.

Do not claim every transitive chain violates 3NF.

---

# 16. IMPLIED FD HANDLING

The analyzer should use Phase 3 closure/determination capabilities where required.

Example:

```text
A → B
B → C
```

implies:

```text
A → C
```

The engine should be able to reason about relevant implied dependencies where required for explanation.

Do not enumerate the entire `F+` unnecessarily.

Use targeted closure queries.

---

# 17. 3NF RESULT MODEL

Create:

```text
NF3Result
    status
    candidateKeys[]
    primeAttributes[]
    nonPrimeAttributes[]
    dependenciesAnalyzed[]
    trivialDependencies[]
    satisfiedDependencies[]
    violations[]
    transitivePatterns[]
    reasoningSteps[]
    decompositionProposals[]
    limitations[]
```

Each violation should contain structured facts.

Example:

```text
3NFViolation
    dependency
    determinant
    dependentAttributes
    determinantIsSuperkey
    dependentAttributePrimeStatus
    reasonCode
    explanation
```

---

# 18. 3NF REASONING TRACE

For each relevant dependency:

```text
Dependency:
DeptID → DeptName

Step 1:
Dependency is non-trivial.

Step 2:
Check whether DeptID is a superkey.

Result:
No.

Step 3:
Check DeptName.

Result:
DeptName is non-prime.

Step 4:
Neither 3NF condition is satisfied.

Conclusion:
3NF violation.
```

The exact wording should reflect the actual result.

---

# 19. 3NF DECOMPOSITION PROPOSAL

For a detected 3NF violation, create a structured proposal.

Example:

```text
Violation:
DeptID → DeptName

Proposal:

DEPARTMENT(DeptID, DeptName)

Remaining relation:
EMPLOYEE(EmpID, EmpName, DeptID)
```

The proposal should retain:

- source relation,
- dependency,
- determinant,
- dependent attributes,
- proposed relations,
- explanation.

Do not claim losslessness/dependency preservation yet.

---

# 20. 3NF PROPOSAL CAUTION

Do not build a simplistic one-size-fits-all decomposition algorithm and call it the final 3NF decomposition engine.

Phase 6 creates the analytical proposal.

Phase 7 will implement the formal decomposition/verification subsystem.

The proposal must be structured so Phase 7 can use it.

---

# 21. MVD DOMAIN INTEGRATION

Phase 2 already permits MVD input.

Phase 6 must now actually process it.

Represent:

```text
MultivaluedDependency
    lhs[]
    rhs[]
```

Use proper set semantics.

Do not treat:

```text
A →→ B
```

as a functional dependency.

---

# 22. 4NF — TRIVIAL MVD

An MVD:

```text
X →→ Y
```

is trivial when either:

```text
Y ⊆ X
```

or:

```text
X ∪ Y = R
```

where `R` is the full relation's attribute set.

The implementation must correctly identify trivial MVDs.

Trivial MVDs do not cause a 4NF violation.

The explanation should say why.

---

# 23. 4NF — NON-TRIVIAL MVD

For each non-trivial:

```text
X →→ Y
```

check:

```text
Is X a superkey?
```

If:

```text
No
```

then:

```text
4NF violation.
```

If:

```text
Yes
```

then that MVD does not violate 4NF.

---

# 24. 4NF EXAMPLE

Example:

```text
STUDENT(Student, Hobby, Language)

MVDs:
Student →→ Hobby
Student →→ Language
```

Candidate key may involve all attributes depending on the full schema/dependency context.

The engine must not blindly assume `Student` is a non-superkey without checking the actual relation/key context.

If:

```text
Student
```

is not a superkey and the MVD is non-trivial:

```text
4NF violated.
```

---

# 25. INDEPENDENT MULTIVALUED FACTS

The application should explain why 4NF exists:

```text
Student
  ├── independent Hobby values
  └── independent Language values
```

Combining these independent multivalued facts in one relation can produce redundant combinations.

The 4NF analysis should connect the MVD to the conceptual redundancy.

Do not claim 4NF is about ordinary multiple values inside one cell; that is a separate 1NF issue.

---

# 26. MVD RELATION-CONTEXT CHECK

Triviality depends on the full relation schema.

Example:

```text
X →→ Y
```

may be trivial if:

```text
X ∪ Y = R
```

Therefore, the engine must know the complete relation attribute set.

Do not classify MVDs using only LHS/RHS strings.

---

# 27. 4NF RESULT MODEL

Create:

```text
NF4Result
    status
    mvdAnalyzed[]
    trivialMVDs[]
    nonTrivialMVDs[]
    violations[]
    determinantSuperkeyChecks[]
    reasoningSteps[]
    decompositionProposals[]
    limitations[]
```

Each violation should contain:

```text
mvd
determinant
dependentAttributes
isTrivial
determinantIsSuperkey
reasonCode
explanation
```

---

# 28. 4NF REASONING TRACE

Example:

```text
MVD:
Student →→ Hobby

Step 1:
Determine whether the MVD is trivial.

Result:
Non-trivial.

Step 2:
Check whether Student is a superkey.

Result:
No.

Step 3:
The determinant of a non-trivial MVD must be a superkey
for 4NF.

Conclusion:
4NF is violated.
```

Again, use actual computed data.

---

# 29. 4NF DECOMPOSITION PROPOSAL

For:

```text
R(Student, Hobby, Language)

Student →→ Hobby
```

proposal:

```text
STUDENT_HOBBY(Student, Hobby)

STUDENT_LANGUAGE(Student, Language)
```

Preserve:

- source relation,
- MVD,
- determinant,
- RHS,
- proposed relations,
- explanation.

Do not claim formal lossless verification yet.

---

# 30. MULTIPLE MVDs

Support:

```text
Student →→ Hobby
Student →→ Language
```

and analyze each relevant non-trivial MVD.

Do not stop after the first.

The result should identify all violations.

---

# 31. MULTIPLE RELATIONS AFTER DECOMPOSITION

The final product will eventually analyze decomposed schemas too.

Phase 6 should create result structures that can represent:

```text
RelationAnalysis
    relationName
    attributes
    FDs
    MVDs
    candidateKeys
    nf1
    nf2
    nf3
    nf4
```

This allows later Phase 7/8 functionality to analyze each resulting relation.

Do not fully implement recursive decomposition analysis yet unless needed.

---

# 32. UNIFIED 1NF–4NF ANALYSIS

Now that 3NF and 4NF exist, provide a unified analysis structure.

Conceptually:

```text
NormalizationAnalysis
    input
    keyAnalysis
    nf1
    nf2
    nf3
    nf4
    highestConfirmedNormalForm
    reasoningSummary
```

The `highestConfirmedNormalForm` must be calculated carefully based on prerequisite/available evidence.

Do not call a relation 4NF if an earlier mandatory prerequisite is not satisfied/confirmed.

---

# 33. HIGHEST NORMAL FORM LOGIC

The normal forms are hierarchical:

```text
4NF implies 3NF
3NF implies 2NF
2NF implies 1NF
```

Therefore:

- If 1NF is not satisfied, do not claim 2NF/3NF/4NF as fully satisfied.
- If 2NF is violated, the relation is not in 3NF/4NF in the normal-form hierarchy.
- If 3NF is violated, it is not in 4NF in the hierarchy.
- If 4NF is satisfied and prerequisites are established, it is in 4NF and therefore also in lower normal forms.

However, the UI may still show independent analytical details for educational purposes, provided the official stage status respects prerequisites.

---

# 34. STATUS TYPES

Continue the existing status system:

```text
SATISFIED
VIOLATED
BLOCKED_BY_PREREQUISITE
INSUFFICIENT_DATA
```

For 3NF/4NF:

- 3NF may be blocked if 2NF prerequisite is not established.
- 4NF may be blocked if 3NF/earlier prerequisites are not established.
- For mathematical educational previews, clearly label any independent analysis separately.

Do not collapse all statuses into true/false.

---

# 35. 3NF/4NF INDEPENDENT ANALYSIS VS OFFICIAL STATUS

For educational transparency, it is acceptable to show:

```text
Formal Stage Status:
3NF blocked because 2NF is not satisfied.

Dependency Inspection:
A violating 3NF-style FD was also detected.
```

Only do this if it improves understanding and is clearly labeled.

Never make the user believe a blocked normal form is officially satisfied.

---

# 36. DECOMPOSITION CHAIN PREPARATION

The application should now be capable of representing:

```text
Original
   ↓
1NF transformation/proposal
   ↓
2NF proposal
   ↓
3NF proposal
   ↓
4NF proposal
```

Phase 6 only needs to add the 3NF/4NF proposal information.

Phase 8 will later animate it.

---

# 37. "WHY NOT 3NF?" FEATURE

Make the explanation available.

Example:

```text
WHY NOT 3NF?

Dependency:
DeptID → DeptName

Candidate key:
EmpID

Is DeptID a superkey?
No.

Is DeptName prime?
No.

Therefore neither condition for 3NF is satisfied.

Result:
3NF violation.
```

No LLM.

---

# 38. "WHY NOT 4NF?" FEATURE

Example:

```text
WHY NOT 4NF?

MVD:
Student →→ Hobby

Is it trivial?
No.

Is Student a superkey?
No.

A non-trivial MVD with a non-superkey determinant
violates 4NF.

Result:
4NF violation.
```

Again, dynamically generated from actual analysis facts.

---

# 39. 3NF / 4NF DEPENDENCY INTERACTION

If the user selects a dependency in the later visualization:

```text
DeptID → DeptName
```

the application should know:

```text
Type:
FD

Relevant:
3NF

Status:
Violation
```

For:

```text
Student →→ Hobby
```

it should know:

```text
Type:
MVD

Relevant:
4NF

Status:
Violation
```

This metadata should be included in Phase 6 results for future visualization.

---

# 40. MACHINE-READABLE REASON CODES

Create stable reason codes.

Possible examples:

### 3NF

```text
TRIVIAL_FD
SUPERKEY_DETERMINANT
PRIME_DEPENDENT_ATTRIBUTE
NON_SUPERKEY_NON_PRIME_DEPENDENT
TRANSITIVE_PATTERN
```

### 4NF

```text
TRIVIAL_MVD
NONTRIVIAL_MVD_SUPERKEY
NONTRIVIAL_MVD_NON_SUPERKEY
```

Exact naming can follow project conventions.

---

# 41. FRONTEND 3NF PANEL

Display something like:

```text
3NF
────────────────────────────────

✗ Not in 3NF

Violating dependency:
DeptID → DeptName

Determinant:
DeptID

Superkey:
No

Dependent attribute:
DeptName

Prime:
No

[Why?]
[Show Logic]
[View Proposal]
```

Do not overload the screen.

Use progressive disclosure.

---

# 42. FRONTEND 4NF PANEL

Display:

```text
4NF
────────────────────────────────

✗ Not in 4NF

Violating MVD:
Student →→ Hobby

Trivial:
No

Determinant is superkey:
No

[Why?]
[Show Logic]
[View Proposal]
```

---

# 43. DEPENDENCY TYPE VISUAL DIFFERENTIATION

Prepare the UI data so:

FD:

```text
A → B
```

MVD:

```text
A →→ B
```

can later use different graph styles.

Phase 6 should provide the metadata.

Do not build the full D3/React Flow graph engine yet.

---

# 44. 3NF AND 4NF API

Create a unified or appropriately separated endpoint.

Possible:

```text
POST /api/v1/normalize/analyze/advanced
```

Input:

```text
validated AnalysisInput
```

Output:

```text
nf1
nf2
nf3
nf4
keyAnalysis
summary
```

Since Phases 5 and 6 already exist, prefer extending the analysis service rather than creating duplicate pipelines.

---

# 45. API RESPONSE STRUCTURE

Conceptually:

```text
NormalizationAnalysis
├── inputSnapshot
├── keyAnalysis
├── nf1
├── nf2
├── nf3
├── nf4
├── highestConfirmedNormalForm
└── summary
```

3NF:

```text
nf3:
    status
    dependenciesAnalyzed
    violations
    reasoningSteps
    decompositionProposals
```

4NF:

```text
nf4:
    status
    mvdAnalyzed
    violations
    reasoningSteps
    decompositionProposals
```

---

# 46. NO REPORT GENERATION

Phase 6 should make results serializable for later reports but must not implement PDF/DOCX/TXT yet.

The report generator will consume these structured results later.

---

# 47. NO FINAL DECOMPOSITION VERIFICATION

Phase 6 only creates **proposals**.

Phase 7 will determine:

- formal decomposition,
- lossless join,
- dependency preservation,
- possibly correctness of resulting schema.

Do not claim these in Phase 6 unless independently implemented and verified.

---

# 48. INPUT VERSIONING

Preserve stale-result protection.

If user changes:

- attributes,
- FDs,
- MVDs,
- keys,

previous 3NF/4NF results must become stale.

Display:

> Input changed — re-run normalization analysis.

Never show old 3NF/4NF results for a new dependency set.

---

# 49. WHAT-IF COMPATIBILITY

Do not implement full What-If Mode.

But the 3NF/4NF analyzer must be callable repeatedly.

Avoid global mutable state.

Example conceptual service:

```text
analyzeNormalization(input)
```

should generate fresh results from the provided input.

---

# 50. NO HARDCODED EXAMPLES

The same engine must process:

- built-in examples,
- arbitrary user input.

Do not create example-specific conditional branches.

Example:

```text
if relationName == "EMPLOYEE":
    show3NFViolation()
```

is prohibited.

---

# 51. MVD INPUT FROM PHASE 2

Use the Phase 2 canonical MVD format.

Do not create a second incompatible MVD representation.

If Phase 2 has:

```text
lhs[]
rhs[]
```

continue using it.

---

# 52. MVD SET SEMANTICS

MVD sides must use set semantics.

For example:

```text
A,B →→ C
```

means:

```text
lhs = {A,B}
rhs = {C}
```

Attribute order is irrelevant mathematically.

---

# 53. 4NF TRIVIALITY IMPLEMENTATION

For relation attribute set `R`:

```text
X →→ Y
```

is trivial if:

```text
Y ⊆ X
```

OR:

```text
X ∪ Y = R
```

Implement both conditions.

Test both independently.

---

# 54. 4NF SUPERKEY TEST

For non-trivial:

```text
X →→ Y
```

reuse:

```text
isSuperkey(X)
```

Do not create an MVD-specific key checker.

A superkey is still determined through the relation and FD context.

---

# 55. 4NF INTERACTION WITH FD-BASED KEYS

Candidate keys are based on the available functional-dependency framework used by the project.

Use Phase 4's verified key information and superkey service.

Do not try to derive candidate keys solely from MVDs in this phase.

---

# 56. 3NF DECOMPOSITION PROPOSAL STRUCTURE

For each violation:

```text
sourceRelation
violatingFD
determinant
dependentAttributes
candidateKeyContext
proposedRelations[]
explanation
verificationStatus
```

Use:

```text
verificationStatus:
NOT_YET_VERIFIED
```

---

# 57. 4NF DECOMPOSITION PROPOSAL STRUCTURE

For each violation:

```text
sourceRelation
violatingMVD
determinant
dependentAttributes
proposedRelations[]
explanation
verificationStatus
```

Again:

```text
NOT_YET_VERIFIED
```

unless a later verification service is invoked.

---

# 58. MULTI-VIOLATION HANDLING

If the relation has:

- multiple 3NF violations,
- multiple 4NF violations,

return all detected violations.

Do not arbitrarily choose one.

Order them deterministically.

---

# 59. DEPENDENCY ANALYSIS SUMMARY

Provide:

```text
Functional Dependencies
────────────────────────
✓ 4 satisfy 3NF condition
✗ 1 violates 3NF

Multivalued Dependencies
────────────────────────
✓ 1 trivial
✗ 1 violates 4NF
```

This summary is useful for the UI.

Do not make it the only output; preserve detailed reasoning.

---

# 60. LEARNING EXPLANATIONS

For 3NF:

> A relation satisfies 3NF for a non-trivial functional dependency if the determinant is a superkey or the dependent attribute is prime.

For 4NF:

> A relation satisfies 4NF for a non-trivial multivalued dependency if the determinant is a superkey.

These are concise definitions for the analysis interface.

The complete educational treatment belongs in Learn later.

---

# 61. COMPLEXITY / PERFORMANCE

3NF analysis generally requires:

- iterating over dependencies,
- superkey checks/closures,
- prime-status checks.

4NF analysis requires:

- evaluating MVDs,
- set relationships,
- superkey checks.

Reuse cached key/superkey information for the current input when appropriate.

For normal classroom-sized relations, analysis should remain responsive.

---

# 62. CACHING

Within a single analysis:

- cache repeated closure/superkey results,
- invalidate when input changes.

Do not introduce stale global caches.

A safe cache key may include:

```text
input fingerprint
attribute set
```

where necessary.

---

# 63. TESTING — 3NF

Required cases:

## Test 1 — Clear violation

```text
EmpID → DeptID
DeptID → DeptName

Candidate Key:
EmpID

DeptID → DeptName:
DeptID not superkey
DeptName non-prime

Expected:
3NF violated
```

## Test 2 — Superkey determinant

An FD whose determinant is a superkey should satisfy 3NF.

## Test 3 — Prime dependent attribute

Non-superkey determinant with prime RHS should satisfy the 3NF condition.

## Test 4 — Trivial FD

Must not cause a violation.

## Test 5 — Multiple FDs

Detect all violations.

## Test 6 — Composite determinant

Correctly test a multi-attribute determinant.

## Test 7 — Multi-attribute RHS

Correctly identify which RHS attributes are prime/non-prime.

## Test 8 — Implied dependency

Use closure-based implication where relevant.

---

# 64. TESTING — 4NF

Required cases:

## Test 1 — Non-trivial MVD, non-superkey determinant

Expected:

```text
4NF violated
```

## Test 2 — Non-trivial MVD, superkey determinant

Expected:

```text
No 4NF violation for this MVD
```

## Test 3 — Trivial MVD because RHS ⊆ LHS

No violation.

## Test 4 — Trivial MVD because X ∪ Y = R

No violation.

## Test 5 — Multiple MVDs

Detect all violations.

## Test 6 — Composite determinant

Correct handling.

## Test 7 — Multiple attributes on RHS

Correct set handling.

---

# 65. TESTING — HIERARCHY

Verify:

- 3NF does not appear officially satisfied if 2NF prerequisite is violated.
- 4NF does not appear officially satisfied when required lower prerequisites are not established.
- If 4NF is satisfied, the hierarchy is respected.

---

# 66. TESTING — MVD SYNTAX

Test:

```text
A →→ B
A,B →→ C,D
```

and malformed forms.

Ensure Phase 2 validation still catches structural errors.

---

# 67. REGRESSION TESTING

After Phase 6:

Verify Phase 1:

- routing,
- navigation,
- theme,
- design system.

Verify Phase 2:

- input builder,
- raw/structured input,
- validation,
- examples,
- sample data.

Verify Phase 3:

- FD engine,
- closure,
- determination.

Verify Phase 4:

- key discovery,
- superkeys,
- prime/non-prime.

Verify Phase 5:

- 1NF,
- 2NF,
- partial dependencies,
- decomposition proposals.

Do not break previous phases.

---

# 68. API TESTS

Test:

- full normalization request,
- 3NF violation,
- 3NF pass,
- 3NF prime-attribute exception,
- 4NF violation,
- 4NF pass,
- trivial MVD,
- multiple MVDs,
- prerequisite blocking,
- stale inputs.

---

# 69. FRONTEND TESTS

Test:

- 3NF panel,
- 4NF panel,
- status badges,
- dependency lists,
- MVD lists,
- Why panel,
- reasoning steps,
- decomposition proposals,
- stale result handling,
- current input integration,
- theme,
- error state.

---

# 70. BROWSER DEMONSTRATION — 3NF

Use:

```text
EMPLOYEE(
    EmpID,
    EmpName,
    DeptID,
    DeptName
)

Candidate Key:
EmpID

FDs:
EmpID → EmpName, DeptID
DeptID → DeptName
```

Run full analysis.

Show:

```text
1NF
2NF
3NF ✗
```

Explain:

```text
DeptID → DeptName

DeptID is not a superkey.
DeptName is non-prime.

Therefore:
3NF violated.
```

Show transitive pattern as an educational aid.

---

# 71. BROWSER DEMONSTRATION — 4NF

Use:

```text
STUDENT(
    Student,
    Hobby,
    Language
)

MVDs:
Student →→ Hobby
Student →→ Language
```

Show:

```text
4NF ✗
```

Then:

```text
MVD:
Student →→ Hobby

Non-trivial:
Yes

Student is superkey:
No

Therefore:
4NF violated.
```

Show decomposition proposal:

```text
STUDENT_HOBBY(Student,Hobby)

STUDENT_LANGUAGE(Student,Language)
```

Do not claim formal losslessness until Phase 7.

---

# 72. FRONTEND HIGHEST-NORMAL-FORM SUMMARY

The result header should now be capable of showing:

```text
NORMALIZATION STATUS

1NF    ✓
2NF    ✓
3NF    ✗
4NF    —
```

The exact 4NF state depends on prerequisite handling.

Once Phase 6 is complete, this summary should be driven by the actual engine.

Do not hardcode it.

---

# 73. STATUS EXPLANATION

For example:

```text
Highest confirmed normal form:
2NF
```

and:

> 3NF is the first stage at which a violation was detected.

This is more informative than a simple checkmark list.

---

# 74. NO FINAL VISUALIZATION ENGINE

The current UI may display structured result cards and basic reasoning traces.

Do not build the entire polished graph system yet.

Phase 8 will transform the result data into:

- animated normalization journey,
- dependency graph,
- decomposition tree,
- interactive highlighting.

Phase 6 should focus on correctness and structured result data.

---

# 75. NO WHAT-IF MODE

The analyzer must support repeated calls, but the full experiment UX belongs to Phase 9.

---

# 76. NO PRACTICE MODE

Practice Mode remains optional and is not part of Phase 6.

---

# 77. NO LLM

No paid LLM/API integration.

No external AI dependency.

3NF/4NF reasoning must come from deterministic logic.

The future contextual assistant will consume these structured results.

---

# 78. EXPLANATION DATA FOR FUTURE ASSISTANT

Expose structured facts such as:

```text
nf3.status
nf3.violations[]
nf3.dependenciesAnalyzed[]
nf3.reasoningSteps[]

nf4.status
nf4.violations[]
nf4.mvdAnalyzed[]
nf4.reasoningSteps[]
```

This will later allow the assistant to answer:

> Why not 3NF?

and:

> Why not 4NF?

without an LLM.

---

# 79. EXPLANATION GENERATION RULE

Do not hardcode only the demonstration examples.

Generate explanations from structured facts.

For example:

```text
determinant = DeptID
dependent = DeptName
isSuperkey = false
isPrime = false
```

then construct the appropriate 3NF explanation.

This must work for arbitrary valid input.

---

# 80. RESULT DETERMINISM

Same input must produce:

- same 3NF status,
- same 4NF status,
- same violation list,
- same decomposition proposal ordering,
- stable reasoning order.

Use deterministic sorting.

---

# 81. DOCUMENTATION

Create/update:

```text
docs/normal-form-engine-advanced.md
```

Include:

## 3NF

- formal definition,
- non-trivial FD handling,
- superkey condition,
- prime-attribute condition,
- transitive-dependency explanation,
- algorithm,
- examples,
- decomposition proposal limitations.

## 4NF

- formal definition,
- MVD,
- trivial/non-trivial MVD,
- superkey condition,
- algorithm,
- examples,
- decomposition proposal limitations.

## Unified analysis

- hierarchy,
- status model,
- prerequisite handling.

Update:

```text
README.md
docs/development.md
```

---

# 82. COMPLEXITY DOCUMENTATION

Document complexity based on the actual implementation.

3NF:

- number of FDs,
- number of superkey/closure checks,
- candidate-key information reuse.

4NF:

- number of MVDs,
- set-operation cost,
- superkey checks.

Do not invent a simplistic complexity number that ignores repeated closure calculations.

Mention caching if actually implemented.

---

# 83. SECURITY

Continue existing rules:

- validate backend input,
- no arbitrary SQL,
- no LLM API,
- no secrets,
- safe rendering of user-provided labels,
- no unsafe HTML injection.

---

# 84. STALE RESULT PROTECTION

Mandatory.

If user changes:

```text
FD
MVD
attribute
candidate key
```

then previous 3NF/4NF results become stale.

The UI should say:

> Input changed — re-run analysis.

Do not allow an old result to remain visually indistinguishable from a fresh one.

---

# 85. CURRENT INPUT SNAPSHOT

Every analysis should correspond to a snapshot/fingerprint of:

- relation,
- attributes,
- candidate keys,
- FDs,
- MVDs,
- sample data if relevant.

Do not mutate the source input with output fields.

---

# 86. ANALYSIS SERVICE DESIGN

Create an advanced service such as:

```text
analyzeAdvancedNormalization(input)
```

It should orchestrate:

```text
Phase 4 key analysis
Phase 5 NF1/NF2
Phase 6 NF3/NF4
```

It should not reimplement all underlying algorithms.

Conceptually:

```text
Input
 ↓
Key Analysis
 ↓
NF1/NF2
 ↓
NF3
 ↓
NF4
 ↓
Unified Result
```

---

# 87. ORCHESTRATION RULE

The orchestration layer should:

- obtain prerequisite data,
- call the correct service,
- combine results,
- determine highest confirmed normal form,
- preserve reasoning.

It should not contain large amounts of mathematical logic itself.

---

# 88. 3NF/4NF ERROR STATES

Examples:

### Missing candidate keys

> Candidate-key analysis could not establish a valid key set. 3NF analysis cannot reliably classify prime attributes until key analysis is available.

### Missing MVDs

> No multivalued dependencies were provided. 4NF MVD analysis has no user-defined MVDs to inspect.

This is not necessarily an error; it is a valid "nothing to analyze" state.

---

# 89. 4NF WITH NO MVD INPUT

If no MVDs are supplied, do not automatically infer an arbitrary MVD violation.

Display:

```text
4NF:
No MVDs provided for explicit analysis.
```

Do not claim:

```text
4NF ✓
```

unless the application has a documented complete method for establishing that from the available dependency information.

Prefer a cautious state such as:

```text
INSUFFICIENT_DATA
```

or:

```text
NO_EXPLICIT_MVD_TO_CHECK
```

depending on project design.

The UI must explain the distinction.

---

# 90. 3NF WITH COMPLETE FD SET

If all relevant FDs are supplied and key information is available, 3NF analysis should be deterministic and complete relative to the supplied dependency set.

Do not falsely imply that the application has knowledge of dependencies the user did not provide.

---

# 91. 4NF WITH COMPLETE MVD SET

Where MVDs are supplied, analyze each provided MVD.

Do not infer arbitrary unstated MVDs unless a formally implemented MVD inference engine exists.

Phase 6 does not need a complete general-purpose MVD-closure system.

---

# 92. IMPORTANT: MVD INFERENCE SCOPE

Do not attempt to implement full `D+` for multivalued dependencies unless explicitly required later.

Phase 6 should analyze supplied MVDs for 4NF.

This keeps the scope manageable and mathematically honest.

---

# 93. 3NF / 4NF EDUCATIONAL DIFFERENCE

The UI should help students understand:

```text
3NF:
primarily about functional dependencies.

4NF:
extends normalization to multivalued dependencies.
```

But do not imply that 4NF is simply "3NF plus multiple values in cells."

That would be academically incorrect.

---

# 94. PHASE 6 ACCEPTANCE CRITERIA

Phase 6 is complete only when:

## 3NF

- [ ] Formal 3NF condition implemented.
- [ ] Trivial FDs handled.
- [ ] Superkey condition implemented.
- [ ] Prime-attribute condition implemented.
- [ ] Multi-attribute determinants handled.
- [ ] Multi-attribute RHS handled.
- [ ] Multiple candidate keys handled.
- [ ] Implied dependency analysis supported where needed through closure.
- [ ] Violations identified.
- [ ] Transitive patterns explained where applicable.
- [ ] Reasoning trace generated.
- [ ] Decomposition proposals generated.

## 4NF

- [ ] MVDs processed.
- [ ] Trivial MVD rule implemented.
- [ ] Non-trivial MVD detection implemented.
- [ ] Superkey condition implemented.
- [ ] Composite determinants handled.
- [ ] Multiple MVDs handled.
- [ ] Violations identified.
- [ ] Reasoning trace generated.
- [ ] Decomposition proposals generated.

## Unified

- [ ] 1NF → 2NF → 3NF → 4NF structure works.
- [ ] Highest confirmed normal form can be determined.
- [ ] Prerequisite hierarchy respected.
- [ ] Result snapshots protected from stale input.

## Frontend

- [ ] 3NF panel works.
- [ ] 4NF panel works.
- [ ] Why/Show Logic works.
- [ ] Violation lists work.
- [ ] Dependency/MVD details work.
- [ ] Decomposition proposals visible.
- [ ] Input changes invalidate old results.
- [ ] No fake analysis.

## API

- [ ] advanced normalization endpoint works.
- [ ] typed result models exist.
- [ ] errors are structured.
- [ ] results are serializable.

## Testing

- [ ] 3NF tests pass.
- [ ] 4NF tests pass.
- [ ] MVD tests pass.
- [ ] prerequisite tests pass.
- [ ] regression tests pass.
- [ ] frontend tests pass.
- [ ] API tests pass.
- [ ] browser QA complete.

## Documentation

- [ ] 3NF documented.
- [ ] 4NF documented.
- [ ] algorithms documented.
- [ ] complexity documented.
- [ ] limitations documented.
- [ ] Phase 7 handoff documented.

---

# 95. REQUIRED 3NF TEST DATA

Maintain test fixtures for:

### 3NF violation

```text
R(EmpID, EmpName, DeptID, DeptName)

K:
EmpID

FDs:
EmpID → EmpName, DeptID
DeptID → DeptName
```

Expected:

```text
3NF violated
```

### 3NF satisfied through superkey

Use an FD where determinant is a superkey.

### 3NF satisfied through prime RHS

Use a valid case where determinant is not a superkey but RHS is prime.

### Trivial FD

```text
A,B → A
```

Expected no 3NF violation.

### Multiple violations

At least two distinct violating dependencies.

---

# 96. REQUIRED 4NF TEST DATA

### 4NF violation

```text
R(Student,Hobby,Language)

MVDs:
Student →→ Hobby
Student →→ Language
```

Use a dependency/key context in which Student is not a superkey.

Expected:

```text
4NF violated
```

### Trivial MVD

```text
A →→ A
```

Expected no violation.

### Trivial complement MVD

Use:

```text
X ∪ Y = R
```

and verify no violation.

### Superkey determinant

A non-trivial MVD whose determinant is a superkey.

Expected:

```text
No 4NF violation.
```

---

# 97. BROWSER QA — 3NF

1. Load EMPLOYEE example.
2. Run advanced analysis.
3. Open 3NF.
4. Click violation.
5. View Why explanation.
6. View reasoning.
7. View decomposition proposal.
8. Modify `DeptID → DeptName`.
9. Verify stale-result notice.
10. Re-analyze.

---

# 98. BROWSER QA — 4NF

1. Load STUDENT MVD example.
2. Run advanced analysis.
3. Open 4NF.
4. Select MVD.
5. View trivial/non-trivial status.
6. View superkey status.
7. Open Why explanation.
8. View decomposition proposal.
9. Modify the MVD.
10. Confirm stale-result handling.
11. Re-analyze.

---

# 99. REGRESSION BROWSER QA

After Phase 6 verify:

- input builder still works,
- raw mode still works,
- closure still works,
- candidate-key analysis still works,
- 1NF still works,
- 2NF still works,
- theme still works,
- all routes still work.

---

# 100. PHASE 7 HANDOFF

Phase 7 will implement the formal decomposition and verification layer.

It should consume:

```text
nf2.decompositionProposals
nf3.decompositionProposals
nf4.decompositionProposals
```

and provide:

- formal decompositions,
- lossless-join checking,
- dependency preservation,
- resulting relation analysis.

Phase 6 must therefore preserve enough metadata for this.

---

# 101. PHASE 8 HANDOFF

Phase 8 needs rich stage data to build:

- interactive normalization journey,
- dependency graph,
- MVD graph,
- decomposition tree,
- before/after views,
- animated reasoning.

Preserve structured:

```text
dependencies
attributes
violations
reasoningSteps
decompositionProposals
```

---

# 102. PHASE 9 HANDOFF

The contextual assistant will later answer:

- Why not 3NF?
- Why not 4NF?
- Why is this dependency violating?
- Why was this decomposition proposed?

Therefore, structured explanation facts must remain available.

---

# 103. NO AI API

The entire Phase 6 engine must work without:

- OpenAI,
- Gemini API,
- Claude,
- Ollama.

The deterministic DBMS engine is the source of truth.

---

# 104. DOCUMENTATION OF LIMITATIONS

Be explicit about:

- MVD inference scope,
- schema-only 1NF limitations inherited from Phase 5,
- candidate-key dependency,
- decomposition verification being deferred to Phase 7,
- any performance limits in complex candidate-key contexts.

Never conceal a limitation.

---

# 105. CODE QUALITY RULES

Continue all previous quality requirements:

- typed models,
- reusable services,
- no giant route handlers,
- no mathematical logic in React components,
- no duplicate closure/key implementations,
- no hardcoded examples,
- no fake results,
- deterministic outputs,
- tests alongside implementation.

---

# 106. NO UNNECESSARY REFACTOR

Integrate Phase 6 with the existing architecture.

Do not rewrite Phase 2–5 unless a genuine bug or architectural conflict requires it.

If a change is required:

- understand the dependency,
- make the smallest safe change,
- rerun regression tests.

---

# 107. FINAL DEVELOPMENT WORKFLOW

Before coding:

1. Read every previous reference.
2. Inspect the repository.
3. Run all existing tests.
4. Inspect the Phase 5 result structures.
5. Inspect Phase 4 superkey/prime services.
6. Inspect Phase 3 closure service.
7. Plan Phase 6.

During coding:

- implement 3NF first,
- test 3NF,
- implement 4NF,
- test 4NF,
- integrate unified analysis,
- integrate UI,
- test again.

After coding:

1. run unit tests,
2. run integration tests,
3. run frontend tests,
4. run build,
5. start backend,
6. start frontend,
7. execute browser QA,
8. test stale-result handling,
9. inspect console,
10. fix issues,
11. rerun tests.

---

# 108. FINAL PHASE 6 REPORT

When Phase 6 is complete, report:

1. Files created/modified.
2. 3NF engine.
3. 4NF engine.
4. MVD handling.
5. Superkey integration.
6. Prime/non-prime integration.
7. Reasoning model.
8. Unified normalization analysis.
9. Decomposition proposal model.
10. API endpoints.
11. Frontend changes.
12. Test results.
13. Browser verification.
14. Complexity/limitations.
15. Phase 7 handoff details.
16. Explicit list of deferred features.

Do not claim Phase 7 decomposition verification is complete.

---

# 109. FINAL COMMAND

Execute **PHASE 6 ONLY**.

Read and follow:

- `normalization_lab_master_project_reference.md`
- `phase_1_project_foundation_prompt.md`
- `phase_2_schema_input_builder_validation_prompt.md`
- `phase_3_fd_engine_attribute_closure_prompt.md`
- `phase_4_candidate_key_engine_prompt.md`
- `phase_5_1nf_2nf_normalization_engine_prompt.md`

Implement the complete 3NF and 4NF analysis layer described here.

Preserve all previous phases.

Do not start Phase 7 automatically.

Do not implement the final decomposition/verification engine.

Do not claim lossless join or dependency preservation unless actually implemented and formally verified in this phase; those are primarily Phase 7 responsibilities.

Do not integrate a paid LLM.

Use deterministic DBMS logic.

Test thoroughly.

Verify the actual website in the browser.

Fix all blocking issues.

Stop after Phase 6 is stable and verified.
