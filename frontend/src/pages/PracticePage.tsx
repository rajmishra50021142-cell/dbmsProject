import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Sparkles,
  Award,
  BookOpen,
  Play,
  Compass,
  Loader2,
} from 'lucide-react';
import { SectionHeading } from '../components/ui/SectionHeading';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { QuizConfigModal } from '../features/practice/quiz/QuizConfigModal';
import { QuizPlayer } from '../features/practice/quiz/QuizPlayer';
import { QuizResultView } from '../features/practice/quiz/QuizResultView';
import { QuestionLibraryView } from '../features/practice/QuestionLibraryView';
import { PracticeMode as LegacyPracticeMode } from '../features/practice/PracticeMode';
import { practiceService } from '../services/practiceService';
import fallbackPracticeData from '../data/fallbackPracticeData.json';
import type {
  QuizQuestion,
  QuizConfig,
  QuizSubmissionResponse,
  PracticeSummary,
} from '../types/practice';

export const PracticePage: React.FC = () => {
  // Navigation / Tab state
  const [activeTab, setActiveTab] = useState<'ai' | 'pyq' | 'library' | 'legacy'>('ai');

  // Summary stats (initialized with verified fallback data so modal never stalls)
  const [summary, setSummary] = useState<PracticeSummary>(
    fallbackPracticeData.summary as PracticeSummary
  );

  // Active Quiz Session State
  const [activeSessionBank, setActiveSessionBank] = useState<'ai' | 'pyq' | null>(null);
  const [activeSessionConfig, setActiveSessionConfig] = useState<QuizConfig | null>(null);
  const [activeSessionQuestions, setActiveSessionQuestions] = useState<QuizQuestion[] | null>(null);
  const [completedResult, setCompletedResult] = useState<QuizSubmissionResponse | null>(null);
  const [isStartingSession, setIsStartingSession] = useState<boolean>(false);

  // Config modal
  const [configModalBank, setConfigModalBank] = useState<'ai' | 'pyq' | null>(null);

  // Question library data (initialized with verified preloaded questions)
  const [pyqQuestions, setPyqQuestions] = useState<QuizQuestion[]>(
    fallbackPracticeData.pyqs as unknown as QuizQuestion[]
  );
  const [aiQuestions, setAiQuestions] = useState<QuizQuestion[]>(
    fallbackPracticeData.ai as unknown as QuizQuestion[]
  );

  useEffect(() => {
    loadSummary();
    loadPyqs();
    loadAi();
  }, []);

  const loadSummary = async () => {
    try {
      const data = await practiceService.getSummary();
      if (data) setSummary(data);
    } catch (err) {
      console.warn('Using offline practice summary', err);
    }
  };

  const loadPyqs = async () => {
    try {
      const data = await practiceService.getPyqQuestions();
      if (data && data.length > 0) setPyqQuestions(data);
    } catch (err) {
      console.warn('Using offline PYQ questions', err);
    }
  };

  const loadAi = async () => {
    try {
      const data = await practiceService.getAiQuestions();
      if (data && data.length > 0) setAiQuestions(data);
    } catch (err) {
      console.warn('Using offline AI questions', err);
    }
  };

  // Launch a quiz session with graceful local fallback
  const handleStartSession = async (bank: 'ai' | 'pyq', config: QuizConfig) => {
    setConfigModalBank(null);
    setCompletedResult(null);
    setIsStartingSession(true);

    try {
      let qs: QuizQuestion[] = [];
      if (bank === 'ai') {
        qs = await practiceService.getAiQuestions({
          topic: config.topic || undefined,
          difficulty: config.difficulty || undefined,
          count: config.question_count,
        });
      } else {
        qs = await practiceService.getPyqQuestions({
          exam: config.exam || undefined,
          topic: config.topic || undefined,
          playableOnly: true,
          count: config.question_count,
        });
      }

      if (qs.length === 0) {
        // Fall back to preloaded questions
        const source = bank === 'ai' ? aiQuestions : pyqQuestions.filter((q) => q.status === 'playable');
        if (bank === 'pyq') {
          if (config.topic && config.topic !== 'all') {
            const catQs = source.filter((q) => q.topic.toLowerCase() === config.topic!.toLowerCase());
            qs = [...catQs].sort(() => 0.5 - Math.random()).slice(0, config.question_count || 10);
          } else {
            // Mixed GATE DBMS Quiz: first 4-5 FD/Norm, rest from other categories
            const fdPool = [...source.filter(q => q.topic.includes('Functional Dependencies'))].sort(() => 0.5 - Math.random());
            const otherPool = [...source.filter(q => !q.topic.includes('Functional Dependencies'))].sort(() => 0.5 - Math.random());
            const total = config.question_count || 10;
            const fdCount = Math.min(Math.min(5, total), fdPool.length);
            const remainingCount = total - fdCount;
            qs = [...fdPool.slice(0, fdCount), ...otherPool.slice(0, remainingCount)];
          }
        } else {
          let filtered = source;
          if (config.topic && config.topic !== 'all') {
            filtered = filtered.filter((q) => q.topic.toLowerCase() === config.topic!.toLowerCase());
          }
          qs = [...filtered].sort(() => 0.5 - Math.random()).slice(0, config.question_count || 10);
        }
      }

      setActiveSessionBank(bank);
      setActiveSessionConfig(config);
      setActiveSessionQuestions(qs);
    } catch (err) {
      console.warn('Failed to fetch questions from API, using preloaded set', err);
      const source = bank === 'ai' ? aiQuestions : pyqQuestions.filter((q) => q.status === 'playable');
      let qs: QuizQuestion[] = [];
      if (bank === 'pyq') {
        if (config.topic && config.topic !== 'all') {
          const catQs = source.filter((q) => q.topic.toLowerCase() === config.topic!.toLowerCase());
          qs = [...catQs].sort(() => 0.5 - Math.random()).slice(0, config.question_count || 10);
        } else {
          const fdPool = [...source.filter(q => q.topic.includes('Functional Dependencies'))].sort(() => 0.5 - Math.random());
          const otherPool = [...source.filter(q => !q.topic.includes('Functional Dependencies'))].sort(() => 0.5 - Math.random());
          const total = config.question_count || 10;
          const fdCount = Math.min(Math.min(5, total), fdPool.length);
          const remainingCount = total - fdCount;
          qs = [...fdPool.slice(0, fdCount), ...otherPool.slice(0, remainingCount)];
        }
      } else {
        let filtered = source;
        if (config.topic && config.topic !== 'all') {
          filtered = filtered.filter((q) => q.topic.toLowerCase() === config.topic!.toLowerCase());
        }
        qs = [...filtered].sort(() => 0.5 - Math.random()).slice(0, config.question_count || 10);
      }
      setActiveSessionBank(bank);
      setActiveSessionConfig(config);
      setActiveSessionQuestions(qs);
    } finally {
      setIsStartingSession(false);
    }
  };

  const handleSessionComplete = (res: QuizSubmissionResponse) => {
    setCompletedResult(res);
    setActiveSessionQuestions(null);
  };

  const handleExitSession = () => {
    setActiveSessionQuestions(null);
    setActiveSessionBank(null);
    setActiveSessionConfig(null);
  };

  const handleRetakeQuiz = () => {
    if (activeSessionBank && activeSessionConfig) {
      handleStartSession(activeSessionBank, activeSessionConfig);
    } else {
      setCompletedResult(null);
    }
  };

  // Active quiz screen
  if (activeSessionQuestions && activeSessionConfig && activeSessionBank) {
    return (
      <div className="flex flex-col flex-1 py-6 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto w-full">
        <QuizPlayer
          questions={activeSessionQuestions}
          config={activeSessionConfig}
          bankType={activeSessionBank}
          onComplete={handleSessionComplete}
          onExit={handleExitSession}
        />
      </div>
    );
  }

  // Quiz result screen
  if (completedResult) {
    return (
      <div className="flex flex-col flex-1 py-6 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto w-full">
        <QuizResultView
          result={completedResult}
          onRetake={handleRetakeQuiz}
          onHome={() => setCompletedResult(null)}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 py-6 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto w-full space-y-6 animate-in fade-in duration-200">
      {/* Top Section Heading */}
      <SectionHeading
        title="DBMS Practice & Competitive Exam Lab"
        subtitle="Master candidate keys, attribute closures, functional dependencies, and 1NF–4NF decomposition with AI Practice and Competitive Exam PYQs."
        badge={
          <div className="flex items-center gap-2">
            <Badge variant="accent" size="sm">
              Practice & PYQ Lab
            </Badge>
            <span className="text-[11px] text-slate-400 font-mono">
              3-Attempt Gentle Retry Engine
            </span>
          </div>
        }
      />

      {/* Hero Overview Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: AI Practice */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <Badge variant="accent" size="sm">
                30 Questions
              </Badge>
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              AI Practice Bank
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Curated syllabus problems covering candidate keys, closures, and 1NF–4NF violations.
              Features progressive hints and deterministic offline verification.
            </p>
          </div>
          <Button
            size="sm"
            variant="primary"
            onClick={() => setConfigModalBank('ai')}
            leftIcon={<Play className="w-3.5 h-3.5 fill-current" />}
            id="start-ai-practice-btn"
          >
            Start AI Practice
          </Button>
        </div>

        {/* Card 2: Competitive PYQs */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
              <Badge variant="warning" size="sm">
                115 GATE Questions (110 Playable)
              </Badge>
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Competitive Exam PYQs
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Authentic GATE CSE questions covering Functional Dependencies & Normalization (56), SQL (44), and ER Diagrams (15) with official answer keys and 200 DPI figures.
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setConfigModalBank('pyq')}
            leftIcon={<Play className="w-3.5 h-3.5 fill-current" />}
            id="start-pyq-quiz-btn"
          >
            Start PYQ Simulation
          </Button>
        </div>

        {/* Card 3: Gentle Retry Engine */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Compass className="w-5 h-5" />
              </div>
              <Badge variant="success" size="sm">
                Pedagogical Support
              </Badge>
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Gentle Retry Feedback
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              No shaming or punitive red alerts. Attempt 1 offers warm guidance + Hint 1; Attempt 2 offers Hint 2; Attempt 3 provides full mathematical proof.
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setActiveTab('library')}
            leftIcon={<BookOpen className="w-3.5 h-3.5" />}
          >
            Browse Question Library
          </Button>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 text-xs font-semibold gap-1">
        <button
          onClick={() => setActiveTab('ai')}
          className={`pb-3 px-4 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'ai'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
          id="tab-ai-practice"
        >
          <Sparkles className="w-4 h-4 text-indigo-500" />
          AI Practice (30 Questions)
        </button>

        <button
          onClick={() => setActiveTab('pyq')}
          className={`pb-3 px-4 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'pyq'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
          id="tab-pyq-practice"
        >
          <Award className="w-4 h-4 text-amber-500" />
          Competitive Exam PYQs (115)
        </button>

        <button
          onClick={() => setActiveTab('library')}
          className={`pb-3 px-4 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'library'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
          id="tab-pyq-library"
        >
          <BookOpen className="w-4 h-4 text-emerald-500" />
          PYQ Library Archive (All 115)
        </button>

        <button
          onClick={() => setActiveTab('legacy')}
          className={`pb-3 px-4 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'legacy'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
          id="tab-academic-exercises"
        >
          <GraduationCap className="w-4 h-4 text-slate-500" />
          Academic Normalization Exercises (Phase 9)
        </button>
      </div>

      {/* TAB CONTENT */}

      {/* 1. AI Practice Hub */}
      {activeTab === 'ai' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-transparent border border-indigo-200/50 dark:border-indigo-900/30 rounded-2xl p-6 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  Interactive AI Practice Sessions
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
                  Our offline question generation engine covers all relational milestones from Armstrong axioms to 4NF multivalued dependencies.
                  Each question is paired with progressive hints to guide your thinking.
                </p>
              </div>
              <Button
                size="md"
                variant="primary"
                onClick={() => setConfigModalBank('ai')}
                leftIcon={<Play className="w-4 h-4 fill-current" />}
                id="start-ai-practice-session-btn"
              >
                Start Practice Session
              </Button>
            </div>

            {/* Quick Sprints */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <button
                type="button"
                onClick={() =>
                  handleStartSession('ai', {
                    question_count: 5,
                    untimed: true,
                    mode: 'practice',
                  })
                }
                className="text-left p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 hover:shadow-xs cursor-pointer transition-all shadow-2xs space-y-1"
              >
                <span className="font-semibold text-xs text-slate-800 dark:text-slate-200 block">
                  🚀 Quick 5-Question Sprint
                </span>
                <p className="text-[11px] text-slate-500 leading-normal">
                  Rapid warmup with gentle feedback and instant hints.
                </p>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleStartSession('ai', {
                    question_count: 10,
                    untimed: true,
                    mode: 'practice',
                  })
                }
                className="text-left p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 hover:shadow-xs cursor-pointer transition-all shadow-2xs space-y-1"
              >
                <span className="font-semibold text-xs text-slate-800 dark:text-slate-200 block">
                  🎯 Standard 10-Question Mastery
                </span>
                <p className="text-[11px] text-slate-500 leading-normal">
                  Comprehensive mix across candidate keys, 2NF, 3NF, and BCNF.
                </p>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleStartSession('ai', {
                    question_count: 15,
                    time_limit_seconds: 900,
                    untimed: false,
                    mode: 'exam_simulation',
                  })
                }
                className="text-left p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 hover:shadow-xs cursor-pointer transition-all shadow-2xs space-y-1"
              >
                <span className="font-semibold text-xs text-slate-800 dark:text-slate-200 block">
                  ⏱️ 15-Minute Exam Simulation
                </span>
                <p className="text-[11px] text-slate-500 leading-normal">
                  Timed test mode with final score breakdown and explanation review.
                </p>
              </button>
            </div>
          </div>

          {/* AI Syllabus Question Bank Explorer */}
          <div className="space-y-4 pt-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Sparkles className="w-4.5 h-4.5 text-indigo-500" />
                  AI Practice Question Catalog ({aiQuestions.length} Questions)
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Inspect questions across closures, candidate keys, and normal form violations. Click any question to reveal hints, answers, and proofs.
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setConfigModalBank('ai')}
                leftIcon={<Play className="w-3.5 h-3.5 fill-current" />}
              >
                Custom AI Quiz
              </Button>
            </div>
            <QuestionLibraryView
              questions={aiQuestions}
              onStartQuizWithFilter={(_exam, topic) => {
                handleStartSession('ai', {
                  question_count: 10,
                  topic: topic || null,
                  untimed: true,
                  mode: 'practice',
                });
              }}
            />
          </div>
        </div>
      )}

      {/* 2. Competitive PYQs Hub */}
      {activeTab === 'pyq' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent border border-amber-200/50 dark:border-amber-900/30 rounded-2xl p-6 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  Competitive Exam PYQ Simulations (Authentic GATE CSE)
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
                  Practice with authentic GATE CSE previous-year questions across Functional Dependencies & Normalization (56), SQL (44), and ER Diagrams (15).
                  110 questions are fully playable with official answer keys; 5 historical subjective questions are archived for reference.
                </p>
              </div>
              <Button
                size="md"
                variant="primary"
                onClick={() => setConfigModalBank('pyq')}
                leftIcon={<Play className="w-4 h-4 fill-current" />}
                id="start-pyq-session-btn"
              >
                Start PYQ Session
              </Button>
            </div>

            {/* Quick Sprints */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <button
                type="button"
                onClick={() =>
                  handleStartSession('pyq', {
                    question_count: 10,
                    topic: 'Functional Dependencies and Normalization',
                    untimed: true,
                    mode: 'practice',
                  })
                }
                className="text-left p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-500 hover:shadow-xs cursor-pointer transition-all shadow-2xs space-y-1"
                id="gate-fd-focus-btn"
              >
                <span className="font-semibold text-xs text-slate-800 dark:text-slate-200 block">
                  🎯 FD & Normalization (10 Qs)
                </span>
                <p className="text-[11px] text-slate-500 leading-normal">
                  100% drawn from the 56 authentic GATE Normalization questions.
                </p>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleStartSession('pyq', {
                    question_count: 10,
                    topic: 'Structured Query Language (SQL)',
                    untimed: true,
                    mode: 'practice',
                  })
                }
                className="text-left p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-500 hover:shadow-xs cursor-pointer transition-all shadow-2xs space-y-1"
                id="gate-sql-focus-btn"
              >
                <span className="font-semibold text-xs text-slate-800 dark:text-slate-200 block">
                  ⚡ SQL Queries & Joins (10 Qs)
                </span>
                <p className="text-[11px] text-slate-500 leading-normal">
                  100% drawn from the 44 authentic GATE SQL questions.
                </p>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleStartSession('pyq', {
                    question_count: 15,
                    topic: 'all',
                    untimed: true,
                    mode: 'practice',
                  })
                }
                className="text-left p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-500 hover:shadow-xs cursor-pointer transition-all shadow-2xs space-y-1"
                id="mixed-gate-quiz-btn"
              >
                <span className="font-semibold text-xs text-slate-800 dark:text-slate-200 block">
                  🏆 Mixed GATE DBMS Quiz (15 Qs)
                </span>
                <p className="text-[11px] text-slate-500 leading-normal">
                  First 5 from FD/Normalization, remaining 10 randomized from SQL & ER.
                </p>
              </button>
            </div>
          </div>

          {/* Interactive Question Library embedded right in PYQ tab */}
          <div id="pyq-catalog-section" className="space-y-4 pt-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-500" />
                  Competitive Exam Questions Catalog ({pyqQuestions.length} Questions)
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Browse, search, and practice questions from authentic GATE CSE Database Management Systems papers with verified answer keys.
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setConfigModalBank('pyq')}
                leftIcon={<Play className="w-3.5 h-3.5 fill-current" />}
              >
                Configure Custom PYQ Quiz
              </Button>
            </div>

            <QuestionLibraryView
              questions={pyqQuestions}
              onStartQuizWithFilter={(exam, topic) => {
                handleStartSession('pyq', {
                  question_count: 10,
                  exam: exam || null,
                  topic: topic || null,
                  untimed: true,
                  mode: 'practice',
                });
              }}
            />
          </div>
        </div>
      )}

      {/* 3. Question Library View */}
      {activeTab === 'library' && (
        <QuestionLibraryView
          questions={pyqQuestions}
          onStartQuizWithFilter={(exam, topic) => {
            handleStartSession('pyq', {
              question_count: 10,
              exam: exam || null,
              topic: topic || null,
              untimed: true,
              mode: 'practice',
            });
          }}
        />
      )}

      {/* 4. Legacy Academic Exercises */}
      {activeTab === 'legacy' && (
        <div className="space-y-4">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-200/80 dark:border-slate-700/80 text-xs text-slate-500">
            Phase 9 Relational Exercises: Step-by-step mathematical verification using the core normalization engines.
          </div>
          <LegacyPracticeMode />
        </div>
      )}

      {/* Loading Overlay when starting quiz session */}
      {isStartingSession && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl flex items-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-indigo-600 dark:text-indigo-400" />
            <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
              Preparing your practice session...
            </span>
          </div>
        </div>
      )}

      {/* Config Modal */}
      {configModalBank && (
        <QuizConfigModal
          isOpen={true}
          bankType={configModalBank}
          availableTopics={
            configModalBank === 'ai' ? summary.ai_practice.topics : summary.pyq_practice.topics
          }
          availableExams={configModalBank === 'pyq' ? summary.pyq_practice.exams : []}
          onClose={() => setConfigModalBank(null)}
          onStart={(config) => handleStartSession(configModalBank, config)}
        />
      )}
    </div>
  );
};
