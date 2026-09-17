"""
Deterministic Intent Classifier for Normalization Assistant.

Classifies natural language questions into structured intents using pattern matching
and token normalization without any external API or LLM dependency.
"""

import re
from typing import Tuple, Optional


class IntentClassifier:
    """Matches user questions against defined academic and contextual intents."""

    @classmethod
    def classify(cls, raw_question: str) -> Tuple[str, Optional[str]]:
        """
        Classifies a user question string into (intent, target_entity).
        Target entity may be a stage ('1NF', '2NF', '3NF', '4NF'), an attribute or dependency string.
        """
        if not raw_question or not raw_question.strip():
            return "UNKNOWN", None

        # Clean and normalize text
        q = raw_question.lower().strip()
        # Normalize punctuation except arrows and plus
        q_norm = re.sub(r"[^\w\s\+\-→↠\>]+", " ", q)
        q_norm = re.sub(r"\s+", " ", q_norm).strip()

        # 1. Concept Questions ("what is ...", "define ...", "explain ...")
        # Check specific concepts first
        if re.search(r"\b(what is|define|explain|tell me about|meaning of)\b", q_norm):
            if re.search(r"\b(1nf|first normal form)\b", q_norm) and not re.search(r"\b(why|violate|fail|pass|our|this|my)\b", q_norm):
                return "CONCEPT_1NF", "1NF"
            if re.search(r"\b(2nf|second normal form)\b", q_norm) and not re.search(r"\b(why|violate|fail|pass|our|this|my)\b", q_norm):
                return "CONCEPT_2NF", "2NF"
            if re.search(r"\b(3nf|third normal form)\b", q_norm) and not re.search(r"\b(why|violate|fail|pass|our|this|my)\b", q_norm):
                return "CONCEPT_3NF", "3NF"
            if re.search(r"\b(4nf|fourth normal form)\b", q_norm) and not re.search(r"\b(why|violate|fail|pass|our|this|my)\b", q_norm):
                return "CONCEPT_4NF", "4NF"
            if re.search(r"\b(partial dependenc(y|ies))\b", q_norm):
                return "CONCEPT_PARTIAL_DEPENDENCY", None
            if re.search(r"\b(transitive dependenc(y|ies))\b", q_norm):
                return "CONCEPT_TRANSITIVE_DEPENDENCY", None
            if re.search(r"\b(mvd|multivalued dependenc(y|ies))\b", q_norm):
                return "CONCEPT_MVD", None
            if re.search(r"\b(candidate key|candidate keys)\b", q_norm) and not re.search(r"\b(my|this|the relation|find|list|our)\b", q_norm):
                return "CONCEPT_CANDIDATE_KEY", None
            if re.search(r"\b(superkey|superkeys)\b", q_norm) and not re.search(r"\b(my|this|the relation|find|list|our)\b", q_norm):
                return "CONCEPT_SUPERKEY", None
            if re.search(r"\b(prime attribute|prime attributes)\b", q_norm) and not re.search(r"\b(my|this|the relation|find|list|our)\b", q_norm):
                return "CONCEPT_PRIME_ATTRIBUTE", None
            if re.search(r"\b(lossless join|lossless decomposition|lossless)\b", q_norm) and not re.search(r"\b(why|our|this|my)\b", q_norm):
                return "CONCEPT_LOSSLESS_JOIN", None
            if re.search(r"\b(dependency preservation|dependency preserving)\b", q_norm) and not re.search(r"\b(why|our|this|my)\b", q_norm):
                return "CONCEPT_DEPENDENCY_PRESERVATION", None
            if re.search(r"\b(decomposition|normalizing a relation)\b", q_norm) and not re.search(r"\b(how to|this|my|show)\b", q_norm):
                return "CONCEPT_DECOMPOSITION", None

        # 2. Stage Violation / Failure ("Why is this not in 3NF?", "why not 2nf", "why is 3nf failing", etc.)
        # Check if question asks why a normal form fails or which dependency violates it
        nf_fail_match = re.search(r"(why\s+(?:is|isn't|does|is not|are|not)\b.*?\b(1nf|2nf|3nf|4nf|first|second|third|fourth)\b|\bwhy\s+not\s+(1nf|2nf|3nf|4nf)\b|\bwhy\s+(?:is\s+)?(1nf|2nf|3nf|4nf)\s+failing\b|\bviolate\w*\s+.*?\b(1nf|2nf|3nf|4nf|third|second|first|fourth)\b|\bwhich\s+dependenc\w*\s+violates?\b|\bwhich\s+mvd\s+violates?\b)", q_norm)
        if nf_fail_match:
            # Extract stage if present
            stage = None
            if "1nf" in q_norm or "first" in q_norm:
                stage = "1NF"
            elif "2nf" in q_norm or "second" in q_norm:
                stage = "2NF"
            elif "3nf" in q_norm or "third" in q_norm:
                stage = "3NF"
            elif "4nf" in q_norm or "fourth" in q_norm:
                stage = "4NF"
            return "WHY_NF_FAIL", stage

        # 3. Stage Satisfaction / Pass ("Why does this satisfy 3NF?", "why is it in 2nf", "why is 3nf passed")
        nf_pass_match = re.search(r"(why\s+(?:is|does|are)\b.*?\b(?:satisf|pass|in\s+)(?:1nf|2nf|3nf|4nf|first|second|third|fourth))", q_norm)
        if nf_pass_match:
            stage = None
            if "1nf" in q_norm or "first" in q_norm:
                stage = "1NF"
            elif "2nf" in q_norm or "second" in q_norm:
                stage = "2NF"
            elif "3nf" in q_norm or "third" in q_norm:
                stage = "3NF"
            elif "4nf" in q_norm or "fourth" in q_norm:
                stage = "4NF"
            return "WHY_NF_PASS", stage

        # 4. Attribute Closure ("What is AB closure?", "Calculate closure of X", "show AB+", "closure of A")
        closure_match = re.search(r"(\bclosure\b|\b\w+\+)", q_norm)
        if closure_match:
            # Try to extract the target attributes
            target_match = re.search(r"closure\s+of\s+([a-zA-Z0-9_,\s]+)|([a-zA-Z0-9_]+)\s*\+|what\s+is\s+([a-zA-Z0-9_,\s]+)\s+closure", q_norm)
            target = None
            if target_match:
                target = target_match.group(1) or target_match.group(2) or target_match.group(3)
                if target:
                    target = target.strip()
            return "CLOSURE", target

        # 5. Candidate Keys & Superkeys ("find my keys", "what are the candidate keys", "which candidate keys do I have")
        if re.search(r"\b(candidate key|candidate keys|find keys|what are the keys|which keys|primary key|my keys|our keys)\b", q_norm):
            return "CANDIDATE_KEYS", None

        # 6. Prime Attributes ("which attributes are prime", "what are the prime attributes")
        if re.search(r"\b(prime attribute|prime attributes|which prime|non prime|non-prime)\b", q_norm):
            return "PRIME_ATTRIBUTES", None

        # 7. FD Determination ("Does A determine C", "is A -> C implied", "is A functionally determining C")
        det_match = re.search(r"\b(determine|determines|implied|functional determination)\b|\b(?:->|→)\b", q_norm)
        if det_match:
            if "trivial" in q_norm:
                return "FD_TRIVIALITY", None
            return "FD_DETERMINATION", None

        # 8. Triviality
        if "trivial" in q_norm:
            if "mvd" in q_norm or "↠" in q_norm:
                return "MVD_TRIVIALITY", None
            return "FD_TRIVIALITY", None

        # 9. Lossless Join ("Why is this decomposition lossless?", "is it lossless", "tableau chase")
        if re.search(r"\b(lossless|lossless join|tableau|spurious tuples)\b", q_norm):
            return "LOSSLESS_JOIN", None

        # 10. Dependency Preservation ("Why is dependency preservation false?", "is dependency preserved")
        if re.search(r"\b(dependency preservation|preserved|preservation)\b", q_norm):
            return "DEPENDENCY_PRESERVATION", None

        # 11. Decomposition ("How could I decompose this?", "show decomposition", "suggest decomposition", "how to decompose")
        if re.search(r"\b(decompose|decomposition|split relation|how to reach 3nf|how to reach 2nf)\b", q_norm):
            return "DECOMPOSITION", None

        # 12. Next Action / What to do ("what should i do next", "suggest next action", "what next")
        if re.search(r"\b(what should i (do|change)|next step|next action|what to do)\b", q_norm):
            return "NEXT_ACTION", None

        # 13. General "Why" on current selected entity
        if re.search(r"^(why\??|why\s+is\s+that\??|why\s+does\s+this\s+matter\??|why\s+relevant\??)$", q_norm):
            return "WHY_NF_FAIL", None

        # Default: Unknown question outside supported scope
        return "UNKNOWN", None
