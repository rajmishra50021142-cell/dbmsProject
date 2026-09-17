# Phase 8: Complete Interactive Visualization Engine & Normalization Journey

## 1. Architectural Overview

The **Phase 8 Visualization Engine** transforms relational database normalization theory into an interactive, visual journey. Built directly on top of the mathematical foundations established in Phases 1 through 7, it provides real-time, bidirectional, synchronized visual feedback without duplicating mathematical logic or presenting hardcoded mockups.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       Normalization Lab Frontend (React 19)                 │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                    Normalization Journey Hero (Stepper)               │  │
│  │                   1NF ───────► 2NF ───────► 3NF ───────► 4NF          │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌─────────────────────────┐  ┌──────────────────────────────────────────┐  │
│  │  Interactive Canvas     │  │ Synchronized Detail Panel (Inspector)    │  │
│  │  - React Flow Canvas    │  │ - Determinant (LHS) / Dependent (RHS)    │  │
│  │  - Single Attribute     │  │ - Candidate Key & Prime Membership       │  │
│  │  - Composite Group Node │  │ - Violation Proofs & Explanations        │  │
│  │  - Solid (FD) / MVD     │  │ - Lossless Join & Preservation Badges    │  │
│  └─────────────────────────┘  └──────────────────────────────────────────┘  │
│                                                                             │
│  ┌─────────────────────────┐  ┌──────────────────────────────────────────┐  │
│  │ Attribute Closure Player│  │ Decomposition Lineage Tree & Comparison  │  │
│  │ - Step Timeline Scrub   │  │ - Hierarchical Tree Graph                │  │
│  │ - Play / Pause Controls │  │ - Side-by-side Before/After Schema       │  │
│  │ - Fixed Point & Superkey│  │ - Lossless Tableau Chase Verification    │  │
│  └─────────────────────────┘  └──────────────────────────────────────────┘  │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ REST API (/api/v1/visualization/*)
┌──────────────────────────────────────▼──────────────────────────────────────┐
│                    FastAPI Backend Layout & Analysis Engine                  │
│                                                                             │
│  ┌─────────────────────────┐  ┌──────────────────────────────────────────┐  │
│  │ /visualization/graph    │  │ /visualization/closure-player            │  │
│  │ Deterministic 2D layout │  │ Step-by-step playback conversion         │  │
│  │ Composite determinant   │  │ Armstrong axiom expansion trace          │  │
│  └─────────────────────────┘  └──────────────────────────────────────────┘  │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │ /visualization/decomposition-tree                                     │  │
│  │ Hierarchical tree mapping with lossless-join & preservation metadata  │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Interactive Dependency Graph Canvas

The graph canvas utilizes `@xyflow/react` (React Flow) with customized nodes and edges:

### 2.1 Nodes
1. **Attribute Node (`AttributeNode.tsx`)**:
   - Represents a single relation attribute ($A \in R$).
   - Displays clear badges indicating whether it is a candidate key attribute (`KEY`), a prime attribute (`PRIME`), or a non-prime attribute (`NON-PRIME`).
   - Equipped with source (bottom) and target (top) connection handles for incoming and outgoing dependencies.
   - Highlights on hover and on selection, syncing immediately with the Synchronized Detail Panel.

2. **Composite Determinant Group Node (`CompositeGroupNode.tsx`)**:
   - Accurately represents composite determinants (e.g., $\{StudentID, CourseID\}$).
   - Groups multi-attribute determinants into a unified visual entity to avoid ambiguous individual arrows emanating from disjoint attributes.
   - Distinctive border styling, header icon, and unified dependency source handle.

### 2.2 Edges
1. **Functional Dependency ($X \to Y$)**:
   - Rendered as a crisp, solid Bezier edge with standard arrowhead.
   - Labeled with the relational arrow symbol ($\to$).
2. **Multivalued Dependency ($X \twoheadrightarrow Y$)**:
   - Rendered as a distinct purple dashed edge with double-headed arrow ($\twoheadrightarrow$).
   - Visually differentiates multi-valued facts from single-valued functional dependencies.
3. **Violation Styling**:
   - Edges representing dependencies that violate the active normal form (e.g., partial dependencies in 2NF, transitive dependencies in 3NF, non-superkey MVDs in 4NF) are rendered in warning rose/red with animated pulses and violation alert badges.
   - Tooltip displays the dependency formula, violation stage, and academic reason on hover.

---

## 3. Normalization Journey Hero (`NormalizationJourneyHero.tsx`)

A prominent stepper guiding students through relational database normalization:
- **Sequential Stepper**: $1NF \to 2NF \to 3NF \to 4NF$.
- **Status Badges**:
  - `Satisfied ✓`: Green badge confirming compliance with all stage rules.
  - `Violated ✗`: Rose badge with exact violation count when non-compliant.
  - `Prerequisite Required ⚠`: Amber badge when blocked by an earlier normal form.
  - `Needs Data ⚠`: State badge when atomicity or MVD analysis requires additional sample data.
- **Formal Condition Summary**: Displays the mathematical requirement for each stage (e.g., $3NF$: "2NF + For every $X \to A$: $X$ is superkey OR $A$ is prime").

---

## 4. Context-Sensitive Stage Visualizers (`ContextSensitiveStageVisualizer.tsx`)

Provides targeted visual explanations specific to the selected normal form:
1. **1NF Visualizer**:
   - Inspects sample data rows for non-atomic values (comma-separated lists, JSON/arrays, pipe-delimited values) or schema repeating groups ($Phone1, Phone2$).
   - Provides clear guidance when no sample data is provided (`No Sample Data Loaded: 1NF requires evaluating instance data for cell atomicity`).
2. **2NF Visualizer**:
   - Visual mapping of partial dependencies: displays candidate key, proper subset determinant, and dependent non-prime attribute with step-by-step academic explanation.
3. **3NF Visualizer**:
   - Evaluates non-trivial dependencies against both conditions of the 3NF theorem:
     - **Test 1**: Is $X$ a superkey? ($X^+ \stackrel{?}{=} R$)
     - **Test 2**: Are all attributes in $Y \setminus X$ prime?
   - Highlights transitive dependency chains ($A \to B \to C$).
4. **4NF Visualizer**:
   - Explains non-trivial MVDs ($X \twoheadrightarrow Y$) and Cartesian product redundancy caused by independent multi-valued facts.

---

## 5. Interactive Attribute Closure Player (`ClosureVisualizerPlayer.tsx`)

Allows users to step through attribute closure calculations ($X^+$) in slow motion:
- **Interactive Attribute Selector**: Click attribute pills to select the starting set $X$.
- **Playback Controls**: Play, Pause, Step Next, Step Prev, Reset/Restart.
- **Step Scrubber Slider**: Drag the scrubber to jump directly to any step in the derivation.
- **Milestone Badges**:
  - Highlights starting attributes ($X$) in indigo.
  - Highlights newly added attributes ($\Delta$) in animated emerald badges.
  - Detects and badges **Fixed-Point Reached** when no further FDs can fire.
  - Badges **Superkey Condition Satisfied** when $X^+$ expands to the complete relation $R$.

---

## 6. Decomposition Lineage & Before/After Comparison

1. **Hierarchical Lineage Tree (`DecompositionTreeVisualizer.tsx`)**:
   - Visualizes the decomposition of the root relation into projected sub-relations.
   - Badges each child relation with primary keys, projected attributes, trigger dependencies, and status for **Lossless Join** (Tableau Chase) and **Dependency Preservation**.
2. **Before & After Schema Visualizer (`BeforeAfterSchemaVisualizer.tsx`)**:
   - Side-by-side comparison illustrating how anomalies and redundancy in the original relation are resolved across the normalized sub-relations.

---

## 7. Synchronized Bidirectional Selection & Accessible Legend

- **Synchronized Inspector (`SynchronizedDetailPanel.tsx`)**:
  - Clicking any node, edge, or relation updates the inspector panel immediately with relevant keys, prime status, and formal mathematical proofs.
- **Accessible Legend (`VisualizationLegend.tsx`)**:
  - Conveys meaning using distinct iconography, typography, and line patterns (solid vs dashed) so that information is never communicated via color alone.
