# System Architecture — Normalization Lab

## 1. Executive Summary

**Normalization Lab** (*1NF–4NF Normalization Visualizer & Analyzer*) is an interactive educational DBMS platform designed to teach and demonstrate relational database normalization from First Normal Form (1NF) through Fourth Normal Form (4NF).

The project is structured as a **modular monolith**, strictly separating the presentation layer (React + TypeScript), the application API service layer (FastAPI), and the deterministic DBMS algorithms.

```
┌────────────────────────────────────────────────────────────────────────┐
│                          PRESENTATION LAYER                            │
│                        (React + TypeScript + Vite)                     │
│  - Design System / Tokens (Light/Dark Mode)                            │
│  - 3-Column Desktop Workspace (Schema Input, Visualizer, Reasoning)   │
│  - Reusable UI Primitives (Button, Badge, Card, Modal, Tabs, Inputs)   │
│  - Mandatory Educational Pages (Home, Learn, Help, Developed By, Hist) │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP / JSON
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                           API GATEWAY LAYER                            │
│                               (FastAPI)                                │
│  - Router Hierarchy (`/api/v1`)                                        │
│  - CORS Middleware & Validation Handlers                               │
│  - Health Check Endpoint (`/api/v1/health`)                            │
└───────────────┬────────────────────────────────────────┬───────────────┘
                │                                        │
                ▼                                        ▼
┌───────────────────────────────┐        ┌───────────────────────────────┐
│     APPLICATION DATABASE      │        │     NORMALIZATION ENGINE      │
│     (SQLite + SQLAlchemy)     │        │     (Pure Domain Logic)       │
│  - User Session History       │        │  - Attribute Closure (Phase 3)│
│  - Saved Schemas & Problems   │        │  - Candidate Keys (Phase 4)   │
│  * Strictly separated from    │        │  - 1NF/2NF Engines (Phase 5)  │
│    the relational schema      │        │  - 3NF/4NF Engines (Phase 6)  │
│    entered for normalization  │        │  - Decompositions (Phase 7)   │
└───────────────────────────────┘        └───────────────────────────────┘
```

---

## 2. Architectural Boundaries & Data Flow

### 2.1 The Two Database Concepts
A critical architectural boundary established in Phase 1:
1. **Application Database (`SQLite + SQLAlchemy`)**:
   - Manages the local persistent state of the tool itself.
   - Stores saved analysis sessions, exported report logs, and pre-seeded textbook problems.
2. **Student Input Schema (`RelationInput`)**:
   - The abstract relational table definition submitted by the student (Relation name, attributes, functional dependencies, multivalued dependencies, sample tuples).
   - Evaluated purely in memory using formal relational algebra and dependency theories.
   - **Never** converted into arbitrary raw SQL queries or executed against the SQLite database.

### 2.2 Domain Contracts & Analysis Schema
The system rejects simplistic boolean responses (`{"is2NF": false}`). As specified in the architectural contract (`app/schemas/domain_contracts.py`), every normalization stage produces rich academic feedback:
- Formal condition evaluated
- Violating dependencies (LHS $\to$ RHS) or non-atomic cells
- Step-by-step mathematical reasoning
- Lossless, dependency-preserving decomposition steps

---

## 3. Technology Stack Rationale

| Component | Technology | Rationale |
|---|---|---|
| **Frontend Framework** | React 18 + TypeScript | Industry standard for complex interactive workspaces, strong typing prevents runtime schema bugs. |
| **Build Tooling** | Vite | Instant HMR, fast production bundling, native ESM. |
| **Styling** | Tailwind CSS + CSS Variables | Curated design tokens for semantic light/dark mode and rapid layout development without CSS bloat. |
| **Backend API** | FastAPI + Python 3.14 | High performance async ASGI, automatic OpenAPI documentation, strict Pydantic contract validation. |
| **Internal Database** | SQLite + SQLAlchemy 2.0 | Zero-configuration local database, perfect for academic lab distribution. |
| **Testing** | Vitest + Pytest | Fast unit and integration verification for frontend and backend. |

---

## 4. Phase-by-Phase Roadmap

- **Phase 1: Project Foundation & UI System** *(Current)* — Core modular architecture, FastAPI health API, design system tokens, responsive navigation, and Day/Night mode.
- **Phase 2: Schema Input Builder & Validation** — Interactive relation, attribute, FD, MVD, and sample data editors.
- **Phase 3: FD Engine & Attribute Closure** — Canonical cover, Armstrong's axioms, and closure computations ($X^+$).
- **Phase 4: Candidate Key Derivation Engine** — Minimal superkey calculation, prime/non-prime attribute classification.
- **Phase 5: 1NF & 2NF Normalization Engine** — Partial dependency detection and decomposition.
- **Phase 6: 3NF & 4NF Normalization Engine** — Transitive dependency detection, MVD reasoning, and decomposition.
- **Phase 7: Decomposition & Verification Engine** — Lossless-join (Chase test) and dependency preservation checks.
- **Phase 8: Interactive Visualization Engine** *(Complete)* — Interactive dependency graphs (@xyflow/react), composite determinant grouping, attribute closure animation player, context-sensitive stage visualizers, decomposition lineage trees, and synchronized inspector panel.
- **Phase 9: Creative Features & Contextual Assistant** — "Why?" reasoning, What-If simulation mode, rule-based DBMS assistant (no paid LLMs).
- **Phase 10: Learn, Help, Developed By, and Reporting** — Downloadable PDF/DOCX/TXT reports, syllabus video embed, user manual.
- **Phase 11: Comprehensive Test Suite** — End-to-end integration and edge-case testing.
- **Phase 12: Production Polish & Deployment** — Containerization, production optimization, and final polish.
