"""
Deterministic Response Builder for Normalization Assistant.

Constructs mathematically grounded, factual answers based entirely on relational
database theory and the current active analysis context.
"""

from typing import Optional, List, Dict, Any
from app.assistant.schemas import AssistantContext, AssistantAskResponse
from app.assistant.intent_classifier import IntentClassifier
from app.assistant.context_resolver import ContextResolver
from app.assistant.templates import CONCEPT_DEFINITIONS, UNSUPPORTED_FALLBACK
from app.normalization.closure_engine import compute_attribute_closure
from app.normalization.attribute_set import normalize_attribute_set, to_attribute_set, is_subset


class ResponseBuilder:
    """Builds educational answers without calling external generative LLMs."""

    @classmethod
    def build_response(
        cls, question: str, context: Optional[AssistantContext] = None
    ) -> AssistantAskResponse:
        intent, entity = IntentClassifier.classify(question)

        context_used: Dict[str, Any] = {
            "relation": context.relation if context else "R",
            "has_context": context is not None,
        }

        # 1. Unknown / Unsupported
        if intent == "UNKNOWN":
            return AssistantAskResponse(
                intent="UNKNOWN",
                answer=UNSUPPORTED_FALLBACK,
                evidence_ids=[],
                suggested_actions=["open_learn"],
                supported=False,
                learning_topic="overview",
                context_used=context_used,
            )

        # 2. Concept Definitions
        if intent.startswith("CONCEPT_"):
            concept_key = intent.replace("CONCEPT_", "")
            explanation = CONCEPT_DEFINITIONS.get(concept_key, "")
            learning_slug = concept_key.lower().replace("_", "-")

            # Add context grounding if available
            grounding = ""
            if context and context.relation:
                if concept_key == "CANDIDATE_KEY" and context.candidate_keys:
                    keys_str = ", ".join(f"{{{', '.join(k)}}}" for k in context.candidate_keys)
                    grounding = f"\n\nIn your current relation {context.relation}, the confirmed candidate keys are: {keys_str}."
                elif concept_key == "PRIME_ATTRIBUTE" and context.prime_attributes:
                    primes_str = ", ".join(context.prime_attributes)
                    grounding = f"\n\nIn your current relation, the prime attributes are: {{{primes_str}}}."

            return AssistantAskResponse(
                intent=intent,
                answer=f"{explanation}{grounding}",
                evidence_ids=[],
                suggested_actions=["open_learn", "open_experiment"],
                supported=True,
                learning_topic=learning_slug,
                context_used=context_used,
            )

        # 3. Candidate Keys
        if intent == "CANDIDATE_KEYS":
            if context and context.candidate_keys:
                keys_str = ", ".join(f"{{{', '.join(k)}}}" for k in context.candidate_keys)
                primes_str = ", ".join(context.prime_attributes) if context.prime_attributes else "None"
                non_primes_str = ", ".join(context.non_prime_attributes) if context.non_prime_attributes else "None"
                ans = (
                    f"Relation **{context.relation}** has the following candidate key(s):\n"
                    f"**{keys_str}**\n\n"
                    f"• **Prime Attributes** (part of at least one key): {{{primes_str}}}\n"
                    f"• **Non-Prime Attributes**: {{{non_primes_str}}}\n\n"
                    f"Each candidate key is minimal and functionally determines all attributes of {context.relation}."
                )
                return AssistantAskResponse(
                    intent=intent,
                    answer=ans,
                    evidence_ids=["candidate-keys"],
                    suggested_actions=["show_keys", "open_closure_lab"],
                    supported=True,
                    learning_topic="candidate-keys",
                    context_used={"candidate_keys": context.candidate_keys},
                )
            else:
                return AssistantAskResponse(
                    intent=intent,
                    answer=(
                        f"{CONCEPT_DEFINITIONS['CANDIDATE_KEY']}\n\n"
                        "To discover candidate keys for your schema, enter attributes and functional dependencies "
                        "and run the Candidate Key Engine."
                    ),
                    evidence_ids=[],
                    suggested_actions=["show_keys"],
                    supported=True,
                    learning_topic="candidate-keys",
                    context_used=context_used,
                )

        # 4. Prime Attributes
        if intent == "PRIME_ATTRIBUTES":
            if context and context.attributes:
                primes_str = ", ".join(context.prime_attributes) if context.prime_attributes else "None"
                non_primes_str = ", ".join(context.non_prime_attributes) if context.non_prime_attributes else "None"
                keys_str = ", ".join(f"{{{', '.join(k)}}}" for k in context.candidate_keys) if context.candidate_keys else "None"
                ans = (
                    f"Based on candidate key(s) **{keys_str}** for relation **{context.relation}**:\n\n"
                    f"• **Prime Attributes** (belong to at least one candidate key): **{{{primes_str}}}**\n"
                    f"• **Non-Prime Attributes**: **{{{non_primes_str}}}**\n\n"
                    f"In 2NF and 3NF, the distinction between prime and non-prime attributes determines "
                    f"whether a dependency is an allowable exception or a normal form violation."
                )
                return AssistantAskResponse(
                    intent=intent,
                    answer=ans,
                    evidence_ids=["prime-attributes"],
                    suggested_actions=["show_keys", "open_experiment"],
                    supported=True,
                    learning_topic="candidate-keys",
                    context_used={"prime_attributes": context.prime_attributes},
                )

        # 5. Attribute Closure
        if intent == "CLOSURE":
            target = ContextResolver.resolve_closure_target(question, entity, context)
            if context and context.attributes and context.functional_dependencies:
                try:
                    res = compute_attribute_closure(
                        attributes=context.attributes,
                        fds=context.functional_dependencies,
                        target_attributes=target,
                        relation_name=context.relation,
                    )
                    target_str = ", ".join(target)
                    closure_str = ", ".join(res.closure_attributes)
                    steps_formatted = []
                    for s in res.steps:
                        applied = s.applied_fd.notation() if s.applied_fd else "Initial set"
                        steps_formatted.append(f"• Step {s.step_number}: Applied `{applied}` → Closure now {{{', '.join(s.after_attributes)}}}")

                    steps_text = "\n".join(steps_formatted)
                    ans = (
                        f"**Attribute Closure calculation for {{{target_str}}}⁺ under F:**\n\n"
                        f"**Final Closure:** {{{target_str}}}⁺ = **{{{closure_str}}}**\n\n"
                        f"**Is Superkey?** {'Yes (covers all attributes)' if res.is_superkey else 'No (does not cover all attributes)'}\n\n"
                        f"**Derivation Steps:**\n{steps_text}"
                    )
                    return AssistantAskResponse(
                        intent=intent,
                        answer=ans,
                        evidence_ids=["closure-result"],
                        suggested_actions=["open_closure_lab", "open_experiment"],
                        supported=True,
                        learning_topic="attribute-closure",
                        context_used={"target_attributes": target, "is_superkey": res.is_superkey},
                    )
                except Exception as e:
                    pass

            target_str = ", ".join(target) if target else "X"
            return AssistantAskResponse(
                intent=intent,
                answer=(
                    f"The attribute closure of a set {{{target_str}}} (written {{{target_str}}}⁺) is the set of all "
                    f"attributes functionally determined by {{{target_str}}} under the set of functional dependencies F.\n\n"
                    f"Run the closure calculation in the Closure Lab to view the animated step-by-step trace."
                ),
                evidence_ids=[],
                suggested_actions=["open_closure_lab"],
                supported=True,
                learning_topic="attribute-closure",
                context_used=context_used,
            )

        # 6. Why Normal Form Fails (Stage Violation)
        if intent == "WHY_NF_FAIL":
            stage = ContextResolver.resolve_stage(question, entity, context)
            status_val = context.normal_forms.get(stage, "UNKNOWN") if context else "UNKNOWN"

            if status_val == "SATISFIED":
                return AssistantAskResponse(
                    intent="WHY_NF_PASS",
                    answer=(
                        f"Relation **{context.relation if context else 'R'}** actually **SATISFIES {stage}**!\n\n"
                        f"It meets all formal requirements of {stage}. Ask 'Why does this satisfy {stage}?' "
                        f"or inspect the higher normal forms."
                    ),
                    evidence_ids=[f"{stage.lower()}-pass"],
                    suggested_actions=["show_journey", "open_experiment"],
                    supported=True,
                    learning_topic=stage.lower(),
                    context_used={"stage": stage, "status": status_val},
                )

            violation = ContextResolver.resolve_relevant_violation(stage, context)
            evidence_ids = []
            keys_str = ", ".join(f"{{{', '.join(k)}}}" for k in context.candidate_keys) if context and context.candidate_keys else "K"

            if stage == "1NF":
                ans = (
                    f"**First Normal Form (1NF) Violation in {context.relation if context else 'R'}:**\n\n"
                    f"1NF requires atomic attribute domains and absence of repeating groups.\n"
                )
                if violation:
                    ans += f"**Reason:** {violation.get('description', 'Non-atomic values or repeating attribute structure detected.')}\n"
                    if "id" in violation:
                        evidence_ids.append(str(violation["id"]))
                else:
                    ans += "Non-atomic or multi-valued fields were detected in the relation."

            elif stage == "2NF":
                ans = (
                    f"**Second Normal Form (2NF) Violation in {context.relation if context else 'R'}:**\n\n"
                    f"2NF requires that no non-prime attribute has a partial dependency on any candidate key.\n"
                    f"• **Candidate Key(s):** {keys_str}\n"
                )
                if violation:
                    dep = violation.get("dependency") or violation.get("partial_dependency") or violation.get("trigger_dependency")
                    lhs = violation.get("lhs") or violation.get("determinant")
                    rhs = violation.get("rhs") or violation.get("dependent")
                    dep_str = dep or f"{', '.join(lhs) if isinstance(lhs, list) else lhs} → {', '.join(rhs) if isinstance(rhs, list) else rhs}"
                    ans += (
                        f"• **Violating Dependency:** `{dep_str}`\n"
                        f"• **Why it violates 2NF:** The determinant is a proper subset of a composite candidate key, "
                        f"creating a partial dependency where the non-prime attribute depends on only part of the key.\n"
                    )
                    if "id" in violation:
                        evidence_ids.append(str(violation["id"]))
                else:
                    ans += "A partial dependency on a proper subset of a composite candidate key was detected."

            elif stage == "3NF":
                ans = (
                    f"**Third Normal Form (3NF) Violation in {context.relation if context else 'R'}:**\n\n"
                    f"3NF requires that for every non-trivial FD `X → A`, either `X` is a superkey OR `A` is prime.\n"
                    f"• **Candidate Key(s):** {keys_str}\n"
                )
                if violation:
                    dep = violation.get("dependency") or violation.get("transitive_dependency") or violation.get("trigger_dependency")
                    lhs = violation.get("lhs") or violation.get("determinant")
                    rhs = violation.get("rhs") or violation.get("dependent")
                    dep_str = dep or f"{', '.join(lhs) if isinstance(lhs, list) else lhs} → {', '.join(rhs) if isinstance(rhs, list) else rhs}"
                    ans += (
                        f"• **Violating Dependency:** `{dep_str}`\n"
                        f"• **Why it violates 3NF:** The determinant is NOT a superkey, and the dependent attribute is NOT prime. "
                        f"This creates a transitive dependency, causing redundancy and update anomalies.\n"
                    )
                    if "id" in violation:
                        evidence_ids.append(str(violation["id"]))
                else:
                    ans += "A non-superkey determinant determines a non-prime attribute (transitive dependency)."

            elif stage == "4NF":
                ans = (
                    f"**Fourth Normal Form (4NF) Violation in {context.relation if context else 'R'}:**\n\n"
                    f"4NF requires that for every non-trivial multivalued dependency `X ↠ Y`, `X` must be a superkey.\n"
                    f"• **Candidate Key(s):** {keys_str}\n"
                )
                if violation:
                    mvd = violation.get("mvd") or violation.get("dependency") or violation.get("trigger_dependency")
                    ans += (
                        f"• **Violating MVD:** `{mvd}`\n"
                        f"• **Why it violates 4NF:** The determinant is not a superkey, representing two or more "
                        f"independent multi-valued facts stored in the same relation.\n"
                    )
                    if "id" in violation:
                        evidence_ids.append(str(violation["id"]))
                else:
                    ans += "A non-trivial multivalued dependency exists where the determinant is not a superkey."
            else:
                ans = f"The relation violates {stage} based on the current functional dependencies."

            return AssistantAskResponse(
                intent="WHY_NF_FAIL",
                answer=ans,
                evidence_ids=evidence_ids or [f"{stage.lower()}-violation"],
                suggested_actions=["open_evidence", "open_experiment", "view_decomposition"],
                supported=True,
                learning_topic=stage.lower(),
                context_used={"stage": stage, "status": status_val, "violation": violation},
            )

        # 7. Why Normal Form Passes (Stage Satisfaction)
        if intent == "WHY_NF_PASS":
            stage = ContextResolver.resolve_stage(question, entity, context)
            keys_str = ", ".join(f"{{{', '.join(k)}}}" for k in context.candidate_keys) if context and context.candidate_keys else "K"

            if stage == "1NF":
                ans = (
                    f"**Why {context.relation if context else 'R'} satisfies 1NF:**\n\n"
                    f"1. All attribute values are atomic (indivisible domain elements).\n"
                    f"2. There are no repeating groups or composite columns.\n"
                    f"3. A valid candidate key ({keys_str}) uniquely identifies each record."
                )
            elif stage == "2NF":
                ans = (
                    f"**Why {context.relation if context else 'R'} satisfies 2NF:**\n\n"
                    f"1. The relation satisfies 1NF.\n"
                    f"2. Every non-prime attribute is fully dependent on each candidate key ({keys_str}).\n"
                    f"3. There are zero partial dependencies (no proper subset of a composite key determines a non-prime attribute)."
                )
            elif stage == "3NF":
                ans = (
                    f"**Why {context.relation if context else 'R'} satisfies 3NF:**\n\n"
                    f"1. The relation satisfies 2NF.\n"
                    f"2. For every non-trivial functional dependency `X → A`, either:\n"
                    f"   • `X` is a superkey of {context.relation if context else 'R'}, OR\n"
                    f"   • `A` is a prime attribute (part of candidate key {keys_str}).\n"
                    f"3. No non-prime attribute transitively depends on any candidate key."
                )
            elif stage == "4NF":
                ans = (
                    f"**Why {context.relation if context else 'R'} satisfies 4NF:**\n\n"
                    f"1. The relation satisfies 3NF.\n"
                    f"2. Every non-trivial multivalued dependency `X ↠ Y` has a determinant `X` that is a superkey.\n"
                    f"3. No independent multi-valued facts produce combinatorial redundancy."
                )
            else:
                ans = f"The relation satisfies {stage} according to relational normalization rules."

            return AssistantAskResponse(
                intent="WHY_NF_PASS",
                answer=ans,
                evidence_ids=[f"{stage.lower()}-pass"],
                suggested_actions=["show_journey", "open_experiment"],
                supported=True,
                learning_topic=stage.lower(),
                context_used={"stage": stage},
            )

        # 8. Decomposition
        if intent == "DECOMPOSITION":
            if context and context.decomposition_summary:
                d = context.decomposition_summary
                plans_desc = d.get("summary", "Decomposition plan generated.")
                ans = (
                    f"**Decomposition for {context.relation}:**\n\n"
                    f"{plans_desc}\n\n"
                    f"• **Lossless Join:** Verified by Tableau Chase algorithm.\n"
                    f"• **Dependency Preservation:** Checked via projected dependency closures."
                )
                return AssistantAskResponse(
                    intent=intent,
                    answer=ans,
                    evidence_ids=["decomposition-plan"],
                    suggested_actions=["view_decomposition", "open_experiment"],
                    supported=True,
                    learning_topic="decomposition",
                    context_used={"decomposition": d},
                )
            else:
                ans = (
                    f"{CONCEPT_DEFINITIONS['DECOMPOSITION']}\n\n"
                    f"When a normal form violation occurs (such as a partial dependency in 2NF or transitive dependency in 3NF), "
                    f"the relation R is decomposed into sub-relations R1 and R2:\n"
                    f"• R1 contains the determinant attributes X and dependent attributes Y.\n"
                    f"• R2 contains the determinant attributes X and remaining attributes (R \\ Y).\n"
                    f"This ensures a lossless join while eliminating the anomaly."
                )
                return AssistantAskResponse(
                    intent=intent,
                    answer=ans,
                    evidence_ids=[],
                    suggested_actions=["view_decomposition", "open_experiment"],
                    supported=True,
                    learning_topic="decomposition",
                    context_used=context_used,
                )

        # 9. Lossless Join
        if intent == "LOSSLESS_JOIN":
            ans = (
                f"{CONCEPT_DEFINITIONS['LOSSLESS_JOIN']}\n\n"
                f"**How the Lab verifies Losslessness:**\n"
                f"The Normalization Lab uses the formal **Tableau Chase algorithm** (or Fagin's Theorem for binary splits). "
                f"It builds a matrix with distinguished symbols (aⱼ) and non-distinguished symbols (bᵢⱼ), applying "
                f"functional dependencies iteratively until a row becomes completely distinguished (all aⱼ), "
                f"which mathematically proves the join is lossless without spurious tuples."
            )
            return AssistantAskResponse(
                intent=intent,
                answer=ans,
                evidence_ids=["lossless-join"],
                suggested_actions=["view_decomposition", "open_learn"],
                supported=True,
                learning_topic="lossless-join",
                context_used=context_used,
            )

        # 10. Dependency Preservation
        if intent == "DEPENDENCY_PRESERVATION":
            ans = (
                f"{CONCEPT_DEFINITIONS['DEPENDENCY_PRESERVATION']}\n\n"
                f"**How the Lab verifies Dependency Preservation:**\n"
                f"For each original functional dependency `X → Y` in F, the engine projects F onto each decomposed "
                f"relation Rᵢ (computing π_Rᵢ(F)). It then verifies whether `Y ⊆ X⁺` under the union of all projected "
                f"dependencies. If every original FD is covered, dependency preservation holds."
            )
            return AssistantAskResponse(
                intent=intent,
                answer=ans,
                evidence_ids=["dependency-preservation"],
                suggested_actions=["view_decomposition", "open_learn"],
                supported=True,
                learning_topic="dependency-preservation",
                context_used=context_used,
            )

        # 11. Suggested Next Action
        if intent == "NEXT_ACTION":
            if context and context.normal_forms:
                # Find lowest failing stage
                failing = None
                for s in ["1NF", "2NF", "3NF", "4NF"]:
                    if context.normal_forms.get(s) == "VIOLATED":
                        failing = s
                        break

                if failing:
                    ans = (
                        f"**Suggested Next Step:**\n\n"
                        f"Your relation violates **{failing}**.\n\n"
                        f"1. Click the **{failing}** node in the Normalization Journey to inspect the exact violating dependency.\n"
                        f"2. Use **Experiment Mode** to test adding or removing dependencies to reach {failing}.\n"
                        f"3. Inspect the proposed **Decomposition** to see how the relation can be normalized losslessly."
                    )
                    return AssistantAskResponse(
                        intent=intent,
                        answer=ans,
                        evidence_ids=[f"{failing.lower()}-violation"],
                        suggested_actions=["show_journey", "open_experiment", "view_decomposition"],
                        supported=True,
                        learning_topic=failing.lower(),
                        context_used={"failing_stage": failing},
                    )
                else:
                    ans = (
                        f"**Suggested Next Step:**\n\n"
                        f"Your relation satisfies all evaluated normal forms!\n\n"
                        f"1. Explore the **Dependency Graph** to see candidate key highlights and closure paths.\n"
                        f"2. Open **Experiment Mode** to test 'What-If' scenarios by introducing new functional dependencies.\n"
                        f"3. Try **Practice Mode** to test your knowledge on DBMS normalization exercises."
                    )
                    return AssistantAskResponse(
                        intent=intent,
                        answer=ans,
                        evidence_ids=["all-pass"],
                        suggested_actions=["show_graph", "open_experiment", "open_practice"],
                        supported=True,
                        learning_topic="overview",
                        context_used=context_used,
                    )

            ans = (
                "**Suggested Next Step:**\n\n"
                "Enter schema attributes and functional dependencies in the Schema Input Builder, "
                "then run normalization analysis to inspect 1NF through 4NF results."
            )
            return AssistantAskResponse(
                intent=intent,
                answer=ans,
                evidence_ids=[],
                suggested_actions=["show_schema_builder"],
                supported=True,
                learning_topic="overview",
                context_used=context_used,
            )

        # Fallback for unexpected case
        return AssistantAskResponse(
            intent="UNKNOWN",
            answer=UNSUPPORTED_FALLBACK,
            evidence_ids=[],
            suggested_actions=["open_learn"],
            supported=False,
            learning_topic="overview",
            context_used=context_used,
        )
