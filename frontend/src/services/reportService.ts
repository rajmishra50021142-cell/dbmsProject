import { ReportRequestPayload } from '../types';

const getApiEndpoints = () => {
  const customBase = import.meta.env.VITE_API_BASE_URL;
  if (customBase) {
    return [`${customBase}/reports/generate`, '/api/v1/reports/generate'];
  }
  return [
    'http://localhost:8000/api/v1/reports/generate',
    '/api/v1/reports/generate',
  ];
};

export const reportService = {
  /**
   * Request a generated report from backend in PDF, DOCX, or TXT format.
   * Preserves requested format strictly and never silently downgrades PDF/DOCX to TXT.
   */
  async generateReport(payload: ReportRequestPayload): Promise<{ blob: Blob; filename: string }> {
    const relName = payload.schema_definition.name || 'Relation';
    const sanitized = relName.replace(/[^a-zA-Z0-9_\-]/g, '_') || 'Relation';
    const defaultFilename = `normalization-report-${sanitized}.${payload.format}`;

    const endpoints = getApiEndpoints();
    let lastError: Error | null = null;

    for (const url of endpoints) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errText = await response.text().catch(() => '');
          throw new Error(`Report generation failed (${response.status}): ${errText || response.statusText}`);
        }

        // Extract filename from Content-Disposition header if available
        const disposition = response.headers.get('content-disposition');
        let filename = defaultFilename;
        if (disposition && disposition.includes('filename=')) {
          const match = disposition.match(/filename="?([^"]+)"?/);
          if (match && match[1]) {
            filename = match[1];
          }
        }

        const blob = await response.blob();
        if (blob.size === 0) {
          throw new Error('Received empty report from server.');
        }

        return { blob, filename };
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        // Continue to fallback endpoint if available
      }
    }

    // If both endpoints failed:
    if (payload.format === 'txt') {
      console.warn('Backend report API unreachable, generating client-side text report fallback:', lastError);
      const textReport = generateClientTextReport(payload);
      const blob = new Blob([textReport], { type: 'text/plain;charset=utf-8' });
      return { blob, filename: `normalization-report-${sanitized}.txt` };
    }

    // For PDF and DOCX: DO NOT silently convert to .txt!
    throw new Error(
      `Failed to generate ${payload.format.toUpperCase()} report: ${lastError?.message || 'Backend report engine unreachable'}. Ensure the backend is running at http://localhost:8000.`
    );
  },

  /**
   * Triggers a direct browser file download from a Blob.
   */
  triggerDownload(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },

  /**
   * Generates a beautifully styled, print-ready HTML report in a new tab
   * and opens the browser's native Print dialog (Save as PDF).
   */
  printHtmlReport(payload: ReportRequestPayload): void {
    const html = generateClientHtmlReport(payload);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();
      // Delay slightly for render before print
      setTimeout(() => {
        printWindow.print();
      }, 350);
    }
  },
};

function generateClientTextReport(payload: ReportRequestPayload): string {
  const s = payload.schema_definition;
  const r = payload.analysis_result;
  const now = new Date().toUTCString();

  return `============================================================================
DBMS NORMALIZATION LABORATORY (1NF-4NF ANALYZER)
ACADEMIC REPORT EXPORT
============================================================================
Generated At : ${now}
Supervisor   : Dr. Swaminathan A, Assistant Professor
Department   : Department of Computer Science and Engineering
Relation     : ${s.name}
Attributes   : ${s.attributes.join(', ')}
Candidate Key: ${(r.candidate_keys || []).map((k) => `(${k.join(', ')})`).join(', ') || 'None'}
Highest NF   : ${r.highest_confirmed_normal_form}
Summary      : ${r.summary_verdict}
----------------------------------------------------------------------------
1NF Status   : ${r.nf1?.status} - ${r.nf1?.message}
2NF Status   : ${r.nf2?.status} - ${r.nf2?.message}
3NF Status   : ${r.nf3?.status} - ${r.nf3?.message}
4NF Status   : ${r.nf4?.status} - ${r.nf4?.message}
============================================================================`;
}

function generateClientHtmlReport(payload: ReportRequestPayload): string {
  const s = payload.schema_definition;
  const r = payload.analysis_result;
  const now = new Date().toLocaleString();
  const ckeys = (r.candidate_keys || []).map((k) => `(${k.join(', ')})`).join(', ') || 'None';

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Normalization Report - ${s.name}</title>
  <style>
    @media print {
      @page { margin: 1.5cm; }
      body { font-size: 11pt; }
      .no-print { display: none !important; }
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #1e293b;
      line-height: 1.5;
      padding: 24px;
      max-width: 800px;
      margin: 0 auto;
    }
    .header {
      border-bottom: 2px solid #4f46e5;
      padding-bottom: 12px;
      margin-bottom: 20px;
    }
    h1 { margin: 0 0 4px 0; font-size: 20pt; color: #1e1b4b; }
    .subtitle { color: #64748b; font-size: 10pt; margin: 0; }
    .meta-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 12px 16px;
      margin-bottom: 20px;
      font-size: 10pt;
    }
    .meta-row { display: flex; justify-content: space-between; margin-bottom: 4px; }
    .meta-label { font-weight: 600; color: #475569; }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 16px 0;
      font-size: 10pt;
    }
    th, td {
      border: 1px solid #cbd5e1;
      padding: 8px 10px;
      text-align: left;
    }
    th { background: #f1f5f9; font-weight: 600; color: #334155; }
    .badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 12px;
      font-weight: 600;
      font-size: 9pt;
    }
    .badge-sat { background: #dcfce7; color: #166534; }
    .badge-viol { background: #fee2e2; color: #991b1b; }
    .badge-block { background: #fef3c7; color: #92400e; }
    .footer {
      margin-top: 30px;
      border-top: 1px solid #e2e8f0;
      padding-top: 12px;
      font-size: 9pt;
      color: #94a3b8;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Academic Normalization Analysis Report</h1>
    <p class="subtitle">Database Management Systems Laboratory (1NF–4NF Analyzer)</p>
  </div>

  <div class="meta-box">
    <div class="meta-row"><span class="meta-label">Relation Name:</span> <span><strong>${s.name}</strong></span></div>
    <div class="meta-row"><span class="meta-label">Attributes:</span> <span>${s.attributes.join(', ')}</span></div>
    <div class="meta-row"><span class="meta-label">Candidate Keys:</span> <span>${ckeys}</span></div>
    <div class="meta-row"><span class="meta-label">Highest Normal Form:</span> <span><strong>${r.highest_confirmed_normal_form}</strong></span></div>
    <div class="meta-row"><span class="meta-label">Supervisor:</span> <span>Dr. Swaminathan A, Assistant Professor</span></div>
    <div class="meta-row"><span class="meta-label">Generated At:</span> <span>${now}</span></div>
  </div>

  <h2>Normalization Status Summary</h2>
  <table>
    <thead>
      <tr>
        <th>Stage</th>
        <th>Status</th>
        <th>Educational Evaluation</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>1NF</strong></td>
        <td><span class="badge ${r.nf1?.status === 'SATISFIED' ? 'badge-sat' : 'badge-viol'}">${r.nf1?.status || 'N/A'}</span></td>
        <td>${r.nf1?.message || 'Cell atomicity evaluation.'}</td>
      </tr>
      <tr>
        <td><strong>2NF</strong></td>
        <td><span class="badge ${r.nf2?.status === 'SATISFIED' ? 'badge-sat' : 'badge-viol'}">${r.nf2?.status || 'N/A'}</span></td>
        <td>${r.nf2?.message || 'Partial dependency inspection.'}</td>
      </tr>
      <tr>
        <td><strong>3NF</strong></td>
        <td><span class="badge ${r.nf3?.status === 'SATISFIED' ? 'badge-sat' : (r.nf3?.status === 'VIOLATED' ? 'badge-viol' : 'badge-block')}">${r.nf3?.status || 'N/A'}</span></td>
        <td>${r.nf3?.message || 'Transitive dependency inspection.'}</td>
      </tr>
      <tr>
        <td><strong>4NF</strong></td>
        <td><span class="badge ${r.nf4?.status === 'SATISFIED' ? 'badge-sat' : (r.nf4?.status === 'VIOLATED' ? 'badge-viol' : 'badge-block')}">${r.nf4?.status || 'N/A'}</span></td>
        <td>${r.nf4?.message || 'Multivalued dependency inspection.'}</td>
      </tr>
    </tbody>
  </table>

  <h2>Summary Verdict</h2>
  <p>${r.summary_verdict}</p>

  <div class="footer">
    Evaluated by Normalization Lab • Project Guide: Dr. Swaminathan A, Assistant Professor • Department of Computer Science and Engineering
  </div>
</body>
</html>`;
}
