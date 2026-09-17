# PHASE 1 — Project Foundation, Architecture & UI System
## 1NF–4NF Normalization Visualizer & Analyzer / "Normalization Lab"

**Purpose of this file:**  
This is the **execution specification for Phase 1** of the project. Use it together with `normalization_lab_master_project_reference.md`.

The master reference defines the complete project vision and all later requirements. This file defines **exactly what must be implemented in Phase 1**, what must deliberately be deferred, how the architecture must be prepared for later phases, and how the work must be verified.

---

# 0. AUTHORITY AND CONTEXT

There are two project-reference levels:

### Master project reference
`normalization_lab_master_project_reference.md`

This is the authoritative source for:

- overall project scope,
- 1NF–4NF academic requirements,
- mandatory website sections,
- creativity requirements,
- UI/UX philosophy,
- technology direction,
- testing expectations,
- deployment expectations,
- later project phases.

### This document
This is the authoritative specification for **Phase 1 execution**.

When implementing Phase 1:

1. Read the master reference first.
2. Follow the master reference for the overall architecture and vision.
3. Follow this file for Phase 1 scope.
4. Do not implement features belonging to later phases simply because they are mentioned in the master reference.
5. Build foundations that allow later phases to plug in cleanly.

---

# 1. PROJECT SUMMARY

The project is an interactive educational web application for:

> **1NF, 2NF, 3NF and 4NF normalization**

The final product will allow users to enter their own relational schema and receive:

- normalization analysis,
- candidate-key analysis,
- functional-dependency analysis,
- multivalued-dependency analysis,
- step-by-step reasoning,
- decomposition,
- interactive visualizations,
- educational explanations,
- contextual question/answer assistance,
- experimentation,
- reports.

The final application must feel like a:

> **technical learning laboratory / interactive DBMS learning tool**

and not like:

- a generic SaaS dashboard,
- an AI startup landing page,
- an overdecorated admin panel,
- or a static collection of theory pages.

Phase 1 establishes the foundation only.

---

# 2. PRIMARY GOAL OF PHASE 1

Build a **clean, scalable, maintainable, production-oriented project foundation** on which all later functionality can be implemented without major architectural rewrites.

At the end of Phase 1:

- the frontend must run,
- the backend must run,
- frontend/backend communication must work,
- project structure must be clean,
- routing must be established,
- global styling/design tokens must exist,
- Day/Night mode must work,
- reusable UI primitives must exist,
- application pages must exist as polished placeholders,
- database infrastructure must be initialized,
- API infrastructure must exist,
- configuration management must exist,
- testing must be configured,
- documentation must exist,
- GitHub-ready configuration must exist.

Phase 1 is **not** the normalization engine.

---

# 3. CRITICAL SCOPE BOUNDARY

## DO NOT IMPLEMENT THE ACTUAL NORMALIZATION LOGIC IN PHASE 1

Do not implement:

- attribute closure algorithm,
- candidate-key derivation,
- superkey calculation,
- prime/non-prime classification,
- functional-dependency implication,
- canonical/minimal cover,
- 1NF analysis,
- 2NF analysis,
- 3NF analysis,
- 4NF analysis,
- MVD reasoning,
- decomposition algorithms,
- lossless-join verification,
- dependency-preservation verification,
- actual dependency graph generation,
- actual closure visualization,
- actual What-If analysis,
- Practice Mode,
- full chatbot intelligence,
- LLM integration,
- report generation,
- final Learn content,
- final Help content.

Those belong to later phases.

The Phase 1 UI may contain **clearly marked placeholders** for future functionality, but it must not create fake results or pretend future systems are already working.

---

# 4. TECHNOLOGY STACK

Use the following stack unless there is a strong technical reason to change a specific component.

## Frontend

- React
- TypeScript
- Vite

## Styling

- Tailwind CSS
- CSS variables/design tokens for theme and design-system values

## Backend

- Python
- FastAPI
- Pydantic

## Database

- SQLite
- SQLAlchemy

## Visualization foundation

Prepare architecture for:

- React Flow
- D3.js

Do not implement the complete normalization visualization engine yet.

## Testing

Backend:

- pytest

Frontend:

- a suitable React/TypeScript testing setup, such as Vitest + React Testing Library if appropriate.

## Package management

Use standard package-management tooling appropriate to each ecosystem.

Avoid introducing unnecessary libraries.

---

# 5. ARCHITECTURAL PRINCIPLE

The project must be a **modular monolith**, not a collection of microservices.

Target architecture:

```text
                     FRONTEND
                 React + TypeScript
                         │
                         ▼
                    API CLIENT
                         │
                         ▼
                     FASTAPI
                         │
             ┌───────────┴───────────┐
             │                       │
             ▼                       ▼
       Application Services       Database
             │
             ▼
      Normalization Engine
             │
      ┌──────┼───────┐
      ▼      ▼       ▼
     FDs    MVDs    Keys
```

Later:

```text
Normalization Engine
        ↓
1NF → 2NF → 3NF → 4NF
        ↓
Decomposition
        ↓
Verification
        ↓
Structured Analysis Result
        ↓
Visualizer / Explanation / Report / Assistant
```

The key architectural rule is:

> **Normalization logic must be independent of the UI.**

React components must never contain the actual 1NF–4NF algorithms.

---

# 6. PROJECT STRUCTURE

Establish a clean structure similar to:

```text
normalization-visualizer/
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/
│   │   │   ├── layout/
│   │   │   └── common/
│   │   ├── pages/
│   │   ├── features/
│   │   ├── layouts/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── types/
│   │   ├── utils/
│   │   ├── config/
│   │   ├── assets/
│   │   ├── styles/
│   │   └── ...
│   ├── package.json
│   └── ...
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── v1/
│   │   │   └── ...
│   │   ├── core/
│   │   ├── schemas/
│   │   ├── models/
│   │   ├── database/
│   │   ├── services/
│   │   ├── normalization/
│   │   ├── visualization/
│   │   ├── reports/
│   │   └── main.py
│   │
│   ├── tests/
│   ├── pyproject.toml or requirements.txt
│   └── ...
│
├── docs/
│   ├── architecture.md
│   ├── development.md
│   └── ...
│
├── .env.example
├── .gitignore
├── README.md
└── ...
```

Exact folder names may be adjusted if justified, but the following conceptual boundaries MUST exist:

- frontend UI,
- frontend services/types,
- backend API,
- backend domain/application services,
- database layer,
- future normalization engine,
- future visualization,
- future reports,
- tests,
- documentation.

---

# 7. REPOSITORY INSPECTION BEFORE CODING

Before making changes:

1. Inspect the repository.
2. Determine whether it is empty or partially implemented.
3. List relevant existing files.
4. Identify the current framework/tooling.
5. Preserve existing useful work.
6. Do not blindly delete the repository.
7. Do not create duplicate applications next to an existing one.
8. Align current work to this architecture where possible.

If the repository is empty, initialize it from scratch.

If the repository already contains a suitable frontend/backend, adapt rather than rewrite unnecessarily.

---

# 8. FRONTEND INITIALIZATION

Initialize a professional React + TypeScript + Vite application.

## Requirements

- strict TypeScript,
- clean component architecture,
- centralized routing,
- reusable UI primitives,
- centralized design tokens,
- centralized API client,
- environment configuration,
- test setup,
- linting/formatting.

Do not rely on uncontrolled JavaScript.

Avoid excessive use of `any`.

Avoid giant page components.

---

# 9. BACKEND INITIALIZATION

Initialize a professional FastAPI application.

Backend responsibilities eventually include:

- validation,
- normalization algorithms,
- dependency/key processing,
- explanation generation,
- decomposition,
- visualization data,
- reports,
- history.

Phase 1 only establishes infrastructure.

Create:

- FastAPI app,
- router hierarchy,
- configuration,
- CORS setup,
- exception handling foundation,
- health endpoint,
- testing setup.

---

# 10. API VERSIONING

Use a versioned API foundation.

Suggested base:

```text
/api/v1
```

Required Phase 1 endpoint:

```text
GET /api/v1/health
```

Expected conceptual response:

```json
{
  "status": "ok"
}
```

It is acceptable to include basic metadata such as API version, provided the response remains simple and stable.

Do not create fake normalization endpoints.

---

# 11. FRONTEND ↔ BACKEND CONNECTION

Create a centralized API service/client.

Do NOT place raw `fetch()` or HTTP calls in arbitrary UI components.

Use a structure similar to:

```text
frontend
  ↓
services/apiClient
  ↓
FastAPI
```

The frontend must be able to call the health endpoint and display an appropriate development-status state.

Handle:

- loading,
- success,
- unavailable backend,
- request failure.

---

# 12. ENVIRONMENT CONFIGURATION

Create proper development configuration.

Frontend should use an environment variable for backend API base URL.

Backend should use environment configuration for:

- environment,
- API host,
- API port,
- database URL,
- CORS origins,
- future frontend URL.

Create:

```text
.env.example
```

Never commit real secrets.

Do not add any LLM API key.

There must be no paid external API requirement.

---

# 13. DATABASE FOUNDATION

Set up:

- SQLite,
- SQLAlchemy engine,
- session handling,
- base model,
- development database initialization pattern.

Do not over-design the application database in Phase 1.

Future application-level data may include:

```text
analyses
analysis_steps
saved_schemas
sample_problems
history
```

but the actual production schema can be introduced in later phases.

Important distinction:

> The application's SQLite database is NOT the same thing as the relational schema a student will enter for normalization.

Document this distinction.

---

# 14. FUTURE DOMAIN MODEL FOUNDATION

Establish the conceptual domain boundaries for future implementation.

Future concepts include:

## Relation

```text
name
attributes[]
```

## Candidate Key

```text
attributes[]
```

## Functional Dependency

```text
leftAttributes[]
rightAttributes[]
```

## Multivalued Dependency

```text
leftAttributes[]
rightAttributes[]
```

## Sample Tuple

```text
values[]
```

## Analysis

Future analysis object will eventually contain:

```text
input
candidateKeys
functionalDependencies
multivaluedDependencies
attributeClassification
stages
violations
reasoningSteps
decompositions
verification
```

Do not calculate these yet.

The Phase 1 architecture should make it possible to introduce them without changing the whole application.

---

# 15. IMPORTANT FUTURE ANALYSIS CONTRACT

Do not design the future backend around boolean-only results.

Bad concept:

```json
{
  "is2NF": false
}
```

The final system needs rich structured reasoning.

Conceptual future shape:

```text
analysis
├── input
├── dependencies
├── candidateKeys
├── primeAttributes
├── nonPrimeAttributes
├── stages
│   ├── 1NF
│   ├── 2NF
│   ├── 3NF
│   └── 4NF
├── violations
├── reasoningSteps
├── decompositions
└── verification
```

Phase 1 should create boundaries that can support this.

---

# 16. ROUTING

Create routes for the major application areas.

Minimum routes:

```text
/
 /analyzer
 /learn
 /help
 /developed-by
 /history
```

Optional future route placeholders:

```text
/practice
/closure
/experiments
```

Only add them if that makes architectural sense.

Each current route must render a purposeful placeholder.

Do not use:

> "Lorem ipsum"

or generic empty pages.

---

# 17. GLOBAL NAVIGATION

Desktop-first navigation should approximately contain:

```text
Normalization Lab
Home
Analyzer
Learn
History
Help
Developed By
Theme Toggle
```

Download will later be available contextually from analysis results.

Do not overload the navigation.

Use active-state indication.

The Learn section must be prominent because it is mandatory under the evaluation rubric.

Help and Developed By must also be easy to find.

---

# 18. PRODUCT IDENTITY

Use:

### Formal academic title

**1NF–4NF Normalization Visualizer & Analyzer**

### Product/UI identity

**Normalization Lab**

The UI can say:

> Normalization Lab

with the formal project title appearing appropriately in the home page/footer/documentation.

---

# 19. UI/UX DESIGN DIRECTION

This project must NOT look like generic AI-generated SaaS.

The goal is:

> **eye-catching + educational + interactive + technically credible + visually memorable**

but still calm and usable.

The interface should feel inspired by:

- serious educational products,
- interactive CS learning tools,
- technical diagramming software,
- data visualization products.

Useful design inspiration principles may come from:

- Brilliant,
- Khan Academy,
- Nand2Tetris,
- CS50,
- Observable/D3 visualizations,
- React Flow/diagram interfaces.

Do not copy their branding.

---

# 20. WHAT TO AVOID IN THE UI

Avoid:

- excessive gradients,
- neon purple/blue everywhere,
- glassmorphism everywhere,
- glowing cards,
- giant marketing slogans,
- floating blobs,
- excessive rounded rectangles,
- meaningless dashboard cards,
- fake statistics,
- generic AI/chatbot hero sections,
- excessive "AI powered" labels,
- animation for no reason,
- excessive shadows.

Do not make every component a card.

Avoid "card soup."

---

# 21. WHAT TO PRIORITIZE VISUALLY

The primary visual hierarchy should eventually be:

1. current normalization stage,
2. relational schema,
3. dependencies,
4. violation/reasoning,
5. decomposition,
6. explanation,
7. supporting controls.

The Analyzer is the main product screen.

The Home page should introduce the product but not overwhelm it.

---

# 22. VISUAL STYLE

## Light Mode

Use a restrained palette based around:

- warm off-white/neutral canvas,
- dark charcoal text,
- muted gray surfaces,
- one distinctive primary accent,
- subtle status colors.

## Dark Mode

Use:

- deep charcoal or slightly blue-toned neutral background,
- warm/light text,
- restrained surfaces,
- same accent family,
- carefully adjusted graph/table contrast.

Do not simply invert all colors.

---

# 23. DESIGN TOKENS

Create a reusable design-token system.

At minimum include tokens for:

- page background,
- surface,
- elevated surface,
- text primary,
- text secondary,
- border,
- accent,
- success,
- warning,
- error,
- focus,
- radii,
- spacing,
- typography sizes,
- shadows,
- motion durations.

Prefer CSS variables/theme tokens where appropriate.

This allows later global refinement without touching every component.

---

# 24. TYPOGRAPHY

Choose a professional readable typeface.

Typography must provide clear hierarchy.

Use normal text for explanations and headings.

Use monospace selectively for technical notation such as:

```text
A → B
A →→ C
R(A,B,C,D)
A+
(StudentID, CourseID)
```

Do not use monospace for the whole site.

---

# 25. UI MOTION

Establish a subtle motion language.

Later features may use:

- hover lift,
- active-state transitions,
- dependency highlighting,
- graph edge animation,
- schema transformation animation,
- panel expansion,
- tab transitions.

Phase 1 should establish reusable motion conventions.

Do not create excessive animations yet.

Principle:

> Animation must communicate state change or support interaction.

---

# 26. REUSABLE UI COMPONENTS

Create a small, high-quality reusable component library.

Potential primitives:

- Button
- IconButton where necessary
- Input
- Textarea
- Select
- Checkbox
- Toggle
- Badge
- Card/Panel
- Modal/Dialog
- Tooltip
- Tabs
- SectionHeading
- EmptyState
- LoadingState
- ErrorState
- Divider
- Breadcrumb where useful

Do not create components solely for the sake of having many components.

Components should be reusable and accessible.

---

# 27. HOME PAGE

Create a polished foundational Home page.

It should immediately communicate:

## Title

> 1NF–4NF Normalization Visualizer

## Supporting statement

Conceptually:

> An interactive learning and analysis environment for understanding keys, dependencies, normalization violations, and decomposition step-by-step.

## Primary actions

- Start Analysis
- Learn Normalization
- Try Example

## Visual identity

Display a restrained visual representation:

```text
1NF → 2NF → 3NF → 4NF
```

This is a preview of the eventual normalization journey.

Do not fake real analysis.

Do not show fake metrics or fake "users helped" statistics.

---

# 28. ANALYZER PLACEHOLDER

Build the initial Analyzer shell because it will become the center of the product.

Use a desktop-first workspace conceptually like:

```text
┌─────────────────────────────────────────────────────────────┐
│ INPUT          │ VISUALIZATION / JOURNEY │ INSIGHT         │
│                │                         │                 │
│ Relation       │ 1NF → 2NF → 3NF → 4NF │ Current stage   │
│ Attributes     │                         │ Explanation     │
│ Candidate Key  │ Future graph area      │ Why?            │
│ FDs            │                         │                 │
│ MVDs           │                         │                 │
│ Sample Data    │                         │                 │
└─────────────────────────────────────────────────────────────┘
```

Do not make controls appear functional if the underlying implementation is not present.

Use intentional placeholders such as:

> "Your normalization analysis will appear here."

---

# 29. FUTURE INPUT COMPONENT PLACEHOLDERS

The architecture should have clear homes for:

- RelationEditor
- AttributeBuilder
- CandidateKeyBuilder
- FDBuilder
- MVDBuilder
- SampleDataEditor

These may be basic placeholders in Phase 1.

Do not implement actual parsing or validation logic yet.

---

# 30. LEARN PAGE PLACEHOLDER

Create a visually coherent placeholder page that communicates the future content.

It should mention that it will contain:

- normalization concepts,
- examples,
- educational video,
- references.

Do not write the entire final theory content in Phase 1.

---

# 31. HELP PAGE PLACEHOLDER

Create a clear placeholder structure for the future user manual:

- What the application does
- How to enter input
- How to analyze
- How to interpret results
- How to use visualizations
- How to download reports

Full instructions come later.

---

# 32. DEVELOPED BY PAGE PLACEHOLDER

Create a polished page structure with placeholders for:

- team member photo,
- name,
- register number,
- role,
- guide.

Use configuration-driven data.

The guide should be preconfigured conceptually as:

**Dr. Swaminathan A**  
**Assistant Professor**

Team details will be replaced later.

---

# 33. HISTORY PAGE PLACEHOLDER

Create a useful empty state:

> No analyses yet.

Future history can contain:

- analysis title,
- relation name,
- date/time,
- highest achieved normal form.

Do not implement the final history persistence logic yet.

---

# 34. DAY/NIGHT MODE

Implement the actual Day/Night mode in Phase 1.

Requirements:

- global theme toggle,
- clear light/dark visual language,
- readable text in both modes,
- visible focus state,
- graph-ready colors,
- table-ready colors,
- persistent preference where practical,
- sensible default based on system preference if possible.

Suggested control:

```text
☀ Day
🌙 Night
```

or an equivalent compact accessible toggle.

Do not make the control icon-only without an accessible label.

---

# 35. ACCESSIBILITY

Phase 1 must establish accessibility conventions.

Requirements:

- semantic HTML,
- labels for inputs,
- keyboard navigation,
- focus states,
- accessible buttons,
- adequate contrast,
- no color-only meaning,
- useful ARIA labels when needed.

Future statuses should use:

```text
✓ Satisfied
✗ Violated
⚠ Warning
— Not evaluated
```

in addition to color.

---

# 36. RESPONSIVE FOUNDATION

Design desktop-first.

Primary target:

- laptop,
- desktop.

Still support smaller displays.

Conceptually:

```text
Desktop:
3-column analyzer

Tablet:
2-column analyzer

Mobile:
stacked sections
```

Do not let mobile design compromise the desktop workspace.

---

# 37. TEAM CONFIGURATION

Create centralized project metadata.

Conceptually:

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

Use placeholders where necessary.

Do not scatter these values across components.

This is required because team details may change later.

---

# 38. FRONTEND STATE ARCHITECTURE

Do not introduce a large state-management library unless clearly necessary.

Phase 1 should establish a sensible approach using:

- React state,
- context where appropriate,
- feature-local state,
- URL state when appropriate.

Later analyzer state should be structured around:

- user input,
- validation state,
- analysis state,
- visualization state,
- assistant state.

Do not build the full state machine yet, but avoid architectural decisions that prevent it.

---

# 39. BACKEND CODE ORGANIZATION

Keep route handlers thin.

Conceptually:

```text
API Router
    ↓
Application Service
    ↓
Domain / Normalization Service
```

Do not place substantial business logic directly inside FastAPI routes.

Even Phase 1 placeholders should follow this principle.

---

# 40. ERROR HANDLING

Create reusable frontend and backend error-handling conventions.

Frontend states:

- Loading
- Success
- Error
- Empty

Backend:

- structured API errors,
- consistent HTTP status usage,
- safe exception handling.

Do not expose Python stack traces to users.

---

# 41. LOGGING

Set up sensible backend logging configuration.

Use logging for:

- startup,
- API errors,
- development diagnostics.

Do not log secrets or sensitive values.

Do not over-log every request unless useful.

---

# 42. CORS

Configure CORS for local development.

Do not use an unnecessarily permissive configuration in production-oriented code.

Make origins configurable through environment variables.

---

# 43. SECURITY FOUNDATION

Even though this is not a security project:

- validate environment configuration,
- never commit secrets,
- do not expose API keys,
- sanitize/validate user data later,
- do not execute arbitrary user-supplied SQL,
- structure API validation cleanly.

No authentication is required in this version.

---

# 44. GIT / GITHUB READINESS

Create/update:

`.gitignore`

Exclude:

- node_modules
- Python virtual environments
- Python caches
- `.env`
- generated build artifacts
- local IDE settings
- temporary files
- local database files if they should remain local

Create:

`.env.example`

The repository must be safe to push to GitHub.

---

# 45. README

Update README with:

## Project

- title,
- purpose,
- scope.

## Current phase

Explicitly state:

> Phase 1 — Foundation and Architecture

## Stack

- React
- TypeScript
- Vite
- Tailwind
- FastAPI
- Python
- SQLite
- SQLAlchemy

## Structure

Explain the main directories.

## Local setup

Explain:

1. install dependencies,
2. configure `.env`,
3. start backend,
4. start frontend,
5. verify health endpoint.

## Testing

Explain commands.

## Development phases

Briefly list:

1. Foundation
2. Input builder
3. FD/closure
4. Candidate keys
5. 1NF/2NF
6. 3NF/4NF
7. Decomposition
8. Visualization
9. Creative features
10. Mandatory pages/reports
11. Testing
12. Deployment

Do not claim future phases are completed.

---

# 46. ARCHITECTURE DOCUMENT

Create/update:

`docs/architecture.md`

Include:

- system overview,
- frontend/backend separation,
- API layer,
- database layer,
- planned normalization engine,
- future visualization layer,
- future report layer,
- future assistant,
- data-flow diagram,
- rationale for technology choices.

Make it clear which parts are implemented now and which are planned.

---

# 47. DEVELOPMENT DOCUMENTATION

Create/update:

`docs/development.md`

Include:

- project prerequisites,
- local setup,
- frontend start,
- backend start,
- test commands,
- environment variables,
- common development troubleshooting.

---

# 48. TEST CONFIGURATION

Set up the test environment.

## Backend

At minimum:

- application imports,
- health endpoint,
- basic configuration.

## Frontend

At minimum:

- root application renders,
- navigation renders,
- theme toggle works,
- route shell renders.

Do not write normalization algorithm tests yet.

---

# 49. LINTING / FORMATTING

Configure reasonable tooling.

Frontend:

- ESLint
- formatting convention

Backend:

- Python formatter/linter as appropriate.

Use a consistent code style.

Do not spend excessive time tuning formatting in Phase 1.

---

# 50. NO PAID LLM

This phase must contain:

- no OpenAI integration,
- no Gemini API integration,
- no Claude API integration,
- no paid external AI dependency,
- no API key requirement.

The eventual contextual assistant can work through deterministic knowledge/rule-based responses.

A true LLM can be considered future scope only.

---

# 51. DESIGN QUALITY BAR

The first phase UI should already look intentionally designed.

It should NOT look like:

- default Vite page,
- default Tailwind demo,
- generic admin panel,
- unstyled components,
- a template with random colors.

The visual identity should already communicate:

> "This is a professional interactive educational DBMS tool."

However, do not spend time implementing future analyzer functionality just to make a screenshot look complete.

---

# 52. VISUAL CHECKLIST

Before completing Phase 1, inspect:

### Navigation

- Is the active page obvious?
- Is navigation uncluttered?
- Are Learn, Help, Developed By visible?

### Typography

- Is hierarchy clear?
- Are technical expressions readable?

### Spacing

- Is there enough breathing room?
- Is content alignment consistent?

### Colors

- Is the accent restrained?
- Are statuses readable?
- Does dark mode look deliberately designed?

### Interaction

- Do buttons have appropriate hover/press/focus states?
- Does the theme transition feel smooth?

### Layout

- Does desktop look polished?
- Is there any accidental overflow?
- Does the page adapt reasonably to narrower screens?

---

# 53. PHASE 1 ACCEPTANCE TEST — FUNCTIONAL

The following must work:

## Frontend

- application starts,
- routes work,
- navigation works,
- Home loads,
- Analyzer loads,
- Learn loads,
- Help loads,
- Developed By loads,
- History loads,
- theme toggle works.

## Backend

- FastAPI starts,
- `/api/v1/health` responds,
- CORS works for local frontend,
- configuration loads.

## Integration

- frontend can call backend health endpoint,
- error state is handled if backend is stopped.

---

# 54. PHASE 1 ACCEPTANCE TEST — ARCHITECTURAL

Verify:

- frontend does not contain normalization algorithms,
- API calls use an abstraction,
- backend routes are not overloaded with business logic,
- database access has a clean abstraction,
- project metadata is centralized,
- future domain objects have a clear place,
- visualization has a clear architectural location,
- report generation has a clear architectural location,
- normalization engine has a clear architectural location.

---

# 55. PHASE 1 ACCEPTANCE TEST — CODE QUALITY

Verify:

- no excessive `any`,
- no duplicated API logic,
- no hardcoded team details in multiple places,
- no secrets,
- no unnecessary dependencies,
- no dead placeholder components without purpose,
- no giant monolithic page/component,
- no fake data presented as real analysis,
- no console errors that indicate broken functionality.

---

# 56. PHASE 1 ACCEPTANCE TEST — UI

Verify:

- polished desktop-first interface,
- coherent visual identity,
- light mode works,
- dark mode works,
- accessible navigation,
- appropriate focus states,
- hover states,
- responsive behavior,
- no broken assets,
- no obvious layout overflow.

---

# 57. PHASE 1 ACCEPTANCE TEST — TESTING

Run all configured tests.

The final Phase 1 result should have:

- passing backend tests,
- passing frontend tests,
- successful production/build check,
- successful browser check.

If something fails, fix it before declaring the phase complete.

---

# 58. BROWSER VERIFICATION

After implementing:

1. Start backend.
2. Start frontend.
3. Open the website in a browser.
4. Navigate through every Phase 1 route.
5. Toggle Day/Night.
6. Resize the browser.
7. Inspect console for errors.
8. Verify API connectivity.
9. Confirm no blank/broken page.
10. Confirm no broken images/icons/fonts.
11. Confirm buttons and navigation have visible states.

Do not rely only on compiler/build success.

---

# 59. NO PRETEND FUNCTIONALITY

Important:

The Analyzer must not say:

> "2NF violated."

unless the actual analyzer exists in a later phase.

Likewise, do not create fake candidate keys.

Do not create fake dependency graphs.

Do not create fake decomposition.

A visual preview of future functionality is acceptable if it is clearly presented as a preview.

---

# 60. PHASE 1 DELIVERABLES

At the end of Phase 1, the repository should contain:

### Code

- frontend application,
- backend application,
- API client,
- API health endpoint,
- database foundation,
- routing,
- theme system,
- UI primitives,
- page shells.

### Documentation

- README,
- architecture documentation,
- development setup documentation.

### Configuration

- `.env.example`,
- `.gitignore`,
- package/dependency configuration.

### Tests

- frontend shell tests,
- backend basic tests,
- health endpoint test.

---

# 61. EXPLICIT DEFERRED FEATURES

The following are intentionally deferred.

## Phase 2

- actual schema/input builder,
- validation.

## Phase 3

- FD engine,
- attribute closure.

## Phase 4

- candidate-key engine.

## Phase 5

- 1NF,
- 2NF.

## Phase 6

- 3NF,
- 4NF.

## Phase 7

- decomposition,
- lossless,
- dependency preservation.

## Phase 8

- actual visualization engine.

## Phase 9

- Why/Show Logic,
- What-If,
- contextual assistant,
- creativity features.

## Phase 10

- final Learn content,
- final Help,
- Developed By final content,
- Download/reporting.

## Phase 11

- complete testing.

## Phase 12

- deployment and final polish.

Do not pull major functionality from these phases into Phase 1 unless explicitly necessary for architecture.

---

# 62. FUTURE PHASE COMPATIBILITY

Phase 1 must make these later features easy to add:

### User input

```text
Relation
Attributes
Candidate Keys
FDs
MVDs
Sample Data
```

### Algorithms

```text
Closure
Candidate Keys
1NF
2NF
3NF
4NF
Decomposition
Verification
```

### Visualizations

```text
Normalization Journey
Dependency Graph
Attribute Closure
Decomposition Tree
Before/After
```

### Education

```text
Why?
Show Logic
Normalization Assistant
Learn
Practice
```

### Output

```text
PDF
DOCX
TXT
History
```

---

# 63. DO NOT OVERENGINEER

This is a single academic application.

Do not introduce:

- microservices,
- Kubernetes,
- cloud orchestration,
- authentication,
- complex event buses,
- message queues,
- unnecessary GraphQL,
- paid APIs,
- unnecessary real-time infrastructure.

Keep the architecture professional but proportionate.

---

# 64. IMPLEMENTATION WORKFLOW

Before coding:

### Step A — Inspect

Read master reference and current repo.

### Step B — Plan

Produce a short internal implementation plan.

### Step C — Implement

Build Phase 1 sequentially.

### Step D — Test

Run automated tests.

### Step E — Build

Run frontend build and backend startup.

### Step F — Browser inspect

Open and inspect the actual application.

### Step G — Fix

Fix discovered issues.

### Step H — Retest

Run tests again.

### Step I — Document

Update README/architecture/development docs.

### Step J — Final verification

Check every acceptance criterion.

---

# 65. IMPORTANT ANTIGRAVITY BEHAVIOR

When using an agentic coding environment:

- inspect files before changing them,
- do not make assumptions about existing code,
- prefer incremental changes,
- do not rewrite working code without a reason,
- test after meaningful changes,
- use the browser when validating UI,
- check the terminal for errors,
- keep the project runnable throughout implementation.

If a decision is uncertain, choose the architecture that best preserves later compatibility with the master project reference.

---

# 66. FINAL PHASE 1 REPORT

When Phase 1 is complete, produce a development summary containing:

1. Files created/changed.
2. Repository structure.
3. Frontend stack.
4. Backend stack.
5. Database setup.
6. API routes.
7. Theme implementation.
8. UI pages created.
9. Design-system components created.
10. Testing performed.
11. Browser verification performed.
12. Known limitations.
13. Deferred features for Phase 2.

Do not claim later functionality is implemented.

---

# 67. FINAL QUALITY STANDARD

Phase 1 should result in a **strong foundation**, not a fake finished product.

The result should demonstrate:

- architectural discipline,
- professional frontend foundation,
- professional backend foundation,
- clear separation of concerns,
- accessible interaction,
- consistent design,
- meaningful routing,
- theme support,
- documentation,
- testability,
- GitHub readiness.

The product should visually communicate the eventual concept of a:

> **Normalization Lab**

without pretending that the normalization algorithms already exist.

---

# 68. FINAL COMMAND

Execute **PHASE 1 ONLY**.

Do not begin Phase 2 automatically.

After completing Phase 1:

1. verify all tests,
2. verify build,
3. verify browser behavior,
4. verify frontend/backend communication,
5. verify all acceptance criteria,
6. stop.

Wait for a separate Phase 2 instruction.

