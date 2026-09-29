import React, { useMemo, useState } from 'react';
import {
  ShieldAlert,
  Search,
  Eye,
} from 'lucide-react';
import { SeverityBadge } from '../components/SeverityBadge';
import { useRouter } from '../context/RouterContext';
import { useScan } from '../context/ScanContext';
import { Finding } from '../scanner/types';

export const FindingsPage: React.FC = () => {
  const { currentScan, setSelectedFindingId } = useScan();
  const { navigate } = useRouter();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const findings = currentScan?.findings || [];

  const filteredFindings = useMemo(() => {
    return findings.filter((f) => {
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchTitle = f.title.toLowerCase().includes(q);
        const matchId = f.checkId.toLowerCase().includes(q);
        const matchDesc = f.description.toLowerCase().includes(q);
        if (!matchTitle && !matchId && !matchDesc) return false;
      }

      if (categoryFilter !== 'ALL' && f.category !== categoryFilter) return false;
      if (statusFilter !== 'ALL' && f.status !== statusFilter) return false;

      return true;
    });
  }, [findings, search, categoryFilter, statusFilter]);

  const handleSelectFinding = (finding: Finding) => {
    setSelectedFindingId(finding.checkId);
    navigate(`/findings/${encodeURIComponent(finding.checkId)}`);
  };

  return (
    <div className="space-y-4 pb-8 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-cyan-400" />
            <span>Security Findings Matrix</span>
          </h2>
          <p className="text-xs text-slate-400">
            Results of the 6 security checks evaluated on the active configuration.
          </p>
        </div>

        {currentScan && (
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800 text-emerald-400">
              Passed: {currentScan.passedChecks}
            </span>
            <span className="px-2 py-0.5 rounded bg-rose-950/60 border border-rose-800 text-rose-400">
              Failed: {currentScan.failedChecks}
            </span>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex flex-col sm:flex-row gap-2.5 text-xs">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search checks by ID or keyword..."
            className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded pl-8 pr-2.5 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-300 focus:outline-none"
        >
          <option value="ALL">All Categories</option>
          <option value="Storage">Storage</option>
          <option value="Identity">Identity</option>
          <option value="Network">Network</option>
          <option value="Logging">Logging</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-300 focus:outline-none"
        >
          <option value="ALL">All Statuses (Pass & Fail)</option>
          <option value="FAIL">Failed Checks Only</option>
          <option value="PASS">Passed Checks Only</option>
        </select>
      </div>

      {/* Findings Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 font-mono uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Check ID</th>
                <th className="py-2.5 px-2.5">Status</th>
                <th className="py-2.5 px-2.5">Severity</th>
                <th className="py-2.5 px-2.5">Category</th>
                <th className="py-2.5 px-3">Finding Title</th>
                <th className="py-2.5 px-3">Evidence</th>
                <th className="py-2.5 px-3 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {filteredFindings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-slate-500">
                    No security checks matched your filter.
                  </td>
                </tr>
              ) : (
                filteredFindings.map((finding) => (
                  <tr
                    key={finding.checkId}
                    className="hover:bg-slate-800/40 transition-colors cursor-pointer"
                    onClick={() => handleSelectFinding(finding)}
                  >
                    <td className="py-3 px-3 font-mono font-bold text-cyan-400">
                      {finding.checkId}
                    </td>

                    <td className="py-3 px-2.5">
                      <SeverityBadge status={finding.status} size="sm" />
                    </td>

                    <td className="py-3 px-2.5">
                      <SeverityBadge severity={finding.severity} size="sm" />
                    </td>

                    <td className="py-3 px-2.5 text-slate-400 font-mono text-[11px]">
                      {finding.category}
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-medium text-white">
                        {finding.title}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate max-w-xs mt-0.5">
                        {finding.description}
                      </div>
                    </td>

                    <td className="py-3 px-3 font-mono text-[11px] text-cyan-300">
                      <span className="bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                        {finding.evidence}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectFinding(finding);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-cyan-600 text-slate-300 hover:text-white transition-colors text-xs font-medium cursor-pointer"
                      >
                        <Eye className="w-3 h-3" />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
