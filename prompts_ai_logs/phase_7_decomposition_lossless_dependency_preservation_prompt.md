# PHASE 7 — Formal Decomposition, Lossless-Join Verification, Dependency Preservation & Normalized Schema Generation
## 1NF–4NF Normalization Visualizer & Analyzer / "Normalization Lab"

**This is the detailed execution specification for Phase 7.**

Use this file together with:

- `normalization_lab_master_project_reference.md`
- `phase_1_project_foundation_prompt.md`
- `phase_2_schema_input_builder_validation_prompt.md`
- `phase_3_fd_engine_attribute_closure_prompt.md`
- `phase_4_candidate_key_engine_prompt.md`
- `phase_5_1nf_2nf_normalization_engine_prompt.md`
- `phase_6_3nf_4nf_analysis_engine_prompt.md`

The master reference defines the complete product vision.

Previous phases established:

- project foundation,
- input builder and validation,
- functional dependency engine,
- attribute closure,
- candidate-key/superkey engine,
- prime/non-prime classification,
- 1NF analysis,
- 2NF analysis,
- 3NF analysis,
- 4NF analysis,
- violation reasoning,
- initial decomposition proposals.

Phase 7 now turns those analytical proposals into a **formal decomposition and verification system**.

This is a major technical phase.

The purpose is to ensure the application does not stop at:

> "2NF/3NF/4NF is violated."

It must also be able to explain:

> "Here is how the relation is decomposed, and here is whether the resulting decomposition has the required properties."

The central capabilities are:

1. Formal decomposition generation.
2. Relation/schema transformation tracking.
3. Lossless-join verification.
4. Dependency-preservation analysis.
5. Decomposition reasoning and traceability.
6. Recursive/iterative analysis of resulting relations where appropriate.
7. Structured output for later visualization and reporting.

**Implement Phase 7 only. Do not automatically start Phase 8.**

---

# 0. WHERE PHASE 7 FITS

Overall development sequence:

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
PHASE 6
3NF + 4NF Analysis
        ↓
PHASE 7  ← CURRENT
Formal Decomposition + Lossless Join + Dependency Preservation
        ↓
PHASE 8
Complete Interactive Visualization Engine
        ↓
PHASE 9
Creative Features + Contextual Assistant
        ↓
PHASE 10
Learn / Help / Developed By / Download
        ↓
PHASE 11
Complete Testing / Verification
        ↓
PHASE 12
Deployment + Final Polish
```

---

# 1. PRIMARY OBJECTIVE

Implement a complete decomposition subsystem that can take the results of earlier normalization analyses and generate formally structured decompositions.

The system must support decomposition related to:

- 1NF transformations where applicable,
- 2NF decomposition,
- 3NF decomposition,
- 4NF decomposition.

It must also provide formal verification for:

- lossless join,
- dependency preservation where meaningful/applicable.

The output must retain:

- original schema,
- violating dependency,
- normalization stage,
- decomposition rule,
- resulting schemas,
- key information,
- dependencies,
- verification results,
- reasoning steps.

---

# 2. IMPORTANT DISTINCTION

There are three different things the application must not confuse:

## 1. Detection

Example:

> `DeptID → DeptName` causes a 3NF violation.

## 2. Decomposition proposal

Example:

```text
DEPARTMENT(DeptID, DeptName)
EMPLOYEE(EmpID, EmpName, DeptID)
```

## 3. Formal verification

Example:

```text
Lossless join:
✓

Dependency preservation:
✓
```

Phase 7 is responsible for moving from #2 to #3.

Do not claim a decomposition is lossless merely because it "looks correct."

---

# 3. CRITICAL SCOPE

## Implement now

- generalized relation decomposition representation,
- decomposition operations,
- 2NF decomposition application,
- 3NF decomposition application,
- 4NF decomposition application,
- decomposition hierarchy/lineage,
- lossless-join verification,
- dependency-preservation analysis,
- preservation of original and intermediate schemas,
- decomposition reasoning,
- resulting relation analysis hooks,
- decomposition API,
- verification API,
- frontend decomposition workspace,
- tests.

## Do NOT implement yet

Do not implement:

- final full visualization engine,
- sophisticated animated decomposition system,
- full What-If mode,
- Practice Mode,
- final Download/report system,
- final Learn content,
- final Help content,
- paid LLM integration,
- production deployment.

Those belong to later phases.

Phase 7 must nevertheless expose rich structured data so those future phases can consume it.

---

# 4. REUSE EXISTING ENGINES

Do not duplicate earlier mathematics.

Reuse:

## Phase 3

- attribute sets,
- FD representation,
- closure computation,
- dependency determination.

## Phase 4

- candidate-key analysis,
- superkey checks,
- prime/non-prime classification.

## Phase 5

- 1NF/2NF result,
- partial dependencies,
- 2NF proposals.

## Phase 6

- 3NF/4NF result,
- violating FDs,
- violating MVDs,
- 3NF proposals,
- 4NF proposals.

Phase 7 should be an orchestration/decomposition/verification layer over these services.

---

# 5. DECOMPOSITION DOMAIN MODEL

Create a clean representation for a relation/schema.

Conceptually:

```text
RelationSchema
    id
    name
    attributes[]
    functionalDependencies[]
    multivaluedDependencies[]
    candidateKeys[]
```

A decomposition node:

```text
DecompositionNode
    id
    relation
    parentRelationId
    stage
    reason
    sourceDependency
    generatedRelations[]
    verification
    reasoningSteps[]
```

A generated relation:

```text
DecomposedRelation
    name
    attributes[]
    projectedFDs[]
    projectedMVDs[]
    candidateKeys[]
    source
```

Use appropriate identifiers so the decomposition tree can later be visualized.

---

# 6. DECOMPOSITION PLAN

A decomposition plan should contain:

```text
DecompositionPlan
    originalRelation
    triggerStage
    triggeringDependency
    triggeringType
    proposedRelations[]
    reasoningSteps[]
    verification
    lineage
```

Possible trigger types:

```text
1NF_TRANSFORMATION
2NF_PARTIAL_DEPENDENCY
3NF_VIOLATION
4NF_MVD_VIOLATION
```

---

# 7. ORIGINAL INPUT MUST NEVER BE DESTROYED

The original user input must remain available.

Do not mutate:

```text
Original Relation
```

when generating decompositions.

Instead:

```text
Original
   ↓
Decomposition plan
   ↓
Resulting relations
```

The user should always be able to compare the original and resulting schema.

---

# 8. GENERAL DECOMPOSITION API

Create a reusable service concept such as:

```text
decomposeRelation(relation, dependency, stage)
```

The exact API is up to the implementation.

It should return:

```text
source
dependency
stage
resultRelations
reasoning
verificationPlaceholder
```

The final formal verification can then be run on those relations.

---

# 9. 2NF DECOMPOSITION

Implement a correct decomposition strategy for a detected 2NF partial dependency.

Suppose:

```text
R(StudentID, CourseID, StudentName, CourseName, Grade)

K = (StudentID, CourseID)

StudentID → StudentName
CourseID → CourseName
```

A conceptual decomposition is:

```text
STUDENT(StudentID, StudentName)
COURSE(CourseID, CourseName)
ENROLLMENT(StudentID, CourseID, Grade)
```

The implementation must derive these relations from the actual detected dependencies.

Do not hardcode this example.

---

# 10. 2NF DECOMPOSITION REQUIREMENTS

For each identified partial dependency:

```text
X → Y
```

where:

```text
X ⊂ K
```

and `Y` contains non-prime attributes:

- create a relation containing the determinant and dependent attributes,
- retain the necessary attributes in the remainder relation,
- ensure the original key relationship is not accidentally destroyed,
- support multiple partial dependencies,
- support composite keys,
- support multiple candidate keys.

The exact generalized algorithm must be documented.

---

# 11. 2NF MULTIPLE PARTIAL DEPENDENCIES

If:

```text
StudentID → StudentName
CourseID → CourseName
```

both create 2NF violations, generate appropriate relations for both.

Do not stop at the first dependency.

The decomposition structure should record both triggers.

---

# 12. 2NF DECOMPOSITION WITH MULTIPLE CANDIDATE KEYS

This is a difficult case and must be handled carefully.

Do not assume that one chosen candidate key is sufficient when multiple candidate keys exist.

Use the violation data from Phase 5.

The decomposition plan must preserve the attributes and relationships necessary for the original candidate-key structure.

If the generalized automatic decomposition cannot guarantee a correct complete decomposition for an unusual multi-key case, do not silently guess.

Return a structured limitation/warning and keep the original analysis available.

---

# 13. 3NF DECOMPOSITION

Implement a general 3NF synthesis/decomposition strategy based on the supplied FD set.

The project should use a standard, documented synthesis approach rather than an ad-hoc split.

A standard 3NF synthesis process may conceptually involve:

1. Obtain a minimal/canonical cover or suitable equivalent FD representation.
2. For dependencies of the form:

```text
X → A
```

create relation schemas containing:

```text
X ∪ {A}
```

or grouped equivalent RHS attributes when valid.
3. Remove redundant relation schemas where appropriate.
4. Ensure a relation containing a candidate key exists if needed.
5. Produce the resulting 3NF decomposition.

The exact algorithm must be implemented and documented.

Do not pretend to implement a canonical cover if the actual engine does not.

If a minimal-cover service is needed and does not yet exist, implement only the necessary mathematically correct functionality or create an explicit dependency-minimization utility as part of this phase.

---

# 14. 3NF SYNTHESIS / MINIMAL COVER

Because 3NF synthesis often relies on a minimal/canonical cover, Phase 7 may implement the required FD minimization functionality.

This may include:

- splitting RHS attributes,
- removing extraneous attributes from LHS,
- removing redundant functional dependencies.

Important:

The algorithm must be correct and tested.

Do not alter the user's original FD set.

Maintain:

```text
Original FD Set
```

and:

```text
Derived Minimal Cover
```

separately.

---

# 15. MINIMAL COVER — DATA MODEL

If implemented:

```text
MinimalCoverResult
    originalFDs[]
    decomposedFDs[]
    minimizedFDs[]
    removedAttributes[]
    removedDependencies[]
    reasoningSteps[]
```

This reasoning can later be used in reports and visualization.

---

# 16. MINIMAL COVER — RHS SPLITTING

A dependency:

```text
A → B,C
```

can be represented as:

```text
A → B
A → C
```

for canonical-cover processing.

Preserve the original dependency for user display.

The UI should distinguish:

```text
Original FD
```

from:

```text
Internal normalized FD representation
```

---

# 17. MINIMAL COVER — EXTRANEOUS LHS ATTRIBUTE

For a dependency:

```text
A,B → C
```

test whether an LHS attribute can be removed while preserving implication.

This must use closure/determination logic correctly.

Do not delete an attribute merely because it "looks unnecessary."

---

# 18. MINIMAL COVER — REDUNDANT FD

A dependency is redundant if removing it does not change the closure/implication represented by the FD set.

The algorithm must test this appropriately.

Do not remove dependencies based solely on textual duplication; Phase 3 already handles exact/equivalent duplicates.

---

# 19. 3NF DECOMPOSITION — KEY PRESERVATION

After synthesis, check whether at least one resulting relation contains a candidate key of the original relation.

If not, add a relation containing an original candidate key according to the documented synthesis algorithm.

This is important for the standard 3NF synthesis approach.

The UI should explain:

> A relation containing a candidate key was retained/added to ensure the synthesized decomposition has the necessary key representation.

Do not claim that this alone proves losslessness or dependency preservation.

---

# 20. 3NF DECOMPOSITION — REDUNDANT RELATIONS

If one generated schema is a subset of another, the smaller schema may be redundant for the synthesis output.

Remove it only if the documented decomposition algorithm supports this simplification and the removal does not break required properties.

Document the rule.

---

# 21. 4NF DECOMPOSITION

For a non-trivial MVD:

```text
X →→ Y
```

where `X` is not a superkey, use the standard 4NF decomposition concept:

```text
R1 = X ∪ Y
R2 = R − (Y − X)
```

or the equivalent set-based formulation.

Example:

```text
R(Student,Hobby,Language)

MVD:
Student →→ Hobby
```

produces:

```text
R1(Student,Hobby)
R2(Student,Language)
```

The implementation must use actual set operations rather than a hardcoded pattern.

---

# 22. 4NF RECURSIVE DECOMPOSITION

4NF normalization may require repeated decomposition.

The engine should support a process conceptually like:

```text
R
 ↓
find violating non-trivial MVD
 ↓
decompose
 ↓
inspect resulting relations
 ↓
find additional 4NF violations if any
 ↓
decompose again
 ↓
repeat until normalized
```

Do not assume one MVD split always finishes normalization.

For this phase, implement the decomposition framework necessary for recursive/iterative processing where the supplied MVD information supports it.

---

# 23. DECOMPOSITION TERMINATION

The recursive decomposition process must terminate safely.

Use:

- relation-schema fingerprints,
- visited-schema tracking,
- deterministic dependency processing.

Do not repeatedly decompose the same schema indefinitely.

---

# 24. 4NF MVD SCOPE

The engine should only use MVDs that are actually available through the application's supported input/analysis model.

Do not invent arbitrary unstated MVDs.

Phase 6 defined the 4NF analysis scope. Phase 7 operates on those results.

---

# 25. FORMAL LOSSLESS-JOIN VERIFICATION

This is one of the primary goals of Phase 7.

Implement a reliable verification method for decomposition.

The verification must not be based on:

- visual intuition,
- "common attributes" heuristic,
- simple overlap checks.

Use a recognized relational-database method.

---

# 26. LOSSLESS-JOIN METHOD

For FD-based decomposition, implement the standard **chase/tableau-style lossless-join test** or another mathematically equivalent, correctly documented method.

A common educational approach is the tableau/chase test.

The implementation must:

1. represent original attributes distinctly,
2. represent decomposed relation rows,
3. apply FDs appropriately,
4. propagate equality/symbol information,
5. determine whether a row can become all distinguished/symbolically equal to the corresponding original attributes,
6. return a clear result.

Do not use a simplistic pairwise-intersection test as the general lossless-join algorithm.

---

# 27. LOSSLESS-JOIN VERIFICATION INPUT

Conceptually:

```text
Relation:
R(A,B,C,D)

FDs:
A → B
B → C

Decomposition:
R1(A,B)
R2(A,C,D)
```

The verifier takes:

```text
R
F
{R1,R2}
```

and returns:

```text
lossless: true/false
steps[]
reasoning
```

---

# 28. LOSSLESS-JOIN RESULT MODEL

Create:

```text
LosslessJoinResult
    isLossless
    method
    initialTableau
    chaseSteps[]
    finalTableau
    reasoning
```

Potentially omit internal-tableau detail from the default UI and place it under:

> Show verification details.

This preserves educational depth without overwhelming beginners.

---

# 29. LOSSLESS-JOIN EXPLANATION

The UI should allow:

> Why is this decomposition lossless?

Example:

```text
Lossless Join Verification

Method:
Chase/Tableau

Result:
✓ Lossless

Reason:
The decomposition successfully produces a row
corresponding to the original relation after applying
the functional dependencies.
```

The exact explanation must match the actual verification result.

---

# 30. LOSSY DECOMPOSITION

If the decomposition is lossy:

```text
✗ Lossless join condition not established
```

Explain that joining the decomposed relations may generate spurious tuples.

Do not overstate the result.

---

# 31. LOSSLESS-JOIN EDGE CASES

Test:

- binary decomposition,
- multiple relations,
- overlapping relations,
- decomposition with candidate key relation,
- trivial decomposition,
- decomposition with no common attributes,
- decompositions known to be lossless,
- decompositions known to be lossy.

---

# 32. DEPENDENCY PRESERVATION

Implement formal dependency-preservation analysis.

Given:

```text
R
F
D = {R1, R2, ..., Rn}
```

determine whether the functional dependencies in `F` can be enforced by dependencies projected onto the decomposed relations without requiring a join.

---

# 33. DEPENDENCY-PRESERVATION CONCEPT

The system should compute/provide:

```text
F1 = projection of F onto R1
F2 = projection of F onto R2
...
Fn = projection of F onto Rn
```

Then determine whether:

```text
(F1 ∪ F2 ∪ ... ∪ Fn)+
```

covers the original required functional dependencies.

Use the existing closure/dependency services wherever possible.

Do not compare only strings.

---

# 34. DEPENDENCY PROJECTION

For each decomposed relation `Ri`:

Determine which relevant FDs from the original FD set apply within `Ri`.

Where needed, use closure-based inference to identify projected dependencies.

The exact projection algorithm must be documented.

Because full FD projection can be computationally expensive, support the normal educational input range efficiently.

---

# 35. DEPENDENCY PRESERVATION RESULT MODEL

Create:

```text
DependencyPreservationResult
    isDependencyPreserved
    originalDependencies[]
    projectedDependencies[]
    preservedDependencies[]
    nonPreservedDependencies[]
    reasoningSteps[]
```

For a dependency that is not preserved:

```text
A → C
```

show:

> The dependency cannot be established from the dependencies available within the decomposed relations without joining them.

Only make this claim after actual dependency-closure checking.

---

# 36. DEPENDENCY-PRESERVATION EXPLANATION

Example:

```text
Dependency Preservation

Original FD:
A → C

Projected dependencies:
A → B
B → C

Closure of A under projected dependencies:
{A,B,C}

Therefore:
A → C is preserved.
```

Again, the exact steps must be generated from actual computation.

---

# 37. RELATION PROJECTION

After decomposition, each generated relation may need its own projected FD/MVD set.

Create structured projection data.

Conceptually:

```text
RelationProjection
    relation
    projectedFDs[]
    projectedMVDs[]
    projectionReasoning[]
```

This will be useful later for analyzing each resulting relation.

---

# 38. RESULTING RELATION ANALYSIS

After decomposition, expose a reusable operation:

```text
analyzeDecomposedRelation(relation)
```

It should eventually call the normalization engine with the relation's projected dependencies.

Phase 7 does not need to replace the complete Phase 5/6 engine.

Instead, it should establish the hook for recursive analysis.

---

# 39. DECOMPOSITION NORMALIZATION PIPELINE

The eventual flow should be:

```text
Original R
   ↓
Analyze
   ↓
Violation
   ↓
Decompose
   ↓
Generate R1, R2, ...
   ↓
Project dependencies/MVDs
   ↓
Verify decomposition
   ↓
Analyze resulting relations if required
   ↓
Repeat until desired normal form
```

For Phase 7, support the decomposition/verification part of this pipeline.

---

# 40. FINAL TARGET NORMAL FORM

The user may eventually want to:

> Normalize to 2NF
> Normalize to 3NF
> Normalize to 4NF

Phase 7 should expose a clean service concept:

```text
normalizeTo(targetNormalForm)
```

or equivalent.

Do not build the final UI for this yet if that belongs in Phase 8/9.

---

# 41. TARGET NORMAL FORM SEMANTICS

If target:

```text
2NF
```

the system should not unnecessarily perform 3NF/4NF decomposition.

If target:

```text
3NF
```

the system should resolve lower-level issues first.

If target:

```text
4NF
```

the system should follow the hierarchy and resolve relevant 1NF/2NF/3NF issues before/alongside 4NF where applicable.

Do not violate the normal-form hierarchy.

---

# 42. DECOMPOSITION ORDER

When multiple violations exist, use a deterministic strategy.

Possible:

```text
1NF
↓
2NF
↓
3NF
↓
4NF
```

and within a stage:

- stable dependency order,
- or another documented deterministic ordering.

Do not randomly choose violations.

---

# 43. DECOMPOSITION LINEAGE

Track every transformation.

Example:

```text
R
├── R1
│   ├── R1a
│   └── R1b
└── R2
```

Each node should know:

- parent,
- reason,
- triggering dependency,
- stage.

This will power the future Decomposition Tree visualization.

---

# 44. DECOMPOSITION HISTORY

For a single normalization run, store:

```text
Step 1:
R → R1,R2

Step 2:
R2 → R3,R4
```

The user should later be able to see the full processing path.

Do not overwrite intermediate relations.

---

# 45. BEFORE / AFTER RESULT

Every decomposition should preserve:

```text
Before
Trigger
After
Verification
```

Conceptually:

```text
BEFORE
R(A,B,C,D)

TRIGGER
A → C
3NF violation

AFTER
R1(A,C)
R2(A,B,D)

VERIFICATION
Lossless:
✓
Dependency preservation:
✓
```

The actual verification results must come from the algorithms.

---

# 46. DECOMPOSITION RESULT MODEL

Use a structured result similar to:

```text
DecompositionResult
    sourceRelation
    stage
    trigger
    generatedRelations[]
    projectedDependencies[]
    projectedMVDs[]
    losslessJoin
    dependencyPreservation
    reasoningSteps[]
    lineage
```

---

# 47. VERIFICATION SUMMARY

Provide a compact summary:

```text
Decomposition Verification

Lossless Join     ✓
Dependency Pres.  ✓
```

Possible states:

```text
✓ Verified
✗ Failed
⚠ Not evaluated
— Not applicable
```

Do not hide uncertainty.

---

# 48. VERIFICATION DETAIL PANEL

Provide an expandable section:

```text
Show Verification Details
```

For lossless:

- method,
- major chase steps,
- final state.

For dependency preservation:

- original FDs,
- projected FDs,
- closure checks,
- preserved/non-preserved dependencies.

The default UI should remain understandable.

---

# 49. EDUCATIONAL EXPLANATION OF LOSSLESS JOIN

Use concise text:

> A decomposition is lossless when joining the decomposed relations can reproduce the original relation without introducing spurious tuples.

Then provide:

> Show Verification Logic

for details.

---

# 50. EDUCATIONAL EXPLANATION OF DEPENDENCY PRESERVATION

Use concise text:

> A decomposition is dependency-preserving when the required dependencies can be enforced using the decomposed relations without reconstructing the original relation through a join.

Then show the actual projected dependencies and closure reasoning.

---

# 51. 2NF DECOMPOSITION VERIFICATION

For every 2NF proposal:

1. Generate relations.
2. Project relevant FDs.
3. Run lossless verification.
4. Run dependency-preservation analysis as applicable.
5. Return structured results.

Do not assume all 2NF decompositions are automatically lossless/dependency-preserving merely because they follow a standard pattern.

Verify them.

---

# 52. 3NF DECOMPOSITION VERIFICATION

For the standard 3NF synthesis:

- run lossless verification,
- run dependency-preservation verification,
- report both.

A standard 3NF synthesis is expected to have useful guarantees under its assumptions, but the application should still run its own verification implementation rather than simply printing "yes."

---

# 53. 4NF DECOMPOSITION VERIFICATION

For 4NF MVD decomposition:

- generate the two relations,
- preserve the source relation,
- verify the decomposition appropriately.

Be careful:

Lossless-join semantics for MVD-based 4NF decomposition differ from simply applying an FD-only two-relation heuristic.

The implementation must use the mathematically appropriate reasoning for MVD decomposition.

If the chosen verification implementation supports only a documented subset of formal MVD checking, expose that limitation clearly instead of misrepresenting the result.

---

# 54. MVD DECOMPOSITION FORMALISM

For:

```text
R(X, Y, Z)
X →→ Y
```

the standard 4NF decomposition is:

```text
R1(X,Y)
R2(X,Z)
```

where:

```text
Z = R − X − Y
```

More generally:

```text
R1 = X ∪ Y
R2 = R − (Y − X)
```

Use set notation in implementation.

Do not hardcode exactly three attributes.

---

# 55. MULTI-ATTRIBUTE MVD DECOMPOSITION

Support:

```text
(A,B) →→ (C,D)
```

with remaining attributes properly computed.

Do not assume the LHS or RHS is a single attribute.

---

# 56. DECOMPOSITION INPUT SAFETY

Before decomposing:

- validate relation,
- validate dependency,
- ensure dependency attributes belong to source relation,
- ensure decomposition can be represented.

Return a structured error if not.

Do not generate invalid schemas.

---

# 57. DECOMPOSITION DUPLICATE HANDLING

If generated relations are equivalent:

```text
R1(A,B)
R2(B,A)
```

treat them as the same logical schema.

Deduplicate them.

Keep a stable display order.

---

# 58. RELATION SCHEMA EQUALITY

Relation-schema equality should be based on attribute-set equality, not name strings alone where the names are generated.

For example:

```text
R1(A,B)
```

and:

```text
R2(B,A)
```

are logically identical schemas.

Do not treat them as distinct merely because of names.

---

# 59. RELATION NAMES

Generated relation names should be deterministic and readable.

Examples:

```text
STUDENT
COURSE
ENROLLMENT
DEPARTMENT
```

Avoid:

```text
R_1749823
tmp_98312
table_42
```

unless needed internally.

If an automatic naming collision occurs, resolve it deterministically.

---

# 60. ATTRIBUTE ORDER IN GENERATED RELATIONS

Preserve:

- determinant/key attributes first where educationally useful,
- original relation ordering when possible.

Logical equality remains set-based.

The display order should make the decomposition easy to understand.

---

# 61. KEY INFORMATION IN RESULTING RELATIONS

Where candidate keys can be determined from the projected dependencies, expose them.

This may reuse the Phase 4 key engine on each resulting relation.

Do not assume the original candidate key remains the key of every decomposed relation.

Reanalyze resulting schemas where appropriate.

---

# 62. PROJECTED FD RECOMPUTATION

Do not simply copy every original FD into every resulting relation.

Only include dependencies that apply to the relation's attributes.

Use formal projection logic.

This is essential for dependency preservation.

---

# 63. PROJECTED MVD INFORMATION

Preserve/recalculate supported MVD metadata for resulting schemas where meaningful.

Do not blindly copy MVDs that reference attributes not present in the relation.

---

# 64. NORMALIZED RESULT TREE

The eventual result should conceptually look like:

```text
ORIGINAL
R(A,B,C,D,E)
   │
   ├── 2NF DECOMPOSITION
   │      ├── R1(...)
   │      └── R2(...)
   │
   └── further normalization
          ├── R3(...)
          └── R4(...)
```

Phase 7 must generate the underlying lineage data.

Phase 8 will render the full polished tree.

---

# 65. NO FINAL GRAPH ENGINE

Do not build the complete D3/React Flow visualization now.

Return structured lineage data.

---

# 66. API ARCHITECTURE

Extend the versioned API.

Possible endpoints:

```text
POST /api/v1/decomposition/2nf
POST /api/v1/decomposition/3nf
POST /api/v1/decomposition/4nf

POST /api/v1/decomposition/verify-lossless
POST /api/v1/decomposition/verify-dependencies

POST /api/v1/decomposition/analyze
```

A unified service endpoint may be preferable.

Choose a clean API that avoids duplicated calculations.

---

# 67. UNIFIED DECOMPOSITION REQUEST

Conceptual input:

```json
{
  "relation": {
    "name": "R",
    "attributes": ["A", "B", "C", "D"]
  },
  "functionalDependencies": [
    {
      "lhs": ["A"],
      "rhs": ["B"]
    }
  ],
  "multivaluedDependencies": [],
  "candidateKeys": [
    ["A", "C"]
  ],
  "targetNormalForm": "3NF"
}
```

The backend should validate the input and perform the requested operation.

Do not hardcode the expected output.

---

# 68. VERIFICATION ENDPOINT

Conceptually:

```text
POST /api/v1/decomposition/verify
```

Request:

```text
originalRelation
dependencies
decomposedRelations
```

Response:

```text
losslessJoin
dependencyPreservation
reasoning
```

Use typed Pydantic models.

---

# 69. FRONTEND DECOMPOSITION WORKSPACE

Create/extend the Analyzer to display actual decomposition results.

Conceptual layout:

```text
DECOMPOSITION

Original
──────────────────
R(A,B,C,D)

Trigger
──────────────────
3NF violation:
B → C

↓ Decompose

Resulting Relations
──────────────────
R1(B,C)
R2(A,B,D)

Verification
──────────────────
Lossless Join      ✓
Dependency Pres.   ✓

[Show Logic]
```

Use progressive disclosure.

---

# 70. SHOW LOGIC FOR LOSSLESS JOIN

Click:

> Show Logic

and expose:

```text
Method:
Chase/Tableau

Step 1:
Initial tableau...

Step 2:
Apply dependency...

Step 3:
Propagate symbols...

Final:
Lossless condition established.
```

Do not expose internal technical detail by default.

---

# 71. SHOW LOGIC FOR DEPENDENCY PRESERVATION

Show:

```text
Original:
A → C

Projected:
A → B
B → C

Compute A+:
{A,B,C}

Therefore A → C is preserved.
```

Again, based on actual computation.

---

# 72. DECOMPOSITION WARNING STATES

If verification fails:

```text
⚠ Review required

The proposed decomposition did not pass the
implemented lossless-join verification.
```

Do not hide or override a failed formal check.

---

# 73. PARTIAL VERIFICATION STATES

If a formal check is not supported for a particular MVD scenario:

```text
— Formal verification unavailable for this case
```

and explain why.

Do not display a false ✓.

---

# 74. ERROR HANDLING

Examples:

### Invalid decomposition

> Generated relation contains an attribute not present in the source relation.

### Invalid dependency

> Triggering dependency references an unknown attribute.

### Unsupported verification

> The current verification implementation does not support this dependency type/configuration.

### Empty decomposition

> At least two resulting relations are required for a decomposition verification request.

---

# 75. CACHING / PERFORMANCE

Decomposition can repeatedly call:

- closure,
- candidate-key analysis,
- projection,
- verification.

Reuse cached results where safe.

Cache must be tied to the current input/schema/dependency version.

Do not return stale verification results after the user edits input.

---

# 76. RECURSION PROTECTION

For recursive 4NF or future normalization flows:

Track a normalized schema fingerprint:

```text relation attributes
relevant dependencies
```

If a schema has already been analyzed, avoid re-entering it indefinitely.

---

# 77. DECOMPOSITION IDENTITY

Each generated relation must have a stable internal identity for the duration of an analysis.

Do not rely entirely on display names.

---

# 78. VERSIONED ANALYSIS SNAPSHOT

Each decomposition result must correspond to the input used to create it.

Reuse the stale-analysis mechanism:

```text inputFingerprint
analysisFingerprint
```

If current input changes:

```text result = stale
```

---

# 79. FRONTEND DECOMPOSITION ACTIONS

Potential actions:

```text
View Decomposition
Show Logic
Compare Before/After
Verify
Back to Input
Re-analyze
```

Do not implement the final animated version yet.

---

# 80. EDUCATIONAL LANGUAGE

Use:

> Decomposition Proposal

before formal verification.

After verification:

> Verified Decomposition

where appropriate.

Do not label something "verified" until actual verification passes.

---

# 81. FINAL NORMALIZATION RESULT

When the complete engine eventually runs, the result should be able to say:

```text
Highest Confirmed Normal Form:
4NF
```

or:

```text
First Violation:
3NF

Recommended decomposition:
...
```

Phase 7 should now provide the decomposition data required to reach those states.

---

# 82. TARGET NORMAL FORM API

Create an application-service boundary such as:

```text
normalizeTo2NF(...)
normalizeTo3NF(...)
normalizeTo4NF(...)
```

or:

```text
normalizeTo(target)
```

Choose a design that allows the later UI to request normalization.

---

# 83. TARGET 2NF

The output should:

- resolve detected 1NF prerequisite issues appropriately,
- remove relevant partial dependencies,
- produce relations,
- verify decomposition.

Do not claim 2NF completion if prerequisites fail.

---

# 84. TARGET 3NF

The output should:

- incorporate candidate-key analysis,
- use a documented 3NF synthesis/decomposition strategy,
- produce relations,
- verify losslessness,
- verify dependency preservation,
- preserve reasoning.

---

# 85. TARGET 4NF

The output should:

- start from correctly analyzed lower normal forms,
- use non-trivial MVD violations,
- decompose according to 4NF,
- support further decomposition where applicable,
- preserve lineage,
- perform supported verification,
- clearly document any formal verification limitations.

---

# 86. RELATIONAL ALGEBRA / SET SEMANTICS

All decomposition calculations must use set semantics.

Examples:

```text
R − X
X ∪ Y
Y − X
X ⊆ R
```

Attribute ordering is not mathematically meaningful.

Do not implement decomposition using string slicing or textual replacement.

---

# 87. TESTING — DECOMPOSITION

Test:

- 2NF decomposition,
- 3NF synthesis,
- 4NF decomposition,
- multiple violations,
- multiple candidate keys,
- composite determinants,
- multi-attribute RHS,
- multi-attribute MVDs.

---

# 88. TESTING — LOSSLESS JOIN

Prepare known examples with expected:

```text
lossless = true
```

and:

```text
lossless = false
```

Do not only test cases that should pass.

The verifier must be capable of identifying lossy decompositions.

---

# 89. TESTING — DEPENDENCY PRESERVATION

Test:

### Preserved

Projected dependencies imply original dependencies.

### Not preserved

At least one original dependency cannot be derived from projected dependencies without a join.

Test multiple dependencies.

---

# 90. TESTING — 3NF SYNTHESIS

Test:

- FD with single RHS,
- FD with multiple RHS,
- redundant dependency,
- extraneous LHS attribute,
- relation without a generated key relation,
- relation with a candidate-key schema already generated,
- multiple candidate keys.

---

# 91. TESTING — 4NF

Test:

- one non-trivial MVD,
- multiple MVDs,
- composite X,
- composite Y,
- remaining attributes,
- recursive decomposition,
- no MVD,
- trivial MVD.

---

# 92. TESTING — DECOMPOSITION LINEAGE

Verify that:

```text
parent
trigger
children
```

are correct.

Example:

```text
R
 ↓ 3NF violation: B → C
R1
R2
```

The UI must be able to reconstruct this history later.

---

# 93. TESTING — RESULT IMMUTABILITY

After producing decomposition:

1. modify input,
2. old decomposition should become stale,
3. re-run,
4. new decomposition should be generated.

No old result should masquerade as current.

---

# 94. REGRESSION TESTING

Verify all previous phases.

Phase 1:

- navigation,
- theme,
- app shell.

Phase 2:

- input builder,
- raw/structured modes,
- validation,
- sample data.

Phase 3:

- FD engine,
- closure,
- determination.

Phase 4:

- candidate keys,
- superkeys,
- prime/non-prime.

Phase 5:

- 1NF,
- 2NF,
- partial dependency detection.

Phase 6:

- 3NF,
- 4NF,
- MVD handling.

Do not break previous functionality.

---

# 95. BROWSER DEMONSTRATION — 2NF

Use:

```text
ENROLLMENT(
    StudentID,
    CourseID,
    StudentName,
    CourseName,
    Grade
)

Candidate Key:
(StudentID, CourseID)

FDs:
StudentID → StudentName
CourseID → CourseName
(StudentID,CourseID) → Grade
```

Run normalization.

Show:

```text
2NF ✗
```

Then:

```text
Decomposition Proposal
```

Then:

```text
STUDENT(StudentID, StudentName)
COURSE(CourseID, CourseName)
ENROLLMENT(StudentID, CourseID, Grade)
```

Then click:

```text
Verify
```

Show:

```text
Lossless Join:
✓ / actual calculated result

Dependency Preservation:
✓ / actual calculated result
```

Do not hardcode.

---

# 96. BROWSER DEMONSTRATION — 3NF

Use:

```text
EMPLOYEE(
    EmpID,
    EmpName,
    DeptID,
    DeptName
)

FDs:
EmpID → EmpName, DeptID
DeptID → DeptName
```

Show:

```text
3NF ✗
```

Then:

```text
3NF decomposition
```

Then:

```text
DEPARTMENT(DeptID, DeptName)
EMPLOYEE(EmpID, EmpName, DeptID)
```

Run formal verification.

---

# 97. BROWSER DEMONSTRATION — 4NF

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
STUDENT_HOBBY(Student,Hobby)
STUDENT_LANGUAGE(Student,Language)
```

Run the available formal verification.

Clearly distinguish MVD-related verification if the implementation has a different method or supported scope.

---

# 98. FRONTEND DECOMPOSITION PANEL

Use the existing design language.

Recommended hierarchy:

```text
Stage
   ↓
Violation
   ↓
Decomposition
   ↓
Result relations
   ↓
Verification
```

Default view should be compact.

Expanded view should provide technical detail.

---

# 99. BEFORE / AFTER COMPARISON

Create a reusable component/section:

```text
Before
──────────
R(A,B,C,D)

After
──────────
R1(A,B)
R2(A,C,D)
```

Highlight shared attributes and moved attributes where useful.

Do not overanimate.

---

# 100. LINEAGE PREVIEW

Show:

```text
R
│
├── R1
└── R2
```

Later Phase 8 will turn this into a polished animated tree.

---

# 101. VERIFICATION SUMMARY UI

Use:

```text
Decomposition Verification

Lossless Join
✓ Verified

Dependency Preservation
✓ Verified
```

If failure:

```text
Lossless Join
✗ Failed

Dependency Preservation
✓ Verified
```

If unsupported:

```text
— Not evaluated
```

Never fabricate success.

---

# 102. API CONTRACT DOCUMENTATION

Create/update:

```text
docs/decomposition-engine.md
```

Document:

- decomposition model,
- 2NF strategy,
- 3NF synthesis,
- minimal-cover support if implemented,
- 4NF MVD decomposition,
- lossless method,
- dependency-preservation method,
- recursive decomposition,
- limitations.

---

# 103. COMPLEXITY DOCUMENTATION

Document actual implementation complexity.

Important observations:

- closure calls depend on relation and FD sizes,
- candidate-key-related operations may be expensive,
- minimal-cover computation can involve repeated closure checks,
- dependency projection can be computationally expensive,
- lossless chase can grow with relation/decomposition size,
- dependency-preservation checking can require multiple closure calculations,
- recursive 4NF decomposition requires bounded/visited-state processing.

Do not make blanket "O(1)" or similarly incorrect claims.

---

# 104. NO FINAL REPORT GENERATION

Phase 7 should make all decomposition/verification results serializable.

Do not implement PDF/DOCX/TXT generation yet.

That belongs to Phase 10.

---

# 105. NO FINAL VISUALIZATION ENGINE

Do not implement the final D3/React Flow decomposition graph yet.

Provide structured lineage and reasoning.

Phase 8 owns the polished visualization layer.

---

# 106. NO LLM

Do not integrate:

- OpenAI,
- Gemini API,
- Claude,
- Ollama,
- any paid AI service.

All decomposition and verification reasoning must be deterministic.

---

# 107. NO PRACTICE MODE

Practice Mode remains optional and deferred.

---

# 108. SECURITY

Continue:

- server-side validation,
- safe rendering,
- no arbitrary SQL execution,
- no secrets,
- no external AI dependencies.

---

# 109. PERFORMANCE

For normal classroom-sized schemas:

- decomposition should be responsive,
- verification should be responsive,
- UI should not freeze.

For computationally expensive cases:

- use loading state,
- show progress where genuinely measurable,
- use safe limits if necessary,
- clearly report if a computation was not completed.

Do not fake progress percentages.

---

# 110. STALE RESULT PROTECTION

Every decomposition/verification result must be tied to the input snapshot.

If current input changes:

```text
Decomposition result is outdated.
[Re-analyze]
```

Do not silently reuse old results.

---

# 111. NO HARD-CODED DEMO LOGIC

All sample relations must use the real decomposition/verification services.

Never write:

```text
if example == "EMPLOYEE":
    lossless = true
```

The result must come from actual computation.

---

# 112. IMPORTANT CORRECTNESS REQUIREMENT

Do not make assumptions such as:

> Every standard-looking 2NF decomposition is automatically lossless.

or:

> Every common decomposition is dependency-preserving.

Instead:

```text
Generate
↓
Verify
↓
Display result
```

This is one of the primary purposes of Phase 7.

---

# 113. PHASE 7 ACCEPTANCE CRITERIA

Phase 7 is complete only when:

## Decomposition

- [ ] General decomposition model exists.
- [ ] 2NF decomposition works.
- [ ] 3NF decomposition works.
- [ ] 4NF decomposition works.
- [ ] Composite determinants supported.
- [ ] Multi-attribute RHS supported.
- [ ] Multiple violations supported.
- [ ] Multiple candidate keys handled.
- [ ] Original relation preserved.
- [ ] Decomposition lineage exists.
- [ ] Intermediate relations preserved.

## 3NF synthesis

- [ ] Minimal/canonical cover functionality implemented if required.
- [ ] RHS splitting supported internally.
- [ ] LHS extraneous attributes handled.
- [ ] Redundant dependencies handled.
- [ ] Key-containing relation rule supported.
- [ ] Generated relations are deduplicated.
- [ ] User's original FD set remains unchanged.

## 4NF

- [ ] Non-trivial MVD decomposition implemented.
- [ ] Composite MVD sides supported.
- [ ] Remaining attribute set calculated correctly.
- [ ] Recursive decomposition support exists where needed.
- [ ] Infinite recursion prevented.

## Lossless Join

- [ ] Formal lossless verification implemented.
- [ ] Not based on simple overlap heuristic.
- [ ] Verification result is structured.
- [ ] Reasoning trace available.
- [ ] Known lossy case tested.
- [ ] Known lossless case tested.

## Dependency Preservation

- [ ] FD projection implemented.
- [ ] Projected dependencies represented.
- [ ] Closure of projected dependency set can be checked.
- [ ] Preserved dependencies identified.
- [ ] Non-preserved dependencies identified.
- [ ] Known preserved case tested.
- [ ] Known non-preserved case tested.

## Result Integration

- [ ] Decomposition result integrates with 1NF–4NF analysis.
- [ ] Highest confirmed normal form remains consistent.
- [ ] Result snapshots are protected from stale input.
- [ ] Structured lineage exists.

## Frontend

- [ ] Decomposition panel works.
- [ ] Before/after schema works.
- [ ] Verification summary works.
- [ ] Show Logic works.
- [ ] Failure/unsupported states work.
- [ ] Existing design system preserved.
- [ ] No fake verification results.

## API

- [ ] Decomposition API works.
- [ ] Verification API works.
- [ ] Request/response schemas typed.
- [ ] Errors structured.

## Testing

- [ ] Unit tests.
- [ ] Integration tests.
- [ ] decomposition tests.
- [ ] lossless tests.
- [ ] dependency-preservation tests.
- [ ] 3NF synthesis tests.
- [ ] 4NF recursive tests.
- [ ] frontend tests.
- [ ] regression tests.

## Documentation

- [ ] decomposition algorithm documented.
- [ ] 3NF synthesis documented.
- [ ] lossless algorithm documented.
- [ ] dependency-preservation algorithm documented.
- [ ] limitations documented.
- [ ] complexity documented.

---

# 114. REQUIRED TEST FIXTURES

Prepare a dedicated collection of test fixtures.

Conceptual organization:

```text
tests/fixtures/
    2nf/
    3nf/
    4nf/
    lossless/
    dependency_preservation/
```

Each fixture should define:

- relation,
- dependencies,
- candidate keys if relevant,
- expected decomposition,
- expected verification outcome.

Do not only test through the browser.

---

# 115. DECOMPOSITION TEST — 2NF

Use:

```text
R(StudentID,CourseID,StudentName,CourseName,Grade)

K:
(StudentID,CourseID)

FDs:
StudentID → StudentName
CourseID → CourseName
(StudentID,CourseID) → Grade
```

Expected logical decomposition:

```text
STUDENT(StudentID,StudentName)
COURSE(CourseID,CourseName)
ENROLLMENT(StudentID,CourseID,Grade)
```

Do not assert generated relation names if the implementation uses different deterministic names; assert logical attribute sets.

---

# 116. DECOMPOSITION TEST — 3NF

Use:

```text
R(EmpID,EmpName,DeptID,DeptName)

FDs:
EmpID → EmpName,DeptID
DeptID → DeptName
```

Expected logical schemas:

```text
EMPLOYEE(EmpID,EmpName,DeptID)
DEPARTMENT(DeptID,DeptName)
```

Verify lossless/dependency preservation using the actual implementation.

---

# 117. DECOMPOSITION TEST — 4NF

Use:

```text
R(Student,Hobby,Language)

MVD:
Student →→ Hobby
```

Expected logical schemas:

```text
STUDENT_HOBBY(Student,Hobby)
STUDENT_LANGUAGE(Student,Language)
```

---

# 118. LOSSLESS TESTS

Include:

- a clearly known lossless decomposition,
- a known lossy decomposition,
- a decomposition involving multiple relations.

Do not rely only on textbook-like trivial examples.

---

# 119. DEPENDENCY PRESERVATION TESTS

Include:

### Preserved case

Projected dependencies' closure contains all original FDs.

### Non-preserved case

At least one original FD cannot be derived from projected dependencies.

The implementation should compare implications mathematically rather than strings.

---

# 120. MINIMAL COVER TESTS

If minimal-cover functionality is implemented:

Test:

### RHS splitting

```text
A → B,C
```

becomes internal:

```text
A → B
A → C
```

### Extraneous LHS attribute

Test a dependency where one determinant attribute is unnecessary.

### Redundant FD

Test an FD implied by the others.

### Stable result

Same input produces same minimal cover.

---

# 121. REGRESSION BROWSER TEST

After Phase 7:

1. Create relation.
2. Run full normalization.
3. Find a violation.
4. Generate decomposition.
5. View results.
6. Verify lossless.
7. Verify dependency preservation.
8. Modify relation.
9. Confirm stale-result handling.
10. Re-run.
11. Verify new result.

---

# 122. FINAL USER EXPERIENCE AFTER PHASE 7

The user should now be able to experience:

```text
Enter Relation
        ↓
Analyze
        ↓
1NF
2NF
3NF
4NF
        ↓
Violation
        ↓
Why?
        ↓
Decompose
        ↓
Resulting Relations
        ↓
Verify
        ↓
Lossless Join ✓/✗
Dependency Preservation ✓/✗
```

This is the core technical workflow that later Phase 8 will make visually sophisticated.

---

# 123. HANDOFF TO PHASE 8

Phase 8 needs:

```text
normalization stages
violations
dependencies
reasoning steps
decomposition lineage
before/after schemas
verification results
```

Therefore, Phase 7 must expose all of these as structured data.

Phase 8 will focus on:

- animated normalization journey,
- interactive dependency graph,
- closure visualization,
- decomposition tree,
- visual highlighting,
- richer transitions.

Do not make Phase 8 reimplement decomposition logic.

---

# 124. HANDOFF TO PHASE 9

Phase 9's creative features will use:

- decomposition lineage,
- verification explanations,
- What-If re-analysis,
- contextual assistant.

Phase 7 must make decomposition services repeatable for changed inputs.

---

# 125. HANDOFF TO PHASE 10

Phase 10's Download system will need the complete:

```text
input
processing
intermediate decomposition
verification
final relations
```

Phase 7 should keep all of this serializable.

---

# 126. DEVELOPMENT WORKFLOW

Before coding:

1. Read the master reference.
2. Read Phases 1–6.
3. Inspect repository.
4. Run all existing tests.
5. Inspect Phase 5/6 result models.
6. Inspect Phase 3 closure service.
7. Inspect Phase 4 key engine.
8. Plan Phase 7.

Implement incrementally:

```text
A. Decomposition model
B. 2NF decomposition
C. 3NF synthesis
D. 4NF decomposition
E. Lossless verifier
F. Dependency preservation
G. Unified decomposition service
H. Frontend
I. Tests
```

Do not implement everything blindly in one pass.

---

# 127. CODE QUALITY

Maintain all previous project requirements:

- TypeScript strictness,
- Python typing,
- modular services,
- thin route handlers,
- reusable set operations,
- no duplication of closure/key logic,
- deterministic outputs,
- no hardcoded examples,
- no fake results,
- no unsafe execution.

---

# 128. DATA CONSISTENCY

Ensure:

```text
original FD set
```

remains unchanged.

Derived:

```text
minimal cover
projected dependencies
decomposition result
```

must be stored separately.

Likewise:

```text
original relation
decomposed relations
```

must be separate objects.

---

# 129. EDUCATIONAL TRANSPARENCY

For every decomposition, the user should be able to answer:

### What caused the split?

```text
3NF violation:
B → C
```

### What was created?

```text
R1(B,C)
R2(A,B,D)
```

### Why?

The dependency caused the relation to violate the target normal form.

### Is it formally safe?

```text
Lossless:
✓

Dependency preservation:
✓
```

The final answer must be based on actual verification.

---

# 130. LIMITATION REPORTING

The application must accurately communicate cases where:

- decomposition verification is unsupported,
- MVD reasoning exceeds the supported model,
- candidate-key enumeration reached a configured computational boundary,
- dependency projection becomes expensive,
- an input lacks sufficient information.

Never display a positive verification result when the system merely skipped the check.

---

# 131. FINAL PHASE 7 REPORT

At completion, report:

1. Files created/modified.
2. Decomposition domain model.
3. 2NF decomposition algorithm.
4. 3NF synthesis algorithm.
5. Minimal-cover implementation if included.
6. 4NF MVD decomposition.
7. Recursive decomposition support.
8. Lossless-join verification method.
9. Dependency-preservation method.
10. Relation projection.
11. Lineage tracking.
12. API endpoints.
13. Frontend integration.
14. Test results.
15. Browser verification.
16. Complexity.
17. Limitations.
18. Phase 8 handoff details.

Do not claim the final polished visualization system is complete.

---

# 132. FINAL COMMAND

Execute **PHASE 7 ONLY**.

Read and follow:

- `normalization_lab_master_project_reference.md`
- `phase_1_project_foundation_prompt.md`
- `phase_2_schema_input_builder_validation_prompt.md`
- `phase_3_fd_engine_attribute_closure_prompt.md`
- `phase_4_candidate_key_engine_prompt.md`
- `phase_5_1nf_2nf_normalization_engine_prompt.md`
- `phase_6_3nf_4nf_analysis_engine_prompt.md`

Implement the formal decomposition and verification layer exactly as specified.

Preserve all previous functionality.

Do not start Phase 8 automatically.

Do not build the final visualization engine.

Do not implement Practice Mode.

Do not integrate a paid LLM.

Do not implement final PDF/DOCX/TXT report generation.

Use deterministic database-theory algorithms.

Formally verify lossless join and dependency preservation where the implemented method applies.

Clearly report unsupported cases rather than guessing.

Run comprehensive tests.

Perform actual browser verification.

Fix all blocking issues.

Stop after Phase 7 is stable and verified.
