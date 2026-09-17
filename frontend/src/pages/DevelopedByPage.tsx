import React from 'react';
import { projectMeta } from '../config/projectMeta';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { SectionHeading } from '../components/ui/SectionHeading';
import { GraduationCap, Users, User, ShieldCheck } from 'lucide-react';

export const DevelopedByPage: React.FC = () => {
  return (
    <div className="flex flex-col flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      <SectionHeading
        title="Project Attribution & Academic Credits"
        subtitle="Designed, engineered, and maintained for the Database Management Systems (DBMS) laboratory curriculum."
        badge={
          <Badge variant="accent" size="sm">
            Rubric Attribution
          </Badge>
        }
      />

      {/* ==================================================================== */}
      {/* 1. ACADEMIC SUPERVISION (GUIDED BY)                                 */}
      {/* ==================================================================== */}
      <section className="mb-10">
        <div className="flex items-center gap-2 mb-3">
          <GraduationCap className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Academic Project Guidance & Supervision
          </h3>
        </div>

        <Card className="border-indigo-200 dark:border-indigo-900/60 bg-gradient-to-r from-indigo-50/50 via-slate-50/20 to-transparent dark:from-indigo-950/20 shadow-xs">
          <CardContent className="flex flex-col sm:flex-row items-center sm:items-start gap-6 p-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-700 to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
              <GraduationCap className="w-10 h-10" />
            </div>

            <div className="text-center sm:text-left space-y-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                  {projectMeta.guide.name}
                </h2>
                <Badge variant="accent" size="sm">
                  Project Guide
                </Badge>
              </div>

              <p className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">
                {projectMeta.guide.designation}
              </p>

              <p className="text-xs text-slate-600 dark:text-slate-400">
                {projectMeta.guide.department}
              </p>

              <p className="text-xs text-slate-500 dark:text-slate-500">
                {projectMeta.guide.institution}
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* ==================================================================== */}
      {/* 2. STUDENT DEVELOPMENT TEAM                                         */}
      {/* ==================================================================== */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Student Engineering Team
            </h3>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Centralized Config: <code className="font-mono text-xs">src/config/projectMeta.ts</code>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {projectMeta.teamMembers.map((member, idx) => (
            <Card
              key={idx}
              className="hover:border-indigo-300 dark:hover:border-indigo-700 transition-all flex flex-col justify-between shadow-xs border-slate-200 dark:border-slate-800"
            >
              <CardHeader className="text-center sm:text-left flex flex-col items-center sm:items-start pb-2">
                {/* Photo or Fallback Avatar */}
                <div className="w-28 h-28 rounded-2xl bg-slate-100 dark:bg-slate-800 border-2 border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center text-slate-400 mb-3.5 shadow-md overflow-hidden">
                  {member.photoUrl ? (
                    <img
                      src={member.photoUrl}
                      alt={`Portrait of ${member.name}`}
                      className="w-full h-full object-cover object-top"
                      onError={(e) => {
                        // Fallback on missing image
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <User className="w-10 h-10 text-slate-400 dark:text-slate-500" />
                      <span className="text-[9px] uppercase tracking-wider mt-1 text-slate-400">Photo</span>
                    </div>
                  )}
                </div>

                <CardTitle className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {member.name}
                </CardTitle>

                <div className="font-mono text-xs text-indigo-600 dark:text-indigo-400 font-bold mt-0.5">
                  Reg No: {member.registerNumber}
                </div>
              </CardHeader>

              <CardContent className="pt-2">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                    Assigned Project Contribution:
                  </span>
                  <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-snug">
                    {member.role}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 3. ACADEMIC RUBRIC ATTESTATION                                      */}
      {/* ==================================================================== */}
      <section className="mt-10 p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 dark:text-slate-100">
              Institutional Evaluation Attestation
            </h4>
            <p className="text-slate-500 dark:text-slate-400 mt-0.5">
              Developed strictly according to the syllabus rubric for 1NF, 2NF, 3NF, 4NF, Lossless Join, and Dependency Preservation.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Badge variant="neutral" size="sm">
            Course: {projectMeta.course}
          </Badge>
          <Badge variant="accent" size="sm">
            v{projectMeta.version}
          </Badge>
        </div>
      </section>
    </div>
  );
};
