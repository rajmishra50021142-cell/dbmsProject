import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { SectionHeading } from '../components/ui/SectionHeading';
import {
  HelpCircle,
  Terminal,
  Cpu,
  BarChart3,
  Download,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Layers,
  FlaskConical,
  Info,
} from 'lucide-react';

export const HelpPage: React.FC = () => {

  const workflowSteps = [
    { step: 1, title: 'Open Schema Builder', desc: 'Navigate to Analyzer or Normalization page to view the active relation schema.', link: '/analyzer' },
    { step: 2, title: 'Specify Relation & Attributes', desc: 'Enter a relation name (e.g. ENROLLMENT) and comma-separated attribute names (e.g. StudentID, CourseID, Grade).', link: '/analyzer' },
    { step: 3, title: 'Declare or Auto-Discover Keys', desc: 'Enter manual candidate keys, or leave blank to let the closure engine automatically find all minimal superkeys.', link: '/keys' },
    { step: 4, title: 'Add Functional Dependencies (FDs)', desc: 'Enter deterministic functional dependencies in LHS → RHS format (e.g. StudentID → StudentName).', link: '/analyzer' },
    { step: 5, title: 'Add Multivalued Dependencies (MVDs)', desc: 'Enter independent multivalued facts using LHS ↠ RHS format (e.g. StudentID ↠ Hobby).', link: '/analyzer' },
    { step: 6, title: 'Optionally Add Sample Tuples', desc: 'Provide table rows to test 1NF cell atomicity and inspect data-level duplicate values.', link: '/analyzer' },
    { step: 7, title: 'Execute Normalization Analysis', desc: 'Click "Run Analysis". The engine validates inputs, computes attribute closures, and runs 1NF–4NF tests.', link: '/normalize' },
    { step: 8, title: 'Review 1NF to 4NF Journey', desc: 'Inspect the status badge for each stage (SATISFIED, VIOLATED, or BLOCKED_BY_PREREQUISITE).', link: '/normalize' },
    { step: 9, title: 'Explore "Explain Why" Proofs', desc: 'Click "Explain Why" on any normal form card to view mathematical evidence, affected attributes, and remedies.', link: '/normalize' },
    { step: 10, title: 'Inspect Graph & Closure Playback', desc: 'Switch to the Visualizer Workspace to view interactive SVG dependency graphs and closure step playback.', link: '/closure' },
    { step: 11, title: 'Verify Decompositions & Lossless Join', desc: 'Inspect proposed sub-relations, Tableau Chase symbol equating matrices, and dependency preservation checks.', link: '/normalize' },
    { step: 12, title: 'Simulate What-If Experiments', desc: 'Open Experiment Mode to add, modify, or remove dependencies without modifying your active draft.', link: '/normalize' },
    { step: 13, title: 'Download Academic Report', desc: 'Click "Download Report" to export a complete, formatted PDF, DOCX, or TXT documentation of your analysis.', link: '/normalize' },
  ];

  const controlsGlossary = [
    { name: 'Run Analysis', icon: <BarChart3 className="w-4 h-4 text-indigo-500" />, action: 'Executes full 1NF–4NF analysis, candidate key discovery, and formal decomposition verification.' },
    { name: 'Sync Draft', icon: <Cpu className="w-4 h-4 text-slate-500" />, action: 'Pulls the latest edited schema from the Schema Builder draft into the live laboratory.' },
    { name: 'Assistant', icon: <Sparkles className="w-4 h-4 text-indigo-500" />, action: 'Opens the contextual deterministic assistant to ask analytical questions about the active relation.' },
    { name: 'Explain Why', icon: <HelpCircle className="w-4 h-4 text-indigo-500" />, action: 'Opens an evidence dialog displaying mathematical proof, violated attributes, and academic remedy.' },
    { name: 'Experiment Mode', icon: <FlaskConical className="w-4 h-4 text-indigo-500" />, action: 'Enables What-If hypothetical analysis to test how adding or deleting FDs alters the normal form.' },
    { name: 'Closure Lab', icon: <Cpu className="w-4 h-4 text-indigo-500" />, action: 'Computes step-by-step expansion of attribute set X⁺ with animated derivation sweep steps.' },
    { name: 'Download Report', icon: <Download className="w-4 h-4 text-indigo-500" />, action: 'Generates a publication-quality PDF, Word document, or plain text report of the current analysis.' },
    { name: 'Theme Switcher', icon: <Info className="w-4 h-4 text-indigo-500" />, action: 'Toggles between Day (light) and Night (dark) themes across all pages and components.' },
  ];

  const statusDefinitions = [
    {
      status: 'SATISFIED',
      badge: 'success',
      meaning: 'The relation strictly satisfies all mathematical conditions for this normal form.',
      example: 'In 2NF: No non-prime attribute depends on a proper subset of any candidate key.',
    },
    {
      status: 'VIOLATED',
      badge: 'error',
      meaning: 'One or more dependencies or structural conditions violate this normal form.',
      example: 'In 3NF: A non-trivial FD has a non-superkey determinant determining a non-prime attribute.',
    },
    {
      status: 'BLOCKED_BY_PREREQUISITE',
      badge: 'warning',
      meaning: 'Cannot satisfy this normal form because an earlier prerequisite normal form in the hierarchy failed.',
      example: '3NF cannot be satisfied if 2NF is violated, because 3NF formally requires the relation to first be in 2NF.',
    },
    {
      status: 'NOT_VERIFIED',
      badge: 'neutral',
      meaning: 'Condition requires optional data that was not provided (e.g. 1NF atomicity requires sample tuples).',
      example: 'Structural schema analysis is confirmed, but cell-level multi-value atomicity cannot be proven without data.',
    },
  ];

  return (
    <div className="flex flex-col flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      <SectionHeading
        title="User Manual & Technical Documentation"
        subtitle="Complete operating guide for first-time students, input syntax standards, control glossary, and output interpretation."
        badge={
          <Badge variant="accent" size="sm">
            Operational Manual
          </Badge>
        }
      />

      {/* Quick Jump Anchor Bar */}
      <div className="mb-8 p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3 overflow-x-auto text-xs">
        <span className="font-bold text-slate-500 uppercase tracking-wider shrink-0">Quick Jump:</span>
        <a href="#getting-started" className="text-indigo-600 dark:text-indigo-400 hover:underline shrink-0">1. Workflow</a>
        <span>•</span>
        <a href="#syntax-guide" className="text-indigo-600 dark:text-indigo-400 hover:underline shrink-0">2. Input Syntax</a>
        <span>•</span>
        <a href="#controls" className="text-indigo-600 dark:text-indigo-400 hover:underline shrink-0">3. Buttons & Controls</a>
        <span>•</span>
        <a href="#verdicts" className="text-indigo-600 dark:text-indigo-400 hover:underline shrink-0">4. Status Verdicts</a>
        <span>•</span>
        <a href="#errors" className="text-indigo-600 dark:text-indigo-400 hover:underline shrink-0">5. Troubleshooting</a>
        <span>•</span>
        <a href="#limitations" className="text-indigo-600 dark:text-indigo-400 hover:underline shrink-0">6. Academic Limitations</a>
      </div>

      <div className="space-y-10">
        {/* ================================================================= */}
        {/* SECTION 1: 13-STEP OPERATIONAL WORKFLOW                           */}
        {/* ================================================================= */}
        <section id="getting-started" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-indigo-500" />
                1. Step-by-Step User Workflow
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                "I have never used this website before. What exactly do I do?" Follow these sequential steps:
              </p>
            </div>
            <Link to="/normalize">
              <Button size="sm" variant="primary" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                Launch Analyzer
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {workflowSteps.map((step) => (
              <Card key={step.step} className="hover:border-indigo-300 dark:hover:border-indigo-800 transition-all">
                <CardContent className="p-4 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-mono font-bold text-xs shrink-0">
                    {step.step}
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center justify-between">
                      {step.title}
                    </h4>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* ================================================================= */}
        {/* SECTION 2: INPUT SYNTAX SPECIFICATION                             */}
        {/* ================================================================= */}
        <section id="syntax-guide" className="space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-indigo-500" />
              2. Input Syntax Standards (Guided vs Raw Mode)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              The engine supports both structured visual inputs and high-speed raw text entry. Use the exact grammar below:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Accepted Syntax Specifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <div className="font-semibold text-slate-900 dark:text-slate-100 mb-1">Attributes:</div>
                  <code className="font-mono text-indigo-600 dark:text-indigo-400 text-[11px]">
                    StudentID, CourseID, StudentName, CourseName, Grade
                  </code>
                  <div className="text-[10px] text-slate-500 mt-1">Comma-separated alphanumeric tokens. Spaces around commas are trimmed automatically.</div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <div className="font-semibold text-slate-900 dark:text-slate-100 mb-1">Functional Dependencies (FD):</div>
                  <code className="font-mono text-indigo-600 dark:text-indigo-400 text-[11px] block">
                    StudentID -&gt; StudentName
                  </code>
                  <code className="font-mono text-indigo-600 dark:text-indigo-400 text-[11px] block mt-0.5">
                    StudentID, CourseID -&gt; Grade
                  </code>
                  <div className="text-[10px] text-slate-500 mt-1">Supports <code className="font-mono">-&gt;</code>, <code className="font-mono">--&gt;</code>, or unicode <code className="font-mono">→</code>.</div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <div className="font-semibold text-slate-900 dark:text-slate-100 mb-1">Multivalued Dependencies (MVD):</div>
                  <code className="font-mono text-indigo-600 dark:text-indigo-400 text-[11px] block">
                    StudentID -&gt;&gt; Hobby
                  </code>
                  <div className="text-[10px] text-slate-500 mt-1">Supports <code className="font-mono">-&gt;&gt;</code> or unicode <code className="font-mono">↠</code>.</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Valid vs Malformed Raw Mode Examples
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="p-2.5 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60">
                  <span className="font-semibold text-emerald-800 dark:text-emerald-300 block mb-1">
                    ✓ Valid Raw Schema Block:
                  </span>
                  <pre className="font-mono text-[11px] text-emerald-900 dark:text-emerald-200">
R(A, B, C, D)
A -&gt; B
B -&gt; C
A -&gt;&gt; D
                  </pre>
                </div>

                <div className="p-2.5 rounded-lg bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/60">
                  <span className="font-semibold text-rose-800 dark:text-rose-300 block mb-1">
                    ✗ Invalid / Malformed Examples:
                  </span>
                  <pre className="font-mono text-[11px] text-rose-900 dark:text-rose-200">
A =&gt; B          (Error: =&gt; arrow not supported; use -&gt;)
-&gt; C            (Error: Empty determinant LHS)
A -&gt; Z          (Error: Attribute 'Z' not declared in relation)
                  </pre>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* ================================================================= */}
        {/* SECTION 3: BUTTONS & CONTROLS GLOSSARY                            */}
        {/* ================================================================= */}
        <section id="controls" className="space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-500" />
              3. Interface Controls & Button Glossary
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Comprehensive explanation of every interactive control in the laboratory:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {controlsGlossary.map((ctrl) => (
              <div
                key={ctrl.name}
                className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1.5"
              >
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 shrink-0">
                    {ctrl.icon}
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    {ctrl.name}
                  </h4>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  {ctrl.action}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ================================================================= */}
        {/* SECTION 4: OUTPUT STATUS VERDICTS                                 */}
        {/* ================================================================= */}
        <section id="verdicts" className="space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-500" />
              4. How to Interpret Evaluation Verdicts
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Outputs adhere to formal DBMS mathematical contracts, not arbitrary guesses:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {statusDefinitions.map((def) => (
              <Card key={def.status}>
                <CardContent className="p-4 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <Badge variant={def.badge as any} size="sm">
                      {def.status}
                    </Badge>
                  </div>
                  <p className="font-medium text-slate-800 dark:text-slate-200 leading-relaxed">
                    {def.meaning}
                  </p>
                  <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-400">
                    <strong className="text-slate-700 dark:text-slate-300">Curriculum Example: </strong>
                    {def.example}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* ================================================================= */}
        {/* SECTION 5: COMMON ERRORS & TROUBLESHOOTING                        */}
        {/* ================================================================= */}
        <section id="errors" className="space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              5. Common Input Errors & Corrective Actions
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Quick fixes for common validation warnings and error codes:
            </p>
          </div>

          <div className="space-y-2 text-xs">
            {[
              {
                error: 'UNKNOWN_ATTRIBUTE_IN_FD',
                cause: 'A dependency references an attribute name that is not present in the relation attribute list.',
                fix: 'Ensure all attributes on LHS and RHS are declared in the relation schema.',
              },
              {
                error: 'EMPTY_RELATION_NAME',
                cause: 'The relation name field was left blank.',
                fix: 'Enter a valid identifier like "STUDENT", "ENROLLMENT", or "INVENTORY".',
              },
              {
                error: 'DUPLICATE_ATTRIBUTES',
                cause: 'The same attribute name was entered twice in the attribute list.',
                fix: 'Remove duplicate attribute names so each attribute domain is uniquely named.',
              },
              {
                error: 'TRIVIAL_DEPENDENCY_CYCLE',
                cause: 'A dependency like A -> A was declared.',
                fix: 'Trivial dependencies are mathematically vacuously true and can be safely omitted.',
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div>
                  <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
                    {item.error}
                  </span>
                  <p className="text-slate-600 dark:text-slate-400 mt-0.5">{item.cause}</p>
                </div>
                <div className="text-[11px] text-indigo-700 dark:text-indigo-300 font-medium sm:text-right shrink-0">
                  <span className="font-bold">Fix: </span>
                  {item.fix}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ================================================================= */}
        {/* SECTION 6: ACADEMIC LIMITATIONS                                   */}
        {/* ================================================================= */}
        <section id="limitations" className="p-5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/60 dark:border-indigo-800/60 space-y-3 text-xs">
          <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
            <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            6. Academic Rigor & Theoretical Limitations Disclosure
          </h4>
          <ul className="space-y-1.5 text-slate-700 dark:text-slate-300 leading-relaxed list-disc list-inside">
            <li>
              <strong>1NF Verification:</strong> True cell-level atomicity requires tuple data. Without sample rows, structural analysis assumes attributes are atomic based on schema declaration.
            </li>
            <li>
              <strong>Candidate Key Search:</strong> Automatic candidate key discovery examines power sets of attributes. While highly optimized with pruning heuristics, relations with &gt;16 unconstrained attributes may take longer.
            </li>
            <li>
              <strong>4NF MVD Specification:</strong> Multivalued dependencies are semantic business constraints; they cannot be inferred purely from functional dependencies and must be explicitly specified.
            </li>
            <li>
              <strong>Lossless Join:</strong> Formal verification is executed via the academic Tableau Chase algorithm rather than naive attribute overlap heuristics.
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
};
