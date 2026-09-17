import React from 'react';
import { Link } from 'react-router-dom';
import { projectMeta } from '../../config/projectMeta';
import { Database, GraduationCap } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm mt-auto transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Product & Academic Identity */}
          <div className="md:col-span-2 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                <Database className="w-4 h-4" />
              </div>
              <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                {projectMeta.productTitle}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {projectMeta.formalTitle}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md leading-relaxed">
              {projectMeta.tagline} Built as a technical learning laboratory for Database Management Systems.
            </p>
          </div>

          {/* Col 2: Academic Supervision */}
          <div className="flex flex-col gap-2">
            <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-indigo-500" />
              Academic Guide
            </h4>
            <div className="text-xs text-slate-700 dark:text-slate-300 font-medium">
              {projectMeta.guide.name}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {projectMeta.guide.designation}
            </div>
            <div className="text-[11px] text-slate-400 dark:text-slate-500">
              {projectMeta.guide.institution || projectMeta.course}
            </div>
          </div>

          {/* Col 3: Navigation Links */}
          <div className="flex flex-col gap-2">
            <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-200 uppercase tracking-wider">
              Quick Links
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
              <li>
                <Link to="/analyzer" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Analyzer Workspace
                </Link>
              </li>
              <li>
                <Link to="/learn" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Learn Theory & Syllabus
                </Link>
              </li>
              <li>
                <Link to="/help" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  User Manual & Help
                </Link>
              </li>
              <li>
                <Link to="/developed-by" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Team & Credits
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 dark:text-slate-500">
          <p>
            © {new Date().getFullYear()} {projectMeta.productTitle}. DBMS Academic Project.
          </p>
          <p className="flex items-center gap-2">
            <span>Relational Laboratory</span>
            <span>•</span>
            <span className="font-mono">v{projectMeta.version}</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
