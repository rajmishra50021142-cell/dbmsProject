"""
Report Builder for Normalization Lab.
Generates comprehensive academic reports in TXT, DOCX, and PDF formats
directly from the active FullNormalizationAnalysisResult and RelationSchema.
"""

from __future__ import annotations
import io
import re
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

# python-docx
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import parse_xml
from docx.oxml.ns import nsdecls

# reportlab
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    HRFlowable,
)


class ReportSectionSelection(BaseModel):
    """Flags determining which sections to include in the generated report."""
    user_inputs: bool = Field(default=True, description="Include original relation, attributes, keys, and dependencies")
    processing_steps: bool = Field(default=True, description="Include execution trace and algorithm steps")
    intermediate_results: bool = Field(default=True, description="Include candidate keys, prime/non-prime attrs, closures, and violations")
    final_output: bool = Field(default=True, description="Include 1NF-4NF status summary and highest confirmed normal form")
    decomposition: bool = Field(default=True, description="Include decomposed sub-relations and lineage")
    verification: bool = Field(default=True, description="Include lossless-join tableau and dependency preservation verification")
    figures: bool = Field(default=True, description="Include ASCII/structural figures for journey, graphs, and trees")


class ReportMetadata(BaseModel):
    """Report header and institutional metadata."""
    project_title: str = "DBMS Normalization Laboratory (1NF–4NF Analyzer)"
    guide_name: str = "Dr. Swaminathan A"
    guide_designation: str = "Assistant Professor"
    department: str = "Department of Computer Science and Engineering"
    institution: str = "School of Computer Science and Engineering"
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC"))


def sanitize_filename(relation_name: str, ext: str) -> str:
    """Sanitize relation name for filesystem-safe filename."""
    cleaned = re.sub(r'[^a-zA-Z0-9_\-]', '_', relation_name or 'Relation')
    cleaned = re.sub(r'_+', '_', cleaned).strip('_')
    if not cleaned:
        cleaned = "Relation"
    return f"normalization-report-{cleaned}.{ext}"


def _format_dep(dep: Any) -> str:
    """Safely format an FD or MVD dictionary/object."""
    if isinstance(dep, dict):
        lhs = ", ".join(dep.get("left", []))
        rhs = ", ".join(dep.get("right", []))
        is_mvd = dep.get("is_multivalued", False) or dep.get("kind") == "mvd"
        arrow = "↠" if is_mvd else "→"
        return f"{lhs} {arrow} {rhs}"
    if hasattr(dep, "left") and hasattr(dep, "right"):
        lhs = ", ".join(dep.left)
        rhs = ", ".join(dep.right)
        is_mvd = getattr(dep, "is_multivalued", False)
        arrow = "↠" if is_mvd else "→"
        return f"{lhs} {arrow} {rhs}"
    return str(dep)


def _format_key(key: Any) -> str:
    if isinstance(key, list):
        return f"({', '.join(key)})"
    return str(key)


def _format_step_text(step: Any) -> str:
    if isinstance(step, dict):
        return step.get("explanation") or step.get("description") or step.get("title") or str(step)
    return str(step)


# =====================================================================
# 1. TEXT REPORT GENERATOR
# =====================================================================

def generate_text_report(
    schema: Dict[str, Any],
    result: Dict[str, Any],
    sections: Optional[ReportSectionSelection] = None,
) -> str:
    """Generate a clean, linear academic report in plain text."""
    if sections is None:
        sections = ReportSectionSelection()

    meta = ReportMetadata()
    rel_name = schema.get("name") or schema.get("relation_name") or result.get("relation_name", "R")
    attributes = schema.get("attributes", [])
    highest_nf = result.get("highest_confirmed_normal_form", "UNKNOWN")

    lines: List[str] = []

    # Title & Metadata
    lines.append("=" * 76)
    lines.append(f"{meta.project_title.upper()}")
    lines.append(f"ACADEMIC EVALUATION & TECHNICAL REPORT")
    lines.append("=" * 76)
    lines.append(f"Generated Date : {meta.timestamp}")
    lines.append(f"Project Guide  : {meta.guide_name}, {meta.guide_designation}")
    lines.append(f"Institution    : {meta.institution}")
    lines.append(f"Target Relation: {rel_name}")
    lines.append(f"Highest NF     : {highest_nf}")
    lines.append("-" * 76)
    lines.append("")

    # 1. User Inputs
    if sections.user_inputs:
        lines.append("1. USER INPUT SPECIFICATION")
        lines.append("-" * 40)
        lines.append(f"Relation Name        : {rel_name}")
        lines.append(f"Attributes ({len(attributes)})        : {', '.join(attributes)}")

        cand_keys = schema.get("candidate_keys") or []
        if cand_keys:
            lines.append(f"User Candidate Keys  : {', '.join(_format_key(k) for k in cand_keys)}")
        else:
            lines.append("User Candidate Keys  : [None specified - computed via attribute closure]")

        fds = schema.get("functional_dependencies") or []
        lines.append(f"Functional Deps ({len(fds)}):")
        if fds:
            for i, fd in enumerate(fds, 1):
                lines.append(f"   [{i}] {_format_dep(fd)}")
        else:
            lines.append("   (None provided)")

        mvds = schema.get("multivalued_dependencies") or []
        if mvds:
            lines.append(f"Multivalued Deps ({len(mvds)}):")
            for i, mvd in enumerate(mvds, 1):
                lines.append(f"   [{i}] {_format_dep(mvd)}")

        sample_data = schema.get("sample_data") or []
        if sample_data:
            lines.append(f"Sample Tuples ({len(sample_data)}): Provided for 1NF atomicity verification")
        lines.append("")

    # 2. Intermediate Results
    if sections.intermediate_results:
        lines.append("2. INTERMEDIATE MATHEMATICAL DERIVATIONS")
        lines.append("-" * 40)
        res_keys = result.get("candidate_keys") or []
        lines.append(f"Confirmed Candidate Keys : {', '.join(_format_key(k) for k in res_keys) if res_keys else 'None'}")
        lines.append(f"Prime Attributes         : {', '.join(result.get('prime_attributes', [])) or 'None'}")
        lines.append(f"Non-Prime Attributes     : {', '.join(result.get('non_prime_attributes', [])) or 'None'}")

        # Closures if any reasoning steps recorded
        nf2 = result.get("nf2") or {}
        partials = nf2.get("partial_dependencies") or []
        if partials:
            lines.append(f"2NF Partial Dependencies ({len(partials)}):")
            for p in partials:
                det = ", ".join(p.get("determinant", []))
                dep_attrs = ", ".join(p.get("dependent_attributes", []))
                lines.append(f"   * {det} -> {dep_attrs} (violates 2NF: determinant is proper subset of key)")

        nf3 = result.get("nf3") or {}
        nf3_viols = nf3.get("violations") or []
        if nf3_viols:
            lines.append(f"3NF Violations ({len(nf3_viols)}):")
            for v in nf3_viols:
                det = ", ".join(v.get("determinant", []))
                dep_attrs = ", ".join(v.get("dependent_attributes", []))
                lines.append(f"   * {det} -> {dep_attrs} (violates 3NF: determinant is not superkey, RHS non-prime)")

        nf4 = result.get("nf4") or {}
        nf4_viols = nf4.get("violations") or []
        if nf4_viols:
            lines.append(f"4NF Violations ({len(nf4_viols)}):")
            for v in nf4_viols:
                det = ", ".join(v.get("determinant", []))
                dep_attrs = ", ".join(v.get("dependent_attributes", []))
                lines.append(f"   * {det} ->> {dep_attrs} (violates 4NF: non-trivial MVD with non-superkey determinant)")
        lines.append("")

    # 3. Processing Steps & Reasoning Traces
    if sections.processing_steps:
        lines.append("3. PROCESSING STEPS & REASONING TRACES")
        lines.append("-" * 40)
        step_counter = 1
        for stage_name, stage_obj in [("1NF", result.get("nf1")), ("2NF", result.get("nf2")), ("3NF", result.get("nf3")), ("4NF", result.get("nf4"))]:
            if not stage_obj:
                continue
            steps = stage_obj.get("reasoning_steps") or []
            lines.append(f"[{stage_name} Evaluation Trace]")
            if steps:
                for step in steps:
                    desc = _format_step_text(step)
                    lines.append(f"   {step_counter}. {desc}")
                    step_counter += 1
            else:
                msg = stage_obj.get("message") or "Stage completed."
                lines.append(f"   {step_counter}. {msg}")
                step_counter += 1
        lines.append("")

    # 4. Final Output Verdicts
    if sections.final_output:
        lines.append("4. NORMALIZATION EVALUATION VERDICTS")
        lines.append("-" * 40)
        table_fmt = "{:<8} | {:<22} | {}"
        lines.append(table_fmt.format("STAGE", "STATUS", "PRIMARY FINDING"))
        lines.append("-" * 76)
        for stage_key, label in [("nf1", "1NF"), ("nf2", "2NF"), ("nf3", "3NF"), ("nf4", "4NF")]:
            stage_data = result.get(stage_key) or {}
            status = stage_data.get("status", "NOT_VERIFIED")
            msg = stage_data.get("message", "No evaluation details")
            lines.append(table_fmt.format(label, status, msg))
        lines.append("-" * 76)
        lines.append(f"HIGHEST CONFIRMED NORMAL FORM : {highest_nf}")
        lines.append(f"SUMMARY VERDICT               : {result.get('summary_verdict', 'Analysis complete.')}")
        lines.append("")

    # 5. Decomposition Proposals
    if sections.decomposition:
        lines.append("5. DECOMPOSITION PROPOSALS & RELATION SCHEMAS")
        lines.append("-" * 40)
        decompositions_found = False
        for stage_key, label in [("nf2", "2NF"), ("nf3", "3NF"), ("nf4", "4NF")]:
            stage_data = result.get(stage_key) or {}
            prop = stage_data.get("decomposition_proposal")
            if prop:
                decompositions_found = True
                sub_rels = prop.get("decomposed_relations") or prop.get("proposed_relations") or []
                lines.append(f"Stage {label} Decomposition Proposal:")
                for r in sub_rels:
                    r_name = r.get("name", "SubRelation")
                    r_attrs = ", ".join(r.get("attributes", []))
                    lines.append(f"   * {r_name}({r_attrs})")
                if prop.get("reasoning"):
                    lines.append(f"   Reasoning: {prop['reasoning']}")

        if not decompositions_found:
            lines.append("No decomposition required; the relation satisfies its highest targeted normal form.")
        lines.append("")

    if sections.verification:
        lines.append("6. FORMAL RECONSTRUCTION & PRESERVATION VERIFICATION")
        lines.append("-" * 40)
        lossless = result.get("lossless_join")
        if lossless:
            is_ll = lossless.get("is_lossless", False)
            method = lossless.get("method", "TABLEAU_CHASE")
            lines.append(f"Lossless Join Verification     : {'PASSED (Lossless)' if is_ll else 'FAILED (Lossy)'}")
            lines.append(f"Verification Algorithm         : {method}")
            if lossless.get("reasoning"):
                lines.append(f"Explanation                    : {lossless['reasoning']}")

        dep_pres = result.get("dependency_preservation")
        if dep_pres:
            is_pres = dep_pres.get("is_preserved", False)
            lines.append(f"Dependency Preservation        : {'PASSED (All dependencies preserved)' if is_pres else 'FAILED (Dependencies lost)'}")
            if dep_pres.get("reasoning"):
                lines.append(f"Explanation                    : {dep_pres['reasoning']}")

        if not lossless and not dep_pres:
            lines.append("Formal verification applies to proposed sub-relation decompositions.")
        lines.append("")

    # 7. Figures / Diagrams (ASCII representation)
    if sections.figures:
        lines.append("7. ARCHITECTURAL FIGURES & SCHEMATICS")
        lines.append("-" * 40)
        lines.append("[Figure 1: Normalization Progression Journey]")
        s1 = result.get("nf1", {}).get("status", "SATISFIED")
        s2 = result.get("nf2", {}).get("status", "VIOLATED")
        s3 = result.get("nf3", {}).get("status", "BLOCKED")
        s4 = result.get("nf4", {}).get("status", "BLOCKED")
        lines.append(f"   [1NF: {s1}] ---> [2NF: {s2}] ---> [3NF: {s3}] ---> [4NF: {s4}]")
        lines.append("")
        lines.append("[Figure 2: Functional Dependency Map]")
        for fd in (schema.get("functional_dependencies") or []):
            lines.append(f"   ({', '.join(fd.get('left', []))}) =======> ({', '.join(fd.get('right', []))})")
        lines.append("")

    lines.append("=" * 76)
    lines.append("END OF NORMALIZATION LAB REPORT")
    lines.append("=" * 76)

    return "\n".join(lines)


# =====================================================================
# 2. DOCX REPORT GENERATOR
# =====================================================================

def generate_docx_report(
    schema: Dict[str, Any],
    result: Dict[str, Any],
    sections: Optional[ReportSectionSelection] = None,
) -> io.BytesIO:
    """Generate a styled Microsoft Word (.docx) report using python-docx."""
    if sections is None:
        sections = ReportSectionSelection()

    meta = ReportMetadata()
    rel_name = schema.get("name") or schema.get("relation_name") or result.get("relation_name", "R")
    attributes = schema.get("attributes", [])
    highest_nf = result.get("highest_confirmed_normal_form", "UNKNOWN")

    doc = docx.Document()

    sections_doc = doc.sections
    for s in sections_doc:
        s.top_margin = Inches(0.8)
        s.bottom_margin = Inches(0.8)
        s.left_margin = Inches(0.8)
        s.right_margin = Inches(0.8)

    title_p = doc.add_paragraph()
    title_run = title_p.add_run(meta.project_title)
    title_run.font.size = Pt(18)
    title_run.font.bold = True
    title_run.font.color.rgb = RGBColor(30, 58, 138)
    title_p.paragraph_format.space_after = Pt(2)

    sub_p = doc.add_paragraph()
    sub_run = sub_p.add_run("Formal Normalization Analysis & Verification Report")
    sub_run.font.size = Pt(12)
    sub_run.font.italic = True
    sub_run.font.color.rgb = RGBColor(100, 116, 139)
    sub_p.paragraph_format.space_after = Pt(14)

    # Metadata Table
    meta_table = doc.add_table(rows=4, cols=2)
    meta_table.alignment = WD_TABLE_ALIGNMENT.CENTER

    rows_data = [
        ("Target Relation", f"{rel_name}({', '.join(attributes)})"),
        ("Highest Normal Form", str(highest_nf)),
        ("Academic Guide", f"{meta.guide_name} ({meta.guide_designation})"),
        ("Generated Timestamp", meta.timestamp),
    ]

    for i, (k, v) in enumerate(rows_data):
        cell_k, cell_v = meta_table.rows[i].cells
        cell_k.text = k
        cell_v.text = v
        cell_k.paragraphs[0].runs[0].font.bold = True
        cell_k.paragraphs[0].runs[0].font.size = Pt(9.5)
        cell_k.paragraphs[0].runs[0].font.color.rgb = RGBColor(71, 85, 105)
        cell_v.paragraphs[0].runs[0].font.size = Pt(9.5)
        cell_v.paragraphs[0].runs[0].font.color.rgb = RGBColor(15, 23, 42)

    doc.add_paragraph().paragraph_format.space_after = Pt(10)

    # 1. User Inputs
    if sections.user_inputs:
        h1 = doc.add_heading("1. Schema Input Specification", level=1)
        h1.paragraph_format.space_before = Pt(14)
        h1.paragraph_format.space_after = Pt(6)

        p = doc.add_paragraph()
        p.add_run("Relation Name: ").bold = True
        p.add_run(rel_name)

        p = doc.add_paragraph()
        p.add_run(f"Attributes ({len(attributes)}): ").bold = True
        p.add_run(", ".join(attributes))

        fds = schema.get("functional_dependencies") or []
        p = doc.add_paragraph()
        p.add_run(f"Functional Dependencies ({len(fds)}):").bold = True
        if fds:
            for fd in fds:
                bp = doc.add_paragraph(style='List Bullet')
                bp.add_run(_format_dep(fd))
        else:
            doc.add_paragraph("   None defined.")

        mvds = schema.get("multivalued_dependencies") or []
        if mvds:
            p = doc.add_paragraph()
            p.add_run(f"Multivalued Dependencies ({len(mvds)}):").bold = True
            for mvd in mvds:
                bp = doc.add_paragraph(style='List Bullet')
                bp.add_run(_format_dep(mvd))

    # 2. Intermediate Results
    if sections.intermediate_results:
        h2 = doc.add_heading("2. Intermediate Mathematical Derivations", level=1)
        h2.paragraph_format.space_before = Pt(14)
        h2.paragraph_format.space_after = Pt(6)

        p = doc.add_paragraph()
        p.add_run("Candidate Keys: ").bold = True
        c_keys = result.get("candidate_keys") or []
        p.add_run(", ".join(_format_key(k) for k in c_keys) if c_keys else "None")

        p = doc.add_paragraph()
        p.add_run("Prime Attributes: ").bold = True
        primes = result.get("prime_attributes", [])
        p.add_run(", ".join(primes) if primes else "None")

        p = doc.add_paragraph()
        p.add_run("Non-Prime Attributes: ").bold = True
        non_primes = result.get("non_prime_attributes", [])
        p.add_run(", ".join(non_primes) if non_primes else "None")

        nf2 = result.get("nf2") or {}
        partials = nf2.get("partial_dependencies") or []
        if partials:
            doc.add_paragraph().add_run("Detected 2NF Partial Dependencies:").bold = True
            for p_dep in partials:
                bp = doc.add_paragraph(style='List Bullet')
                det = ", ".join(p_dep.get("determinant", []))
                dep_attrs = ", ".join(p_dep.get("dependent_attributes", []))
                bp.add_run(f"{det} → {dep_attrs} (Partial dependency on composite key subset)")

        nf3 = result.get("nf3") or {}
        nf3_viols = nf3.get("violations") or []
        if nf3_viols:
            doc.add_paragraph().add_run("Detected 3NF Violations:").bold = True
            for v in nf3_viols:
                bp = doc.add_paragraph(style='List Bullet')
                det = ", ".join(v.get("determinant", []))
                dep_attrs = ", ".join(v.get("dependent_attributes", []))
                bp.add_run(f"{det} → {dep_attrs} (Determinant is not superkey and dependent is non-prime)")

    # 3. Processing Steps
    if sections.processing_steps:
        h3 = doc.add_heading("3. Execution Reasoning Trace", level=1)
        h3.paragraph_format.space_before = Pt(14)
        h3.paragraph_format.space_after = Pt(6)

        for stage_name, stage_obj in [("1NF", result.get("nf1")), ("2NF", result.get("nf2")), ("3NF", result.get("nf3")), ("4NF", result.get("nf4"))]:
            if not stage_obj:
                continue
            steps = stage_obj.get("reasoning_steps") or []
            sp = doc.add_paragraph()
            sp.add_run(f"Stage {stage_name} Reasoning:").bold = True
            if steps:
                for s in steps:
                    lp = doc.add_paragraph(style='List Number')
                    exp = _format_step_text(s)
                    lp.add_run(exp)
            else:
                lp = doc.add_paragraph(style='List Number')
                lp.add_run(stage_obj.get("message", "Evaluated successfully."))

    # 4. Final Output Verdicts Table
    if sections.final_output:
        h4 = doc.add_heading("4. Normalization Status Summary", level=1)
        h4.paragraph_format.space_before = Pt(14)
        h4.paragraph_format.space_after = Pt(6)

        table = doc.add_table(rows=5, cols=3)
        table.alignment = WD_TABLE_ALIGNMENT.CENTER

        hdr_cells = table.rows[0].cells
        hdr_cells[0].text = "Stage"
        hdr_cells[1].text = "Status"
        hdr_cells[2].text = "Educational Finding"
        for c in hdr_cells:
            c.paragraphs[0].runs[0].font.bold = True
            c.paragraphs[0].runs[0].font.size = Pt(9.5)
            shading = parse_xml(r'<w:shd {} w:fill="E2E8F0"/>'.format(nsdecls('w')))
            c._tc.get_or_add_tcPr().append(shading)

        stages = [("nf1", "1NF"), ("nf2", "2NF"), ("nf3", "3NF"), ("nf4", "4NF")]
        for idx, (st_key, st_label) in enumerate(stages, 1):
            st_data = result.get(st_key) or {}
            row_cells = table.rows[idx].cells
            row_cells[0].text = st_label
            row_cells[1].text = st_data.get("status", "NOT_VERIFIED")
            row_cells[2].text = st_data.get("message", "No evaluation record")
            for c in row_cells:
                if c.paragraphs[0].runs:
                    c.paragraphs[0].runs[0].font.size = Pt(9)

        doc.add_paragraph().paragraph_format.space_after = Pt(8)
        summary_p = doc.add_paragraph()
        summary_p.add_run("Highest Confirmed Normal Form: ").bold = True
        summary_p.add_run(str(highest_nf))
        v_p = doc.add_paragraph()
        v_p.add_run("Summary Verdict: ").bold = True
        v_p.add_run(result.get("summary_verdict", "Analysis complete."))

    # 5. Decomposition & Verification
    if sections.decomposition:
        h5 = doc.add_heading("5. Proposed Decomposition & Lineage", level=1)
        h5.paragraph_format.space_before = Pt(14)
        h5.paragraph_format.space_after = Pt(6)

        decomp_found = False
        for st_key, st_label in [("nf2", "2NF"), ("nf3", "3NF"), ("nf4", "4NF")]:
            prop = result.get(st_key, {}).get("decomposition_proposal")
            if prop:
                decomp_found = True
                p = doc.add_paragraph()
                p.add_run(f"Stage {st_label} Proposed Relations:").bold = True
                for r in (prop.get("decomposed_relations") or prop.get("proposed_relations") or []):
                    bp = doc.add_paragraph(style='List Bullet')
                    bp.add_run(f"{r.get('name', 'SubRelation')}({', '.join(r.get('attributes', []))})")

        if not decomp_found:
            doc.add_paragraph("No decomposition necessary; relation satisfies target normal form.")

    if sections.verification:
        h6 = doc.add_heading("6. Reconstruction & Dependency Preservation", level=1)
        h6.paragraph_format.space_before = Pt(14)
        h6.paragraph_format.space_after = Pt(6)

        lossless = result.get("lossless_join")
        if lossless:
            p = doc.add_paragraph()
            p.add_run("Lossless Join Verification: ").bold = True
            p.add_run("PASSED (Tableau Chase confirms full row unification)" if lossless.get("is_lossless") else "FAILED")

        dep_pres = result.get("dependency_preservation")
        if dep_pres:
            p = doc.add_paragraph()
            p.add_run("Dependency Preservation: ").bold = True
            p.add_run("PASSED (All FDs locally enforceable)" if dep_pres.get("is_preserved") else "FAILED")

        if not lossless and not dep_pres:
            doc.add_paragraph("Applies to decomposed relations.")

    # 6. Figures / Diagrams
    if sections.figures:
        h7 = doc.add_heading("7. Structural Diagrams & Normalization Graph", level=1)
        h7.paragraph_format.space_before = Pt(14)
        h7.paragraph_format.space_after = Pt(6)

        fig_p = doc.add_paragraph()
        fig_p.add_run("Figure 1: Normalization Progression Sequence").bold = True
        diag_p = doc.add_paragraph()
        diag_p.add_run(
            f"1NF [{result.get('nf1', {}).get('status', 'OK')}]  ──►  "
            f"2NF [{result.get('nf2', {}).get('status', 'FAIL')}]  ──►  "
            f"3NF [{result.get('nf3', {}).get('status', 'BLOCKED')}]  ──►  "
            f"4NF [{result.get('nf4', {}).get('status', 'BLOCKED')}]"
        )
        diag_p.runs[0].font.name = "Courier New"
        diag_p.runs[0].font.size = Pt(9.5)

    buffer = io.BytesIO()
    doc.save(buffer)
    buffer.seek(0)
    return buffer


# =====================================================================
# 3. PDF REPORT GENERATOR
# =====================================================================

def generate_pdf_report(
    schema: Dict[str, Any],
    result: Dict[str, Any],
    sections: Optional[ReportSectionSelection] = None,
) -> io.BytesIO:
    """Generate a clean, professional PDF document using ReportLab."""
    if sections is None:
        sections = ReportSectionSelection()

    meta = ReportMetadata()
    rel_name = schema.get("name") or schema.get("relation_name") or result.get("relation_name", "R")
    attributes = schema.get("attributes", [])
    highest_nf = result.get("highest_confirmed_normal_form", "UNKNOWN")

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        leftMargin=0.7 * inch,
        rightMargin=0.7 * inch,
        topMargin=0.7 * inch,
        bottomMargin=0.7 * inch,
    )

    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontSize=17,
        leading=22,
        textColor=colors.HexColor('#1E3A8A'),
        fontName='Helvetica-Bold',
        spaceAfter=3,
    )
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontSize=10.5,
        leading=14,
        textColor=colors.HexColor('#64748B'),
        fontName='Helvetica-Oblique',
        spaceAfter=12,
    )
    h1_style = ParagraphStyle(
        'SectionH1',
        parent=styles['Heading2'],
        fontSize=12,
        leading=16,
        textColor=colors.HexColor('#0F172A'),
        fontName='Helvetica-Bold',
        spaceBefore=12,
        spaceAfter=6,
    )
    body_style = ParagraphStyle(
        'ReportBody',
        parent=styles['Normal'],
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor('#1E293B'),
        fontName='Helvetica',
    )
    bold_label_style = ParagraphStyle(
        'BoldLabel',
        parent=body_style,
        fontName='Helvetica-Bold',
    )
    code_style = ParagraphStyle(
        'CodeStyle',
        parent=styles['Code'],
        fontSize=8,
        leading=10,
        fontName='Courier',
        textColor=colors.HexColor('#334155'),
    )

    story: List[Any] = []

    # Title Banner
    story.append(Paragraph(meta.project_title, title_style))
    story.append(Paragraph("Academic Normalization Analysis & Formal Verification Report", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#CBD5E1'), spaceAfter=10))

    # Metadata Summary Box
    meta_data = [
        [Paragraph("Target Relation", bold_label_style), Paragraph(f"<b>{rel_name}</b> ({', '.join(attributes)})", body_style)],
        [Paragraph("Highest Normal Form", bold_label_style), Paragraph(f"<b>{highest_nf}</b>", body_style)],
        [Paragraph("Project Guide", bold_label_style), Paragraph(f"{meta.guide_name}, {meta.guide_designation}", body_style)],
        [Paragraph("Generated At", bold_label_style), Paragraph(meta.timestamp, body_style)],
    ]
    meta_table = Table(meta_data, colWidths=[1.8 * inch, 5.0 * inch])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#F8FAFC')),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#F1F5F9')),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 10))

    # 1. User Inputs
    if sections.user_inputs:
        story.append(Paragraph("1. Schema Input Specification", h1_style))
        story.append(Paragraph(f"<b>Relation:</b> {rel_name}", body_style))
        story.append(Paragraph(f"<b>Attributes ({len(attributes)}):</b> {', '.join(attributes)}", body_style))

        fds = schema.get("functional_dependencies") or []
        if fds:
            dep_strings = [_format_dep(fd) for fd in fds]
            story.append(Paragraph(f"<b>Functional Dependencies:</b> {'; '.join(dep_strings)}", body_style))
        else:
            story.append(Paragraph("<b>Functional Dependencies:</b> None provided.", body_style))

        mvds = schema.get("multivalued_dependencies") or []
        if mvds:
            mvd_strings = [_format_dep(m) for m in mvds]
            story.append(Paragraph(f"<b>Multivalued Dependencies:</b> {'; '.join(mvd_strings)}", body_style))
        story.append(Spacer(1, 8))

    # 2. Intermediate Results
    if sections.intermediate_results:
        story.append(Paragraph("2. Intermediate Mathematical Results", h1_style))
        c_keys = result.get("candidate_keys") or []
        story.append(Paragraph(f"<b>Discovered Candidate Keys:</b> {', '.join(_format_key(k) for k in c_keys) if c_keys else 'None'}", body_style))
        story.append(Paragraph(f"<b>Prime Attributes:</b> {', '.join(result.get('prime_attributes', [])) or 'None'}", body_style))
        story.append(Paragraph(f"<b>Non-Prime Attributes:</b> {', '.join(result.get('non_prime_attributes', [])) or 'None'}", body_style))

        nf2 = result.get("nf2") or {}
        partials = nf2.get("partial_dependencies") or []
        if partials:
            p_text = "; ".join(f"{', '.join(p['determinant'])} → {', '.join(p['dependent_attributes'])}" for p in partials)
            story.append(Paragraph(f"<b>2NF Partial Dependencies:</b> {p_text}", body_style))

        nf3 = result.get("nf3") or {}
        nf3_viols = nf3.get("violations") or []
        if nf3_viols:
            v_text = "; ".join(f"{', '.join(v['determinant'])} → {', '.join(v['dependent_attributes'])}" for v in nf3_viols)
            story.append(Paragraph(f"<b>3NF Transitive/Non-Superkey Violations:</b> {v_text}", body_style))
        story.append(Spacer(1, 8))

    # 3. Processing Steps
    if sections.processing_steps:
        story.append(Paragraph("3. Algorithmic Reasoning Traces", h1_style))
        for stage_name, stage_obj in [("1NF", result.get("nf1")), ("2NF", result.get("nf2")), ("3NF", result.get("nf3")), ("4NF", result.get("nf4"))]:
            if not stage_obj:
                continue
            steps = stage_obj.get("reasoning_steps") or []
            if steps:
                step_texts = [f"• {_format_step_text(s)}" for s in steps[:3]]
                story.append(Paragraph(f"<b>{stage_name} Trace:</b> {' '.join(step_texts)}", body_style))
            else:
                story.append(Paragraph(f"<b>{stage_name}:</b> {stage_obj.get('message', 'Completed')}", body_style))
        story.append(Spacer(1, 8))

    # 4. Final Output Verdicts Table
    if sections.final_output:
        story.append(Paragraph("4. Normalization Status Summary", h1_style))
        verdict_data = [
            [Paragraph("<b>Stage</b>", bold_label_style), Paragraph("<b>Status</b>", bold_label_style), Paragraph("<b>Formal Evaluation Finding</b>", bold_label_style)]
        ]
        for st_key, st_label in [("nf1", "1NF"), ("nf2", "2NF"), ("nf3", "3NF"), ("nf4", "4NF")]:
            st_data = result.get(st_key) or {}
            status_str = st_data.get("status", "NOT_VERIFIED")
            msg_str = st_data.get("message", "No evaluation details")
            st_color = "#16A34A" if status_str == "SATISFIED" else ("#DC2626" if status_str == "VIOLATED" else "#D97706")
            status_para = Paragraph(f"<font color='{st_color}'><b>{status_str}</b></font>", body_style)
            verdict_data.append([Paragraph(st_label, body_style), status_para, Paragraph(msg_str, body_style)])

        verdict_table = Table(verdict_data, colWidths=[0.8 * inch, 1.4 * inch, 4.6 * inch])
        verdict_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#E2E8F0')),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E1')),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
            ('LEFTPADDING', (0, 0), (-1, -1), 6),
            ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ]))
        story.append(verdict_table)
        story.append(Spacer(1, 6))
        story.append(Paragraph(f"<b>Highest Confirmed Normal Form:</b> {highest_nf}", body_style))
        story.append(Paragraph(f"<b>Summary Verdict:</b> {result.get('summary_verdict', 'Analysis complete.')}", body_style))
        story.append(Spacer(1, 8))

    # 5. Decomposition & Verification
    if sections.decomposition:
        story.append(Paragraph("5. Proposed Decomposition & Lineage", h1_style))
        decomp_found = False
        for st_key, st_label in [("nf2", "2NF"), ("nf3", "3NF"), ("nf4", "4NF")]:
            prop = result.get(st_key, {}).get("decomposition_proposal")
            if prop:
                decomp_found = True
                rels = prop.get("decomposed_relations") or prop.get("proposed_relations") or []
                rel_strs = [f"{r.get('name', 'R')}({', '.join(r.get('attributes', []))})" for r in rels]
                story.append(Paragraph(f"<b>Stage {st_label} Sub-Relations:</b> {', '.join(rel_strs)}", body_style))
        if not decomp_found:
            story.append(Paragraph("No decomposition necessary; relation satisfies target normal form.", body_style))
        story.append(Spacer(1, 8))

    if sections.verification:
        story.append(Paragraph("6. Formal Reconstruction & Preservation", h1_style))
        lossless = result.get("lossless_join")
        if lossless:
            ll_status = "PASSED (Lossless join confirmed via Tableau Chase)" if lossless.get("is_lossless") else "FAILED (Lossy join)"
            story.append(Paragraph(f"<b>Lossless Join Verification:</b> {ll_status}", body_style))
        dep_pres = result.get("dependency_preservation")
        if dep_pres:
            dp_status = "PASSED (All original dependencies preserved)" if dep_pres.get("is_preserved") else "FAILED (Dependencies lost)"
            story.append(Paragraph(f"<b>Dependency Preservation:</b> {dp_status}", body_style))
        if not lossless and not dep_pres:
            story.append(Paragraph("Formal verification applies when relations are decomposed.", body_style))
        story.append(Spacer(1, 8))

    # 6. Figures / Diagrams
    if sections.figures:
        story.append(Paragraph("7. Normalization Visual Journey Schematic", h1_style))
        s1 = result.get("nf1", {}).get("status", "SATISFIED")
        s2 = result.get("nf2", {}).get("status", "VIOLATED")
        s3 = result.get("nf3", {}).get("status", "BLOCKED")
        s4 = result.get("nf4", {}).get("status", "BLOCKED")
        diag = f"1NF: {s1}  ──►  2NF: {s2}  ──►  3NF: {s3}  ──►  4NF: {s4}"
        story.append(Paragraph(f"<font color='#3B82F6'><b>Journey:</b></font> {diag}", code_style))

    doc.build(story)
    buffer.seek(0)
    return buffer
