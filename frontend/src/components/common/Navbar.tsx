import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { navigationItems, projectMeta } from '../../config/projectMeta';
import { ThemeToggle } from './ThemeToggle';
import { Database, Menu, X } from 'lucide-react';
import { cn } from '../../utils/cn';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <Link
          to="/"
          className="flex items-center gap-2.5 group focus:outline-none focus-visible-ring rounded-lg p-1"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <Database className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-bold text-base text-slate-900 dark:text-slate-100 tracking-tight leading-none">
                {projectMeta.productTitle}
              </span>
              <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 hidden sm:inline-block">
                1NF–4NF
              </span>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-tight truncate max-w-[200px] sm:max-w-none">
              Visualizer & Analyzer
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav
          className="hidden md:flex items-center gap-1"
          aria-label="Main navigation"
        >
          {navigationItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors select-none focus:outline-none focus-visible-ring relative',
                  isActive
                    ? 'bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                )
              }
            >
              {({ isActive }) => (
                <span className="flex items-center gap-1.5">
                  {item.label}
                  {item.badge && (
                    <span
                      className={cn(
                        'text-[10px] px-1.5 py-0.2 rounded-full font-mono uppercase',
                        isActive
                          ? 'bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                  {isActive && (
                    <span className="absolute -bottom-[17px] left-3 right-3 h-[2px] bg-indigo-600 dark:bg-indigo-400 rounded-full" />
                  )}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Right Section: ThemeToggle + Mobile Trigger */}
        <div className="flex items-center gap-2.5">
          <ThemeToggle />

          {/* Mobile hamburger button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
            className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus-visible-ring"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-3 pb-5 space-y-1 shadow-elevated">
          {navigationItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                cn(
                  'flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                )
              }
            >
              <span>{item.label}</span>
              {item.badge && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </div>
      )}
    </header>
  );
};
