# PHASE 4 — Candidate-Key Engine, Superkeys, Prime/Non-Prime Attributes & Key Reasoning
## 1NF–4NF Normalization Visualizer & Analyzer / "Normalization Lab"

**Purpose of this file:**  
This is the detailed execution specification for **Phase 4**.

Use this file together with:

- `normalization_lab_master_project_reference.md`
- `phase_1_project_foundation_prompt.md`
- `phase_2_schema_input_builder_validation_prompt.md`
- `phase_3_fd_engine_attribute_closure_prompt.md`

The master reference defines the complete project vision.  
Phase 1 established the application foundation and UI/design system.  
Phase 2 established the schema/input builder, canonical input model and structural validation.  
Phase 3 established the Functional Dependency engine, attribute-set utilities, attribute closure, dependency determination and closure reasoning.

Phase 4 now builds the **Candidate-Key Engine** on top of the Phase 3 closure engine.

**Implement Phase 4 only. Do not automatically begin Phase 5.**

---

# 0. PROJECT CONTEXT

The final project is an interactive educational application for:

> **1NF → 2NF → 3NF → 4NF**

The user will eventually be able to:

- enter a relational schema,
- enter functional dependencies,
- enter multivalued dependencies,
- provide candidate keys,
- ask the system to find candidate keys,
- understand how keys were derived,
- analyze 1NF–4NF,
- see dependency/decomposition visualizations,
- experiment with the schema,
- download reports.

Phase 4 is responsible for the key-related mathematical foundation required by 2NF, 3NF and later normalization analysis.

---

# 1. PRIMARY OBJECTIVE

Implement a correct, deterministic and explainable engine that can:

1. Determine whether an attribute set is a superkey.
2. Determine whether an attribute set is a candidate key.
3. Identify all candidate keys for a valid FD-based relational schema where feasible.
4. Validate user-provided candidate keys.
5. Identify prime attributes from the candidate-key set.
6. Identify non-prime attributes.
7. Explain candidate-key discovery step-by-step.
8. Reuse the Phase 3 attribute-closure engine rather than duplicating closure logic.
9. Provide a user-facing key-analysis workspace.
10. Expose clean results for future 2NF/3NF normalization engines.

This phase is a major technical component.

---

# 2. CRITICAL SCOPE

## Implement in this phase

- Superkey checking.
- Candidate-key checking.
- Candidate-key discovery.
- Support for multiple candidate keys.
- Composite candidate keys.
- Single-attribute candidate keys.
- User-provided key verification.
- Prime/non-prime attribute classification.
- Candidate-key reasoning steps.
- Key derivation visualization foundation.
- Candidate-key API endpoints/services.
- Frontend key-analysis workspace.
- Tests across multiple key scenarios.
- Documentation and complexity analysis.

## Do NOT implement yet

Do not implement:

- 1NF analysis,
- 2NF analysis,
- 3NF analysis,
- 4NF analysis,
- MVD reasoning,
- decomposition,
- lossless join,
- dependency preservation,
- final normalization journey,
- final dependency graph,
- final What-If engine,
- Practice Mode,
- LLM integration,
- final report generation.

These belong to later phases.

---

# 3. IMPORTANT MATHEMATICAL DISTINCTION

The UI and engine must clearly distinguish:

## Superkey

An attribute set `X` is a superkey if:

```text
X+ = all attributes in R
```

## Candidate key

An attribute set `X` is a candidate key if:

1. `X` is a superkey.
2. `X` is minimal.

That means no proper subset of `X` is also a superkey.

The application must never call an attribute set a candidate key merely because its closure contains all relation attributes.

Example:

```text
R(A,B,C)

A → B
A → C
```

Then:

```text
A+ = {A,B,C}
```

So `A` is a superkey.

Because `A` has no proper non-empty subset that is also a superkey, `A` is a candidate key.

---

# 4. REUSE PHASE 3

Do NOT implement another attribute-closure algorithm.

Candidate-key analysis must use the existing Phase 3 closure service.

Conceptually:

```text
Candidate-Key Engine
        ↓
Closure Service
        ↓
X+
```

The candidate-key engine should call:

```text
computeClosure(X, F)
```

where required.

This avoids duplicated logic and ensures a single source of truth.

---

# 5. INPUTS

Candidate-key analysis uses:

- relation attribute set `R`,
- functional dependency set `F`.

Potential optional input:

- user-provided candidate keys.

MVDs and sample data are not required for key discovery.

---

# 6. USER-PROVIDED CANDIDATE KEY VERIFICATION

The user may manually enter one or more candidate keys in Phase 2.

Phase 4 must now actually verify them.

For each supplied key `K`:

### Step 1

Check that all key attributes belong to relation `R`.

Phase 2 already performs this structurally; Phase 4 must still operate safely on validated input.

### Step 2

Compute:

```text
K+
```

### Step 3

If:

```text
K+ = R
```

then `K` is a superkey.

### Step 4

Check every proper subset of `K`.

If no proper subset is a superkey, then `K` is a candidate key.

If a proper subset is a superkey:

> The supplied set is a superkey but is not minimal, so it is not a candidate key.

This distinction must be shown to users.

---

# 7. USER KEY VERIFICATION EXAMPLE

Input:

```text
R(A,B,C,D)

FDs:
A → B
B → C
AC → D

User key:
A,C
```

The system computes:

```text
AC+ = {A,B,C,D}
```

Therefore:

```text
AC is a superkey.
```

Then test subsets:

```text
A+
```

and:

```text
C+
```

If neither covers all relation attributes:

```text
AC is minimal.
```

Therefore:

```text
AC is a candidate key.
```

The UI should show this reasoning.

---

# 8. NON-CANDIDATE USER KEY EXAMPLE

Input:

```text
R(A,B,C)

FDs:
A → B
A → C

User key:
A,B
```

Compute:

```text
AB+ = {A,B,C}
```

Therefore:

```text
AB is a superkey.
```

But:

```text
A+ = {A,B,C}
```

so `A` itself is a superkey.

Therefore:

```text
AB is NOT a candidate key.
```

Reason:

> `A` is a proper subset of `AB` and is already a superkey. Therefore `AB` is not minimal.

This level of explanation is required.

---

# 9. AUTOMATIC CANDIDATE-KEY DISCOVERY

The engine must be capable of deriving candidate keys from the supplied relation attributes and functional dependencies.

The basic conceptual process is:

```text
Input:
R, F

        ↓

Identify attributes that cannot be derived
from the RHS of any relevant FD

        ↓

Use these as necessary starting attributes

        ↓

Compute closure

        ↓

If closure does not cover R,
add necessary attributes

        ↓

Find superkeys

        ↓

Minimize them

        ↓

Return candidate keys
```

The exact algorithm should be selected based on correctness and practical performance.

Do not blindly enumerate every possible subset for large attribute sets without considering complexity.

---

# 10. CANDIDATE-KEY SEARCH REQUIREMENTS

The algorithm must correctly handle:

- single-attribute keys,
- composite keys,
- multiple candidate keys,
- multiple determinants,
- attributes appearing on FD RHS,
- attributes never appearing on RHS,
- cycles,
- redundant dependencies,
- disconnected dependency components,
- candidate keys containing multiple attributes.

The engine must not assume there is only one candidate key.

---

# 11. RHS-ABSENT ATTRIBUTE INSIGHT

A useful key-discovery optimization is to examine attributes that do not occur in the RHS of any FD.

Such attributes must generally be present in every candidate key because they cannot be derived from other attributes through the supplied FDs.

The engine may use this as part of its search strategy.

But the explanation must be precise:

> "This attribute is present in every candidate key because it cannot be functionally derived from other attributes under the supplied FD set."

Avoid overly broad claims if the exact implementation uses additional rules.

---

# 12. CANDIDATE-KEY ENUMERATION

The engine must enumerate candidate keys without returning arbitrary superkeys as keys.

For each candidate:

1. Verify full closure.
2. Verify superkey property.
3. Verify minimality.

The final result must contain only minimal superkeys.

---

# 13. MINIMALITY TEST

For a superkey:

```text
K
```

test each proper subset needed by the chosen strategy.

If any proper subset remains a superkey:

```text
K is not minimal.
```

If removing every individual attribute causes the closure to stop covering all relation attributes, the key is minimal under the standard minimal-superkey criterion.

The implementation should document the exact minimality strategy used.

---

# 14. EQUIVALENT / DUPLICATE CANDIDATE KEYS

The engine must not return duplicate candidate keys.

Because attribute sets are unordered:

```text
(A,B)
```

and:

```text
(B,A)
```

are the same key.

Return them once.

---

# 15. MULTIPLE CANDIDATE KEYS

Example:

```text
R(A,B,C)

A → B,C
C → A,B
```

Potential candidate keys:

```text
A
C
```

The engine must return both if mathematically correct.

Do not stop after finding the first key.

---

# 16. COMPOSITE CANDIDATE KEY

Example:

```text
R(A,B,C,D)

A,B → C
C → D
```

If neither `A+` nor `B+` alone covers all attributes, but:

```text
AB+ = {A,B,C,D}
```

then:

```text
AB
```

can be a candidate key if minimal.

The engine must handle this.

---

# 17. MULTIPLE COMPOSITE KEYS

Support scenarios such as:

```text
(A,B)
(A,C)
(D,E)
```

where appropriate.

The data model must not assume a fixed key size.

---

# 18. SUPERNKEY CHECK SERVICE

Expose a reusable service:

```text
isSuperkey(attributeSet, relation, FDs)
```

Conceptually:

```text
closure(attributeSet) ⊇ relationAttributes
```

Return structured information:

```text
isSuperkey
closure
reasoningSteps
```

This will later be used by 2NF, 3NF and 4NF.

---

# 19. CANDIDATE-KEY CHECK SERVICE

Expose:

```text
isCandidateKey(attributeSet, relation, FDs)
```

Result should conceptually include:

```text
isSuperkey
isMinimal
isCandidateKey
closure
minimalityChecks[]
reasoningSteps[]
```

This will be used by future normalization engines.

---

# 20. PRIME ATTRIBUTE CLASSIFICATION

After all candidate keys have been determined:

```text
Prime attributes =
union of attributes appearing in at least one candidate key
```

Non-prime attributes:

```text
Relation attributes - prime attributes
```

Example:

```text
Candidate keys:
(A,B)
(B,C)

Prime attributes:
A,B,C

If relation:
(A,B,C,D,E)

Non-prime:
D,E
```

This classification is required later for 2NF and 3NF.

---

# 21. PRIME/NON-PRIME RESULT

Return structured data:

```text
primeAttributes[]
nonPrimeAttributes[]
candidateKeys[]
```

Do not infer prime/non-prime from a user-provided but invalid key.

Use mathematically verified candidate keys.

If no candidate key can be derived, clearly state that classification cannot be established from the current FD set rather than inventing one.

---

# 22. CANDIDATE-KEY REASONING

The engine must not only return:

```text
Candidate Keys:
(A,B)
(C,D)
```

It must be capable of explaining how each key was obtained.

Conceptual example:

```text
Step 1
Relation:
R(A,B,C,D)

Step 2
Attributes not appearing on RHS:
A

A must be included in a candidate key.

Step 3
Compute:
A+ = {A,B}

Step 4
A does not determine C,D.

Add C.

Step 5
Compute:
AC+ = {A,B,C,D}

Step 6
AC is a superkey.

Step 7
Test proper subsets:
A+ ≠ R
C+ ≠ R

Step 8
Therefore:
AC is minimal.

Result:
AC is a candidate key.
```

The exact steps must match the actual algorithm used.

---

# 23. DO NOT PRESENT HEURISTICS AS THEOREMS

If the search algorithm uses an optimization/heuristic, explain it accurately.

Never tell the user:

> "Every attribute not on RHS is always enough."

Instead explain only what is mathematically justified.

The agent must prioritize correctness over a simplistic explanation.

---

# 24. CANDIDATE-KEY SEARCH COMPLEXITY

Candidate-key enumeration can be computationally expensive because the number of possible attribute subsets is exponential in the number of attributes.

The implementation should:

- use closure intelligently,
- prune impossible/known-redundant combinations,
- avoid returning non-minimal superkeys,
- document worst-case complexity honestly.

For small classroom-sized relations, the system should be responsive.

Do not invent a polynomial complexity claim if the algorithm is exponential in the worst case.

---

# 25. SEARCH ALGORITHM DESIGN

Choose a clear algorithm such as:

- necessary-attribute analysis,
- breadth-first or size-increasing combination search,
- closure checks,
- minimality pruning.

The exact method is up to the implementation, but it must:

1. be correct,
2. find all candidate keys within supported limits,
3. avoid duplicate keys,
4. prune supersets of already found candidate keys,
5. use the Phase 3 closure engine,
6. produce reproducible reasoning.

Document the algorithm.

---

# 26. KEY SEARCH LIMITS

Do not silently truncate results.

If a relation is so large that exhaustive candidate-key enumeration becomes impractical:

- show a clear limitation/warning,
- preserve correctness,
- explain what was tested,
- avoid claiming all candidate keys were found if the search was capped.

For normal classroom-sized schemas, the default should complete automatically.

---

# 27. FRONTEND CANDIDATE-KEY WORKSPACE

Create/extend the Analyzer with a clear key-analysis area.

Conceptual UI:

```text
KEY ANALYSIS

Provided Keys
────────────────────────
(StudentID, CourseID)
[Verify]

Automatically Find Keys
────────────────────────
[Find Candidate Keys]

Candidate Keys Found
────────────────────────
🔑 (StudentID, CourseID)
🔑 EnrollmentID

Prime Attributes
────────────────────────
StudentID
CourseID
EnrollmentID

Non-Prime Attributes
────────────────────────
StudentName
CourseName
Grade
```

Do not overload the main screen.

Use expandable panels if necessary.

---

# 28. KEY FINDING EXPLANATION UI

When automatic key discovery is requested, show a reasoning panel:

```text
How did we find these keys?

1. Relation contains 5 attributes.
2. Attributes not functionally determined by any RHS
   were identified.
3. Candidate combinations were explored.
4. Closure was computed for each promising set.
5. Superkeys were identified.
6. Non-minimal superkeys were removed.
7. Remaining minimal superkeys are candidate keys.
```

The exact details must come from actual computation.

---

# 29. KEY VISUALIZATION

Create a basic visual representation of the key discovery.

For example:

```text
Required attributes
        ↓
Candidate set
        ↓
Closure
        ↓
All relation attributes?
        ↓
Superkey
        ↓
Minimal?
        ↓
Candidate Key
```

This is foundational for later enhanced visualization.

Do not build the complete final Visualization Engine in Phase 8 yet.

---

# 30. CLOSURE INTEGRATION

When the user inspects a candidate key:

```text
🔑 (A,B)
```

provide:

```text
Show Closure
```

Then reuse the Phase 3 closure result.

Do not calculate it independently.

---

# 31. KEY COMPARISON

Where multiple candidate keys exist, the UI may allow comparison.

Example:

```text
Key A:
(A,B)

Key B:
(C,D)
```

Show:

- key size,
- closure,
- prime attributes contributed,
- reasoning summary.

This is optional but useful.

Do not imply that a key is "better" merely because it is smaller unless you clearly state the mathematical property being discussed. The application should remain academically neutral.

---

# 32. USER-PROVIDED VS DERIVED KEYS

Visually distinguish:

```text
User Provided
```

from:

```text
Engine Derived
```

For example:

```text
Candidate key entered by user:
(A,B)

Verification:
✓ Valid candidate key
```

and:

```text
Automatically discovered:
(C,D)
```

This helps students understand the process.

---

# 33. INVALID PROVIDED KEY UX

Examples:

### Not a superkey

```text
Provided:
A,B

Closure:
{A,B,C}

Relation:
{A,B,C,D}

Result:
✗ Not a superkey
```

### Superkey but not candidate key

```text
Provided:
A,B,C

A,B already determines all attributes.

Result:
⚠ Superkey, but not a candidate key.
Reason:
Not minimal.
```

### Valid candidate key

```text
Provided:
A,C

A,C+ = R

No proper subset is a superkey.

Result:
✓ Candidate key
```

---

# 34. EMPTY / INCOMPLETE FD CASE

If no FDs are supplied:

For relation:

```text
R(A,B,C)
```

the closure of a set is generally limited to the selected attributes under the empty FD set.

Therefore, no multi-attribute key should be fabricated.

If the entire relation is the only way to contain all attributes, the engine should reason accordingly.

The UI must explain the result rather than showing a confusing blank.

---

# 35. CANDIDATE KEY WITH COMPLETE RELATION

If:

```text
R(A,B,C)
```

and no FDs exist, the entire attribute set:

```text
(A,B,C)
```

is a superkey and is minimal if no proper subset determines all attributes.

Therefore it is the candidate key.

This is an important edge case and must be tested.

---

# 36. EXTRANEOUS / REDUNDANT ATTRIBUTES IN A KEY

The engine must identify when a proposed key contains unnecessary attributes.

Example:

```text
A → B
```

Relation:

```text
R(A,B,C)
```

Provided key:

```text
A,B,C
```

If the closure of A already covers the relation, then:

```text
A,B,C
```

is a superkey but not a candidate key.

The UI should explicitly say:

> These additional attributes are unnecessary for minimality.

---

# 37. CANDIDATE-KEY SEARCH AND REDUNDANCY

If a candidate key `K` has already been found, any proper superset of `K` cannot itself be a candidate key.

Use this as a search-pruning rule.

Document this appropriately.

---

# 38. ATTRIBUTE ORDER

Candidate keys are mathematically unordered sets.

Display them in a stable form.

Example:

```text
(A, B, C)
```

not random permutations.

This makes results reproducible and easier to read.

---

# 39. RESULT STABILITY

The same:

```text
R
F
```

should produce the same ordered candidate-key list and same reasoning order.

Use deterministic sorting/order conventions.

This matters for:

- testing,
- reports,
- UI,
- debugging.

---

# 40. API DESIGN

Create versioned endpoints consistent with Phase 1/2/3.

Possible endpoints:

```text
POST /api/v1/keys/verify

POST /api/v1/keys/find

POST /api/v1/keys/analysis
```

You may combine them if a cleaner API design is preferable.

The response should contain structured data.

---

# 41. VERIFY KEY REQUEST

Conceptually:

```json
{
  "relation": {
    "name": "R",
    "attributes": ["A", "B", "C"]
  },
  "functionalDependencies": [
    {
      "lhs": ["A"],
      "rhs": ["B"]
    },
    {
      "lhs": ["B"],
      "rhs": ["C"]
    }
  ],
  "candidateKey": ["A"]
}
```

Response should include:

```text
isSuperkey
isMinimal
isCandidateKey
closure
reasoningSteps
minimalityChecks
```

---

# 42. FIND KEYS REQUEST

Conceptually:

```text
POST /api/v1/keys/find
```

Input:

```text
relation
functionalDependencies
```

Output:

```text
candidateKeys[]
primeAttributes[]
nonPrimeAttributes[]
reasoningSteps[]
```

No MVDs are needed.

---

# 43. KEY ANALYSIS RESPONSE

A combined response may look conceptually like:

```text
KeyAnalysisResult
    relation
    candidateKeys[]
    superkeyChecks[]
    primeAttributes[]
    nonPrimeAttributes[]
    reasoningSteps[]
    warnings[]
```

Keep it structured for future 2NF/3NF use.

---

# 44. FRONTEND API SERVICE

Use the existing API abstraction from previous phases.

Do not put direct network calls in UI components.

Add a key-analysis service.

Conceptually:

```text
keyService.verifyKey(...)
keyService.findCandidateKeys(...)
keyService.analyzeKeys(...)
```

---

# 45. STATE ARCHITECTURE

Keep:

```text
inputState
validationState
keyAnalysisState
uiState
```

separate.

Do not mutate the Phase 2 canonical input model with calculated outputs.

Calculated results belong in analysis state.

---

# 46. NO NORMAL FORM RESULTS

Phase 4 may display:

```text
Prime Attributes
Non-Prime Attributes
```

because these are key-derived concepts.

Do not display:

```text
2NF ✓
3NF ✗
```

Those belong to later phases.

---

# 47. NO DECOMPOSITION

Do not generate normalized relations yet.

Candidate-key analysis is a foundation for later 2NF/3NF.

---

# 48. NO MVD PROCESSING

MVDs may still exist in the input object, but do not use them for key discovery.

Candidate keys in this phase are based on the relation and FDs.

---

# 49. EDUCATIONAL EXPLANATION PRINCIPLE

Every key result should be explainable.

Examples:

### Superkey

> The closure of `(A,B)` contains every attribute in the relation, so `(A,B)` is a superkey.

### Not a superkey

> The closure of `(A,B)` contains `{A,B,C}` but the relation also contains `D`. Therefore `(A,B)` does not determine all attributes and is not a superkey.

### Candidate key

> `(A,B)` is a superkey and no proper subset is a superkey. Therefore it is a candidate key.

### Not a candidate key

> `(A,B,C)` is a superkey, but `(A,B)` is already a superkey. Therefore `(A,B,C)` is not minimal and is not a candidate key.

---

# 50. LEARNING CONNECTION

The UI should optionally show:

> Why do candidate keys matter?

Answer:

> Candidate keys identify minimal attribute combinations that uniquely determine the complete relation. They are essential for identifying prime attributes and analyzing 2NF and 3NF.

Keep educational explanations concise in the workspace.

The full theory belongs in Learn later.

---

# 51. TESTING STRATEGY

This phase requires extensive tests.

## Attribute-set tests

Test:

- equality,
- subset,
- proper subset,
- union,
- difference,
- canonical ordering.

Reuse Phase 3 tests rather than duplicating them if already available.

---

# 52. Superkey Tests

### Test 1

```text
R(A,B,C)
A → B
B → C

A+
= A,B,C

A is superkey
```

### Test 2

```text
R(A,B,C,D)
A → B
B → C

A+
= A,B,C

A is not superkey
```

### Test 3

Composite superkey:

```text
AB+ = R
```

---

# 53. Candidate-Key Tests

Test:

- one candidate key,
- multiple candidate keys,
- composite candidate key,
- single-attribute candidate key,
- invalid proposed key,
- superkey but not minimal,
- empty FD set,
- cyclic dependencies,
- redundant attributes,
- multiple candidate keys of different sizes.

---

# 54. Prime-Attribute Tests

Example:

```text
Candidate keys:
(A,B)
(B,C)

Prime:
A,B,C
```

Non-prime classification must be correct.

---

# 55. IMPORTANT REGRESSION TESTS

After Phase 4:

Verify Phase 1:

- navigation,
- theme,
- application shell.

Verify Phase 2:

- relation builder,
- attribute builder,
- key input,
- FD input,
- MVD input,
- sample data,
- structured/raw mode,
- validation,
- example loader.

Verify Phase 3:

- closure,
- FD engine,
- determination,
- closure UI.

Do not break previous work.

---

# 56. BROWSER DEMONSTRATION

Use a prepared example:

```text
R(A,B,C,D)

FDs:
A → B
B → C
C → D
```

Ask the system:

> Find Candidate Keys

Expected:

```text
A+
= {A,B,C,D}
```

Therefore:

```text
Candidate Key:
A
```

Then inspect:

```text
Prime Attributes:
A

Non-Prime:
B,C,D
```

The system should show how this was derived.

---

# 57. COMPOSITE-KEY DEMONSTRATION

Example:

```text
R(A,B,C,D)

FDs:
A,B → C
C → D
```

Ask:

> Find Candidate Keys

The system should correctly determine:

```text
(A,B)
```

if minimality and closure confirm it.

Explain:

```text
A+ = {A}
B+ = {B}
AB+ = {A,B,C,D}
```

Therefore:

```text
AB is a minimal superkey.
```

---

# 58. MULTIPLE-KEY DEMONSTRATION

Create a tested schema that has more than one candidate key.

The UI must display all discovered keys.

Example structure:

```text
Candidate Keys

🔑 (A,B)
🔑 (C,D)

Prime Attributes:
A,B,C,D
```

Do not stop after first key.

---

# 59. KEY DISCOVERY PROGRESS

If the search is non-trivial, provide appropriate progress indication.

For large but valid input:

```text
Searching candidate keys...
```

Do not display fake percentages.

If no progress calculation exists, use an indeterminate loader.

---

# 60. FAILURE HANDLING

If candidate-key search becomes too large or exceeds a safe threshold:

- do not hang,
- do not crash,
- return a structured warning,
- explain that exhaustive candidate-key enumeration may become computationally expensive,
- allow the user to inspect known partial results only if your algorithm supports this without ambiguity.

Do not label incomplete search output as the complete candidate-key set.

---

# 61. PERFORMANCE

For normal classroom-sized schemas:

- candidate-key search should complete quickly,
- closure calls should be efficient,
- UI must remain responsive.

Potentially memoize closure results during a single key-search operation.

If doing so, ensure cache keys correctly include the attribute set and FD-set/version.

Do not reuse stale closures after input changes.

---

# 62. FRONTEND DESIGN

Preserve the Phase 1/2 visual system.

The key-analysis panel should be:

- technically clear,
- visually calm,
- educational,
- interactive.

Use the same:

- typography,
- borders,
- accent,
- spacing,
- theme,
- hover/focus behavior.

Do not introduce a new visual style for candidate keys.

---

# 63. KEY CARDS

A candidate-key card may show:

```text
🔑 Candidate Key

(A, B)

Closure:
{A, B, C, D, E}

Status:
✓ Minimal Superkey

[Show Reasoning]
[Show Closure]
```

Use subtle styling.

Do not overuse cards.

---

# 64. PRIME ATTRIBUTE DISPLAY

Show something like:

```text
Prime Attributes

[A] [B] [C]

Non-Prime Attributes

[D] [E]
```

Make it readable in both themes.

---

# 65. KEY ANALYSIS TIMELINE

Use a reasoning timeline where useful:

```text
1. Identify necessary attributes
        ↓
2. Build candidate sets
        ↓
3. Compute closure
        ↓
4. Test superkey
        ↓
5. Test minimality
        ↓
6. Candidate key
```

This can later integrate with the main Normalization Journey.

---

# 66. WHAT-IF COMPATIBILITY

Do not implement What-If yet.

But the key engine must be callable repeatedly with different inputs.

This is essential because later What-If mode will modify dependencies and re-run analysis.

Avoid hidden global state.

---

# 67. REPORT COMPATIBILITY

Do not implement reports yet.

But key-analysis results should be serializable so Phase 10 can include:

- candidate keys,
- superkey checks,
- prime/non-prime attributes,
- reasoning steps.

---

# 68. ASSISTANT COMPATIBILITY

Do not implement the final assistant yet.

But make key-analysis reasoning structured enough for future deterministic question answering.

For example, future assistant should be able to access:

```text
candidateKeys
primeAttributes
nonPrimeAttributes
keyReasoning
closureResults
```

---

# 69. NO LLM

Absolutely no paid LLM integration.

All explanations in this phase are deterministic and generated from actual computed results.

---

# 70. DOCUMENTATION

Create/update:

```text
docs/candidate-key-engine.md
```

Document:

- superkey definition,
- candidate-key definition,
- algorithm,
- search strategy,
- minimality,
- prime/non-prime classification,
- complexity,
- API,
- examples,
- limitations.

Update:

```text
README.md
```

with Phase 4 completion.

Update:

```text
docs/development.md
```

as needed.

---

# 71. COMPLEXITY DOCUMENTATION

Candidate-key enumeration can be exponential in the number of attributes.

Document honestly:

- closure computation cost depends on FD count and number of attributes,
- candidate-key enumeration can require examining many attribute combinations,
- pruning reduces practical work,
- worst-case key enumeration remains exponential.

Do not claim polynomial complexity for complete enumeration.

---

# 72. CORRECTNESS PRINCIPLE

For any supported relation and FD set:

- every returned candidate key must actually be a minimal superkey,
- no returned key may be a non-minimal superkey,
- all candidate keys should be returned within the supported search limits,
- duplicates must not appear,
- prime/non-prime classification must be derived from verified candidate keys.

---

# 73. DETERMINISM

Same:

```text relation
FD set
```

must produce:

- same candidate keys,
- same prime/non-prime attributes,
- stable reasoning order.

Use deterministic ordering.

---

# 74. PHASE 4 ACCEPTANCE CRITERIA

Phase 4 is complete only when:

## Superkeys

- [ ] Superkey checking implemented.
- [ ] Closure reused from Phase 3.
- [ ] Single-attribute sets work.
- [ ] Composite sets work.
- [ ] Non-superkeys correctly rejected.

## Candidate Keys

- [ ] Automatic candidate-key discovery works.
- [ ] Multiple keys supported.
- [ ] Composite keys supported.
- [ ] Single-attribute keys supported.
- [ ] Minimality tested.
- [ ] Duplicate keys eliminated.
- [ ] Supersets of known candidate keys pruned.
- [ ] Search ordering is deterministic.
- [ ] Search limitations are explicit if reached.

## User-provided Keys

- [ ] User key can be verified.
- [ ] Valid candidate key recognized.
- [ ] Non-superkey rejected correctly.
- [ ] Superkey-but-not-minimal distinguished correctly.
- [ ] Explanation provided.

## Prime Attributes

- [ ] Derived from verified candidate keys.
- [ ] Non-prime attributes correct.
- [ ] Multiple-key union handled correctly.

## Explanation

- [ ] Key discovery steps are available.
- [ ] Closure evidence is available.
- [ ] Minimality reasoning is available.
- [ ] Explanations are dynamically generated from actual results.

## Frontend

- [ ] Key-analysis workspace exists.
- [ ] Find Candidate Keys action works.
- [ ] Verify Key action works.
- [ ] Candidate keys displayed.
- [ ] Prime/non-prime attributes displayed.
- [ ] Reasoning can be expanded.
- [ ] Closure can be inspected.
- [ ] Error/loading states work.

## API

- [ ] Key verification endpoint exists.
- [ ] Key discovery endpoint exists.
- [ ] Response models are typed.
- [ ] Errors are structured.

## Testing

- [ ] Unit tests pass.
- [ ] Candidate-key tests pass.
- [ ] Superkey tests pass.
- [ ] Prime/non-prime tests pass.
- [ ] API tests pass.
- [ ] Frontend tests pass.
- [ ] Regression tests pass.

## Browser

- [ ] Actual candidate-key discovery tested through UI.
- [ ] Actual key verification tested.
- [ ] Composite key tested.
- [ ] Multiple keys tested.
- [ ] Error case tested.
- [ ] Day/Night checked.
- [ ] No critical console errors.

---

# 75. REQUIRED TEST CASES

At minimum, implement and verify cases corresponding to:

## Case 1 — Single candidate key

```text
R(A,B,C,D)
A → B
B → C
C → D

Expected candidate key:
A
```

## Case 2 — Composite candidate key

Use a relation where two or more attributes are required.

## Case 3 — Multiple candidate keys

Use an FD set with more than one minimal superkey.

## Case 4 — User-provided superkey that is not minimal

Verify the distinction.

## Case 5 — User-provided non-superkey

Verify rejection.

## Case 6 — No FDs

Ensure the correct candidate-key behavior.

## Case 7 — Cyclic FDs

Ensure closure and key verification terminate.

## Case 8 — Redundant attributes in proposed key

Ensure minimality explanation.

---

# 76. BROWSER QA CHECKLIST

Manually verify:

1. Load a valid relation.
2. Add FDs.
3. Click Find Candidate Keys.
4. Observe loading state.
5. Verify all keys returned.
6. Open a key's reasoning.
7. Open its closure.
8. Verify prime/non-prime classification.
9. Enter a known invalid key.
10. Verify error/reason explanation.
11. Enter a superkey containing unnecessary attributes.
12. Verify "superkey but not candidate key."
13. Modify input and rerun.
14. Confirm stale key results are cleared.
15. Toggle Day/Night.
16. Resize desktop window.
17. Check console.
18. Verify backend API calls.

---

# 77. STALE-RESULT PROTECTION

This is important.

If the user changes:

- relation attributes,
- FDs,
- candidate keys,

previous calculated key results must be treated as stale.

Do not continue showing results for an old FD set as though they apply to the new input.

Display a state such as:

> Input changed — re-run key analysis.

This will become especially important in What-If mode later.

---

# 78. VERSION / FINGERPRINT

Where useful, associate calculated results with an input fingerprint/version.

Conceptually:

```text
inputVersion
analysisVersion
```

If current input differs from the one used to generate the key analysis, invalidate the displayed result.

This can be implemented simply.

Do not overengineer.

---

# 79. CANDIDATE-KEY RESULT HISTORY

Do not implement a full history system here.

Within a single session, it is acceptable to show:

```text
Current analysis
```

and overwrite it when input changes.

The full Analysis History feature belongs later.

---

# 80. INPUT BUILDER INTEGRATION

The key engine must consume the existing Phase 2 canonical input.

Do not make users re-enter the relation for candidate-key analysis.

The key workspace should use the current Analyzer input.

Possible action:

> **Analyze Current Schema**

This reads:

```text
current validated relation + FDs
```

---

# 81. NO REQUIREMENT FOR MVD IN KEY ANALYSIS

If MVDs exist in the current input, ignore them for candidate-key discovery.

Do not remove them.

Do not show an error merely because they are present.

---

# 82. EDUCATIONAL DIFFERENCE: SUPERKEY VS CANDIDATE KEY

The UI should include a quick comparison:

```text
SUPERKEY
Determines all attributes.

CANDIDATE KEY
Determines all attributes
AND is minimal.
```

This is an important learning outcome.

---

# 83. USER GUIDE COMPATIBILITY

The Help page will later explain:

> How to find candidate keys

Phase 4 should expose enough behavior to support that documentation.

Do not write the final Help page yet.

---

# 84. PHASE 4 HANDOFF TO PHASE 5

Phase 5 will implement 1NF + 2NF.

It needs:

```text
candidateKeys
primeAttributes
nonPrimeAttributes
isSuperkey()
isCandidateKey()
computeClosure()
```

Therefore, Phase 4 must expose reusable services rather than UI-only calculations.

---

# 85. PHASE 5 WILL USE PRIME ATTRIBUTES

2NF needs to know whether an attribute is prime/non-prime.

Phase 4 must make this readily accessible.

Conceptually:

```text
keyAnalysis.primeAttributes
keyAnalysis.nonPrimeAttributes
```

Do not make Phase 5 recompute this independently.

---

# 86. PHASE 6 WILL USE SUPERKEY CHECKING

3NF and 4NF later need superkey checks.

Provide a reusable:

```text
isSuperkey(attributeSet)
```

service.

Do not make Phase 6 duplicate closure logic.

---

# 87. PHASE 4 FINAL REPORT

When complete, report:

1. Files created/modified.
2. Candidate-key algorithm.
3. Superkey service.
4. Minimality strategy.
5. Prime/non-prime classification.
6. API endpoints.
7. UI changes.
8. Test cases.
9. Browser verification.
10. Complexity analysis.
11. Limitations.
12. Phase 5 handoff information.

---

# 88. IMPORTANT ANTIGRAVITY BEHAVIOR

Before coding:

1. Read:
   - `normalization_lab_master_project_reference.md`
   - `phase_1_project_foundation_prompt.md`
   - `phase_2_schema_input_builder_validation_prompt.md`
   - `phase_3_fd_engine_attribute_closure_prompt.md`
2. Inspect the actual repository.
3. Verify Phase 1–3 functionality.
4. Inspect the existing canonical input model.
5. Inspect the Phase 3 closure service.
6. Reuse it rather than creating another closure implementation.
7. Plan Phase 4 changes.

During coding:

- preserve all existing functionality,
- keep candidate-key logic independent from React,
- keep API logic thin,
- keep results structured,
- write tests alongside implementation,
- avoid unnecessary refactors.

After coding:

1. run backend tests,
2. run frontend tests,
3. run build,
4. start backend,
5. start frontend,
6. test candidate-key discovery in browser,
7. test verification,
8. test multiple keys,
9. test composite keys,
10. test stale-result behavior,
11. inspect console,
12. fix all blocking issues,
13. rerun everything.

---

# 89. FINAL QUALITY STANDARD

At the end of Phase 4, the application should be able to answer:

> "What are the candidate keys of this relation?"

and also:

> "Why are these candidate keys?"

For every result, the user should be able to inspect:

```text
Candidate set
    ↓
Closure
    ↓
Superkey?
    ↓
Minimal?
    ↓
Candidate key
```

The project should never behave as a black box.

The mathematical result must be deterministic and independently testable.

---

# 90. FINAL COMMAND

Execute **PHASE 4 ONLY**.

Implement the Candidate-Key, Superkey and Prime/Non-Prime Attribute engine using the existing Phase 3 closure engine.

Do not begin Phase 5.

Do not implement 1NF or 2NF.

Do not implement 3NF or 4NF.

Do not implement decomposition.

Do not add an LLM.

Preserve all previous phases.

Complete testing and browser verification.

Stop after Phase 4 is stable and verified.
