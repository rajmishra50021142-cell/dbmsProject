import React, { useState } from 'react';
import { Terminal, Play, AlertCircle, CheckCircle2, HelpCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { schemaService } from '../../services/schemaService';
import type { RelationSchema, ValidationIssue } from '../../types';

interface RawInputEditorProps {
  initialSchema: RelationSchema;
  onParsedSuccess: (parsedSchema: RelationSchema) => void;
}

export const schemaToRawText = (schema: RelationSchema): string => {
  const parts: string[] = [];

  // Relation signature
  if (schema.name || schema.attributes.length > 0) {
    const name = schema.name || 'R';
    const attrs = schema.attributes.join(', ');
    parts.push(`Relation:\n${name}(${attrs})`);
  }

  // Candidate Keys
  if (schema.candidate_keys && schema.candidate_keys.length > 0) {
    const keysStr = schema.candidate_keys.map((k) => `(${k.join(', ')})`).join(', ');
    parts.push(`Candidate Keys:\n${keysStr}`);
  }

  // FDs
  if (schema.functional_dependencies.length > 0) {
    const fdsStr = schema.functional_dependencies
      .map((fd) => `${fd.left.join(', ')} -> ${fd.right.join(', ')}`)
      .join('\n');
    parts.push(`FDs:\n${fdsStr}`);
  }

  // MVDs
  if (schema.multivalued_dependencies.length > 0) {
    const mvdsStr = schema.multivalued_dependencies
      .map((mvd) => `${mvd.left.join(', ')} ->> ${mvd.right.join(', ')}`)
      .join('\n');
    parts.push(`MVDs:\n${mvdsStr}`);
  }

  return parts.join('\n\n');
};

export const RawInputEditor: React.FC<RawInputEditorProps> = ({
  initialSchema,
  onParsedSuccess,
}) => {
  const [rawText, setRawText] = useState<string>(() => schemaToRawText(initialSchema));
  const [isParsing, setIsParsing] = useState(false);
  const [errors, setErrors] = useState<ValidationIssue[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleParse = async () => {
    setIsParsing(true);
    setErrors([]);
    setSuccessMessage(null);

    try {
      const result = await schemaService.parseRawSchema(rawText);
      if (result.valid && result.canonical_input) {
        setSuccessMessage('Notation successfully parsed and canonicalized!');
        onParsedSuccess(result.canonical_input);
      } else {
        setErrors(result.errors || []);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Parser failed to connect to backend';
      setErrors([
        {
          code: 'NETWORK_ERROR',
          path: 'raw_text',
          message: msg,
          severity: 'error',
        },
      ]);
    } finally {
      setIsParsing(false);
    }
  };

  const loadSyntaxTemplate = () => {
    setRawText(`Relation:
ENROLLMENT(StudentID, CourseID, StudentName, CourseName, Grade)

Candidate Keys:
(StudentID, CourseID)

FDs:
StudentID -> StudentName
CourseID -> CourseName
StudentID, CourseID -> Grade

MVDs:
# None defined for this schema`);
    setErrors([]);
    setSuccessMessage(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-indigo-500" />
            Raw Relational Notation
          </label>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Authoritative DBMS textbook syntax: <code className="font-mono text-indigo-600 dark:text-indigo-400">R(A, B)</code>, <code className="font-mono">A -&gt; B</code>, and <code className="font-mono">A -&gt;&gt; B</code>.
          </p>
        </div>
        <button
          type="button"
          onClick={loadSyntaxTemplate}
          className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
        >
          <HelpCircle className="w-3 h-3" />
          Load Template
        </button>
      </div>

      <div className="relative">
        <textarea
          rows={12}
          value={rawText}
          onChange={(e) => {
            setRawText(e.target.value);
            if (successMessage) setSuccessMessage(null);
          }}
          placeholder={`Relation:\nENROLLMENT(StudentID, CourseID, Grade)\n\nFDs:\nStudentID, CourseID -> Grade`}
          className="w-full p-3 font-mono text-xs leading-relaxed rounded-lg bg-slate-900 text-slate-100 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 resize-y"
          spellCheck={false}
          id="raw-notation-textarea"
        />
      </div>

      {/* Parse Action Bar */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-slate-500 dark:text-slate-400">
          Raw Mode and Structured Mode sync to the exact same canonical input object.
        </span>
        <Button
          type="button"
          size="sm"
          variant="primary"
          onClick={handleParse}
          isLoading={isParsing}
          leftIcon={<Play className="w-3.5 h-3.5" />}
          id="parse-raw-btn"
        >
          Parse Notation
        </Button>
      </div>

      {/* Status & Error Feedback */}
      {successMessage && (
        <div className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 p-3 rounded-lg border border-emerald-200 dark:border-emerald-800">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span>{successMessage}</span>
        </div>
      )}

      {errors.length > 0 && (
        <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-700 dark:text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Parsing Failed ({errors.length} {errors.length === 1 ? 'issue' : 'issues'}):</span>
          </div>
          <ul className="space-y-1 pl-5 list-disc text-xs text-rose-700 dark:text-rose-300 font-mono">
            {errors.map((err, i) => (
              <li key={i}>
                <span className="font-bold">[{err.code}]</span> {err.message}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
