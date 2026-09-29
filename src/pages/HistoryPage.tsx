import React, { useState } from 'react';
import {
  History,
  Trash2,
  Play,
  Scale,
} from 'lucide-react';
import { useRouter } from '../context/RouterContext';
import { useScan } from '../context/ScanContext';
import { ScanResult } from '../scanner/types';

export const HistoryPage: React.FC = () => {
  const { allScans, currentScan, setCurrentScan, deleteScan } = useScan();
  const { navigate } = useRouter();

  const [compareIds, setCompareIds] = useState<string[]>([]);

  const handleActivateScan = (scan: ScanResult) => {
    setCurrentScan(scan);
    navigate('/dashboard');
  };

  const toggleCompare = (id: string) => {
    setCompareIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      }
      if (prev.length >= 2) {
        return [prev[1], id];
      }
      return [...prev, id];
    });
  };

  const scanA = allScans.find((s) => s.scanId === compareIds[0]);
  const scanB = allScans.find((s) => s.scanId === compareIds[1]);

  return (
    <div className="space-y-4 pb-8 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <History className="w-5 h-5 text-cyan-400" />
            <span>Scan History</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Previous scan results and score comparisons.
          </p>
        </div>

        <button
          onClick={() => navigate('/scanner')}
          className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium flex items-center gap-1.5 cursor-pointer"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>New Scan</span>
        </button>
      </div>

      {/* Comparison Drawer if 2 scans selected */}
      {scanA && scanB && (
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-700 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-white flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-cyan-400" />
              <span>Comparing 2 Scans</span>
            </h3>
            <button
              onClick={() => setCompareIds([])}
              className="text-xs text-slate-400 hover:text-white"
            >
              Clear
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <p className="font-semibold text-white truncate">{scanA.configurationName}</p>
              <div className="text-xl font-mono font-bold text-cyan-400 mt-1">
                {scanA.securityScore}/100
              </div>
              <p className="text-slate-400 text-[11px] mt-0.5">
                {scanA.failedChecks} failed checks ({scanA.riskLevel})
              </p>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <p className="font-semibold text-white truncate">{scanB.configurationName}</p>
              <div className="text-xl font-mono font-bold text-cyan-400 mt-1">
                {scanB.securityScore}/100
              </div>
              <p className="text-slate-400 text-[11px] mt-0.5">
                {scanB.failedChecks} failed checks ({scanB.riskLevel})
              </p>
            </div>
          </div>
        </div>
      )}

      {/* History Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        {allScans.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-500">
            No scans recorded yet. Run a scan from the Scanner page.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 font-mono uppercase text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3 w-8 text-center">Compare</th>
                  <th className="py-2.5 px-3">Scan ID</th>
                  <th className="py-2.5 px-3">Configuration</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Score</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {allScans.map((scan) => {
                  const isCurrent = scan.scanId === currentScan?.scanId;
                  const isCompared = compareIds.includes(scan.scanId);

                  return (
                    <tr
                      key={scan.scanId}
                      className={`hover:bg-slate-800/40 ${
                        isCurrent ? 'bg-cyan-950/20' : ''
                      }`}
                    >
                      <td className="py-2.5 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={isCompared}
                          onChange={() => toggleCompare(scan.scanId)}
                          className="rounded bg-slate-950 border-slate-700"
                        />
                      </td>

                      <td className="py-2.5 px-3 font-mono text-cyan-400">
                        {scan.scanId}
                        {isCurrent && (
                          <span className="ml-1 text-[9px] px-1 py-0.2 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                            Active
                          </span>
                        )}
                      </td>

                      <td className="py-2.5 px-3 font-medium text-white max-w-[180px] truncate">
                        {scan.configurationName}
                      </td>

                      <td className="py-2.5 px-3 text-slate-400">
                        {new Date(scan.timestamp).toLocaleDateString()}
                      </td>

                      <td className="py-2.5 px-3 font-mono font-bold">
                        {scan.securityScore}/100
                      </td>

                      <td className="py-2.5 px-3">
                        <span
                          className={`text-[11px] px-1.5 py-0.5 rounded font-mono ${
                            scan.riskLevel === 'Low Risk'
                              ? 'text-emerald-400 bg-emerald-950/60'
                              : scan.riskLevel === 'Moderate Risk'
                              ? 'text-amber-400 bg-amber-950/60'
                              : 'text-rose-400 bg-rose-950/60'
                          }`}
                        >
                          {scan.riskLevel}
                        </span>
                      </td>

                      <td className="py-2.5 px-3 text-right space-x-1.5">
                        <button
                          onClick={() => handleActivateScan(scan)}
                          className="px-2 py-0.5 rounded bg-slate-800 hover:bg-cyan-600 text-slate-300 hover:text-white transition-colors text-xs cursor-pointer"
                        >
                          Open
                        </button>

                        <button
                          onClick={() => deleteScan(scan.scanId)}
                          title="Delete"
                          className="p-1 text-slate-500 hover:text-rose-400 rounded cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
