import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { projectMeta } from '../config/projectMeta';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { useApiHealth } from '../hooks/useApiHealth';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Database,
  Layers,
  Scale,
  Sparkles,
  Server,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { status, data } = useApiHealth();
  const [exampleModalOpen, setExampleModalOpen] = useState(false);

  const stages = [
    {
      nf: '1NF',
      name: 'First Normal Form',
      rule: 'Atomic attribute values and elimination of repeating groups',
      status: 'Prerequisite',
    },
    {
      nf: '2NF',
      name: 'Second Normal Form',
      rule: '1NF + Removal of partial dependencies on composite candidate keys',
      status: 'Key Evaluation',
    },
    {
      nf: '3NF',
      name: 'Third Normal Form',
      rule: '2NF + Removal of transitive dependencies for non-prime attributes',
      status: 'Transitive Check',
    },
    {
      nf: '4NF',
      name: 'Fourth Normal Form',
      rule: '3NF/BCNF + Removal of non-trivial multivalued dependencies (MVDs)',
      status: 'MVD Reasoning',
    },
  ];

  return (
    <div className="flex flex-col gap-12 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      {/* Hero Section */}
      <section className="text-center flex flex-col items-center max-w-3xl mx-auto pt-6 pb-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-5">
          <Database className="w-3.5 h-3.5" />
          <span>DBMS Academic Educational Platform</span>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <span>Interactive Normalization Platform</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 leading-tight">
          {projectMeta.formalTitle}
        </h1>

        <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300 font-normal leading-relaxed max-w-2xl">
          {projectMeta.tagline}
        </p>

        {/* Action Controls */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link to="/analyzer">
            <Button
              size="lg"
              leftIcon={<Layers className="w-4 h-4" />}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Start Analysis
            </Button>
          </Link>
          <Link to="/learn">
            <Button size="lg" variant="outline" leftIcon={<BookOpen className="w-4 h-4" />}>
              Learn Normalization
            </Button>
          </Link>
          <Button
            size="lg"
            variant="secondary"
            onClick={() => setExampleModalOpen(true)}
            leftIcon={<Sparkles className="w-4 h-4 text-indigo-500" />}
          >
            Explore Pre-built Examples
          </Button>
        </div>
      </section>

      {/* Normalization Journey Restrained Visual Stepper */}
      <section className="w-full">
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-subtle">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-5 border-b border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 tracking-wider uppercase">
                Educational Workflow Preview
              </span>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                The 1NF → 2NF → 3NF → 4NF Normalization Journey
              </h2>
            </div>
            <Badge variant="accent" size="sm">
              Deterministic Logic
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            {stages.map((stage, idx) => (
              <div
                key={stage.nf}
                className="relative flex flex-col p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:border-indigo-300 dark:hover:border-indigo-800 transition-colors group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xl font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    {stage.nf}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                    Stage {idx + 1}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1">
                  {stage.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {stage.rule}
                </p>
                <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500">
                  <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>{stage.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Architectural Modules & System Status */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Module 1: Schema Input */}
        <Card>
          <CardHeader>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-2">
              <Database className="w-4 h-4" />
            </div>
            <CardTitle>Structured Schema Builder</CardTitle>
            <CardDescription>
              Relational Specification
            </CardDescription>
          </CardHeader>
          <CardContent className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed space-y-2">
            <p>
              Provides structured builders for relation attributes, multiple composite candidate keys, functional dependencies (FDs), and multivalued dependencies (MVDs).
            </p>
            <p className="font-mono text-[11px] bg-slate-100 dark:bg-slate-800 p-2 rounded text-slate-700 dark:text-slate-300">
              R(StudentID, CourseID, Grade, Dept)
            </p>
          </CardContent>
        </Card>

        {/* Module 2: Deterministic Reasoning */}
        <Card>
          <CardHeader>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2">
              <Scale className="w-4 h-4" />
            </div>
            <CardTitle>Deterministic DBMS Engine</CardTitle>
            <CardDescription>
              Formal Algorithmic Suite
            </CardDescription>
          </CardHeader>
          <CardContent className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed space-y-2">
            <p>
              Executes Armstrong's axioms, attribute closure algorithms, minimal cover derivations, and lossless-join dependency-preserving decomposition.
            </p>
            <p className="font-mono text-[11px] bg-slate-100 dark:bg-slate-800 p-2 rounded text-slate-700 dark:text-slate-300">
              X⁺ closure & superkey deduction
            </p>
          </CardContent>
        </Card>

        {/* Module 3: System Status & Health */}
        <Card variant="elevated">
          <CardHeader>
            <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400 flex items-center justify-center mb-2">
              <Server className="w-4 h-4" />
            </div>
            <CardTitle>System & API Status</CardTitle>
            <CardDescription>
              Live Architecture Diagnostics
            </CardDescription>
          </CardHeader>
          <CardContent className="text-xs space-y-3">
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
              <span className="text-slate-600 dark:text-slate-400 font-medium">Backend API:</span>
              <Badge
                variant={status === 'connected' ? 'success' : status === 'checking' ? 'warning' : 'error'}
                size="sm"
              >
                {status === 'connected' ? 'Online & Healthy' : status === 'checking' ? 'Connecting...' : 'Offline'}
              </Badge>
            </div>
            {data && (
              <div className="space-y-1 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                <div>Service: {data.service}</div>
                <div>Version: {data.version}</div>
                <div>Environment: {data.environment}</div>
              </div>
            )}
            <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-1">
              Zero paid AI dependencies required. The analysis algorithms and assistant operate deterministically.
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Pre-built Example Modal */}
      <Modal
        isOpen={exampleModalOpen}
        onClose={() => setExampleModalOpen(false)}
        title="Pre-configured DBMS Normalization Problems"
        description="Textbook reference schemas available for 1-click loading and rapid analysis."
      >
        <div className="space-y-3">
          <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100 font-mono">
                ENROLLMENT (Classic 2NF Violation)
              </h4>
              <Badge variant="warning" size="sm">2NF Issue</Badge>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400">
              R(StudentID, CourseID, StudentName, CourseTitle, Grade)
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              FDs: StudentID → StudentName, CourseID → CourseTitle, (StudentID, CourseID) → Grade
            </p>
          </div>

          <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100 font-mono">
                STAFF_BRANCH (Classic 3NF Violation)
              </h4>
              <Badge variant="warning" size="sm">3NF Issue</Badge>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400">
              R(StaffNo, SName, Position, Salary, BranchNo, BAddress)
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              FDs: StaffNo → BranchNo, BranchNo → BAddress (Transitive)
            </p>
          </div>

          <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100 font-mono">
                RESTAURANT (Classic 4NF MVD Violation)
              </h4>
              <Badge variant="info" size="sm">4NF Issue</Badge>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400">
              R(Restaurant, PizzaVariety, DeliveryArea)
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              MVDs: Restaurant ↠ PizzaVariety, Restaurant ↠ DeliveryArea
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};
