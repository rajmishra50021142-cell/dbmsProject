# 1NF–4NF Normalization Visualizer & Analyzer
## Complete Project Reference Specification for Antigravity

> **Purpose of this document:** This is the persistent master reference for the entire project.  
> Antigravity/coding agents should treat this document as the authoritative project context when implementing the project in parts.  
> Detailed implementation prompts for each individual phase will be supplied separately later. This document explains the complete product, requirements, architecture, functionality, UI/UX direction, technical expectations, creative features, mandatory rubric requirements, and phase-by-phase development strategy.

---

# 1. Project Identity

## Project Title

**1NF–4NF Normalization Visualizer & Analyzer**

Possible product/UI name:

**Normalization Lab**

The academic/project title should remain explicit about the assigned topic:

> **1NF–4NF Normalization Visualizer & Analyzer**

The UI may use a shorter product identity such as **Normalization Lab**, while the formal title remains visible in appropriate places.

## Course

**Database Systems / Database Management Systems (DBMS)**

## Assigned Topic

**First Normal Form (1NF), Second Normal Form (2NF), Third Normal Form (3NF), and Fourth Normal Form (4NF)**

## Project Type

Interactive educational web application / learning and analysis tool.

## Primary Goal

Build an educational, interactive, technically correct web application that allows a student to:

1. Learn normalization concepts from 1NF through 4NF.
2. Enter their own relational normalization problem.
3. Define attributes, candidate keys, functional dependencies, multivalued dependencies, and optional sample data.
4. Automatically analyze the relation using deterministic DBMS algorithms.
5. Determine the normal form satisfied and identify violations.
6. Explain **why** a relation does or does not satisfy each normal form.
7. Demonstrate the normalization/decomposition process step-by-step.
8. Visually represent dependencies, closures, normalization stages, and decompositions.
9. Experiment by changing inputs and re-running the analysis.
10. Generate complete downloadable reports.
11. Use a contextual, rule-based chatbot/assistant for relevant DBMS questions **without requiring a paid LLM API**.
12. Satisfy all mandatory website sections and evaluation-rubric requirements.

---

# 2. Important Design Philosophy

This project must **not** be treated as:

- a generic AI chatbot,
- a simple boolean normal-form checker,
- a static educational website,
- a generic SaaS dashboard,
- a collection of four disconnected pages,
- or a visually flashy site with shallow DBMS logic.

It should feel like a **specialized interactive learning laboratory for database normalization**.

The central experience is:

> **Enter a schema → understand the dependencies → analyze 1NF→4NF → see exactly why a violation occurs → watch the decomposition → experiment → understand the result → download the execution report.**

The application should be both academically rigorous and approachable to a first-time learner.

---

# 3. Decisions Already Made

The following decisions are final unless explicitly changed later.

## Authentication

No login/user accounts for now.

The application should work without requiring sign-in.

Analysis history may use local/browser persistence initially, or a lightweight backend persistence mechanism if useful.

## User Input

Users **must be allowed to enter their own inputs**.

The application should also provide pre-built examples.

There should be:

- guided/structured input mode,
- advanced/raw text input mode,
- predefined sample cases.

## Candidate Keys

Support both:

1. User-provided candidate keys.
2. Automatic candidate-key identification by the engine.

The system should also explain **how candidate keys were derived**.

It must support multiple candidate keys and composite candidate keys.

## Sample Data

Sample tuples/data are optional.

The system should not require sample data for all analyses.

FD/MVD-based normalization analysis should work from schema/dependency input.

Sample data should primarily support 1NF/data-level demonstrations and optional visualization.

## Multiple Dependencies

Users must be able to enter multiple functional dependencies and multiple multivalued dependencies.

## Download

Support all three:

- PDF
- DOCX/document
- TXT

Reports should contain the full execution/processing history.

## Design Target

Desktop-first.

The site should still be responsive on smaller displays, but the primary design should target laptop/desktop use because the professor is likely to inspect it that way.

## AI / LLM Dependency

No paid LLM integration for now.

The application must not depend on an external LLM API for core functionality.

The project should include a contextual chatbot/assistant that can answer relevant questions using the deterministic analysis engine and a rule/knowledge-based explanation layer.

A real LLM can be considered a future enhancement, but it is not required for the current project.

---

# 4. Evaluation Rubric the Project Must Satisfy

The following requirements come directly from the detailed evaluation rubric supplied for the project.

## 4.1 Problem Understanding & Requirements — 1 Mark

The team must clearly understand:

- the assigned topic/problem,
- objectives,
- inputs,
- expected outputs,
- functional requirements.

The project documentation and DA1 presentation must clearly explain these.

---

# 5. Core Functionality & Technical Implementation — 2 Marks

The project must demonstrate:

- correct implementation of core functionality,
- correct algorithms and logic,
- correct DBMS processing,
- correct visualization,
- correct processing of user inputs,
- appropriate outputs.

The implementation must be genuine and functional, not merely a static interface.

The normalization result must come from deterministic application logic rather than an LLM.

---

# 6. Website Structure & Mandatory Sections — 1 Mark

The website **must** contain the following.

## 6.1 Learn

The Learn tab must be prominently available in navigation, preferably toward the top-right.

It must contain:

### Concept Explanation

Explain the assigned topic clearly and concisely.

Cover all relevant concepts of:

- 1NF
- 2NF
- 3NF
- 4NF
- functional dependencies
- multivalued dependencies
- candidate/superkeys
- prime/non-prime attributes
- attribute closure
- decomposition
- related normalization concepts

The material must be well organized and educational.

### Animated / Educational Video

Include a relevant educational or animated video.

It may be embedded from YouTube or another suitable educational source.

The video should visually aid understanding.

### References

Clearly acknowledge:

- books,
- websites,
- research papers,
- educational resources,
- videos,
- other learning materials used.

Proper attribution is mandatory.

---

# 7. Developed By — Mandatory

The Developed By section must contain:

- student photograph,
- student name,
- register number.

For a team project, display all members.

Also display:

**Guided By**  
**Dr. Swaminathan A**  
**Assistant Professor**

The project must use configuration-driven team information so names, register numbers, photographs and roles can be changed later without redesigning the page.

---

# 8. Help — Mandatory

Help must function as the user manual.

It must explain:

- what the website/application does,
- what inputs are available,
- how to provide inputs,
- what each button/control does,
- how processing takes place,
- how to interpret the output.

Instructions must be simple and step-by-step so a new user can operate the application using only the Help section.

---

# 9. Download — Mandatory

The website must have a Download feature.

When clicked, it should generate a report containing:

- user inputs,
- processing steps,
- intermediate results where applicable,
- final output,
- graphs,
- tables,
- figures where applicable.

Supported formats:

- PDF
- DOCX/document
- TXT

The report must clearly document the complete execution/processing performed by the application.

---

# 10. Day/Night Mode — Mandatory

Provide a global Day/Night Mode toggle:

- ☀️ Day Mode
- 🌙 Night Mode

Both modes must remain:

- readable,
- accessible,
- consistent,
- visually polished.

Dark mode should not just invert colors. It should have a deliberate color system and preserve graph/table readability.

---

# 11. System Design & UI/UX — 1 Mark

The website must demonstrate:

- proper organization of modules,
- logical navigation,
- user-friendly interface,
- clear layout,
- proper placement of buttons and inputs,
- readable text and output,
- consistent design,
- ease of use for first-time users.

---

# 12. Demonstration & Explanation — 1 Mark

During DA1, the team must:

- demonstrate the working website,
- explain major modules,
- explain inputs and outputs,
- demonstrate core functionality,
- explain technical implementation,
- explain each team member's contribution.

Even though this is a team project, team-member information should remain editable later.

---

# 13. Testing & Project Progress — 2 Marks

The team must demonstrate:

- sufficient project progress,
- testing using appropriate inputs,
- correct handling of different cases,
- error handling,
- output verification,
- evidence that the website is not merely a static UI.

Testing must cover real normalization scenarios and edge/error cases.

---

# 14. Creativity & Innovation — 2 Marks

Creativity is evaluated based on:

- innovative presentation,
- useful additional features,
- creative visualization,
- improved user interaction,
- unique approach to solving the problem,
- meaningful features beyond mandatory requirements.

Simply implementing the mandatory features is not sufficient for full creativity marks.

The selected creative features are:

1. **Interactive Normalization Journey**
2. **Interactive Dependency Graph**
3. **Attribute Closure Visualizer**
4. **What-If / Experiment Mode**

Optional later enhancement:

- Practice Mode

Practice Mode is **not compulsory**.

---

# 15. Professor's Example Specifications — Design Implications

The professor provided examples/specifications related to:

- BCNF Visualizer,
- 4NF Visualizer,
- 5NF Analyzer.

The project should borrow the important **product philosophy** from those examples while adapting it specifically to 1NF–4NF.

Important implications:

- interactive educational application,
- meaningful user inputs,
- graphical outputs,
- textual explanations,
- validation,
- simulation/visualization,
- analysis,
- decomposition,
- sample cases,
- documentation,
- video,
- references,
- report/export,
- accessible UX,
- fast normal operations,
- optional advanced assistance.

The project should therefore be more than a simple checker.

---

# 16. Complete Functional Scope

The application should support the following end-to-end workflow:

```text
User opens website
        ↓
Learns about normalization if needed
        ↓
Opens Analyzer
        ↓
Creates or loads a relation
        ↓
Defines attributes
        ↓
Defines candidate keys or asks engine to find them
        ↓
Defines functional dependencies
        ↓
Defines multivalued dependencies when needed
        ↓
Optionally enters sample tuples
        ↓
Input validation
        ↓
Dependency analysis
        ↓
Candidate-key / attribute-closure analysis
        ↓
1NF analysis
        ↓
2NF analysis
        ↓
3NF analysis
        ↓
4NF analysis
        ↓
Violation explanation
        ↓
Decomposition
        ↓
Lossless/dependency-preservation information where applicable
        ↓
Interactive visualizations
        ↓
What-If experimentation
        ↓
Contextual explanation/chat assistant
        ↓
Download complete report
```

---

# 17. Input System

The input system must be sophisticated enough for genuine student use but simple enough for beginners.

## 17.1 Relation Name

Example:

```text
ENROLLMENT
```

## 17.2 Attributes

Example:

```text
StudentID
CourseID
StudentName
CourseName
Grade
```

Support:

- add,
- edit,
- delete,
- reorder where useful.

## 17.3 Candidate Keys

Allow multiple candidate keys.

Example:

```text
(StudentID, CourseID)
```

Support:

- single-attribute keys,
- composite keys,
- multiple candidate keys.

The user may either enter them manually or ask the engine to find them.

## 17.4 Functional Dependencies

Use a structured builder.

Example:

```text
[ StudentID ] → [ StudentName ]

[ CourseID ] → [ CourseName ]

[ StudentID, CourseID ] → [ Grade ]
```

Allow multiple attributes on either side.

Do not force the entire dependency set into one unstructured text box.

## 17.5 Multivalued Dependencies

Separate builder:

```text
[ Student ] →→ [ Hobby ]

[ Student ] →→ [ Language ]
```

## 17.6 Raw / Advanced Input Mode

Allow users to enter a compact textual representation.

Example:

```text
R(A,B,C,D,E)

FD:
A -> B
B -> C

MVD:
A ->> D
```

The parser must validate it and convert it into the same internal representation used by the structured mode.

## 17.7 Sample Data

Optional table builder:

```text
+ Add Row
```

Useful for:

- 1NF demonstrations,
- data-level dependency examples,
- visual demonstrations.

The application must not require sample data when dependency-based analysis is sufficient.

---

# 18. Input Validation

The system must provide meaningful validation.

Cases include:

- empty relation,
- duplicate attributes,
- invalid attribute names,
- dependency references to unknown attributes,
- malformed FD,
- malformed MVD,
- invalid candidate key,
- empty left/right side where not valid,
- duplicate dependency,
- inconsistent sample-data columns,
- invalid tuples,
- conflicting/malformed raw input.

Errors must be human-readable.

Never expose raw programming errors such as stack traces to ordinary users.

Example:

Instead of:

```text
TypeError: cannot read...
```

show:

> **Invalid Functional Dependency**  
> `StudentID →` is incomplete. Please specify at least one attribute on the right-hand side.

---

# 19. DBMS Knowledge / Theory Coverage

The application must cover **all relevant concepts under the assigned 1NF–4NF topic**, not a simplified version.

The implementation and educational content should include:

## Foundations

- relation/schema,
- attributes,
- tuples,
- domains where relevant,
- superkeys,
- candidate keys,
- composite candidate keys,
- prime attributes,
- non-prime attributes,
- functional dependencies,
- trivial and non-trivial functional dependencies,
- attribute closure,
- implication/closure of functional dependencies where relevant,
- minimal/canonical cover where relevant.

## 1NF

Cover:

- atomic values,
- indivisibility,
- repeating groups,
- multi-valued/non-atomic cells,
- transformation to 1NF,
- explanation of violations,
- data-level visualization where sample data exists.

## 2NF

Cover:

- 1NF prerequisite,
- composite candidate keys,
- proper subsets of candidate keys,
- partial functional dependencies,
- non-prime attributes,
- detection of partial dependencies for every relevant composite key,
- decomposition,
- explanation of why decomposition fixes the violation.

## 3NF

Cover:

- 2NF prerequisite,
- transitive dependency,
- 3NF condition,
- superkey condition,
- prime-attribute alternative in the condition,
- checking each relevant FD,
- identifying all violating dependencies,
- decomposition,
- explanation.

## 4NF

Cover:

- multivalued dependencies,
- trivial and non-trivial MVDs,
- superkey requirement,
- independent multivalued facts,
- detection of 4NF violations,
- decomposition,
- explanation,
- MVD visualization.

## Decomposition concepts

Where relevant and supported:

- lossless decomposition,
- dependency preservation,
- relationship between dependency and decomposition,
- before/after schemas,
- final normalized result.

The agent must not silently omit concepts merely because they are difficult.

---

# 20. 1NF Engine

The 1NF module should determine whether values violate atomicity/1NF where information is available.

Example:

```text
Student | Courses
Raj     | DBMS, OS, CN
```

should result in a clear explanation such as:

> The `Courses` value contains multiple logical values. The relation therefore violates the atomic-value requirement for 1NF.

Show the transformation:

```text
Before
Student | Courses
Raj     | DBMS, OS

After
Student | Course
Raj     | DBMS
Raj     | OS
```

If sample data is not provided, the application must not falsely claim to have observed a data-level 1NF violation. It should clearly explain what can and cannot be inferred from the supplied input.

---

# 21. 2NF Engine

The 2NF engine must:

1. Verify 1NF prerequisite.
2. Determine candidate keys.
3. Determine prime/non-prime attributes.
4. Examine every composite candidate key.
5. Consider proper subsets of each composite candidate key.
6. Check whether non-prime attributes depend on those subsets.
7. Identify all relevant partial dependencies.
8. Explain every violation.
9. Suggest/perform decomposition.
10. Produce structured intermediate results for visualization and report generation.

Example:

```text
Candidate Key:
(StudentID, CourseID)

FD:
StudentID → StudentName

StudentID is a proper subset of:
(StudentID, CourseID)

StudentName is non-prime.

Therefore:
Partial dependency exists.
2NF is violated.
```

---

# 22. 3NF Engine

For every relevant FD:

```text
X → A
```

the engine should evaluate the correct 3NF condition.

The result should explain:

- determinant `X`,
- dependent attribute `A`,
- whether `X` is a superkey,
- whether `A` is prime,
- whether the dependency violates 3NF,
- which relation/key context is relevant.

Then show decomposition where appropriate.

Example:

```text
EMPLOYEE(EmpID, EmpName, DeptID, DeptName)

EmpID → EmpName, DeptID
DeptID → DeptName
```

Explain the transitive relationship:

```text
EmpID → DeptID
DeptID → DeptName
```

and identify the resulting 3NF issue.

---

# 23. 4NF Engine

The 4NF engine must genuinely process MVDs.

Example:

```text
STUDENT(Student, Hobby, Language)

Student →→ Hobby
Student →→ Language
```

The system should:

- distinguish FD from MVD,
- identify trivial/non-trivial MVDs,
- check whether the determinant is a superkey,
- identify violations,
- explain the independent multivalued facts,
- perform the appropriate decomposition,
- visualize the split.

Possible output:

```text
STUDENT_HOBBY(Student, Hobby)

STUDENT_LANGUAGE(Student, Language)
```

---

# 24. Dependency and Key Engine

## Attribute Closure

The engine must calculate:

```text
X+
```

and preserve every reasoning step.

Example:

```text
FDs:
A → B
B → C
C → D

Initial:
{A}

Apply A → B:
{A,B}

Apply B → C:
{A,B,C}

Apply C → D:
{A,B,C,D}

Therefore:
A+ = {A,B,C,D}
```

The UI should visualize these steps.

## Candidate-Key Identification

The engine should be capable of deriving candidate keys from the supplied FDs.

It should:

- compute closures,
- identify superkeys,
- test minimality,
- return candidate keys,
- support multiple candidate keys,
- explain the reasoning.

Example explanation:

```text
Find Candidate Key

1. Identify attributes not derivable from any RHS.
2. Include necessary attributes.
3. Compute closure.
4. If closure covers all attributes, it is a superkey.
5. Remove attributes and re-test to verify minimality.

Result:
(StudentID, CourseID)
```

---

# 25. Prime and Non-Prime Attribute Identification

Once candidate keys are known, automatically derive:

```text
Prime:
StudentID
CourseID

Non-prime:
StudentName
CourseName
Grade
```

Do not force students to manually label them unless teaching mode offers it as an exercise.

---

# 26. Decomposition Engine

Decomposition should be a dedicated subsystem.

It should produce:

- source relation,
- violating dependency,
- decomposition rule/reason,
- generated relations,
- resulting keys where relevant,
- explanation,
- verification.

The UI should show:

```text
BEFORE
R(A,B,C,D)

        ↓
Violation:
A → B

        ↓

AFTER
R1(A,B)
R2(A,C,D)
```

The engine should preserve enough metadata for the UI to animate the transformation.

---

# 27. Lossless Join and Dependency Preservation

Where included, provide educational verification.

Example:

```text
Lossless decomposition
✓

Dependency preservation
✓
```

or explain when preservation is not achieved.

The project should not fabricate these results. The verification engine must use documented logic.

---

# 28. Unified Normalization Pipeline

The core analysis should appear as an integrated journey:

```text
Original Relation
       ↓
Input Validation
       ↓
Dependency / Key Analysis
       ↓
1NF
       ↓
2NF
       ↓
3NF
       ↓
4NF
       ↓
Decomposition / Verification
       ↓
Final Normalized Schema
```

If an earlier required normal form fails, the UI should clearly communicate the prerequisite relationship before progressing.

The application should preserve the original user input and show intermediate states.

---

# 29. Important Result Model

Each analysis stage should return rich structured information, not just a boolean.

Conceptually:

```text
NormalFormResult:
    stage
    status
    prerequisites
    violations[]
    dependencies_involved[]
    attributes_involved[]
    explanation
    decomposition
    intermediate_relations[]
    verification
```

This allows the same analysis data to drive:

- visualizations,
- explanation panel,
- chatbot,
- download reports,
- history,
- testing.

---

# 30. "Why?" / "Show Logic" Feature

Every major result should have an explainer action.

Example:

```text
2NF ✗
[ Why? ]
```

Clicking it should reveal a deterministic reasoning chain:

```text
WHY THIS FAILED

Candidate Key:
(StudentID, CourseID)

Dependency:
StudentID → StudentName

StudentID ⊂ (StudentID, CourseID)

StudentName:
Non-prime

Therefore:
Partial dependency exists

Conclusion:
2NF is violated.
```

No LLM is needed.

The explanation should be generated dynamically from the analysis result, not hardcoded only for one example.

Equivalent explanatory logic should exist for:

- 1NF,
- 2NF,
- 3NF,
- 4NF,
- candidate keys,
- attribute closure,
- decomposition,
- lossless/dependency-preservation results where supported.

---

# 31. Contextual Chatbot / Normalization Assistant

A small chatbot-style feature should exist because the user wants a question-answering interaction.

Important:

## It is not a paid LLM service.

Name suggestion:

**Normalization Assistant**

or:

**DBMS Learning Assistant**

Avoid presenting it as a generic "AI" capability when it is rule-based.

## Supported question types

Examples:

- Why is this relation not in 2NF?
- Why is this a partial dependency?
- Why is this relation not in 3NF?
- What is causing the 3NF violation?
- Why is this MVD relevant to 4NF?
- Why is this relation not in 4NF?
- How did you find my candidate key?
- Show my attribute closure.
- Why did you decompose the relation?
- Explain this in simpler words.
- What changed after my dependency edit?
- What is the difference between 2NF and 3NF?
- What is a prime attribute?

The assistant should use the current analysis context.

## Answer generation approach

```text
User question
      ↓
Question/intent recognition
      ↓
Current analysis context
      ↓
Rule/knowledge lookup
      ↓
Deterministic response template
      ↓
Student-friendly answer
```

Do not fabricate information.

If the system does not have enough information:

> "I need a candidate key / dependency definition to answer that question. Please complete the relevant input first."

## Future LLM

A future LLM can be plugged into the assistant later, but this version must work completely without an API key.

---

# 32. Creativity Feature 1 — Interactive Normalization Journey

This is the primary visual feature.

Display:

```text
INPUT → 1NF → 2NF → 3NF → 4NF
```

Each stage is clickable.

When a user enters an invalid relation:

```text
2NF ✗
```

clicking it should show:

- offending dependency,
- relevant key,
- relevant attributes,
- explanation,
- decomposition.

The transition from one stage to another should be animated.

The user should be able to move backward and forward.

This is not merely decorative animation; it must communicate the algorithmic state.

---

# 33. Creativity Feature 2 — Interactive Dependency Graph

Convert user-entered FDs and MVDs into visual relationships.

Example FD:

```text
StudentID ─────────→ StudentName
```

Example MVD:

```text
Student ─────────→→ Hobby
```

Use visibly distinct notation for FD and MVD.

Interactions:

- click a node,
- click an edge/dependency,
- highlight involved attributes,
- highlight dependent relations,
- show explanation,
- show affected normal form,
- show violation status.

Example:

```text
StudentID → StudentName

Type:
Functional Dependency

Relevant stage:
2NF

Status:
Partial dependency

Reason:
StudentID is a proper subset of the composite candidate key.
```

---

# 34. Creativity Feature 3 — Attribute Closure Visualizer

Dedicated interactive visualization.

Input:

```text
FDs:
A → B
B → C
C → D

Attribute:
A
```

Animation:

```text
A
↓
A,B
↓
A,B,C
↓
A,B,C,D
```

Output:

```text
A+ = {A,B,C,D}
```

If it covers the whole relation, explain:

> `A` is a superkey for this relation.

If minimal, explain candidate-key status.

This feature should also integrate with the automatic candidate-key finder.

---

# 35. Creativity Feature 4 — What-If / Experiment Mode

Allow a user to alter:

- attributes,
- candidate keys,
- FDs,
- MVDs,
- sample data.

Then choose:

**Re-analyze**

The system compares old and new states.

Example:

```text
BEFORE
2NF ✗

AFTER
2NF ✓
```

Display:

> What changed?

with:

- dependency removed/added,
- key changed,
- affected normal form,
- new violation status,
- new decomposition.

This should feel like a learning experiment.

---

# 36. Optional Practice Mode

Practice Mode is **not compulsory**.

It may be implemented later if time permits.

Possible functionality:

- generated/predefined problems,
- answer questions,
- identify candidate keys,
- identify the violated normal form,
- identify a partial/transitive/MVD dependency,
- receive deterministic explanations.

Do not let Practice Mode delay or compromise the core implementation.

---

# 37. Before/After Schema Comparison

Provide a visual comparison:

```text
BEFORE
ENROLLMENT
(StudentID, CourseID, StudentName, CourseName, Grade)

AFTER
STUDENT
(StudentID, StudentName)

COURSE
(CourseID, CourseName)

ENROLLMENT
(StudentID, CourseID, Grade)
```

Highlight moved attributes.

Explain why each relation exists.

---

# 38. UI/UX Direction

The UI must be **eye-catching, impactful, and polished**, but must not feel like a generic AI-generated SaaS site.

Target feeling:

> **interactive educational laboratory / technical learning studio**

rather than:

> **AI startup dashboard**

## Avoid

- excessive purple/blue neon gradients,
- giant generic hero copy,
- glassmorphism everywhere,
- floating glowing blobs,
- excessive rounded cards,
- meaningless dashboard widgets,
- constant animations,
- generic "AI powered" badges,
- chat UI dominating the site,
- rainbow color palettes,
- decorative elements that do not aid learning.

## Prefer

- strong information hierarchy,
- editorial/academic visual character,
- purposeful whitespace,
- diagrams as visual anchors,
- subtle borders,
- carefully controlled shadows,
- refined typography,
- clear technical notation,
- restrained accent color,
- functional motion.

---

# 39. UI Inspiration Philosophy

Use established educational/technical products for UX principles rather than copying branding.

Useful references:

## Brilliant

Use as inspiration for:

- interactive learning,
- progressive disclosure,
- diagrams,
- educational feedback,
- focused content.

## Khan Academy

Use for:

- clarity,
- educational hierarchy,
- approachable explanations,
- reducing visual noise.

## Nand2Tetris

Use for:

- structured technical learning,
- step-by-step progression,
- visualizing computer-science ideas.

## CS50

Use for:

- educational storytelling,
- technical concepts presented clearly,
- demonstration-oriented teaching.

## Observable / D3 ecosystem

Use for:

- purposeful data visualization,
- interactive graph behavior,
- transitions that communicate state.

## React Flow / diagram tooling

Use for:

- dependency graphs,
- node/edge interaction,
- visual schema relationships.

Do not copy any site directly. Develop a distinctive visual language for normalization.

---

# 40. Visual Design System

## Light Mode

Suggested direction:

- warm off-white or soft neutral page background,
- dark charcoal text,
- muted gray/silver surfaces,
- one controlled primary accent,
- restrained status colors for success/warning/error.

## Dark Mode

Suggested direction:

- deep charcoal/navy background,
- warm/light text,
- same accent family,
- carefully tuned graph/table colors.

The interface should remain readable in both modes.

## Color Philosophy

The accent is for:

- active stage,
- selected dependency,
- important action,
- focus state.

It should not fill every card or component.

---

# 41. Typography

Use a high-quality, highly readable sans-serif for normal UI.

Use a monospace font selectively for:

- attributes,
- relation notation,
- functional dependencies,
- multivalued dependencies,
- algorithmic output.

Typography should establish hierarchy without relying on huge font sizes.

---

# 42. Motion / Interaction Design

Hover effects and animation are welcome.

Animations must have purpose.

Good interactions include:

- subtle card lift,
- selected dependency highlight,
- animated dependency edge,
- relation decomposition drawing,
- progress step transition,
- expandable explanations,
- smooth tab transitions,
- tooltip appearance,
- button hover/press states,
- subtle schema morphing.

Avoid excessive motion.

Core principle:

> **Animation should explain a state change, not decorate empty space.**

---

# 43. Analyzer Layout

The analyzer is the product's main screen.

A conceptual desktop layout:

```text
┌─────────────────────────────────────────────────────────────────────────┐
│ NORMALIZATION LAB     Analyzer  Learn  Help  Developed By  Download ☀ │
├───────────────────────┬───────────────────────────────┬─────────────────┤
│ INPUT                 │ NORMALIZATION JOURNEY         │ INSIGHT         │
│                       │                               │                 │
│ Relation              │  Input → 1NF → 2NF → 3NF →  │ Current Stage   │
│ [____________]        │  4NF                          │                 │
│                       │                               │ Why?            │
│ Attributes            │      interactive graph       │ Candidate Key   │
│ [+ Add]               │                               │                 │
│                       │                               │ Violation       │
│ Candidate Keys        │                               │                 │
│ [+ Add]               │                               │ Explanation     │
│                       │                               │                 │
│ FDs                   │                               │ Decomposition   │
│ [+ Add FD]            │                               │                 │
│                       │                               │                 │
│ MVDs                  │                               │                 │
│ [+ Add MVD]           │                               │                 │
│                       │                               │                 │
│ Sample Data (opt.)    │                               │                 │
│ [+ Add Row]           │                               │                 │
│                       │                               │                 │
│ [Analyze] [Reset]     │                               │                 │
└───────────────────────┴───────────────────────────────┴─────────────────┘
```

The actual implementation may adapt the layout based on the current task.

---

# 44. Progressive Disclosure

Do not show every advanced concept simultaneously.

Use:

## Basic Mode

- relation,
- attributes,
- candidate keys,
- FDs.

## Advanced Mode

- MVDs,
- sample tuples,
- closure lab,
- lossless analysis,
- dependency preservation,
- advanced details.

This keeps the product approachable without removing functionality.

---

# 45. Core Navigation

Suggested navigation:

```text
Home
Analyzer
Practice (optional)
Learn
History
Help
Developed By
Download
Day/Night
```

Some functions can also appear as contextual actions instead of standalone pages.

Mandatory tabs must remain obvious.

---

# 46. Home Page

The Home page should quickly communicate:

> **1NF–4NF Normalization Visualizer & Analyzer**

Suggested subtitle:

> Learn database normalization by entering a relational schema and watching its dependencies, violations, and decompositions unfold step-by-step.

Primary actions:

- Start Analysis
- Learn Normalization
- Try Example

Show the normalization journey visually:

```text
1NF → 2NF → 3NF → 4NF
```

The home page should be polished but should not dominate the project; the Analyzer is the main product.

---

# 47. Learn Page

The Learn page should teach, not overwhelm.

Suggested sections:

```text
What is Normalization?
Functional Dependencies
Superkeys & Candidate Keys
Attribute Closure
1NF
2NF
3NF
4NF
Decomposition
Lossless Join
Dependency Preservation
```

Use:

- concise explanations,
- diagrams,
- before/after examples,
- interactive mini examples where useful,
- video,
- references.

---

# 48. Help Page

Suggested structure:

```text
What does the application do?
↓
Creating a relation
↓
Adding attributes
↓
Adding candidate keys
↓
Adding FDs
↓
Adding MVDs
↓
Adding sample data
↓
Finding candidate keys
↓
Running analysis
↓
Understanding 1NF/2NF/3NF/4NF
↓
Reading the dependency graph
↓
Using What-If mode
↓
Using the assistant
↓
Downloading a report
↓
Day/Night mode
↓
Common errors
```

---

# 49. Developed By Page

Must include:

- all team members,
- photographs,
- names,
- register numbers,
- roles (optional but useful),
- guide information.

The data should be centralized in a configuration structure.

---

# 50. History

Optional persistence area but useful.

Store:

- analysis title,
- date/time,
- relation name,
- achieved normal form,
- optional summary.

Because authentication is not currently required, history can use:

- browser/local storage,
- or an anonymous local backend record.

Do not require user accounts.

---

# 51. Download Report Design

The report should contain:

## Cover / Identification

- project title,
- analysis title,
- date/time,
- optional user-entered analysis name.

## Input Section

- relation,
- attributes,
- candidate keys supplied,
- candidate keys derived,
- FDs,
- MVDs,
- sample data if provided.

## Processing Section

- input validation,
- closure computations where relevant,
- candidate-key reasoning,
- normal-form checks.

## Intermediate Results

- 1NF result,
- 2NF result,
- 3NF result,
- 4NF result,
- violations,
- decompositions.

## Final Result

- highest achieved normal form,
- final relation schemas,
- lossless/dependency-preservation status where analyzed.

## Visuals

- dependency graph,
- journey result,
- decomposition tree,
- tables/figures where relevant.

---

# 52. Report Formats

Implement:

```text
Download PDF
Download DOCX
Download TXT
```

All formats should contain meaningful content.

TXT may be simpler, but PDF/DOCX should preserve useful structure and visual content where practical.

---

# 53. Application Architecture

Recommended stack:

## Frontend

**React + TypeScript + Vite**

Why:

- strong component structure,
- good interaction model,
- suitable for desktop-first application,
- easy state management,
- strong visualization library support.

## Styling

**Tailwind CSS** with a custom design system.

Do not use an untouched generic Tailwind dashboard template.

## Backend

**Python + FastAPI**

Why:

- excellent fit for algorithmic logic,
- strong validation with Pydantic,
- easy testing,
- convenient mathematical/set-based algorithms,
- clean API separation.

## Database

**SQLite + SQLAlchemy**

Use only where persistence is useful.

Potential tables:

- analyses,
- analysis steps,
- saved schemas,
- sample problems,
- optional history.

## Visualization

Use:

- React Flow for graph-oriented dependency/schema interactions where appropriate,
- D3.js for highly custom data/algorithm visualizations.

Choose the simplest library that produces maintainable results.

## Testing

Backend:

- pytest

Frontend:

- appropriate React testing framework.

---

# 54. Architecture Separation

Strictly separate:

```text
Frontend
   ↓
API
   ↓
Normalization Services
   ↓
Algorithms
```

React components should not contain the core normalization logic.

The normalization engine should be independently testable from the UI.

---

# 55. Suggested Repository Structure

Conceptually:

```text
normalization-visualizer/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── features/
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── types/
│   │   └── styles/
│   └── ...
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── schemas/
│   │   ├── models/
│   │   ├── database/
│   │   ├── normalization/
│   │   ├── services/
│   │   ├── visualization/
│   │   └── reports/
│   └── tests/
│
├── docs/
├── README.md
└── ...
```

The exact directory layout may evolve, but separation of concerns must remain.

---

# 56. Suggested Backend Modules

Conceptual modules:

```text
input_validation
fd_engine
mvd_engine
closure_engine
candidate_key_engine
attribute_classification
nf1_engine
nf2_engine
nf3_engine
nf4_engine
decomposition_engine
lossless_engine
dependency_preservation_engine
explanation_engine
chat_assistant
report_generator
history_service
```

Each should have clean contracts and tests.

---

# 57. Suggested Frontend Components

Conceptually:

```text
Navigation
ThemeToggle
RelationEditor
AttributeBuilder
CandidateKeyBuilder
FDBuilder
MVDBuilder
SampleDataEditor
ValidationPanel
AnalysisJourney
DependencyGraph
ClosureVisualizer
ViolationPanel
ExplanationPanel
DecompositionVisualizer
WhatIfMode
AssistantPanel
ReportDownload
LearnPage
HelpPage
DevelopedByPage
HistoryPage
```

---

# 58. Data Flow

Example:

```text
User input
   ↓
React form state
   ↓
Client validation
   ↓
FastAPI request
   ↓
Pydantic validation
   ↓
Normalization service
   ↓
Key/dependency analysis
   ↓
NF engines
   ↓
Decomposition
   ↓
Structured analysis result
   ↓
Frontend visualization
   ↓
Explanation / Assistant
   ↓
Report generator
```

---

# 59. Performance

Normal operations should target fast response, approximately **under 2 seconds for normal cases**, consistent with the professor's supplied project specification.

The UI should:

- show loading states,
- avoid blocking unnecessarily,
- handle larger inputs gracefully.

Complex or very large schemas should not freeze the interface.

---

# 60. Accessibility

Include:

- proper labels,
- keyboard navigation,
- readable contrast,
- focus states,
- accessible forms,
- meaningful button text,
- status text in addition to color,
- graph legends,
- tooltips where helpful.

Do not rely only on red/green colors.

Use:

```text
✓ Satisfied
⚠ Warning
✗ Violation
```

along with color.

---

# 61. Testing Strategy

Testing is worth 2 marks and must be serious.

## Unit Tests

Test:

- FD parsing,
- MVD parsing,
- closure,
- candidate key identification,
- prime/non-prime classification,
- 1NF checks,
- 2NF checks,
- 3NF checks,
- 4NF checks,
- decomposition,
- lossless verification,
- dependency preservation where implemented,
- explanation generation.

## Integration Tests

Test:

```text
User Input
 → API
 → Engine
 → Results
 → Visualization
```

## UI Tests

Test:

- add/edit/delete attribute,
- add/edit/delete FD,
- add/edit/delete MVD,
- candidate-key controls,
- analysis,
- graph interaction,
- Why button,
- What-If mode,
- Day/Night,
- Learn,
- Help,
- Developed By,
- Download.

## Error Testing

Include:

- empty input,
- malformed dependencies,
- unknown attributes,
- invalid key,
- duplicate attributes,
- duplicate dependencies,
- invalid sample-data rows.

## Edge Cases

Test:

- one attribute,
- one-attribute key,
- composite key,
- multiple candidate keys,
- redundant dependencies,
- multiple partial dependencies,
- multiple transitive dependencies,
- multiple MVDs,
- relation already in 4NF,
- relation with multiple violations.

---

# 62. Required Sample Demonstrations

At least five realistic cases should be prepared.

## Case 1 — Already normalized

```text
1NF ✓
2NF ✓
3NF ✓
4NF ✓
```

## Case 2 — 1NF violation

Use non-atomic/multi-valued cell data.

## Case 3 — 2NF violation

Use a composite key and partial dependency.

## Case 4 — 3NF violation

Use a transitive dependency.

## Case 5 — 4NF violation

Use independent MVDs.

These five cases should be thoroughly tested and ready for DA1.

---

# 63. Sample Example for Demonstration

Example:

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

Functional Dependencies:
StudentID → StudentName
CourseID → CourseName
(StudentID, CourseID) → Grade
```

Expected reasoning:

```text
1NF ✓
```

assuming atomic relation data / appropriate structure.

```text
2NF ✗
```

because:

```text
StudentID → StudentName
CourseID → CourseName
```

are partial dependencies on proper subsets of the composite key.

The system should show the corresponding decomposition and explanatory reasoning.

This is only a demonstration case; the engine must work with arbitrary valid user input, not just hardcoded examples.

---

# 64. DA1 Demonstration Flow

Recommended live demonstration:

## Step 1

Open Home.

Explain project in one sentence.

## Step 2

Open Analyzer.

Enter a sample problem.

## Step 3

Show validation.

Add an invalid FD and trigger a helpful message.

## Step 4

Correct the input.

## Step 5

Run Analyze.

## Step 6

Show candidate-key identification.

Demonstrate both:

- provided key,
- automatically found key.

## Step 7

Open 1NF.

Show result and explanation.

## Step 8

Open 2NF.

Highlight partial dependency.

## Step 9

Open 3NF.

Highlight transitive dependency.

## Step 10

Open 4NF.

Show MVD and decomposition.

## Step 11

Show dependency graph.

## Step 12

Show attribute closure visualization.

## Step 13

Modify an FD/MVD in What-If mode.

Re-analyze.

## Step 14

Use the contextual assistant.

Ask:

> Why is this relation not in 2NF?

## Step 15

Open Learn.

Show theory, video and references.

## Step 16

Open Help.

Show user manual.

## Step 17

Open Developed By.

Show team information and guide.

## Step 18

Toggle Day/Night mode.

## Step 19

Download PDF/DOCX/TXT.

## Step 20

Explain testing and technical architecture.

This flow touches practically every rubric criterion.

---

# 65. Phase-by-Phase Development Plan

The project should be developed in **individual phases**. Detailed prompts for each phase will be requested later.

Each phase must be completed, tested, and stable before moving to the next.

---

## PHASE 1 — Project Foundation & Architecture

### Purpose

Set up the application cleanly.

### Main tasks

- create repository structure,
- initialize React + TypeScript + Vite,
- initialize Tailwind,
- initialize FastAPI,
- configure backend/frontend communication,
- establish routing,
- establish global theme system,
- establish API conventions,
- establish shared types/schema conventions,
- establish initial testing framework,
- create clean README and developer documentation.

### Important result

At the end of Phase 1:

- frontend runs,
- backend runs,
- API connection works,
- project structure is stable,
- global UI shell exists.

Do not implement complex normalization logic yet.

---

## PHASE 2 — Input Builder & Validation

### Purpose

Create the complete user-input system.

### Main tasks

- relation name,
- attribute builder,
- candidate-key builder,
- FD builder,
- MVD builder,
- sample-data editor,
- structured/raw modes,
- client validation,
- backend validation,
- friendly errors,
- example loader,
- reset/clear.

### Important result

A user should be able to construct a valid normalization problem without performing analysis yet.

---

## PHASE 3 — FD Engine + Attribute Closure

### Purpose

Implement foundational DBMS logic.

### Main tasks

- FD data model,
- FD normalization/parsing,
- FD validation,
- attribute closure,
- closure reasoning steps,
- test suite.

### Important result

Given FDs and an attribute set, the engine can compute the closure correctly and explain every step.

---

## PHASE 4 — Candidate-Key Engine

### Purpose

Automatically derive and validate candidate keys.

### Main tasks

- superkey checking,
- candidate key derivation,
- multiple candidate keys,
- composite keys,
- minimality,
- user-provided key verification,
- prime/non-prime classification,
- candidate-key explanation.

### Important result

The application can say:

> Here are the candidate keys, and here is how we derived them.

---

## PHASE 5 — 1NF + 2NF Engine

### Purpose

Implement first two normal-form stages.

### Main tasks

#### 1NF

- atomicity/data handling,
- repeating-group explanation,
- 1NF transformation.

#### 2NF

- prerequisite handling,
- partial-dependency detection,
- multiple candidate-key support,
- prime/non-prime classification,
- violation explanations,
- decomposition.

### Important result

Reliable 1NF and 2NF analysis with structured reasoning.

---

## PHASE 6 — 3NF + 4NF Engine

### Purpose

Implement the remaining assigned normal forms.

### Main tasks

#### 3NF

- FD-level checking,
- superkey test,
- prime-attribute test,
- transitive dependency explanations,
- decomposition.

#### 4NF

- MVD representation,
- trivial/non-trivial MVD handling,
- superkey test,
- violation detection,
- decomposition,
- explanation.

### Important result

The entire assigned topic 1NF–4NF has a deterministic backend implementation.

---

## PHASE 7 — Decomposition + Verification

### Purpose

Make normalization produce actual schemas, not just statuses.

### Main tasks

- decomposition engine,
- before/after relation structures,
- decomposition reasoning,
- lossless verification,
- dependency-preservation analysis where implemented,
- intermediate schema states.

### Important result

The system can demonstrate a complete normalization path and explain the decomposition.

---

## PHASE 8 — Visualization Engine

### Purpose

Turn algorithmic results into visual learning.

### Main tasks

- normalization journey,
- dependency graph,
- FD/MVD visual distinction,
- interactive node/edge behavior,
- attribute highlighting,
- closure animation,
- decomposition tree,
- before/after schema comparison,
- stage transitions.

### Important result

The project becomes a true **Visualizer**, not just an analyzer.

---

## PHASE 9 — Creative Interaction + Assistant

### Purpose

Implement the project's creativity/innovation requirements.

### Main tasks

- Why / Show Logic system,
- contextual normalization assistant,
- What-If mode,
- integrated closure lab if not already completed,
- graph interaction,
- state comparison.

### Optional

- Practice Mode.

### Important result

The four creative features are functional and integrated into the learning experience.

---

## PHASE 10 — Mandatory Website Sections

### Purpose

Complete the rubric-required website structure.

### Main tasks

- Learn,
- concept explanation,
- examples,
- embedded educational video,
- references,
- Developed By,
- team configuration,
- guide information,
- Help/user manual,
- Download page/action,
- PDF,
- DOCX,
- TXT,
- Day/Night mode.

### Important result

All mandatory 1-mark website requirements are complete.

---

## PHASE 11 — Testing & Verification

### Purpose

Secure the 2 testing marks and ensure correctness.

### Main tasks

- unit tests,
- integration tests,
- UI tests,
- sample test cases,
- edge cases,
- invalid-input tests,
- regression tests,
- result verification,
- performance checks.

### Important result

Evidence exists that this is a functioning technical application, not a static UI.

---

## PHASE 12 — Deployment & Final Polish

### Purpose

Prepare the final project for professor evaluation.

### Main tasks

- production build,
- deploy frontend,
- deploy backend,
- verify API connectivity,
- verify no paid LLM dependency,
- test on fresh machine/browser,
- verify report generation,
- check responsive behavior,
- check Day/Night,
- fix visual inconsistencies,
- optimize performance,
- finalize documentation,
- finalize screenshots,
- finalize demo flow.

### Important result

Professor can open the website and use the core functionality without needing development software.

---

# 66. Phase Dependencies

The order matters.

```text
Phase 1
   ↓
Phase 2
   ↓
Phase 3
   ↓
Phase 4
   ↓
Phase 5
   ↓
Phase 6
   ↓
Phase 7
   ↓
Phase 8
   ↓
Phase 9
   ↓
Phase 10
   ↓
Phase 11
   ↓
Phase 12
```

Do not implement visualization before defining stable analysis-result structures.

Do not implement decomposition visuals before decomposition logic exists.

Do not depend on an LLM for normalization results.

Do not polish the final visual system before the product's core workflows are stable.

---

# 67. Development Rule for Every Phase

When using Antigravity/Gemini to implement a phase, it should follow:

```text
1. Inspect existing repository/code.
2. Read this master project reference.
3. Understand the current phase only.
4. Inspect previous implementation.
5. Plan the change.
6. Implement the phase.
7. Run tests.
8. Run the application.
9. Inspect the result in the browser where appropriate.
10. Fix discovered issues.
11. Re-run tests.
12. Ensure existing features still work.
13. Do not rewrite working modules unnecessarily.
14. Document important decisions.
15. Summarize what was completed.
```

Do not proceed while there are known blocking errors.

---

# 68. Anti-Regression Principle

Every later phase must preserve earlier functionality.

For example:

Phase 8 visualization must not break:

- Phase 2 input builder,
- Phase 3 closure,
- Phase 4 keys,
- Phase 5 1NF/2NF,
- Phase 6 3NF/4NF,
- Phase 7 decomposition.

The agent must inspect dependencies before changing shared components.

---

# 69. No Hardcoded Demo Logic

Do not build the UI using fake hardcoded analysis results.

Examples must use the same actual analysis engine as arbitrary user input.

Bad:

```text
if example == "ENROLLMENT":
    show 2NF violation
```

Good:

```text
example data
  ↓
same normalization engine
  ↓
actual result
```

The professor must be able to modify the inputs and still receive a correct result.

---

# 70. No AI Dependency for Core DBMS Results

The project must work when:

- there is no API key,
- there is no LLM provider,
- there is no internet connection to an LLM service.

The following must remain functional:

- input,
- validation,
- closure,
- candidate keys,
- 1NF,
- 2NF,
- 3NF,
- 4NF,
- decomposition,
- visualization,
- Why explanations,
- What-If mode,
- reports.

The contextual assistant should also answer supported questions using the deterministic knowledge/rule system.

---

# 71. Academic Correctness Principle

Whenever the application produces a DBMS result, the result must be traceable to the implemented DBMS rules.

The interface should make it possible to inspect:

```text
Input
↓
Rule
↓
Intermediate reasoning
↓
Result
```

This is particularly important for:

- candidate keys,
- attribute closure,
- 2NF,
- 3NF,
- 4NF,
- decomposition.

---

# 72. UI/UX Quality Principle

The website should look like a professional learning application made by a careful designer.

It should be:

- eye-catching,
- calm,
- technical,
- educational,
- coherent,
- seamless.

Not:

- overdecorated,
- generic,
- AI-generated-looking,
- overly neon,
- card-heavy,
- visually noisy.

The most important information should be visually dominant:

1. current normalization stage,
2. actual schema,
3. dependency relationship,
4. violation/reason,
5. decomposition,
6. learning/explanation.

---

# 73. Interaction Quality

Important interactive details:

- hover states,
- clear focus states,
- smooth transitions,
- informative tooltips,
- expandable explanations,
- selected dependency highlighting,
- animated decomposition,
- responsive graph behavior,
- undo/reset where useful.

Interactions should always have a reason.

---

# 74. Example UI Status Language

Use consistent labels:

```text
✓ Satisfied
✗ Violated
⚠ Requires Input
— Not Applicable / Not Evaluated
```

Avoid ambiguous labels such as:

```text
Good
Bad
```

Prefer academically meaningful descriptions.

---

# 75. What the User Should Feel

The product should communicate:

> "I am learning normalization by experimenting with an actual relational schema."

It should not communicate:

> "I entered a database and a black box told me an answer."

The system should expose reasoning wherever practical.

---

# 76. Core Experience Example

A user enters:

```text
R(StudentID, CourseID, StudentName, CourseName, Grade)

Candidate key:
(StudentID, CourseID)

FDs:
StudentID → StudentName
CourseID → CourseName
(StudentID, CourseID) → Grade
```

The application shows:

```text
1NF ✓

2NF ✗
```

User clicks:

**Why?**

The application shows:

```text
Candidate key:
(StudentID, CourseID)

Partial dependencies detected:

StudentID → StudentName
CourseID → CourseName

Both determinants are proper subsets of the composite
candidate key.

StudentName and CourseName are non-prime.

Therefore the relation violates 2NF.
```

Then the decomposition visualization appears.

Then the user can click:

**Show Logic**

and see the closure/key/dependency reasoning.

Then the user can edit an FD in What-If mode and re-run the analysis.

This is the intended interaction model.

---

# 77. Creative Feature Prioritization

The four chosen creative features are the official creativity focus.

## Highest priority

### Interactive Normalization Journey

### Interactive Dependency Graph

### Attribute Closure Visualizer

### What-If / Experiment Mode

Practice Mode is secondary.

Do not spend substantial time on unrelated flashy features while these are incomplete.

---

# 78. Optional Future Scope

Potential future enhancements:

- true LLM-based tutor,
- voice/speech explanations,
- multilingual explanations,
- more advanced normal forms,
- BCNF,
- 5NF,
- 6NF,
- SQL schema generation,
- SQL DDL generation,
- advanced quizzes,
- collaboration/sharing,
- cloud accounts,
- analytics dashboard,
- classroom/instructor mode.

These are future-scope items, not requirements for the current version.

---

# 79. Team Information Strategy

Because this is an individual build for a team project, use placeholders initially.

Do not hardcode personal information throughout the source.

Keep it in one configuration object/file.

Example conceptual configuration:

```text
projectInfo:
    title
    subtitle

teamMembers:
    - name
      registerNumber
      photo
      role

guide:
    name
    designation
```

Later the values can be replaced without changing component logic.

---

# 80. Project Documentation Requirements

Final documentation should cover:

1. Introduction
2. Problem definition
3. Objectives
4. Scope
5. Background theory
6. 1NF
7. 2NF
8. 3NF
9. 4NF
10. Functional dependencies
11. Multivalued dependencies
12. Candidate keys
13. Attribute closure
14. System requirements
15. Functional requirements
16. Non-functional requirements
17. Architecture
18. Database design
19. Algorithms
20. UI/UX design
21. Implementation
22. Visualization
23. Testing
24. Results
25. Creativity/innovation
26. Limitations
27. Future scope
28. References
29. AI development/prompt log if applicable

---

# 81. AI Development Prompt Log

Even though the application itself does not depend on an LLM, the development process may use AI coding tools.

Maintain a prompt log containing:

- date,
- tool,
- phase,
- purpose,
- prompt,
- major result.

Example:

```text
Date:
Tool:
Phase:
Purpose:
Prompt:
Result:
```

This should be maintained during development rather than reconstructed at the end.

---

# 82. AI Coding Agent: Antigravity + Gemini

The planned coding environment is:

**Google Antigravity**, primarily using the available Gemini Flash model.

The model/tooling is suitable for a project of this complexity, including:

- web application development,
- code generation,
- debugging,
- multi-file changes,
- browser testing,
- terminal workflows,
- iterative development.

However, the agent should not receive a vague instruction to build the entire project in one pass.

The project is intentionally divided into phases so the agent can:

- implement,
- test,
- inspect,
- correct,
- and move forward incrementally.

---

# 83. Antigravity Working Rules

When creating future phase-specific prompts, each prompt should:

1. Refer back to this project reference.
2. Identify the exact phase being implemented.
3. State which existing modules must not be broken.
4. Give explicit functional requirements.
5. Give exact expected behavior.
6. Include test/acceptance criteria.
7. Require browser verification when UI is involved.
8. Require backend/unit tests when logic is involved.
9. Require no unnecessary rewrites.
10. Require reuse of existing architecture.

---

# 84. Acceptance Criteria for the Whole Project

The project is considered complete only when:

## Core DBMS

- [ ] User can enter arbitrary supported schemas.
- [ ] Structured input works.
- [ ] Raw/advanced input works.
- [ ] Multiple candidate keys work.
- [ ] Composite keys work.
- [ ] FDs work.
- [ ] MVDs work.
- [ ] Candidate-key verification works.
- [ ] Candidate-key derivation works.
- [ ] Attribute closure works with reasoning steps.
- [ ] Prime/non-prime classification works.
- [ ] 1NF analysis works.
- [ ] 2NF analysis works.
- [ ] 3NF analysis works.
- [ ] 4NF analysis works.
- [ ] Violations are explained.
- [ ] Decomposition works.
- [ ] Lossless/dependency preservation analysis works where implemented.

## Visualization

- [ ] Normalization journey works.
- [ ] Dependency graph works.
- [ ] Attribute closure visualization works.
- [ ] Decomposition visualization works.
- [ ] Before/after comparison works.
- [ ] Selected dependencies/attributes are visually highlighted.

## Creativity

- [ ] Interactive Normalization Journey.
- [ ] Interactive Dependency Graph.
- [ ] Attribute Closure Visualizer.
- [ ] What-If / Experiment Mode.

## Educational

- [ ] Learn exists.
- [ ] Concept explanations exist.
- [ ] Educational video exists.
- [ ] References exist.
- [ ] Help exists.
- [ ] Contextual assistant exists.

## Mandatory Structure

- [ ] Developed By exists.
- [ ] Team member photos.
- [ ] Names.
- [ ] Register numbers.
- [ ] Guide name/designation.
- [ ] Download exists.
- [ ] PDF.
- [ ] DOCX.
- [ ] TXT.
- [ ] Day/Night toggle.

## Testing

- [ ] Unit tests.
- [ ] Integration tests.
- [ ] UI tests.
- [ ] Valid cases.
- [ ] Invalid cases.
- [ ] Edge cases.
- [ ] Regression verification.

## Deployment

- [ ] Production build.
- [ ] Frontend deployable.
- [ ] Backend deployable.
- [ ] Core functionality works without LLM.
- [ ] No secrets committed to repository.
- [ ] Fresh-browser verification.
- [ ] Professor can operate the application without developer tooling.

---

# 85. Final Product Architecture in One Diagram

```text
                           NORMALIZATION LAB
                                  │
          ┌───────────────────────┼────────────────────────┐
          │                       │                        │
        LEARN                   ANALYZE                 HELP
          │                       │
   Theory / Video                 │
   References                     │
                                  ▼
                           USER INPUT BUILDER
                                  │
            ┌─────────────────────┼─────────────────────┐
            │                     │                     │
       Attributes             Candidate Keys        Dependencies
                                   │              ┌──────┴──────┐
                                   │              │             │
                                   │             FDs           MVDs
                                   │              │             │
                                   └──────────────┼─────────────┘
                                                  ▼
                                          VALIDATION ENGINE
                                                  │
                                                  ▼
                                      DEPENDENCY / KEY ENGINE
                                                  │
                                  ┌───────────────┼────────────────┐
                                  │               │                │
                              Closure        Candidate Keys    Attribute Types
                                  │
                                  └───────────────┬────────────────┘
                                                  ▼
                                      NORMALIZATION ENGINE
                                                  │
                          ┌───────────────────────┼───────────────────────┐
                          ▼                       ▼                       ▼
                         1NF                     2NF                     3NF
                                                                          │
                                                                          ▼
                                                                         4NF
                                                                          │
                                                                          ▼
                                                                  DECOMPOSITION
                                                                          │
                                                  ┌───────────────────────┼──────────────┐
                                                  ▼                       ▼              ▼
                                            Verification             Visualizer     Assistant
                                                  │                       │              │
                                                  └───────────────────────┼──────────────┘
                                                                          ▼
                                                                  REPORT GENERATOR
                                                                          │
                                                                PDF / DOCX / TXT
```

---

# 86. Final Product Philosophy

The completed application should answer three questions for every normalization problem:

### 1. What is the answer?

Example:

> The relation violates 2NF.

### 2. Why is that the answer?

Example:

> `StudentID → StudentName` is a partial dependency because `StudentID` is a proper subset of the composite candidate key and `StudentName` is non-prime.

### 3. What should I do about it?

Example:

> Decompose the relation into STUDENT and ENROLLMENT.

This philosophy should guide the implementation of the Analyzer, Visualizer, Assistant, Learn content, and Download reports.

---

# 87. Final Instruction to Future Coding Agents

When a future phase-specific prompt is provided, treat this document as the **overall project specification and source of truth**.

Implement only the requested phase, but maintain compatibility with the complete architecture and requirements described here.

Do not:

- remove required functionality,
- replace deterministic DBMS logic with AI,
- hardcode only the demonstration examples,
- create static fake results,
- ignore error handling,
- ignore testing,
- introduce paid API requirements,
- use generic AI/SaaS UI patterns without justification,
- break previous phases,
- omit an important concept because it is inconvenient.

Do:

- preserve modular architecture,
- preserve existing functionality,
- write reusable code,
- test every logical component,
- keep explanations tied to actual computed results,
- keep UI interactions purposeful,
- make the application educational and interactive,
- make all required sections discoverable,
- keep the core product deployable without a paid LLM,
- document significant technical choices.

---

# 88. The Core Vision in One Sentence

> **Build a desktop-first, polished, interactive educational "Normalization Lab" where a student can enter any supported relational schema, understand its keys and dependencies, watch deterministic 1NF→2NF→3NF→4NF analysis and decomposition happen visually, ask contextual questions, experiment with the schema, learn the theory, and download a complete execution report — without requiring a paid LLM for any core functionality.**
