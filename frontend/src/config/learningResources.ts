import { LearningResource, EducationalVideoConfig, LearningTopic } from '../types';

export const LEARNING_RESOURCES: LearningResource[] = [
  // --- Textbooks ---
  {
    id: 'silberschatz-dbms',
    title: 'Database System Concepts',
    author: 'Abraham Silberschatz, Henry F. Korth, S. Sudarshan',
    type: 'book',
    description:
      'The definitive benchmark textbook on relational database theory, formal dependency preservation, and normal form decomposition algorithms.',
    citation: '7th Edition, McGraw-Hill Education, Chapters 7 & 8 (Relational Database Design).',
    url: 'https://www.db-book.com/',
    topicIds: ['foundations', 'fds', 'keys', 'closure', '1nf', '2nf', '3nf', '4nf', 'decomposition', 'lossless', 'preservation'],
    badge: 'Core Curriculum',
  },
  {
    id: 'elmasri-navathe',
    title: 'Fundamentals of Database Systems',
    author: 'Ramez Elmasri, Shamkant B. Navathe',
    type: 'book',
    description:
      'Rigorous coverage of relational design fundamentals, informal design guidelines, candidate key discovery, and minimal cover derivations.',
    citation: '7th Edition, Pearson, Chapter 14 (Basics of Functional Dependencies and Normalization).',
    url: 'https://www.pearson.com/en-us/subject-catalog/p/fundamentals-of-database-systems/P200000003290',
    topicIds: ['fds', 'keys', 'closure', '1nf', '2nf', '3nf'],
    badge: 'Recommended',
  },
  {
    id: 'ramakrishnan-gehrke',
    title: 'Database Management Systems',
    author: 'Raghu Ramakrishnan, Johannes Gehrke',
    type: 'book',
    description:
      'Focuses on the practical engineering impact of update anomalies, lossy joins, and decomposition into BCNF and 3NF.',
    citation: '3rd Edition, McGraw-Hill, Chapter 19 (Schema Refinement and Normal Forms).',
    topicIds: ['1nf', '2nf', '3nf', '4nf', 'decomposition'],
    badge: 'Reference',
  },

  // --- Landmark Research Papers ---
  {
    id: 'codd-1970',
    title: 'A Relational Model of Data for Large Shared Data Banks',
    author: 'E. F. Codd (Communications of the ACM)',
    type: 'paper',
    description:
      'The foundational Turing-award-winning paper that introduced relational data representation and First Normal Form (1NF) domain atomicity.',
    citation: 'CACM Vol. 13, No. 6, pp. 377–387, June 1970.',
    url: 'https://dl.acm.org/doi/10.1145/362384.362685',
    topicIds: ['foundations', '1nf'],
    badge: 'Historic Landmark',
  },
  {
    id: 'codd-1971',
    title: 'Further Normalization of the Data-Base Relational Model',
    author: 'E. F. Codd (Courant Computer Science Symposia)',
    type: 'paper',
    description:
      'Introduced Second Normal Form (2NF) and Third Normal Form (3NF), defining functional dependency constraints and transitive anomalies.',
    citation: 'Data Base Systems, Prentice-Hall, pp. 33–64, 1972.',
    topicIds: ['2nf', '3nf', 'fds'],
    badge: 'Foundational',
  },
  {
    id: 'fagin-1977',
    title: 'Multivalued Dependencies and a New Normal Form for Relational Databases',
    author: 'Ronald Fagin (ACM Transactions on Database Systems)',
    type: 'paper',
    description:
      'Formulated Multivalued Dependencies (MVDs) and proved the necessary and sufficient condition for lossless decomposition into Fourth Normal Form (4NF).',
    citation: 'ACM TODS, Vol. 2, No. 3, pp. 262–278, Sept 1977.',
    url: 'https://dl.acm.org/doi/10.1145/320557.320571',
    topicIds: ['4nf', 'decomposition', 'lossless'],
    badge: 'Turing Award Paper',
  },
  {
    id: 'bernstein-1976',
    title: 'Synthesizing Third Normal Form Relations from Functional Dependencies',
    author: 'Philip A. Bernstein (ACM Transactions on Database Systems)',
    type: 'paper',
    description:
      'Demonstrated polynomial-time synthesis algorithm for decomposing arbitrary relations into 3NF while strictly guaranteeing dependency preservation.',
    citation: 'ACM TODS, Vol. 1, No. 4, pp. 277–298, Dec 1976.',
    url: 'https://dl.acm.org/doi/10.1145/320493.320498',
    topicIds: ['3nf', 'decomposition', 'preservation'],
    badge: 'Algorithm Basis',
  },

  // --- Academic University Courseware & Notes ---
  {
    id: 'stanford-infolab',
    title: 'Stanford InfoLab CS145: Relational Design Theory',
    author: 'Prof. Jennifer Widom, Stanford University',
    type: 'course',
    description:
      'Course lecture materials covering functional dependency discovery, Armstrong’s axioms, attribute closure proofs, and BCNF/3NF decomposition.',
    citation: 'Stanford University School of Engineering.',
    url: 'https://web.stanford.edu/class/cs145/',
    topicIds: ['fds', 'closure', 'keys', '3nf', 'decomposition'],
    badge: 'Lecture Notes',
  },
  {
    id: 'mit-opencourseware',
    title: 'MIT OpenCourseWare 6.830: Database Systems',
    author: 'Prof. Samuel Madden, MIT EECS',
    type: 'course',
    description:
      'Covers tableau chase algorithms for lossless joins, projection of functional dependencies, and trade-offs between normal forms and query latency.',
    citation: 'Massachusetts Institute of Technology OpenCourseWare.',
    url: 'https://ocw.mit.edu/courses/6-830-database-systems-fall-2010/',
    topicIds: ['decomposition', 'lossless', 'preservation'],
    badge: 'Courseware',
  },
  {
    id: 'cmu-db',
    title: 'CMU 15-445/645: Database Systems',
    author: 'Prof. Andy Pavlo, Carnegie Mellon University',
    type: 'course',
    description:
      'In-depth lectures on relational models, database storage, and operational real-world motivations for eliminating redundant database tuples.',
    citation: 'Carnegie Mellon University Database Group.',
    url: 'https://15445.courses.cs.cmu.edu/',
    topicIds: ['foundations', '1nf', '2nf', '3nf'],
    badge: 'Video Lectures',
  },
];

export const EDUCATIONAL_VIDEO_CONFIG: EducationalVideoConfig = {
  title: 'Comprehensive DBMS Normalization Lecture (1NF through 4NF & 5NF)',
  description:
    'Comprehensive pedagogical lecture explaining database normalization from 1NF through 5NF with step-by-step table decomposition examples.',
  sourceType: 'external',
  source: 'https://youtu.be/GFQaEYEc8_8?si=BrW8ZzglClywsFC4',
  duration: '28:44',
  topic: '1NF, 2NF, 3NF, 4NF, 5NF Normalization',
  keyTimestamps: [
    { time: '00:00', label: 'What is database normalization?' },
    { time: '03:55', label: 'First Normal Form (1NF)' },
    { time: '10:24', label: 'Second Normal Form (2NF)' },
    { time: '16:08', label: 'Third Normal Form (3NF)' },
    { time: '20:29', label: 'Fourth Normal Form (4NF)' },
    { time: '23:47', label: 'Fifth Normal Form (5NF)' },
    { time: '26:41', label: 'Summary and review' },
  ],
};

export const LEARNING_TOPICS: LearningTopic[] = [
  {
    id: 'foundations',
    title: 'Relational Model Foundations',
    shortTitle: 'Foundations',
    category: 'foundations',
    summary:
      'A relation schema R(A1, A2, ..., An) defines the structure of a relation, whereas a relation instance r(R) is a set of distinct tuples. Attributes map to indivisible domains. Uniqueness of tuples is guaranteed by superkeys.',
    keyTakeaways: [
      'Relation schema denotes the header/metadata; relation instance denotes stored tuples.',
      'A Superkey is any attribute set K such that no two distinct tuples agree on all attributes of K.',
      'A Candidate Key is a minimal superkey: removing any attribute destroys uniqueness.',
      'Prime attributes belong to at least one candidate key; non-prime attributes belong to none.',
    ],
  },
  {
    id: 'fds',
    title: 'Functional Dependencies (FDs)',
    shortTitle: 'Functional Dependencies',
    category: 'dependencies',
    summary:
      'Given relation R, an FD X → Y states that if two tuples agree on attribute set X, they must agree on attribute set Y. X is the determinant, and Y is the dependent set.',
    formalCondition: '∀ t1, t2 ∈ r(R): t1[X] = t2[X] ⟹ t1[Y] = t2[Y]',
    keyTakeaways: [
      'Trivial FD: Y ⊆ X (always holds vacuously, e.g. AB → A).',
      'Non-Trivial FD: Y ⊈ X (contains non-determinant attributes).',
      'Full Functional Dependency: Y is functionally dependent on X, but not on any proper subset of X.',
      'Partial Dependency: Y depends on a proper subset of a composite candidate key.',
      'Transitive Dependency: X → Y and Y → Z hold, where Y does not determine X and Z is not prime.',
    ],
    exampleRelation: {
      name: 'STUDENT',
      attributes: ['StudentID', 'StudentName', 'Department', 'HOD'],
      candidate_keys: [['StudentID']],
      functional_dependencies: [
        { left: ['StudentID'], right: ['StudentName', 'Department'] },
        { left: ['Department'], right: ['HOD'] },
      ],
    },
    analyzerPresetIndex: 0,
  },
  {
    id: 'keys',
    title: 'Candidate Keys & Superkeys',
    shortTitle: 'Candidate Keys',
    category: 'dependencies',
    summary:
      'Finding candidate keys requires computing attribute closures under Armstrong’s axioms. A candidate key is both sufficient (closure reaches all attributes) and minimal (no proper subset reaches all attributes).',
    formalCondition: 'X is a candidate key ⟺ X⁺ = R and ∀ Y ⊂ X: Y⁺ ≠ R',
    keyTakeaways: [
      'A relation may have multiple candidate keys (e.g. {StudentID} and {Email}).',
      'Composite keys contain two or more attributes (e.g. {StudentID, CourseID}).',
      'Attributes not present on the RHS of any non-trivial FD must be in every candidate key.',
      'Attributes that appear only on the RHS cannot be part of any minimal candidate key.',
    ],
    analyzerPresetIndex: 1,
  },
  {
    id: 'closure',
    title: 'Attribute Closure (X⁺)',
    shortTitle: 'Attribute Closure',
    category: 'dependencies',
    summary:
      'The attribute closure X⁺ under dependency set F is the complete set of attributes functionally determined by X. The standard closure algorithm repeatedly sweeps through F until no new attributes can be added.',
    formalCondition: 'Initialize closure = X. While changed: for each A → B in F: if A ⊆ closure, closure = closure ∪ B.',
    keyTakeaways: [
      'Attribute closure runs in polynomial time (O(n · |F|)).',
      'To test if X is a superkey, check whether X⁺ = R.',
      'To verify if FD X → Y is implied by F, check whether Y ⊆ X⁺.',
      'Forms the computational backbone for candidate key discovery and 3NF testing.',
    ],
    analyzerPresetIndex: 0,
  },
  {
    id: '1nf',
    title: 'First Normal Form (1NF)',
    shortTitle: '1NF',
    category: 'normal_forms',
    summary:
      'A relation is in 1NF if and only if the domain of each attribute contains only atomic (indivisible) values, and each cell contains exactly one single value from that domain.',
    formalCondition: 'All attribute domains are atomic; no repeating groups, arrays, or nested relations in cells.',
    keyTakeaways: [
      'Prohibits multi-valued entries (e.g. "98765, 91234" in a single Phone column).',
      'Prohibits repeating columns (e.g. Phone1, Phone2, Phone3 representing the same conceptual entity).',
      'Schema-only vs Tuple data: Structural verification assumes atomicity unless sample tuples are inspected.',
      'Tuples must be unique and identifiable by a valid primary key.',
    ],
    exampleRelation: {
      name: 'STUDENT_CONTACT',
      attributes: ['StudentID', 'Name', 'PhoneNumbers'],
      candidate_keys: [['StudentID']],
      functional_dependencies: [{ left: ['StudentID'], right: ['Name'] }],
    },
    analyzerPresetIndex: 3,
  },
  {
    id: '2nf',
    title: 'Second Normal Form (2NF)',
    shortTitle: '2NF',
    category: 'normal_forms',
    summary:
      'A relation is in 2NF if and only if it is in 1NF and every non-prime attribute is fully functionally dependent on every candidate key of the relation (i.e. no partial dependencies exist).',
    formalCondition: '1NF holds AND ¬∃ (A ⊂ K, B ∉ Prime): A → B where K is a candidate key.',
    keyTakeaways: [
      'Partial Dependency: A non-prime attribute depends on only a proper subset of a composite candidate key.',
      'Single-attribute candidate keys vacuously satisfy 2NF because no proper non-empty subset of a single attribute exists.',
      'Decomposition strategy: Extract the partial determinant and its dependent attributes into a new relation.',
      'Removes redundancy where non-key data repeats for every instance of a composite key.',
    ],
    exampleRelation: {
      name: 'ENROLLMENT',
      attributes: ['StudentID', 'CourseID', 'StudentName', 'CourseName', 'Grade'],
      candidate_keys: [['StudentID', 'CourseID']],
      functional_dependencies: [
        { left: ['StudentID'], right: ['StudentName'] },
        { left: ['CourseID'], right: ['CourseName'] },
        { left: ['StudentID', 'CourseID'], right: ['Grade'] },
      ],
    },
    analyzerPresetIndex: 1,
  },
  {
    id: '3nf',
    title: 'Third Normal Form (3NF)',
    shortTitle: '3NF',
    category: 'normal_forms',
    summary:
      'A relation is in 3NF if and only if for every non-trivial functional dependency X → A, either X is a superkey OR A is a prime attribute (belongs to at least one candidate key).',
    formalCondition: '∀ non-trivial X → A: (X is a superkey) ∨ (A ∈ Prime Attributes).',
    keyTakeaways: [
      'Eliminates transitive dependencies between non-prime attributes (e.g. StudentID → DeptID, DeptID → DeptName).',
      'The prime attribute relaxation (A ∈ Prime) allows 3NF to always guarantee dependency preservation.',
      'Difference from BCNF: BCNF strictly requires X to be a superkey without the prime attribute exception.',
      '3NF synthesis algorithm guarantees both Lossless Join and Dependency Preservation in polynomial time.',
    ],
    exampleRelation: {
      name: 'STUDENT_DEPT',
      attributes: ['StudentID', 'StudentName', 'DeptID', 'DeptName', 'Building'],
      candidate_keys: [['StudentID']],
      functional_dependencies: [
        { left: ['StudentID'], right: ['StudentName', 'DeptID'] },
        { left: ['DeptID'], right: ['DeptName', 'Building'] },
      ],
    },
    analyzerPresetIndex: 2,
  },
  {
    id: '4nf',
    title: 'Fourth Normal Form (4NF)',
    shortTitle: '4NF',
    category: 'normal_forms',
    summary:
      'A relation is in 4NF if and only if for every non-trivial multivalued dependency X ↠ Y, X is a superkey. 4NF eliminates anomalies caused by independent multivalued facts stored in the same relation.',
    formalCondition: '∀ non-trivial X ↠ Y: X is a superkey of R.',
    keyTakeaways: [
      'Multivalued Dependency (MVD) X ↠ Y states that the set of Y values associated with X depends solely on X and is independent of remaining attributes.',
      'Trivial MVD: Y ⊆ X or X ∪ Y = R (vacuously holds).',
      'Non-trivial MVD on non-superkey determinant causes multiplicative tuple explosion (combinatorial redundancy).',
      'Decomposition: Split into R1(X, Y) and R2(X, R \\ Y).',
    ],
    exampleRelation: {
      name: 'STUDENT_ACTIVITIES',
      attributes: ['StudentID', 'Hobby', 'Language'],
      candidate_keys: [['StudentID', 'Hobby', 'Language']],
      functional_dependencies: [],
      multivalued_dependencies: [
        { left: ['StudentID'], right: ['Hobby'] },
        { left: ['StudentID'], right: ['Language'] },
      ],
    },
    analyzerPresetIndex: 4,
  },
  {
    id: 'decomposition',
    title: 'Relational Decomposition',
    shortTitle: 'Decomposition',
    category: 'decomposition',
    summary:
      'Decomposition replaces a single problematic relation R with a set of smaller relations {R1, R2, ..., Rk} such that each Ri is in a higher normal form. A valid decomposition must satisfy the Lossless Join property.',
    keyTakeaways: [
      'Goals: eliminate insert, update, and delete anomalies while minimizing storage redundancy.',
      'Attribute preservation: R1 ∪ R2 ∪ ... ∪ Rk = R.',
      'A decomposition is invalid if joining the sub-relations produces spurious tuples not in the original relation.',
      'Preserving functional dependencies is desirable to avoid costly inter-relational joins during updates.',
    ],
  },
  {
    id: 'lossless',
    title: 'Lossless-Join Verification (Tableau Chase)',
    shortTitle: 'Lossless Join',
    category: 'decomposition',
    summary:
      'A decomposition is lossless if joining decomposed relations reconstructs the exact original relation without spurious tuples. For binary decompositions, Fagin’s Theorem applies; for general decompositions, the Tableau Chase algorithm provides formal proof.',
    formalCondition: 'r(R) = π_R1(r) ⨝ π_R2(r) ⨝ ... ⨝ π_Rk(r) under dependency set F.',
    keyTakeaways: [
      'Tableau Chase constructs a matrix with rows for sub-relations and columns for attributes.',
      'Distinguished symbols (a_j) represent attributes present in sub-relation; non-distinguished (b_ij) represent absent attributes.',
      'Applying FDs equates symbols. If any row becomes entirely distinguished (all a_j), the decomposition is formally proven lossless.',
      'If fixed point is reached without an all-distinguished row, the decomposition is lossy.',
    ],
  },
  {
    id: 'preservation',
    title: 'Dependency Preservation',
    shortTitle: 'Dependency Preservation',
    category: 'decomposition',
    summary:
      'A decomposition preserves dependencies if the union of projected dependencies on each sub-relation logically implies all original dependencies F. This ensures constraints can be validated locally within individual relations.',
    formalCondition: '(π_R1(F) ∪ π_R2(F) ∪ ... ∪ π_Rk(F))⁺ = F⁺.',
    keyTakeaways: [
      'Projected dependency π_Ri(F) contains all FDs X → Y implied by F where X ∪ Y ⊆ Ri.',
      'Testing: For each original FD X → Y in F, compute closure of X under projected dependencies; check if Y is contained.',
      '3NF always admits a lossless, dependency-preserving decomposition.',
      'BCNF guarantees lossless join, but does not always guarantee dependency preservation.',
    ],
  },
];
