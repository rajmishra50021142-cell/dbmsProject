import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Tabs } from '../components/ui/Tabs';
import { SectionHeading } from '../components/ui/SectionHeading';
import {
  BookOpen,
  Video,
  BookmarkCheck,
  CheckCircle2,
  Search,
  ExternalLink,
  Layers,
  ArrowRight,
  ChevronRight,
} from 'lucide-react';
import { LEARNING_TOPICS, LEARNING_RESOURCES } from '../config/learningResources';
import { EducationalVideo } from '../features/learn/EducationalVideo';
import { InteractiveMiniExample } from '../features/learn/InteractiveMiniExample';

export const LearnPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'concepts' | 'video' | 'references'>('concepts');
  const [selectedTopicId, setSelectedTopicId] = useState<string>('foundations');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [resourceCategory, setResourceCategory] = useState<string>('all');

  const tabs = [
    { id: 'concepts', label: '1NF–4NF Syllabus & Concepts', icon: <BookOpen className="w-3.5 h-3.5" /> },
    { id: 'video', label: 'Educational Video Lecture', icon: <Video className="w-3.5 h-3.5" /> },
    { id: 'references', label: 'Textbooks & Research Papers', icon: <BookmarkCheck className="w-3.5 h-3.5" /> },
  ];

  // Filter topics based on search query
  const filteredTopics = useMemo(() => {
    if (!searchQuery.trim()) return LEARNING_TOPICS;
    const q = searchQuery.toLowerCase();
    return LEARNING_TOPICS.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.summary.toLowerCase().includes(q) ||
        t.keyTakeaways.some((k) => k.toLowerCase().includes(q))
    );
  }, [searchQuery]);

  // Selected topic object
  const activeTopic = useMemo(() => {
    return LEARNING_TOPICS.find((t) => t.id === selectedTopicId) || LEARNING_TOPICS[0];
  }, [selectedTopicId]);

  // Filtered resources
  const filteredResources = useMemo(() => {
    if (resourceCategory === 'all') return LEARNING_RESOURCES;
    return LEARNING_RESOURCES.filter((r) => r.type === resourceCategory);
  }, [resourceCategory]);

  return (
    <div className="flex flex-col flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      <SectionHeading
        title="DBMS Normalization Learning Center"
        subtitle="Mathematically grounded theory, interactive mini-examples, educational video lecture, and landmark research citations for 1NF through 4NF."
        badge={
          <Badge variant="accent" size="sm">
            Academic Curriculum
          </Badge>
        }
      />

      {/* Primary Navigation Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={(id) => setActiveTab(id as any)} className="mb-6" />

      {/* ==================================================================== */}
      {/* TAB 1: CORE CONCEPTS & INTERACTIVE TOPICS                            */}
      {/* ==================================================================== */}
      {activeTab === 'concepts' && (
        <div className="space-y-6">
          {/* Visual 1NF to 4NF Progression Banner */}
          <Card className="border-indigo-200 dark:border-indigo-900/60 bg-gradient-to-r from-indigo-50/50 via-slate-50/20 to-transparent dark:from-indigo-950/20 shadow-xs">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                  <Layers className="w-4 h-4" />
                  Hierarchical Normalization Spectrum
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Click any stage to inspect formal conditions
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                {[
                  { id: '1nf', stage: '1NF', label: 'Domain Atomicity', rule: 'Atomic cell values & no repeating groups' },
                  { id: '2nf', stage: '2NF', label: 'Full Key Dependency', rule: 'No partial dependencies on composite keys' },
                  { id: '3nf', stage: '3NF', label: 'Transitive Elimination', rule: 'X is superkey OR A is prime attribute' },
                  { id: '4nf', stage: '4NF', label: 'Multivalued Independence', rule: 'Every non-trivial MVD has superkey LHS' },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedTopicId(s.id)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      selectedTopicId === s.id
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm">{s.stage}</span>
                      <ChevronRight className={`w-3.5 h-3.5 ${selectedTopicId === s.id ? 'text-indigo-200' : 'text-slate-400'}`} />
                    </div>
                    <div className={`font-medium ${selectedTopicId === s.id ? 'text-indigo-100' : 'text-slate-900 dark:text-slate-100'}`}>
                      {s.label}
                    </div>
                    <div className={`text-[11px] mt-1 leading-tight ${selectedTopicId === s.id ? 'text-indigo-100/80' : 'text-slate-500 dark:text-slate-400'}`}>
                      {s.rule}
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Master Two-Column Layout: Topic Sidebar + Detail View */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Topic List & Search (4 cols) */}
            <div className="lg:col-span-4 space-y-3">
              {/* Local Topic Search */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search topics (e.g. closure, 2NF)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus-visible-ring"
                />
              </div>

              {/* Topics Navigation List */}
              <div className="space-y-1.5 max-h-[620px] overflow-y-auto pr-1">
                {filteredTopics.map((topic) => (
                  <button
                    key={topic.id}
                    onClick={() => setSelectedTopicId(topic.id)}
                    className={`w-full p-3 rounded-xl border text-left transition-all text-xs flex items-center justify-between ${
                      selectedTopicId === topic.id
                        ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-700 font-semibold text-indigo-900 dark:text-indigo-200 shadow-xs'
                        : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-slate-100">
                        {topic.title}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 capitalize mt-0.5">
                        {topic.category.replace('_', ' ')}
                      </div>
                    </div>
                    <ChevronRight
                      className={`w-4 h-4 shrink-0 ${
                        selectedTopicId === topic.id
                          ? 'text-indigo-600 dark:text-indigo-400'
                          : 'text-slate-400 opacity-60'
                      }`}
                    />
                  </button>
                ))}
              </div>

              {/* Quick Analyzer Jump Link */}
              <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs">
                <span className="font-semibold text-slate-800 dark:text-slate-200 block mb-1">
                  Finished studying?
                </span>
                <p className="text-slate-500 dark:text-slate-400 mb-2.5 leading-relaxed">
                  Put theory into practice by testing your own relations and functional dependencies.
                </p>
                <Link to="/normalize">
                  <Button size="sm" variant="secondary" className="w-full" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                    Open Normalization Lab
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Column: Topic Detail & Interactive Mini-Lab (8 cols) */}
            <div className="lg:col-span-8 space-y-6">
              <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
                <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-200/80 dark:border-slate-800/80">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <CardTitle className="text-lg font-bold text-slate-900 dark:text-slate-100">
                      {activeTopic.title}
                    </CardTitle>
                    <Badge variant="neutral" size="sm" className="capitalize">
                      Category: {activeTopic.category.replace('_', ' ')}
                    </Badge>
                  </div>
                  {activeTopic.formalCondition && (
                    <div className="mt-2 p-2.5 rounded-lg bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800/60 font-mono text-xs text-indigo-900 dark:text-indigo-200">
                      <span className="font-sans font-bold uppercase tracking-wider text-[10px] text-indigo-700 dark:text-indigo-300 block mb-0.5">
                        Formal Mathematical Condition:
                      </span>
                      {activeTopic.formalCondition}
                    </div>
                  )}
                </CardHeader>

                <CardContent className="p-6 space-y-6">
                  {/* Detailed Academic Summary */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                      Core Concept Overview
                    </h4>
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                      {activeTopic.summary}
                    </p>
                  </div>

                  {/* Key Takeaways & Rigorous Proofs */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5">
                      Key Takeaways & Educational Rules
                    </h4>
                    <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                      {activeTopic.keyTakeaways.map((takeaway, idx) => (
                        <li key={idx} className="flex items-start gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                          <span className="leading-relaxed">{takeaway}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Embedded Interactive Mini-Example */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5">
                      Interactive Demonstration
                    </h4>
                    <InteractiveMiniExample topicId={activeTopic.id} />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 2: EDUCATIONAL VIDEO LECTURE                                     */}
      {/* ==================================================================== */}
      {activeTab === 'video' && <EducationalVideo />}

      {/* ==================================================================== */}
      {/* TAB 3: ACADEMIC REFERENCES & BIBLIOGRAPHY                            */}
      {/* ==================================================================== */}
      {activeTab === 'references' && (
        <div className="space-y-6">
          {/* Category Filter Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {[
              { id: 'all', label: 'All References' },
              { id: 'book', label: 'Textbooks' },
              { id: 'paper', label: 'Landmark Research Papers' },
              { id: 'course', label: 'University Courseware & Notes' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setResourceCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  resourceCategory === cat.id
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Structured Reference Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredResources.map((res) => (
              <Card key={res.id} className="hover:border-indigo-300 dark:hover:border-indigo-800 transition-all flex flex-col justify-between">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {res.title}
                    </CardTitle>
                    {res.badge && (
                      <Badge variant="accent" size="sm" className="shrink-0">
                        {res.badge}
                      </Badge>
                    )}
                  </div>
                  {res.author && (
                    <CardDescription className="text-xs font-medium text-indigo-600 dark:text-indigo-400 mt-0.5">
                      {res.author}
                    </CardDescription>
                  )}
                  {res.citation && (
                    <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-1">
                      {res.citation}
                    </div>
                  )}
                </CardHeader>

                <CardContent className="pt-0 space-y-3">
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {res.description}
                  </p>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 capitalize">
                      Format: {res.type}
                    </span>
                    {res.url ? (
                      <a
                        href={res.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        Open Resource <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">Library Reference</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
