# Phase 10 — Learn, Help, Developed By + Download & Report System
## Master Implementation Prompt for the Normalization Lab Project

> **Purpose of this phase:** Complete the academic website structure and mandatory institutional requirements around the already-built normalization analyzer, visualization, experimentation, and contextual assistant.
>
> **Important:** This phase must integrate with Phases 1–9. Do not rebuild the normalization engine, duplicate analysis logic, or turn the project into a generic documentation website.

---

# 1. CONTEXT — READ THIS FIRST

The project is an **interactive DBMS Normalization Lab** focused on:

- 1NF
- 2NF
- 3NF
- 4NF
- Functional Dependencies
- Multivalued Dependencies
- Candidate Keys
- Superkeys
- Prime / Non-Prime Attributes
- Attribute Closure
- Dependency implication where implemented
- Canonical / minimal cover where implemented
- Decomposition
- Lossless Join
- Dependency Preservation

The application already contains:

### Phase 1
Project foundation, routing, design system, theme switching, reusable components, backend infrastructure.

### Phase 2
Schema/input builder, guided/raw input modes, validation, sample data support.

### Phase 3
FD engine, attribute closure, dependency determination, reasoning traces.

### Phase 4
Candidate-key discovery, superkey checking, composite/multiple keys, prime/non-prime attributes.

### Phase 5
1NF and 2NF analysis, partial dependency detection, decomposition proposals.

### Phase 6
3NF and 4NF analysis, formal conditions, MVD analysis, highest-normal-form determination.

### Phase 7
Decomposition, lossless-join verification, dependency-preservation verification, lineage.

### Phase 8
Interactive visualization, normalization journey, graph, closure visualization, reasoning, decomposition tree.

### Phase 9
Creative interaction layer, Explain-Why, Experiment Mode, contextual deterministic assistant, evidence navigation, optional practice.

**Phase 10 now completes the mandatory website structure required by the project rubric.**

---

# 2. MANDATORY REQUIREMENTS TO IMPLEMENT

The application must visibly provide:

## Learn
Containing:

- crisp concept explanations
- 1NF
- 2NF
- 3NF
- 4NF
- prerequisite DBMS concepts
- educational examples
- animated/educational video
- books
- websites
- research papers
- educational resources
- videos

## Developed By

Must contain:

- student photo
- student name
- register number
- all team members
- editable team-member data

## Guided By

Must contain exactly:

**Dr. Swaminathan A**  
**Assistant Professor**

Keep this data configurable if institutional details later need modification.

## Help

Must provide a clear user manual explaining:

- what the application does
- what inputs are available
- how to enter them
- controls/buttons
- processing
- interpretation of outputs
- step-by-step workflow
- common errors

## Download

Must allow generation of a report containing:

- User Inputs
- Processing Steps
- Intermediate Results
- Final Output
- Graphs/Tables/Figures where applicable

Required formats:

- PDF
- Document
- Text

## Day/Night Mode

Already introduced earlier, but Phase 10 must ensure all new pages/components support it correctly.

---

# 3. PHASE 10 DESIGN PRINCIPLE

The new sections should feel like parts of the same **Normalization Laboratory**.

Do not create:

- a generic LMS
- a corporate documentation portal
- a boring text-heavy wiki
- a marketing website
- a generic chatbot help center
- a dashboard full of cards

The experience should feel like:

```text
Analyze
   ↓
Understand
   ↓
Experiment
   ↓
Learn
   ↓
Document
```

---

# 4. FINAL NAVIGATION

Update the application navigation to clearly expose:

```text
Home
Analyzer
Learn
Help
History
Developed By
```

Potential contextual actions:

```text
Download Report
Practice
Experiment
```

Do not overload the primary navigation with every possible tool.

Recommended hierarchy:

```text
PRIMARY
────────────
Analyzer
Learn
Help

SECONDARY
────────────
History
Developed By

CONTEXTUAL
────────────
Download
Experiment
Practice
```

---

# 5. HOME PAGE

The Home page should introduce the application without becoming a marketing landing page.

Recommended structure:

```text
NORMALIZATION LAB

Interactive analysis of
1NF → 2NF → 3NF → 4NF

[Start Analysis]

What this lab can do
────────────────────────
Schema analysis
Dependency reasoning
Candidate-key discovery
Attribute closure
Normalization
Decomposition
Verification
Interactive experimentation

How it works
────────────────────────
1. Enter schema
2. Define dependencies
3. Analyze
4. Inspect reasoning
5. Experiment
6. Learn
7. Download report
```

Avoid:

- exaggerated startup language
- fake statistics
- fake user counts
- fake accuracy percentages
- giant hero artwork
- unnecessary gradients

The Home page should communicate academic purpose quickly.

---

# 6. LEARN SECTION — OVERALL PURPOSE

The Learn section should not simply repeat the result panel.

It should teach the concepts independently while remaining connected to the analyzer.

The user must be able to learn:

```text
Why normalization exists
      ↓
Relational foundations
      ↓
Functional Dependencies
      ↓
Keys
      ↓
Attribute Closure
      ↓
1NF
      ↓
2NF
      ↓
3NF
      ↓
4NF
      ↓
Decomposition
      ↓
Lossless Join
      ↓
Dependency Preservation
```

---

# 7. LEARN SECTION STRUCTURE

Create a Learn page with a persistent topic navigation area.

Suggested:

```text
LEARN
─────────────────────────────────────────────

Foundations
Functional Dependencies
Candidate Keys
Attribute Closure

Normalization
1NF
2NF
3NF
4NF

Decomposition
Lossless Join
Dependency Preservation
```

Use progressive disclosure.

The user should be able to enter at any topic without being forced through the entire sequence.

---

# 8. LEARN — FOUNDATIONS

Include concise but academically correct explanations of:

## Relation

Explain:

- relation schema
- relation instance
- attributes
- tuples
- domains

## Superkey

Explain the uniqueness condition.

## Candidate Key

Explain:

```text
Superkey + minimality
```

## Composite Key

Explain why a key can contain multiple attributes.

## Prime Attribute

An attribute that belongs to at least one candidate key.

## Non-Prime Attribute

An attribute that does not belong to any candidate key.

Use actual examples.

Do not use examples unrelated to the rest of the project unless helpful.

---

# 9. LEARN — FUNCTIONAL DEPENDENCIES

Teach:

```text
X → Y
```

Explain:

> If two tuples agree on X, they must agree on Y.

Cover:

- determinant
- dependent attribute
- trivial FD
- non-trivial FD
- full dependency
- partial dependency
- transitive dependency
- FD implication where supported

Include a small interactive example.

Possible UI:

```text
StudentID → StudentName

StudentID
    │
    ▼
StudentName
```

Provide:

```text
Try this in Analyzer
```

which opens the analyzer with an example only when the user explicitly chooses it.

---

# 10. LEARN — ATTRIBUTE CLOSURE

Explain:

```text
X+
```

Meaning:

> The set of attributes functionally determined by X.

Show a step-by-step example.

Example:

```text
F:
A → B
B → C
C → D

A+
────
Start: A

Using A → B
A,B

Using B → C
A,B,C

Using C → D
A,B,C,D
```

Provide:

```text
[Open Closure Lab]
```

The Closure Lab must use the real Phase 3 implementation.

---

# 11. LEARN — 1NF

Teach:

- atomic values
- repeating groups
- non-atomic cell values
- why repeating/multiple values inside a cell are problematic
- distinction between schema-level and data-level analysis

Important:

Do not falsely state that schema-only analysis proves 1NF.

Explain:

```text
If tuple data is provided:
→ cell-level atomicity can be inspected.

If only schema/dependencies are provided:
→ structural representation can be assessed,
   but actual stored-cell atomicity cannot be fully verified.
```

Provide a before/after visualization.

Example:

```text
Not atomic:

Student | Phone
Raj     | 9876, 1234

          ↓

StudentPhone
Raj | 9876
Raj | 1234
```

Be careful that the example is pedagogically illustrative rather than claiming a single universally required decomposition.

---

# 12. LEARN — 2NF

Teach the formal condition.

A relation is in 2NF when:

- it is in 1NF
- no non-prime attribute is partially dependent on a candidate key

Clearly explain:

```text
Partial dependency
```

Example:

```text
Candidate key:
(StudentID, CourseID)

FD:
StudentID → StudentName

StudentName depends on only part
of the composite key.

Therefore:
2NF violation
```

Also teach:

- single-attribute key case
- composite-key case
- prime/non-prime distinction

Add:

```text
[Try this example]
```

which opens the real analyzer with an example only after user action.

---

# 13. LEARN — 3NF

Teach the formal condition:

For every non-trivial FD:

```text
X → A
```

at least one must hold:

```text
X is a superkey
OR
A is a prime attribute
```

Explain the common transitive-dependency pattern, but avoid oversimplification.

Example:

```text
StudentID → DeptID
DeptID → DeptName
```

Show why:

```text
StudentID → DeptName
```

can lead to a 3NF issue depending on the complete relation and key structure.

Do not teach:

> Every transitive-looking dependency automatically means 3NF fails.

Always connect the explanation to the formal condition.

Provide:

```text
[Inspect 3NF in Analyzer]
```

---

# 14. LEARN — 4NF

Teach:

- multivalued dependencies
- independent multivalued facts
- trivial MVD
- non-trivial MVD
- 4NF condition

Formal condition:

For every non-trivial MVD:

```text
X →→ Y
```

X must be a superkey.

Use a clear conceptual example.

Example:

```text
Student
   │
   ├────→→ Hobbies
   │
   └────→→ Languages
```

Explain that storing independent multivalued facts together can create unnecessary combinations.

Provide:

```text
[Try MVD in Analyzer]
```

---

# 15. LEARN — 4NF VS 3NF

Include a comparison explaining:

| Concept | 3NF | 4NF |
|---|---|---|
| Main dependency | FD | MVD |
| Condition | X is superkey or RHS is prime | X is superkey |
| Main concern | problematic functional dependencies | independent multivalued facts |

Do not imply that 4NF is merely “3NF plus MVDs”; explain the different dependency model.

---

# 16. LEARN — DECOMPOSITION

Teach:

Why decomposition is performed.

Cover:

- splitting a relation
- preserving useful information
- reducing redundancy
- avoiding anomalies
- relation reconstruction

Then explain that a good decomposition should be evaluated formally.

---

# 17. LEARN — LOSSLESS JOIN

Teach the idea:

> A decomposition is lossless when joining the decomposed relations reconstructs the original relation without introducing spurious tuples, under the specified dependencies.

Connect to the actual Phase 7 verification.

Provide:

```text
Original Relation
       ↓
  Decomposition
       ↓
Join/Reconstruction
       ↓
Lossless?
```

Do not replace the formal verification with a simple overlap heuristic.

If the implementation uses a chase/tableau procedure, teach the concept at an appropriate level.

---

# 18. LEARN — DEPENDENCY PRESERVATION

Explain:

A decomposition is dependency preserving when the relevant dependencies can be enforced by checking the decomposed relations without requiring a join of all relations.

Connect directly to the Phase 7 projection/closure verification.

Show:

```text
Original FDs
     ↓
Project onto decomposed relations
     ↓
Combine projected dependencies
     ↓
Check implication
     ↓
Preserved?
```

---

# 19. LEARN — 1NF THROUGH 4NF SUMMARY

Provide one visual summary:

```text
1NF
Atomic values
   ↓
2NF
No partial dependency of non-prime attrs
   ↓
3NF
For every non-trivial FD:
superkey OR prime RHS
   ↓
4NF
For every non-trivial MVD:
determinant is superkey
```

Make each stage clickable.

---

# 20. LEARN — ANIMATED/EDUCATIONAL VIDEO REQUIREMENT

The project rubric explicitly requires an animated/educational video.

Support an embedded video area on the Learn page.

Preferred approach:

### Option A — Local project video

Allow:

```text
public/learning/
```

to contain an `.mp4` or other browser-supported file.

This works offline.

### Option B — Embedded educational video

Support an external educational video URL/iframe when internet access exists.

The implementation must fail gracefully if offline.

Do not make the entire Learn page depend on external video loading.

---

# 21. VIDEO UI

Create a reusable component:

```text
EducationalVideo
```

Fields:

```ts
interface EducationalVideoConfig {
  title: string;
  description?: string;
  sourceType: "local" | "external";
  source: string;
  duration?: string;
  topic?: string;
}
```

Display:

- title
- short explanation
- video player
- topic association

No autoplay with sound.

---

# 22. LEARN — RESOURCES

The Learn section must include references to:

### Books

Potential academically appropriate categories:

- Database System Concepts
- Fundamentals of Database Systems
- Database Management Systems
- textbook/course references used by the team

### Websites

Examples of categories:

- university database course materials
- official educational resources
- DBMS educational references

### Research papers

Include relevant papers/resources concerning:

- normalization
- functional dependencies
- multivalued dependencies
- decomposition
- relational design

### Educational resources

Include:

- lecture notes
- tutorials
- university material
- visual explainers
- course videos

### Videos

Provide useful educational videos.

---

# 23. RESOURCE DATA MODEL

Do not hardcode resource markup throughout JSX.

Create structured data.

Example:

```ts
interface LearningResource {
  id: string;
  title: string;
  type:
    | "book"
    | "website"
    | "paper"
    | "course"
    | "video"
    | "notes";
  author?: string;
  description: string;
  url?: string;
  topicIds: string[];
}
```

Keep resource content editable.

---

# 24. RESOURCE VALIDITY

Do not invent:

- paper titles
- authors
- URLs
- publication details

Use verified resources supplied by the project/team, or reputable educational references.

External links should:

- open safely
- use descriptive link text
- avoid unexplained raw URLs in the interface

The Learn section should still function if external websites become unavailable.

---

# 25. LEARN — INTERACTIVE MINI EXAMPLES

Each major topic should contain one small interactive demonstration.

Examples:

### Candidate Keys

```text
A → B
B → C
C → D
```

Ask user to select the candidate key.

### Closure

Show:

```text
A+
```

updating as FDs are applied.

### 2NF

Highlight the partial dependency.

### 3NF

Highlight:

```text
X → A
```

and show:

```text
Superkey?
Prime RHS?
```

### 4NF

Highlight the determinant of the MVD.

These examples can be simplified but should use the real engine whenever possible.

---

# 26. HELP / USER MANUAL

Create a dedicated `/help` route.

It must answer:

> “I have never used this website. What exactly do I do?”

---

# 27. HELP SECTION STRUCTURE

Recommended:

```text
HELP
────────────────────────────────

1. What this application does
2. Getting started
3. Entering a schema
4. Entering candidate keys
5. Entering FDs
6. Entering MVDs
7. Adding sample data
8. Running analysis
9. Reading the normalization journey
10. Understanding dependency graphs
11. Using attribute closure
12. Reading decomposition results
13. Checking lossless join
14. Checking dependency preservation
15. Using Experiment Mode
16. Using the Normalization Assistant
17. Downloading reports
18. Common errors
19. Troubleshooting
```

---

# 28. HELP — STEP-BY-STEP WORKFLOW

Clearly document:

```text
STEP 1
Open Analyzer

STEP 2
Enter relation name

STEP 3
Enter attributes

STEP 4
Provide candidate keys or let the system discover them

STEP 5
Enter FDs

STEP 6
Enter MVDs if needed

STEP 7
Optionally provide sample tuples

STEP 8
Run Analysis

STEP 9
Inspect 1NF → 4NF

STEP 10
Inspect evidence and dependency graph

STEP 11
Inspect decomposition and verification

STEP 12
Use Experiment Mode

STEP 13
Download report
```

---

# 29. HELP — INPUT FORMAT DOCUMENTATION

Document the guided input format.

For example:

```text
Attributes:
StudentID, CourseID, StudentName, CourseName
```

FD:

```text
StudentID -> StudentName
```

Composite FD:

```text
StudentID, CourseID -> Grade
```

MVD:

```text
StudentID ->> Hobby
```

Use the exact syntax supported by the actual parser.

Do not document unsupported syntax.

---

# 30. HELP — RAW/ADVANCED MODE

Explain the advanced input syntax exactly as implemented in Phase 2.

Include valid examples and invalid examples.

Example:

```text
Valid:
A -> B
AB -> C
A ->> D
```

Invalid example:

```text
A => B
```

only if `=>` is actually unsupported.

Documentation must match the parser implementation exactly.

---

# 31. HELP — BUTTON/CONTROL DOCUMENTATION

Explain every important action:

```text
Analyze
Reset
Add FD
Add MVD
Discover Candidate Keys
Calculate Closure
Show Why
Experiment
Compare
Reset Experiment
Save Snapshot
Download Report
Day/Night Mode
```

Do not include controls that do not actually exist.

---

# 32. HELP — OUTPUT INTERPRETATION

Explain statuses:

```text
PASS
FAIL
NOT VERIFIED
NOT APPLICABLE
```

Especially explain that some conditions cannot be fully verified without necessary data.

For example:

```text
1NF atomicity:
NOT VERIFIED
```

may be appropriate when tuple data is absent.

---

# 33. HELP — ERROR HANDLING

Explain common input errors:

- duplicate attributes
- missing relation name
- malformed FD
- malformed MVD
- unknown attribute in dependency
- duplicate dependency
- invalid key
- empty input
- invalid sample data

Give corrective instructions.

---

# 34. DEVELOPED BY PAGE

Create `/developed-by`.

It should have an academic/project presentation rather than employee-profile cards.

Recommended structure:

```text
DEVELOPED BY

Project Team
────────────────────────────────

[Photo]   Student Name
          Register Number
          Role / Contribution

[Photo]   Student Name
          Register Number
          Role / Contribution

...

GUIDED BY
────────────────────────────────

Dr. Swaminathan A
Assistant Professor
```

---

# 35. TEAM DATA MUST BE EDITABLE

Do not hardcode student information directly into JSX.

Create configuration:

```ts
interface TeamMember {
  name: string;
  registerNumber: string;
  photo?: string;
  role?: string;
}
```

Then:

```ts
const projectTeam: TeamMember[] = [...]
```

This allows easy modification before final submission.

---

# 36. PHOTOS

Provide a clear fallback when no photo exists:

```text
Photo unavailable
```

Do not use random stock faces.

Do not generate fake student identities.

Support local images:

```text
public/team/
```

or equivalent static asset path.

---

# 37. GUIDED BY DATA

Store:

```ts
const guide = {
  name: "Dr. Swaminathan A",
  designation: "Assistant Professor"
};
```

This should be centralized so the project can be updated easily.

---

# 38. DOWNLOAD / REPORT SYSTEM

This is one of the most important Phase 10 components.

The report should document the actual analysis performed by the user.

It must never be a generic template containing fake results.

---

# 39. REPORT STRUCTURE

Create a report model:

```text
Normalization Lab Report
────────────────────────────────

1. Project Information

2. User Inputs
   - Relation
   - Attributes
   - Candidate Keys
   - Functional Dependencies
   - Multivalued Dependencies
   - Sample Data (if provided)

3. Processing Steps
   - Input validation
   - Candidate-key analysis
   - Attribute closure calculations
   - 1NF analysis
   - 2NF analysis
   - 3NF analysis
   - 4NF analysis
   - Decomposition
   - Verification

4. Intermediate Results
   - Closures
   - Candidate keys
   - Prime/non-prime attributes
   - Dependency reasoning
   - Violations

5. Final Output
   - 1NF status
   - 2NF status
   - 3NF status
   - 4NF status
   - Highest satisfied normal form

6. Decomposition
   - resulting relations
   - lineage
   - dependency preservation
   - lossless join

7. Graphs / Tables / Figures
   - normalization journey
   - dependency graph
   - closure visualizations where relevant
   - decomposition diagram
   - verification summary

8. Notes / Interpretation
```

Only include sections that are applicable.

---

# 40. REPORT — USER INPUTS

Include the exact normalized representation of the user's input.

Example:

```text
Relation:
Enrollment

Attributes:
StudentID, CourseID, StudentName, CourseName, Grade

Candidate Keys:
(StudentID, CourseID)

FDs:
StudentID → StudentName
CourseID → CourseName
StudentID, CourseID → Grade
```

Do not silently alter user input.

If preprocessing normalized syntax, report the normalized interpretation separately.

---

# 41. REPORT — PROCESSING STEPS

Use actual reasoning traces from the engine.

Do not write vague text like:

> The system analyzed the relation.

Instead:

```text
1. Candidate-key analysis was performed.
2. Closure of {StudentID, CourseID} reached all relation attributes.
3. StudentID was checked as a proper subset of the composite key.
4. StudentID → StudentName was identified as a partial dependency.
5. Therefore the 2NF condition was not satisfied.
```

Use real values from the current analysis.

---

# 42. REPORT — INTERMEDIATE RESULTS

Include mathematically useful artifacts.

Examples:

```text
Candidate Keys:
{A,B}
{C,D}

Prime Attributes:
A, B, C, D

Non-Prime:
E, F

Closure:
AB+ = A,B,C,D,E
```

Include relevant reasoning traces.

---

# 43. REPORT — FINAL OUTPUT

Provide a clear table:

| Normal Form | Status | Primary Reason |
|---|---|---|
| 1NF | ... | ... |
| 2NF | ... | ... |
| 3NF | ... | ... |
| 4NF | ... | ... |

Use the actual status.

Potential statuses:

```text
SATISFIED
NOT SATISFIED
NOT VERIFIED
NOT APPLICABLE
```

Do not force every result into PASS/FAIL when that would be mathematically misleading.

---

# 44. REPORT — HIGHEST NORMAL FORM

Show:

```text
Highest established normal form:
3NF
```

or:

```text
Highest verified normal form:
4NF
```

depending on the analysis contract.

If one prerequisite cannot be verified, explain the limitation rather than inventing a definitive result.

---

# 45. REPORT — FIGURES

Where possible, include rendered visualizations from Phase 8:

### Figure 1
Normalization Journey

### Figure 2
Dependency Graph

### Figure 3
Attribute Closure

### Figure 4
Decomposition Tree

### Figure 5
Verification Result

Only include figures that exist and are relevant.

---

# 46. REPORT — GRAPH RENDERING

Create a report-friendly representation of graphical information.

Do not depend exclusively on interactive HTML canvas.

For PDF/document output, render graphs as:

- SVG
- PNG
- vector-compatible representation

The report must remain readable outside the browser.

---

# 47. PDF GENERATION

Implement a PDF generation service.

Possible architecture:

```text
Frontend
   ↓
Report Request
   ↓
Backend Report Builder
   ↓
PDF Renderer
   ↓
File/Blob
   ↓
Browser Download
```

Choose a maintainable Python PDF technology such as an established PDF generation library.

Keep report generation separate from normalization logic.

---

# 48. DOCUMENT GENERATION

“Document” should mean an actual editable document format, preferably:

```text
.docx
```

Generate a structured Word document containing:

- headings
- tables
- dependency notation
- results
- figures
- explanations

Do not simply rename a `.txt` file to `.docx`.

Use a real DOCX library.

---

# 49. TEXT DOWNLOAD

Provide:

```text
.txt
```

containing a clean linear representation.

Example:

```text
NORMALIZATION LAB REPORT

RELATION
Enrollment

ATTRIBUTES
StudentID, CourseID, ...

CANDIDATE KEYS
...

FUNCTIONAL DEPENDENCIES
...

2NF
NOT SATISFIED

REASON
...

...
```

The text report should be usable independently of the browser.

---

# 50. REPORT DOWNLOAD UI

Recommended:

```text
Download Report
────────────────────────────

Format

○ PDF
○ Document (.docx)
○ Text (.txt)

Include:
☑ User Inputs
☑ Processing Steps
☑ Intermediate Results
☑ Final Output
☑ Figures
☑ Verification

[Generate Report]
```

Defaults should include all useful sections.

---

# 51. REPORT GENERATION OPTIONS

Allow users to select:

```text
User Inputs
Processing
Intermediate Results
Final Results
Figures
Decomposition
Verification
```

Do not include hidden sections by default.

---

# 52. REPORT METADATA

Include:

```text
Project:
Normalization Lab

Generated:
<actual timestamp>

Relation:
<actual relation>

Highest Normal Form:
<actual result>
```

Use the user's local/browser-resolved timestamp where appropriate.

Do not fabricate dates.

---

# 53. REPORT FILE NAMING

Use predictable filenames, for example:

```text
normalization-report-Enrollment.pdf
normalization-report-Enrollment.docx
normalization-report-Enrollment.txt
```

Sanitize relation names for filesystem compatibility.

---

# 54. REPORT ERROR HANDLING

If report generation fails:

Show:

```text
Report generation failed.

Your analysis is safe.
No changes were made to your current analysis.

Try generating the report again.
```

Do not lose the analysis.

---

# 55. REPORT VALIDATION

Create integration tests verifying that generated files:

- exist
- open successfully
- contain expected headings
- contain actual relation name
- contain actual candidate keys
- contain actual normal-form results
- contain requested figures when enabled

For PDF/DOCX, validate the generated file rather than merely checking that a file path exists.

---

# 56. PHASE 10 API CONTRACT

Potential endpoints:

```http
POST /api/v1/reports/pdf
POST /api/v1/reports/docx
POST /api/v1/reports/text
```

or a unified endpoint:

```http
POST /api/v1/reports/generate
```

with:

```json
{
  "format": "pdf",
  "sections": {
    "inputs": true,
    "processing": true,
    "intermediate": true,
    "final": true,
    "figures": true,
    "verification": true
  },
  "analysis": {...}
}
```

Use the actual project's architecture where sensible.

---

# 57. REPORT DATA SOURCE

Reports must use one authoritative analysis result.

Recommended flow:

```text
User Input
   ↓
Normalization Engine
   ↓
Analysis Result
   ↓
Report Builder
   ↓
PDF / DOCX / TXT
```

Do not independently recompute:

- candidate keys
- closure
- 2NF
- 3NF
- 4NF
- decomposition

inside the report generator.

---

# 58. LEARN ↔ ANALYZER INTEGRATION

Every important lesson should provide contextual actions.

Examples:

```text
Learn 2NF

[Open Analyzer]
[Try Example]
```

The example must be clearly labeled:

```text
Load example
```

and must require the user's action.

Never overwrite the user's current analysis silently.

---

# 59. ANALYZER ↔ LEARN INTEGRATION

From an analysis result:

```text
Why 2NF failed
```

allow:

```text
[Learn 2NF]
```

From a 4NF MVD violation:

```text
[Learn about MVDs]
```

This creates a closed educational loop.

---

# 60. HELP ↔ ANALYZER INTEGRATION

When Help explains a feature, provide a contextual action:

```text
Candidate Keys
[Open Candidate Key Analyzer]
```

```text
Attribute Closure
[Open Closure Lab]
```

```text
Experiment Mode
[Open Experiment Mode]
```

Avoid dead-end documentation.

---

# 61. DAY/NIGHT MODE

Audit all Phase 10 components.

Verify:

- Learn pages
- video container
- resource cards/list
- tables
- Help sections
- Developed By
- report dialog
- download options
- code/notation blocks

No light-only hardcoded background should remain.

---

# 62. DARK MODE DESIGN

Use the same restrained visual system.

Dark mode should use:

- deep charcoal/navy surfaces
- strong text contrast
- muted borders
- restrained accent
- readable monospace notation
- clear status indicators

Avoid pure black backgrounds everywhere.

---

# 63. TYPOGRAPHY

Use:

### Normal UI
Professional readable sans-serif.

### DBMS notation
Monospace.

Examples:

```text
A → B
A →→ C
AB+
R(A,B,C,D)
```

This should visually distinguish mathematical/database syntax from prose.

---

# 64. MOBILE/RESPONSIVE CONSIDERATION

The application is desktop-first, but Phase 10 pages should not break on narrower screens.

For Learn:

```text
sidebar
→ collapses into topic selector
```

For Help:

```text
two-column
→ single-column
```

For Developed By:

```text
multi-column
→ stacked
```

For Download:

```text
dialog remains usable
```

Do not redesign the application around mobile.

---

# 65. ACCESSIBILITY

Learn:

- semantic headings
- keyboard navigation
- accessible video controls
- descriptive links

Help:

- expandable sections must be keyboard accessible

Developed By:

- meaningful alt text for actual student photos

Download:

- format controls need labels
- generation status should be announced

---

# 66. LEARN SEARCH

Add a small topic search if practical.

It should filter existing learning content by:

- title
- topic
- keywords

Do not add an LLM-based semantic search.

A simple local search is sufficient.

Example:

```text
Search Learn:
[ partial dependency                 ]

Results:
2NF
Functional Dependencies
```

---

# 67. LEARN PROGRESS — OPTIONAL

A lightweight session-only indicator can show:

```text
Topics explored: 5 / 12
```

But do not turn it into a gamification system unless useful.

Never create fake completion statistics.

Do not add leaderboards, points, streaks, or badges unless explicitly requested.

---

# 68. HELP SEARCH — OPTIONAL

A simple local search can be added if the Help section becomes long.

Search should match:

- section titles
- keywords
- commands
- errors

No external search dependency.

---

# 69. ACADEMIC REFERENCE PRESENTATION

For books/papers/resources, use a clean academic format.

Example:

```text
Database System Concepts
Authors: ...
Edition: ...
Type: Book

[Open Resource]
```

For a paper:

```text
Paper Title
Authors
Venue / Publication information
Topic
[Open Paper]
```

Do not invent bibliographic details.

---

# 70. IMPORTANT RESOURCE RULE

Do not claim a resource is an official source unless it actually is.

Do not use random SEO articles simply to fill space.

Prefer:

1. textbooks
2. university course materials
3. established educational websites
4. peer-reviewed papers
5. credible educational videos

---

# 71. REPORT FIGURE CAPTURE

Create a report-visualization adapter for Phase 8.

Conceptually:

```ts
interface ReportFigure {
  id: string;
  title: string;
  imageData: string | Blob;
  format: "png" | "svg";
  caption?: string;
}
```

The report builder should request figures from the visualization layer without tightly coupling itself to React components.

---

# 72. DO NOT SCREENSHOT THE ENTIRE UI

Reports should contain clean report-specific figures, not arbitrary screenshots of the browser.

For example:

Good:

```text
Dependency Graph
```

Bad:

```text
Entire Analyzer page screenshot
```

unless the user explicitly chooses a full interface snapshot later.

---

# 73. REPORT ACCESSIBILITY

Generated text/documents should remain understandable even if figures are missing.

Every figure should have:

- title
- caption
- textual explanation

Example:

```text
Figure: Dependency Graph

Description:
The graph shows A → B and B → C, with A as the selected determinant.
```

---

# 74. DEVELOPED BY — PROJECT CONTRIBUTIONS

Allow each team member to specify:

```text
Contribution:
Frontend / Backend / DBMS Engine / Visualization / Testing
```

This is useful for final project demonstration.

Do not fabricate contributions.

Make them editable.

---

# 75. PROJECT INFORMATION CONFIGURATION

Centralize:

```ts
interface ProjectInfo {
  title: string;
  subtitle?: string;
  guide: Guide;
  members: TeamMember[];
}
```

This allows final-semester edits without searching through the codebase.

---

# 76. HELP — PROJECT LIMITATIONS

Explain important limitations honestly.

Examples:

### 1NF
Actual cell-level atomicity requires tuple data.

### Candidate keys
Automatic discovery may be computationally expensive for very large schemas.

### 4NF
The analyzer depends on MVDs supplied by the user unless inference mechanisms are explicitly implemented.

### Lossless Join
Verification is performed by the implemented formal method, not merely visual overlap.

This increases academic credibility.

---

# 77. FINAL SITE INFORMATION ARCHITECTURE

The final application should feel like:

```text
HOME
 │
 ├── ANALYZER
 │    ├── Input
 │    ├── Analysis
 │    ├── Journey
 │    ├── Graph
 │    ├── Closure
 │    ├── Decomposition
 │    ├── Verification
 │    ├── Experiment
 │    └── Assistant
 │
 ├── LEARN
 │    ├── Foundations
 │    ├── FDs
 │    ├── Keys
 │    ├── Closure
 │    ├── 1NF
 │    ├── 2NF
 │    ├── 3NF
 │    ├── 4NF
 │    ├── Decomposition
 │    ├── Lossless Join
 │    └── Dependency Preservation
 │
 ├── HELP
 │
 ├── HISTORY
 │
 └── DEVELOPED BY
```

Download is contextual to an analysis.

---

# 78. FINAL USER JOURNEY

A first-time student should be able to follow:

```text
Home
  ↓
Learn basic concepts
  ↓
Open Analyzer
  ↓
Enter relation
  ↓
Enter dependencies
  ↓
Run Analysis
  ↓
See 1NF → 4NF journey
  ↓
Click violation
  ↓
Read Why
  ↓
Explore dependency graph
  ↓
Calculate closure
  ↓
Experiment
  ↓
Read Help when needed
  ↓
Download report
```

No step should require external instructions.

---

# 79. TESTING — LEARN

Test:

- every topic route/section loads
- topic navigation works
- topic links are correct
- examples load only after explicit action
- Learn → Analyzer navigation works
- Analyzer → Learn navigation works
- video component handles unavailable source
- resource links render correctly
- search/filter works if implemented
- dark mode works

---

# 80. TESTING — HELP

Test:

- all mandatory instructions are present
- navigation anchors work
- input syntax matches parser
- controls listed actually exist
- common-error examples match validation behavior
- no outdated functionality is documented

This last requirement is important.

Documentation must not drift away from the implementation.

---

# 81. TESTING — DEVELOPED BY

Test:

- members render from configuration
- photo fallback works
- names/register numbers render correctly
- guide information is correct
- multiple team members work
- dark mode works

---

# 82. TESTING — REPORTS

For each format:

## PDF
Verify:

- valid PDF
- expected title
- relation name
- actual result
- tables/figures when selected

## DOCX
Verify:

- valid document
- headings
- tables
- actual data

## TXT
Verify:

- readable
- complete selected sections
- no binary content

---

# 83. TESTING — CROSS-FEATURE CONSISTENCY

This is extremely important.

Use one real analysis and verify that:

```text
Analyzer result
=
Journey result
=
Assistant answer
=
Report result
=
History result
```

No feature should display a contradictory result.

---

# 84. REPORT REPRODUCIBILITY

Given the same:

```text
Input
+
Engine Version
```

the report should be reproducible under the same implementation.

Do not include random generated explanations or random exercise content in the core report.

---

# 85. NO FAKE ACADEMIC CONTENT

Do not create:

- fake research papers
- fake authors
- fake citations
- fake professor information
- fake student details
- fake project achievements
- fake result statistics

Missing project-specific data should be represented with editable placeholders/configuration, not invented facts.

---

# 86. EMPTY STATES

Design good empty states.

### Learn

```text
Select a topic to begin.
```

### History

```text
No analyses yet.
Run an analysis to create your first history entry.
```

### Download

```text
Run an analysis before generating a report.
```

### Developed By

If member data is not configured:

```text
Team details have not been configured yet.
```

---

# 87. LOADING STATES

For report generation:

```text
Preparing analysis
Collecting reasoning
Rendering figures
Building document
Finalizing file
```

Do not fake delays.

Use actual progress only if measurable.

Otherwise use a simple loading state.

---

# 88. REPORT GENERATION PERFORMANCE

Large dependency graphs may make PDF generation expensive.

Avoid blocking the UI unnecessarily.

Show:

```text
Generating report…
```

and maintain the existing analysis state.

Do not rerun unrelated analysis unless necessary.

---

# 89. SECURITY / FILE HANDLING

Sanitize:

- relation name
- report filename
- generated asset names

Do not allow arbitrary filesystem paths from user input.

Generated reports should be placed in controlled temporary/output locations.

---

# 90. NO SERVER-SIDE PERSONAL DATA PERSISTENCE REQUIRED

The application does not need accounts for Phase 10.

Generated reports can be downloaded directly.

Team/student information comes from project configuration, not user registration.

---

# 91. DESIGN QUALITY BAR

Learn should feel like a technical textbook transformed into an interactive lab.

Help should feel like a polished software manual.

Developed By should feel like an academic project page.

Download should feel like professional report generation.

The four sections must still visually belong to the same product.

---

# 92. PROFESSOR DEMONSTRATION MODE

Design the navigation so a professor can quickly demonstrate:

```text
Analyzer
→ real input
→ normalization result
→ graph
→ reasoning
→ experiment
→ report
```

Then:

```text
Learn
→ concept
→ video
→ references
```

Then:

```text
Help
→ workflow
```

Then:

```text
Developed By
→ team
→ guide
```

This supports the demonstration rubric.

---

# 93. PROJECT PRESENTATION READINESS

The Developed By page should allow each team member's contribution to be clearly stated.

Example:

```text
Member
Frontend & Visualization

Member
Normalization Engine & Backend

Member
Testing & Documentation
```

Only use actual contributions entered by the team.

---

# 94. FINAL POLISH PASS

Before completing Phase 10, inspect:

### Typography
Consistent.

### Spacing
Consistent.

### Tables
Readable in both themes.

### Notation
Correctly formatted.

### Buttons
Consistent.

### Links
Functional.

### Figures
Readable.

### Download
Works.

### Learn
Educational.

### Help
Actionable.

### Developed By
Editable.

### Theme
Complete.

---

# 95. PHASE 10 ACCEPTANCE TEST — FIRST-TIME USER

Pretend you know nothing about the application.

Can you answer:

1. What does this website do?
2. What is 2NF?
3. How do I enter an FD?
4. How do I calculate closure?
5. What does “3NF failed” mean?
6. How do I inspect why?
7. How do I experiment?
8. How do I download my analysis?
9. Who developed it?
10. Who guided it?

If any answer requires leaving the application unnecessarily, improve the relevant Learn/Help flow.

---

# 96. PHASE 10 ACCEPTANCE TEST — REPORT

Run a real analysis.

Then generate:

```text
PDF
DOCX
TXT
```

Verify all three contain the same core analytical facts.

Especially:

- input
- candidate keys
- relevant dependencies
- closures
- NF results
- violations
- decomposition
- verification

---

# 97. PHASE 10 ACCEPTANCE TEST — ACADEMIC REVIEW

A professor should be able to inspect the application and find:

```text
Learn
Help
Developed By
Guided By
Download
Day/Night
```

without hunting through the application.

These are mandatory structural requirements and therefore must have clear discoverability.

---

# 98. FINAL DEFINITION OF DONE

Phase 10 is complete only when:

- Learn is fully implemented
- all requested core concepts are covered
- explanations are mathematically accurate
- interactive examples are available where appropriate
- educational video component exists
- references/resources are structured and verified
- Help/user manual is complete
- exact implemented input syntax is documented
- controls are documented
- output interpretation is documented
- Developed By page exists
- team members are configurable
- student photos are supported
- Guided By shows:
  - Dr. Swaminathan A
  - Assistant Professor
- report generation works
- PDF works
- DOCX works
- TXT works
- reports contain actual user analysis
- relevant figures can be included
- Day/Night works across new sections
- accessibility is addressed
- no fake academic data is used
- no previous phase functionality regresses
- cross-feature consistency is verified

---

# 99. FINAL PROJECT ARCHITECTURE AFTER PHASE 10

The application should now conceptually be:

```text
                         NORMALIZATION LAB
                                │
        ┌───────────────────────┼────────────────────────┐
        │                       │                        │
        ▼                       ▼                        ▼
      LEARN                  ANALYZER                  HELP
        │                       │                        │
        │            ┌──────────┼──────────┐             │
        │            │          │          │             │
        │            ▼          ▼          ▼             │
        │          Result     Graph     Reasoning         │
        │                       │                        │
        │                       ▼                        │
        │                  Experiment                    │
        │                       │                        │
        │                       ▼                        │
        │                  Assistant                    │
        │                       │                        │
        └───────────────────────┼────────────────────────┘
                                │
                                ▼
                         DOWNLOAD REPORT
                                │
                 ┌──────────────┼──────────────┐
                 ▼              ▼              ▼
                PDF            DOCX            TXT

                                │
                                ▼
                         DEVELOPED BY
                                │
                                ▼
                       GUIDED BY / TEAM
```

---

# 100. FINAL IMPLEMENTATION RULE

**Phase 10 must complete the mandatory academic website requirements without weakening the technical core.**

The final website should not merely say:

> “This is a normalization tool.”

It should demonstrate:

> **“This is an interactive DBMS learning laboratory that can analyze a user's own relation, explain the mathematical reasoning, let the user experiment, teach the underlying concepts, document the full process, and generate a professional report.”**

Do not duplicate the normalization engine.

Do not invent academic information.

Do not add unnecessary AI.

Do not create fake resources.

Do not make Learn/Help passive pages disconnected from the Analyzer.

Everything should connect back to the same authoritative analysis model created in Phases 2–9.
