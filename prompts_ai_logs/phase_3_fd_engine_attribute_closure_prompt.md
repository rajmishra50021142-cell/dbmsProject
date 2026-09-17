# PHASE 3 — Functional Dependency Engine, Attribute Closure & Dependency Analysis
## 1NF–4NF Normalization Visualizer & Analyzer / "Normalization Lab"

**Purpose of this file:**  
This is the detailed execution specification for **Phase 3**.

Use this file together with:

- `normalization_lab_master_project_reference.md`
- `phase_1_project_foundation_prompt.md`
- `phase_2_schema_input_builder_validation_prompt.md`

The master reference defines the complete product vision.  
Phase 1 established the application foundation, architecture and UI system.  
Phase 2 established the user-input builder, raw/structured input modes, canonical input model and structural validation.  
Phase 3 now implements the **core Functional Dependency (FD) engine and Attribute Closure engine** that later candidate-key and normalization modules will depend on.

**Implement Phase 3 only. Do not automatically begin Phase 4.**

---

# 0. PROJECT CONTEXT

The overall application is an interactive educational tool for:

> **1NF → 2NF → 3NF → 4NF normalization**

The final product allows a user to enter:

- relation/schema,
- attributes,
- optional manually specified candidate keys,
- functional dependencies,
- multivalued dependencies,
- optional sample data.

It then performs deterministic DBMS analysis and visually explains the reasoning.

Phase 3 is the point where the application begins performing actual mathematical dependency processing.

The central objective of this phase is:

> Given a validated relational schema and a set of functional dependencies, correctly represent, normalize, analyze, and compute **attribute closures**, while preserving enough reasoning detail for future candidate-key identification, normalization checks, explanations, visualizations and reports.

---

# 1. PHASE 3 SCOPE

Phase 3 must implement:

- Functional Dependency domain model,
- FD parsing/canonicalization,
- FD comparison and normalization,
- FD-set validation at the semantic-input level,
- Attribute Closure,
- closure reasoning steps,
- ability to calculate closures for arbitrary attribute sets,
- closure API endpoints,
- frontend closure workspace,
- educational explanation of closure,
- integration with the existing Phase 2 input builder,
- comprehensive tests.

Phase 3 may also implement useful FD-set utilities that are foundational for later phases, such as:

- dependency normalization,
- duplicate/equivalent dependency detection,
- dependency lookup,
- determining whether a dependency is trivially satisfied based on syntax/set relationships,
- determining whether a set of attributes functionally determines another set by closure.

Do not implement full candidate-key enumeration yet.

Do not implement 1NF/2NF/3NF/4NF checking yet.

---

# 2. CRITICAL SCOPE BOUNDARY

Do NOT implement in this phase:

- candidate-key enumeration engine,
- final candidate-key verification,
- prime/non-prime attribute classification,
- 1NF checker,
- 2NF checker,
- 3NF checker,
- 4NF checker,
- MVD reasoning engine,
- decomposition engine,
- lossless-join verification,
- dependency-preservation analysis,
- complete normalization journey,
- final dependency graph visualization,
- final What-If engine,
- final Practice Mode,
- LLM integration,
- final report generation.

Those belong to later phases.

However, Phase 3 must expose clean services/results that make those future phases straightforward.

---

# 3. WHY PHASE 3 IS IMPORTANT

Attribute closure is the foundation for several later DBMS operations.

For a set of attributes `X`, the closure `X+` under a set of functional dependencies `F` tells us all attributes functionally determined by `X`.

It will later be used to:

- determine whether an attribute set is a superkey,
- find candidate keys,
- explain key derivation,
- evaluate normalization conditions,
- evaluate determinants,
- support dependency reasoning.

Therefore, this phase must be academically correct.

Do not create a superficial "closure calculator" that simply follows one obvious chain. It must correctly handle arbitrary valid FD sets and composite attribute sets.

---

# 4. DOMAIN MODEL

Create a robust internal representation for functional dependencies.

Conceptually:

```text
FunctionalDependency
    lhs: AttributeSet
    rhs: AttributeSet
```

Where:

```text
AttributeSet = collection of unique attribute identifiers
```

The logical behavior of an attribute set is set-based, not sequence-based.

For example:

```text
(A, B)
```

and:

```text
(B, A)
```

represent the same set for FD reasoning.

Display order may be retained for user presentation, but mathematical equality must be order-insensitive.

---

# 5. FD CANONICALIZATION

Create a canonical representation for every FD.

Examples:

```text
A -> B
```

becomes conceptually:

```text
lhs = {"A"}
rhs = {"B"}
```

and:

```text
B,A -> D,C
```

becomes a mathematically equivalent normalized representation based on set membership.

The canonicalizer must:

- trim whitespace,
- remove duplicate attributes,
- normalize attribute representation,
- normalize arrow syntax,
- treat attribute order as irrelevant for mathematical comparison,
- retain readable display order where useful.

---

# 6. FUNCTIONAL DEPENDENCY PARSING

Phase 2 structured input should already produce structured dependencies.

Phase 3 must support the normalized internal representation and may provide a reusable parser utility for textual FD forms.

Support syntax such as:

```text
A -> B
```

```text
A,B -> C
```

```text
A -> B,C
```

```text
(A,B) -> (C,D)
```

where the selected raw-input convention allows these forms.

Do not confuse a multi-attribute LHS with a single attribute named `A,B`.

The canonical parser must understand the application's documented syntax.

---

# 7. FD VALIDATION AT THIS PHASE

Phase 2 already performs structural validation.

Phase 3 may add semantic FD validation where appropriate.

Ensure:

- LHS is non-empty,
- RHS is non-empty,
- all attributes belong to the relation,
- no duplicate attribute within a side,
- no exact/equivalent duplicate FD,
- relation context is available.

Do not introduce normalization-level decisions such as:

> "This dependency causes a 3NF violation."

That belongs later.

---

# 8. FUNCTIONAL DEPENDENCY EQUALITY

Implement reliable equality.

These should be treated as equivalent:

```text
A,B -> C
B,A -> C
```

Likewise:

```text
A -> B,C
A -> C,B
```

Do not treat them as distinct solely because of ordering.

Equivalent duplicates should not create multiple logical dependencies.

---

# 9. FUNCTIONAL DEPENDENCY SET

Represent a set of FDs cleanly.

It should support operations conceptually such as:

```text
add(fd)
remove(fd)
contains(fd)
findDependenciesWithLHS(attributes)
findDependenciesDeterminedByClosure(...)
```

Avoid duplicating the same dependency in multiple places.

The FD set will become the source of truth for later closure/key/normalization services.

---

# 10. ATTRIBUTE SET UTILITIES

Create reusable set operations.

At minimum:

- union,
- difference,
- intersection,
- subset,
- proper subset,
- equality,
- membership,
- empty-set check.

These should be clean reusable utilities because later 2NF/3NF/4NF logic will depend heavily on them.

Do not duplicate set logic inside each algorithm.

---

# 11. ATTRIBUTE CLOSURE

Implement the standard attribute-closure algorithm.

Given:

```text
X
```

and functional dependencies:

```text
F
```

compute:

```text
X+
```

The basic logic is:

```text
closure = X

repeat:
    for each FD Y -> Z in F:
        if Y ⊆ closure:
            closure = closure ∪ Z

until closure stops changing
```

The implementation must terminate when a fixed point is reached.

Do not assume dependencies appear in a convenient order.

---

# 12. CLOSURE MUST HANDLE ARBITRARY FD ORDER

Example:

```text
B -> C
A -> B
C -> D
```

Input:

```text
A
```

must still produce:

```text
A+ = {A,B,C,D}
```

The engine must not depend on the FDs being topologically ordered.

---

# 13. CLOSURE MUST HANDLE MULTI-ATTRIBUTE LHS

Example:

```text
A,B -> C
C -> D
```

For:

```text
A+
```

the engine must NOT incorrectly apply `A,B -> C` until B is also present.

For:

```text
A,B+
```

the dependency can fire.

This must be tested explicitly.

---

# 14. CLOSURE MUST HANDLE MULTI-ATTRIBUTE RHS

Example:

```text
A -> B,C
```

The implementation should add both `B` and `C` when the dependency applies.

It may internally decompose RHS attributes for processing, but the public representation can preserve the original dependency.

---

# 15. CLOSURE WITH EXISTING ATTRIBUTES

If:

```text
X = {A,B,C}
```

the starting closure must contain all of:

```text
A,B,C
```

even if no dependency applies.

This is a fundamental property and must be tested.

---

# 16. CLOSURE WITH NO APPLICABLE DEPENDENCIES

Example:

```text
FDs:
C -> D

Input:
A
```

Result:

```text
A+ = {A}
```

The engine must correctly report that no additional attributes can be derived.

---

# 17. CLOSURE WITH CYCLIC DEPENDENCIES

Handle cycles safely.

Example:

```text
A -> B
B -> C
C -> A
```

Starting:

```text
A
```

should terminate with:

```text
A+ = {A,B,C}
```

The implementation must never enter an infinite loop.

---

# 18. EMPTY / INVALID ATTRIBUTE CLOSURE INPUT

Define appropriate behavior.

If the relation or FD context is missing, return a structured validation error rather than crashing.

For empty closure input:

```text
{}
```

do not silently invent semantics.

Use the documented project behavior and make the API response explicit.

If later mathematical treatment of empty determinants is supported, the core engine should be capable of representing it, but the user-facing UI should not allow invalid inputs accidentally.

---

# 19. CLOSURE REASONING STEPS

This is one of the most important requirements.

Do not return only:

```text
A+ = {A,B,C,D}
```

The engine must preserve the reasoning process.

Conceptual result:

```text
Initial closure:
{A}

Apply:
A -> B

Closure becomes:
{A,B}

Apply:
B -> C

Closure becomes:
{A,B,C}

Apply:
C -> D

Closure becomes:
{A,B,C,D}

Fixed point reached.
```

The implementation should return structured steps, not only strings.

---

# 20. STRUCTURED CLOSURE RESULT

Design a result object similar to:

```text
ClosureResult
    inputAttributes
    closureAttributes
    steps[]
    iterations
    appliedDependencies[]
    fixedPointReached
```

Each step could conceptually contain:

```text
stepNumber
before
dependency
reason
addedAttributes
after
```

For example:

```text
Step 1
before:
[A]

dependency:
A -> B

added:
[B]

after:
[A,B]
```

This will later power:

- visualization,
- explanation,
- candidate-key derivation,
- reports,
- contextual assistant.

---

# 21. WHY A DEPENDENCY APPLIED

Each closure step should be explainable.

For:

```text
A,B -> C
```

the step can say:

> The dependency `A,B → C` can be applied because all attributes on its left-hand side (`A` and `B`) are already present in the current closure.

This explanation should be generated from the actual data.

Do not hardcode one example.

---

# 22. WHY A DEPENDENCY DID NOT APPLY

For educational purposes, expose enough information to optionally explain skipped dependencies.

Example:

```text
A,B -> C

Current closure:
{A}

Missing determinant attributes:
{B}

Dependency cannot yet be applied.
```

Do not necessarily show every skipped dependency in the default compact UI because that can become noisy.

But the engine should be capable of exposing this information if requested.

---

# 23. CLOSURE TRACE MODEL

Preserve deterministic ordering for reasoning display.

Even though the mathematics does not depend on dependency order, the UI should present a stable trace.

Use a deterministic strategy such as:

- original user dependency order after canonicalization,
- or a clearly documented normalized order.

This ensures the same input produces a stable explanation and makes testing easier.

---

# 24. ATTRIBUTE CLOSURE API

Create an endpoint such as:

```text
POST /api/v1/closure
```

or another clean versioned route consistent with the existing API architecture.

Request should conceptually include:

```text
relation
attributes
functionalDependencies
targetAttributes
```

Example:

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
    },
    {
      "lhs": ["B"],
      "rhs": ["C"]
    },
    {
      "lhs": ["C"],
      "rhs": ["D"]
    }
  ],
  "targetAttributes": ["A"]
}
```

Response:

```text
valid
inputAttributes
closureAttributes
steps
```

Use typed Pydantic models.

---

# 25. API VALIDATION

The endpoint must reject:

- unknown target attributes,
- unknown FD attributes,
- empty relation attributes,
- malformed dependency structures,
- missing required fields.

Use structured errors.

Do not return raw stack traces.

---

# 26. FRONTEND CLOSURE WORKSPACE

Phase 3 should add the first real algorithmic workspace to the application.

A suitable experience:

```text
ATTRIBUTE CLOSURE LAB

Select attributes:
[A] [B] [C] [D]

Functional Dependencies:
A → B
B → C
C → D

[Calculate Closure]

Result:
A+ = {A, B, C, D}
```

Then below:

```text
Reasoning

Step 1
Start with {A}

Step 2
A → B
Add B

Step 3
B → C
Add C

Step 4
C → D
Add D

Fixed point:
{A,B,C,D}
```

Do not overwhelm the primary Analyzer with an entirely separate visual page if the product architecture is better served by a dedicated Closure Lab route.

A dedicated `/closure` route is acceptable and may be desirable.

---

# 27. CLOSURE VISUALIZATION FOUNDATION

This phase should implement a clear educational representation.

For example:

```text
A
│
├── A → B
│
▼
A, B
│
├── B → C
│
▼
A, B, C
│
├── C → D
│
▼
A, B, C, D
```

Keep it visually coherent with the Phase 1 design system.

This is the first step toward the full Attribute Closure Visualizer creative feature planned for a later phase, but Phase 3 should already provide the genuine underlying data and basic interactive representation.

Do not build the full final animation system yet if it would mix responsibilities with Phase 8.

---

# 28. INPUT BUILDER INTEGRATION

Reuse the Phase 2 components and state.

Do not create a duplicate relation/FD editor solely for closure.

The user should be able to:

1. create input in Analyzer,
2. use the same FD set in Closure Lab,
3. calculate a closure.

Where technically appropriate, provide:

> **Use Current Schema**

This should transfer the canonical input.

---

# 29. TARGET ATTRIBUTE SELECTION

Allow the user to choose one or more attributes as the closure starting set.

Example:

```text
Calculate closure of:
[A, B]
```

The UI should clearly distinguish:

> Starting attributes

from:

> Result closure.

Do not call the output a "candidate key" even if the closure happens to contain all relation attributes. That belongs to Phase 4.

Instead say:

> `A,B+` contains all relation attributes.

---

# 30. SUPERKEY PREVIEW — CAREFUL

If the closure contains all relation attributes, Phase 3 may optionally expose a generic mathematical fact:

> "The selected attribute set functionally determines all attributes in the relation."

This is useful because it is mathematically implied by the closure.

However, do NOT label it:

> "Candidate Key"

because minimality verification belongs to Phase 4.

The correct distinction is:

```text
Closure contains all attributes
        ↓
Selected set is a superkey
```

Candidate-key status additionally requires minimality.

If implementing this preview, explain this distinction explicitly.

---

# 31. FD IMPROVEMENT UTILITIES

Implement utilities that later phases can consume.

Potential utilities:

### Determination check

Determine whether:

```text
X → Y
```

is implied by the supplied FD set using closure:

```text
Y ⊆ X+
```

Return:

```text
determined: true/false
closure: ...
reasoningSteps: ...
```

This is a foundational operation.

---

# 32. FD DETERMINATION CHECK

Create a useful operation:

```text
Does X determine Y?
```

Example:

```text
FDs:
A → B
B → C

Question:
Does A → C?
```

Engine computes:

```text
A+ = {A,B,C}
```

Therefore:

```text
Yes, A functionally determines C under F.
```

Do not call this a "new user-entered FD" unless explicitly requested.

This is an analytical query.

---

# 33. TRIVIAL FD CHECK

Implement a utility to identify whether an FD is syntactically trivial:

```text
X → Y
```

is trivial if:

```text
Y ⊆ X
```

Examples:

```text
A,B → A
```

is trivial.

This does not require normalization checking and is useful for later explanation.

Return structured information:

```text
isTrivial
reason
```

---

# 34. FD REDUNDANCY / CANONICAL COVER — SCOPE CONTROL

Do not implement a complete minimal/canonical-cover engine unless it is cleanly justified and does not compromise this phase.

A canonical cover is useful later, but it is not necessary to complete the foundational closure engine.

You may add small foundational helpers that are useful later, but:

> **Do not let canonical-cover work consume Phase 3.**

If the architecture includes a placeholder/service boundary for future minimal-cover functionality, that is sufficient.

---

# 35. FD DECOMPOSITION OF RHS — INTERNAL OPTION

It may be useful internally to decompose:

```text
A → B,C
```

into:

```text
A → B
A → C
```

for algorithmic processing.

If you use this approach:

- preserve the original user-facing FD,
- mark derived/split dependencies internally,
- avoid confusing the user with duplicate-looking dependencies,
- document the behavior.

Do not modify the user's original input merely because the engine uses a decomposed representation internally.

---

# 36. FUNCTIONAL DEPENDENCY CLOSURE

Do not confuse:

### Attribute closure

```text
X+
```

with:

### Functional-dependency closure

```text
F+
```

Phase 3's mandatory focus is **attribute closure**.

You may establish naming/architecture that later supports FD-set closure, but do not pretend to implement a complete `F+` enumerator unless explicitly required.

Document this distinction.

---

# 37. CACHING

For typical classroom-sized schemas, performance should already be fast without sophisticated caching.

Optional:

- cache identical closure requests for the same FD-set/input.

If adding caching:

- invalidate correctly when FDs change,
- do not use stale results,
- include input identity/version in cache key.

Do not overengineer.

---

# 38. FRONTEND UX FOR CLOSURE

The closure UI should answer:

1. What attributes did I start with?
2. What dependencies are available?
3. Which dependencies applied?
4. What attributes were added?
5. What is the final closure?
6. Does the closure contain all relation attributes?
7. What does that mean?

Use progressive disclosure.

Default:

```text
A+ = {A,B,C,D}
```

Expandable:

> Show reasoning

Then show the step-by-step calculation.

---

# 39. "WHY?" FOR CLOSURE

Provide a deterministic explanation.

Example:

> We started with `{A}`. The dependency `A → B` applies because `A` is in the current closure, so `B` is added. Then `B → C` applies, followed by `C → D`. No additional dependency can add a new attribute, so the closure reaches a fixed point at `{A,B,C,D}`.

This must be generated from actual trace data.

No LLM required.

---

# 40. ERROR AND EMPTY STATES

Closure Lab should handle:

### No relation

> Define a relation before calculating a closure.

### No FD

> No functional dependencies are currently defined. The closure is limited to the starting attributes.

### No starting attributes

> Select at least one starting attribute.

### Invalid FD

> Fix invalid dependencies before calculating the closure.

### Backend unavailable

Show the standard application error state.

---

# 41. UI INTEGRATION WITH CURRENT DESIGN

Use the Phase 1 design system.

Do not redesign the entire application.

The Closure Lab should feel native to Normalization Lab.

Use:

- existing nav,
- existing theme system,
- existing panel primitives,
- existing typography,
- existing status styles,
- existing interaction conventions.

---

# 42. VISUAL DISTINCTION OF INPUT VS DERIVED ATTRIBUTES

In the closure visualization:

Starting attributes should be visually distinct from newly derived attributes.

Example:

```text
Starting:
A

Derived:
B
C
D
```

Do not make color the only distinction.

Use labels/icons/borders/position.

---

# 43. DEPENDENCY HIGHLIGHTING

When a dependency is used in a closure step:

```text
A → B
```

highlight it.

Also highlight:

- determinant attributes,
- newly derived attributes.

This begins establishing the interaction model needed for the later dependency graph.

---

# 44. STEP NAVIGATION

Allow the user to move through closure reasoning.

Conceptually:

```text
[Previous] [Next]
```

or a vertical timeline.

At each step show:

```text
Current closure
Dependency applied
Attributes added
Reason
```

This is educationally important.

---

# 45. NO RANDOM ANIMATION

Use animation only to clarify the derivation.

Good:

```text
A
↓
A,B
↓
A,B,C
↓
A,B,C,D
```

Avoid decorative motion unrelated to the algorithm.

---

# 46. BACKEND SERVICE DESIGN

Create a clean service boundary.

Conceptually:

```text
FD Parser
FD Canonicalizer
AttributeSet utilities
ClosureService
FDAnalysisService
```

Routes call application services.

Routes should not contain algorithm loops.

---

# 47. ERROR CODES

Use stable machine-readable codes where appropriate.

Examples:

```text
INVALID_ATTRIBUTE_SET
UNKNOWN_ATTRIBUTE
EMPTY_RELATION
EMPTY_DEPENDENCY
INVALID_FD
DUPLICATE_FD
INVALID_CLOSURE_INPUT
```

The exact naming can follow project conventions.

Frontend should map these to useful user-facing messages.

---

# 48. TESTING — VERY IMPORTANT

This is an algorithmic phase and requires a substantial test suite.

## Unit tests: Attribute sets

Test:

- union,
- intersection,
- difference,
- subset,
- proper subset,
- equality,
- duplicate removal.

## Unit tests: FDs

Test:

- parse,
- canonicalization,
- equality,
- duplicate detection,
- multi-attribute LHS,
- multi-attribute RHS.

## Unit tests: Closure

Test:

### Basic chain

```text
A → B
B → C
C → D
```

`A+` should include all.

### Reverse-order dependencies

```text
B → C
A → B
C → D
```

`A+` should still include all.

### Composite determinant

```text
A,B → C
```

`A+` must not contain C without B.

### Composite starting set

```text
A,B+
```

must allow the dependency.

### Multiple RHS

```text
A → B,C
```

### Independent dependencies

```text
A → B
C → D
```

`A+` should not include C/D.

### Cycle

```text
A → B
B → C
C → A
```

### No FD applies

### All-attribute closure

### Large but reasonable FD set.

---

# 49. DETERMINATION TESTS

Test:

```text
A → B
B → C

Does A → C?
Yes
```

and:

```text
A → B
C → D

Does A → D?
No
```

Return closure evidence.

---

# 50. TRIVIAL FD TESTS

Test:

```text
A,B → A
```

=> trivial.

```text
A → B
```

=> non-trivial.

Also test composite RHS.

---

# 51. API TESTS

Test:

- valid closure request,
- missing relation,
- unknown attribute,
- malformed dependency,
- empty target,
- multiple target attributes,
- backend response schema.

---

# 52. FRONTEND TESTS

Test:

- closure workspace renders,
- starting attributes can be selected,
- Calculate Closure works,
- result renders,
- reasoning steps render,
- Previous/Next works if implemented,
- invalid input displays clear messages,
- theme works,
- current-schema loading works if implemented.

---

# 53. REGRESSION TESTS

After Phase 3:

Verify Phase 1 and Phase 2 still work.

Especially:

- relation editor,
- attributes,
- keys,
- FD builder,
- MVD builder,
- sample data,
- raw/structured modes,
- validation,
- example loader,
- local draft if implemented,
- navigation,
- theme.

Do not break Phase 2 while integrating Phase 3.

---

# 54. BROWSER VERIFICATION

Manually inspect the running application.

Perform this sequence:

1. Open Analyzer.
2. Load or create a relation.
3. Define attributes.
4. Add FDs.
5. Open Closure Lab or closure functionality.
6. Select starting attributes.
7. Calculate closure.
8. Verify result.
9. Expand reasoning.
10. Navigate reasoning steps.
11. Test invalid inputs.
12. Toggle Day/Night.
13. Return to Analyzer.
14. Confirm existing input remains intact.
15. Test backend unavailable state if practical.

---

# 55. EXAMPLE CLOSURE CASES TO INCLUDE

At least these examples should be available in test data.

## Example A

```text
R(A,B,C,D)

FDs:
A → B
B → C
C → D

Closure:
A+ = {A,B,C,D}
```

## Example B

```text
R(A,B,C,D)

FDs:
A,B → C
C → D

Closure of A:
{A}

Closure of A,B:
{A,B,C,D}
```

## Example C — Cycle

```text
A → B
B → C
C → A
```

## Example D — Independent components

```text
A → B
C → D
```

## Example E — Multiple RHS

```text
A → B,C
C → D
```

These cases should be used for automated tests as well as educational demonstrations.

---

# 56. EDUCATIONAL CONTENT IN PHASE 3

Do not write the entire Learn page yet.

However, the Closure Lab should have concise contextual help such as:

> **What is Attribute Closure?**

> The closure of a set of attributes is the set of all attributes that can be functionally determined from that set using the given functional dependencies.

Then:

> **Why does it matter?**

> Attribute closure is used to determine superkeys and supports candidate-key identification and other normalization tasks.

Keep it concise and link/reference the future complete Learn section where appropriate.

---

# 57. NO CANDIDATE-KEY ALGORITHM YET

The user previously requested that the engine should eventually help identify candidate keys and explain the steps.

Phase 3 should provide the underlying closure capability.

Do NOT implement the full candidate-key search in this phase.

Instead, ensure the API makes it easy for Phase 4 to call:

```text
closureEngine.compute(X, F)
```

for many attribute sets.

Phase 4 will build candidate-key logic on top of this.

---

# 58. FUTURE CANDIDATE-KEY COMPATIBILITY

The closure service should be reusable by Phase 4.

Phase 4 will need to ask:

> Does X+ contain all relation attributes?

and:

> Is X minimal?

Therefore, the closure function should be:

- deterministic,
- side-effect free,
- efficient,
- independently testable,
- reusable.

Avoid tying it to UI state.

---

# 59. NO MVD LOGIC

MVDs exist in the Phase 2 input model because they are required later for 4NF.

Phase 3 is specifically FD-focused.

Do not implement:

- MVD closure,
- 4NF MVD logic,
- MVD decomposition.

Preserve MVD input untouched for later phases.

---

# 60. NO NORMAL-FORM CHECKING

Do not display:

```text
2NF ✓
3NF ✗
```

from Phase 3.

Closure itself is not a normal-form check.

The Phase 5/6 engines will consume closure/dependency services later.

---

# 61. PERFORMANCE

For normal classroom-sized relations:

- closure calculation should be effectively instantaneous,
- UI should not freeze,
- multiple closure calculations should remain responsive.

Do not prematurely implement complex distributed computation.

---

# 62. DOCUMENTATION

Create/update:

```text
docs/functional-dependency-engine.md
```

Document:

- FD model,
- canonical representation,
- closure algorithm,
- correctness reasoning,
- complexity,
- API,
- test coverage,
- distinction between attribute closure and FD closure,
- relationship to future candidate-key analysis.

Update:

```text
README.md
```

with Phase 3 status.

Update:

```text
docs/development.md
```

with any new commands.

---

# 63. ALGORITHM COMPLEXITY DOCUMENTATION

Document the closure algorithm's practical complexity.

For a straightforward implementation:

- Let `|F|` be number of functional dependencies.
- Let `|R|` be number of relation attributes.
- Closure grows monotonically and can add at most `|R|` attributes.
- A repeated-scan implementation may require multiple passes over `F`.

The exact implementation complexity should be documented based on the final algorithm actually used.

Do not invent a complexity claim unrelated to the implementation.

---

# 64. CORRECTNESS PRINCIPLE

The closure engine must be deterministic.

Same:

```text
Relation
FD set
Starting attribute set
```

must produce the same closure set.

The reasoning trace must also be stable enough for testing and reproducibility.

---

# 65. SET SEMANTICS PRINCIPLE

The engine must treat attributes mathematically as sets.

For example:

```text
A,B
```

and:

```text
B,A
```

are equivalent as a determinant set.

Never rely on lexical ordering or user entry order to determine mathematical meaning.

---

# 66. UI COPY PRINCIPLE

Use academic terms correctly.

Prefer:

- Attribute Closure
- Functional Dependency
- Determinant
- Closure
- Derived Attributes
- Superkey preview

Avoid vague terms such as:

- Magic result,
- AI key finder,
- smart guess.

The educational value depends on precise terminology.

---

# 67. NO FAKE "AI"

Phase 3 must not pretend closure calculation is AI.

It is deterministic database theory implemented in code.

Any assistant-like explanation must come from the actual computed result.

No external AI is required.

---

# 68. PHASE 3 API / DATA FLOW

Expected conceptual flow:

```text
Phase 2 Canonical AnalysisInput
          ↓
FD Service
          ↓
Closure Service
          ↓
ClosureResult
          ↓
Frontend
          ↓
Closure Visualization
          ↓
Educational Explanation
```

Later:

```text
Closure Service
       ↓
Candidate-Key Engine
       ↓
1NF/2NF/3NF/4NF Engines
```

---

# 69. NO UNNECESSARY REWRITES

When integrating Phase 3:

- reuse Phase 1 design system,
- reuse Phase 2 input model,
- reuse existing validation infrastructure,
- reuse API patterns,
- reuse existing routes/layouts,
- do not rebuild the Analyzer from scratch.

Modify only what is necessary.

---

# 70. PHASE 3 ACCEPTANCE CRITERIA

Phase 3 is complete only when:

## Functional Dependency Engine

- [ ] FD internal model exists.
- [ ] FD canonicalization works.
- [ ] FD equality is order-insensitive.
- [ ] Duplicate/equivalent FDs detected.
- [ ] Multi-attribute LHS works.
- [ ] Multi-attribute RHS works.
- [ ] Attribute references are validated.
- [ ] Attribute-set utilities exist.

## Attribute Closure

- [ ] arbitrary starting attribute set supported.
- [ ] closure algorithm correctly reaches fixed point.
- [ ] FD order does not affect correctness.
- [ ] composite determinants work.
- [ ] composite starting sets work.
- [ ] multiple RHS works.
- [ ] cyclic dependencies terminate.
- [ ] no-applicable-dependency case works.
- [ ] empty/invalid input is handled.
- [ ] complete reasoning trace is returned.
- [ ] applied dependency is recorded.
- [ ] attributes added at each step are recorded.

## Dependency Determination

- [ ] `X → Y` implication can be checked through closure.
- [ ] result includes closure evidence.

## Trivial FD

- [ ] trivial/non-trivial check works.

## API

- [ ] closure endpoint works.
- [ ] typed request/response models exist.
- [ ] structured validation errors exist.

## Frontend

- [ ] Closure Lab/workspace exists.
- [ ] starting attributes can be selected.
- [ ] closure result displayed.
- [ ] reasoning can be expanded/viewed.
- [ ] applied dependencies are visible.
- [ ] input can be reused from existing Analyzer data.
- [ ] theme works.
- [ ] error states work.

## Testing

- [ ] unit tests pass.
- [ ] API tests pass.
- [ ] frontend tests pass.
- [ ] browser verification completed.
- [ ] Phase 1 regression checks pass.
- [ ] Phase 2 regression checks pass.

## Documentation

- [ ] FD engine documented.
- [ ] closure algorithm documented.
- [ ] API documented.
- [ ] test cases documented.
- [ ] complexity documented.

---

# 71. BROWSER DEMONSTRATION SCENARIO

Use this as a minimum live demonstration:

```text
Relation:
R(A,B,C,D)

FDs:
A → B
B → C
C → D
```

Select:

```text
A
```

Click:

```text
Calculate Closure
```

The application should show:

```text
A+ = {A,B,C,D}
```

Then:

```text
Step 1:
Start {A}

Step 2:
Apply A → B
→ {A,B}

Step 3:
Apply B → C
→ {A,B,C}

Step 4:
Apply C → D
→ {A,B,C,D}

Fixed point reached.
```

If the application displays the superkey preview:

> Since `A+` contains all relation attributes, `A` is a superkey of `R`.

Do NOT call A a candidate key yet.

---

# 72. PHASE 3 REPORT

At completion, report:

1. Files created/changed.
2. FD domain model.
3. Canonicalization approach.
4. Attribute-set utilities.
5. Closure algorithm.
6. Closure reasoning model.
7. Determination utility.
8. Trivial FD utility.
9. API routes.
10. Frontend Closure Lab.
11. Tests.
12. Browser verification.
13. Complexity.
14. Known limitations.
15. What is intentionally deferred to Phase 4.

---

# 73. PHASE 4 HANDOFF

The final output of Phase 3 must make Phase 4 easy.

Phase 4 will need:

```text
getAllAttributes()
getFunctionalDependencies()
computeClosure(attributeSet)
doesDetermine(X,Y)
```

and possibly:

```text
isSuperkey(attributeSet)
```

if implemented as a generic utility.

Do not make Phase 4 reimplement closure.

The closure engine is the foundation.

---

# 74. IMPORTANT ANTIGRAVITY INSTRUCTIONS

Before implementation:

1. Read:
   - `normalization_lab_master_project_reference.md`
   - `phase_1_project_foundation_prompt.md`
   - `phase_2_schema_input_builder_validation_prompt.md`
2. Inspect the existing repository.
3. Verify Phase 1 and Phase 2 are present.
4. Understand the existing canonical input model.
5. Plan Phase 3 changes.

During implementation:

- preserve Phase 1/2 features,
- do not duplicate data models,
- do not move core algorithms into React,
- keep algorithms independently testable,
- maintain API contracts,
- write tests as you implement.

After implementation:

1. run backend tests,
2. run frontend tests,
3. run build,
4. start backend,
5. start frontend,
6. test closure through the actual UI,
7. inspect browser console,
8. verify invalid-input behavior,
9. fix all blocking issues,
10. rerun tests.

---

# 75. FINAL COMMAND

Execute **PHASE 3 ONLY**.

Implement the Functional Dependency and Attribute Closure foundation exactly as specified.

Do not start Phase 4 automatically.

Do not implement the candidate-key engine.

Do not implement normal-form checking.

Do not implement decomposition.

Do not integrate a paid LLM.

Preserve all earlier functionality.

Complete tests and browser verification.

Stop after Phase 3 is stable and verified.
