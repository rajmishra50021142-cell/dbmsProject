import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { CheckCircle2, XCircle, Sparkles, ArrowRight, Play } from 'lucide-react';
import { EXAMPLE_SCHEMAS } from '../../config/examples';

interface InteractiveMiniExampleProps {
  topicId: string;
}

export const InteractiveMiniExample: React.FC<InteractiveMiniExampleProps> = ({ topicId }) => {
  const navigate = useNavigate();

  // State for Candidate Key interactive quiz
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [keySubmitted, setKeySubmitted] = useState<boolean>(false);

  // State for Closure interactive stepper
  const [closureStep, setClosureStep] = useState<number>(0);

  // State for 2NF partial dependency identifier
  const [selectedPartial, setSelectedPartial] = useState<string | null>(null);
  const [partialSubmitted, setPartialSubmitted] = useState<boolean>(false);

  // State for 3NF checker
  const [selected3NFDep, setSelected3NFDep] = useState<string | null>(null);
  const [evaluated3NF, setEvaluated3NF] = useState<boolean>(false);

  const loadIntoAnalyzer = (exampleId: string) => {
    const ex = EXAMPLE_SCHEMAS.find((s) => s.id === exampleId) || EXAMPLE_SCHEMAS[1];
    try {
      localStorage.setItem('normalization_lab_draft_v1', JSON.stringify(ex.schema));
    } catch {
      // ignore
    }
    navigate('/normalize');
  };

  // 1. CANDIDATE KEYS
  if (topicId === 'keys') {
    return (
      <Card className="border-indigo-100 dark:border-indigo-900/60 bg-gradient-to-br from-indigo-50/20 via-transparent to-transparent">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              Interactive Mini-Lab: Candidate Key Discovery
            </CardTitle>
            <Badge variant="accent" size="sm">
              Hands-on
            </Badge>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Given schema <code className="font-mono text-indigo-600 dark:text-indigo-400">R(A, B, C, D)</code> with functional dependencies:
            <span className="font-mono block mt-1 font-semibold text-slate-800 dark:text-slate-200">
              F = &#123; A → B, B → C, C → D &#125;
            </span>
          </p>
        </CardHeader>
        <CardContent className="space-y-3 text-xs">
          <p className="font-medium text-slate-700 dark:text-slate-300">
            Which of the following attribute sets is the minimal Candidate Key?
          </p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'A', label: '{ A }', correct: true, reason: 'Closure {A}⁺ = {A, B, C, D} = R. Minimal because no proper non-empty subset exists.' },
              { id: 'B', label: '{ B }', correct: false, reason: '{B}⁺ = {B, C, D} ≠ R (cannot determine A).' },
              { id: 'AB', label: '{ A, B }', correct: false, reason: 'Superkey, but NOT minimal because proper subset {A} is already a key.' },
              { id: 'CD', label: '{ C, D }', correct: false, reason: '{C, D}⁺ = {C, D} ≠ R (cannot determine A or B).' },
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => {
                  setSelectedKey(opt.id);
                  setKeySubmitted(true);
                }}
                className={`p-2.5 rounded-xl border text-left font-mono transition-all ${
                  selectedKey === opt.id
                    ? opt.correct
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 text-emerald-900 dark:text-emerald-200'
                      : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 text-rose-900 dark:text-rose-200'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold">{opt.label}</span>
                  {selectedKey === opt.id && (
                    opt.correct ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <XCircle className="w-4 h-4 text-rose-500" />
                  )}
                </div>
              </button>
            ))}
          </div>

          {keySubmitted && selectedKey && (
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
              <p className="text-slate-700 dark:text-slate-300">
                <strong>Explanation: </strong>
                {selectedKey === 'A'
                  ? 'Correct! Computing {A}⁺: A → B adds B ({A, B}); B → C adds C ({A, B, C}); C → D adds D ({A, B, C, D}). Since {A}⁺ reaches all attributes and cannot be reduced, {A} is the unique minimal candidate key.'
                  : 'Not quite minimal or complete. Notice that A never appears on the right-hand side of any dependency, so A MUST be in every candidate key!'}
              </p>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setSelectedKey(null);
                setKeySubmitted(false);
              }}
            >
              Reset Quiz
            </Button>
            <Button
              size="sm"
              variant="primary"
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              onClick={() => loadIntoAnalyzer('3nf-transitive-dep')}
            >
              Try in Live Analyzer
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // 2. ATTRIBUTE CLOSURE
  if (topicId === 'closure') {
    const closureStates = [
      { step: 0, closure: ['A'], applied: 'Initial Seed: {A}', desc: 'Start with initial attribute set X = {A}.' },
      { step: 1, closure: ['A', 'B'], applied: 'Applied A → B', desc: 'Since A ⊆ {A}, we add RHS B to the closure.' },
      { step: 2, closure: ['A', 'B', 'C'], applied: 'Applied B → C', desc: 'Since B ⊆ {A, B}, we add RHS C to the closure.' },
      { step: 3, closure: ['A', 'B', 'C', 'D'], applied: 'Applied C → D', desc: 'Since C ⊆ {A, B, C}, we add RHS D to the closure. Reached all attributes: {A}⁺ = R.' },
    ];
    const current = closureStates[closureStep];

    return (
      <Card className="border-indigo-100 dark:border-indigo-900/60">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              Interactive Mini-Lab: Attribute Closure Step-by-Step
            </CardTitle>
            <Badge variant="accent" size="sm">
              Step {closureStep + 1} of 4
            </Badge>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Dependencies: <code className="font-mono text-indigo-600 dark:text-indigo-400">A → B, B → C, C → D</code>. Computing closure <code className="font-mono font-bold">X⁺ = &#123;A&#125;⁺</code>.
          </p>
        </CardHeader>
        <CardContent className="space-y-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase text-slate-500 tracking-wider">Current Closure State:</span>
              <div className="font-mono text-base font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">
                &#123; {current.closure.join(', ')} &#125;
              </div>
            </div>
            <Badge variant={closureStep === 3 ? 'success' : 'neutral'} size="sm">
              {current.applied}
            </Badge>
          </div>
          <p className="text-slate-600 dark:text-slate-400 italic leading-relaxed">
            {current.desc}
          </p>

          <div className="flex items-center justify-between pt-2">
            <Button
              size="sm"
              variant="outline"
              disabled={closureStep === 0}
              onClick={() => setClosureStep((s) => Math.max(0, s - 1))}
            >
              Previous Step
            </Button>
            {closureStep < 3 ? (
              <Button
                size="sm"
                variant="secondary"
                rightIcon={<Play className="w-3.5 h-3.5" />}
                onClick={() => setClosureStep((s) => Math.min(3, s + 1))}
              >
                Next Sweep
              </Button>
            ) : (
              <Button
                size="sm"
                variant="primary"
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                onClick={() => navigate('/closure')}
              >
                Open Closure Lab
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // 3. 2NF PARTIAL DEPENDENCIES
  if (topicId === '2nf') {
    return (
      <Card className="border-indigo-100 dark:border-indigo-900/60">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              Interactive Mini-Lab: Spot the 2NF Partial Dependency
            </CardTitle>
            <Badge variant="accent" size="sm">
              2NF Quiz
            </Badge>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Relation: <code className="font-mono font-bold">ENROLLMENT(StudentID, CourseID, StudentName, CourseName, Grade)</code>.
            Candidate Key: <code className="font-mono font-bold text-indigo-600 dark:text-indigo-400">&#123;StudentID, CourseID&#125;</code>.
          </p>
        </CardHeader>
        <CardContent className="space-y-3 text-xs">
          <p className="font-medium text-slate-700 dark:text-slate-300">
            Click on the dependency that violates Second Normal Form (2NF):
          </p>
          <div className="space-y-2">
            {[
              { id: 'dep1', formula: 'StudentID → StudentName', isPartial: true, reason: 'StudentID is a proper subset of the composite key {StudentID, CourseID}, and StudentName is non-prime. Therefore this is a partial dependency causing a 2NF violation!' },
              { id: 'dep2', formula: 'CourseID → CourseName', isPartial: true, reason: 'CourseID is a proper subset of the composite key, determining non-prime CourseName. This also causes a 2NF violation!' },
              { id: 'dep3', formula: 'StudentID, CourseID → Grade', isPartial: false, reason: 'LHS is the complete composite candidate key, NOT a proper subset. This is a full functional dependency and fully satisfies 2NF.' },
            ].map((d) => (
              <button
                key={d.id}
                onClick={() => {
                  setSelectedPartial(d.id);
                  setPartialSubmitted(true);
                }}
                className={`w-full p-2.5 rounded-xl border text-left font-mono transition-all flex items-center justify-between ${
                  selectedPartial === d.id
                    ? d.isPartial
                      ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 text-amber-900 dark:text-amber-200 font-bold'
                      : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 text-emerald-900 dark:text-emerald-200'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                }`}
              >
                <span>{d.formula}</span>
                {selectedPartial === d.id && (
                  <Badge variant={d.isPartial ? 'warning' : 'success'} size="sm">
                    {d.isPartial ? 'Partial Dependency (2NF Violation)' : 'Full Dependency (Satisfies 2NF)'}
                  </Badge>
                )}
              </button>
            ))}
          </div>

          {partialSubmitted && selectedPartial && (
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
              <p className="text-slate-700 dark:text-slate-300">
                <strong>Analysis: </strong>
                {selectedPartial === 'dep3'
                  ? 'StudentID, CourseID → Grade has the entire composite key on the determinant LHS. It does NOT violate 2NF!'
                  : 'Identified! The determinant is only part of the composite key determining a non-prime attribute. This leads to duplicate names whenever a student enrolls in multiple courses.'}
              </p>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setSelectedPartial(null);
                setPartialSubmitted(false);
              }}
            >
              Reset
            </Button>
            <Button
              size="sm"
              variant="primary"
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              onClick={() => loadIntoAnalyzer('2nf-partial-dep')}
            >
              Load Example in Analyzer
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // 4. 3NF TRANSITIVE DEPENDENCIES
  if (topicId === '3nf') {
    return (
      <Card className="border-indigo-100 dark:border-indigo-900/60">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              Interactive Mini-Lab: 3NF Superkey vs Prime Check
            </CardTitle>
            <Badge variant="accent" size="sm">
              3NF Condition
            </Badge>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Relation: <code className="font-mono font-bold">STUDENT(StudentID, Name, DeptID, DeptName)</code>.
            Key: <code className="font-mono font-bold text-indigo-600 dark:text-indigo-400">&#123;StudentID&#125;</code>.
          </p>
        </CardHeader>
        <CardContent className="space-y-3 text-xs">
          <p className="font-medium text-slate-700 dark:text-slate-300">
            Select an FD to inspect the formal condition: <em>(X is superkey) OR (A is prime attribute)</em>:
          </p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'fd1', label: 'StudentID → DeptID', isSuperkey: true, isPrime: false, satisfies: true },
              { id: 'fd2', label: 'DeptID → DeptName', isSuperkey: false, isPrime: false, satisfies: false },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setSelected3NFDep(item.id);
                  setEvaluated3NF(true);
                }}
                className={`p-2.5 rounded-xl border text-left font-mono transition-all ${
                  selected3NFDep === item.id
                    ? item.satisfies
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 text-emerald-900 dark:text-emerald-200'
                      : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 text-rose-900 dark:text-rose-200'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                }`}
              >
                <div className="font-bold">{item.label}</div>
                <div className="text-[11px] mt-1 text-slate-500 dark:text-slate-400">
                  {item.satisfies ? 'Satisfies 3NF' : 'Violates 3NF'}
                </div>
              </button>
            ))}
          </div>

          {evaluated3NF && selected3NFDep && (
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <p className="text-slate-700 dark:text-slate-300">
                {selected3NFDep === 'fd1' ? (
                  <span>
                    <strong>StudentID → DeptID:</strong> StudentID is a superkey (in fact, the candidate key). Therefore it passes 3NF condition #1!
                  </span>
                ) : (
                  <span>
                    <strong>DeptID → DeptName:</strong> DeptID is NOT a superkey, and DeptName is NOT a prime attribute. Both conditions fail, triggering a 3NF transitive violation.
                  </span>
                )}
              </p>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setSelected3NFDep(null);
                setEvaluated3NF(false);
              }}
            >
              Reset
            </Button>
            <Button
              size="sm"
              variant="primary"
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              onClick={() => loadIntoAnalyzer('3nf-transitive-dep')}
            >
              Inspect 3NF in Analyzer
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // 5. 4NF MULTIVALUED DEPENDENCIES
  if (topicId === '4nf') {
    return (
      <Card className="border-indigo-100 dark:border-indigo-900/60">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              Interactive Mini-Lab: 4NF Multivalued Independence
            </CardTitle>
            <Badge variant="accent" size="sm">
              4NF MVD
            </Badge>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Relation: <code className="font-mono font-bold">STUDENT_INFO(StudentID, Hobby, Language)</code>.
            Two independent multivalued attributes: <code className="font-mono">StudentID ↠ Hobby</code> and <code className="font-mono">StudentID ↠ Language</code>.
          </p>
        </CardHeader>
        <CardContent className="space-y-3 text-xs">
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
            If a student has 3 hobbies and speaks 4 languages, storing them in a single relation requires <strong>3 × 4 = 12 tuples</strong> because every hobby must be paired with every language to represent independence.
          </p>

          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200">
            <strong>4NF Condition:</strong> For non-trivial MVD <code className="font-mono">StudentID ↠ Hobby</code>, StudentID MUST be a superkey. Here the candidate key is composite <code className="font-mono">&#123;StudentID, Hobby, Language&#125;</code>, so StudentID is NOT a superkey. Result: <strong>4NF VIOLATION</strong>.
          </div>

          <div className="flex items-center justify-end pt-2">
            <Button
              size="sm"
              variant="primary"
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              onClick={() => loadIntoAnalyzer('4nf-mvd')}
            >
              Try MVD in Analyzer
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default fallback for foundations or decomposition
  return (
    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between text-xs">
      <div>
        <span className="font-semibold text-slate-800 dark:text-slate-200">
          Ready to test this concept on real relations?
        </span>
        <p className="text-slate-500 dark:text-slate-400 mt-0.5">
          Load standard curriculum schemas directly into the Normalization Lab.
        </p>
      </div>
      <Button
        size="sm"
        variant="primary"
        rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
        onClick={() => navigate('/normalize')}
      >
        Open Normalization Lab
      </Button>
    </div>
  );
};
