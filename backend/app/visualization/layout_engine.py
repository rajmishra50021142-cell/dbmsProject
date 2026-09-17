"""
Deterministic Layout & Graph Transformation Engine for Visualization (Phase 8).

Converts relational database structures, dependencies, candidate keys,
and decomposition plans into graph layouts (nodes and edges) suitable for
React Flow / D3 interactive canvas rendering.
"""

from typing import List, Dict, Set, Optional, Any, Tuple
import math
from app.schemas.domain_contracts import (
    FunctionalDependency,
    MultivaluedDependency,
    VisualizationNode,
    VisualizationEdge,
    VisualizationGraphData,
    ClosureVisualizationStep,
    ClosureVisualizationData,
    DecompositionTreeNode,
    DecompositionPlan,
    ClosureResult,
)
from app.normalization.attribute_set import normalize_attribute_set, to_attribute_set
from app.normalization.candidate_key_engine import find_all_candidate_keys


def build_dependency_graph(
    relation_name: str,
    attributes: List[str],
    fds: List[FunctionalDependency],
    mvds: Optional[List[MultivaluedDependency]] = None,
    candidate_keys: Optional[List[List[str]]] = None,
    prime_attributes: Optional[List[str]] = None,
    violations: Optional[Dict[str, Any]] = None,
) -> VisualizationGraphData:
    """
    Constructs a deterministic, layered 2D layout of attribute nodes,
    composite determinant group nodes, and FD/MVD edges.
    """
    clean_attrs = normalize_attribute_set(attributes)
    c_keys = [list(k) for k in (candidate_keys or []) if k]
    primes = set(prime_attributes or [])
    active_mvds = mvds or []
    violation_dict = violations or {}

    # If candidate keys are not supplied or empty, automatically derive them using candidate key engine
    if not c_keys and clean_attrs:
        try:
            discovery = find_all_candidate_keys(
                attributes=clean_attrs,
                fds=fds,
                relation_name=relation_name,
            )
            c_keys = discovery.candidate_keys
            if not primes:
                primes = set(discovery.prime_attributes)
        except Exception:
            pass

    # If prime attributes not provided, compute from candidate keys
    if not primes and c_keys:
        for k in c_keys:
            primes.update(k)

    nodes: List[VisualizationNode] = []
    edges: List[VisualizationEdge] = []
    node_registry: Dict[str, VisualizationNode] = {}

    # 1. Identify all composite determinants in FDs and MVDs
    composite_determinants: Dict[Tuple[str, ...], str] = {}
    for fd in fds:
        if len(fd.left) > 1:
            key = tuple(sorted(fd.left))
            node_id = f"comp-{'-'.join(key)}"
            composite_determinants[key] = node_id

    for mvd in active_mvds:
        if len(mvd.left) > 1:
            key = tuple(sorted(mvd.left))
            node_id = f"comp-{'-'.join(key)}"
            composite_determinants[key] = node_id

    # 2. Assign attributes and composite determinants to layers
    # Layer 0: Keys & Key determinants
    # Layer 1: Attributes that are determinants
    # Layer 2: Dependent attributes (non-prime / non-determinants)
    all_lhs_attrs: Set[str] = set()
    all_rhs_attrs: Set[str] = set()
    for fd in fds:
        all_lhs_attrs.update(fd.left)
        all_rhs_attrs.update(fd.right)
    for mvd in active_mvds:
        all_lhs_attrs.update(mvd.left)
        all_rhs_attrs.update(mvd.right)

    # 3. Create Nodes for Individual Attributes
    for attr in clean_attrs:
        node_id = f"attr-{attr}"
        is_p = attr in primes
        is_single_ck = any([attr] == list(ck) for ck in c_keys)
        
        node = VisualizationNode(
            id=node_id,
            label=attr,
            type="attribute",
            attributes=[attr],
            is_prime=is_p,
            is_candidate_key=is_single_ck,
            position={"x": 0.0, "y": 0.0},
            data={
                "attribute": attr,
                "isPrime": is_p,
                "isCandidateKey": is_single_ck,
                "isDeterminant": attr in all_lhs_attrs,
                "isDependent": attr in all_rhs_attrs,
            }
        )
        node_registry[node_id] = node

    # 4. Create Nodes for Composite Determinants
    for comp_key, node_id in composite_determinants.items():
        comp_list = list(comp_key)
        is_ck = any(set(comp_list) == set(ck) for ck in c_keys)
        is_p = all(a in primes for a in comp_list)

        node = VisualizationNode(
            id=node_id,
            label=f"({', '.join(comp_list)})",
            type="composite_determinant",
            attributes=comp_list,
            is_prime=is_p,
            is_candidate_key=is_ck,
            position={"x": 0.0, "y": 0.0},
            data={
                "attributes": comp_list,
                "isPrime": is_p,
                "isComposite": True,
                "isCandidateKey": is_ck,
            }
        )
        node_registry[node_id] = node

    # 5. Position Nodes Deterministically
    # Column 0: Composite keys & Primary determinants (X = 60)
    # Column 1: Prime attributes / Single determinants (X = 360)
    # Column 2: Dependent non-prime attributes (X = 660)
    col0_nodes: List[VisualizationNode] = []
    col1_nodes: List[VisualizationNode] = []
    col2_nodes: List[VisualizationNode] = []

    for comp_node in [n for n in node_registry.values() if n.type == "composite_determinant"]:
        col0_nodes.append(comp_node)

    for attr_node in [n for n in node_registry.values() if n.type == "attribute"]:
        attr = attr_node.attributes[0]
        if attr in primes:
            col1_nodes.append(attr_node)
        elif attr in all_lhs_attrs:
            col1_nodes.append(attr_node)
        else:
            col2_nodes.append(attr_node)

    # Distribute vertically
    y_gap = 100.0
    for i, n in enumerate(col0_nodes):
        n.position = {"x": 60.0, "y": 80.0 + (i * 120.0)}

    for i, n in enumerate(col1_nodes):
        n.position = {"x": 360.0, "y": 60.0 + (i * y_gap)}

    for i, n in enumerate(col2_nodes):
        n.position = {"x": 680.0, "y": 60.0 + (i * y_gap)}

    nodes = list(node_registry.values())

    # 6. Create Edges for Functional Dependencies
    fd_violations = set(violation_dict.get("fd_violations", []))
    for i, fd in enumerate(fds):
        source_id = composite_determinants[tuple(sorted(fd.left))] if len(fd.left) > 1 else f"attr-{fd.left[0]}"
        fd_notation = f"{', '.join(fd.left)} → {', '.join(fd.right)}"
        is_viol = fd_notation in fd_violations or any(
            v in fd_notation for v in violation_dict.get("partial_dependencies", [])
        ) or any(
            v in fd_notation for v in violation_dict.get("transitive_dependencies", [])
        )

        viol_stage = None
        if is_viol:
            if "2NF" in violation_dict.get("stages", []):
                viol_stage = "2NF"
            elif "3NF" in violation_dict.get("stages", []):
                viol_stage = "3NF"

        for rhs_attr in fd.right:
            target_id = f"attr-{rhs_attr}"
            edge_id = f"edge-fd-{i}-{rhs_attr}"
            edges.append(
                VisualizationEdge(
                    id=edge_id,
                    source=source_id,
                    target=target_id,
                    type="fd",
                    label="→",
                    is_violation=is_viol,
                    violation_stage=viol_stage,
                    data={
                        "fdId": fd.id or f"fd-{i}",
                        "lhs": fd.left,
                        "rhs": [rhs_attr],
                        "fullRhs": fd.right,
                        "notation": fd_notation,
                        "isViolation": is_viol,
                        "violationStage": viol_stage,
                    }
                )
            )

    # 7. Create Edges for Multivalued Dependencies
    mvd_violations = set(violation_dict.get("mvd_violations", []))
    for i, mvd in enumerate(active_mvds):
        source_id = composite_determinants[tuple(sorted(mvd.left))] if len(mvd.left) > 1 else f"attr-{mvd.left[0]}"
        mvd_notation = f"{', '.join(mvd.left)} ↠ {', '.join(mvd.right)}"
        is_viol = mvd_notation in mvd_violations or "4NF" in violation_dict.get("stages", [])

        for rhs_attr in mvd.right:
            target_id = f"attr-{rhs_attr}"
            edge_id = f"edge-mvd-{i}-{rhs_attr}"
            edges.append(
                VisualizationEdge(
                    id=edge_id,
                    source=source_id,
                    target=target_id,
                    type="mvd",
                    label="↠",
                    is_violation=is_viol,
                    violation_stage="4NF" if is_viol else None,
                    data={
                        "mvdId": mvd.id or f"mvd-{i}",
                        "lhs": mvd.left,
                        "rhs": [rhs_attr],
                        "fullRhs": mvd.right,
                        "notation": mvd_notation,
                        "isViolation": is_viol,
                        "violationStage": "4NF" if is_viol else None,
                    }
                )
            )

    return VisualizationGraphData(
        relationName=relation_name,
        nodes=nodes,
        edges=edges,
        candidateKeys=c_keys,
        primeAttributes=sorted(list(primes)),
        nonPrimeAttributes=sorted([a for a in clean_attrs if a not in primes]),
        summary=f"Graph model for {relation_name}: {len(nodes)} nodes, {len(edges)} dependencies."
    )


def build_closure_visualization(
    target_attributes: List[str],
    closure_result: ClosureResult,
    universal_attributes: List[str],
) -> ClosureVisualizationData:
    """
    Translates a Phase 3 ClosureResult into structured animation/playback steps
    for the interactive Closure Player.
    """
    start_set = normalize_attribute_set(target_attributes)
    univ_set = set(normalize_attribute_set(universal_attributes))
    steps: List[ClosureVisualizationStep] = []

    if not closure_result.steps:
        # Fallback if no steps: starting set only
        steps.append(
            ClosureVisualizationStep(
                stepNumber=0,
                currentClosure=sorted(start_set),
                appliedFd=None,
                newlyAdded=sorted(start_set),
                isStarting=True,
                isFixedPoint=True,
                isSuperkey=set(start_set) == univ_set,
                explanation=f"Initial state: Starting with attribute set {{{', '.join(start_set)}}} by reflexivity.",
            )
        )
    else:
        for i, step_item in enumerate(closure_result.steps):
            is_start = step_item.applied_fd is None or i == 0
            is_last = (i == len(closure_result.steps) - 1)
            is_super = set(step_item.after_attributes) == univ_set

            steps.append(
                ClosureVisualizationStep(
                    stepNumber=i,
                    currentClosure=sorted(step_item.after_attributes),
                    appliedFd=step_item.applied_fd,
                    newlyAdded=sorted(step_item.added_attributes),
                    isStarting=is_start,
                    isFixedPoint=is_last,
                    isSuperkey=is_super,
                    explanation=step_item.explanation,
                )
            )

    # Final step if not already marked fixed-point
    final_set = set(closure_result.closure_attributes)
    is_superkey = final_set == univ_set

    return ClosureVisualizationData(
        targetAttributes=start_set,
        finalClosure=sorted(list(final_set)),
        isSuperkey=is_superkey,
        steps=steps,
    )


def build_decomposition_tree(
    source_relation: str,
    source_attributes: List[str],
    candidate_keys: List[List[str]],
    plans: List[DecompositionPlan],
) -> List[DecompositionTreeNode]:
    """
    Constructs hierarchical tree nodes representing decomposition lineage
    from the original relation to normalized sub-relations.
    """
    tree_nodes: List[DecompositionTreeNode] = []

    # Root node: Original unnormalized relation
    root_id = f"rel-root-{source_relation.lower()}"
    tree_nodes.append(
        DecompositionTreeNode(
            id=root_id,
            name=source_relation,
            attributes=source_attributes,
            primaryKey=candidate_keys[0] if candidate_keys else [],
            parentId=None,
            childrenIds=[],
            triggerDependency=None,
            stage="INPUT",
            isLossless=None,
            isPreserved=None,
        )
    )

    current_parent_id = root_id

    for plan in plans:
        child_ids = []
        is_lossless = plan.lossless_join.is_lossless if plan.lossless_join else None
        is_preserved = plan.dependency_preservation.is_preserved if plan.dependency_preservation else None

        for i, sub_rel in enumerate(plan.proposed_relations):
            child_id = f"rel-{plan.stage.lower()}-{sub_rel.name.lower()}-{i}"
            child_ids.append(child_id)

            tree_nodes.append(
                DecompositionTreeNode(
                    id=child_id,
                    name=sub_rel.name,
                    attributes=sub_rel.attributes,
                    primaryKey=sub_rel.primary_key,
                    parentId=current_parent_id,
                    childrenIds=[],
                    triggerDependency=sub_rel.purpose,
                    stage=plan.stage,
                    isLossless=is_lossless,
                    isPreserved=is_preserved,
                )
            )

        # Update parent's children_ids
        for n in tree_nodes:
            if n.id == current_parent_id:
                n.children_ids = child_ids
                break

    return tree_nodes
