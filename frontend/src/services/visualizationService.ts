import { apiClient } from './apiClient';
import type {
  RelationSchema,
  VisualizationGraphData,
  ClosureVisualizationData,
  DecompositionTreeNode,
  DecompositionPlan,
  FunctionalDependency,
} from '../types';

class VisualizationService {
  /**
   * Fetches deterministic 2D layout for dependency graph.
   */
  async getDependencyGraph(
    schema: RelationSchema,
    primeAttributes?: string[],
    violations?: Record<string, any>
  ): Promise<VisualizationGraphData> {
    try {
      return await apiClient.post<VisualizationGraphData>('/visualization/graph', {
        relationName: schema.name,
        attributes: schema.attributes,
        functionalDependencies: schema.functional_dependencies,
        multivaluedDependencies: schema.multivalued_dependencies || [],
        candidateKeys: schema.candidate_keys || [],
        primeAttributes: primeAttributes || [],
        violations: violations || {},
      });
    } catch (err) {
      console.warn('Backend graph layout unreachable, computing optimistic layout', err);
      return this.computeClientGraphLayout(schema, primeAttributes, violations);
    }
  }

  /**
   * Fetches step-by-step playback data for attribute closure.
   */
  async getClosurePlayerData(
    attributes: string[],
    fds: FunctionalDependency[],
    targetAttributes: string[]
  ): Promise<ClosureVisualizationData> {
    try {
      const res = await apiClient.post<ClosureVisualizationData>('/visualization/closure-player', {
        attributes,
        functionalDependencies: fds,
        targetAttributes,
      });
      return {
        ...res,
        targetAttributes: res.targetAttributes || targetAttributes,
        finalClosure: res.finalClosure || [],
        steps: (res.steps || []).map((step) => {
          const rawFd = step.appliedFd as any;
          const left = rawFd ? (Array.isArray(rawFd.left) ? rawFd.left : Array.isArray(rawFd.lhs) ? rawFd.lhs : []) : [];
          const right = rawFd ? (Array.isArray(rawFd.right) ? rawFd.right : Array.isArray(rawFd.rhs) ? rawFd.rhs : []) : [];
          return {
            ...step,
            currentClosure: step.currentClosure || [],
            newlyAdded: step.newlyAdded || [],
            appliedFd: rawFd
              ? {
                  ...rawFd,
                  left,
                  right,
                  lhs: left,
                  rhs: right,
                }
              : null,
          };
        }),
      };
    } catch (err) {
      console.warn('Backend closure player unreachable, computing fallback', err);
      return {
        targetAttributes,
        finalClosure: [...targetAttributes],
        isSuperkey: targetAttributes.length === attributes.length,
        steps: [
          {
            stepNumber: 0,
            currentClosure: [...targetAttributes],
            appliedFd: null,
            newlyAdded: [...targetAttributes],
            isStarting: true,
            isFixedPoint: true,
            isSuperkey: targetAttributes.length === attributes.length,
            explanation: `Starting with {${targetAttributes.join(', ')}}`,
          },
        ],
      };
    }
  }

  /**
   * Fetches hierarchical decomposition tree.
   */
  async getDecompositionTree(
    sourceRelation: string,
    sourceAttributes: string[],
    candidateKeys: string[][],
    plans: DecompositionPlan[]
  ): Promise<DecompositionTreeNode[]> {
    try {
      return await apiClient.post<DecompositionTreeNode[]>('/visualization/decomposition-tree', {
        sourceRelation,
        sourceAttributes,
        candidateKeys,
        plans,
      });
    } catch (err) {
      console.warn('Backend decomposition tree unreachable, generating optimistic tree', err);
      const rootId = `root-${sourceRelation.toLowerCase()}`;
      const nodes: DecompositionTreeNode[] = [
        {
          id: rootId,
          name: sourceRelation,
          attributes: sourceAttributes,
          primaryKey: candidateKeys[0] || [],
          childrenIds: [],
          stage: 'INPUT',
        },
      ];

      for (const plan of plans) {
        for (let i = 0; i < plan.proposed_relations.length; i++) {
          const sub = plan.proposed_relations[i];
          const childId = `sub-${plan.stage}-${i}`;
          nodes[0].childrenIds.push(childId);
          nodes.push({
            id: childId,
            name: sub.name,
            attributes: sub.attributes,
            primaryKey: sub.primary_key,
            parentId: rootId,
            childrenIds: [],
            triggerDependency: sub.purpose,
            stage: plan.stage,
            isLossless: plan.lossless_join?.is_lossless,
            isPreserved: plan.dependency_preservation?.is_preserved,
          });
        }
      }
      return nodes;
    }
  }

  /**
   * Client-side fallback layout generator
   */
  private computeClientGraphLayout(
    schema: RelationSchema,
    primeAttributes?: string[],
    violations?: Record<string, any>
  ): VisualizationGraphData {
    const primes = new Set(primeAttributes || []);
    if (primes.size === 0 && schema.candidate_keys && schema.candidate_keys.length > 0) {
      schema.candidate_keys.forEach((ck) => ck.forEach((a) => primes.add(a)));
    } else if (primes.size === 0 && schema.functional_dependencies && schema.functional_dependencies.length > 0) {
      // Fallback: attributes that appear on LHS but never on RHS are essential core and must be prime
      const rhsAttrs = new Set(schema.functional_dependencies.flatMap((fd) => fd.right));
      const lhsAttrs = new Set(schema.functional_dependencies.flatMap((fd) => fd.left));
      schema.attributes.forEach((attr) => {
        if (!rhsAttrs.has(attr) && (lhsAttrs.has(attr) || schema.attributes.length <= 3)) {
          primes.add(attr);
        }
      });
    }

    const nodes: any[] = [];
    const edges: any[] = [];
    const compMap = new Map<string, string>();

    // Composite determinants
    for (const fd of schema.functional_dependencies) {
      if (fd.left.length > 1) {
        const key = [...fd.left].sort().join('-');
        if (!compMap.has(key)) {
          const id = `comp-${key}`;
          compMap.set(key, id);
          nodes.push({
            id,
            label: `(${fd.left.join(', ')})`,
            type: 'composite_determinant',
            attributes: fd.left,
            is_prime: fd.left.every((a) => primes.has(a)),
            is_candidate_key: (schema.candidate_keys || []).some(
              (ck) => ck.length === fd.left.length && ck.every((a) => fd.left.includes(a))
            ),
            position: { x: 60, y: 80 + nodes.length * 110 },
            data: { attributes: fd.left, isComposite: true },
          });
        }
      }
    }

    // Single attributes
    schema.attributes.forEach((attr, idx) => {
      const isPrime = primes.has(attr);
      const isCK = (schema.candidate_keys || []).some((ck) => ck.length === 1 && ck[0] === attr);
      nodes.push({
        id: `attr-${attr}`,
        label: attr,
        type: 'attribute',
        attributes: [attr],
        is_prime: isPrime,
        is_candidate_key: isCK,
        position: { x: isPrime ? 360 : 680, y: 60 + idx * 90 },
        data: { attribute: attr, isPrime, isCandidateKey: isCK },
      });
    });

    // Edges
    schema.functional_dependencies.forEach((fd, i) => {
      const source = fd.left.length > 1 ? compMap.get([...fd.left].sort().join('-'))! : `attr-${fd.left[0]}`;
      const fdNotation = `${fd.left.join(', ')} → ${fd.right.join(', ')}`;
      const isViolation = Boolean(violations?.fd_violations?.includes(fdNotation));
      fd.right.forEach((r) => {
        edges.push({
          id: `edge-fd-${i}-${r}`,
          source,
          target: `attr-${r}`,
          type: 'fd',
          label: '→',
          is_violation: isViolation,
          data: { lhs: fd.left, rhs: [r], fullRhs: fd.right, notation: fdNotation },
        });
      });
    });

    (schema.multivalued_dependencies || []).forEach((mvd, i) => {
      const source = mvd.left.length > 1 ? compMap.get([...mvd.left].sort().join('-'))! : `attr-${mvd.left[0]}`;
      const mvdNotation = `${mvd.left.join(', ')} ↠ ${mvd.right.join(', ')}`;
      const isViolation = Boolean(violations?.mvd_violations?.includes(mvdNotation));
      mvd.right.forEach((r) => {
        edges.push({
          id: `edge-mvd-${i}-${r}`,
          source,
          target: `attr-${r}`,
          type: 'mvd',
          label: '↠',
          is_violation: isViolation,
          data: { lhs: mvd.left, rhs: [r], fullRhs: mvd.right, notation: mvdNotation },
        });
      });
    });

    return {
      relationName: schema.name,
      nodes,
      edges,
      candidateKeys: schema.candidate_keys || [],
      primeAttributes: Array.from(primes).sort(),
      nonPrimeAttributes: schema.attributes.filter((a) => !primes.has(a)).sort(),
      summary: `Client layout for ${schema.name}`,
    };
  }
}

export const visualizationService = new VisualizationService();
