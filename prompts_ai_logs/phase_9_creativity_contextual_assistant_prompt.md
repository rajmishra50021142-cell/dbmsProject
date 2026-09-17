# Phase 9 — Creativity Features + Contextual Normalization Assistant
## Master Implementation Prompt for the Normalization Lab Project

> **Purpose of this phase:** Build the creative, differentiating layer of the DBMS Normalization Lab after the core normalization engine and visualization system are already functional.
>
> **Important:** This phase must use the real analysis/decomposition/verification results from Phases 2–8. Do **not** hardcode fake examples, fake statistics, fake explanations, or fake “AI” answers.
>
> **Scope:** 1NF, 2NF, 3NF, 4NF only. BCNF/5NF may be mentioned as future extensions, but they are not part of this phase's core analyzer.

---

# 1. CONTEXT — YOU MUST READ AND FOLLOW THIS FIRST

The project is an **interactive educational DBMS Normalization Lab** for analyzing and learning:

- 1NF
- 2NF
- 3NF
- 4NF
- Functional Dependencies (FDs)
- Multivalued Dependencies (MVDs)
- Candidate Keys
- Superkeys
- Prime / Non-Prime Attributes
- Attribute Closure
- Dependency implication where supported
- Canonical/minimal cover where supported
- Decomposition
- Lossless Join
- Dependency Preservation

The project is **not** a generic SaaS dashboard and must not look like AI-generated startup boilerplate.

The product should feel like a:

> **Normalization Laboratory / Interactive DBMS Learning Environment**

The user should be able to enter their own schema and dependencies, inspect the mathematical reasoning, experiment with the schema, and understand exactly why a relation is or is not in a particular normal form.

---

# 2. PREVIOUS PHASES THAT THIS PHASE DEPENDS ON

Assume these phases are already implemented and must be reused rather than duplicated.

## Phase 1 — Foundation
Provides:

- React + TypeScript + Vite
- Tailwind CSS / design tokens
- FastAPI backend
- SQLite + SQLAlchemy infrastructure
- routing
- reusable UI primitives
- responsive/desktop-first shell
- Day/Night mode
- testing foundation
- clean modular repository

## Phase 2 — Schema/Input Builder + Validation
Provides:

- guided input mode
- advanced/raw input mode
- relation name
- attributes
- candidate key input
- functional dependencies
- multivalued dependencies
- optional sample tuples/data
- validation
- canonical input representation
- validation/error messages

## Phase 3 — FD Engine + Attribute Closure
Provides:

- normalized FD representation
- FD canonicalization
- attribute-set utilities
- attribute closure
- dependency determination
- trivial/non-trivial FD detection
- step-by-step reasoning trace

## Phase 4 — Candidate Key Engine
Provides:

- superkey testing
- candidate key discovery
- composite key support
- multiple candidate keys
- minimality verification
- prime/non-prime attribute classification
- candidate-key reasoning

## Phase 5 — 1NF + 2NF Engine
Provides:

- 1NF analysis
- data-level atomicy checks where sample data exists
- schema-only 1NF limitation handling
- 2NF analysis
- partial dependency detection
- composite candidate-key handling
- decomposition proposals where applicable

## Phase 6 — 3NF + 4NF Engine
Provides:

- formal 3NF checks
- superkey condition
- prime-attribute exception
- transitive-dependency explanation
- formal 4NF checks
- MVD analysis
- trivial/non-trivial MVD handling
- multiple FD/MVD analysis
- highest-normal-form determination

## Phase 7 — Decomposition + Verification
Provides:

- decomposition generation
- decomposition lineage
- formal lossless-join checking
- formal dependency-preservation checking
- projected dependencies
- closure-based dependency verification
- chase/tableau or equivalent rigorous losslessness verification

## Phase 8 — Visualization
Provides:

- normalization journey
- schema visualization
- dependency graph
- FD/MVD distinction
- attribute closure visualization
- candidate-key visualization
- prime/non-prime visualization
- violation highlighting
- reasoning timeline
- decomposition tree
- before/after comparison
- verification visuals
- synchronized visual state

---

# 3. GOAL OF PHASE 9

Phase 9 adds the features that make the project feel **innovative, educational, interactive, and memorable** rather than merely being a CRUD analyzer.

Implement the following major components:

1. Interactive Normalization Journey
2. What-If / Experiment Mode
3. Dependency Graph Exploration
4. Attribute Closure Exploration
5. Contextual Normalization Assistant
6. Explain-Why interaction layer
7. Suggested next action / learning path
8. Optional lightweight practice functionality
9. Feature instrumentation/state tracking without invasive analytics
10. Polished micro-interactions and educational feedback

The creative layer should expose the mathematical engine rather than hide it.

---

# 4. DESIGN PRINCIPLE

The central UX principle is:

> **Answer → Reason → Experiment → Learn**

For every important result, the user should be able to:

### Answer
See the normal-form result immediately.

### Reason
See the exact dependency/key/attribute logic responsible.

### Experiment
Modify the schema and observe what changes.

### Learn
Open a concise explanation or contextual learning resource.

Do not force the user into a chatbot to understand the result.

---

# 5. FEATURE A — INTERACTIVE NORMALIZATION JOURNEY

Create a highly interactive visual journey:

```text
Input Relation
      ↓
   1NF
      ↓
   2NF
      ↓
   3NF
      ↓
   4NF
```

Each stage must be an actual interactive state, not a decorative progress bar.

## 5.1 Stage contents

Each stage should display:

- Normal form name
- one-sentence definition
- current status
- key condition
- detected violations
- supporting dependencies
- relevant candidate key(s)
- affected attributes
- suggested decomposition if available
- verification status
- “Why?” action
- “Show details” action
- “Open in experiment mode” action

Example conceptual status:

```text
3NF
────────────────────────
STATUS: NOT SATISFIED

Reason:
A non-superkey determines a non-prime attribute.

Dependency:
A → D

Candidate key:
A,B

Affected attribute:
D

[Why?] [Show Dependency] [Experiment]
```

Do not fabricate values. Populate this from actual analysis.

---

# 6. JOURNEY INTERACTIONS

## 6.1 Clicking a stage

When the user clicks 1NF/2NF/3NF/4NF:

- highlight the relevant schema attributes
- highlight relevant FD/MVD edges
- focus the affected dependency
- show the reasoning trace
- show the decomposition result if applicable
- update the insight panel

The graph and stage must remain synchronized.

## 6.2 Progressive disclosure

Do not overwhelm the user immediately.

Default:

```text
Result
↓
One-sentence reason
↓
Affected dependency
↓
Details
```

Expanded mode:

```text
Formal condition
↓
Candidate-key context
↓
Closure reasoning
↓
Affected attributes
↓
Decomposition
↓
Lossless join
↓
Dependency preservation
```

---

# 7. FEATURE B — WHAT-IF / EXPERIMENT MODE

This should be one of the most important creative features.

Create an **Experiment Mode** where the user can safely modify a working copy of the schema.

The original analysis must remain unchanged.

## 7.1 User can experiment with

- add attribute
- remove attribute
- rename attribute
- add candidate key
- remove candidate key
- add FD
- remove FD
- edit FD
- add MVD
- remove MVD
- edit MVD
- toggle sample data where applicable

Do not allow invalid states to silently propagate.

Run validation after changes.

---

# 8. EXPERIMENT MODE LAYOUT

Suggested desktop layout:

```text
┌─────────────────────────────────────────────────────────────┐
│ EXPERIMENT MODE                         Original / Modified │
├───────────────────────┬─────────────────────────────────────┤
│ Schema Editor         │ Impact Summary                     │
│                       │                                     │
│ Attributes            │ 2NF: PASS → FAIL                   │
│ Candidate Keys        │ 3NF: PASS → FAIL                   │
│ FDs                   │ 4NF: PASS → PASS                   │
│ MVDs                  │                                     │
│                       │ Changed Dependencies: 2            │
│ [Run Experiment]      │ New Candidate Keys: 1              │
│ [Reset]               │                                     │
├───────────────────────┴─────────────────────────────────────┤
│ Before → After dependency graph / decomposition comparison │
└─────────────────────────────────────────────────────────────┘
```

---

# 9. EXPERIMENT COMPARISON

When the user changes something, show:

## Before

```text
3NF: Satisfied
Candidate keys: ...
Dependencies: ...
```

## After

```text
3NF: Not satisfied
New violation: X → Y
```

Also show:

```text
What changed?
- FD added: X → Y
- Attribute Z removed
- Candidate key modified
```

Only report actual changes.

---

# 10. EXPERIMENT "WHY DID IT CHANGE?"

For every changed normal-form result, provide:

```text
Why did 3NF change?

1. You added X → Y.
2. X is not a superkey.
3. Y is non-prime.
4. Therefore the 3NF condition is violated.
```

This must be generated from the reasoning objects returned by the backend.

Do not write a generic sentence unrelated to the actual dependency.

---

# 11. EXPERIMENT SNAPSHOTS

Allow users to save temporary experiment snapshots in browser/session state.

Example:

```text
Experiment 01
Original schema
3NF PASS

Experiment 02
Added A → D
3NF FAIL

Experiment 03
Added candidate key A,D
3NF PASS
```

This is a learning feature, not user authentication.

Do not require accounts.

---

# 12. EXPERIMENT RESET

Provide:

```text
Reset to Original
```

The reset must restore exactly the original analysis input.

Do not reload from hardcoded sample data.

---

# 13. FEATURE C — CONTEXTUAL NORMALIZATION ASSISTANT

Build a **Normalization Assistant** that helps users ask focused questions about:

- the current relation
- candidate keys
- closures
- FDs
- MVDs
- normal-form results
- decomposition
- lossless join
- dependency preservation

## Critical requirement

This assistant must work **without a paid LLM/API**.

It must not require:

- OpenAI API
- Gemini API
- Anthropic API
- Ollama
- local LLM
- API key
- external inference server

The entire project must remain functional on a professor's computer with no AI service installed.

---

# 14. DO NOT CALL RULE-BASED OUTPUT "GENERATIVE AI"

The assistant may be called:

> Normalization Assistant

or

> DBMS Learning Assistant

Do not label it:

> AI-powered chatbot

unless a real optional LLM integration is later added.

The core implementation is deterministic/contextual.

---

# 15. ASSISTANT QUESTION SCOPE

The assistant should support a controlled set of useful questions.

Examples:

### General concepts

```text
What is 1NF?
What is 2NF?
What is 3NF?
What is 4NF?
What is a candidate key?
What is a prime attribute?
What is a partial dependency?
What is a transitive dependency?
What is an MVD?
What is a lossless decomposition?
What is dependency preservation?
```

### Current-analysis questions

```text
Why is this relation not in 2NF?
Why is this relation not in 3NF?
Why is this relation in 4NF?
Which dependency violates 3NF?
Which attributes are prime?
Why is AB a candidate key?
What is the closure of AB?
Why is this decomposition lossless?
Why is dependency preservation false?
What should I change to reach 3NF?
```

### Dependency questions

```text
Does A determine C?
Is A → C implied?
Is this dependency trivial?
Why is AB → D true?
```

### MVD questions

```text
Why is A →→ B violating 4NF?
Is this MVD trivial?
What relation would result from decomposing this MVD?
```

---

# 16. ASSISTANT RESPONSE ENGINE

Implement a deterministic intent classification layer.

Example internal categories:

```text
CONCEPT_1NF
CONCEPT_2NF
CONCEPT_3NF
CONCEPT_4NF
CANDIDATE_KEYS
PRIME_ATTRIBUTES
CLOSURE
FD_DETERMINATION
FD_TRIVIALITY
MVD_TRIVIALITY
WHY_NF_FAIL
WHY_NF_PASS
DECOMPOSITION
LOSSLESS_JOIN
DEPENDENCY_PRESERVATION
NEXT_ACTION
UNKNOWN
```

Use normalized keyword/pattern matching plus current analysis context.

Architecture:

```text
User Question
      ↓
Question Normalizer
      ↓
Intent Classifier
      ↓
Context Resolver
      ↓
Relevant Analysis Facts
      ↓
Response Builder
      ↓
Educational Answer
```

Keep the response builder separate from UI code.

---

# 17. ASSISTANT CONTEXT OBJECT

The assistant should receive a compact analysis context object, conceptually:

```ts
interface AssistantContext {
  relation;
  attributes;
  candidateKeys;
  superkeys;
  primeAttributes;
  nonPrimeAttributes;
  functionalDependencies;
  multivaluedDependencies;
  closures;
  normalForms;
  violations;
  decompositions;
  verification;
  reasoning;
}
```

Use the existing backend result rather than recomputing normalization inside the chatbot.

---

# 18. ASSISTANT RESPONSE STYLE

Answers should be:

- concise
- mathematically correct
- context-aware
- educational
- traceable to the current analysis
- free of unsupported claims

Example:

```text
Why is this relation not in 2NF?

2NF requires every non-prime attribute to be fully dependent
on every candidate key.

Your candidate key is {StudentID, CourseID}.

The dependency:

StudentID → StudentName

is a partial dependency because StudentName depends on only
part of the composite key.

Therefore the relation violates 2NF.
```

The values must come from the actual user input.

---

# 19. ASSISTANT UNKNOWN QUESTIONS

When a question is outside the supported deterministic scope, do not hallucinate.

Return something like:

```text
I can currently answer questions about:

• 1NF–4NF
• candidate keys
• attribute closure
• FDs and MVDs
• decomposition
• lossless join
• dependency preservation

Try asking:
"Why is this relation not in 3NF?"
```

Do not pretend to know the answer.

---

# 20. ASSISTANT UI

Create a compact contextual panel, not a giant ChatGPT clone.

Recommended:

```text
┌─────────────────────────────────────────┐
│ Normalization Assistant                 │
│ Ask about this analysis                 │
├─────────────────────────────────────────┤
│ Why is this not in 3NF?                 │
│                                         │
│ [ Ask a question...                ]    │
│                                         │
│ Suggested:                              │
│ • Why does A → D matter?                │
│ • What are my candidate keys?           │
│ • Show AB+                              │
└─────────────────────────────────────────┘
```

The panel can open as a side sheet.

Avoid:

- full-screen chat UI
- fake typing animations
- fake AI branding
- message bubbles everywhere
- unnecessary avatars
- conversational filler

The assistant is a supporting educational tool, not the main product.

---

# 21. EXPLAIN-WHY SYSTEM

Create reusable **Explain Why** components throughout the application.

Every major result should support an explanation.

Examples:

```text
3NF: FAIL
[Why?]
```

opens:

```text
Formal condition:
For every non-trivial FD X → A,
X must be a superkey OR A must be prime.

Checked dependency:
X → A

X is a superkey: No
A is prime: No

Conclusion:
3NF condition fails.
```

This should be generated from structured reasoning data.

---

# 22. TRACEABLE REASONING

Whenever possible, display exact evidence.

For example:

```text
Evidence
──────────────
Candidate key:
{A, B}

Dependency:
A → C

Closure:
A+ = {A, C}

A does not determine B
→ A is not a superkey

C is non-prime
→ 3NF condition fails
```

This is much more valuable academically than a generic natural-language paragraph.

---

# 23. FEATURE D — SUGGESTED NEXT ACTION

After analysis, provide one contextual action.

Examples:

```text
Suggested next step

Your relation is not in 2NF.

Inspect the partial dependency:
StudentID → StudentName

[Open Experiment Mode]
```

For a 4NF violation:

```text
Suggested next step

Inspect the independent multivalued facts represented by:

Student →→ Hobby

[View 4NF Reasoning]
```

For a fully normalized result:

```text
Suggested next step

Your relation satisfies 4NF under the supplied dependencies.

Explore the dependency graph to inspect why.

[Explore Graph]
```

Never use generic motivational text such as:

> Great job! You are crushing normalization!

Keep it academic.

---

# 24. FEATURE D — OPTIONAL PRACTICE MODE

Practice Mode is optional and should only be implemented if the core application is stable.

The goal is to turn the analyzer into a learning tool.

Possible exercises:

```text
Given:
R(A,B,C,D)
F = {A → B, B → C, ...}

Question:
What is a candidate key?
```

Then:

```text
[Check Answer]
```

The system evaluates the submitted key using the same key engine from Phase 4.

Potential exercise types:

- identify candidate keys
- calculate attribute closure
- identify highest normal form
- identify violating dependency
- identify prime attributes
- choose a valid decomposition
- determine whether an MVD is trivial
- explain why a relation violates 2NF/3NF/4NF

Do not implement a separate mathematical engine.

Reuse the real engine.

---

# 25. PRACTICE MODE RULE

Practice Mode must never become a second independent logic system.

Use:

```text
Exercise Generator
        ↓
Existing Normalization Engine
        ↓
Expected Answer
        ↓
User Answer
        ↓
Verification
```

This guarantees consistency between:

- Analyzer
- Practice
- Assistant
- Visualization

---

# 26. FEATURE E — DEPENDENCY EXPLORER SHORTCUTS

Enhance the Phase 8 dependency graph with small interactive actions.

When clicking an FD:

```text
A → C
```

show:

```text
Type: Functional Dependency
Trivial: No
Determines: C
LHS: A
```

Actions:

```text
[Calculate A+]
[Why relevant?]
[Find violations]
[Use in Experiment]
```

When clicking an MVD:

```text
A →→ B
```

show:

```text
Type: Multivalued Dependency
Trivial: No
Relevant normal form: 4NF
```

Actions:

```text
[Why 4NF?]
[View decomposition]
[Use in Experiment]
```

---

# 27. FEATURE F — CLOSURE LAB SHORTCUT

From any attribute or FD, allow:

```text
Calculate Closure
```

The user should immediately see the Phase 3 closure animation.

Example:

```text
AB+
 ↓
ABCD
```

with a step trace:

```text
Start:
{A,B}

A → C
Add C

BC → D
Add D

Final:
{A,B,C,D}
```

Do not create another closure implementation.

---

# 28. FEATURE G — "JUMP TO EVIDENCE"

A particularly useful educational interaction:

When the user sees:

```text
3NF FAIL
```

clicking the result should jump/focus the exact evidence:

```text
3NF
 ↓
Violation #2
 ↓
B → D
 ↓
B is not a superkey
 ↓
D is non-prime
```

The graph, dependency list, and reasoning panel should all highlight the same object.

Implement a reusable evidence-anchor mechanism.

---

# 29. FEATURE H — NORMALIZATION CHANGE HISTORY

For current session state, show a compact event trail such as:

```text
Analysis
09:31

Examined 1NF
Examined 2NF
Detected 2NF violation
Opened closure of AB
Opened dependency A → C
Entered Experiment Mode
Added D → E
Re-analyzed
```

This is not persistent analytics.

It exists only as a user-facing learning trace.

Allow:

```text
Clear History
```

---

# 30. FEATURE I — SESSION SNAPSHOT

Provide:

```text
Save Snapshot
```

A snapshot contains:

- input schema
- analysis result version
- experiment modifications
- timestamp
- optional user label

Example:

```text
"My 3NF Experiment"
```

Store locally for the current project/session unless persistence is already available.

No authentication required.

---

# 31. IMPORTANT — DO NOT STORE SENSITIVE DATA

Do not collect:

- account credentials
- student passwords
- personal identifiers beyond the project’s manually displayed Developed By section
- unnecessary analytics
- external tracking

The project is an academic educational application.

---

# 32. OPTIONAL MICRO-INTERACTIONS

Add subtle purposeful animation.

Examples:

## Journey
The active normal-form stage smoothly expands.

## Dependency graph
Selected edges pulse briefly.

## Closure
New attributes appear in sequence.

## Decomposition
Parent schema visually splits into child schemas.

## Experiment
Changed items receive a temporary “changed” indicator.

## Reasoning
Steps appear progressively.

Animation must communicate state.

Avoid:

- permanent floating animations
- decorative particle effects
- excessive gradients
- motion everywhere
- fake loading delays

---

# 33. REDUCED MOTION

Respect:

```css
@media (prefers-reduced-motion: reduce)
```

Disable or shorten:

- graph transitions
- journey animations
- closure step animation
- decomposition transitions
- assistant entrance animations

The information must remain fully usable without motion.

---

# 34. UX PRINCIPLE — DO NOT HIDE THE MATH

The assistant and creative features are not replacements for the formal DBMS implementation.

The product hierarchy should be:

```text
Formal Result
      ↓
Mathematical Evidence
      ↓
Visualization
      ↓
Educational Explanation
      ↓
Optional Assistant
```

Not:

```text
AI Answer
   ↓
Trust me
```

---

# 35. FRONTEND ARCHITECTURE

Suggested structure:

```text
frontend/src/
├── features/
│   ├── journey/
│   │   ├── NormalizationJourney.tsx
│   │   ├── NormalizationStage.tsx
│   │   ├── StageDetails.tsx
│   │   └── journey.types.ts
│   │
│   ├── experiments/
│   │   ├── ExperimentMode.tsx
│   │   ├── ExperimentEditor.tsx
│   │   ├── ExperimentDiff.tsx
│   │   ├── ExperimentHistory.tsx
│   │   └── experiment.types.ts
│   │
│   ├── assistant/
│   │   ├── NormalizationAssistant.tsx
│   │   ├── AssistantInput.tsx
│   │   ├── AssistantSuggestions.tsx
│   │   ├── AssistantMessage.tsx
│   │   └── assistant.types.ts
│   │
│   ├── explainability/
│   │   ├── WhyDrawer.tsx
│   │   ├── EvidenceCard.tsx
│   │   └── EvidenceAnchor.tsx
│   │
│   ├── practice/
│   │   ├── PracticeMode.tsx
│   │   ├── ExerciseCard.tsx
│   │   └── AnswerVerifier.tsx
│   │
│   └── ...
│
├── services/
│   ├── analysisApi.ts
│   ├── assistantApi.ts
│   └── experimentApi.ts
│
├── state/
│   ├── analysisStore.ts
│   ├── experimentStore.ts
│   └── sessionStore.ts
│
└── ...
```

Adapt to the actual existing repository. Do not destroy prior architecture.

---

# 36. BACKEND ARCHITECTURE

Suggested:

```text
backend/app/
├── api/
│   ├── assistant.py
│   ├── experiments.py
│   └── ...
│
├── assistant/
│   ├── intent_classifier.py
│   ├── context_resolver.py
│   ├── response_builder.py
│   ├── templates.py
│   └── schemas.py
│
├── experiments/
│   ├── service.py
│   ├── diff.py
│   ├── snapshots.py
│   └── schemas.py
│
├── reasoning/
│   └── ...
│
└── ...
```

Reuse existing normalization services.

---

# 37. ASSISTANT API

Implement a deterministic endpoint such as:

```http
POST /api/v1/assistant/ask
```

Request:

```json
{
  "question": "Why is this relation not in 3NF?",
  "analysis_id": "...",
  "context": {
    "relation": "...",
    "attributes": [],
    "candidate_keys": [],
    "normal_forms": {},
    "violations": []
  }
}
```

Prefer referencing the already-generated analysis result rather than sending unnecessary duplicated data if the current architecture supports it.

Response concept:

```json
{
  "intent": "WHY_NF_FAIL",
  "answer": "....",
  "evidence_ids": ["nf3-violation-1"],
  "suggested_actions": [
    "open_evidence",
    "open_experiment"
  ],
  "supported": true
}
```

The backend should return structured evidence identifiers whenever possible.

---

# 38. ASSISTANT ENDPOINT REQUIREMENTS

It must:

- validate input
- never crash on unsupported text
- return deterministic results
- never invent dependencies
- never invent candidate keys
- never fabricate a normal-form result
- clearly indicate unsupported questions
- remain usable offline
- have unit tests

---

# 39. EXPERIMENT API

Where backend re-analysis is required, provide something like:

```http
POST /api/v1/experiments/analyze
```

Request:

```json
{
  "original_input": {...},
  "modified_input": {...}
}
```

Response:

```json
{
  "original_analysis": {...},
  "modified_analysis": {...},
  "diff": {
    "normal_forms_changed": [],
    "dependencies_added": [],
    "dependencies_removed": [],
    "keys_added": [],
    "keys_removed": [],
    "violations_added": [],
    "violations_removed": []
  },
  "reasoning_changes": []
}
```

All values must originate from actual engine execution.

---

# 40. DIFF ENGINE

Implement a structured comparison layer.

Compare at least:

- attributes
- candidate keys
- FDs
- MVDs
- closures where relevant
- prime attributes
- normal-form statuses
- violations
- decomposition proposals
- lossless status
- dependency-preservation status

Do not show a misleading diff when order changes but meaning does not.

Normalize sets before comparing them.

---

# 41. DETERMINISTIC QUESTION MATCHING

The assistant should tolerate natural phrasing variations.

Examples:

```text
why not 3nf
why is 3nf failing
why does this violate third normal form
why isn't it in 3NF
```

should resolve to one intent.

Similarly:

```text
find my keys
what are the candidate keys
which candidate keys do I have
```

must resolve to `CANDIDATE_KEYS`.

Do not attempt unrestricted natural-language generation.

---

# 42. CONTEXTUAL PRONOUN HANDLING

Support simple context references:

```text
Why does this violate 3NF?
Why is that dependency bad?
What about the second one?
```

Maintain a lightweight session context such as:

```text
lastSelectedDependency
lastSelectedViolation
lastSelectedStage
lastOpenedClosure
```

Do not implement a complex conversational memory system.

---

# 43. ASSISTANT QUICK ACTIONS

Provide clickable question suggestions based on current state.

If 2NF fails:

```text
Why is this not in 2NF?
Which dependency causes the violation?
What is the candidate key?
How could I decompose this?
```

If 4NF fails:

```text
Which MVD violates 4NF?
Is this MVD trivial?
Show the 4NF decomposition.
```

If all pass:

```text
Why does this satisfy 4NF?
Show my candidate keys.
Explore the dependency graph.
```

---

# 44. LEARNING CONNECTIONS

The assistant should be able to link a concept back to the Learn section.

For example:

```text
What is a partial dependency?

[Open 2NF lesson]
```

Use route anchors or internal links, not external navigation whenever the content already exists locally.

---

# 45. FEATURE — "LEARN THIS"

Add a reusable button:

```text
[Learn this]
```

Possible destinations:

- 1NF lesson
- 2NF lesson
- 3NF lesson
- 4NF lesson
- candidate keys
- attribute closure
- FD basics
- MVD basics
- decomposition
- lossless join
- dependency preservation

This prepares Phase 10's full Learn section.

If the Learn content is not yet implemented, create a clear placeholder contract rather than fake content.

---

# 46. PRACTICE MODE IMPLEMENTATION DETAIL

For optional practice exercises, define a strict schema:

```ts
interface PracticeExercise {
  id: string;
  type:
    | "candidate-key"
    | "closure"
    | "highest-normal-form"
    | "nf-violation"
    | "mvd-analysis"
    | "decomposition";
  input: AnalysisInput;
  prompt: string;
  expected: ExpectedAnswer;
  explanation: ReasoningTrace;
}
```

Generate exercises from deterministic templates.

No generative model is required.

---

# 47. TESTING — ASSISTANT

Create tests for:

### Concept questions

```text
"What is 3NF?"
```

Expected intent:

```text
CONCEPT_3NF
```

### Context question

```text
"Why is this not in 2NF?"
```

Expected:

- intent correct
- real current violation used
- evidence ID returned

### Closure

```text
"What is AB closure?"
```

Expected actual closure from Phase 3.

### Unsupported

```text
"Write me a poem."
```

Expected:

- unsupported
- no hallucinated DBMS answer

---

# 48. TESTING — EXPERIMENT MODE

Test:

1. Original input remains immutable.
2. Modified input is valid when valid changes are made.
3. Invalid edits are rejected.
4. Added FD changes analysis when mathematically appropriate.
5. Removed FD changes analysis when mathematically appropriate.
6. Added attribute changes relevant keys/closures.
7. Candidate-key changes trigger re-analysis.
8. MVD modifications affect 4NF when appropriate.
9. Diff output reflects real changes.
10. Reset restores exact original state.

---

# 49. TESTING — SNAPSHOTS

Test:

- create snapshot
- rename snapshot
- load snapshot
- delete snapshot
- reset experiment
- snapshot isolation
- no accidental mutation of original analysis

Use local/browser persistence only when appropriate.

---

# 50. TESTING — VISUAL SYNCHRONIZATION

Verify:

```text
click journey stage
      ↓
correct graph highlight
      ↓
correct violation selected
      ↓
correct reasoning shown
      ↓
assistant suggestions update
```

Similarly:

```text
click dependency
      ↓
closure shortcut opens correct closure
      ↓
evidence drawer shows correct explanation
```

---

# 51. ACCESSIBILITY

All interactive creative features must support:

- keyboard navigation
- visible focus
- semantic buttons
- aria labels where needed
- clear status text
- no color-only meaning
- readable contrast
- reduced motion

Interactive graph nodes must have keyboard-accessible equivalents.

---

# 52. ERROR HANDLING

Assistant:

```text
Invalid question
Unsupported question
Missing analysis context
Backend unavailable
```

Experiment:

```text
Invalid modification
Malformed FD
Malformed MVD
Duplicate attribute
Duplicate dependency
Invalid candidate key
```

Show user-friendly messages.

Do not expose raw stack traces.

---

# 53. OFFLINE-FIRST REQUIREMENT

The creative features must work when:

- internet is unavailable
- no LLM API exists
- no API key exists

External references may appear in Learn later, but they must not be required for analyzer/assistant operation.

---

# 54. PERFORMANCE

Avoid re-running the full analysis on every keystroke.

For Experiment Mode:

Use:

```text
edit
 ↓
debounced validation
 ↓
Run Experiment
 ↓
analysis
```

Prefer explicit:

```text
[Run Experiment]
```

for expensive operations.

Cache deterministic calculations where appropriate.

---

# 55. STATE MANAGEMENT

Maintain clear separation:

```text
Original Analysis State
        │
        ├── Visualization State
        │
        ├── Assistant Context
        │
        └── Experiment State
```

Do not mutate the original analysis when entering Experiment Mode.

---

# 56. NO REDUNDANT ENGINES

The following must have exactly one source of truth:

### Candidate keys
Phase 4 engine.

### Attribute closure
Phase 3 engine.

### 1NF/2NF
Phase 5 engine.

### 3NF/4NF
Phase 6 engine.

### Decomposition
Phase 7 engine.

### Verification
Phase 7 engine.

Phase 9 only orchestrates and exposes these capabilities.

---

# 57. VISUAL STYLE FOR CREATIVE FEATURES

Continue the Phase 1/8 visual language.

Use:

- warm off-white/light background
- dark charcoal text
- restrained accent
- thin neutral borders
- subtle depth
- strong typography
- monospace for relational notation
- technical diagrams as visual focus

Avoid:

- giant gradients
- neon purple/blue everywhere
- glassmorphism
- floating blobs
- fake dashboard metrics
- stock AI imagery
- generic SaaS pricing-card layouts

The user should feel:

> “I am exploring a technical system.”

not:

> “I am looking at an AI startup landing page.”

---

# 58. VISUAL HIERARCHY FOR EXPERIMENT MODE

Use a strong three-part hierarchy:

```text
EDITOR
   ↓
IMPACT
   ↓
EVIDENCE
```

The user changes something.

Then sees what changed.

Then sees why.

This should be visually obvious.

---

# 59. VISUAL HIERARCHY FOR ASSISTANT

Use:

```text
Question
   ↓
Direct Answer
   ↓
Evidence
   ↓
Next Action
```

Example:

```text
Why does A → D violate 3NF?

Answer:
A is not a superkey and D is non-prime.

Evidence:
A+ = {A,D}

[Show dependency]
[Show closure]
[Open experiment]
```

This is more useful than long chatbot prose.

---

# 60. CREATIVE DIFFERENTIATION CHECKLIST

Before considering Phase 9 complete, verify that the application clearly demonstrates:

- interactive journey
- real what-if experimentation
- synchronized dependency exploration
- closure exploration
- evidence-based explanations
- contextual assistant
- learning shortcuts
- experiment history
- snapshots
- optional practice mode
- meaningful micro-interactions

These features should visibly distinguish the project from a static normalization calculator.

---

# 61. WHAT NOT TO BUILD

Do not add unnecessary complexity.

Do not build:

- authentication
- social accounts
- payments
- cloud user profiles
- recommendation algorithms
- generic AI agents
- paid LLM APIs
- autonomous agents
- vector databases
- web scraping
- social feeds
- pointless analytics dashboards
- unrelated finance features
- generic admin panel

These do not contribute meaningfully to the assigned DBMS topic.

---

# 62. INTEGRATION WITH PHASE 8

Phase 9 must integrate directly into the Phase 8 visual interface.

Example:

```text
                 NORMALIZATION JOURNEY
        1NF ─── 2NF ─── 3NF ─── 4NF
                         │
                         ▼
                Selected violation
                         │
       ┌─────────────────┼─────────────────┐
       ▼                 ▼                 ▼
 Dependency Graph    Reasoning          Assistant
       │                 │                 │
       ▼                 ▼                 ▼
    Closure          Evidence           Explain
                         │
                         ▼
                  Experiment Mode
```

This should feel like one coherent application.

---

# 63. API/DATA CONTRACT REQUIREMENT

Update shared TypeScript/Pydantic schemas rather than creating untyped ad hoc objects.

Every major new result must have:

- stable ID
- human-readable title
- structured type
- evidence linkage where relevant
- source engine/module
- optional related entities

Example:

```ts
interface EvidenceItem {
  id: string;
  kind:
    | "fd"
    | "mvd"
    | "candidate-key"
    | "closure"
    | "nf-condition"
    | "decomposition"
    | "verification";
  title: string;
  description: string;
  relatedIds: string[];
}
```

---

# 64. DEVELOPMENT ORDER

Implement in this exact order:

### Step 1
Create shared evidence/selection identifiers.

### Step 2
Implement Explain-Why components.

### Step 3
Implement Interactive Normalization Journey.

### Step 4
Connect dependency graph selection to evidence.

### Step 5
Connect closure shortcuts.

### Step 6
Implement Experiment Mode state.

### Step 7
Implement experiment diff/re-analysis.

### Step 8
Implement experiment history/snapshots.

### Step 9
Implement deterministic assistant backend.

### Step 10
Implement assistant UI.

### Step 11
Connect assistant suggestions to selected evidence.

### Step 12
Add Learn-this links.

### Step 13
Implement optional Practice Mode only after all above are stable.

### Step 14
Add polished micro-interactions.

### Step 15
Run complete integration tests.

---

# 65. ACCEPTANCE TEST — SCENARIO A

Use a relation with a composite key and a partial dependency.

The user should be able to:

1. Enter schema.
2. Run analysis.
3. See 2NF failure.
4. Click 2NF.
5. See exact partial dependency.
6. Click dependency.
7. See it highlighted in graph.
8. Click closure.
9. See relevant closure.
10. Ask assistant:
   `Why is this not in 2NF?`
11. Receive answer based on actual analysis.
12. Enter Experiment Mode.
13. Modify the dependency/key.
14. Re-run.
15. See Before → After difference.
16. See why the normal-form result changed.

---

# 66. ACCEPTANCE TEST — SCENARIO B

Use a relation with a 3NF violation.

The user should be able to:

1. identify the violating FD
2. inspect candidate key
3. inspect prime/non-prime attributes
4. open the formal 3NF explanation
5. view decomposition proposal
6. inspect lossless/dependency-preservation verification when available
7. ask assistant why the relation fails
8. experiment with a changed dependency
9. observe the actual impact

---

# 67. ACCEPTANCE TEST — SCENARIO C

Use a relation with a non-trivial MVD causing a 4NF violation.

The user should be able to:

1. see 4NF failure
2. identify the MVD
3. see why the MVD is non-trivial
4. see whether determinant is a superkey
5. see the 4NF decomposition
6. explore the relevant dependency graph edge
7. ask assistant:
   `Why is this MVD a 4NF violation?`
8. see a factual answer based on engine output

---

# 68. ACCEPTANCE TEST — SCENARIO D

Use a relation satisfying 4NF.

The application should not stop at:

```text
4NF: PASS
```

It should provide:

```text
Why?
```

showing the conditions that were verified.

The user should be able to inspect:

- candidate keys
- relevant FD/MVDs
- trivial vs non-trivial dependencies
- absence of applicable violations
- decomposition status if decomposition was not needed

---

# 69. ACADEMIC INTEGRITY OF OUTPUT

Every explanation must distinguish:

### Formal result

What the algorithm actually determined.

### Interpretation

Why that result follows.

### Optional learning note

Broader educational explanation.

Do not blur these together.

Example:

```text
Formal result:
3NF is not satisfied.

Reason:
A → D violates the formal condition.

Learning note:
This is often described as a transitive dependency pattern when
the dependency structure permits such an interpretation.
```

Avoid saying every 3NF violation is automatically a textbook transitive dependency without checking the actual structure.

---

# 70. NO FALSE CERTAINTY

Where the engine cannot conclude something, say so.

Example for 1NF:

```text
Schema-only input cannot establish whether every stored cell
is atomic.

No tuple data was provided.

1NF structural analysis:
No explicit repeating-group representation detected.

Data-level atomicity:
Not verified.
```

Phase 9 must preserve this same honesty.

---

# 71. DELIVERABLES

At the end of Phase 9, produce:

### Frontend
- journey UI
- experiment UI
- assistant UI
- explain-why components
- evidence navigation
- dependency/closure shortcuts
- snapshot/history UI
- optional practice UI

### Backend
- deterministic assistant
- intent classifier
- contextual response builder
- experiment analysis endpoint
- diff engine
- snapshot support if backend persistence is used

### Shared models
- assistant request/response
- evidence model
- experiment input/output
- diff model
- practice model if implemented

### Tests
- unit tests
- integration tests
- assistant intent tests
- experiment diff tests
- visualization interaction tests

### Documentation
Update project documentation with:

- Phase 9 features
- architecture
- assistant limitations
- how experiments work
- how reasoning is generated
- supported assistant questions
- testing instructions

---

# 72. DEFINITION OF DONE

Phase 9 is complete only when:

- the core analyzer still works
- no previous phase functionality regresses
- journey stages are interactive
- dependency graph and reasoning remain synchronized
- closure can be launched from relevant evidence
- Explain-Why is available for major results
- Experiment Mode uses real re-analysis
- Before/After diff is accurate
- Reset works
- snapshots do not corrupt original state
- assistant works without any external LLM
- assistant answers are based on current analysis
- unsupported questions do not hallucinate
- suggested actions are contextual
- optional Practice Mode is isolated and uses existing engines
- reduced motion is respected
- accessibility is functional
- all major features have tests
- application remains visually coherent
- no fake data is presented as user analysis
- no fake AI branding is used

---

# 73. FINAL QUALITY BAR

When you finish Phase 9, ask:

### Can a student understand not only the result, but why it happened?

### Can the student change the assumptions and immediately see what changes?

### Can the student explore the exact dependency responsible for a violation?

### Can the student calculate a closure without leaving the analyzer?

### Can the student ask a focused DBMS question without requiring an external AI service?

### Can every assistant answer be traced back to the real normalization engine?

### Does the feature set feel like a real educational laboratory rather than a static normalization calculator?

### Does it still look original and technically serious rather than like AI-generated SaaS?

If any answer is “no”, continue refining Phase 9 before moving to Phase 10.

---

# 74. IMPORTANT HANDOFF TO PHASE 10

Do not duplicate Phase 10 requirements yet.

Phase 10 will separately formalize:

- Learn section
- Help/User Manual
- Developed By
- Guided By
- Download/Report generation
- PDF
- Document
- Text
- final required navigation
- complete academic resources/references

Phase 9 should only create the hooks needed to connect these features.

---

# 75. FINAL IMPLEMENTATION RULE

**Do not rebuild the mathematics in Phase 9.**

Phase 9 is the **interaction, explanation, experimentation, and educational intelligence layer** sitting on top of the already-built DBMS normalization engine.

The final architecture should resemble:

```text
                    ┌─────────────────────────┐
                    │     User Input          │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │   Normalization Core    │
                    │     Phases 2–7          │
                    └────────────┬────────────┘
                                 │
               ┌─────────────────┼─────────────────┐
               │                 │                 │
               ▼                 ▼                 ▼
        Visualization       Evidence          Experiment
         Phase 8             Layer              Mode
               │                 │                 │
               └─────────────────┼─────────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │ Contextual Assistant    │
                    │  + Learning Shortcuts   │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │ Student Understanding   │
                    └─────────────────────────┘
```

**Implement this phase as a polished extension of all previous phases, not as a separate application.**
