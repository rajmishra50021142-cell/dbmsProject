#!/usr/bin/env python3
"""
Script to generate the updated comprehensive, publication-grade Digital Assignment (DA) Project Submission Report
for Database Systems Lab in Microsoft Word (.docx) format according to the updated prompt instructions.
"""

import os
import sys
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import parse_xml, OxmlElement
from docx.oxml.ns import nsdecls, qn

def set_cell_background(cell, fill_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    tcPr.append(parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>'))

def set_cell_margins(cell, top=120, bottom=120, left=180, right=180):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = parse_xml(f'<w:tcMar {nsdecls("w")}><w:top w:w="{top}" w:type="dxa"/><w:bottom w:w="{bottom}" w:type="dxa"/><w:left w:w="{left}" w:type="dxa"/><w:right w:w="{right}" w:type="dxa"/></w:tcMar>')
    tcPr.append(tcMar)

def set_table_borders(table, color="CBD5E1", sz="4", val="single"):
    tblPr = table._tbl.tblPr
    tblBorders = parse_xml(f'''
        <w:tblBorders {nsdecls("w")}>
            <w:top w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>
            <w:bottom w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>
            <w:left w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>
            <w:right w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>
            <w:insideH w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>
            <w:insideV w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>
        </w:tblBorders>
    ''')
    tblPr.append(tblBorders)

def add_caption(doc, text):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(4)
    p.paragraph_format.space_after = Pt(12)
    run = p.add_run(text)
    run.font.name = "Calibri"
    run.font.size = Pt(9.5)
    run.font.italic = True
    run.font.color.rgb = RGBColor(71, 85, 105) # Slate 600

def add_heading_1(doc, text):
    h = doc.add_paragraph()
    h.paragraph_format.space_before = Pt(18)
    h.paragraph_format.space_after = Pt(6)
    h.paragraph_format.keep_with_next = True
    run = h.add_run(text)
    run.font.name = "Calibri"
    run.font.size = Pt(14)
    run.font.bold = True
    run.font.color.rgb = RGBColor(15, 23, 42) # Slate 900
    return h

def add_heading_2(doc, text):
    h = doc.add_paragraph()
    h.paragraph_format.space_before = Pt(14)
    h.paragraph_format.space_after = Pt(4)
    h.paragraph_format.keep_with_next = True
    run = h.add_run(text)
    run.font.name = "Calibri"
    run.font.size = Pt(12)
    run.font.bold = True
    run.font.color.rgb = RGBColor(30, 58, 138) # Blue 900 / Indigo
    return h

def add_heading_3(doc, text):
    h = doc.add_paragraph()
    h.paragraph_format.space_before = Pt(10)
    h.paragraph_format.space_after = Pt(3)
    h.paragraph_format.keep_with_next = True
    run = h.add_run(text)
    run.font.name = "Calibri"
    run.font.size = Pt(11)
    run.font.bold = True
    run.font.color.rgb = RGBColor(51, 65, 85) # Slate 700
    return h

def add_body_p(doc, text="", bold_prefix=""):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(5)
    p.paragraph_format.line_spacing = 1.15
    if bold_prefix:
        r_pre = p.add_run(bold_prefix)
        r_pre.font.name = "Calibri"
        r_pre.font.size = Pt(10.5)
        r_pre.font.bold = True
        r_pre.font.color.rgb = RGBColor(15, 23, 42)
    if text:
        r_text = p.add_run(text)
        r_text.font.name = "Calibri"
        r_text.font.size = Pt(10.5)
        r_text.font.color.rgb = RGBColor(51, 65, 85)
    return p

def add_bullet_item(doc, bold_prefix, text):
    p = doc.add_paragraph(style='List Bullet')
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(3)
    p.paragraph_format.line_spacing = 1.15
    if bold_prefix:
        r_pre = p.add_run(bold_prefix)
        r_pre.font.name = "Calibri"
        r_pre.font.size = Pt(10)
        r_pre.font.bold = True
        r_pre.font.color.rgb = RGBColor(15, 23, 42)
    r_text = p.add_run(text)
    r_text.font.name = "Calibri"
    r_text.font.size = Pt(10)
    r_text.font.color.rgb = RGBColor(51, 65, 85)
    return p

def add_callout(doc, text, title="ACADEMIC RIGOR NOTE"):
    table = doc.add_table(rows=1, cols=1)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    table.columns[0].width = Inches(6.5)
    cell = table.cell(0, 0)
    set_cell_background(cell, "F1F5F9") # Slate 100
    set_cell_margins(cell, top=140, bottom=140, left=200, right=200)
    
    tcPr = cell._tc.get_or_add_tcPr()
    borders = parse_xml(f'''
        <w:tcBorders {nsdecls("w")}>
            <w:left w:val="single" w:sz="24" w:space="0" w:color="3B82F6"/>
            <w:top w:val="none"/>
            <w:right w:val="none"/>
            <w:bottom w:val="none"/>
        </w:tcBorders>
    ''')
    tcPr.append(borders)
    
    p = cell.paragraphs[0]
    p.paragraph_format.space_after = Pt(2)
    r_title = p.add_run(f"📌 {title}: ")
    r_title.font.name = "Calibri"
    r_title.font.size = Pt(9.5)
    r_title.font.bold = True
    r_title.font.color.rgb = RGBColor(30, 58, 138)
    
    r_txt = p.add_run(text)
    r_txt.font.name = "Calibri"
    r_txt.font.size = Pt(9.5)
    r_txt.font.color.rgb = RGBColor(51, 65, 85)
    
    p_after = doc.add_paragraph()
    p_after.paragraph_format.space_before = Pt(0)
    p_after.paragraph_format.space_after = Pt(6)

def generate_report():
    doc = Document()
    
    # 0.8 in margins for clean, publication-grade layout
    for section in doc.sections:
        section.top_margin = Inches(0.8)
        section.bottom_margin = Inches(0.8)
        section.left_margin = Inches(0.8)
        section.right_margin = Inches(0.8)
    
    normal_style = doc.styles['Normal']
    normal_style.font.name = 'Calibri'
    normal_style.font.size = Pt(10.5)
    normal_style.font.color.rgb = RGBColor(51, 65, 85)
    
    # -------------------------------------------------------------
    # HEADER TITLE
    # -------------------------------------------------------------
    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_title.paragraph_format.space_before = Pt(0)
    p_title.paragraph_format.space_after = Pt(2)
    run_title = p_title.add_run("DIGITAL ASSIGNMENT (DA) – PROJECT SUBMISSION REPORT")
    run_title.font.name = "Calibri"
    run_title.font.size = Pt(16)
    run_title.font.bold = True
    run_title.font.color.rgb = RGBColor(15, 23, 42)
    
    p_sub = doc.add_paragraph()
    p_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_sub.paragraph_format.space_before = Pt(0)
    p_sub.paragraph_format.space_after = Pt(14)
    run_sub = p_sub.add_run("Database Systems Lab")
    run_sub.font.name = "Calibri"
    run_sub.font.size = Pt(13)
    run_sub.font.bold = True
    run_sub.font.color.rgb = RGBColor(71, 85, 105)
    
    # -------------------------------------------------------------
    # SUBMISSION DETAILS TABLE (7 ROWS - TEAM MEMBER 3 REMOVED)
    # -------------------------------------------------------------
    meta_table = doc.add_table(rows=7, cols=3)
    meta_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(meta_table, color="94A3B8", sz="6")
    
    col_widths = [Inches(2.5), Inches(2.2), Inches(2.2)]
    for row in meta_table.rows:
        for idx, width in enumerate(col_widths):
            row.cells[idx].width = width
            set_cell_margins(row.cells[idx], top=80, bottom=80, left=140, right=140)
    
    # Row 0: Website Link
    c00, c01, c02 = meta_table.cell(0, 0), meta_table.cell(0, 1), meta_table.cell(0, 2)
    c00.merge(c01).merge(c02)
    set_cell_background(c00, "F8FAFC")
    p = c00.paragraphs[0]
    p.paragraph_format.space_after = Pt(0)
    r1 = p.add_run("Website Link: ")
    r1.font.bold = True
    r2 = p.add_run("https://dbms-project-liard-theta.vercel.app/")
    r2.font.bold = True
    r2.font.color.rgb = RGBColor(37, 99, 235)
    
    # Row 1: Class / Slot
    c10, c11, c12 = meta_table.cell(1, 0), meta_table.cell(1, 1), meta_table.cell(1, 2)
    c11.merge(c12)
    p = c10.paragraphs[0]; p.paragraph_format.space_after = Pt(0); p.add_run("Class / Slot").font.bold = True
    p2 = c11.paragraphs[0]; p2.paragraph_format.space_after = Pt(0)
    r_val = p2.add_run("D2")
    r_val.font.bold = True
    
    # Row 2: Submission Date
    c20, c21, c22 = meta_table.cell(2, 0), meta_table.cell(2, 1), meta_table.cell(2, 2)
    c21.merge(c22)
    p = c20.paragraphs[0]; p.paragraph_format.space_after = Pt(0); p.add_run("Submission Date").font.bold = True
    p2 = c21.paragraphs[0]; p2.paragraph_format.space_after = Pt(0); p2.add_run("18/09/2026")
    
    # Row 3: Team No
    c30, c31, c32 = meta_table.cell(3, 0), meta_table.cell(3, 1), meta_table.cell(3, 2)
    c31.merge(c32)
    p = c30.paragraphs[0]; p.paragraph_format.space_after = Pt(0); p.add_run("Team No as given in the Approved list (Excel File)").font.bold = True
    p2 = c31.paragraphs[0]; p2.paragraph_format.space_after = Pt(0); p2.add_run("") # Left empty as requested
    
    # Row 4: Team Name
    c40, c41, c42 = meta_table.cell(4, 0), meta_table.cell(4, 1), meta_table.cell(4, 2)
    c41.merge(c42)
    p = c40.paragraphs[0]; p.paragraph_format.space_after = Pt(0); p.add_run("Team Name as given in the Approved list (Excel File)").font.bold = True
    p2 = c41.paragraphs[0]; p2.paragraph_format.space_after = Pt(0)
    r_tname = p2.add_run("TLE")
    r_tname.font.bold = True
    
    # Row 5: Team Member 1
    c50, c51, c52 = meta_table.cell(5, 0), meta_table.cell(5, 1), meta_table.cell(5, 2)
    p = c50.paragraphs[0]; p.paragraph_format.space_after = Pt(0); p.add_run("Team Member 1 Reg No").font.bold = True
    p = c51.paragraphs[0]; p.paragraph_format.space_after = Pt(0); p.add_run("25BCE1565").font.bold = True
    p = c52.paragraphs[0]; p.paragraph_format.space_after = Pt(0); p.add_run("Raj Mishra").font.bold = True
    
    # Row 6: Team Member 2
    c60, c61, c62 = meta_table.cell(6, 0), meta_table.cell(6, 1), meta_table.cell(6, 2)
    p = c60.paragraphs[0]; p.paragraph_format.space_after = Pt(0); p.add_run("Team Member 2 Reg No").font.bold = True
    p = c61.paragraphs[0]; p.paragraph_format.space_after = Pt(0); p.add_run("25BCE1586").font.bold = True
    p = c62.paragraphs[0]; p.paragraph_format.space_after = Pt(0); p.add_run("Kunal Anil Deshmukh").font.bold = True
    
    p_spacer = doc.add_paragraph()
    p_spacer.paragraph_format.space_before = Pt(6)
    p_spacer.paragraph_format.space_after = Pt(6)
    
    # -------------------------------------------------------------
    # 1. Title of the Project
    # -------------------------------------------------------------
    add_heading_1(doc, "1. Title of the Project")
    add_body_p(doc, "1NF–4NF Normalization Visualizer & Analyzer", bold_prefix="Formal Project Title: ")
    add_body_p(doc, "Normalization Lab (Interactive Educational Laboratory & Relational Decomposition Platform)", bold_prefix="Product Application Identity: ")
    add_body_p(doc, "First Normal Form (1NF), Second Normal Form (2NF), Third Normal Form (3NF), and Fourth Normal Form (4NF) analysis, attribute closure derivation, candidate key discovery, Tableau Chase lossless-join verification, dependency preservation, and interactive relational visualization.", bold_prefix="Assigned Curriculum Scope: ")
    
    # -------------------------------------------------------------
    # 2. Problem Statement
    # -------------------------------------------------------------
    add_heading_1(doc, "2. Problem Statement")
    add_body_p(doc, 
        "Relational database design and normalization form the foundational bedrock of reliable data architecture. "
        "However, normalization theory—spanning First Normal Form (1NF) through Fourth Normal Form (4NF)—remains one of the most intellectually demanding "
        "and error-prone topics for undergraduate computer science students. In academic environments, students consistently struggle with:"
    )
    add_bullet_item(doc, "Abstract Mathematical Formulations: ", "Concepts such as functional dependencies (FDs), Armstrong's axioms, partial key dependencies, transitive dependencies, and multivalued dependencies (MVDs) are typically taught through dense symbolic notation without visual or dynamic feedback.")
    add_bullet_item(doc, "Combinatorial Complexity of Key Discovery: ", "Finding all minimal candidate keys manually requires traversing the power set of attributes (up to 2^N combinations) and computing attribute closures X⁺. Manual calculations on paper are tedious, highly error-prone, and obscure structural intuition.")
    add_bullet_item(doc, "Lack of Step-by-Step Proof Transparency: ", "Standard textbook exercises state final normal forms without explaining the exact chain of logical reasoning—such as why an attribute is non-prime, which candidate key proper subset violates 2NF, or which non-trivial dependency induces a transitive 3NF violation.")
    add_bullet_item(doc, "Lossy Decomposition and Spurious Tuples: ", "Students frequently decompose relations into arbitrary sub-relations that fail to preserve dependencies or fail the formal Tableau Chase test, generating invalid spurious tuples upon natural join.")
    add_bullet_item(doc, "Deficiencies of Existing Digital Tools: ", "Existing web tools are either trivial binary checkers (outputting only 'In 3NF: True/False'), outdated Java applets incompatible with modern browsers, or generic LLMs that frequently hallucinate non-existent candidate keys and mathematically invalid schema decompositions.")
    add_body_p(doc, 
        "To decisively solve this pedagogical crisis, this project delivers 'Normalization Lab': a deterministic, zero-hallucination, interactive educational "
        "laboratory that guides students through relational schema construction, automated attribute closure expansion, lattice-based minimal key discovery, "
        "rigorous 1NF–4NF mathematical proofs, formally verified lossless decompositions, interactive SVG dependency graphs, and multi-format academic documentation."
    )
    
    # -------------------------------------------------------------
    # 3. Objective
    # -------------------------------------------------------------
    add_heading_1(doc, "3. Objective")
    add_body_p(doc, "The overarching objectives of this project are strictly engineered around academic excellence and pedagogical clarity:")
    add_bullet_item(doc, "Deterministic Relational Analysis: ", "Implement an uncompromising, mathematically grounded analytical engine in Python/FastAPI that deterministically verifies 1NF, 2NF, 3NF, and 4NF without relying on paid or probabilistic third-party LLMs.")
    add_bullet_item(doc, "Comprehensive Key & Closure Solvers: ", "Provide high-performance algorithms for computing the attribute closure X⁺ under Armstrong's axioms and discovering all minimal candidate keys using power-set exploration with early lattice pruning.")
    add_bullet_item(doc, "Authoritative 'Explain Why' Mathematical Proofs: ", "Expose detailed deductive proofs for every normal form stage, explicitly displaying formal relational definitions, authoritative mathematical evidence (candidate keys, determinants, prime attribute sets), and definitive academic remedies.")
    add_bullet_item(doc, "Formal Lossless Decomposition & Synthesis: ", "Implement Bernstein's 3NF synthesis algorithm and BCNF/4NF decomposition engines, verifying each proposed decomposition via the formal Tableau Chase equivalence test and dependency preservation algorithms.")
    add_bullet_item(doc, "State-of-the-Art Interactive Visualizations: ", "Deliver an intuitive web interface built with React 18, TypeScript, and React Flow, featuring dynamic interactive dependency graphs, animated closure step playback, and schema refinement lineages.")
    add_bullet_item(doc, "Complete Student Learning Ecosystem: ", "Incorporate a dedicated Syllabus-aligned Learn section, an exhaustive 13-step User Manual, a multi-format Academic Report Generator (PDF, DOCX, TXT), an isolated What-If experimental sandbox, a deterministic contextual AI assistant, and a 10-problem pedagogical Practice Bank.")
    
    # -------------------------------------------------------------
    # 4. Concept / Background
    # -------------------------------------------------------------
    add_heading_1(doc, "4. Concept / Background")
    add_body_p(doc, 
        "Relational normalization theory is grounded in relational algebra and mathematical logic, originating from the landmark work of Edgar F. Codd (1970, 1972), "
        "Philip A. Bernstein (1976), and Ronald Fagin (1977). The core theoretical pillars implemented within the application include:"
    )
    add_bullet_item(doc, "1. Relational Schema and Integrity: ", "A relation schema R(A₁, A₂, ..., Aₙ) defines the relation's name and its set of constituent attributes. A relational instance r(R) consists of discrete tuples where each attribute value belongs to an atomic domain.")
    add_bullet_item(doc, "2. Functional Dependencies (FDs) & Armstrong's Axioms: ", "A functional dependency X → Y specifies that whenever two tuples agree on attribute set X, they must also agree on attribute set Y. Sound and complete inference is governed by Armstrong's Axioms: Reflexivity, Augmentation, and Transitivity, yielding derived rules for Decomposition, Union, and Pseudotransitivity.")
    add_bullet_item(doc, "3. Attribute Closure (X⁺): ", "The attribute closure X⁺ with respect to a set of FDs F is the set of all attributes functionally determined by X under F. It is computed via fixpoint iteration: initializing X⁺ = X, and repeatedly adding Y whenever W → Y ∈ F and W ⊆ X⁺, until no further attributes can be added.")
    add_bullet_item(doc, "4. Superkeys and Minimal Candidate Keys: ", "A set of attributes K is a Superkey for R if K⁺ contains all attributes of R. K is a Candidate Key if it is minimal—i.e., no proper subset of K is a superkey (∀ A ∈ K, (K \\ {A})⁺ ≠ R). Attributes belonging to at least one candidate key are designated Prime attributes; all others are Non-Prime.")
    add_bullet_item(doc, "5. First Normal Form (1NF): ", "Requires that all attribute domains contain only atomic (indivisible) values, prohibiting repeating attribute groups, nested tables, or comma-separated multivalues within any single tuple.")
    add_bullet_item(doc, "6. Second Normal Form (2NF): ", "Requires the relation to be in 1NF and contain no partial functional dependencies. Formally, every non-prime attribute must be fully functionally dependent on every candidate key. A violation occurs if ∃ X → A where X ⊂ K (proper subset of candidate key K) and A is non-prime.")
    add_bullet_item(doc, "7. Third Normal Form (3NF): ", "Requires the relation to be in 2NF and contain no transitive functional dependencies. Formally, for every non-trivial functional dependency X → A (where A ⊄ X), at least one condition must hold: (a) X is a superkey of R, OR (b) A is a prime attribute of R.")
    add_bullet_item(doc, "8. Fourth Normal Form (4NF) & Multivalued Dependencies (MVDs): ", "An MVD X ↠ Y represents conditional independence: the set of Y-values associated with a given X-value is independent of the attributes in R \\ (X ∪ Y). A relation is in 4NF if, for every non-trivial MVD X ↠ Y (where Y ⊄ X and X ∪ Y ≠ R), X is a superkey of R.")
    add_bullet_item(doc, "9. Lossless-Join Decomposition & Tableau Chase: ", "A decomposition D = {R₁, R₂, ..., Rₖ} of R is lossless if and only if π_R₁(r) ⋈ π_R₂(r) ⋈ ... ⋈ π_Rₖ(r) = r for every legal instance r. This is formally proven using the Tableau Chase Equivalence test, in which a matrix of distinguished symbols (a_j) and non-distinguished symbols (b_ij) is equated according to the active dependencies until a row of all distinguished symbols appears.")
    add_bullet_item(doc, "10. Dependency Preservation: ", "A decomposition preserves dependencies if the union of the functional dependencies projected onto each sub-relation (F₁ ∪ F₂ ∪ ... ∪ Fₖ) logically entails the original dependency set F—that is, (⋃ Fᵢ)⁺ = F⁺.")
    
    # -------------------------------------------------------------
    # 5. Requirements
    # -------------------------------------------------------------
    add_heading_1(doc, "5. Requirements")
    add_body_p(doc, "The project satisfies a comprehensive matrix of functional, technical, and academic requirements:")
    
    add_heading_2(doc, "5.1 Functional Requirements")
    add_bullet_item(doc, "FR-1: Dual-Mode Schema Input: ", "Provide both a visual guided schema builder (form cards with interactive attribute pills) and a high-speed raw text editor with bidirectional synchronization and real-time LL(1) validation.")
    add_bullet_item(doc, "FR-2: Automated Attribute Closure Derivation: ", "Compute the mathematical closure X⁺ for any arbitrary subset of attributes, displaying the derivation chain step-by-step.")
    add_bullet_item(doc, "FR-3: Exhaustive Candidate Key Discovery: ", "Automatically detect all minimal candidate keys and superkeys, correctly identifying single-attribute, composite, and overlapping key configurations.")
    add_bullet_item(doc, "FR-4: Rigorous Normal Form Verification (1NF–4NF): ", "Evaluate relations sequentially against 1NF, 2NF, 3NF, and 4NF, generating formal status badges: SATISFIED, VIOLATED, or BLOCKED_BY_PREREQUISITE.")
    add_bullet_item(doc, "FR-5: Deductive 'Explain Why' Proof Dialogs: ", "Expose comprehensive evidence modals providing formal definitions, candidate keys, determinant superkey tests, prime attribute classifications, and academic remedies.")
    add_bullet_item(doc, "FR-6: Lossless Decomposition & Synthesis Engine: ", "Synthesize decomposed sub-relations into 3NF/4NF, allocating local primary keys and projecting localized functional dependencies.")
    add_bullet_item(doc, "FR-7: Tableau Chase & Dependency Preservation Verification: ", "Generate Tableau Chase equivalence matrices and run dependency projection tests to formally prove whether decompositions are lossless and dependency-preserving.")
    add_bullet_item(doc, "FR-8: Interactive Visual Graph Workspace: ", "Render interactive SVG/React Flow dependency diagrams with color-coded key, prime, non-prime, and violation paths, featuring minimap navigation and zoom/pan.")
    add_bullet_item(doc, "FR-9: Safe What-If Experimentation Sandbox: ", "Allow users to mutate dependencies and attributes in an isolated memory buffer and inspect real-time mathematical diffs without altering the active schema draft.")
    add_bullet_item(doc, "FR-10: Contextual Deterministic Assistant: ", "Provide a rule-based query resolver that answers technical questions regarding closures, keys, and violations grounded purely in the schema AST without LLM hallucinations.")
    add_bullet_item(doc, "FR-11: Pedagogical Practice Mode: ", "Include an interactive curriculum bank of 10 normalization problems spanning keys, closures, and 1NF–4NF violations with hints and instant automated grading.")
    add_bullet_item(doc, "FR-12: Multi-Format Academic Report Export: ", "Enable one-click compilation of comprehensive analysis reports into publication-grade PDF, Microsoft Word (.docx), and plain text (.txt) formats.")
    
    add_heading_2(doc, "5.2 Technical Requirements & Technology Stack")
    add_bullet_item(doc, "Backend Framework: ", "Python 3.12+, FastAPI asynchronous REST framework, Pydantic v2 data contracts, Uvicorn ASGI server.")
    add_bullet_item(doc, "Relational Engine: ", "Pure deterministic Python algorithmic core implementing Armstrong fixpoint closure, power-set lattice search, Bernstein 3NF synthesis, and Tableau Chase matrix equating.")
    add_bullet_item(doc, "Report Generation: ", "python-docx (Word document generation), ReportLab (PDF rendering), formatted ASCII streaming (Plain text).")
    add_bullet_item(doc, "Persistence & Audit Trail: ", "SQLite relational database managed via SQLAlchemy 2.0 ORM for storing analysis execution histories.")
    add_bullet_item(doc, "Frontend Framework: ", "React 18, TypeScript (strict type safety), Vite build tooling, React Router v6.")
    add_bullet_item(doc, "Visual Styling & Components: ", "Tailwind CSS modern design system, Lucide React iconography, WCAG 2.1 AA compliant Day/Night theme system.")
    add_bullet_item(doc, "Graph Visualization: ", "@xyflow/react (React Flow) for interactive graph rendering with Dagre-based hierarchical node layout.")
    add_bullet_item(doc, "Cloud Deployment: ", "Vercel edge network for frontend hosting; modular REST API architecture.")
    
    # -------------------------------------------------------------
    # 6. System Architecture / Module Design (REWRITTEN ACCORDING TO USER'S ARCHITECTURE DIAGRAM)
    # -------------------------------------------------------------
    add_heading_1(doc, "6. System Architecture / Module Design")
    add_body_p(doc, 
        "The architecture of Normalization Lab is structured into clean, decoupled, high-cohesion subsystems representing the exact "
        "computational and organizational topology implemented in the project codebase. The system strictly separates the Client Application, "
        "the FastAPI API Gateway, Deterministic Analysis Engines, Decomposition and Visualization subsystems, and Educational Services."
    )
    
    # EMBED NEW SYSTEM ARCHITECTURE IMAGE (media_1789714643558.png)
    img_arch_path = "/Users/rajmishara/.gemini/antigravity-ide/brain/cb36b303-314d-444e-bd7f-cd0f8945906d/.user_uploaded/media_1789714643558.png"
    if os.path.exists(img_arch_path):
        p_img = doc.add_paragraph()
        p_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_img.add_run().add_picture(img_arch_path, width=Inches(6.2))
        add_caption(doc, "Figure 1: High-Level System Architecture and Computational Component Interaction Diagram")
    
    add_body_p(doc, 
        "As formalized in the system architecture diagram above, the application operates through five interconnected subsystems:", 
        bold_prefix="Subsystem Topology and Structural Decomposition: "
    )
    
    add_heading_2(doc, "6.1 Client Application Subsystem (Frontend Layer)")
    add_bullet_item(doc, "Browser Learner (External Actor): ", "The student or evaluator accessing the laboratory interface through any modern desktop or mobile web browser.")
    add_bullet_item(doc, "React Bootstrap (Frontend Entry): ", "The client initialization layer (main.tsx / App.tsx) that establishes root DOM mounts, sets up global error boundaries, and injects global theme providers (Day/Night mode).")
    add_bullet_item(doc, "Routed Application Shell (Frontend Router): ", "React Router v6 declarative routing coordinator that maps clean URL paths (/analyzer, /closure, /keys, /normalize, /learn, /help, /history, /developed-by) to their corresponding page views.")
    add_bullet_item(doc, "Analysis and Learning Workspaces (Frontend Features): ", "Modular feature workspaces presenting the Schema Builder, Normal Form Journey cards, Evidence Modals, Interactive React Flow Graphs, and Practice Banks.")
    add_bullet_item(doc, "Frontend HTTP Gateway (HTTP Client): ", "Centralized network client utilizing typed Axios / native fetch wrappers, handling JSON serialization, request timeouts, and error interception.")
    
    add_heading_2(doc, "6.2 API Gateway & Hosting Layer (Backend Layer)")
    add_bullet_item(doc, "FastAPI Application Host (API Host): ", "Asynchronous ASGI web application host running on Uvicorn, configuring CORS security policies, response compression, and OpenAPI / Swagger metadata generation.")
    add_bullet_item(doc, "Database Lifecycle (session.py): ", "SQLAlchemy 2.0 connection pool and session lifecycle coordinator that manages transactional lifecycles for relational audit records.")
    add_bullet_item(doc, "Versioned API Router (router.py): ", "Mounts modular sub-routers across distinct analytical domains (/api/v1/normalization, /api/v1/closure, /api/v1/keys, /api/v1/decomposition, /api/v1/reports, etc.).")
    add_bullet_item(doc, "Endpoint Handler Families (HTTP Handlers): ", "Strictly typed Pydantic controllers validating incoming payloads, dispatching operations to core computational engines, and returning typed response contracts.")
    
    add_heading_2(doc, "6.3 Analysis Engines (Core Relational Foundations)")
    add_bullet_item(doc, "Functional Dependency Model (FD Engine): ", "The canonical in-memory relational model representing attributes, FDs (X → Y), and MVDs (X ↠ Y). It validates semantic domain constraints and normalizes dependencies into canonical forms.")
    add_bullet_item(doc, "Attribute Closure Engine (closure_engine.py): ", "Pure algorithmic fixpoint implementation of Armstrong's Axioms. Computes X⁺ for any given subset X and outputs an audit trace of exactly which dependencies triggered at each iteration.")
    add_bullet_item(doc, "Candidate-Key Analyzer: ", "Explores the attribute power set organized as a binary lattice. It invokes the Attribute Closure Engine, determines minimal superkeys, and aggressively prunes supersets from the search space.")
    add_bullet_item(doc, "Normal-Form Analyzer (Normalization Engine): ", "The primary analytical engine. It consumes verified candidate keys and attribute closures to evaluate 1NF (cell atomicity), 2NF (partial dependencies), 3NF (transitive dependencies), and 4NF (multivalued dependencies).")
    
    add_heading_2(doc, "6.4 Decomposition and Visualization Subsystem")
    add_bullet_item(doc, "Decomposition Planner (Decomposition Engine): ", "High-level coordinator that formulates relational decomposition strategies based on verified normal form violations.")
    add_bullet_item(doc, "Minimal-Cover Synthesizer (Synthesis Engine): ", "Computes the canonical minimal cover F_min of F by decomposing RHS singletons, eliminating extraneous LHS attributes, and removing redundant FDs to execute Bernstein's 3NF synthesis algorithm.")
    add_bullet_item(doc, "Lossless-Join Verifier (Verification Engine): ", "Implements the formal Tableau Chase test, generating an s × n matrix of symbols (a_j, b_ij) and equating rows until a row contains all distinguished symbols a_j, rigorously proving the absence of spurious tuples.")
    add_bullet_item(doc, "Dependency-Preservation Verifier (Verification Engine): ", "Computes projected functional dependencies F_i = π_R_i(F) across all sub-relations and verifies whether (⋃ F_i)⁺ ⊇ F.")
    add_bullet_item(doc, "Visualization Layout Builder (Visualization Engine): ", "Generates hierarchical coordinates, edge splines, and color-coded status attributes for rendering interactive React Flow dependency graphs.")
    
    add_heading_2(doc, "6.5 Educational Services Subsystem")
    add_bullet_item(doc, "What-If Experiment Orchestrator (Experiment Service): ", "Creates memory-isolated schema sandbox clones, re-invoking the closure and normalization engines to generate instant before-and-after mathematical diffs without modifying the active draft.")
    add_bullet_item(doc, "Practice Exercise Service (Practice Service): ", "Manages the curriculum bank of 10 university-level normalization problems, providing dynamic pedagogical hints and verifying student answers directly against the core relational engines.")
    
    # -------------------------------------------------------------
    # 7. Website / Application Structure
    # -------------------------------------------------------------
    add_heading_1(doc, "7. Website / Application Structure")
    add_body_p(doc, "The web application is structured into clearly organized, dedicated sections accessible via top-level navigation:")
    
    # 7.1 Learn
    add_heading_2(doc, "7.1 Learn (Curriculum Syllabus)")
    add_body_p(doc, 
        "The Learn section functions as an interactive textbook and digital syllabus. It provides comprehensive concept explanations "
        "covering relational foundations, Armstrong's axioms, minimal covers, attribute closures, candidate keys, 1NF, 2NF, 3NF, 4NF, "
        "Bernstein's synthesis, and Tableau Chase lossless join verification."
    )
    add_bullet_item(doc, "Relevant Educational Lecture Video: ", "A comprehensive academic lecture is embedded directly within the application, featuring an interactive chapter seeker and syllabus navigation.")
    add_bullet_item(doc, "Video Title: ", "Comprehensive DBMS Normalization Lecture (1NF through 4NF & 5NF)")
    add_bullet_item(doc, "Direct Video Link: ", "https://youtu.be/GFQaEYEc8_8?si=BrW8ZzglClywsFC4")
    add_bullet_item(doc, "Duration & Content: ", "28 minutes 44 seconds. Features detailed blackboard and digital slide derivations of unnormalized tables, 1NF atomicity, 2NF partial key dependencies, 3NF transitive chains, 4NF independent facts, and 5NF join dependencies.")
    add_bullet_item(doc, "Interactive Chapter Markers: ", "00:00 (What is database normalization?) | 03:55 (1NF) | 10:24 (2NF) | 16:08 (3NF) | 20:29 (4NF) | 23:47 (5NF) | 26:41 (Summary and review).")
    add_bullet_item(doc, "Academic References Acknowledged: ", "Silberschatz et al. (Database System Concepts, 7th Ed.), Elmasri & Navathe (Fundamentals of Database Systems, 7th Ed.), Ramakrishnan & Gehrke (DBMS, 3rd Ed.), E. F. Codd (CACM 1970, Courant 1972), Ronald Fagin (ACM TODS 1977), Philip A. Bernstein (ACM TODS 1976), Stanford CS145, MIT OCW 6.830, CMU 15-445.")
    
    # 7.2 Developed By
    add_heading_2(doc, "7.2 Developed By")
    add_body_p(doc, "The project was designed, architected, and implemented by Team TLE under the expert academic guidance of faculty mentor Dr. Swaminathan A:")
    
    add_callout(doc, 
        "Faculty Guide: Dr. Swaminathan A\n"
        "Designation: Assistant Professor\n"
        "Department: Department of Computer Science and Engineering\n"
        "Institution: School of Computer Science and Engineering",
        title="PROJECT SUPERVISION & FACULTY MENTORSHIP"
    )
    
    # Student Profiles Table
    team_table = doc.add_table(rows=1, cols=2)
    team_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(team_table, color="CBD5E1", sz="6")
    team_table.columns[0].width = Inches(3.4)
    team_table.columns[1].width = Inches(3.4)
    
    c1 = team_table.cell(0, 0)
    set_cell_background(c1, "F8FAFC")
    set_cell_margins(c1, top=140, bottom=140, left=160, right=160)
    p1 = c1.paragraphs[0]
    p1.alignment = WD_ALIGN_PARAGRAPH.CENTER
    raj_photo_path = "/Users/rajmishara/dbmsProject/frontend/public/team/raj_mishra.jpg"
    if os.path.exists(raj_photo_path):
        p1.add_run().add_picture(raj_photo_path, width=Inches(1.75))
    p1_desc = c1.add_paragraph()
    p1_desc.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p1_desc.paragraph_format.space_before = Pt(6)
    p1_desc.paragraph_format.space_after = Pt(2)
    r_name1 = p1_desc.add_run("Raj Mishra\n")
    r_name1.font.bold = True
    r_name1.font.size = Pt(11)
    r_name1.font.color.rgb = RGBColor(15, 23, 42)
    r_reg1 = p1_desc.add_run("Register No: 25BCE1565\n")
    r_reg1.font.bold = True
    r_reg1.font.size = Pt(10)
    r_reg1.font.color.rgb = RGBColor(37, 99, 235)
    r_role1 = p1_desc.add_run("Full Stack Architecture & DBMS Engine Lead\n")
    r_role1.font.size = Pt(9.5)
    r_role1.font.color.rgb = RGBColor(71, 85, 105)
    
    c2 = team_table.cell(0, 1)
    set_cell_background(c2, "F8FAFC")
    set_cell_margins(c2, top=140, bottom=140, left=160, right=160)
    p2 = c2.paragraphs[0]
    p2.alignment = WD_ALIGN_PARAGRAPH.CENTER
    kunal_photo_path = "/Users/rajmishara/dbmsProject/frontend/public/team/kunal_deshmukh.png"
    if os.path.exists(kunal_photo_path):
        p2.add_run().add_picture(kunal_photo_path, width=Inches(1.75))
    p2_desc = c2.add_paragraph()
    p2_desc.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p2_desc.paragraph_format.space_before = Pt(6)
    p2_desc.paragraph_format.space_after = Pt(2)
    r_name2 = p2_desc.add_run("Kunal Anil Deshmukh\n")
    r_name2.font.bold = True
    r_name2.font.size = Pt(11)
    r_name2.font.color.rgb = RGBColor(15, 23, 42)
    r_reg2 = p2_desc.add_run("Register No: 25BCE1586\n")
    r_reg2.font.bold = True
    r_reg2.font.size = Pt(10)
    r_reg2.font.color.rgb = RGBColor(37, 99, 235)
    r_role2 = p2_desc.add_run("Frontend Engineering & Interactive Visualizations\n")
    r_role2.font.size = Pt(9.5)
    r_role2.font.color.rgb = RGBColor(71, 85, 105)
    
    add_caption(doc, "Figure 2: Project Developers and Faculty Mentorship Details")
    
    # 7.3 Help
    add_heading_2(doc, "7.3 Help (User Operational Manual)")
    add_body_p(doc, 
        "The Help section serves as the complete operational manual for first-time students and evaluators. "
        "It provides an exhaustive breakdown of the application workflow, interface controls, input syntax standards, "
        "verdict status meanings, and troubleshooting guidelines."
    )
    
    # EMBED IMAGE 1 (BATCH 1): Help Page
    img1_path = "/Users/rajmishara/.gemini/antigravity-ide/brain/cb36b303-314d-444e-bd7f-cd0f8945906d/.user_uploaded/media_1789713314617.png"
    if os.path.exists(img1_path):
        p_img = doc.add_paragraph()
        p_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_img.add_run().add_picture(img1_path, width=Inches(6.0))
        add_caption(doc, "Figure 3: Normalization Lab User Manual & Technical Documentation Interface (13-Step Operational Workflow)")
    
    add_body_p(doc, "The application implements a 13-step operational workflow designed to guide students from raw problem specification to verified decomposition:", bold_prefix="Exhaustive 13-Step User Workflow: ")
    add_bullet_item(doc, "Step 1 - Open Schema Builder: ", "Navigate to the Analyzer or Normalization page to initialize or edit the active relation schema.")
    add_bullet_item(doc, "Step 2 - Specify Relation & Attributes: ", "Enter the formal relation name (e.g. ENROLLMENT) and comma-separated attribute names (e.g. StudentID, CourseID, Grade).")
    add_bullet_item(doc, "Step 3 - Declare or Auto-Discover Keys: ", "Input known candidate keys manually, or leave blank to invoke the closure engine's automatic lattice discovery of all minimal superkeys.")
    add_bullet_item(doc, "Step 4 - Add Functional Dependencies (FDs): ", "Define deterministic functional dependencies in LHS → RHS format (e.g. StudentID → StudentName) using visual pills or raw text.")
    add_bullet_item(doc, "Step 5 - Add Multivalued Dependencies (MVDs): ", "Declare independent multivalued facts using LHS ↠ RHS format (e.g. StudentID ↠ Hobby) required for 4NF evaluation.")
    add_bullet_item(doc, "Step 6 - Optionally Add Sample Tuples: ", "Supply tabular sample data rows to test 1NF cell atomicity, inspect duplicate rows, and visualize concrete update anomalies.")
    add_bullet_item(doc, "Step 7 - Execute Normalization Analysis: ", "Click 'Run Analysis'. The engine tokenizes inputs, computes attribute closures, determines candidate keys, and executes formal 1NF–4NF tests.")
    add_bullet_item(doc, "Step 8 - Review 1NF to 4NF Journey: ", "Inspect the status badges for each stage (SATISFIED, VIOLATED, or BLOCKED_BY_PREREQUISITE) on the summary cards.")
    add_bullet_item(doc, "Step 9 - Explore 'Explain Why' Proofs: ", "Click 'Explain Why' on any normal form card to open an evidence modal displaying formal definitions, mathematical evidence, and academic remedies.")
    add_bullet_item(doc, "Step 10 - Inspect Graph & Closure Playback: ", "Switch to the Visualizer Workspace to view the interactive React Flow SVG dependency graph and step-by-step animated closure playback.")
    add_bullet_item(doc, "Step 11 - Verify Decompositions & Lossless Join: ", "Examine proposed sub-relations, inspect the Tableau Chase symbol equating matrix, and verify dependency preservation.")
    add_bullet_item(doc, "Step 12 - Simulate What-If Experiments: ", "Open Experiment Mode to safely add, remove, or modify dependencies in an isolated sandbox and inspect the mathematical diff.")
    add_bullet_item(doc, "Step 13 - Download Academic Report: ", "Click 'Download Report' to compile the complete analysis into a formatted PDF, Microsoft Word (.docx), or plain text (.txt) document.")
    
    add_body_p(doc, "The Help section also documents all interface buttons (Run Analysis, Sync Draft, Assistant, Explain Why, Experiment Mode, Closure Lab, Download Report, Theme Switcher) and explains all status verdicts (SATISFIED, VIOLATED, BLOCKED_BY_PREREQUISITE, NOT_VERIFIED).")
    
    # 7.4 Download
    add_heading_2(doc, "7.4 Download (Academic Report Generation)")
    add_body_p(doc, 
        "The Download feature enables one-click generation of comprehensive, publication-grade academic documentation. "
        "The modal allows students to select output formats (PDF, Microsoft Word DOCX, Plain Text TXT) and toggle specific report sections."
    )
    
    # EMBED IMAGE 2 (BATCH 1): Download Modal
    img2_path = "/Users/rajmishara/.gemini/antigravity-ide/brain/cb36b303-314d-444e-bd7f-cd0f8945906d/.user_uploaded/media_1789713335118.png"
    if os.path.exists(img2_path):
        p_img = doc.add_paragraph()
        p_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_img.add_run().add_picture(img2_path, width=Inches(4.4))
        add_caption(doc, "Figure 4: Academic Normalization Report Export Modal Showing Multi-Format Options and Granular Section Toggles")
    
    add_body_p(doc, "The generated report systematically encapsulates three core dimensions of the normalization run:", bold_prefix="Report Architecture: ")
    add_bullet_item(doc, "1. User Input: ", "Records the original relation name, all declared schema attributes, initial candidate keys, functional dependencies (FDs), multivalued dependencies (MVDs), and sample data rows.")
    add_bullet_item(doc, "2. Processing Steps: ", "Documents chronological mathematical deductions: attribute closure derivations (X⁺), power-set key exploration, prime vs. non-prime classification, Tableau Chase equating passes, and dependency projection sets.")
    add_bullet_item(doc, "3. Output Verdicts & Decompositions: ", "Provides final 1NF–4NF verdicts, formal mathematical proofs of satisfaction or violation, proposed sub-relations with designated primary keys, and lossless join verification guarantees.")
    
    add_body_p(doc, "Demonstration of Sample Input and Output in Exported Report:", bold_prefix="Sample Input / Output Demonstration: ")
    demo_box = (
        "=================================================================================\n"
        "SAMPLE INPUT SPECIFICATION:\n"
        "Relation: STAFF_BRANCH(StaffNo, SName, Position, Salary, BranchNo, BAddress)\n"
        "Candidate Keys: {StaffNo}\n"
        "Functional Dependencies:\n"
        "  [FD-1] StaffNo -> SName, Position, Salary, BranchNo\n"
        "  [FD-2] BranchNo -> BAddress\n"
        "---------------------------------------------------------------------------------\n"
        "PROCESSING STEPS (MATHEMATICAL REASONING):\n"
        "1. Attribute Closure: {StaffNo}+ = {StaffNo, SName, Position, Salary, BranchNo, BAddress} = R\n"
        "2. Candidate Key Verification: {StaffNo} is minimal superkey -> Prime: {StaffNo}\n"
        "3. Non-Prime Attributes: {SName, Position, Salary, BranchNo, BAddress}\n"
        "4. 1NF Test: Pass (All attributes atomic, no repeating groups)\n"
        "5. 2NF Test: Pass (Candidate key is single attribute; no proper subset partial dependencies)\n"
        "6. 3NF Test: FAIL -> FD-2 (BranchNo -> BAddress) violates 3NF because BranchNo is not a superkey\n"
        "   and BAddress is a non-prime attribute (Transitive Dependency).\n"
        "7. 3NF Decomposition (Bernstein Synthesis):\n"
        "   - Sub-relation 1: STAFF(StaffNo, SName, Position, Salary, BranchNo) | PK: StaffNo\n"
        "   - Sub-relation 2: BRANCH(BranchNo, BAddress)                       | PK: BranchNo\n"
        "8. Tableau Chase Lossless Verification: Row 1 equates all symbols to distinguished a_j -> LOSSLESS!\n"
        "9. Dependency Preservation: F1 U F2 = {FD-1, FD-2} covers F -> 100% PRESERVED!\n"
        "---------------------------------------------------------------------------------\n"
        "FINAL OUTPUT VERDICT:\n"
        "Highest Normal Form Satisfied: 2NF | Recommended Decomposition: 3NF (Lossless & Preserving)\n"
        "================================================================================="
    )
    add_callout(doc, demo_box, title="SAMPLE EXECUTION TRACE IN GENERATED ACADEMIC REPORT")
    
    # -------------------------------------------------------------
    # 8. Input (REWRITTEN WITH NEW RAW NOTATION IMAGE & 3 INPUT PARADIGMS)
    # -------------------------------------------------------------
    add_heading_1(doc, "8. Input")
    add_body_p(doc, 
        "The application provides a flexible, multi-modal input ingestion architecture designed to cater to both novice students "
        "and advanced database designers. To accommodate diverse learning styles, Normalization Lab supports three distinct input paradigms: "
        "the Structured Builder, Raw Relational Notation, and Sample Data Tuples."
    )
    
    # EMBED NEW INPUT IMAGE (media_1789714855235.png)
    img_input_path = "/Users/rajmishara/.gemini/antigravity-ide/brain/cb36b303-314d-444e-bd7f-cd0f8945906d/.user_uploaded/media_1789714855235.png"
    if os.path.exists(img_input_path):
        p_img = doc.add_paragraph()
        p_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_img.add_run().add_picture(img_input_path, width=Inches(5.0))
        add_caption(doc, "Figure 5: High-Speed Raw Relational Notation Input Interface with Live Textbook Grammar Syntax")
    
    add_body_p(doc, 
        "Detailed Examination of the Three Input Modalities Implemented in the Application:", 
        bold_prefix="The Three Input Paradigms: "
    )
    
    add_heading_2(doc, "8.1 Paradigm 1: Structured Visual Builder")
    add_body_p(doc, 
        "The Structured Builder provides an interactive, form-based graphical user interface tailored for first-time learners. "
        "It eliminates syntax errors by breaking relational definitions into discrete, guided form components:"
    )
    add_bullet_item(doc, "Relation Header: ", "A dedicated input field where users enter the relation schema name (e.g. ENROLLMENT or STAFF_BRANCH).")
    add_bullet_item(doc, "Interactive Attribute Chips: ", "Attributes are entered and rendered as interactive pill badges. Students can dynamically add new attributes, edit existing names, or click to delete attributes. Whitespace is automatically trimmed, and duplicate attribute names are rejected with visual warnings.")
    add_bullet_item(doc, "Candidate Key Selection Chips: ", "Students can designate candidate keys by clicking on declared attribute chips. The interface supports single-attribute keys as well as composite keys (e.g. {StudentID, CourseID}). Alternatively, students may leave this field blank to trigger automatic lattice key discovery.")
    add_bullet_item(doc, "Structured Dependency Rows: ", "Functional dependencies (FDs) and multivalued dependencies (MVDs) are constructed via structured builder cards. Each row contains dedicated pill containers for Determinant (LHS) attributes, an arrow selector ('→' for FD or '↠' for MVD), and Dependent (RHS) attributes, preventing malformed syntax.")
    
    add_heading_2(doc, "8.2 Paradigm 2: Raw Relational Notation Mode")
    add_body_p(doc, 
        "For instructors and advanced students who prefer rapid problem entry, the Raw Notation mode provides a high-speed text editor "
        "following standard university textbook conventions (e.g., Silberschatz or Elmasri notation). As shown in Figure 5:"
    )
    add_bullet_item(doc, "Authoritative Textbook Grammar: ", "Schemas are entered directly in standard mathematical notation, such as:\nRelation: STAFF_BRANCH(StaffNo, SName, Position, Salary, BranchNo, BAddress)\nFDs:\nStaffNo -> SName, Position, Salary, BranchNo\nBranchNo -> BAddress")
    add_bullet_item(doc, "Lexical Parser & Arrow Flexibility: ", "The underlying LL(1) tokenizer accepts standard ASCII arrows ('->', '-->') as well as unicode relational symbols ('→' for FDs and '↠' or '->>' for MVDs).")
    add_bullet_item(doc, "Real-Time Bidirectional Synchronization: ", "The Raw Notation editor and the Structured Visual Builder are coupled via a unified reactive store. Modifications typed in the raw text block instantaneously update the visual chips in the structured form, and vice versa.")
    add_bullet_item(doc, "Live Syntax Validation & Error Recovery: ", "Malformed lines (e.g. missing determinants, invalid arrow tokens '=>', or attribute references not declared in the relation header) trigger inline highlighting with actionable diagnostic messages.")
    
    add_heading_2(doc, "8.3 Paradigm 3: Sample Data / Tuples Ingestion")
    add_body_p(doc, 
        "While functional dependency analysis operates purely over relational metadata, First Normal Form (1NF) evaluation and anomaly "
        "pedagogy require examining concrete data instances. The application includes a dedicated Sample Data tab:"
    )
    add_bullet_item(doc, "Tabular Grid Editor: ", "Allows users to enter sample records corresponding to the declared schema attributes. Supports adding rows, deleting tuples, and entering cell-level data.")
    add_bullet_item(doc, "Cell-Level Atomicity Verification: ", "The 1NF analysis engine scans every cell in the data grid for non-atomic entries, such as comma-separated values (e.g. 'Java, Python, C++'), nested JSON/array objects, or repeating groups. If non-atomic cells are detected, the relation is formally flagged as 1NF Violated.")
    add_bullet_item(doc, "Duplicate Tuple & Primary Key Checks: ", "Validates whether the entered tuples satisfy entity integrity. If two distinct rows share identical candidate key values but differ in dependent attributes, a visual violation flag is raised.")
    add_bullet_item(doc, "Concrete Anomaly Demonstration: ", "The sample tuples provide concrete visual proof of update anomalies, deletion anomalies (where deleting one attribute unintentionally purges another), and insertion anomalies (where data cannot be recorded without null keys).")
    
    # -------------------------------------------------------------
    # 9. Processing / Working Methodology (IMAGE REMOVED AS REQUESTED)
    # -------------------------------------------------------------
    add_heading_1(doc, "9. Processing / Working Methodology")
    add_body_p(doc, 
        "The processing methodology follows an uncompromising, step-by-step mathematical pipeline grounded in the project master reference. "
        "Every operation is executed deterministically without external API dependencies."
    )
    
    add_body_p(doc, "Chronological Processing Pipeline:", bold_prefix="Step-by-Step Algorithmic Pipeline: ")
    add_bullet_item(doc, "Step 1 - Lexical Tokenization & Semantic Validation: ", "The engine parses inputs into relational AST nodes. It validates that every attribute referenced in FDs or MVDs exists in R, checks for circular dependencies, and eliminates trivial dependencies (where RHS ⊆ LHS).")
    add_bullet_item(doc, "Step 2 - Attribute Closure Derivation (Armstrong Fixpoint): ", "For any target attribute set X, the algorithm initializes closure set X⁺ = X. It iteratively scans all FDs W → Y ∈ F. If W ⊆ X⁺, then X⁺ = X⁺ ∪ Y. This process repeats until a complete pass over F produces no new attributes (fixpoint reached). Time complexity is O(|F| · |R|).")
    add_bullet_item(doc, "Step 3 - Minimal Candidate Key Discovery: ", "The engine explores the attribute power set 𝒫(R) organized as a binary lattice. It evaluates subsets in increasing order of cardinality (k = 1, 2, ..., |R|). If closure K⁺ = R, then K is recorded as a Candidate Key, and all proper supersets of K are pruned from further exploration, ensuring minimal superkey guarantees.")
    add_bullet_item(doc, "Step 4 - Prime and Non-Prime Attribute Classification: ", "Attributes are partitioned into Prime attributes (belonging to at least one candidate key) and Non-Prime attributes (belonging to no candidate key). This classification is critical for subsequent 2NF and 3NF evaluations.")
    add_bullet_item(doc, "Step 5 - First Normal Form (1NF) Analysis: ", "Verifies domain atomicity. If sample tuples are provided, it scans each cell for multi-valued delimiters (commas, lists, sub-tables). If no sample tuples are provided, 1NF is verified structurally assuming atomic domains.")
    add_bullet_item(doc, "Step 6 - Second Normal Form (2NF) Analysis: ", "Evaluates partial dependencies. For each non-prime attribute A and each candidate key K: if ∃ X → A such that X ⊂ K (proper subset), then 2NF is VIOLATED. If no candidate key is composite (|K| = 1 for all K), 2NF is mathematically guaranteed to pass.")
    add_bullet_item(doc, "Step 7 - Third Normal Form (3NF) Analysis: ", "Evaluates transitive dependencies. For every non-trivial FD X → A: the engine checks whether (a) X is a superkey (i.e. X⁺ = R), OR (b) A is a prime attribute. If any FD fails both conditions, 3NF is VIOLATED.")
    add_bullet_item(doc, "Step 8 - Fourth Normal Form (4NF) Analysis: ", "Evaluates multivalued dependencies. For every non-trivial MVD X ↠ Y (where Y ⊄ X and X ∪ Y ≠ R): the engine tests whether X is a superkey. If X is not a superkey, 4NF is VIOLATED.")
    add_bullet_item(doc, "Step 9 - Formal 3NF Synthesis (Bernstein's Algorithm): ", "To eliminate 3NF violations while preserving dependencies: (a) Compute minimal cover F_min of F; (b) For each FD X → Y ∈ F_min, create a sub-relation R_i = X ∪ Y; (c) If no R_i contains a candidate key of R, create an additional sub-relation containing candidate key K; (d) Eliminate redundant sub-relations.")
    add_bullet_item(doc, "Step 10 - Tableau Chase Lossless-Join Verification: ", "Constructs a tableau matrix T of dimension s × n (where s is number of decomposed sub-relations and n is |R|). Cell T(i, j) is initialized to distinguished symbol a_j if attribute A_j ∈ R_i, and non-distinguished symbol b_ij otherwise. For each FD X → Y, rows that agree on X have their Y-symbols equated (preferring a_j over b_ij). If any row becomes all distinguished symbols (a_1, a_2, ..., a_n), the decomposition is formally proven LOSSLESS.")
    add_bullet_item(doc, "Step 11 - Dependency Preservation Verification: ", "For each sub-relation R_i, compute projected FDs F_i = π_R_i(F). Test whether every original FD X → Y ∈ F can be derived from the union ⋃ F_i using attribute closure. If so, dependency preservation is 100% established.")
    
    # -------------------------------------------------------------
    # 10. Output (EXPANDED TO INCLUDE ALL 4 IMAGES)
    # -------------------------------------------------------------
    add_heading_1(doc, "10. Output")
    add_body_p(doc, 
        "The application generates rich, multi-layered visual and analytical outputs, translating complex mathematical deductions "
        "into actionable pedagogical insights for students. The output suite encompasses visual dependency graphs, formal deductive "
        "reasoning modals, stage-by-stage normal form violation cards, and formal decomposition blueprints with Tableau Chase proofs."
    )
    
    # OUTPUT IMAGE 1: Relational Dependency Graph (media_1789713363884.png)
    img_graph_path = "/Users/rajmishara/.gemini/antigravity-ide/brain/cb36b303-314d-444e-bd7f-cd0f8945906d/.user_uploaded/media_1789713363884.png"
    if os.path.exists(img_graph_path):
        p_img = doc.add_paragraph()
        p_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_img.add_run().add_picture(img_graph_path, width=Inches(6.0))
        add_caption(doc, "Figure 6: Interactive Relational Dependency Graph with Color-Coded Key Nodes, Non-Prime Nodes, and Red Violation Arcs")
    
    add_body_p(doc, 
        "As illustrated in Figure 6, the Relational Dependency Graph provides an interactive visual mapping of schema topology. "
        "Key attributes ({StaffNo}) are rendered with golden borders and explicit 'KEY' badges, while non-prime attributes are designated in clean slate. "
        "Valid dependencies are routed with neutral arcs, while violating dependencies (e.g. BranchNo → BAddress) are highlighted with red warning arcs, "
        "immediately exposing the structural cause of normal form failures."
    )
    
    # OUTPUT IMAGE 2: 2NF Proof Evidence Modal (media_1789713511600.png)
    img_2nf_path = "/Users/rajmishara/.gemini/antigravity-ide/brain/cb36b303-314d-444e-bd7f-cd0f8945906d/.user_uploaded/media_1789713511600.png"
    if os.path.exists(img_2nf_path):
        p_img = doc.add_paragraph()
        p_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_img.add_run().add_picture(img_2nf_path, width=Inches(6.0))
        add_caption(doc, "Figure 7: Authoritative 'Explain Why' Proof Dialog for Second Normal Form (2NF) Displaying Formal Mathematical Evidence")
    
    add_body_p(doc, 
        "Figure 7 demonstrates the authoritative 'Explain Why' proof modal for Second Normal Form (2NF). "
        "The modal explicitly details the formal relational condition, authoritative mathematical evidence (Candidate Key: {StaffNo}, "
        "Determinant Superkey evaluation, and Prime attribute verification), concluding with the definitive mathematical rationale: "
        "'All candidate keys are single-attribute keys. Partial dependencies cannot mathematically occur.'"
    )
    
    # OUTPUT IMAGE 3: 3NF Analysis Card & Transitive Violation Breakdown (media_1789715064019.png)
    img_3nf_path = "/Users/rajmishara/.gemini/antigravity-ide/brain/cb36b303-314d-444e-bd7f-cd0f8945906d/.user_uploaded/media_1789715064019.png"
    if os.path.exists(img_3nf_path):
        p_img = doc.add_paragraph()
        p_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_img.add_run().add_picture(img_3nf_path, width=Inches(6.0))
        add_caption(doc, "Figure 8: Third Normal Form (3NF) Analysis View Highlighting 3NF Violation Badge, Transitive Chain, and Decomposition Strategy")
    
    add_body_p(doc, 
        "Figure 8 showcases the Third Normal Form (3NF) analytical output card. The engine evaluates the 3NF condition (X must be a superkey OR A must be prime). "
        "It clearly identifies the transitive dependency chain: StaffNo → BranchNo → BAddress, highlighting the violation on BranchNo → BAddress "
        "(Determinant BranchNo is not a superkey, and dependent BAddress is non-prime). The card immediately proposes a 3NF decomposition strategy."
    )
    
    # OUTPUT IMAGE 4: Formal Decomposition Engine & Tableau Chase Lossless Verification (media_1789713425217.png)
    img_decomp_path = "/Users/rajmishara/.gemini/antigravity-ide/brain/cb36b303-314d-444e-bd7f-cd0f8945906d/.user_uploaded/media_1789713425217.png"
    if os.path.exists(img_decomp_path):
        p_img = doc.add_paragraph()
        p_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_img.add_run().add_picture(img_decomp_path, width=Inches(6.0))
        add_caption(doc, "Figure 9: Formal Decomposition & Normalization Engine with Target Normal Form Selectors and Tableau Chase Lossless Verification")
    
    add_body_p(doc, 
        "Figure 9 depicts the Formal Decomposition Engine. The engine allows students to select target normal forms (2NF, 3NF, 4NF) and executes "
        "the Tableau Chase lossless-join test. As proven in the verification panel, the decomposition guarantees a lossless join (No Spurious Tuples) "
        "and 100% dependency preservation, providing complete academic reassurance."
    )
    
    # -------------------------------------------------------------
    # 11. Core Functionality Implemented
    # -------------------------------------------------------------
    add_heading_1(doc, "11. Core Functionality Implemented")
    add_body_p(doc, "The following core functionalities have been fully implemented, integrated, and verified:")
    add_bullet_item(doc, "✓ Dual-Mode Schema Input: ", "Visual guided builder and raw text editor with live bidirectional synchronization.")
    add_bullet_item(doc, "✓ Deterministic Closure Solver: ", "Armstrong fixpoint expansion of X⁺ with step-by-step trace generation.")
    add_bullet_item(doc, "✓ Power-Set Candidate Key Explorer: ", "Lattice-based discovery of all minimal superkeys with composite key support.")
    add_bullet_item(doc, "✓ Prime/Non-Prime Partitioning: ", "Automated classification of all schema attributes.")
    add_bullet_item(doc, "✓ 1NF Evaluation: ", "Cell-level atomicity and repeating group verification.")
    add_bullet_item(doc, "✓ 2NF Evaluation: ", "Partial functional dependency detection against composite candidate keys.")
    add_bullet_item(doc, "✓ 3NF Evaluation: ", "Transitive dependency detection with superkey determinant and prime dependent verification.")
    add_bullet_item(doc, "✓ 4NF Evaluation: ", "Multivalued dependency (MVD) analysis verifying superkey determinants.")
    add_bullet_item(doc, "✓ Formal 3NF Synthesis (Bernstein's Algorithm): ", "Dependency-preserving and lossless decomposition generator.")
    add_bullet_item(doc, "✓ Tableau Chase Lossless-Join Engine: ", "Matrix symbol equating algorithm proving absence of spurious tuples.")
    add_bullet_item(doc, "✓ Dependency Preservation Verifier: ", "Projected dependency coverage algorithm ((⋃ Fᵢ)⁺ ⊇ F).")
    add_bullet_item(doc, "✓ Interactive Dependency Graph: ", "React Flow visualization with zoom, pan, minimap, and violation highlighting.")
    add_bullet_item(doc, "✓ Closure Lab & Derivation Stepper: ", "Interactive visual step-by-step playback of attribute closure expansion.")
    add_bullet_item(doc, "✓ What-If Experimentation Sandbox: ", "Isolated schema mutation and real-time mathematical diff calculation.")
    add_bullet_item(doc, "✓ Contextual Deterministic Assistant: ", "Zero-cost, hallucination-free AST question-answering assistant.")
    add_bullet_item(doc, "✓ Pedagogical Practice Mode: ", "10-exercise interactive curriculum bank with instant grading.")
    add_bullet_item(doc, "✓ Multi-Format Report Generator: ", "Client-side and server-side PDF, Word (.docx), and plain text (.txt) exports.")
    add_bullet_item(doc, "✓ Day/Night Accessible Theme Engine: ", "Persistent light and dark mode adhering to WCAG 2.1 AA standards.")
    
    # -------------------------------------------------------------
    # 12. Testing
    # -------------------------------------------------------------
    add_heading_1(doc, "12. Testing")
    add_body_p(doc, 
        "The application has undergone exhaustive automated unit, integration, and regression testing. "
        "The test suite spans 177 automated test cases in the backend and comprehensive React component tests in the frontend."
    )
    
    test_table = doc.add_table(rows=8, cols=4)
    test_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(test_table, color="94A3B8", sz="6")
    test_widths = [Inches(1.8), Inches(2.2), Inches(1.8), Inches(1.1)]
    for row in test_table.rows:
        for idx, width in enumerate(test_widths):
            row.cells[idx].width = width
            set_cell_margins(row.cells[idx], top=80, bottom=80, left=120, right=120)
            
    headers = ["Test Suite Module", "Target Functionality Verified", "Representative Test Scenarios", "Status"]
    for idx, text in enumerate(headers):
        cell = test_table.cell(0, idx)
        set_cell_background(cell, "1E3A8A")
        p = cell.paragraphs[0]; p.paragraph_format.space_after = Pt(0)
        r = p.add_run(text); r.font.bold = True; r.font.color.rgb = RGBColor(255, 255, 255)
        
    test_rows_data = [
        ("test_closure_engine.py", "Attribute Closure X+", "Identity closure, transitivity chains, cyclic FDs, full schema reachability", "PASSED (100%)"),
        ("test_candidate_key_engine.py", "Candidate Key Discovery", "Single keys, composite keys, multiple overlapping keys, all-attribute keys", "PASSED (100%)"),
        ("test_normalization_engine.py", "1NF to 4NF Normal Form Engine", "Partial dependencies in 2NF, transitive chains in 3NF, MVD violations in 4NF", "PASSED (100%)"),
        ("test_lossless_join.py", "Tableau Chase Test", "Standard textbook lossy joins, lossless 3NF/BCNF chase matrix derivations", "PASSED (100%)"),
        ("test_dependency_preservation.py", "Dependency Preservation", "Bernstein preserved decompositions vs non-preserving BCNF edge cases", "PASSED (100%)"),
        ("test_raw_parser.py", "Input Validation & Grammar", "Malformed arrows, missing determinants, unregistered attribute references", "PASSED (100%)"),
        ("test_phase10_reports.py", "Multi-Format Export Engine", "Byte-level verification of PDF, DOCX, and TXT report generators", "PASSED (100%)")
    ]
    
    for row_idx, (m_name, target, scen, stat) in enumerate(test_rows_data, start=1):
        r_cells = test_table.rows[row_idx].cells
        if row_idx % 2 == 1:
            for c in r_cells: set_cell_background(c, "F8FAFC")
        r_cells[0].paragraphs[0].add_run(m_name).font.bold = True
        r_cells[1].paragraphs[0].add_run(target)
        r_cells[2].paragraphs[0].add_run(scen)
        r_stat = r_cells[3].paragraphs[0].add_run(stat)
        r_stat.font.bold = True
        r_stat.font.color.rgb = RGBColor(16, 185, 129)
        for c in r_cells:
            c.paragraphs[0].paragraph_format.space_after = Pt(0)
            c.paragraphs[0].runs[0].font.size = Pt(9.5)
            
    add_caption(doc, "Table 1: Comprehensive Automated Testing Suite Coverage and Validation Results (177 Passing Tests)")
    
    # -------------------------------------------------------------
    # 13. Creativity & Additional Features
    # -------------------------------------------------------------
    add_heading_1(doc, "13. Creativity & Additional Features")
    add_body_p(doc, 
        "Beyond the mandatory requirements, Normalization Lab incorporates extensive creative and innovative features "
        "specifically designed to transform abstract database theory into an engaging, interactive laboratory experience:"
    )
    
    # 13.1 What-If / Experiment Mode
    add_heading_2(doc, "13.1 What-If / Experiment Mode (Safe Relational Sandbox)")
    add_body_p(doc, 
        "The What-If / Experiment Mode provides an isolated memory sandbox where students can experiment with schema alterations "
        "without corrupting their active problem draft. Students can add, remove, or modify functional dependencies and attributes, "
        "and immediately execute an experiment to inspect a real-time mathematical diff of how normal form status, candidate keys, and closures shift."
    )
    
    # EMBED IMAGE 2 (BATCH 2): What-If Experiment Mode
    img6_path = "/Users/rajmishara/.gemini/antigravity-ide/brain/cb36b303-314d-444e-bd7f-cd0f8945906d/.user_uploaded/media_1789713662522.png"
    if os.path.exists(img6_path):
        p_img = doc.add_paragraph()
        p_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_img.add_run().add_picture(img6_path, width=Inches(6.0))
        add_caption(doc, "Figure 10: What-If / Experiment Mode Safe Sandbox Showing Working Copy Editor, Dependency Modification, and Diff Analyzer")
    
    add_bullet_item(doc, "Immutable Active Draft: ", "The user's original schema remains safely locked in the background while the working copy is mutated.")
    add_bullet_item(doc, "Instant Impact Analysis: ", "Demonstrates cause-and-effect in database design—such as showing how adding 'BranchNo -> BAddress' instantly drops a relation from 3NF down to 2NF.")
    add_bullet_item(doc, "Snapshot Bookmarking: ", "Allows students to capture point-in-time snapshots of hypothetical schemas and compare them side-by-side.")
    
    # 13.2 Deterministic Normalization Assistant
    add_heading_2(doc, "13.2 Contextual Normalization Assistant (Deterministic AI)")
    add_body_p(doc, 
        "To provide instant contextual guidance without incurring recurring API fees or exposing students to LLM hallucinations, "
        "we developed a custom deterministic assistant. The assistant is directly grounded in the relational AST and analysis cache."
    )
    
    # EMBED IMAGE 3 (BATCH 2): Assistant Panel
    img7_path = "/Users/rajmishara/.gemini/antigravity-ide/brain/cb36b303-314d-444e-bd7f-cd0f8945906d/.user_uploaded/media_1789713683569.png"
    if os.path.exists(img7_path):
        p_img = doc.add_paragraph()
        p_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_img.add_run().add_picture(img7_path, width=Inches(3.8))
        add_caption(doc, "Figure 11: Deterministic Contextual Normalization Assistant Delivering Grounded Explanations Without LLM Dependencies")
    
    add_bullet_item(doc, "Zero-Hallucination Guarantee: ", "Every explanation is synthesized directly from verified mathematical sets (candidate keys, closures, prime attribute lists) computed by the backend engine.")
    add_bullet_item(doc, "Pre-Built Analytical Prompts: ", "Offers quick prompts including 'Why is 3NF failing?', 'What are my candidate keys?', and 'How do I decompose this relation?'.")
    add_bullet_item(doc, "Zero Cost & Complete Privacy: ", "Functions entirely without third-party LLM API keys, running locally or on edge servers at zero ongoing cost.")
    
    # 13.3 DBMS Normalization Practice Mode
    add_heading_2(doc, "13.3 DBMS Normalization Practice Mode")
    add_body_p(doc, 
        "To empower students to test their understanding before examinations, Normalization Lab features an interactive Practice Mode. "
        "It includes a curated bank of 10 curriculum-aligned problems spanning candidate key derivation, attribute closure calculations, "
        "highest normal form identification, transitive dependency isolation, and multivalued dependency analysis."
    )
    
    # EMBED IMAGE 4 (BATCH 2): Practice Mode
    img8_path = "/Users/rajmishara/.gemini/antigravity-ide/brain/cb36b303-314d-444e-bd7f-cd0f8945906d/.user_uploaded/media_1789713719651.png"
    if os.path.exists(img8_path):
        p_img = doc.add_paragraph()
        p_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_img.add_run().add_picture(img8_path, width=Inches(6.0))
        add_caption(doc, "Figure 12: DBMS Normalization Practice Mode Featuring 10 Curriculum Problems, Pedagogical Hints, and Instant Grading")
    
    add_bullet_item(doc, "10 Curriculum Problem Bank: ", "Covers classic university scenarios (Student Enrollment, Vehicle Registry, Flight Booking, Restaurant Delivery, etc.).")
    add_bullet_item(doc, "Pedagogical Hints: ", "Provides progressive clues explaining the theoretical principles without immediately giving away the answer.")
    add_bullet_item(doc, "Engine-Powered Instant Grading: ", "Student selections are verified directly by the actual relational mathematical engine, providing detailed explanations upon submission.")
    
    # 13.4 Additional Creative Innovations
    add_heading_2(doc, "13.4 Additional Architectural & Visual Innovations")
    add_bullet_item(doc, "Interactive Dependency Graph (React Flow): ", "Dynamic canvas with auto-layout, zoom/pan controls, minimap navigation, and color-coded node states (Golden Key, Blue Non-Prime, Red Violations).")
    add_bullet_item(doc, "Closure Lab & Stepper Playback: ", "Dedicated visual laboratory showing the step-by-step expansion of attribute closure X⁺ sweep by sweep.")
    add_bullet_item(doc, "WCAG 2.1 AA Compliant Day/Night Mode: ", "Seamless global theme toggle with tailored HSL color palettes preserving graph readability.")
    
    # -------------------------------------------------------------
    # 14. Challenges Faced and Solutions
    # -------------------------------------------------------------
    add_heading_1(doc, "14. Challenges Faced and Solutions")
    add_body_p(doc, "Developing a rigorous, zero-hallucination normalization platform presented several deep engineering and theoretical challenges:")
    add_bullet_item(doc, "Challenge 1 - Combinatorial Explosion in Candidate Key Discovery: ", "For schemas with 10+ attributes, naive power set exploration requires testing 2¹⁰ = 1024 subsets. Solution: Implemented a binary lattice search sorted by cardinality, aggressively pruning all supersets of any discovered minimal superkey, reducing computation time by over 95%.")
    add_bullet_item(doc, "Challenge 2 - Real-Time Tableau Chase Equivalence Algorithm: ", "Implementing an automated Tableau Chase matrix solver that handles arbitrary schemas and multi-attribute dependencies without infinite loops. Solution: Engineered an s × n matrix equating engine that tracks symbol substitutions and stops as soon as a row contains all distinguished symbols a_j or a fixpoint with no further substitutions occurs.")
    add_bullet_item(doc, "Challenge 3 - Dual-Mode Input State Synchronization: ", "Keeping free-form raw text and visual structured cards perfectly synchronized in real time without cursor jumping or race conditions. Solution: Designed a single source of truth in React state coupled with an LL(1) tokenizer that re-validates the AST upon debounced text changes.")
    add_bullet_item(doc, "Challenge 4 - Deterministic Assistance Without Paid LLM APIs: ", "Providing an intelligent chatbot experience without recurring API costs or hallucinations. Solution: Built an AST pattern-matching query resolver that inspects active closures and candidate keys to synthesize grammatically sound, mathematically guaranteed answers.")
    
    # -------------------------------------------------------------
    # 15. Future Enhancements
    # -------------------------------------------------------------
    add_heading_1(doc, "15. Future Enhancements")
    add_body_p(doc, "Potential avenues for future academic and technical expansion include:")
    add_bullet_item(doc, "1. Fifth Normal Form (5NF / PJNF) Support: ", "Extending the decomposition engine to evaluate Join Dependencies (⋈[R₁, R₂, ..., Rₖ]) and verify 5NF / Project-Join Normal Form.")
    add_bullet_item(doc, "2. Automated SQL DDL Generation: ", "Generating production-ready PostgreSQL, MySQL, and Oracle DDL scripts with primary and foreign key constraints for all synthesized 3NF/4NF sub-relations.")
    add_bullet_item(doc, "3. Live Database Connection: ", "Allowing students to connect to live SQL databases via JDBC/ODBC to inspect real catalog metadata and test live tables.")
    add_bullet_item(doc, "4. Multi-Student Collaborative Rooms: ", "Introducing WebSocket-based real-time collaboration enabling student study groups and instructors to solve normalization problems simultaneously on a shared canvas.")
    
    # -------------------------------------------------------------
    # 16. Conclusion
    # -------------------------------------------------------------
    add_heading_1(doc, "16. Conclusion")
    add_body_p(doc, 
        "Normalization Lab successfully bridges the divide between abstract relational database theory and practical software engineering. "
        "By delivering an interactive, deterministic platform that couples rigorous mathematical solvers with cutting-edge web visualizations, "
        "the project demystifies First Normal Form through Fourth Normal Form for students and educators alike. "
        "The application provides complete transparency into candidate key discovery, attribute closures, deductive normal form proofs, "
        "Tableau Chase lossless join verification, and dependency-preserving decompositions. "
        "With its integrated curriculum syllabus, comprehensive user manual, multi-format academic report exports, isolated What-If sandbox, "
        "deterministic AI assistant, and interactive practice bank, Normalization Lab establishes a new benchmark for computer science educational tools."
    )
    
    # -------------------------------------------------------------
    # 17. References
    # -------------------------------------------------------------
    add_heading_1(doc, "17. References")
    add_bullet_item(doc, "[1] ", "Silberschatz, A., Korth, H. F., & Sudarshan, S. (2020). Database System Concepts (7th ed.). McGraw-Hill Education. Chapters 7 & 8: Relational Database Design.")
    add_bullet_item(doc, "[2] ", "Elmasri, R., & Navathe, S. B. (2016). Fundamentals of Database Systems (7th ed.). Pearson. Chapter 14: Basics of Functional Dependencies and Normalization.")
    add_bullet_item(doc, "[3] ", "Ramakrishnan, R., & Gehrke, J. (2003). Database Management Systems (3rd ed.). McGraw-Hill. Chapter 19: Schema Refinement and Normal Forms.")
    add_bullet_item(doc, "[4] ", "Codd, E. F. (1970). A Relational Model of Data for Large Shared Data Banks. Communications of the ACM, 13(6), 377–387. https://doi.org/10.1145/362384.362685")
    add_bullet_item(doc, "[5] ", "Codd, E. F. (1972). Further Normalization of the Data-Base Relational Model. Courant Computer Science Symposia 6: Data Base Systems, Prentice-Hall, pp. 33–64.")
    add_bullet_item(doc, "[6] ", "Fagin, R. (1977). Multivalued Dependencies and a New Normal Form for Relational Databases. ACM Transactions on Database Systems, 2(3), 262–278. https://doi.org/10.1145/320557.320571")
    add_bullet_item(doc, "[7] ", "Bernstein, P. A. (1976). Synthesizing Third Normal Form Relations from Functional Dependencies. ACM Transactions on Database Systems, 1(4), 277–298. https://doi.org/10.1145/320493.320498")
    add_bullet_item(doc, "[8] ", "Widom, J. (2023). Stanford InfoLab CS145: Introduction to Databases - Relational Design Theory. Stanford University School of Engineering. https://web.stanford.edu/class/cs145/")
    add_bullet_item(doc, "[9] ", "Madden, S. (2010). MIT OpenCourseWare 6.830: Database Systems - Normalization and Tableau Chase. Massachusetts Institute of Technology. https://ocw.mit.edu/courses/6-830-database-systems-fall-2010/")
    add_bullet_item(doc, "[10] ", "Pavlo, A. (2023). CMU 15-445/645: Database Systems - Relational Storage and Normalization Anomalies. Carnegie Mellon University Database Group. https://15445.courses.cs.cmu.edu/")
    add_bullet_item(doc, "[11] ", "YouTube Educational Lecture: Comprehensive DBMS Normalization Lecture (1NF through 4NF & 5NF). https://youtu.be/GFQaEYEc8_8?si=BrW8ZzglClywsFC4")
    
    # Save document
    out_path_root = "/Users/rajmishara/dbmsProject/Digital_Assignment_DA_Project_Submission_Report.docx"
    out_path_brain = "/Users/rajmishara/.gemini/antigravity-ide/brain/cb36b303-314d-444e-bd7f-cd0f8945906d/Digital_Assignment_DA_Project_Submission_Report.docx"
    
    doc.save(out_path_root)
    doc.save(out_path_brain)
    print(f"Updated report successfully generated at: {out_path_root}")
    print(f"Updated report successfully copied to: {out_path_brain}")

if __name__ == "__main__":
    generate_report()
