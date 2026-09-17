export type Theme = 'light' | 'dark';

export interface HealthResponse {
  status: string;
  version: string;
  service: string;
  environment: string;
  timestamp: string;
}

export interface TeamMember {
  name: string;
  registerNumber: string;
  role: string;
  photoUrl?: string;
}

export interface Guide {
  name: string;
  designation: string;
  department?: string;
  institution?: string;
}

export interface ProjectInfo {
  formalTitle: string;
  productTitle: string;
  course: string;
  assignedTopic: string;
  tagline: string;
  version: string;
  teamMembers: TeamMember[];
  guide: Guide;
}

// -----------------------------------------------------------------------------
// Canonical Domain Contracts (Phase 2 & Forward)
// -----------------------------------------------------------------------------

export interface FunctionalDependency {
  id?: string;
  left: string[];
  right: string[];
}

export interface MultivaluedDependency {
  id?: string;
  left: string[];
  right: string[];
}

export interface SampleTuple {
  [attributeName: string]: string | number | null;
}

export interface RelationSchema {
  name: string;
  attributes: string[];
  candidate_keys?: string[][];
  functional_dependencies: FunctionalDependency[];
  multivalued_dependencies: MultivaluedDependency[];
  sample_data?: SampleTuple[];
}

export interface ValidationIssue {
  code: string;
  path: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface ValidationSummary {
  relation_name: string;
  attribute_count: number;
  candidate_key_count: number;
  fd_count: number;
  mvd_count: number;
  sample_row_count: number;
  is_ready_for_analysis: boolean;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
  canonical_input?: RelationSchema | null;
  summary?: ValidationSummary | null;
}

export interface ExampleSchemaItem {
  id: string;
  title: string;
  target_topic: string;
  description: string;
  schema: RelationSchema;
}

// -----------------------------------------------------------------------------
// Phase 3 Attribute Closure & FD Engine Contracts
// -----------------------------------------------------------------------------

export interface ClosureStep {
  step_number: number;
  before_attributes: string[];
  applied_fd?: FunctionalDependency | null;
  added_attributes: string[];
  after_attributes: string[];
  explanation: string;
}

export interface ClosureResult {
  relation_name: string;
  input_attributes: string[];
  closure_attributes: string[];
  steps: ClosureStep[];
  iterations: number;
  applied_fds: FunctionalDependency[];
  fixed_point_reached: boolean;
  is_superkey: boolean;
  superkey_reason: string;
}

export interface ClosureRequest {
  relation_name?: string;
  attributes: string[];
  functional_dependencies: FunctionalDependency[];
  target_attributes: string[];
}

export interface DeterminationRequest {
  relation_name?: string;
  attributes: string[];
  functional_dependencies: FunctionalDependency[];
  lhs: string[];
  rhs: string[];
}

export interface DeterminationResult {
  determined: boolean;
  lhs: string[];
  rhs: string[];
  lhs_closure: string[];
  missing_attributes: string[];
  explanation: string;
  closure_result: ClosureResult;
}

export interface TrivialFDCheckResult {
  is_trivial: boolean;
  is_completely_trivial: boolean;
  trivial_attributes: string[];
  non_trivial_attributes: string[];
  explanation: string;
}

// -----------------------------------------------------------------------------
// Phase 4 Candidate-Key Engine & Superkey Contracts
// -----------------------------------------------------------------------------

export interface SuperkeyCheckRequest {
  relation_name?: string;
  attributes: string[];
  functional_dependencies: FunctionalDependency[];
  target_attributes: string[];
}

export interface SuperkeyCheckResult {
  target_attributes: string[];
  is_superkey: boolean;
  closure: string[];
  missing_attributes: string[];
  explanation: string;
}

export interface MinimalityCheck {
  subset: string[];
  subset_closure: string[];
  is_superkey: boolean;
  explanation: string;
}

export interface KeyVerificationRequest {
  relation_name?: string;
  attributes: string[];
  functional_dependencies: FunctionalDependency[];
  candidate_key: string[];
}

export interface KeyVerificationResult {
  candidate_key: string[];
  is_superkey: boolean;
  is_minimal: boolean;
  is_candidate_key: boolean;
  closure: string[];
  missing_attributes: string[];
  violating_subset?: string[] | null;
  minimality_checks: MinimalityCheck[];
  explanation: string;
}

export interface KeyReasoningStep {
  step_number: number;
  title: string;
  description: string;
  details?: Record<string, unknown>;
}

export interface KeyDiscoveryRequest {
  relation_name?: string;
  attributes: string[];
  functional_dependencies: FunctionalDependency[];
  max_combinations?: number;
}

export interface KeyDiscoveryResult {
  relation_name: string;
  candidate_keys: string[][];
  prime_attributes: string[];
  non_prime_attributes: string[];
  essential_attributes: string[];
  explored_combinations_count: number;
  reasoning_steps: KeyReasoningStep[];
  warnings: string[];
}

export interface CandidateKeyAnalysisRequest {
  relation_name?: string;
  attributes: string[];
  functional_dependencies: FunctionalDependency[];
  user_candidate_keys?: string[][];
  max_combinations?: number;
}

export interface CandidateKeyAnalysisResult {
  relation_name: string;
  discovered_candidate_keys: string[][];
  prime_attributes: string[];
  non_prime_attributes: string[];
  essential_attributes: string[];
  user_key_verifications: KeyVerificationResult[];
  reasoning_steps: KeyReasoningStep[];
  warnings: string[];
}


// -----------------------------------------------------------------------------
// Future Normalization Engine Contracts (Phases 3 - 7)
// -----------------------------------------------------------------------------

export type NormalForm = 'UNNORMALIZED' | '1NF' | '2NF' | '3NF' | '4NF';

export interface Violation {
  normalForm: NormalForm;
  violatingElement: string;
  reason: string;
  remedy?: string;
}

export interface ReasoningStep {
  stepNumber: number;
  stage: NormalForm;
  title: string;
  explanation: string;
  intermediateData?: Record<string, unknown>;
}

export interface StageAnalysis {
  normalForm: NormalForm;
  isSatisfied: boolean;
  violations: Violation[];
  explanation: string;
  reasoningSteps: ReasoningStep[];
  decompositions: Array<{
    name: string;
    attributes: string[];
    candidateKeys: string[][];
  }>;
}

export interface AnalysisResult {
  inputRelation: RelationSchema;
  derivedCandidateKeys: string[][];
  primeAttributes: string[];
  nonPrimeAttributes: string[];
  highestNormalForm: NormalForm;
  stages: Record<string, StageAnalysis>;
  summary: string;
  isLossless?: boolean;
  isDependencyPreserving?: boolean;
}

// -----------------------------------------------------------------------------
// Phase 5: Normalization Analysis Contracts (1NF & 2NF)
// -----------------------------------------------------------------------------

export type NFStatus = 'SATISFIED' | 'VIOLATED' | 'BLOCKED_BY_PREREQUISITE' | 'INSUFFICIENT_DATA';

export interface NF1Violation {
  attribute: string;
  row_index?: number | null;
  observed_value: unknown;
  reason_code: string;
  explanation: string;
}

export interface NF1Transformation {
  original_tuples: Record<string, unknown>[];
  transformed_tuples: Record<string, unknown>[];
  explanation: string;
}

export interface NF1Result {
  status: NFStatus;
  is_satisfied: boolean;
  reason_code: string;
  message: string;
  violations: NF1Violation[];
  attributes_involved: string[];
  sample_cells_involved: Array<{
    row_index: number;
    attribute: string;
    value: string;
    split_values: string[];
  }>;
  reasoning_steps: string[];
  transformation?: NF1Transformation | null;
  limitations: string[];
}

export interface PartialDependency {
  determinant: string[];
  dependent_attributes: string[];
  affected_candidate_key: string[];
  is_implied: boolean;
  source_fd?: string | null;
  explanation: string;
}

export interface ProposedRelation {
  name: string;
  attributes: string[];
  primary_key: string[];
  functional_dependencies: FunctionalDependency[];
  purpose: string;
}

export interface DecompositionProposal {
  source_relation: string;
  proposed_relations: ProposedRelation[];
  reason_code: string;
  explanation: string;
  verification_status: 'NOT_YET_VERIFIED' | 'VERIFIED_LOSSLESS' | 'VERIFIED_PRESERVING' | 'VERIFIED_BOTH' | 'FAILED_VERIFICATION';
  lossless_join?: LosslessJoinResult | null;
  dependency_preservation?: DependencyPreservationResult | null;
}

export interface NF2Result {
  status: NFStatus;
  is_satisfied: boolean;
  reason_code: string;
  message: string;
  prerequisite_1nf_status: NFStatus;
  candidate_keys: string[][];
  composite_keys: string[][];
  prime_attributes: string[];
  non_prime_attributes: string[];
  partial_dependencies: PartialDependency[];
  reasoning_steps: KeyReasoningStep[];
  decomposition_proposal?: DecompositionProposal | null;
  limitations: string[];
}

export interface BasicNormalizationAnalysisResult {
  relation_name: string;
  attributes: string[];
  input_fingerprint: string;
  nf1: NF1Result;
  nf2: NF2Result;
  candidate_keys: string[][];
  prime_attributes: string[];
  non_prime_attributes: string[];
  summary_verdict: string;
}

// -----------------------------------------------------------------------------
// Phase 6: Advanced Normalization Contracts (3NF & 4NF)
// -----------------------------------------------------------------------------

export interface NF3Violation {
  functional_dependency: FunctionalDependency;
  determinant: string[];
  dependent_attributes: string[];
  determinant_is_superkey: boolean;
  dependent_attribute_prime_status: Record<string, boolean>;
  reason_code: string;
  transitive_chain?: string[] | null;
  explanation: string;
}

export interface NF3DependencyAnalysis {
  functional_dependency: FunctionalDependency;
  is_trivial: boolean;
  determinant_is_superkey: boolean;
  rhs_prime_status: Record<string, boolean>;
  satisfies_3nf: boolean;
  reason_code: string;
  explanation: string;
}

export interface NF3Result {
  status: NFStatus;
  is_satisfied: boolean;
  reason_code: string;
  message: string;
  prerequisite_2nf_status: NFStatus;
  candidate_keys: string[][];
  prime_attributes: string[];
  non_prime_attributes: string[];
  dependencies_analyzed: NF3DependencyAnalysis[];
  trivial_dependencies: FunctionalDependency[];
  satisfied_dependencies: FunctionalDependency[];
  violations: NF3Violation[];
  transitive_patterns: string[];
  reasoning_steps: KeyReasoningStep[];
  decomposition_proposal?: DecompositionProposal | null;
  limitations: string[];
}

export interface NF4Violation {
  mvd: MultivaluedDependency;
  determinant: string[];
  dependent_attributes: string[];
  is_trivial: boolean;
  determinant_is_superkey: boolean;
  reason_code: string;
  explanation: string;
}

export interface NF4MVDAnalysis {
  mvd: MultivaluedDependency;
  is_trivial: boolean;
  triviality_reason?: string | null;
  determinant_is_superkey: boolean;
  satisfies_4nf: boolean;
  reason_code: string;
  explanation: string;
}

export interface NF4Result {
  status: NFStatus;
  is_satisfied: boolean;
  reason_code: string;
  message: string;
  prerequisite_3nf_status: NFStatus;
  candidate_keys: string[][];
  mvds_analyzed: NF4MVDAnalysis[];
  trivial_mvds: MultivaluedDependency[];
  non_trivial_mvds: MultivaluedDependency[];
  violations: NF4Violation[];
  reasoning_steps: KeyReasoningStep[];
  decomposition_proposal?: DecompositionProposal | null;
  limitations: string[];
}

export interface FullNormalizationAnalysisResult extends BasicNormalizationAnalysisResult {
  nf3: NF3Result;
  nf4: NF4Result;
  highest_confirmed_normal_form: NormalForm;
}

// -----------------------------------------------------------------------------
// Phase 7 Decomposition, Lossless-Join & Dependency Preservation Contracts
// -----------------------------------------------------------------------------

export interface TableauChaseStep {
  step_number: number;
  applied_fd: FunctionalDependency;
  matching_rows: number[];
  target_attribute: string;
  equated_symbol: string;
  replaced_symbols: string[];
  tableau_snapshot: string[][];
  explanation: string;
}

export interface LosslessJoinResult {
  is_lossless: boolean;
  method: 'TABLEAU_CHASE' | 'FAGINS_THEOREM';
  attributes: string[];
  relations: string[];
  initial_tableau: string[][];
  chase_steps: TableauChaseStep[];
  final_tableau: string[][];
  distinguished_row_index?: number | null;
  reasoning: string;
}

export interface DependencyPreservationCheck {
  target_fd: FunctionalDependency;
  is_preserved: boolean;
  closure_under_projected: string[];
  relevant_relations: string[];
  explanation: string;
}

export interface DependencyPreservationResult {
  is_preserved: boolean;
  original_dependencies: FunctionalDependency[];
  projected_dependencies_by_relation: Record<string, FunctionalDependency[]>;
  all_projected_dependencies: FunctionalDependency[];
  checks: DependencyPreservationCheck[];
  preserved_dependencies: FunctionalDependency[];
  non_preserved_dependencies: FunctionalDependency[];
  reasoning: string;
}

export interface MinimalCoverResult {
  original_fds: FunctionalDependency[];
  rhs_split_fds: FunctionalDependency[];
  extraneous_removed_fds: FunctionalDependency[];
  minimal_fds: FunctionalDependency[];
  removed_extraneous_attributes: Array<{
    original_fd: string;
    extraneous_attribute: string;
    reduced_fd: string;
    reason: string;
  }>;
  removed_redundant_fds: FunctionalDependency[];
  reasoning_steps: string[];
}

export interface DecomposedRelation {
  name: string;
  attributes: string[];
  primary_key: string[];
  candidate_keys: string[][];
  functional_dependencies: FunctionalDependency[];
  projected_fds: FunctionalDependency[];
  projected_mvds?: MultivaluedDependency[];
  purpose: string;
  source_relation: string;
}

export interface DecompositionPlan {
  id: string;
  source_relation: string;
  stage: '1NF' | '2NF' | '3NF' | '4NF';
  trigger_type: string;
  trigger_dependency?: string | null;
  proposed_relations: DecomposedRelation[];
  lossless_join: LosslessJoinResult;
  dependency_preservation: DependencyPreservationResult;
  lineage: Record<string, any>;
  reasoning_steps: KeyReasoningStep[];
}

export interface DecompositionVerificationResult {
  source_relation: string;
  attributes: string[];
  decomposed_relations: Array<Record<string, any>>;
  lossless_join: LosslessJoinResult;
  dependency_preservation: DependencyPreservationResult;
  overall_status: 'VERIFIED_BOTH' | 'VERIFIED_LOSSLESS_ONLY' | 'VERIFIED_PRESERVING_ONLY' | 'FAILED_VERIFICATION';
  summary: string;
}

export interface DecompositionAnalyzeResult {
  target_normal_form: string;
  source_relation: string;
  source_attributes: string[];
  candidate_keys: string[][];
  plans: DecompositionPlan[];
  final_relations: DecomposedRelation[];
  verification: DecompositionVerificationResult;
  minimal_cover?: MinimalCoverResult | null;
  summary: string;
}

// -----------------------------------------------------------------------------
// Phase 8: Complete Interactive Visualization Engine & Normalization Journey
// -----------------------------------------------------------------------------

export type VisualizationMode = 'journey' | 'graph' | 'closure' | 'decomposition';

export interface VisualizationNode {
  id: string;
  label: string;
  type: 'attribute' | 'composite_determinant' | 'relation';
  attributes: string[];
  is_prime?: boolean;
  is_candidate_key?: boolean;
  position: { x: number; y: number };
  data: Record<string, any>;
}

export interface VisualizationEdge {
  id: string;
  source: string;
  target: string;
  type: 'fd' | 'mvd' | 'decomposition';
  label: string;
  is_violation?: boolean;
  violation_stage?: string | null;
  data: Record<string, any>;
}

export interface VisualizationGraphData {
  relationName: string;
  nodes: VisualizationNode[];
  edges: VisualizationEdge[];
  candidateKeys: string[][];
  primeAttributes: string[];
  nonPrimeAttributes: string[];
  summary: string;
}

export interface DecompositionTreeNode {
  id: string;
  name: string;
  attributes: string[];
  primaryKey: string[];
  parentId?: string | null;
  childrenIds: string[];
  triggerDependency?: string | null;
  stage?: string | null;
  isLossless?: boolean | null;
  isPreserved?: boolean | null;
}

export interface ClosureVisualizationStep {
  stepNumber: number;
  currentClosure: string[];
  appliedFd?: FunctionalDependency | null;
  newlyAdded: string[];
  isStarting: boolean;
  isFixedPoint: boolean;
  isSuperkey: boolean;
  explanation: string;
}

export interface ClosureVisualizationData {
  targetAttributes: string[];
  finalClosure: string[];
  isSuperkey: boolean;
  steps: ClosureVisualizationStep[];
}

export type SelectedEntity =
  | { type: 'attribute'; attribute: string; isPrime?: boolean; candidateKeys?: string[][] }
  | { type: 'dependency'; formula: string; left: string[]; right: string[]; kind: 'fd' | 'mvd'; isViolation?: boolean; violationStage?: string | null; explanation?: string }
  | { type: 'stage'; stage: '1NF' | '2NF' | '3NF' | '4NF'; status?: NFStatus; summary?: string }
  | { type: 'key'; key: string[] }
  | { type: 'relation'; name: string; attributes: string[]; primaryKey?: string[] }
  | null;

// -----------------------------------------------------------------------------
// Phase 9: Creativity, Contextual Assistant, Experiments & Practice Contracts
// -----------------------------------------------------------------------------

export interface AssistantContext {
  relation: string;
  attributes: string[];
  candidate_keys: string[][];
  superkeys?: string[][];
  prime_attributes: string[];
  non_prime_attributes: string[];
  functional_dependencies: FunctionalDependency[];
  multivalued_dependencies: MultivaluedDependency[];
  normal_forms: Record<string, string>;
  highest_confirmed_normal_form?: string | null;
  violations: Array<Record<string, any>>;
  decomposition_summary?: Record<string, any> | null;
  last_selected_dependency?: string | null;
  last_selected_violation?: string | null;
  last_selected_stage?: string | null;
  last_opened_closure?: Record<string, any> | null;
}

export interface AssistantAskRequest {
  question: string;
  analysis_id?: string | null;
  context?: AssistantContext | null;
}

export interface AssistantAskResponse {
  intent: string;
  answer: string;
  evidence_ids: string[];
  suggested_actions: string[];
  supported: boolean;
  learning_topic?: string | null;
  context_used?: Record<string, any>;
}

export interface AssistantMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  intent?: string;
  evidence_ids?: string[];
  suggested_actions?: string[];
  supported?: boolean;
  learning_topic?: string | null;
  timestamp: string;
}

export interface ExperimentDiff {
  attributes_added: string[];
  attributes_removed: string[];
  dependencies_added: Array<{ left: string[]; right: string[]; notation: string }>;
  dependencies_removed: Array<{ left: string[]; right: string[]; notation: string }>;
  mvds_added: Array<{ left: string[]; right: string[]; notation: string }>;
  mvds_removed: Array<{ left: string[]; right: string[]; notation: string }>;
  candidate_keys_added: string[][];
  candidate_keys_removed: string[][];
  prime_attributes_added: string[];
  prime_attributes_removed: string[];
  normal_forms_changed: Array<{ stage: string; before: string; after: string }>;
  violations_added: Array<Record<string, any>>;
  violations_removed: Array<Record<string, any>>;
  highest_normal_form_before: string;
  highest_normal_form_after: string;
}

export interface ExperimentAnalyzeRequest {
  original_input: RelationSchema;
  modified_input: RelationSchema;
}

export interface ExperimentAnalyzeResponse {
  original_analysis: FullNormalizationAnalysisResult;
  modified_analysis: FullNormalizationAnalysisResult;
  diff: ExperimentDiff;
  reasoning_changes: string[];
}

export interface ExperimentSnapshot {
  id: string;
  title: string;
  timestamp: string;
  schema: RelationSchema;
  highestNormalForm: string;
  note?: string;
}

export interface PracticeExercise {
  id: string;
  type: 'candidate-key' | 'closure' | 'highest-normal-form' | 'nf-violation' | 'mvd-analysis';
  title: string;
  prompt: string;
  schema_name: string;
  attributes: string[];
  functional_dependencies: FunctionalDependency[];
  multivalued_dependencies: MultivaluedDependency[];
  options?: string[];
  hint?: string;
  target_attributes?: string[];
}

export interface PracticeVerifyRequest {
  exercise_id: string;
  exercise_type: string;
  submitted_answer: any;
  attributes: string[];
  functional_dependencies: FunctionalDependency[];
  multivalued_dependencies: MultivaluedDependency[];
  metadata?: Record<string, any>;
}

export interface PracticeVerifyResponse {
  is_correct: boolean;
  expected_answer: any;
  feedback: string;
  reasoning_steps: string[];
}

export interface ExplainWhyData {
  title: string;
  stage?: '1NF' | '2NF' | '3NF' | '4NF';
  status?: string;
  formalCondition: string;
  checkedItem?: string;
  evidence: {
    candidateKeys?: string[][];
    dependencies?: string[];
    affectedAttributes?: string[];
    closure?: string;
    isSuperkey?: boolean;
    isPrime?: boolean;
  };
  conclusion: string;
  remedy?: string;
}

// -----------------------------------------------------------------------------
// Phase 10: Learn, Help, Reports & Configuration Contracts
// -----------------------------------------------------------------------------

export interface ReportSectionSelection {
  user_inputs: boolean;
  processing_steps: boolean;
  intermediate_results: boolean;
  final_output: boolean;
  decomposition: boolean;
  verification: boolean;
  figures: boolean;
}

export interface ReportRequestPayload {
  format: 'pdf' | 'docx' | 'txt';
  sections?: Partial<ReportSectionSelection>;
  schema_definition: RelationSchema;
  analysis_result: FullNormalizationAnalysisResult;
}

export interface LearningResource {
  id: string;
  title: string;
  type: 'book' | 'paper' | 'course' | 'video' | 'notes' | 'website';
  author?: string;
  description: string;
  url?: string;
  topicIds: string[];
  citation?: string;
  badge?: string;
}

export interface EducationalVideoConfig {
  title: string;
  description?: string;
  sourceType: 'local' | 'external';
  source: string;
  duration?: string;
  topic?: string;
  keyTimestamps?: { time: string; label: string }[];
}

export interface LearningTopic {
  id: string;
  title: string;
  shortTitle: string;
  category: 'foundations' | 'dependencies' | 'normal_forms' | 'decomposition';
  summary: string;
  formalCondition?: string;
  exampleRelation?: {
    name: string;
    attributes: string[];
    candidate_keys?: string[][];
    functional_dependencies: FunctionalDependency[];
    multivalued_dependencies?: MultivaluedDependency[];
  };
  keyTakeaways: string[];
  analyzerPresetIndex?: number;
}

// -----------------------------------------------------------------------------
// History & Persistence Models
// -----------------------------------------------------------------------------

export type HistoryAnalysisType = 'normalization' | 'keys' | 'closure' | 'snapshot';

export interface HistoryItemSummary {
  highest_normal_form?: string;
  violations_count?: number;
  candidate_keys?: string[];
  prime_attributes?: string[];
  non_prime_attributes?: string[];
  target_attributes?: string[];
  closure_attributes?: string[];
  steps_count?: number;
  decomposed_count?: number;
  is_superkey?: boolean;
}

export interface HistoryItem {
  id: string;
  title: string;
  analysis_type: HistoryAnalysisType;
  relation_name: string;
  highest_normal_form?: string;
  schema_data: RelationSchema;
  analysis_result?: any;
  summary?: HistoryItemSummary;
  created_at: string;
}

export interface HistoryListResponse {
  total: number;
  items: HistoryItem[];
}
