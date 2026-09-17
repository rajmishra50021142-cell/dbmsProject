# PHASE 2 — Schema/Input Builder & Comprehensive Input Validation
## 1NF–4NF Normalization Visualizer & Analyzer / "Normalization Lab"

**Purpose of this file:**  
This is the detailed execution specification for **Phase 2**.

Use this file together with:

- `normalization_lab_master_project_reference.md`
- `phase_1_project_foundation_prompt.md`

The master reference defines the complete project vision.  
Phase 1 established the architecture, project shell, design system, routing, frontend/backend foundation, and testing foundation.  
This phase now implements the **complete user-input workspace and validation layer** that later normalization algorithms will consume.

---

# 0. PHASE POSITION

Project sequence:

```text
PHASE 1
Foundation / Architecture / UI System
        ↓
PHASE 2  ← CURRENT PHASE
Schema / Input Builder / Validation
        ↓
PHASE 3
Functional Dependency Engine + Attribute Closure
        ↓
PHASE 4
Candidate-Key Engine
        ↓
PHASE 5
1NF + 2NF
        ↓
PHASE 6
3NF + 4NF
        ↓
PHASE 7
Decomposition + Verification
        ↓
PHASE 8
Visualization
        ↓
PHASE 9
Creative Features + Contextual Assistant
        ↓
PHASE 10
Mandatory Website Content + Download
        ↓
PHASE 11
Testing
        ↓
PHASE 12
Deployment + Final Polish
```

**Implement Phase 2 only.**

Do not automatically begin Phase 3.

---

# 1. OBJECTIVE OF PHASE 2

Build a complete, polished, user-friendly **Normalization Problem Input Workspace**.

A user must be able to create their own normalization problem by providing:

- relation name,
- attributes,
- zero or more candidate keys,
- zero or more functional dependencies,
- zero or more multivalued dependencies,
- optional sample data.

The system must support both:

1. **Guided / Structured Input Mode**
2. **Raw / Advanced Input Mode**

The input layer must validate the user's data carefully on both:

- frontend,
- backend.

The result of this phase should be a **clean, validated, canonical analysis-input object** that Phase 3+ can consume.

---

# 2. CRITICAL SCOPE

Phase 2 is about:

> **collecting, structuring, parsing, and validating normalization input**

It is NOT about:

- calculating attribute closures,
- finding candidate keys automatically,
- determining 1NF,
- determining 2NF,
- determining 3NF,
- determining 4NF,
- performing decomposition,
- verifying lossless join,
- verifying dependency preservation,
- generating normalization graphs,
- generating final explanations based on normalization results,
- implementing What-If analysis,
- implementing Practice Mode,
- implementing a real LLM,
- generating reports.

Those belong to later phases.

---

# 3. IMPORTANT ARCHITECTURAL RULE

The input builder must not contain mathematical normalization logic.

Its responsibility is:

```text
User Input
    ↓
Parse
    ↓
Validate
    ↓
Normalize Input Representation
    ↓
Return Structured AnalysisInput
```

Later:

```text
AnalysisInput
    ↓
Phase 3/4/5/6 Engines
    ↓
Normalization Results
```

The frontend and backend must agree on a stable data contract.

---

# 4. EXPECTED END-USER EXPERIENCE

A user should be able to open Analyzer and think:

> "I can build my normalization problem here without needing to know the application's internal representation."

The user should not need to understand JSON.

The user should see:

```text
Relation
Attributes
Candidate Keys
Functional Dependencies
Multivalued Dependencies
Sample Data
```

with clear controls.

They should be able to:

- add,
- edit,
- delete,
- reorder where useful,
- duplicate where useful,
- clear/reset,
- load example,
- switch input modes,
- validate,
- save draft locally if appropriate.

---

# 5. DESKTOP-FIRST ANALYZER WORKSPACE

Use the Phase 1 shell.

The main Analyzer page should now become a real interactive input workspace.

Recommended conceptual layout:

```text
┌─────────────────────────────────────────────────────────────────────────┐
│ Navigation                                                              │
├──────────────────────┬────────────────────────────────┬─────────────────┤
│ INPUT WORKSPACE      │ CURRENT SCHEMA PREVIEW        │ VALIDATION       │
│                      │                                │ / HELP          │
│ Relation             │ R(A, B, C, D...)               │ Status           │
│ [____________]       │                                │                 │
│                      │ Candidate Keys                 │ Errors          │
│ Attributes           │                                │ Warnings         │
│ [ ... ]              │ Dependencies                  │                 │
│                      │                                │                 │
│ Candidate Keys       │ Sample Data                   │                 │
│ [ ... ]              │                                │                 │
│                      │                                │                 │
│ FDs                  │                                │                 │
│ [ ... ]              │                                │                 │
│                      │                                │                 │
│ MVDs                 │                                │                 │
│ [ ... ]              │                                │                 │
│                      │                                │                 │
│ Sample Data          │                                │                 │
│ [ ... ]              │                                │                 │
│                      │                                │                 │
│ [Analyze Later]      │                                │                 │
└──────────────────────┴────────────────────────────────┴─────────────────┘
```

Do not imitate this exact wireframe rigidly; preserve the visual system from Phase 1.

---

# 6. INPUT MODES

Implement two modes.

## 6.1 Structured / Guided Mode

This is the default for beginners.

The user interacts with explicit controls.

Example:

```text
Relation Name
[ ENROLLMENT ]

Attributes
[ StudentID      ] [delete]
[ CourseID       ] [delete]
[ StudentName    ] [delete]
[ CourseName     ] [delete]
[ Grade          ] [delete]

+ Add Attribute
```

Then:

```text
Candidate Keys
[ StudentID, CourseID ] [delete]

+ Add Candidate Key
```

FD builder:

```text
[ StudentID ]  →  [ StudentName ]
```

MVD builder:

```text
[ Student ]  →→  [ Hobby ]
```

Sample-data table:

```text
StudentID | CourseID | ...
--------------------------------
          |          |
          |          |

+ Add Row
```

The UI should make invalid combinations difficult to create.

---

# 7. RAW / ADVANCED MODE

Provide an advanced option for users comfortable with DBMS notation.

Example:

```text
Relation:
ENROLLMENT(StudentID, CourseID, StudentName, CourseName, Grade)

Candidate Keys:
(StudentID, CourseID)

FDs:
StudentID -> StudentName
CourseID -> CourseName
(StudentID, CourseID) -> Grade

MVDs:
None
```

The parser should convert this into the same internal data structure used by Structured Mode.

Important:

> Structured Mode and Raw Mode must produce the same canonical input representation.

Do not create two unrelated processing paths.

---

# 8. MODE SWITCHING

Allow the user to switch between:

```text
Guided Mode
Advanced Mode
```

The current input should not be silently lost.

If conversion is lossy or some raw syntax cannot be represented in structured form, explain what happens before discarding anything.

Prefer preserving data whenever possible.

---

# 9. RELATION NAME INPUT

Required field.

Example:

```text
ENROLLMENT
```

Validation:

- required,
- trim leading/trailing whitespace,
- should not be empty,
- avoid obviously invalid characters depending on the chosen naming convention,
- prevent meaningless whitespace-only names.

Provide clear messages.

Example:

> Please enter a relation name.

Do not over-restrict names unnecessarily.

---

# 10. ATTRIBUTE BUILDER

Implement a dynamic attribute list.

Each attribute should support:

- add,
- edit,
- delete.

Potential structure:

```text
[Attribute Name] [Remove]
```

Add button:

```text
+ Add Attribute
```

Important validation:

### Empty attribute

Reject.

### Duplicate attribute

Reject or clearly ask the user to rename.

Example:

```text
StudentID
StudentID
```

Error:

> Duplicate attribute `StudentID`. Attribute names must be unique within a relation.

### Whitespace

Normalize surrounding whitespace.

### Reserved/internal conflicts

Avoid creating attribute names that conflict with the application's internal representation if the architecture has such conflicts.

Do not impose unnecessarily restrictive SQL naming rules unless the application explicitly documents them.

---

# 11. ATTRIBUTE ORDER

Preserve the user's attribute order.

This is important for:

- schema display,
- raw input,
- reports,
- visual consistency.

Later algorithms may treat attributes as sets, but the UI should preserve an intentional display order.

---

# 12. CANDIDATE KEY INPUT

The user may manually provide one or more candidate keys.

Example:

```text
Candidate Key 1:
(StudentID, CourseID)

Candidate Key 2:
EnrollmentID
```

Provide:

```text
+ Add Candidate Key
```

Each candidate key is an ordered list for display purposes, but logically represents a set.

Validation must ensure:

- at least one attribute exists in a manually specified key,
- every key attribute exists in relation attributes,
- no duplicate attribute within a key,
- empty key is rejected,
- duplicate candidate keys are detected.

Important:

The system should NOT decide whether a user-provided key is mathematically a true candidate key yet. That verification belongs to Phase 4.

Instead, Phase 2 validates the **syntax and membership**:

> "This key references existing attributes."

Later Phase 4 determines whether it is truly a candidate key.

Provide a clear UI distinction:

> **User-provided candidate key (not yet verified)**

rather than falsely labeling it verified.

---

# 13. ALLOW ZERO MANUAL CANDIDATE KEYS

The user may choose not to provide any key.

The application should support:

```text
Candidate Keys:
Not provided

[Find automatically later]
```

Do not block the user merely because candidate keys are missing.

Later Phase 4 will provide automatic identification.

---

# 14. MULTIPLE CANDIDATE KEYS

Support as many candidate keys as reasonable.

Example:

```text
Key 1:
(A, B)

Key 2:
(C, D)
```

Do not assume there is exactly one candidate key.

This is important for later 2NF/3NF reasoning.

---

# 15. FUNCTIONAL DEPENDENCY BUILDER

Build a dedicated structured FD editor.

Conceptual UI:

```text
Functional Dependencies

LHS                     RHS
┌───────────────┐       ┌───────────────┐
│ StudentID     │  →    │ StudentName   │
└───────────────┘       └───────────────┘

[Edit] [Delete]

+ Add Functional Dependency
```

Both sides must allow **multiple attributes**.

Example:

```text
(StudentID, CourseID) → Grade
```

The UI should make this easy to build.

Potential mechanism:

```text
Left:
[ Select attribute ] [Select attribute]

Right:
[ Select attribute ] [Select attribute]
```

Or another polished multi-select interaction.

---

# 16. FUNCTIONAL DEPENDENCY VALIDATION

Phase 2 should validate:

- LHS exists,
- RHS exists,
- all referenced attributes belong to relation,
- LHS is not empty,
- RHS is not empty,
- no duplicate attribute within one side,
- no exact duplicate dependency,
- no impossible/invalid references.

Example:

```text
StudentID → Salary
```

when Salary does not exist:

> `Salary` is not an attribute of relation `ENROLLMENT`.

Do not attempt full FD implication/redundancy/minimal-cover analysis in Phase 2.

---

# 17. MULTI-ATTRIBUTE FDs

Support:

```text
(A, B) → C
```

and:

```text
A → (B, C)
```

The internal representation should store:

```text
lhs: ["A", "B"]
rhs: ["C"]
```

and:

```text
lhs: ["A"]
rhs: ["B", "C"]
```

This will be important for Phase 3.

---

# 18. DUPLICATE FD HANDLING

If the user enters:

```text
A → B
A → B
```

detect the duplicate.

Do not silently create two identical dependencies.

Provide a clear UI response.

---

# 19. FD NORMALIZATION

Internally, normalize equivalent input forms.

For example, whitespace differences should not create separate logical dependencies:

```text
A -> B
A→B
 A  ->  B
```

The parser should normalize formatting.

Do not incorrectly treat:

```text
A,B
```

as a string attribute if it means two attributes in the chosen input syntax.

---

# 20. MULTIVALUED DEPENDENCY BUILDER

Build a separate MVD editor.

Example:

```text
Multivalued Dependencies

LHS                     RHS
Student                 Hobby
   │                     │
   └──────────── →→ ─────┘
```

Allow multiple MVDs.

Support multiple attributes on either side.

Example:

```text
(A, B) →→ (C, D)
```

---

# 21. MVD VALIDATION

Validate:

- LHS not empty,
- RHS not empty,
- referenced attributes exist,
- no duplicate within a side,
- no exact duplicate MVD.

Do not yet decide whether an MVD is trivial/non-trivial based on full relation semantics; that belongs to the 4NF engine later.

Do not yet determine whether LHS is a superkey.

---

# 22. SAMPLE DATA EDITOR

Sample data is optional.

Provide:

```text
Sample Data (Optional)
```

If no sample data exists:

> No sample data provided. Dependency-based analysis can still be performed.

Allow:

- add row,
- remove row,
- edit cell.

Columns should correspond to the current relation attributes.

---

# 23. SAMPLE DATA SYNCHRONIZATION

When an attribute is added:

- add a corresponding column.

When an attribute is removed:

- remove or clearly handle its sample-data column.

If an attribute is renamed:

- update the corresponding column.

Do not silently lose user data.

If destructive change is possible, consider a confirmation or undo mechanism.

---

# 24. SAMPLE DATA VALIDATION

Check:

- number of cells corresponds to attributes,
- no unknown columns,
- row shape consistency,
- optionally flag obviously blank values,
- do not impose a false "all values must be atomic" decision here unless the user has chosen the relevant mode.

Important:

Do not force 1NF conclusions in Phase 2.

Phase 5 will evaluate 1NF.

The input layer should collect the data without prematurely applying normalization rules.

---

# 25. SAMPLE DATA AND ATOMICITY

The UI may allow a cell to contain:

```text
DBMS, OS, CN
```

because the point may be to demonstrate a 1NF violation later.

Do not automatically reject multi-valued-looking text at the input stage.

Instead, preserve it and let the future 1NF analyzer interpret it.

This is a critical distinction:

> Validation of input structure ≠ normalization analysis.

---

# 26. EXAMPLE LOADER

Provide a polished:

**Load Example**

control.

It should offer several prepared examples, at least conceptually:

1. 1NF-related example,
2. 2NF partial-dependency example,
3. 3NF transitive-dependency example,
4. 4NF MVD example,
5. already-normalized example.

At this phase, examples only need to populate the input workspace.

Do not hardcode final normalization results into the UI.

The later analysis engine will process the same loaded input as arbitrary user data.

---

# 27. EXAMPLE SELECTOR UI

A polished selector could show:

```text
Try an Example

1NF
Non-atomic values

2NF
Partial dependency

3NF
Transitive dependency

4NF
Multivalued dependency

Fully Normalized
Valid 1NF–4NF example
```

The descriptions should be short.

Do not claim the relation's final status through fake analysis; the example description can indicate the intended learning topic.

---

# 28. RESET / CLEAR FUNCTIONALITY

Provide:

### Reset

Reset the entire current problem.

Before clearing meaningful data, consider confirmation:

> Clear current schema?

Options:

- Cancel
- Clear

### Clear individual section

Allow clearing a specific collection where useful:

- Clear FDs
- Clear MVDs
- Clear sample data.

Do not make reset accidentally destroy work.

---

# 29. LOCAL DRAFT PERSISTENCE

A useful Phase 2 enhancement is to preserve the current draft locally.

Use browser/local persistence for:

- relation name,
- attributes,
- manual candidate keys,
- FDs,
- MVDs,
- sample data,
- current input mode.

This is not the final History system.

It only prevents accidental loss while working.

Provide a subtle indicator such as:

> Saved locally

Do not require login.

---

# 30. IMPORT/EXPORT OF INPUT

If practical in this phase, create a simple internal JSON import/export format for the **input definition**.

This is optional within Phase 2, but the architecture should support it.

Example conceptual structure:

```json
{
  "relation": {
    "name": "ENROLLMENT",
    "attributes": ["StudentID", "CourseID", "StudentName"]
  },
  "candidateKeys": [
    ["StudentID", "CourseID"]
  ],
  "functionalDependencies": [
    {
      "lhs": ["StudentID"],
      "rhs": ["StudentName"]
    }
  ],
  "multivaluedDependencies": [],
  "sampleData": []
}
```

This is not the final report format.

If implementing import/export now would slow the core phase significantly, prepare architecture but defer the UI feature.

---

# 31. CANONICAL INPUT MODEL

All input modes must result in one canonical model.

Conceptually:

```text
AnalysisInput
├── relation
│   ├── name
│   └── attributes[]
│
├── candidateKeys[]
│
├── functionalDependencies[]
│   ├── lhs[]
│   └── rhs[]
│
├── multivaluedDependencies[]
│   ├── lhs[]
│   └── rhs[]
│
└── sampleData[]
```

Add metadata if architecturally useful:

```text
sourceMode
validationWarnings
```

But do not put UI-only data into the core mathematical model unless necessary.

---

# 32. FRONTEND AND BACKEND VALIDATION

Validation must exist on both sides.

## Frontend

Purpose:

- immediate feedback,
- better UX,
- prevent obviously invalid requests.

## Backend

Purpose:

- authoritative validation,
- safe API contract,
- prevent malformed input from reaching future algorithms.

Never rely only on frontend validation.

---

# 33. VALIDATION LAYERS

Use layered validation.

## Layer 1 — Field validation

Examples:

- required relation name,
- attribute names,
- empty fields.

## Layer 2 — Cross-field validation

Examples:

- FD references an existing attribute,
- candidate key attributes belong to relation,
- sample data matches attribute list.

## Layer 3 — Cross-collection validation

Examples:

- duplicate attribute,
- duplicate FD,
- duplicate MVD,
- duplicate key.

## Layer 4 — Mathematical validation

Do NOT implement in Phase 2.

Phase 3/4/5/6 will handle:

- key validity,
- FD closure,
- MVD properties,
- normal-form correctness.

---

# 34. VALIDATION MESSAGE STYLE

Messages should be specific and educational.

Bad:

> Invalid input.

Good:

> `Salary` is not part of the current relation. Add `Salary` as an attribute or remove it from this dependency.

Bad:

> Error 400.

Good:

> Candidate Key 2 contains `DepartmentID`, but `DepartmentID` is not currently an attribute of the relation.

The application should show messages next to the relevant input when possible.

---

# 35. VALIDATION SUMMARY PANEL

Create a summary area such as:

```text
Input Status

✓ Relation defined
✓ 8 attributes
✓ 2 candidate keys provided
✓ 5 functional dependencies
✓ 2 multivalued dependencies
✓ Sample data: 8 rows

Ready for analysis
```

or:

```text
Input Status

⚠ 2 issues need attention

• FD 3 references unknown attribute `Salary`
• Candidate Key 2 is empty
```

Do not say "Ready for analysis" if blocking errors exist.

---

# 36. WARNINGS VS ERRORS

Distinguish:

## Error

Blocks analysis.

Examples:

- empty relation name,
- no attributes,
- FD references unknown attribute,
- malformed raw input.

## Warning

May not block input.

Examples:

- no candidate key supplied,
- no sample data supplied,
- manually supplied candidate key has not yet been mathematically verified.

This distinction is important.

---

# 37. ANALYZE BUTTON IN PHASE 2

The final normalization analysis does not exist yet.

Therefore, Phase 2 should not claim that "Analyze" produces 1NF–4NF results.

Instead, the button may be:

**Validate & Continue**

or:

**Validate Input**

This phase should produce a clean validated input state.

Prepare the UI/API contract so later Phase 3+ can replace/extend the action with:

**Analyze Relation**

without rewriting the entire input workspace.

---

# 38. INPUT PREVIEW

Create a live schema preview.

Example:

```text
ENROLLMENT
────────────────────────
StudentID
CourseID
StudentName
CourseName
Grade
```

Or compact notation:

```text
ENROLLMENT(
  StudentID,
  CourseID,
  StudentName,
  CourseName,
  Grade
)
```

This preview should update immediately as the user edits attributes.

Do not infer keys/dependencies yet.

---

# 39. DEPENDENCY PREVIEW

Also show a compact preview:

```text
Functional Dependencies
────────────────────────
StudentID → StudentName
CourseID → CourseName
(StudentID, CourseID) → Grade
```

MVDs:

```text
Student →→ Hobby
Student →→ Language
```

This becomes useful later for visualization.

---

# 40. STRUCTURED INPUT UX

Make structured input feel approachable.

Prefer:

- explicit labels,
- examples in placeholders,
- contextual helper text,
- clear Add buttons,
- inline validation,
- compact editable rows.

Avoid:

- giant textareas for everything,
- confusing nested forms,
- excessive modal dialogs,
- small click targets.

---

# 41. RAW INPUT UX

For advanced users:

Use a clear editor.

Provide syntax hint:

```text
R(A,B,C,D)

FD:
A -> B
B -> C

MVD:
A ->> D
```

Show:

> Use `->` for functional dependencies and `->>` for multivalued dependencies.

Provide:

**Parse Input**

Then show:

```text
Parsed successfully
```

or precise errors.

Do not send raw text directly to future normalization algorithms.

Always parse into the canonical representation first.

---

# 42. RAW PARSER ERRORS

Errors should identify:

- line,
- section,
- token where possible,
- expected format.

Example:

> Line 4: `A ->` is incomplete. Add at least one right-hand-side attribute.

Example:

> Line 6: `A ->>> B` is not recognized. Use `A -> B` for FD or `A ->> B` for MVD.

Make parser errors actionable.

---

# 43. ATTRIBUTE SELECTION UX

For structured FD/MVD/key editors, use a multi-select mechanism that clearly shows selected attributes.

Example:

```text
Left side:
[ StudentID × ] [ CourseID × ] [ + ]

Right side:
[ Grade × ] [ + ]
```

Do not make users type attribute names repeatedly if avoidable.

This prevents spelling errors.

---

# 44. INPUT DESIGN FOR COMPOSITE KEYS

Composite keys should be visually obvious.

Example:

```text
🔑 Candidate Key

StudentID · CourseID
```

Do not display a composite key as two unrelated entries.

---

# 45. USER EXPERIENCE WHEN NO KEY IS PROVIDED

Show helpful guidance:

```text
No candidate key provided.

That's okay.

The system can identify candidate keys in a later analysis step
using the functional dependencies you provide.

[Learn how candidate keys work]
```

The "Learn" action may route to the Learn page later.

Do not attempt the actual key calculation in Phase 2.

---

# 46. USER EXPERIENCE WHEN NO FDs ARE PROVIDED

Allow it.

Show:

> No functional dependencies defined.

Do not automatically reject the relation unless the next phase requires them.

The user may be entering a simple 1NF case or preparing input.

---

# 47. USER EXPERIENCE WHEN NO MVDs ARE PROVIDED

Allow it.

Display:

> No multivalued dependencies defined.

Do not require MVDs for all relations.

---

# 48. USER EXPERIENCE WHEN NO SAMPLE DATA EXISTS

Allow it.

Display:

> Sample data is optional. It is useful for demonstrating data-level behavior such as 1NF.

This reinforces the project's educational purpose without blocking the user.

---

# 49. INPUT HELP / MICROCOPY

Use short helper text.

Examples:

### Attributes

> Define every attribute in the relation.

### Candidate Keys

> Add known candidate keys. The system can also identify them later.

### Functional Dependencies

> Define what attributes determine other attributes.

### MVDs

> Use multivalued dependencies for 4NF analysis.

### Sample Data

> Optional. Useful for demonstrating atomicity and tuple-level examples.

Avoid long paragraphs inside forms.

---

# 50. DATA MODELING RULES

The canonical backend representation should use arrays/sets appropriately.

Important principles:

- logical attribute membership behaves like a set,
- display order may be preserved separately,
- duplicate logical attributes are invalid,
- dependency sides should not contain duplicates,
- exact duplicate dependencies are invalid/redundant input,
- comparison should be order-insensitive logically where appropriate.

For example:

```text
A,B → C
B,A → C
```

represent the same determinant set logically.

The UI may preserve user-entered order, but validation should detect that they are equivalent.

Do not implement full FD implication in this phase.

---

# 51. RELATION / ATTRIBUTE CANONICALIZATION

Create reusable helper functions for:

- trimming,
- consistent comparison,
- deduplication,
- ordering where needed,
- canonical equality.

This will prevent duplicated parsing/validation logic later.

---

# 52. API CONTRACT

Create a Phase 2 API endpoint for validating/parsing an input definition.

Suggested conceptual endpoint:

```text
POST /api/v1/analysis-input/validate
```

Request:

```json
{
  "relation": {
    "name": "ENROLLMENT",
    "attributes": [
      "StudentID",
      "CourseID",
      "StudentName",
      "CourseName",
      "Grade"
    ]
  },
  "candidateKeys": [
    ["StudentID", "CourseID"]
  ],
  "functionalDependencies": [
    {
      "lhs": ["StudentID"],
      "rhs": ["StudentName"]
    }
  ],
  "multivaluedDependencies": [],
  "sampleData": []
}
```

Response should conceptually contain:

```text
valid
errors[]
warnings[]
canonicalInput
```

Do not put normalization results in this response.

---

# 53. API ERROR STRUCTURE

Use structured errors.

Conceptually:

```json
{
  "valid": false,
  "errors": [
    {
      "code": "UNKNOWN_ATTRIBUTE",
      "path": "functionalDependencies[0].rhs",
      "message": "Salary is not an attribute of the relation."
    }
  ],
  "warnings": []
}
```

This will be useful for precise frontend feedback.

---

# 54. FRONTEND STATE

The Analyzer input state should be separated into:

```text
draftInput
validationState
uiState
```

Do not mix API errors into the raw schema itself.

Conceptually:

```text
draftInput:
  relation
  candidateKeys
  FDs
  MVDs
  sampleData

validationState:
  isValid
  errors
  warnings

uiState:
  mode
  expandedSections
  selectedExample
  dirtyState
```

This will make later analysis integration cleaner.

---

# 55. SAVE / DIRTY STATE

If local draft persistence is implemented:

Track whether current changes have been saved locally.

Example:

```text
● Unsaved changes
```

or:

```text
✓ Saved locally
```

This is a UX enhancement, not a normalization requirement.

---

# 56. ACCESSIBILITY REQUIREMENTS

Inputs must have:

- labels,
- keyboard access,
- focus states,
- accessible error messages,
- useful button names,
- semantic grouping.

Multi-select controls must be keyboard navigable.

Errors should be associated with their fields.

Do not rely solely on color.

---

# 57. DESIGN / VISUAL QUALITY

Preserve the Phase 1 visual identity.

The input builder should feel like part of the same product.

Use:

- warm neutral background,
- restrained surfaces,
- one deliberate accent,
- clear typography,
- subtle borders,
- purposeful hover states,
- smooth microinteractions.

Avoid:

- generic form-dashboard aesthetic,
- excessive card nesting,
- huge gradients,
- neon UI,
- glassmorphism overload.

The input workspace should be visually interesting because of **interaction and information design**, not decoration.

---

# 58. INPUT ROW INTERACTION

When hovering a dependency row:

- highlight the row,
- show edit/delete affordances,
- maintain clear keyboard/focus behavior.

When selecting attributes:

- use subtle selection state,
- show selected count where useful,
- avoid accidental selection.

When deleting an item:

- update previews immediately.

Use animations sparingly.

---

# 59. LIVE SCHEMA PREVIEW

As the user edits attributes:

```text
R(A, B, C)
```

should update immediately.

If an attribute is removed, dependent UI items that reference it should be marked invalid rather than silently disappearing.

Example:

> `CourseID` was removed from the relation. Dependency FD-2 references it.

This is important for preserving user intent.

---

# 60. DEPENDENCY INVALIDATION UX

Suppose user has:

```text
A → B
```

Then deletes B.

Do NOT silently delete the FD.

Mark it:

```text
⚠ Invalid dependency

B is no longer an attribute of the relation.

[Edit] [Remove]
```

This is a much safer UX.

Same principle for:

- candidate keys,
- MVDs,
- sample-data columns.

---

# 61. EXAMPLE DATA SEPARATION

Store example definitions in configuration/data files rather than scattered throughout components.

Conceptually:

```text
examples/
  first_nf_example
  second_nf_example
  third_nf_example
  fourth_nf_example
  normalized_example
```

They should all use the same canonical input model.

This is important for later automated testing.

---

# 62. SAMPLE EXAMPLE DATA

Prepare examples along these lines:

### Example 1: 1NF

A relation/sample containing a multi-valued-looking cell.

### Example 2: 2NF

Composite key with partial dependencies.

### Example 3: 3NF

Transitive dependency.

### Example 4: 4NF

MVDs.

### Example 5: normalized

A clean valid example.

Do not hardcode final analysis results into the example definition.

---

# 63. NO MATHEMATICAL NORMALIZATION IN INPUT VALIDATION

Do not let Phase 2 "guess" that:

```text
A → B
```

means the relation is or is not in some normal form.

Do not calculate:

- closure,
- keys,
- 2NF,
- 3NF,
- 4NF.

The input layer only prepares valid input.

This separation is mandatory.

---

# 64. PHASE 2 DATABASE CONSIDERATION

Do not create a large history schema just for Phase 2.

The input may optionally be persisted locally.

If backend persistence is necessary for drafts, keep it simple and compatible with the Phase 1 SQLite foundation.

Prefer browser-local draft saving unless a clear requirement for server persistence exists.

---

# 65. PHASE 2 SECURITY

Validate all incoming API data server-side.

Do not assume the frontend is trustworthy.

Never execute user-entered strings as SQL.

Do not store secrets.

Do not add authentication.

---

# 66. TESTING REQUIREMENTS

This phase needs substantial validation testing.

## Frontend tests

Test:

- add attribute,
- edit attribute,
- delete attribute,
- duplicate attribute detection,
- add key,
- multiple keys,
- add FD,
- multiple FD,
- multi-attribute FD,
- add MVD,
- sample-data row management,
- switching modes,
- reset,
- example loading,
- local draft if implemented,
- validation feedback.

## Backend tests

Test:

- valid input accepted,
- duplicate attributes rejected,
- invalid key references rejected,
- invalid FD references rejected,
- invalid MVD references rejected,
- duplicate FD detected,
- duplicate MVD detected,
- malformed request rejected,
- structured input canonicalized correctly.

## Raw parser tests

Test:

- valid relation,
- valid FD syntax,
- valid MVD syntax,
- composite attributes,
- malformed arrow,
- missing RHS,
- missing LHS,
- unknown attribute,
- invalid section.

---

# 67. EDGE CASES

Test:

### Relation

- empty name,
- one attribute,
- many attributes,
- duplicate attribute names,
- whitespace around names.

### Keys

- no keys,
- one key,
- multiple keys,
- composite key,
- duplicate key,
- empty key,
- unknown attribute key.

### FDs

- no FDs,
- one FD,
- multiple FDs,
- composite LHS,
- composite RHS,
- duplicate FD,
- unknown attribute,
- empty LHS,
- empty RHS.

### MVDs

- no MVD,
- one MVD,
- multiple MVDs,
- composite LHS,
- composite RHS,
- duplicate MVD,
- unknown attribute,
- malformed syntax.

### Sample Data

- zero rows,
- one row,
- multiple rows,
- missing cells,
- extra cells,
- attribute rename,
- attribute deletion with existing data.

---

# 68. PERFORMANCE

Input handling should feel immediate.

The UI should not freeze when adding many attributes/dependencies.

Validation should be responsive for normal classroom-sized inputs.

Do not over-optimize prematurely.

---

# 69. USER-FRIENDLY EMPTY STATES

For every section:

### Candidate keys

> No candidate keys added yet.

Button:

> + Add Candidate Key

### FDs

> No functional dependencies defined yet.

### MVDs

> No multivalued dependencies defined yet.

### Sample data

> Sample data is optional.

Empty states should teach what the section is for.

---

# 70. RESET CONFIRMATION

If the user has meaningful data:

```text
Clear current schema?

All current input will be removed from this draft.

Cancel | Clear
```

Do not confirm trivial actions unnecessarily.

---

# 71. ANALYZER "READY" STATE

When all structural validation passes, display something like:

```text
✓ Input is structurally valid

Relation:
ENROLLMENT

Attributes:
5

Candidate keys supplied:
1

FDs:
3

MVDs:
0

Sample rows:
5

Ready for normalization analysis.
```

Important:

"Ready for normalization analysis" is a valid preparation state. It does not claim that Phase 2 already performed the normalization.

---

# 72. FUTURE-PHASE HANDOFF

The canonical validated input produced here will eventually be consumed by:

## Phase 3

FD engine / closure.

## Phase 4

Candidate-key engine.

## Phase 5

1NF/2NF.

## Phase 6

3NF/4NF.

Therefore, the Phase 2 input model must be stable and well documented.

---

# 73. DOCUMENTATION

Update documentation for Phase 2.

Create/update:

```text
docs/input-model.md
```

Document:

- canonical input schema,
- structured mode,
- raw mode,
- validation rules,
- API contract,
- example format.

Update:

```text
README.md
```

with Phase 2 status.

Update:

```text
docs/development.md
```

with any new development commands.

---

# 74. PHASE 2 ACCEPTANCE CRITERIA

Phase 2 is complete only when all of the following work.

## Relation

- [ ] relation name can be added/edited.
- [ ] relation name is validated.
- [ ] attributes can be added/edited/deleted.
- [ ] duplicate attributes are handled.

## Candidate Keys

- [ ] user can provide zero or more keys.
- [ ] multiple keys supported.
- [ ] composite keys supported.
- [ ] key references validated.
- [ ] keys are not falsely marked mathematically valid yet.

## Functional Dependencies

- [ ] users can add multiple FDs.
- [ ] multiple attributes on LHS supported.
- [ ] multiple attributes on RHS supported.
- [ ] unknown attributes rejected.
- [ ] duplicates detected.
- [ ] malformed input handled.

## MVDs

- [ ] users can add multiple MVDs.
- [ ] composite sides supported.
- [ ] unknown attributes rejected.
- [ ] duplicates detected.
- [ ] malformed input handled.

## Sample Data

- [ ] optional.
- [ ] rows can be added/deleted.
- [ ] cells can be edited.
- [ ] columns follow attributes.
- [ ] changes to attributes are handled safely.
- [ ] no premature 1NF conclusion is made.

## Modes

- [ ] structured mode works.
- [ ] raw mode works.
- [ ] raw parser produces the canonical model.
- [ ] switching modes preserves input as far as possible.

## Validation

- [ ] frontend validation.
- [ ] backend validation.
- [ ] field validation.
- [ ] cross-field validation.
- [ ] cross-collection validation.
- [ ] structured error messages.
- [ ] warning vs error distinction.

## UX

- [ ] polished desktop layout.
- [ ] accessible controls.
- [ ] hover states.
- [ ] focus states.
- [ ] empty states.
- [ ] clear reset behavior.
- [ ] example loader.

## Architecture

- [ ] canonical input model exists.
- [ ] frontend/backend contracts are documented.
- [ ] validation is separate from future normalization algorithms.
- [ ] no normalization mathematics has been prematurely implemented.

## Testing

- [ ] frontend tests pass.
- [ ] backend tests pass.
- [ ] parser tests pass.
- [ ] edge cases tested.
- [ ] no blocking console errors.

---

# 75. BROWSER VERIFICATION

After implementation:

1. Start backend.
2. Start frontend.
3. Open Analyzer.
4. Add a relation.
5. Add several attributes.
6. Add a composite key.
7. Add multiple FDs.
8. Add at least one MVD.
9. Add sample rows.
10. Delete/rename an attribute and observe invalidation handling.
11. Load an example.
12. Switch Structured ↔ Advanced mode.
13. Enter malformed raw input.
14. Verify actionable errors.
15. Reset.
16. Toggle Day/Night.
17. Verify the UI remains readable.
18. Resize desktop window to narrower widths.
19. Inspect browser console.
20. Verify backend validation endpoint.

Do not mark Phase 2 complete merely because tests pass. Inspect the actual interface.

---

# 76. QUALITY BAR FOR RAW MODE

Raw mode should feel like a legitimate advanced tool, not an afterthought.

It should provide:

- syntax hints,
- examples,
- readable editor,
- parse action,
- error location,
- successful parse feedback,
- representation preview.

The user should understand how the text was interpreted.

---

# 77. QUALITY BAR FOR STRUCTURED MODE

Structured mode should be the recommended beginner experience.

It should be:

- obvious,
- forgiving,
- compact,
- educational,
- efficient.

Avoid forcing the user to memorize notation.

---

# 78. QUALITY BAR FOR FORMS

Forms should not become giant pages.

Use collapsible sections if useful:

```text
Relation
Attributes
Candidate Keys
Functional Dependencies
Multivalued Dependencies
Sample Data
```

Sections may show counts:

```text
Functional Dependencies (3)
```

This improves orientation.

---

# 79. SECTION STATUS

A useful pattern:

```text
Attributes
✓ 5 defined

Candidate Keys
1 provided
⚠ not mathematically verified yet

Functional Dependencies
✓ 3 structurally valid

Multivalued Dependencies
✓ 2 structurally valid

Sample Data
5 rows
```

This communicates state without overwhelming the user.

---

# 80. PREVIEW VS ANALYSIS

At this phase, clearly distinguish:

### Input preview

What the user entered.

### Analysis

What the DBMS engine determines.

For example:

```text
Input:
Candidate Key = (A,B)
```

is not equivalent to:

```text
Engine verified:
(A,B) is a candidate key.
```

The second statement belongs to Phase 4.

Do not confuse the two.

---

# 81. NO HARDCODED ANALYSIS RESULTS

Example loader may be named:

> 2NF Partial Dependency Example

but the system should not show a hardcoded:

> 2NF = false

during Phase 2.

It only loads:

- relation,
- attributes,
- key,
- FDs,
- sample data.

Later engines determine the result.

---

# 82. NO LLM

Do not add:

- LLM APIs,
- API key forms,
- AI chat integration,
- external AI dependency.

The contextual assistant later will work without a paid LLM.

---

# 83. NO AUTHENTICATION

Do not add:

- login,
- signup,
- accounts,
- password storage.

This was intentionally excluded from the project scope.

---

# 84. NO PREMATURE PRACTICE MODE

Do not implement Practice Mode in Phase 2.

It is optional and belongs later.

---

# 85. NO PREMATURE REPORT GENERATION

Do not implement PDF/DOCX/TXT generation in Phase 2.

The input model should merely be designed so later report generation can consume it.

---

# 86. CODE QUALITY

Follow Phase 1 coding standards:

- strict TypeScript,
- minimal `any`,
- clean component boundaries,
- clean API abstraction,
- typed request/response models,
- Python type hints,
- thin route handlers,
- service-based validation,
- reusable helpers,
- meaningful names,
- no duplicate validation logic.

---

# 87. IMPORTANT: DO NOT DUPLICATE PARSING LOGIC

The raw parser should have one authoritative implementation.

Do not implement separate parsing behavior in:

- frontend,
- backend,
- example loader.

The frontend may provide lightweight syntax feedback, but the backend parser/validator should be authoritative.

---

# 88. IMPORTANT: DO NOT DUPLICATE CANONICALIZATION LOGIC

Create reusable canonicalization utilities so:

- structured input,
- raw input,
- example input

all become the same internal model.

---

# 89. IMPORTANT: PREPARE FOR LATER VISUALIZATION

Even though Phase 2 does not implement the dependency graph, the canonical model should retain enough information for Phase 8 to visualize:

```text
A → B
A,B → C
A →→ D
```

Do not flatten all dependencies into display strings only.

Keep structured attributes.

---

# 90. IMPORTANT: PREPARE FOR LATER EXPLANATIONS

The validation system should provide metadata such as:

```text
error code
field path
message
severity
```

This later allows the explanation/assistant layer to contextualize validation messages.

---

# 91. OPTIONAL LOCAL DRAFT STORAGE

If implementing local draft saving:

- use a versioned local-storage key,
- handle parsing failures safely,
- recover gracefully,
- don't block the app if local storage contains corrupted data,
- provide reset.

Do not make local persistence required for basic operation.

---

# 92. FINAL PHASE 2 REPORT

When the work is complete, report:

1. Files created/changed.
2. Components created.
3. API endpoints created.
4. Canonical input model.
5. Validation rules implemented.
6. Structured mode behavior.
7. Raw mode/parser behavior.
8. Sample-data behavior.
9. Example loader.
10. Local draft behavior if implemented.
11. Tests run.
12. Browser verification.
13. Known issues.
14. What is intentionally deferred to Phase 3.

Do not claim normalization calculations have been implemented.

---

# 93. FINAL COMMAND

Execute **PHASE 2 ONLY**.

Read:

- `normalization_lab_master_project_reference.md`
- `phase_1_project_foundation_prompt.md`

Inspect the existing implementation before modifying it.

Build the complete Schema/Input Builder and Validation layer described in this document.

Preserve all Phase 1 functionality.

Test thoroughly.

Inspect the application in the browser.

Fix issues.

Do not start Phase 3 automatically.

Stop after Phase 2 is verified.
