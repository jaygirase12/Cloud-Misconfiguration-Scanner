import React, { useState } from 'react';
import {
  Wrench,
  Server,
  Key,
  Network,
  FileSpreadsheet,
  CheckCircle2,
} from 'lucide-react';
import { SeverityBadge } from '../components/SeverityBadge';
import { useScan } from '../context/ScanContext';
import { CheckCategory } from '../scanner/types';

export const RemediationPage: React.FC = () => {
  const { currentScan } = useScan();
  const [activeCategory, setActiveCategory] = useState<CheckCategory | 'ALL'>('ALL');

  const findings = currentScan?.findings || [];
  const failedFindings = findings.filter((f) => f.status === 'FAIL');

  const categories: { key: CheckCategory; label: string; icon: any }[] = [
    { key: 'Storage', label: 'Storage', icon: Server },
    { key: 'Identity', label: 'Identity (IAM)', icon: Key },
    { key: 'Network', label: 'Network', icon: Network },
    { key: 'Logging', label: 'Logging', icon: FileSpreadsheet },
  ];

  const displayedFindings =
    activeCategory === 'ALL'
      ? failedFindings
      : failedFindings.filter((f) => f.category === activeCategory);

  return (
    <div className="space-y-4 pb-8 max-w-4xl">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Wrench className="w-5 h-5 text-cyan-400" />
          <span>Remediation Guidance</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Step-by-step remediation procedures for failed security checks.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-1.5 border-b border-slate-800 pb-2.5">
        <button
          onClick={() => setActiveCategory('ALL')}
          className={`px-3 py-1 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
            activeCategory === 'ALL'
              ? 'bg-cyan-600 text-white font-semibold'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          All Failed ({failedFindings.length})
        </button>

        {categories.map((cat) => {
          const count = failedFindings.filter((f) => f.category === cat.key).length;
          const Icon = cat.icon;
          return (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                activeCategory === cat.key
                  ? 'bg-cyan-600 text-white font-semibold'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{cat.label}</span>
              <span className="text-[10px] px-1 py-0.2 rounded bg-slate-800 text-slate-400">
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {displayedFindings.length === 0 ? (
        <div className="p-6 text-center bg-slate-900 border border-slate-800 rounded-xl space-y-2">
          <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto" />
          <h3 className="text-xs font-semibold text-white">No Issues in This Category</h3>
          <p className="text-[11px] text-slate-400">
            All checks for this category have passed the baseline rules.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayedFindings.map((finding) => (
            <div
              key={finding.checkId}
              className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2.5"
            >
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                    {finding.checkId}
                  </span>
                  <span className="font-semibold text-white text-xs">
                    {finding.title}
                  </span>
                </div>
                <SeverityBadge severity={finding.severity} size="sm" />
              </div>

              <p className="text-xs text-slate-300">
                {finding.description}
              </p>

              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs">
                <strong className="text-cyan-400 block mb-0.5">Recommended Fix:</strong>
                <span className="text-slate-300">{finding.recommendation}</span>
              </div>

              <div>
                <span className="text-[11px] font-mono text-slate-400 block mb-1">
                  Step-by-step guidance:
                </span>
                <ol className="space-y-1">
                  {finding.remediationSteps.map((step, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 text-xs text-slate-400 pl-1"
                    >
                      <span className="text-cyan-400 font-mono text-[11px]">{idx + 1}.</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
