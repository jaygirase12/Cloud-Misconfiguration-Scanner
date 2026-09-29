import React, { useState } from 'react';
import {
  ArrowLeft,
  Wrench,
  HelpCircle,
  Copy,
  Check,
  FileCheck2,
} from 'lucide-react';
import { SeverityBadge } from '../components/SeverityBadge';
import { useRouter } from '../context/RouterContext';
import { useScan } from '../context/ScanContext';

export const FindingDetailPage: React.FC = () => {
  const { params, navigate } = useRouter();
  const { currentScan } = useScan();
  const [copied, setCopied] = useState(false);

  const findingId = params.id;
  const finding = currentScan?.findings.find(
    (f) => f.checkId === findingId || f.id === findingId
  );

  if (!finding) {
    return (
      <div className="p-6 text-center bg-slate-900 rounded-xl border border-slate-800">
        <h3 className="text-sm font-semibold text-white">Finding Not Found</h3>
        <p className="text-xs text-slate-400 mt-1">
          No check with ID "{findingId}" found.
        </p>
        <button
          onClick={() => navigate('/findings')}
          className="mt-3 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs"
        >
          Return to Findings
        </button>
      </div>
    );
  }

  const isPass = finding.status === 'PASS';

  const copyRemediation = () => {
    const text = finding.remediationSteps.map((s, i) => `${i + 1}. ${s}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4 max-w-3xl pb-8">
      <button
        onClick={() => navigate('/findings')}
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Findings</span>
      </button>

      {/* Main Header Card */}
      <div className="p-4 sm:p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
              {finding.checkId}
            </span>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
              {finding.category}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <SeverityBadge status={finding.status} size="sm" />
            <SeverityBadge severity={finding.severity} size="sm" />
          </div>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">
            {finding.title}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {finding.description}
          </p>
        </div>

        {/* Evidence Pill */}
        <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
          <div className="font-mono text-slate-400">
            Evidence: <strong className="text-cyan-300">{finding.evidence}</strong>
          </div>
          <span
            className={`font-mono text-xs font-semibold px-2 py-0.5 rounded ${
              isPass
                ? 'bg-emerald-950 text-emerald-400'
                : 'bg-rose-950 text-rose-400'
            }`}
          >
            {isPass ? 'COMPLIANT' : 'NON-COMPLIANT'}
          </span>
        </div>
      </div>

      {/* Security Impact */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
        <h3 className="text-xs font-semibold text-slate-200">
          Security Impact
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          {finding.impact}
        </p>
      </div>

      {/* Remediation Section */}
      <div className="p-4 sm:p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-white flex items-center gap-1.5">
            <Wrench className="w-3.5 h-3.5 text-emerald-400" />
            <span>Recommended Remediation</span>
          </h3>

          <button
            onClick={copyRemediation}
            className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-950 border border-slate-800 cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Copy Steps</span>
              </>
            )}
          </button>
        </div>

        <p className="text-xs text-slate-300 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
          {finding.recommendation}
        </p>

        {/* Step-by-Step List */}
        <div className="space-y-1.5 pt-1">
          <span className="text-[11px] font-mono uppercase text-slate-400 block">
            Step-by-Step Fix:
          </span>
          <ol className="space-y-1.5">
            {finding.remediationSteps.map((step, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2.5 p-2 rounded bg-slate-950/60 border border-slate-800 text-xs text-slate-300"
              >
                <span className="w-4 h-4 rounded bg-cyan-950 text-cyan-400 font-mono text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
};
