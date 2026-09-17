# Phase 12 — Deployment, Production Setup, Final Polish, Submission Packaging + Demonstration Readiness
## Master Implementation Prompt for the Normalization Lab Project

> **Purpose of this phase:** Take the fully tested Normalization Lab from Phase 11 and turn it into a stable, presentable, reproducible, submission-ready application that can be demonstrated to the professor without development-only assumptions.
>
> **Critical rule:** Phase 12 must polish and deploy the existing system. Do not introduce new major DBMS mathematics or redesign the architecture unless a Phase 11 finding requires a correction.
>
> **Core academic scope remains:** 1NF, 2NF, 3NF, 4NF.

---

# 1. CONTEXT — FINAL STATE BEFORE PHASE 12

The project should already contain:

### Core analysis
- schema/input builder
- guided input mode
- raw/advanced input mode
- validation
- functional dependencies
- multivalued dependencies
- candidate keys
- superkeys
- prime/non-prime attributes
- attribute closure
- 1NF
- 2NF
- 3NF
- 4NF
- decomposition
- lossless join
- dependency preservation

### Visualization
- normalization journey
- dependency graph
- closure visualizer
- candidate-key visualizer
- violation highlighting
- reasoning timeline
- decomposition tree
- verification visuals

### Creative features
- Explain-Why
- Experiment Mode
- Before/After comparison
- snapshots/history
- contextual deterministic assistant
- learning shortcuts
- optional practice mode if implemented

### Academic website structure
- Learn
- Help
- Developed By
- Guided By
- Download
- PDF
- DOCX
- TXT
- Day/Night mode
- educational video
- references/resources

### QA
Phase 11 has already established the testing baseline.

Phase 12 now turns that verified application into a final deployable/submission artifact.

---

# 2. PRIMARY OBJECTIVE

At the end of Phase 12, the team should be able to:

```text
Clone / receive project
        ↓
Install dependencies
        ↓
Configure minimal environment
        ↓
Start application
        ↓
Open browser
        ↓
Run complete DBMS demonstration
        ↓
Generate report
        ↓
Present project confidently
```

without requiring:

- paid API keys
- Ollama
- development-only services
- undocumented manual fixes
- hidden local files
- the developer's machine
- hardcoded absolute paths

---

# 3. DEPLOYMENT PHILOSOPHY

Prefer the simplest deployment architecture that reliably supports the project.

The application does **not** need:

- microservices
- Kubernetes
- Terraform
- message queues
- Redis
- service mesh
- cloud-native complexity

unless a separate project requirement specifically requires them.

The Normalization Lab is primarily an academic web application.

Use infrastructure only where it contributes to reliability.

---

# 4. RECOMMENDED PRODUCTION ARCHITECTURE

Recommended conceptual deployment:

```text
                   Browser
                      │
                      ▼
              Frontend Web App
                      │
                      │ HTTPS/API
                      ▼
             FastAPI Backend
                      │
          ┌───────────┴───────────┐
          │                       │
          ▼                       ▼
       SQLite             Report Generation
```

If production persistence is required, an appropriate relational database may replace SQLite later, but do not introduce unnecessary infrastructure for the academic demonstration.

---

# 5. DEPLOYMENT OPTIONS

Support at least one dependable final deployment.

Possible approaches:

### Option A
Frontend and backend deployed separately.

### Option B
Frontend static build served by a backend/reverse proxy.

### Option C
Fully local packaged deployment for professor demonstration.

The selected strategy should be documented in:

```text
docs/deployment.md
```

The team may also maintain a backup local deployment even when a public deployment exists.

---

# 6. PUBLIC DEPLOYMENT REQUIREMENT

If the project is deployed publicly:

- use HTTPS
- do not expose development debug mode
- do not expose secrets
- configure CORS properly
- use production build
- use a stable backend URL
- use a stable frontend URL
- verify report downloads work
- verify all major routes load on direct navigation

Do not assume a cloud service is available indefinitely on free tiers.

---

# 7. CLOUD PROVIDER AGNOSTICITY

Do not tightly couple application logic to one cloud provider.

Configuration should use environment variables such as:

```text
API_BASE_URL
DATABASE_URL
ENVIRONMENT
FRONTEND_ORIGIN
```

where applicable.

Do not hardcode:

```text
localhost
```

into production API requests.

---

# 8. ENVIRONMENT CONFIGURATION

Create:

```text
.env.example
```

containing all required configuration variables.

Do not place actual secrets in source control.

Document:

- variable purpose
- required/optional
- example safe value
- where the variable is used

---

# 9. ENVIRONMENT SEPARATION

Support conceptual environments:

```text
development
test
production
```

Behavior should differ appropriately.

### Development

Can have:

- detailed logs
- hot reload
- local debugging

### Test

Should have:

- isolated database/state
- deterministic fixtures
- test-safe environment

### Production

Should have:

- debug disabled
- safe logs
- production build
- correct CORS
- stable configuration

---

# 10. FRONTEND PRODUCTION BUILD

Verify:

```bash
npm run build
```

or the actual project equivalent.

The build must complete without:

- TypeScript errors
- unresolved imports
- missing assets
- unsupported dynamic imports
- broken environment variables

Test the generated production bundle, not only development mode.

---

# 11. BACKEND PRODUCTION STARTUP

Use an appropriate production server command for FastAPI, such as the project's chosen ASGI server configuration.

Example concept:

```bash
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

Use the project's actual module path.

Do not leave:

```text
--reload
```

enabled in production.

---

# 12. HEALTH CHECK ENDPOINT

Ensure:

```http
GET /api/v1/health
```

or the actual health endpoint returns a useful status.

Example:

```json
{
  "status": "ok"
}
```

Do not expose sensitive internal information.

---

# 13. STARTUP VALIDATION

At startup verify only what is required.

For example:

```text
Configuration loaded
Database available
Required directories available
```

Do not make startup depend on:

- optional video
- external websites
- optional LLM services
- external resource availability

---

# 14. DATABASE INITIALIZATION

If SQLite is used:

Provide a deterministic initialization mechanism.

For example:

```bash
python -m app.db.init
```

or the project's equivalent.

The setup process should:

- create the database when absent
- apply required schema
- avoid destructive resets in production
- report meaningful errors

---

# 15. DATABASE BACKUP

Before final submission, create a backup strategy if persistent history is stored.

At minimum:

```text
SQLite database backup
```

or a clean database initialization process.

Do not ship a database containing unintended personal/test data.

---

# 16. CLEAN PRODUCTION DATABASE

The final production/demo database should contain only intentionally prepared data.

Remove:

- random development analyses
- test snapshots
- accidental team data
- debugging records
- temporary report files

If demonstration examples are desired, label them clearly.

---

# 17. STATIC ASSETS

Audit:

```text
public/
src/assets/
```

for:

- team photos
- educational video
- icons
- diagrams
- report figures
- fonts if used legitimately
- logos

Remove unused assets.

Do not commit giant generated build artifacts unnecessarily.

---

# 18. IMAGE OPTIMIZATION

Optimize student/project images.

Requirements:

- correct dimensions
- reasonable file size
- descriptive filenames
- appropriate alt text

Do not use unnecessarily high-resolution photos that increase page load.

---

# 19. EDUCATIONAL VIDEO DEPLOYMENT

If the video is local:

- include the production-safe file
- verify browser compatibility
- keep file size reasonable
- ensure the path works after build/deployment

If external:

- use a stable URL
- provide offline fallback text
- do not make the page unusable if the external source fails

---

# 20. FONT / BRANDING AUDIT

Use only fonts and assets that the project is permitted to distribute.

Do not commit third-party font files unless licensing/redistribution is appropriate.

Keep typography consistent with Phase 1.

---

# 21. FINAL ROUTE AUDIT

Verify every route directly.

Required conceptually:

```text
/
 /analyzer
 /learn
 /help
 /history
 /developed-by
```

And contextual features such as:

```text
experiment
closure
practice
```

where implemented.

---

# 22. DIRECT URL NAVIGATION TEST

For every route:

```text
Paste route URL into browser
→ reload
→ route loads correctly
```

This catches deployment issues where client-side routing works only after navigating from Home.

Configure server/rewrite rules appropriately for the chosen hosting architecture.

---

# 23. 404 HANDLING

Create a meaningful not-found page:

```text
Page not found

Return to Normalization Lab
```

Do not show a generic server error.

---

# 24. FAVICON / PAGE METADATA

Add:

- favicon
- page title
- meaningful description
- appropriate metadata

Example title concept:

```text
Normalization Lab — Interactive DBMS Normalization Analyzer
```

Do not over-optimize for SEO; this is primarily an academic application.

---

# 25. BROWSER TAB TITLE

Update title contextually if practical:

```text
Normalization Lab
Normalization Lab — Analyzer
Normalization Lab — Learn
Normalization Lab — Help
```

Keep it short and readable.

---

# 26. FINAL DESIGN POLISH

Perform a dedicated visual QA pass.

Inspect:

- spacing
- typography
- alignment
- borders
- button states
- table density
- graph labels
- modal widths
- sidebar widths
- empty states
- loading states
- error states
- dark mode

---

# 27. AVOID DESIGN REGRESSION

Do not turn the final polish into:

- giant hero redesign
- excessive gradients
- glassmorphism
- generic SaaS cards
- decorative blobs
- unnecessary animations
- excessive rounded containers

The original visual identity must remain technical and educational.

---

# 28. COLOR SYSTEM AUDIT

Use the existing Phase 1 design tokens.

Verify:

### Light mode
- warm neutral canvas
- dark readable text
- restrained accent

### Dark mode
- deep charcoal/navy
- readable text
- subtle borders
- accessible graph colors

Do not introduce random one-off colors.

---

# 29. STATUS COLOR ACCESSIBILITY

Normal-form statuses must not depend solely on:

```text
green / red / yellow
```

Use:

```text
PASS — Satisfied
FAIL — Not satisfied
NOT VERIFIED
N/A
```

with icons/text where appropriate.

---

# 30. GRAPH COLOR AUDIT

Ensure FD and MVD distinctions remain visible in:

- light mode
- dark mode
- grayscale/low-contrast conditions

Also provide a legend.

---

# 31. RESPONSIVE FINAL PASS

Test:

```text
desktop wide
desktop standard
laptop
tablet/narrow browser
```

Focus especially on:

- Analyzer
- graph
- Experiment Mode
- Learn sidebar
- report dialog

Desktop remains the primary target.

---

# 32. TOUCH / POINTER TEST

Where the interface may be used with a trackpad or touch device:

- interactive controls should have sensible hit areas
- graph pan/zoom should not interfere with page scrolling
- dialogs should remain usable

Do not redesign the app for mobile.

---

# 33. PERFORMANCE OPTIMIZATION

Optimize only measured bottlenecks.

Potential areas:

- initial JS bundle
- large graph rendering
- expensive candidate-key discovery
- report rendering
- image size
- repeated API calls

Do not optimize prematurely.

---

# 34. FRONTEND CODE SPLITTING

Where appropriate, lazy-load large feature areas such as:

- graphing
- reports
- practice
- advanced visualization

Do not introduce complexity where bundle size is already small.

---

# 35. API PERFORMANCE

Ensure normal requests do not unnecessarily:

- recompute identical closures
- rerun analysis repeatedly
- regenerate reports unnecessarily

Use existing caching opportunities where safe.

---

# 36. RATE / RESOURCE SAFETY

Even without public user accounts, prevent accidental runaway requests.

Examples:

- disable Analyze while the same request is running
- guard against repeated report generation
- avoid infinite polling
- cap unreasonable input sizes

No heavy security platform is required.

---

# 37. PRODUCTION CORS

Configure CORS to allow only the required frontend origins.

Development may allow local origins.

Production should not use an unrestricted wildcard unless there is a documented reason.

---

# 38. SECURITY HEADERS

Where the chosen deployment allows it, add appropriate headers such as:

- content security policy where compatible
- X-Content-Type-Options
- Referrer-Policy
- frame protections where appropriate

Do not add policies that break required embedded video or graph functionality.

---

# 39. SECRET SCAN

Before submission:

Search repository for:

```text
API_KEY
SECRET
PASSWORD
TOKEN
PRIVATE_KEY
```

and other accidental credentials.

Do not include actual credentials.

---

# 40. GIT REPOSITORY CLEANUP

Review:

```text
.gitignore
```

Ensure it excludes:

- `.env`
- virtual environments
- `node_modules`
- generated reports if appropriate
- temporary logs
- local databases if they contain personal/test data
- build outputs when not intended for source control

---

# 41. COMMIT HISTORY CLEANUP

Do not rewrite history unnecessarily.

But ensure there are no obvious secret-containing commits if the repository is being submitted publicly.

If credentials were accidentally committed:

- revoke/rotate them
- remove them appropriately
- verify they are no longer usable

---

# 42. README FINAL VERSION

Update the root:

```text
README.md
```

It should include:

```text
Project title
Description
Features
Architecture
Tech stack
Installation
Environment setup
Running frontend
Running backend
Running tests
Generating reports
Deployment
Project structure
Academic scope
Limitations
Team
Guide
```

---

# 43. README — PROJECT DESCRIPTION

Use a concise academic description.

Example concept:

> An interactive web-based laboratory for analyzing relational schemas with respect to 1NF, 2NF, 3NF, and 4NF, while exposing candidate keys, attribute closure, dependency reasoning, decomposition, and formal verification through interactive visualizations.

Do not claim functionality that is not implemented.

---

# 44. README — ARCHITECTURE DIAGRAM

Include a simple architecture diagram:

```text
React + TypeScript
       │
       ▼
FastAPI
       │
       ├── Validation
       ├── FD Engine
       ├── Closure
       ├── Candidate Keys
       ├── NF Analysis
       ├── Decomposition
       ├── Verification
       ├── Assistant
       └── Reports
             │
             ▼
          SQLite
```

Update to match actual architecture.

---

# 45. README — SETUP

A new student should be able to follow:

```text
1. Clone repository
2. Install frontend dependencies
3. Install backend dependencies
4. Create .env
5. Initialize database
6. Start backend
7. Start frontend
8. Open browser
```

Use the exact commands from the project.

Do not leave outdated placeholders.

---

# 46. README — TESTING

Document:

```bash
npm run test
pytest
npm run test:e2e
npm run build
```

or actual equivalents.

Explain what each command verifies.

---

# 47. README — NO AI DEPENDENCY

Explicitly document that:

- core analysis does not require an LLM
- contextual assistant is deterministic
- no paid API key is required
- optional future AI integration is not part of core operation

This prevents confusion during demonstration.

---

# 48. DEPLOYMENT DOCUMENT

Create:

```text
docs/deployment.md
```

Include:

- selected platform
- frontend deployment
- backend deployment
- environment variables
- database handling
- build commands
- startup command
- health endpoint
- CORS
- report generation
- troubleshooting
- redeployment procedure

---

# 49. DEMO DOCUMENT

Create:

```text
docs/demo-guide.md
```

It should provide a scripted 5–10 minute demonstration.

Suggested:

```text
1. Introduce problem
2. Enter schema
3. Run candidate-key discovery
4. Show closure
5. Show 2NF/3NF/4NF result
6. Click Why
7. Explore graph
8. Demonstrate Experiment Mode
9. Show Assistant
10. Download report
11. Show Learn/Developed By
```

Adapt to the actual strengths of the implementation.

---

# 50. DEMO SCRIPT — PROBLEM INTRODUCTION

The presenter should be able to explain:

```text
Normalization reduces redundancy and update anomalies by
structuring relations according to dependency constraints.

This application analyzes user-defined schemas through 4NF
and exposes the reasoning behind every result.
```

Keep the introduction academically precise.

---

# 51. DEMO SCRIPT — LIVE INPUT

The presenter should use a real example.

Do not demo a result by merely clicking a hardcoded card.

The audience should see:

```text
Input
→ Processing
→ Result
```

This satisfies the requirement that the website is genuinely functional.

---

# 52. DEMO SCRIPT — SHOW THE MATHEMATICS

At least one demonstration should visibly show:

```text
Candidate key
+
FD
+
Closure
+
Normal-form condition
```

This proves the project is implementing DBMS logic rather than merely presenting UI.

---

# 53. DEMO SCRIPT — CREATIVE FEATURE

Show one feature beyond the mandatory analyzer:

Recommended:

```text
Experiment Mode
```

Example:

```text
Original
3NF = Satisfied

Add FD

Re-analyze

Modified
3NF = Not satisfied
```

Then show the evidence.

This demonstrates innovation and interactivity.

---

# 54. DEMO SCRIPT — REPORT

Generate a report during the demo or display a previously generated report created from the same real analysis.

Show:

- user input
- intermediate reasoning
- final output
- figure
- verification

---

# 55. DEMO BACKUP PLAN

Prepare at least one backup path.

For example:

```text
Primary:
deployed website

Backup:
local production build
```

Do not rely exclusively on internet/cloud availability.

---

# 56. OFFLINE DEMO PACKAGE

Create a folder/package such as:

```text
normalization-lab-demo/
├── frontend-build/
├── backend/
├── demo-data/
├── docs/
└── README.txt
```

The exact structure can differ.

The purpose is:

> If the public deployment fails, the demonstration can continue.

---

# 57. DEMO DATA

Prepare a few clearly labeled examples:

```text
demo-2nf.json
demo-3nf.json
demo-4nf.json
demo-fully-normalized.json
```

Only use them as optional starting points.

The analyzer must still support arbitrary user-defined input.

---

# 58. FINAL SUBMISSION PACKAGE

Prepare a clean folder:

```text
Normalization-Lab/
├── source/
├── docs/
├── tests/
├── reports/
├── demo/
├── README.md
└── LICENSE
```

Adapt as needed.

Do not include:

- node_modules
- virtual environments
- cache directories
- secret `.env`
- massive temporary files

---

# 59. SOURCE ARCHIVE

Create a source archive such as:

```text
normalization-lab-source.zip
```

It should be reproducible.

Before creating it:

- remove secrets
- remove unnecessary binaries
- remove temporary outputs
- verify README
- verify setup instructions

---

# 60. DEMO ARCHIVE

Optionally create:

```text
normalization-lab-demo.zip
```

containing the minimal materials required for offline demonstration.

---

# 61. REPORT SAMPLE

Include one sample generated report only if useful.

Label it:

```text
Sample Report
```

Do not let users confuse it with their current analysis.

---

# 62. FINAL DOCUMENTATION PACKAGE

Ensure these exist where relevant:

```text
README.md
docs/
├── architecture.md
├── deployment.md
├── demo-guide.md
├── testing.md
└── limitations.md
```

Keep documentation synchronized with implementation.

---

# 63. PROJECT ARCHITECTURE DOCUMENT

Create/update:

```text
docs/architecture.md
```

Explain:

### Frontend
- React
- TypeScript
- Vite
- styling
- visualization

### Backend
- FastAPI
- Pydantic
- normalization services

### Database
- SQLite
- SQLAlchemy

### Supporting systems
- reports
- assistant
- experiment mode

---

# 64. DATA FLOW DOCUMENTATION

Explain:

```text
User Input
  ↓
Validation
  ↓
Canonical Model
  ↓
FD/MVD Processing
  ↓
Closure / Keys
  ↓
1NF–4NF
  ↓
Decomposition
  ↓
Verification
  ↓
Visualization / Assistant / Report
```

This is useful during viva.

---

# 65. FINAL LIMITATIONS DOCUMENT

Create:

```text
docs/limitations.md
```

Include only real limitations.

Potential examples:

- candidate-key discovery complexity
- 1NF tuple-level limitation without sample data
- MVD reliance on supplied dependencies
- external resources requiring internet
- browser limitations for certain video formats

Do not make unsupported claims.

---

# 66. FINAL ACADEMIC SCOPE DOCUMENT

Clearly state what the system analyzes:

```text
1NF
2NF
3NF
4NF
```

And supporting concepts:

```text
FD
MVD
Candidate Keys
Attribute Closure
Decomposition
Lossless Join
Dependency Preservation
```

If BCNF/5NF are not implemented, state that clearly.

Do not claim them merely because the application visually resembles broader normalization tools.

---

# 67. FINAL UI CONTENT AUDIT

Search source files for placeholder text:

```text
Lorem ipsum
TODO
Coming soon
Demo text
Placeholder
Sample Name
John Doe
ABC University
```

Any remaining placeholder must be intentional/configurable.

---

# 68. FINAL FUNCTIONAL AUDIT

Search for:

```text
onClick={() => {}}
return null
console.log(...)
fake result
mock result
hardcoded status
```

Determine whether each is:

- intentional
- test-only
- development-only

Remove accidental incomplete functionality.

---

# 69. HARDCODED RESULT AUDIT

The final production application must not contain logic like:

```ts
normalForm = "3NF"
```

for a real analysis unless generated from actual computation.

Search for hardcoded result labels in analyzer code.

---

# 70. DEMO EXAMPLE SEPARATION

It is acceptable to have:

```text
Load Example
```

but examples must be clearly distinct from live analysis.

Recommended UI:

```text
Examples
────────────
[Load 2NF Example]
[Load 3NF Example]
[Load 4NF Example]
```

After loading:

```text
Example loaded — edit freely.
```

Do not pretend the example came from the user's input.

---

# 71. FINAL ERROR MESSAGE AUDIT

All production-facing errors should be:

- understandable
- actionable
- non-sensitive
- consistent

Avoid technical-only messages such as:

```text
TypeError: Cannot read property ...
```

unless shown only in developer logs.

---

# 72. OBSERVABILITY

For production deployments, maintain lightweight logs.

Log useful operational events such as:

- backend startup
- API failures
- report generation failures

Do not log:

- passwords
- secrets
- unnecessary personal data
- full sensitive user content unless justified

---

# 73. APPLICATION CRASH HANDLING

Frontend:

- add error boundary where appropriate
- show recovery UI

Backend:

- catch expected exceptions
- return structured errors
- avoid process crashes from malformed requests

---

# 74. API DOCUMENTATION

FastAPI should expose usable OpenAPI documentation if enabled.

Check:

```text
/docs
/openapi.json
```

or project equivalent.

Ensure endpoint descriptions are understandable.

Do not expose unnecessary internal endpoints.

---

# 75. FINAL API CONTRACT FREEZE

Before deployment, freeze major response contracts.

Do not casually rename fields after Phase 11.

If changes are required:

```text
update backend
→ update frontend
→ update tests
→ update reports
→ update docs
```

---

# 76. DATABASE / FILE PATH PORTABILITY

Never rely on:

```text
/Users/...
C:\Users\...
/home/name/...
```

Use:

- relative paths
- environment variables
- application directories

This is essential for professor-PC reproducibility.

---

# 77. TIME / LOCALE HANDLING

Where timestamps are displayed:

- use a consistent format
- indicate timezone where necessary
- avoid misleading local/UTC confusion

Reports should have a readable generated timestamp.

---

# 78. VERSIONING

Add an application/project version.

Example:

```text
v1.0.0
```

The exact version is up to the team.

Display it discreetly in Help/About or footer.

Use versioning consistently in:

- README
- production build
- report metadata
- demo documentation

---

# 79. RELEASE CHECKLIST

Create:

```text
docs/release-checklist.md
```

with:

```text
☐ Tests pass
☐ Build passes
☐ No secrets
☐ Environment documented
☐ Production config correct
☐ Routes verified
☐ Reports verified
☐ Learn verified
☐ Help verified
☐ Team info verified
☐ Guide info verified
☐ Demo data verified
☐ Offline backup ready
☐ Source archive ready
```

---

# 80. FINAL PROFESSOR INFORMATION AUDIT

Before submission, confirm:

### Developed By
Actual:

- student names
- register numbers
- photos
- contributions

### Guided By

Exactly:

**Dr. Swaminathan A**  
**Assistant Professor**

unless the project team has received updated official information and intentionally changes the configuration.

Do not invent or alter institutional details without basis.

---

# 81. FINAL REPORT TEMPLATE AUDIT

Run the report generator with:

### Small relation
### Composite key relation
### 3NF violation
### 4NF MVD violation
### Fully normalized relation

Verify formatting remains readable in all cases.

---

# 82. REPORT PAGE BREAK TEST

For large reports verify:

- headings do not become orphaned where practical
- tables do not overflow pages
- figures fit
- captions remain associated
- long dependency lists wrap correctly
- no page contains unintelligible clipping

---

# 83. REPORT FONT / NOTATION TEST

Verify symbols render correctly:

```text
→
→→
+
∅
⊆
```

If a renderer does not support a symbol reliably, use a safe equivalent or configure a compatible font.

Do not let notation become corrupted in PDF/DOCX.

---

# 84. REPORT FIGURE RESOLUTION TEST

Dependency graphs and decomposition diagrams must remain legible when printed or viewed at normal zoom.

Avoid tiny node labels.

---

# 85. FINAL LEARN RESOURCE AUDIT

For every resource:

- title
- type
- author where relevant
- URL where relevant
- topic association

must be accurate.

Remove dead or questionable resources before submission.

---

# 86. FINAL VIDEO AUDIT

Confirm:

```text
Learn
→ educational video
→ playable
```

If external:

```text
offline
→ explanatory fallback
```

If local:

```text
production build
→ media file available
```

---

# 87. FINAL ACCESSIBILITY AUDIT

Perform a manual keyboard pass over:

- navigation
- Analyzer
- graph selection alternatives
- dialogs
- Experiment Mode
- Assistant
- Learn
- Help
- Download
- Developed By

No critical feature should require a mouse alone.

---

# 88. FINAL BROWSER COMPATIBILITY

Test at least the browser used for evaluation.

Where practical, test another Chromium-based browser.

Focus on:

- graph rendering
- file download
- PDF/DOCX/TXT download
- local video
- CSS behavior

Do not attempt to support every browser unless required.

---

# 89. FINAL DEPLOYMENT SMOKE TEST

After deploying, perform the same essential workflow again.

Do not assume successful build means successful deployment.

Test:

```text
Open
→ Analyze
→ Graph
→ Why
→ Experiment
→ Learn
→ Help
→ Download
```

---

# 90. PRODUCTION SMOKE TEST DATA

Use one small reliable test input.

The exact values should match the team's validated fixture.

The smoke test should execute quickly.

---

# 91. POST-DEPLOYMENT REGRESSION

If a production issue is found:

```text
fix locally
→ run Phase 11 regression suite
→ rebuild
→ redeploy
→ rerun smoke test
```

Do not hot-patch production without revalidation.

---

# 92. DEPLOYMENT FAILURE FALLBACK

Document:

```text
If public deployment fails:

1. Start local backend.
2. Start production frontend or local production server.
3. Load validated demo dataset.
4. Continue demonstration.
```

Ensure the team knows these commands before the evaluation.

---

# 93. FINAL TEAM HANDOFF

Every team member should know at minimum:

- how to start project
- where backend lives
- where frontend lives
- how analyzer works at a high level
- how to demonstrate one normalization case
- where reports are generated
- how to recover from deployment failure

The project must not depend on one person understanding the setup.

---

# 94. TEAM CONTRIBUTION RECORD

Prepare a final internal file:

```text
docs/team-contributions.md
```

with:

```text
Member
Role
Major contributions
Testing/contribution evidence
```

Use only actual contributions.

This supports the demonstration requirement concerning participation of all members.

---

# 95. VIVA PREPARATION

Prepare concise explanations for:

### Why normalization?
### What is 1NF?
### Why does 2NF care about composite candidate keys?
### Why are prime attributes important in 3NF?
### What is the formal 3NF condition?
### What is an MVD?
### What is the 4NF condition?
### How are candidate keys discovered?
### How is attribute closure computed?
### How is decomposition generated?
### How is lossless join checked?
### How is dependency preservation checked?
### Why does the application not require an LLM?
### How does Experiment Mode work?
### Why is 1NF sometimes not fully verifiable without sample data?

Store these in:

```text
docs/viva-preparation.md
```

---

# 96. VIVA — CORE ENGINE EXPLANATION

The team should be able to describe:

```text
Input
→ canonical representation
→ closure
→ candidate keys
→ prime/non-prime
→ NF-specific checks
→ decomposition
→ verification
```

without explaining implementation details incorrectly.

---

# 97. VIVA — 3NF EXPLANATION

The team must be able to state the actual formal condition:

For every non-trivial FD:

```text
X → A
```

either:

```text
X is a superkey
```

or:

```text
A is prime
```

Do not replace this with an oversimplified “no transitive dependencies” slogan.

---

# 98. VIVA — 4NF EXPLANATION

The team must be able to state:

For every non-trivial MVD:

```text
X →→ Y
```

X must be a superkey.

Also explain why independent multivalued facts can create redundancy.

---

# 99. VIVA — LOSSLESS JOIN

The team should know that visual overlap is not by itself a formal proof.

Explain the actual implemented verification method.

If using chase/tableau, be prepared to explain its high-level purpose.

---

# 100. VIVA — DEPENDENCY PRESERVATION

Be prepared to explain:

```text
dependencies projected onto decomposed relations
+
closure/implication check
```

and what it means operationally.

---

# 101. VIVA — WHY NO LLM?

Expected explanation:

```text
The normalization logic is deterministic and mathematically defined,
so an external language model is unnecessary for the core system.

The contextual assistant uses the actual analysis result and
deterministic question handling to explain DBMS facts without
requiring an API key or external service.
```

Do not call it generative AI unless such functionality is actually implemented.

---

# 102. VIVA — WHY VISUALIZATION?

Be able to explain that visualization:

- exposes dependency structure
- makes closure steps easier to follow
- identifies violating dependencies
- shows decomposition
- links formal reasoning with UI

It is not decorative.

---

# 103. VIVA — WHY EXPERIMENT MODE?

Explain:

```text
Students can change attributes/dependencies/keys
and observe how those changes affect candidate keys,
normal forms, violations, and decomposition.
```

This demonstrates conceptual understanding.

---

# 104. FINAL DEMONSTRATION ORDER

Recommended order:

```text
1. Home
2. Problem statement
3. Analyzer
4. Input
5. Candidate keys
6. Closure
7. 1NF–4NF journey
8. Dependency graph
9. Why/evidence
10. Experiment
11. Assistant
12. Decomposition/verification
13. Download report
14. Learn
15. Developed By / Guided By
```

Do not demonstrate every minor feature.

Focus on the strongest evidence of technical implementation.

---

# 105. TIME MANAGEMENT FOR DEMO

A possible allocation:

```text
1 min — problem/objective
2 min — input + analysis
2 min — normalization reasoning
1 min — visualization
1 min — experiment
1 min — report
1 min — Learn/team
```

Adjust to the professor's allotted duration.

---

# 106. FINAL DEMO TALKING POINTS

The team should emphasize:

```text
Real user input
Real DBMS algorithms
Formal reasoning
Interactive visualization
What-if experimentation
Formal decomposition verification
Educational support
Professional reporting
```

Avoid spending the majority of the demo on:

- styling
- theme switching
- generic UI components

Those are supporting features.

---

# 107. SUBMISSION FILE CHECK

Before uploading/submitting:

```text
☐ Source code
☐ README
☐ Project report
☐ Presentation
☐ Test evidence
☐ Demo instructions
☐ Deployment information
☐ Sample screenshots
☐ Generated sample report
☐ Team details
```

Include only what the course submission requires.

---

# 108. FINAL REPORT/PRESENTATION CONSISTENCY

The final project report, presentation, website, and source code must describe the same functionality.

Do not claim:

```text
AI-powered normalization
```

if the implemented assistant is deterministic.

Do not claim:

```text
5NF
```

if only 1NF–4NF were implemented.

Do not claim:

```text
real-time cloud analytics
```

if no such system exists.

---

# 109. SCREENSHOT PACKAGE

Prepare clean screenshots of:

```text
01-home
02-input
03-analysis
04-candidate-keys
05-closure
06-normalization-journey
07-dependency-graph
08-3nf-reasoning
09-4nf-mvd
10-experiment
11-assistant
12-decomposition
13-report
14-learn
15-help
16-developed-by
17-dark-mode
```

Use actual application states.

Do not fake results in screenshots.

---

# 110. SCREENSHOT CLEANLINESS

Screenshots should:

- show the relevant feature
- avoid personal desktop clutter
- use readable browser zoom
- avoid accidental notifications
- use realistic example data
- clearly demonstrate the product

---

# 111. FINAL PRESENTATION VISUALS

If the team creates slides, emphasize:

```text
Problem
→ Technical Approach
→ Architecture
→ Algorithms
→ UI/UX
→ Innovation
→ Testing
→ Demo
```

Do not turn the presentation into a marketing pitch.

---

# 112. PROJECT ARCHIVE VALIDATION

After creating the final source ZIP:

1. extract into a new folder
2. run setup from scratch
3. run tests
4. build
5. start
6. perform smoke test

This is the final reproducibility check.

---

# 113. CLEAN-ROOM DEPLOYMENT VALIDATION

For the final deployment package:

```text
fresh environment
→ setup instructions
→ install
→ configure
→ start
→ smoke test
```

If this fails, fix the package before submission.

---

# 114. VERSION FREEZE

Once final validation passes:

```text
tag release
```

for example:

```text
v1.0.0
```

Only make further changes for:

- critical fixes
- submission-specific corrections
- deployment failures

After such changes, rerun relevant Phase 11 tests.

---

# 115. FINAL CHANGE CONTROL

Do not add large new features immediately before submission.

Avoid:

- new AI integration
- new database platform
- new visualization library
- full redesign
- extra normal forms
- authentication
- unrelated modules

at this stage.

The objective is stability.

---

# 116. FINAL POLISH PRIORITY

If time is limited, prioritize:

```text
1. Mathematical correctness
2. Demo stability
3. Input/output clarity
4. Report generation
5. Learn/Help mandatory requirements
6. Visual consistency
7. Deployment reliability
8. Minor cosmetic refinements
```

Do not sacrifice correctness for appearance.

---

# 117. FINAL PERFORMANCE PRIORITY

Do not optimize by weakening analysis.

If candidate-key discovery is expensive:

- explain the limitation
- use safe algorithms
- provide progress where useful
- protect the UI

Never return an incorrect shortcut just to make the interface feel fast.

---

# 118. FINAL ACCESSIBILITY PRIORITY

Do not remove accessibility features to simplify deployment.

Keep:

- keyboard navigation
- visible focus
- textual status
- semantic controls
- reduced motion

---

# 119. FINAL ERROR PRIORITY

Every major failure path should answer:

```text
What happened?
What was preserved?
What should the user do next?
```

Example:

```text
Report generation failed.

Your analysis is still available.

Try generating the report again.
```

---

# 120. FINAL DEPLOYMENT HEALTH CHECK

After deployment verify:

```text
Frontend reachable
Backend reachable
Health endpoint OK
Analyzer API OK
Report API OK
Static assets OK
Routes OK
Theme OK
Learn OK
Help OK
Developed By OK
```

---

# 121. FINAL SECURITY HEALTH CHECK

Verify:

```text
No exposed secrets
Debug disabled
Correct CORS
Safe file names
Safe report paths
No unsafe HTML injection
No unintended data persistence
```

---

# 122. FINAL DATA PRIVACY CHECK

Verify the application does not unintentionally transmit or store:

- unnecessary personal information
- student data beyond the configured project page
- raw user inputs to third-party services
- assistant questions to external LLMs
- report contents externally

Core functionality should remain local to the application's frontend/backend.

---

# 123. FINAL OFFLINE CHECK

Disconnect internet.

Verify the core educational/analysis workflow:

```text
Open app
→ enter schema
→ analyze
→ inspect result
→ closure
→ candidate keys
→ graph
→ experiment
→ assistant
→ report
```

External references and external videos may be unavailable, but the application itself must fail gracefully.

---

# 124. FINAL DEMO BACKUP CHECK

Immediately before evaluation:

```text
☐ Public URL checked
☐ Local backup checked
☐ Laptop charger
☐ Demo examples available
☐ Source ZIP available
☐ Report sample available
☐ Presentation available
☐ Screenshots available
```

The team should not discover a broken deployment for the first time during the demonstration.

---

# 125. FINAL PROJECT HEALTH DASHBOARD

Create a simple internal checklist, not a fake public metric dashboard:

```text
BUILD       ✓
TESTS       ✓
DEPLOYMENT  ✓
REPORTS     ✓
LEARN       ✓
HELP        ✓
TEAM INFO   ✓
DEMO        ✓
BACKUP      ✓
```

Only mark actual verified states.

---

# 126. RELEASE NOTES

Create:

```text
CHANGELOG.md
```

with the final release summary.

Example categories:

```text
Added
Improved
Fixed
Validated
```

Mention major features, not every minor code change.

---

# 127. FINAL RELEASE NOTES CONTENT

Possible:

```text
Added
- 1NF–4NF normalization analysis
- candidate-key discovery
- closure visualization
- dependency graph
- decomposition verification
- Experiment Mode
- contextual assistant
- Learn
- Help
- report generation

Improved
- accessibility
- error handling
- report formatting
- production deployment

Validated
- unit tests
- integration tests
- E2E tests
```

Only include features actually implemented.

---

# 128. FINAL PROJECT DESCRIPTION FOR SUBMISSION

Prepare a concise official description:

> **Normalization Lab is an interactive web-based DBMS learning and analysis environment that accepts user-defined relational schemas and dependencies, determines candidate keys and attribute closures, evaluates 1NF–4NF, explains violations using formal reasoning, visualizes dependency structures, supports what-if experimentation, verifies decomposition properties, and generates academic reports.**

Adjust the wording if any listed feature is not implemented.

---

# 129. FINAL ARCHITECTURE

The completed system should conceptually be:

```text
                           USER
                            │
                            ▼
                 ┌─────────────────────┐
                 │ React / TypeScript   │
                 │ Interactive UI       │
                 └──────────┬──────────┘
                            │
                            ▼
                 ┌─────────────────────┐
                 │ FastAPI Application │
                 └──────────┬──────────┘
                            │
       ┌────────────────────┼────────────────────┐
       │                    │                    │
       ▼                    ▼                    ▼
   Input/Validation      DBMS Engine          Reports
                            │
       ┌────────────────────┼────────────────────┐
       │                    │                    │
       ▼                    ▼                    ▼
   FD / Closure         Keys / NF          Decomposition
       │                    │                    │
       └────────────────────┼────────────────────┘
                            │
                            ▼
                       Verification
                            │
       ┌────────────────────┼────────────────────┐
       ▼                    ▼                    ▼
 Visualization         Experiment           Assistant
       │                    │                    │
       └────────────────────┼────────────────────┘
                            │
                            ▼
                    Learn / Help / Report
```

---

# 130. FINAL SUBMISSION QUALITY BAR

The project should feel like a finished academic software product.

A professor opening it should immediately see:

```text
A clear DBMS problem
        ↓
A working solution
        ↓
Formal algorithms
        ↓
Interactive visualization
        ↓
Educational explanation
        ↓
Testing evidence
        ↓
Professional report
```

It must not feel like:

```text
static frontend
+
fake buttons
+
hardcoded examples
```

---

# 131. FINAL DEFINITION OF DONE

Phase 12 is complete only when:

## Deployment
- production build succeeds
- backend runs in production mode
- deployment is documented
- frontend/backend communicate correctly
- direct routes work
- health check works
- public deployment works if used
- local backup works

## Quality
- Phase 11 critical tests remain passing
- no critical bugs
- no accidental debug UI
- no secrets
- no broken routes
- no missing production assets

## Academic requirements
- Learn available
- Help available
- Developed By available
- Guided By available
- Download available
- PDF available
- DOCX available
- TXT available
- Day/Night available

## Demonstration
- demo script prepared
- backup deployment prepared
- team contributions documented
- viva topics prepared
- professor-facing flow tested

## Submission
- README complete
- deployment docs complete
- architecture docs complete
- testing docs complete
- source archive validated
- final screenshots prepared
- final release tagged

---

# 132. FINAL RELEASE GATE

Do not release until:

```text
CRITICAL BUGS = 0
HIGH BUGS = 0
SECRETS EXPOSED = 0
BROKEN REQUIRED FEATURES = 0
BROKEN DEMO FLOW = 0
```

Remaining lower-priority issues may be documented if they do not affect correctness or evaluation requirements.

---

# 133. FINAL INTEGRATED DEMONSTRATION

Run exactly this once after all deployment work is complete:

```text
1. Start/visit production application
2. Open Analyzer
3. Enter a real schema
4. Enter candidate keys/dependencies
5. Run analysis
6. Verify 1NF–4NF
7. Open candidate-key explanation
8. Open attribute closure
9. Open dependency graph
10. Click a violation
11. Show Why
12. Enter Experiment Mode
13. Change a dependency
14. Re-run
15. Show Before → After
16. Ask contextual assistant
17. Open decomposition
18. Show lossless/dependency-preservation verification
19. Generate PDF
20. Generate DOCX
21. Generate TXT
22. Open Learn
23. Open Help
24. Open Developed By
25. Confirm Guided By
26. Switch Day/Night
27. Finish on the main analyzer result
```

Every step must use the real application.

---

# 134. FINAL PRESENTATION PRINCIPLE

Do not spend the demonstration proving that the buttons work.

Use the buttons to prove that the **DBMS concepts are implemented**.

The strongest evidence is:

```text
User-defined schema
→ computed candidate key
→ computed closure
→ formal NF test
→ identified dependency
→ explanation
→ decomposition
→ formal verification
→ generated report
```

That sequence demonstrates both technical implementation and educational value.

---

# 135. FINAL ARCHIVE PRINCIPLE

The final submission should preserve:

```text
Source
Documentation
Tests
Demo
Reports
Configuration templates
```

while excluding:

```text
Secrets
Caches
Development noise
Unnecessary dependencies
Temporary files
```

---

# 136. FINAL TEAM HANDOFF PRINCIPLE

Every team member should be able to answer:

> What problem did we solve?

> What algorithms did we implement?

> How do we know the results are correct?

> What is innovative about the application?

> How does the UI help students understand normalization?

> How do we demonstrate it?

> How do we recover if the deployment fails?

The application and documentation should support these answers.

---

# 137. FINAL IMPLEMENTATION RULE

**Phase 12 is not the time to make the application larger. It is the time to make the application reliable, reproducible, polished, and submission-ready.**

The project should leave Phase 12 as:

```text
MATHEMATICALLY CORRECT
        +
FULLY TESTED
        +
VISUALLY POLISHED
        +
DEPLOYABLE
        +
DOCUMENTED
        +
DEMONSTRABLE
        +
REPRODUCIBLE
```

The final product should convincingly demonstrate that it is a genuine **interactive DBMS Normalization Laboratory for 1NF–4NF**, not a static webpage and not a wrapper around an external AI service.
