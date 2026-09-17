"""
Academic templates and conceptual definitions for the Normalization Assistant.

Every template provides exact definitions according to standard relational database theory:
- Codd, Date, Elmasri & Navathe, Silberschatz.
"""

CONCEPT_DEFINITIONS = {
    "1NF": (
        "First Normal Form (1NF) requires that all attribute domains contain only atomic (indivisible) "
        "values and that there are no repeating groups or multi-valued attributes in any tuple. "
        "Additionally, each relation must have a unique identifier (primary/candidate key)."
    ),
    "2NF": (
        "Second Normal Form (2NF) requires that the relation is in 1NF and that every non-prime attribute "
        "is fully functionally dependent on every candidate key. That is, no non-prime attribute may depend "
        "on a proper subset of any composite candidate key (no partial dependencies)."
    ),
    "3NF": (
        "Third Normal Form (3NF) requires that the relation is in 2NF and that for every non-trivial functional "
        "dependency X → A, either X is a superkey OR A is a prime attribute (part of at least one candidate key). "
        "This eliminates transitive dependencies of non-prime attributes on candidate keys."
    ),
    "4NF": (
        "Fourth Normal Form (4NF) requires that for every non-trivial multivalued dependency X ↠ Y, "
        "X must be a superkey of the relation. This prevents independent multi-valued facts from "
        "producing combinatorial redundancy and update anomalies."
    ),
    "CANDIDATE_KEY": (
        "A candidate key is a minimal superkey: a minimal set of attributes K such that K functionally "
        "determines all attributes of the relation (K⁺ = R), and no proper subset of K has this property."
    ),
    "SUPERKEY": (
        "A superkey is any set of attributes S whose attribute closure under F contains all attributes "
        "of the relation (S⁺ = R). Every candidate key is a superkey, but not all superkeys are minimal."
    ),
    "PRIME_ATTRIBUTE": (
        "A prime attribute is any attribute that is a member of at least one candidate key of the relation. "
        "All other attributes are non-prime."
    ),
    "PARTIAL_DEPENDENCY": (
        "A partial dependency occurs when a non-prime attribute A is functionally determined by a proper subset X "
        "of a composite candidate key K (i.e. X ⊂ K and X → A). Partial dependencies violate 2NF."
    ),
    "TRANSITIVE_DEPENDENCY": (
        "A transitive dependency occurs when X → Y and Y → Z, where X is a candidate key, Y is not a superkey, "
        "and Z is a non-prime attribute not in X or Y. In 3NF, non-prime attributes cannot be transitively dependent on keys."
    ),
    "MULTIVALUED_DEPENDENCY": (
        "A multivalued dependency X ↠ Y holds in relation R(X, Y, Z) if the set of Y-values associated with a given "
        "X-value is completely independent of the Z-values. A non-trivial MVD where X is not a superkey violates 4NF."
    ),
    "LOSSLESS_JOIN": (
        "A decomposition of R into {R1, R2, ..., Rn} is lossless if the natural join of all decomposed relations "
        "reconstructs exactly the original relation R without producing any spurious tuples (⋈ Ri = R). "
        "For binary decompositions, R1 ∩ R2 must be a superkey of R1 or R2."
    ),
    "DEPENDENCY_PRESERVATION": (
        "A decomposition is dependency-preserving if the closure of the union of all functional dependencies "
        "projected onto the individual sub-relations covers all original functional dependencies ((∪ π_Ri(F))⁺ = F⁺). "
        "This allows integrity constraints to be enforced locally without expensive joins."
    ),
    "DECOMPOSITION": (
        "Normalization decomposes a relation with anomalies into multiple smaller relations that satisfy a higher "
        "normal form while preserving all information (lossless join) and, whenever possible, all functional dependencies."
    ),
}

UNSUPPORTED_FALLBACK = (
    "I am your deterministic DBMS Normalization Assistant. I can answer questions directly grounded "
    "in relational database theory and your current schema analysis.\n\n"
    "Supported topics:\n"
    "• Concept definitions: 'What is 1NF?', 'What is 2NF?', 'What is 3NF?', 'What is 4NF?', 'What is a candidate key?'\n"
    "• Stage reasoning: 'Why is this relation not in 2NF?', 'Why is 3NF failing?', 'Why does this satisfy 4NF?'\n"
    "• Keys & attributes: 'What are the candidate keys?', 'Which attributes are prime?'\n"
    "• Closure: 'What is AB closure?', 'Calculate closure of StudentID'\n"
    "• Decomposition: 'How can I decompose this?', 'Is this decomposition lossless?'\n"
    "• Next actions: 'What should I do next?'"
)
