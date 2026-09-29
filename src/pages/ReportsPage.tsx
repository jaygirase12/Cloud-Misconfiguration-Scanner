import React, { useState } from 'react';
import {
  FileText,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { SeverityBadge } from '../components/SeverityBadge';
import { useScan } from '../context/ScanContext';
import { exportScanToCsv } from '../utils/exportCsv';
import { exportScanToPdf } from '../utils/exportPdf';

export const ReportsPage: React.FC = () => {
  const { currentScan } = useScan();
  const [exportingPdf, setExportingPdf] = useState(false);
  const [exportingCsv, setExportingCsv] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!currentScan) {
    return (
      <div className="p-6 text-center bg-slate-900 rounded-xl border border-slate-800">
        <FileText className="w-8 h-8 text-slate-500 mx-auto mb-2" />
        <h3 className="text-sm font-semibold text-white">No Active Audit Scan</h3>
        <p className="text-xs text-slate-400 mt-1">
          Perform a configuration scan to export reports.
        </p>
      </div>
    );
  }

  const handleDownloadPdf = () => {
    setExportingPdf(true);
    setSuccessMsg(null);
    try {
      exportScanToPdf(currentScan);
      setSuccessMsg('PDF Report generated and downloaded.');
    } catch (err) {
      console.error(err);
    } finally {
      setExportingPdf(false);
    }
  };

  const handleDownloadCsv = () => {
    setExportingCsv(true);
    setSuccessMsg(null);
    try {
      exportScanToCsv(currentScan);
      setSuccessMsg('CSV Dataset exported.');
    } catch (err) {
      console.error(err);
    } finally {
      setExportingCsv(false);
    }
  };

  return (
    <div className="space-y-4 max-w-3xl pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-400" />
            <span>Audit Reports</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Export the current audit findings as a formal PDF document or CSV spreadsheet.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadCsv}
            disabled={exportingCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleDownloadPdf}
            disabled={exportingPdf}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{exportingPdf ? 'Generating...' : 'Download PDF'}</span>
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Report Preview Summary Card */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-white text-base">
              CloudGuard Audit Report
            </h3>
            <p className="text-xs text-slate-400">
              {currentScan.configurationName}
            </p>
          </div>
          <div className="text-right text-xs font-mono text-slate-400">
            <p>Scan ID: {currentScan.scanId}</p>
            <p>{new Date(currentScan.timestamp).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-400">
          <span className="font-medium text-slate-300 block mb-0.5">Disclaimer:</span>
          This report is generated from configuration data by Cloud Misconfiguration Scanner.
        </div>

        {/* Metric summary */}
        <div className="grid grid-cols-4 gap-2 text-center text-xs p-3 rounded-lg bg-slate-950 border border-slate-800">
          <div>
            <span className="text-slate-500 text-[10px] uppercase block">Score</span>
            <span className="font-mono font-bold text-cyan-400 text-lg">
              {currentScan.securityScore}
            </span>
          </div>
          <div>
            <span className="text-slate-500 text-[10px] uppercase block">Risk</span>
            <span className="font-medium text-slate-300">
              {currentScan.riskLevel}
            </span>
          </div>
          <div>
            <span className="text-slate-500 text-[10px] uppercase block">Passed</span>
            <span className="font-mono font-bold text-emerald-400 text-lg">
              {currentScan.passedChecks}
            </span>
          </div>
          <div>
            <span className="text-slate-500 text-[10px] uppercase block">Failed</span>
            <span className="font-mono font-bold text-rose-400 text-lg">
              {currentScan.failedChecks}
            </span>
          </div>
        </div>

        {/* Summary of checks included */}
        <div className="space-y-1.5 pt-1">
          <h4 className="text-xs font-semibold text-slate-300">
            Included Checks ({currentScan.findings.length}):
          </h4>
          <div className="space-y-1">
            {currentScan.findings.map((f) => (
              <div
                key={f.checkId}
                className="flex items-center justify-between p-2 rounded bg-slate-950/60 border border-slate-800 text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-cyan-400 text-[11px]">{f.checkId}</span>
                  <span className="text-slate-300">{f.title}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <SeverityBadge status={f.status} size="sm" />
                  <SeverityBadge severity={f.severity} size="sm" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
