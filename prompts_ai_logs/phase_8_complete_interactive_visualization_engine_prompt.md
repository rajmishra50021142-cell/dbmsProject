# PHASE 8 — Complete Interactive Visualization Engine & Normalization Journey
## 1NF–4NF Normalization Visualizer & Analyzer / "Normalization Lab"

**This is the detailed execution specification for Phase 8.**

Use this file together with:

- `normalization_lab_master_project_reference.md`
- `phase_1_project_foundation_prompt.md`
- `phase_2_schema_input_builder_validation_prompt.md`
- `phase_3_fd_engine_attribute_closure_prompt.md`
- `phase_4_candidate_key_engine_prompt.md`
- `phase_5_1nf_2nf_normalization_engine_prompt.md`
- `phase_6_3nf_4nf_analysis_engine_prompt.md`
- `phase_7_decomposition_lossless_dependency_preservation_prompt.md`

The master reference defines the complete product vision.

Phases 1–7 have already established:

- project foundation,
- UI/design system,
- schema/input builder,
- validation,
- functional-dependency engine,
- attribute closure,
- candidate-key/superkey engine,
- prime/non-prime attributes,
- 1NF analysis,
- 2NF analysis,
- 3NF analysis,
- 4NF analysis,
- decomposition,
- lossless-join verification,
- dependency preservation,
- structured reasoning,
- decomposition lineage.

Phase 8 now turns those algorithmic results into the **full interactive visual learning experience**.

The goal is not merely to add graphs. The goal is to make the reasoning behind normalization **visible, understandable, interactive and educational**.

**Implement Phase 8 only. Do not automatically start Phase 9.**

---

# 0. WHERE PHASE 8 FITS

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
PHASE 7
Decomposition + Lossless Join + Dependency Preservation
        ↓
PHASE 8  ← CURRENT
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

Build the complete visualization system for the normalization application.

The visualizer must communicate:

- the original relational schema,
- candidate keys,
- prime/non-prime attributes,
- functional dependencies,
- multivalued dependencies,
- attribute closure,
- normal-form progression,
- violations,
- reasoning steps,
- decomposition,
- verification results,
- normalized schemas,
- lineage between original and resulting relations.

The user should be able to **see why the analyzer reached its conclusion**.

The visualizer must use the actual structured results from Phases 3–7.

It must never invent or hardcode analysis results.

---

# 2. CRITICAL PRODUCT PHILOSOPHY

The visualizer is not decoration.

It is part of the educational function of the application.

The design principle is:

> **Make hidden database-theory reasoning visible.**

For example, if the system says:

```text
2NF ✗
```

the visualizer should help the student understand:

```text
Candidate Key:
(StudentID, CourseID)

           ┌─────────────┐
           │ Candidate   │
           │    Key      │
           │ StudentID   │
           │ CourseID    │
           └──────┬──────┘
                  │
          StudentID ⊂ Key
                  │
                  ▼
        StudentID → StudentName
                  │
                  ▼
        Partial Dependency
                  │
                  ▼
             2NF Violation
```

The visual explanation must come from actual analysis data.

---

# 3. SCOPE OF PHASE 8

## Implement

- normalization journey,
- interactive stage navigation,
- schema visualization,
- dependency graph,
- FD visualization,
- MVD visualization,
- candidate-key visualization,
- prime/non-prime visualization,
- attribute closure visualization,
- reasoning timeline,
- violation highlighting,
- decomposition visualization,
- before/after comparison,
- verification visualization,
- relation lineage/decomposition tree,
- synchronized highlighting between panels,
- interactive tooltips,
- zoom/pan where appropriate,
- focus/highlight behavior,
- accessible visualization legends,
- responsive desktop-first visualization layout.

## Do NOT implement

Do not implement:

- new normalization algorithms,
- new key algorithms,
- new decomposition algorithms,
- new verification algorithms,
- full What-If Mode,
- final contextual chatbot/assistant,
- Practice Mode,
- final Learn content,
- final Help content,
- final PDF/DOCX/TXT report generation,
- production deployment.

Phase 8 visualizes existing results.

Do not move business logic into the frontend merely to make visualization easier.

---

# 4. REUSE EXISTING ANALYSIS DATA

The visualizer must consume structured outputs from existing engines.

Important sources:

## Phase 3

- FD data,
- closure results,
- closure steps,
- determination results.

## Phase 4

- candidate keys,
- superkeys,
- prime attributes,
- non-prime attributes,
- key reasoning.

## Phase 5

- 1NF result,
- 2NF result,
- partial dependencies,
- reasoning,
- decomposition proposals.

## Phase 6

- 3NF result,
- 4NF result,
- violating FDs,
- violating MVDs,
- reasoning,
- decomposition proposals.

## Phase 7

- decomposition lineage,
- before/after relations,
- projected dependencies,
- lossless-join verification,
- dependency-preservation verification,
- verification reasoning.

Do not duplicate any of this logic.

---

# 5. VISUALIZATION DATA CONTRACT

Create or formalize a frontend-friendly visualization model.

Conceptually:

```text
VisualizationState
    analysisSnapshot
    currentStage
    selectedDependency
    selectedAttribute
    selectedRelation
    selectedReasoningStep
    viewportState
```

The actual analysis data should remain separate.

Do not mutate backend analysis results for UI selection.

---

# 6. VISUALIZATION LAYERS

The application should conceptually have multiple visualization layers:

```text
Layer 1
Schema

Layer 2
Keys / Attribute classification

Layer 3
Dependencies

Layer 4
Normal-form stage

Layer 5
Violation / reasoning

Layer 6
Decomposition

Layer 7
Verification
```

The user can focus on the relevant layer.

Do not show all layers at full complexity simultaneously.

---

# 7. MAIN NORMALIZATION JOURNEY

This should be the primary visual component.

Display:

```text
INPUT ──→ 1NF ──→ 2NF ──→ 3NF ──→ 4NF
```

Each stage should have a visual state:

```text
✓ Satisfied
✗ Violated
⚠ Insufficient / blocked
● Current
○ Not selected
```

Only actual analysis results should determine the status.

---

# 8. NORMALIZATION JOURNEY INTERACTION

When the user clicks:

```text
2NF
```

the main visualization changes context to 2NF.

Show:

- current relation,
- candidate key,
- relevant dependencies,
- violation,
- explanation,
- decomposition.

When clicking:

```text
3NF
```

show the 3NF reasoning.

When clicking:

```text
4NF
```

show the MVD reasoning and decomposition.

Do not reload the entire page.

Transition the visualization smoothly.

---

# 9. NORMALIZATION JOURNEY STAGE STATES

Each stage should visually communicate:

## Not evaluated

```text
○
```

## Satisfied

```text
✓
```

## Violated

```text
✗
```

## Insufficient data

```text
⚠
```

## Current stage

Use a subtle active-state treatment.

Do not rely only on color.

---

# 10. CURRENT-STAGE HERO

When a stage is selected, show a concise header:

```text
SECOND NORMAL FORM

2NF
Violation detected

2 partial dependencies
```

or:

```text
FOURTH NORMAL FORM

4NF
Satisfied
```

Use supporting context but avoid giant dashboard-style numbers.

---

# 11. SCHEMA VISUALIZATION

Visualize the current relation as a clean schema diagram.

Example:

```text
┌──────────────────────────────┐
│ ENROLLMENT                   │
├──────────────────────────────┤
│ 🔑 StudentID                 │
│ 🔑 CourseID                  │
│ StudentName                  │
│ CourseName                   │
│ Grade                        │
└──────────────────────────────┘
```

Candidate-key attributes must be visually distinguishable.

Prime and non-prime attributes can have subtle badges.

Example:

```text
🔑 Prime
○ Non-prime
```

Do not overwhelm the schema box with colors.

---

# 12. SCHEMA NODE INTERACTION

Clicking an attribute should:

- select it,
- highlight related dependencies,
- highlight relevant candidate keys,
- show contextual information.

Example:

```text
StudentID
Prime attribute
Member of candidate key:
(StudentID, CourseID)

Dependencies:
StudentID → StudentName
```

This should be powered by actual dependency metadata.

---

# 13. DEPENDENCY GRAPH — CORE FEATURE

Build an interactive dependency graph.

Support:

### Functional dependency

```text
StudentID ─────────→ StudentName
```

### Multivalued dependency

```text
Student ─────────→→ Hobby
```

The two relationship types must be visually distinguishable.

---

# 14. DEPENDENCY GRAPH NODES

Nodes represent attributes or logical groups of attributes.

For a composite determinant:

```text
(StudentID, CourseID) → Grade
```

do not create a misleading interpretation.

Use a group/node representation such as:

```text
┌────────────────────┐
│ StudentID          │
│ CourseID           │
└─────────┬──────────┘
          │
          ▼
       Grade
```

The goal is conceptual clarity.

---

# 15. DEPENDENCY GRAPH EDGES

FD edge:

```text
→
```

MVD edge:

```text
→→
```

Use distinct styling.

Edges should support:

- hover,
- selection,
- highlighting,
- tooltip,
- contextual information.

---

# 16. DEPENDENCY GRAPH HOVER

Hovering over an edge should display:

```text
Functional Dependency

StudentID → StudentName

Relevant normal form:
2NF

Status:
Partial dependency

[Click for details]
```

Use concise content.

---

# 17. DEPENDENCY GRAPH CLICK

On click:

- highlight the dependency,
- highlight determinant,
- highlight dependent attributes,
- highlight relevant candidate key,
- highlight affected normal-form stage,
- open explanation panel.

Do not force the user to search for the relevant explanation.

---

# 18. BIDIRECTIONAL SYNCHRONIZATION

If the user selects:

```text
StudentID → StudentName
```

in the dependency list:

the graph should highlight the corresponding edge.

If the user clicks the graph edge:

the dependency list should highlight that dependency.

This synchronization is an important quality feature.

---

# 19. VIOLATION HIGHLIGHTING

When a violation exists:

Example:

```text
StudentID → StudentName
```

highlight:

- StudentID,
- StudentName,
- candidate key,
- dependency edge,
- affected stage.

The user should visually understand why the dependency is problematic.

Do not use aggressive flashing.

Use:

- subtle emphasis,
- border,
- glow only where appropriate,
- animated edge pulse if needed.

---

# 20. 2NF VISUALIZATION

When 2NF is selected, show:

```text
Candidate Key
(StudentID, CourseID)

             ┌───────────────────────┐
             │ (StudentID, CourseID) │
             └───────────┬───────────┘
                         │
                         │ StudentID
                         ▼
                  StudentName
```

Clearly mark:

```text
StudentID ⊂ candidate key
```

Then:

```text
Partial Dependency
```

The visual relationship should be unmistakable.

---

# 21. 3NF VISUALIZATION

Show:

```text
EmpID
  │
  ▼
DeptID
  │
  ▼
DeptName
```

and annotate:

```text
Transitive pattern
```

Then separately show:

```text
DeptID is not a superkey
DeptName is non-prime
```

Do not reduce the formal 3NF condition to a diagram-only heuristic.

The visualization should support the formal reasoning panel.

---

# 22. 4NF VISUALIZATION

For:

```text
Student →→ Hobby
Student →→ Language
```

show:

```text
                 Student
                  /   \
                 /     \
              →→         →→
             Hobby     Language
```

Visually communicate that Hobby and Language represent independent multi-valued information.

Then show:

```text
Student is not a superkey
MVD is non-trivial
4NF violation
```

---

# 23. ATTRIBUTE CLOSURE VISUALIZER

Build the complete visual experience based on Phase 3 closure traces.

Example:

```text
Start
  │
  ▼
{A}
  │
  │ A → B
  ▼
{A,B}
  │
  │ B → C
  ▼
{A,B,C}
  │
  │ C → D
  ▼
{A,B,C,D}
  │
  ▼
Fixed Point
```

---

# 24. ATTRIBUTE CLOSURE INTERACTION

Allow:

- play,
- pause where practical,
- next,
- previous,
- restart,
- jump to step.

At every step show:

```text
Current closure
Dependency applied
Attributes added
Why it applied
```

This must come from the real closure trace.

---

# 25. CLOSURE ATTRIBUTE STYLING

Distinguish:

### Starting attribute

```text
Starting
```

### Derived attribute

```text
Derived
```

### Newly added at current step

Use stronger highlight.

Do not rely only on colors.

Use:

- labels,
- borders,
- position,
- subtle motion.

---

# 26. CLOSURE GRAPH

Potential layout:

```text
CURRENT CLOSURE

┌────┐
│ A  │
└────┘

      ↓ A → B

┌────┐ ┌────┐
│ A  │ │ B  │
└────┘ └────┘

      ↓ B → C

┌────┐ ┌────┐ ┌────┐
│ A  │ │ B  │ │ C  │
└────┘ └────┘ └────┘
```

Keep it readable.

---

# 27. CLOSURE FINAL STATE

At the end:

```text
A+

{A, B, C, D}

Fixed point reached.
```

If all relation attributes are included:

```text
This attribute set determines the complete relation.
Superkey condition satisfied.
```

Do not label it candidate key solely from closure; candidate-key status comes from Phase 4.

---

# 28. CANDIDATE-KEY VISUALIZATION

Show candidate-key derivation:

```text
Candidate Set
      ↓
Closure
      ↓
All attributes?
      ↓
Superkey
      ↓
Minimal?
      ↓
Candidate Key
```

This should visualize the actual Phase 4 reasoning.

---

# 29. MULTIPLE CANDIDATE KEYS

If several exist:

```text
Candidate Keys

🔑 (A,B)
🔑 (C,D)
🔑 E
```

Allow selecting one.

Selecting a key should highlight:

- its attributes,
- related dependencies,
- closure,
- prime attributes contributed.

---

# 30. PRIME / NON-PRIME VISUALIZATION

Provide a subtle legend:

```text
🔑 Prime
○ Non-prime
```

or an equivalent non-color-only distinction.

Clicking an attribute can show:

```text
Prime Attribute

Member of:
(A,B)
```

or:

```text
Non-Prime Attribute

Not present in any verified candidate key.
```

---

# 31. REASONING TIMELINE

Every major analysis stage should have an optional reasoning timeline.

Example:

```text
1. Candidate key identified
        ↓
2. Prime/non-prime attributes determined
        ↓
3. Dependency examined
        ↓
4. Determinant superkey check
        ↓
5. Dependent attribute prime check
        ↓
6. 3NF violation identified
```

This is educational rather than decorative.

---

# 32. STEP-LEVEL HIGHLIGHTING

When the user selects a reasoning step:

- highlight the associated attributes,
- highlight dependency,
- highlight relation,
- show the relevant result.

This connects textual reasoning to visual evidence.

---

# 33. DECOMPOSITION VISUALIZATION

Display the decomposition as a tree.

Example:

```text
              ENROLLMENT
                  │
          2NF decomposition
             /           \
            /             \
       STUDENT          ENROLLMENT
```

For later decomposition:

```text
ENROLLMENT
    │
    ├── STUDENT
    └── ENROLLMENT
            │
            ├── COURSE
            └── ENROLLMENT_DETAIL
```

Use actual lineage from Phase 7.

Do not fabricate tree relationships.

---

# 34. DECOMPOSITION TREE INTERACTION

Click a node:

```text
STUDENT
```

show:

- attributes,
- source relation,
- reason created,
- triggering dependency,
- projected dependencies,
- verification status.

---

# 35. DECOMPOSITION ANIMATION

When moving from:

```text
Before
```

to:

```text
After
```

animate:

- relation splitting,
- attribute movement,
- dependency relationship changes.

The animation should be understandable.

Do not make attributes fly randomly around the screen.

Motion should follow the actual transformation.

---

# 36. BEFORE / AFTER COMPARISON

Use a dedicated view:

```text
BEFORE                         AFTER

ENROLLMENT                     STUDENT
StudentID                      StudentID
CourseID                       StudentName
StudentName
CourseName                     COURSE
Grade                          CourseID
                               CourseName

                               ENROLLMENT
                               StudentID
                               CourseID
                               Grade
```

Highlight:

- retained attributes,
- moved attributes,
- newly separated relations.

---

# 37. DECOMPOSITION VERIFICATION VISUAL

After decomposition:

```text
VERIFICATION

Lossless Join
✓ Verified

Dependency Preservation
✓ Verified
```

Click to inspect details.

If failed:

```text
Lossless Join
✗ Failed
```

Do not hide failures.

---

# 38. LOSSLESS VERIFICATION VISUALIZATION

Show a simplified educational view by default.

Example:

```text
R
↓
R1 + R2
↓
Chase
↓
Original information recoverable
↓
✓ Lossless
```

Expandable:

> Show technical chase details.

Do not expose a huge mathematical tableau by default.

---

# 39. DEPENDENCY PRESERVATION VISUALIZATION

Show:

```text
Original Dependencies
        ↓
Projected Dependencies
        ↓
Closure
        ↓
All required dependencies preserved?
        ↓
✓ Yes
```

For a failed dependency:

```text
A → C
✗ Not derivable from projected dependencies
```

---

# 40. VISUALIZATION CONTROLS

Provide controls such as:

```text
Zoom +
Zoom -
Fit
Reset View
Show Labels
Hide Labels
Legend
```

Only include controls that are useful.

Keyboard shortcuts may be added if practical.

---

# 41. GRAPH LAYOUT

Use automatic graph layout where helpful, but allow deterministic layout.

Avoid random positioning.

Same analysis should produce a similar/stable graph arrangement.

This is important for readability and tests.

---

# 42. EDGE CROSSING REDUCTION

Use a suitable layout algorithm or carefully structured positioning to minimize crossing edges.

If the graph becomes large:

- group attributes,
- collapse sections,
- allow filtering.

Do not produce an unreadable "spaghetti graph."

---

# 43. LARGE-GRAPH HANDLING

For large schemas:

- allow zooming,
- allow panning,
- allow collapsing relation groups,
- provide search,
- allow focusing on a selected attribute/dependency.

Do not render every possible derived relationship unless needed.

---

# 44. GRAPH SEARCH / FOCUS

Allow the user to find:

```text
StudentID
```

or:

```text
StudentID → StudentName
```

and center/focus the visualization.

This is optional if graph size remains small, but useful for a complete visualizer.

---

# 45. LEGENDS

Every complex visualization should have an accessible legend.

For example:

```text
→ Functional Dependency
→→ Multivalued Dependency
🔑 Candidate Key
● Prime Attribute
○ Non-Prime Attribute
✗ Violation
✓ Verified
```

Do not use color alone.

---

# 46. TOOLTIP DESIGN

Tooltips should explain, not merely repeat labels.

Bad:

> StudentID

Good:

> `StudentID` is a prime attribute because it belongs to a verified candidate key.

Keep tooltips concise.

---

# 47. SYNCHRONIZED DETAIL PANEL

The visualizer should have a contextual detail panel.

When the user selects something, the panel updates.

Example:

```text
SELECTED

StudentID → StudentName

Type:
Functional Dependency

Normal Form:
2NF

Status:
Partial dependency

Why:
StudentID is a proper subset of
(StudentID, CourseID).
```

This is a major part of the learning experience.

---

# 48. VISUALIZATION MODE SWITCHER

Where appropriate, provide:

```text
Schema
Dependencies
Closure
Decomposition
Verification
```

Do not make every mode a separate webpage.

They can be views in the same workspace.

---

# 49. MAIN ANALYZER LAYOUT AFTER PHASE 8

Recommended desktop-first structure:

```text
┌──────────────────────────────────────────────────────────────────────────┐
│ Navigation                                                               │
├──────────────────────┬────────────────────────────────┬──────────────────┤
│ INPUT / SUMMARY      │ VISUALIZATION                 │ INSIGHT           │
│                      │                                │                  │
│ Relation             │ 1NF → 2NF → 3NF → 4NF       │ Current Stage     │
│ Candidate Keys       │                                │                  │
│ FDs                  │ [Interactive graph/tree]      │ Violation         │
│ MVDs                 │                                │                  │
│                      │                                │ Why?               │
│ [Edit Input]         │                                │                  │
│                      │                                │ Decomposition      │
│                      │                                │                  │
└──────────────────────┴────────────────────────────────┴──────────────────┘
```

The exact layout may adapt dynamically.

Do not force everything into three columns when that harms readability.

---

# 50. CONTEXT-SENSITIVE VISUALIZATION

When selected stage is:

## 1NF

Prioritize:

- sample data,
- atomicity,
- offending cells,
- 1NF transformation.

## 2NF

Prioritize:

- candidate key,
- partial dependency,
- prime/non-prime status,
- decomposition.

## 3NF

Prioritize:

- FD,
- determinant,
- superkey status,
- prime dependent,
- transitive pattern,
- decomposition.

## 4NF

Prioritize:

- MVD,
- determinant,
- superkey status,
- independent multi-valued facts,
- decomposition.

This ensures the visualization is relevant rather than generic.

---

# 51. SAMPLE DATA VISUALIZATION FOR 1NF

When sample data is available, use a table.

Example:

```text
BEFORE

Student | Courses
Raj     | DBMS, OS, CN
```

Highlight the offending cell.

Then:

```text
AFTER / 1NF REPRESENTATION

Student | Course
Raj     | DBMS
Raj     | OS
Raj     | CN
```

Use an animation or side-by-side comparison where practical.

---

# 52. NO SAMPLE DATA CASE

If no sample tuples exist:

```text
1NF DATA VIEW

No sample data was supplied.

Cell-level atomicity cannot be fully inspected.

[Learn about 1NF]
```

Do not fabricate a table.

---

# 53. 2NF INTERACTIVE VISUAL

For a violation:

1. Select candidate key.
2. Highlight proper subset.
3. Highlight non-prime attribute.
4. Highlight FD.
5. Show "Partial Dependency."
6. Show decomposition.

The sequence should feel like a guided discovery.

---

# 54. 3NF INTERACTIVE VISUAL

For a violation:

1. Select FD.
2. Highlight determinant.
3. Show closure/superkey check.
4. Highlight dependent attribute.
5. Show prime/non-prime result.
6. Show formal 3NF conclusion.
7. Show transitive pattern if applicable.
8. Show decomposition proposal.

---

# 55. 4NF INTERACTIVE VISUAL

For a violation:

1. Select MVD.
2. Show full relation.
3. Show X and Y.
4. Show remaining attributes.
5. Determine triviality.
6. Show determinant superkey result.
7. Show 4NF conclusion.
8. Show decomposition.

---

# 56. VISUAL DIFFERENCE BETWEEN 3NF AND 4NF

Use visual storytelling.

### 3NF

Emphasis:

```text
Functional Dependency
X → A
```

### 4NF

Emphasis:

```text
Multivalued Dependency
X →→ Y
```

The user should immediately see that these are different dependency concepts.

---

# 57. DECOMPOSITION LINEAGE

Visualize parent-child relationships.

Each child should retain:

- source relation,
- trigger stage,
- triggering dependency.

Example:

```text
R
│
├─ triggered by StudentID → StudentName
│
├─ STUDENT
└─ ENROLLMENT
```

The final polished tree can be built later if necessary, but the basic interaction belongs here.

---

# 58. VERIFICATION STATUS IN TREE

A parent decomposition node can display:

```text
Lossless ✓
Dependency Preservation ✓
```

or:

```text
Lossless ✗
Dependency Preservation ✓
```

This gives an immediate sense of formal correctness.

---

# 59. RESPONSIVE VISUALIZATION

Desktop-first.

At smaller widths:

- collapse side panels,
- allow visualization to take full width,
- keep controls accessible,
- move details below graph when necessary.

Do not shrink graph text until it becomes unreadable.

---

# 60. ACCESSIBILITY FOR GRAPHS

Interactive graphs must have non-visual alternatives.

For a selected dependency, provide text:

```text
StudentID determines StudentName.
```

The user should not need to understand the visual graph to access the information.

If technically practical:

- keyboard-selectable nodes/edges,
- accessible labels,
- focus states,
- structured detail panel.

---

# 61. KEYBOARD ACCESS

Provide keyboard accessibility for:

- stage navigation,
- visualization mode tabs,
- selected elements,
- detail panels,
- controls.

Graph keyboard navigation can be implemented to a practical level.

---

# 62. COLOR SYSTEM FOR VISUALIZATION

Use the global Phase 1 design system.

Do not introduce a random rainbow.

Use:

- primary accent for active/selected state,
- restrained success state,
- restrained warning state,
- restrained error state,
- neutral for ordinary nodes/edges.

The graph should remain readable in both themes.

---

# 63. DARK MODE GRAPH SUPPORT

Test:

- node contrast,
- edge contrast,
- labels,
- selection states,
- tooltips,
- tables,
- decomposition tree.

Dark mode must not make the graph unreadable.

---

# 64. ANIMATION QUALITY

Animations should be:

- short,
- smooth,
- purposeful,
- reversible when practical.

Examples:

- dependency edge pulse on selection,
- attribute highlight,
- closure step transition,
- schema decomposition,
- stage transition.

Avoid:

- unnecessary bounce,
- excessive rotation,
- constant motion,
- decorative floating elements.

---

# 65. ANIMATION PREFERENCES

Respect reduced-motion accessibility preference where practical.

If the browser/device prefers reduced motion:

- disable or greatly reduce non-essential animations,
- preserve state transitions without excessive movement.

This is a professional UX requirement.

---

# 66. PERFORMANCE

Visualization must remain responsive.

Avoid rendering enormous numbers of unnecessary DOM/SVG elements.

For normal classroom-sized relations, interaction should feel immediate.

If a graph becomes large:

- collapse,
- filter,
- virtualize where appropriate,
- render only relevant information.

Do not calculate normalization again in the visualization component.

---

# 67. VISUALIZATION STATE MUST NOT ALTER ANALYSIS

Selections such as:

```text
selectedDependency
selectedAttribute
selectedStage
```

are UI-only state.

Do not mutate mathematical analysis results.

---

# 68. URL / NAVIGATION STATE

Where useful, a selected stage/mode can be encoded in the route/query state so users can navigate/share a particular view.

Optional.

Do not add unnecessary routing complexity.

---

# 69. EMPTY VISUALIZATION STATES

Examples:

### No analysis yet

> Enter a schema and run analysis to begin your normalization journey.

### No dependencies

> No functional dependencies have been defined.

### No MVD

> No multivalued dependencies were supplied.

### No sample data

> Sample tuples are not available for this analysis.

Do not show empty graphs with no explanation.

---

# 70. INVALID / STALE VISUALIZATION

If analysis becomes stale after input changes:

```text
This visualization belongs to an earlier analysis.

[Run Analysis]
```

Do not continue showing old graph state as current.

---

# 71. VISUALIZATION EXPORT PREPARATION

Do not implement final report export yet.

However, the visualization components should be designed so they can later provide:

- snapshot,
- SVG/PNG export where practical,
- embeddable report figures.

Phase 10 will handle final reports.

---

# 72. NO HARD-CODED VISUALS

Do not hardcode:

```text
StudentID → StudentName
```

into visualization components.

Use real analysis data.

Demo examples must use the same visualization components as arbitrary user inputs.

---

# 73. NO NEW NORMALIZATION LOGIC

The visualizer must never decide:

> "This is a 3NF violation."

That decision comes from the analysis engine.

Visualization only interprets the structured result.

---

# 74. VISUALIZATION DATA ADAPTER

If backend models are not directly suitable for visualization, create a dedicated transformation layer:

```text
AnalysisResult
      ↓
VisualizationAdapter
      ↓
VisualizationModel
      ↓
Graph/Tree/UI
```

This is preferred over putting transformation logic inside graph components.

---

# 75. COMPONENT ARCHITECTURE

Potential components:

```text
NormalizationJourney
StageNode
SchemaDiagram
DependencyGraph
DependencyNode
DependencyEdge
ClosureVisualizer
ClosureTimeline
KeyVisualizer
AttributeClassification
ReasoningTimeline
ViolationHighlighter
DecompositionTree
BeforeAfterSchema
VerificationSummary
LosslessVisualization
DependencyPreservationView
VisualizationLegend
VisualizationToolbar
VisualizationDetailPanel
```

Reuse existing UI primitives.

Do not create all components if some can be naturally combined.

---

# 76. FRONTEND SERVICES

Visualization should call existing analysis services only.

If visualization needs a transformation endpoint, keep it thin and deterministic.

Do not call the database directly from visualization components.

---

# 77. TESTING — VISUALIZATION DATA

Test:

- graph node mapping,
- FD edge mapping,
- MVD edge mapping,
- selected dependency highlighting,
- candidate-key mapping,
- prime/non-prime mapping,
- decomposition lineage mapping,
- verification status mapping.

These can be unit tested without requiring a browser.

---

# 78. TESTING — CLOSURE VISUALIZER

Test:

- initial state,
- each trace step,
- added attributes,
- dependency highlight,
- final closure,
- fixed point,
- previous/next,
- restart.

Use actual Phase 3 trace fixtures.

---

# 79. TESTING — NORMALIZATION JOURNEY

Test:

- stage statuses,
- stage selection,
- current-stage indicator,
- violation highlighting,
- correct stage-specific content,
- no fake future results,
- hierarchy.

---

# 80. TESTING — DEPENDENCY GRAPH

Test:

- single FD,
- multiple FDs,
- composite LHS,
- multiple RHS,
- MVD,
- composite MVD,
- graph selection,
- list/graph synchronization.

---

# 81. TESTING — DECOMPOSITION TREE

Test:

- one decomposition,
- multiple levels,
- parent-child links,
- stage labels,
- trigger dependency,
- verification status.

---

# 82. TESTING — THEME

Verify:

- light mode graph,
- dark mode graph,
- selection,
- edges,
- labels,
- tooltips,
- tables.

---

# 83. TESTING — ACCESSIBILITY

Verify:

- focus,
- keyboard navigation,
- labels,
- graph detail alternative,
- reduced motion,
- sufficient contrast.

---

# 84. REGRESSION TESTING

After Phase 8 verify all previous phases:

Phase 1:
- shell,
- navigation,
- theme.

Phase 2:
- input builder,
- validation,
- examples,
- sample data.

Phase 3:
- FD engine,
- closure.

Phase 4:
- candidate keys,
- prime/non-prime.

Phase 5:
- 1NF,
- 2NF.

Phase 6:
- 3NF,
- 4NF.

Phase 7:
- decomposition,
- lossless join,
- dependency preservation.

Do not break existing functionality.

---

# 85. BROWSER QA — COMPLETE NORMALIZATION JOURNEY

Use a set of prepared examples and run:

```text
1NF example
2NF example
3NF example
4NF example
already-normalized example
```

For each:

1. Load example.
2. Analyze.
3. Click each relevant stage.
4. Observe visual changes.
5. Select a dependency.
6. Inspect details.
7. View reasoning.
8. View decomposition.
9. View verification.

---

# 86. BROWSER QA — DEPENDENCY GRAPH

Test:

1. A single FD.
2. Multiple FDs.
3. Composite FD.
4. MVD.
5. Click edge.
6. Verify detail panel.
7. Click attribute.
8. Verify dependencies highlight.
9. Change stage.
10. Verify irrelevant dependencies become de-emphasized.

---

# 87. BROWSER QA — CLOSURE

Test:

```text
R(A,B,C,D)
A → B
B → C
C → D
```

Select A.

Play through:

```text
{A}
{A,B}
{A,B,C}
{A,B,C,D}
```

Verify every transition.

---

# 88. BROWSER QA — DECOMPOSITION

Use a known 2NF/3NF/4NF case.

Verify:

```text
Before
↓
Trigger
↓
After
↓
Verification
```

All views must correspond to the same analysis.

---

# 89. NO STALE VISUALS

Test:

1. Analyze schema.
2. Select a dependency.
3. Modify input.
4. Confirm visualization clears/becomes stale.
5. Re-analyze.
6. Confirm new graph is generated.

Never show an old graph as current.

---

# 90. VISUAL PERFORMANCE

Check that:

- zoom is responsive,
- graph interactions do not visibly lag,
- selection is immediate,
- stage transitions are smooth,
- large text blocks do not cause layout jumps.

---

# 91. DATA CONSISTENCY

The following must always agree:

```text
Result panel
Dependency list
Graph
Reasoning
Decomposition
Verification
```

Example:

If result says:

```text
DeptID → DeptName
```

is a 3NF violation, the graph must highlight the same dependency.

Do not allow contradictory views.

---

# 92. VISUALIZATION SOURCE OF TRUTH

The backend analysis result remains authoritative.

Frontend visualization is a representation of that result.

Never derive a different mathematical interpretation inside the visualization layer.

---

# 93. DOCUMENTATION

Create/update:

```text
docs/visualization-engine.md
```

Document:

- visualization architecture,
- graph model,
- stage navigation,
- closure visualization,
- dependency graph,
- decomposition tree,
- synchronization,
- accessibility,
- performance approach.

Update:

```text
README.md
docs/development.md
```

with Phase 8 status.

---

# 94. COMPLEXITY / PERFORMANCE DOCUMENTATION

Document:

- graph rendering complexity,
- number of visual nodes/edges,
- filtering/collapsing strategy,
- layout behavior,
- closure visualization step count,
- decomposition tree size.

Do not make arbitrary claims.

---

# 95. NO LLM

The entire visualizer must work without:

- OpenAI,
- Gemini API,
- Claude,
- Ollama.

Visual explanations are driven by deterministic analysis data.

---

# 96. NO PRACTICE MODE

Practice Mode remains deferred.

---

# 97. NO FINAL CHATBOT

The contextual assistant belongs to Phase 9.

The current visualization may provide "Why?" panels because they are based on existing analysis results, but do not build the final chatbot system.

---

# 98. NO REPORT GENERATION

Do not build PDF/DOCX/TXT generation.

Visualization components should only expose data/snapshot hooks for Phase 10.

---

# 99. NO NEW ALGORITHMS

If a missing mathematical result is discovered:

- do not silently implement a duplicate algorithm in the frontend,
- identify the missing backend/service dependency,
- use the existing service if available,
- if the current architecture genuinely lacks a required result, create the smallest clean backend extension and document it rather than embedding math in the graph component.

---

# 100. PHASE 8 ACCEPTANCE CRITERIA

Phase 8 is complete only when:

## Normalization Journey

- [ ] 1NF stage works.
- [ ] 2NF stage works.
- [ ] 3NF stage works.
- [ ] 4NF stage works.
- [ ] statuses are accurate.
- [ ] current stage is obvious.
- [ ] stage switching works.
- [ ] prerequisite/insufficient states are clear.

## Schema Visualization

- [ ] relation schema displayed.
- [ ] candidate-key attributes visible.
- [ ] prime/non-prime status visible.
- [ ] attribute selection works.

## Dependency Graph

- [ ] FDs visualized.
- [ ] MVDs visualized.
- [ ] composite determinants supported.
- [ ] multi-attribute RHS supported.
- [ ] hover works.
- [ ] selection works.
- [ ] list ↔ graph synchronization works.

## Closure Visualization

- [ ] starting set visible.
- [ ] trace steps visible.
- [ ] applied dependencies visible.
- [ ] derived attributes visible.
- [ ] final closure visible.
- [ ] fixed-point state visible.
- [ ] step navigation works.

## Violation Visualization

- [ ] 2NF partial dependency highlighted.
- [ ] 3NF violation highlighted.
- [ ] 4NF MVD violation highlighted.
- [ ] related keys/attributes highlighted.

## Decomposition

- [ ] decomposition tree works.
- [ ] parent/child lineage correct.
- [ ] before/after works.
- [ ] trigger dependency shown.
- [ ] verification status shown.

## Verification

- [ ] lossless status shown.
- [ ] dependency-preservation status shown.
- [ ] details expandable.
- [ ] failure states correctly represented.
- [ ] unsupported states correctly represented.

## UX

- [ ] desktop-first.
- [ ] responsive.
- [ ] light mode.
- [ ] dark mode.
- [ ] hover states.
- [ ] focus states.
- [ ] accessible labels.
- [ ] reduced-motion consideration.
- [ ] no visual overload.

## Technical

- [ ] no duplicate normalization algorithms.
- [ ] no hardcoded example logic.
- [ ] visualization data adapter exists where needed.
- [ ] stale results handled.
- [ ] performance acceptable.

## Testing

- [ ] visualization unit tests.
- [ ] frontend tests.
- [ ] integration tests.
- [ ] browser QA.
- [ ] regression tests for Phases 1–7.

---

# 101. REQUIRED DEMONSTRATION CASE — 2NF

Use:

```text
R(StudentID, CourseID, StudentName, CourseName, Grade)

Candidate Key:
(StudentID, CourseID)

FDs:
StudentID → StudentName
CourseID → CourseName
(StudentID,CourseID) → Grade
```

The visualization should communicate:

```text
Composite Candidate Key
        ↓
Partial Determinant
        ↓
Non-Prime Attribute
        ↓
Partial Dependency
        ↓
2NF Violation
        ↓
Decomposition
```

---

# 102. REQUIRED DEMONSTRATION CASE — 3NF

Use:

```text
R(EmpID, EmpName, DeptID, DeptName)

Candidate Key:
EmpID

FDs:
EmpID → EmpName, DeptID
DeptID → DeptName
```

Visual:

```text
EmpID → DeptID → DeptName
```

Then:

```text
DeptID:
not superkey

DeptName:
non-prime

3NF:
violated
```

Then decomposition and verification.

---

# 103. REQUIRED DEMONSTRATION CASE — 4NF

Use:

```text
R(Student,Hobby,Language)

MVD:
Student →→ Hobby
Student →→ Language
```

Visual:

```text
              Student
              /     \
            →→       →→
           Hobby   Language
```

Then:

```text
MVD:
non-trivial

Determinant:
not superkey

4NF:
violated
```

Then decomposition and verification.

---

# 104. REQUIRED CLOSURE DEMONSTRATION

Use:

```text
R(A,B,C,D)

A → B
B → C
C → D
```

Visualization:

```text
A
↓
A,B
↓
A,B,C
↓
A,B,C,D
```

---

# 105. REQUIRED KEY DEMONSTRATION

Use a composite candidate-key example.

Show:

```text
Candidate set
↓
Closure
↓
Superkey
↓
Minimality
↓
Candidate key
```

---

# 106. VISUAL DESIGN PRINCIPLE

Do not make the visualization look like a scientific dashboard overloaded with charts.

Normalization is primarily a **structural reasoning problem**.

Therefore prioritize:

- schema diagrams,
- dependency graphs,
- timelines,
- decomposition trees,
- tables,
- relationships.

Avoid:

- meaningless pie charts,
- fake analytics,
- decorative graphs,
- numerical dashboards unrelated to normalization.

---

# 107. EDUCATIONAL MICROINTERACTIONS

Good examples:

### Hovering an attribute

Show:

> Prime attribute — appears in candidate key `(A,B)`.

### Hovering a violation

Show:

> Partial dependency detected.

### Hovering a decomposition

Show:

> Created to isolate `DeptID → DeptName`.

These reinforce learning.

---

# 108. VISUAL STORYTELLING

Every stage should answer visually:

```text
What is the relation?
        ↓
What are the keys?
        ↓
What dependencies exist?
        ↓
Which dependency matters?
        ↓
Why is it a violation?
        ↓
How is it decomposed?
        ↓
Was the decomposition verified?
```

This sequence should guide the interaction design.

---

# 109. INFORMATION DENSITY

The Analyzer may contain a lot of DBMS information.

Use progressive disclosure:

Default:

```text
Status
Main visual
Short explanation
Primary action
```

Expanded:

```text
Detailed reasoning
Closure
Dependency details
Verification details
```

Do not show every implementation detail simultaneously.

---

# 110. VISUALIZATION TOOLBAR

Use a small contextual toolbar.

Possible:

```text
[Schema] [Dependencies] [Closure] [Decomposition] [Verification]

[Fit] [Reset] [Legend]
```

Avoid an oversized toolbar.

---

# 111. MOBILE / NARROW VIEW

Desktop-first but responsive.

On narrow screens:

```text
Stage
↓
Visualization
↓
Insight
↓
Supporting details
```

Input can become a collapsible section.

Do not make the graph unusably small.

---

# 112. STATE PERSISTENCE

Current visualization selections may be preserved during ordinary navigation if practical.

Do not store stale selections after input changes.

If the selected dependency no longer exists:

```text
clear selection
```

rather than showing a broken state.

---

# 113. VISUALIZATION RESET

Provide:

```text
Reset View
```

which resets:

- pan,
- zoom,
- selection,
- expanded nodes.

It must not reset user schema input.

---

# 114. NO DESTRUCTIVE VIEW ACTIONS

"Reset View" must not mean:

> Delete analysis.

Keep visualization state and user input state separate.

---

# 115. FINAL PHASE 8 REPORT

At completion, report:

1. Files created/modified.
2. Visualization architecture.
3. Normalization Journey.
4. Schema diagram.
5. Dependency graph.
6. Closure visualization.
7. Candidate-key visualization.
8. Violation highlighting.
9. Decomposition tree.
10. Before/after view.
11. Verification visualization.
12. Accessibility measures.
13. Responsive behavior.
14. Tests.
15. Browser QA.
16. Performance observations.
17. Known limitations.
18. Phase 9 handoff details.

---

# 116. PHASE 9 HANDOFF

Phase 9 will add:

- What-If / Experiment Mode,
- contextual assistant,
- creative interactions,
- potentially Practice Mode.

The visualizer must therefore expose reusable APIs/components for:

```text
rerenderWithAnalysis(...)
selectDependency(...)
selectStage(...)
highlightAttributes(...)
focusRelation(...)
```

or equivalent abstractions.

Do not make Phase 9 rebuild the visualization system.

---

# 117. PHASE 10 HANDOFF

Reports will eventually consume:

- visualization snapshots,
- graphs,
- decomposition trees,
- tables,
- stage states.

Keep visual components structured so export/snapshot functionality can later be added.

---

# 118. FINAL DEVELOPMENT WORKFLOW

Before coding:

1. Read master reference.
2. Read Phases 1–7.
3. Inspect existing repository.
4. Run all previous tests.
5. Inspect actual Phase 7 result models.
6. Design visualization adapters.
7. Plan implementation.

Implement in this order:

```text
A. Visualization data adapter
B. Normalization Journey
C. Schema visualization
D. Dependency graph
E. Closure visualization
F. Violation highlighting
G. Candidate-key visualization
H. Decomposition tree
I. Verification visualization
J. Synchronization/detail panel
K. Accessibility
L. Responsive behavior
M. Tests
```

Do not implement everything without validation.

---

# 119. ANTIGRAVITY EXECUTION RULES

Before coding:

- inspect existing code,
- understand previous result models,
- do not assume structures,
- do not duplicate engines.

During coding:

- preserve previous phases,
- keep math out of visualization components,
- keep visualization adapters separate,
- write tests as features are added.

After coding:

1. Run backend tests.
2. Run frontend tests.
3. Build.
4. Start backend.
5. Start frontend.
6. Open browser.
7. Test a 2NF example.
8. Test a 3NF example.
9. Test a 4NF example.
10. Test closure.
11. Test decomposition.
12. Toggle Day/Night.
13. Resize browser.
14. Inspect console.
15. Fix issues.
16. Rerun tests.

---

# 120. FINAL QUALITY STANDARD

The visualizer must make the system feel fundamentally different from a simple normalization calculator.

A student should be able to look at the screen and understand:

> "This attribute is part of my candidate key."

> "This dependency is causing the violation."

> "This is why it is a partial/transitive/multivalued dependency."

> "This is how the schema is being decomposed."

> "This decomposition has been formally checked."

The application should teach through **interaction and visual reasoning**, not through decoration.

---

# 121. FINAL COMMAND

Execute **PHASE 8 ONLY**.

Read and follow:

- `normalization_lab_master_project_reference.md`
- `phase_1_project_foundation_prompt.md`
- `phase_2_schema_input_builder_validation_prompt.md`
- `phase_3_fd_engine_attribute_closure_prompt.md`
- `phase_4_candidate_key_engine_prompt.md`
- `phase_5_1nf_2nf_normalization_engine_prompt.md`
- `phase_6_3nf_4nf_analysis_engine_prompt.md`
- `phase_7_decomposition_lossless_dependency_preservation_prompt.md`

Implement the complete interactive visualization engine described here.

Preserve all previous functionality.

Do not implement new normalization mathematics in the frontend.

Do not start Phase 9 automatically.

Do not implement the final contextual chatbot.

Do not implement Practice Mode.

Do not implement final report generation.

Do not integrate a paid LLM.

Use actual analysis/decomposition/verification results as the only source of truth.

Test thoroughly.

Perform actual browser verification.

Fix all blocking issues.

Stop after Phase 8 is stable and verified.
