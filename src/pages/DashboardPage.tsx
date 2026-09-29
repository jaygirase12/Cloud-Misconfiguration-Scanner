import React from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Play,
  Upload,
  FileText,
  History,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import { useRouter } from '../context/RouterContext';
import { useScan } from '../context/ScanContext';
import { getRiskColor } from '../scanner/scoring';

export const DashboardPage: React.FC = () => {
  const { currentScan, allScans } = useScan();
  const { navigate } = useRouter();

  if (!currentScan) {
    return (
      <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-xl">
        <Play className="w-8 h-8 text-cyan-400 mx-auto mb-2 fill-current" />
        <h2 className="text-base font-semibold text-white">No Scan Performed Yet</h2>
        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
          Run a simulated cloud configuration scan to see security findings.
        </p>
        <button
          onClick={() => navigate('/scanner')}
          className="mt-4 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold cursor-pointer"
        >
          Open Scanner
        </button>
      </div>
    );
  }

  const riskColors = getRiskColor(currentScan.riskLevel);

  // 1. Chart Data: Risk Distribution
  const riskDistributionData = [
    { name: 'Critical', value: currentScan.criticalCount, color: '#c084fc' },
    { name: 'High', value: currentScan.highCount, color: '#f43f5e' },
    { name: 'Medium', value: currentScan.mediumCount, color: '#f59e0b' },
    { name: 'Low', value: currentScan.lowCount, color: '#38bdf8' },
    { name: 'Info', value: currentScan.infoCount, color: '#94a3b8' },
  ].filter((d) => d.value > 0);

  const safeRiskData =
    riskDistributionData.length > 0
      ? riskDistributionData
      : [{ name: 'Zero Risk (Secure)', value: 1, color: '#10b981' }];

  // 2. Chart Data: Findings by Category
  const categories = ['Storage', 'Identity', 'Network', 'Logging'] as const;
  const categoryData = categories.map((cat) => {
    const catFindings = currentScan.findings.filter((f) => f.category === cat);
    const passed = catFindings.filter((f) => f.status === 'PASS').length;
    const failed = catFindings.filter((f) => f.status === 'FAIL').length;
    return {
      category: cat,
      Passed: passed,
      Failed: failed,
    };
  });

  return (
    <div className="space-y-5 pb-8">
      {/* Target & Score Hero Card */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <span className="font-mono text-cyan-400">Target Config:</span>
            <span className="flex items-center gap-1 font-mono">
              <Clock className="w-3 h-3 text-slate-500" />
              {new Date(currentScan.timestamp).toLocaleString()}
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            {currentScan.configurationName}
          </h2>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            Scan ID: {currentScan.scanId}
          </p>
        </div>

        {/* Security Score Pill */}
        <div className="flex items-center gap-4 bg-slate-950 border border-slate-800 rounded-xl p-3.5 px-5">
          <div>
            <span className="text-[11px] text-slate-400 block font-medium">
              Security Score
            </span>
            <div className="flex items-baseline gap-1">
              <span className={`text-3xl font-extrabold font-mono ${riskColors.text}`}>
                {currentScan.securityScore}
              </span>
              <span className="text-slate-500 font-mono text-xs">/100</span>
            </div>
            <span
              className={`inline-block mt-1 text-[11px] font-bold font-mono px-2 py-0.5 rounded ${riskColors.bg} ${riskColors.text} border ${riskColors.border}`}
            >
              {currentScan.riskLevel}
            </span>
          </div>

          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-slate-900 border border-slate-800">
            {currentScan.securityScore >= 80 ? (
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
            ) : currentScan.securityScore >= 60 ? (
              <AlertTriangle className="w-6 h-6 text-yellow-400" />
            ) : (
              <ShieldAlert className="w-6 h-6 text-rose-400" />
            )}
          </div>
        </div>
      </div>

      {/* 4 Simple Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 block">Total Checks</span>
          <p className="text-xl font-bold font-mono text-white mt-1">
            {currentScan.totalChecks}
          </p>
          <span className="text-[11px] text-slate-500">Standard Baseline</span>
        </div>

        <div className="p-3.5 rounded-lg bg-slate-900 border border-emerald-900/30">
          <span className="text-xs text-slate-400 block">Passed Checks</span>
          <p className="text-xl font-bold font-mono text-emerald-400 mt-1">
            {currentScan.passedChecks}
          </p>
          <span className="text-[11px] text-emerald-500/80">Compliant</span>
        </div>

        <div className="p-3.5 rounded-lg bg-slate-900 border border-rose-900/30">
          <span className="text-xs text-slate-400 block">Failed Checks</span>
          <p className="text-xl font-bold font-mono text-rose-400 mt-1">
            {currentScan.failedChecks}
          </p>
          <span className="text-[11px] text-rose-500/80">Requires Review</span>
        </div>

        <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 block">High Severity</span>
          <p className="text-xl font-bold font-mono text-rose-400 mt-1">
            {currentScan.highCount}
          </p>
          <span className="text-[11px] text-slate-500">-10 pts each</span>
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="flex flex-wrap items-center gap-2 p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs">
        <span className="text-slate-400 font-medium mr-1">Actions:</span>
        <button
          onClick={() => navigate('/scanner')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-medium cursor-pointer"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>New Scan</span>
        </button>
        <button
          onClick={() => navigate('/findings')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 cursor-pointer"
        >
          <span>View All Findings ({currentScan.findings.length})</span>
        </button>
        <button
          onClick={() => navigate('/remediation')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 cursor-pointer"
        >
          <span>Remediation Guidance</span>
        </button>
        <button
          onClick={() => navigate('/reports')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 cursor-pointer"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Generate Report</span>
        </button>
      </div>

      {/* 2 Charts: Risk Distribution & Findings by Category */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Chart 1: Risk Distribution */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div className="mb-2">
            <h3 className="text-sm font-semibold text-white">Risk Distribution</h3>
            <p className="text-xs text-slate-400">Failed findings grouped by severity</p>
          </div>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={safeRiskData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={65}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {safeRiskData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '6px',
                    fontSize: '12px',
                    color: '#f8fafc',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2 border-t border-slate-800 text-xs">
            {safeRiskData.map((item) => (
              <span key={item.name} className="flex items-center gap-1.5 text-slate-300">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                {item.name}: {item.value}
              </span>
            ))}
          </div>
        </div>

        {/* Chart 2: Category Breakdown */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div className="mb-2">
            <h3 className="text-sm font-semibold text-white">Checks by Category</h3>
            <p className="text-xs text-slate-400">Passed vs Failed compliance checks</p>
          </div>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={categoryData}
                margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
              >
                <XAxis
                  dataKey="category"
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                />
                <YAxis
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '6px',
                    fontSize: '12px',
                    color: '#f8fafc',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
                <Bar dataKey="Passed" fill="#10b981" radius={[3, 3, 0, 0]} />
                <Bar dataKey="Failed" fill="#f43f5e" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-500 text-center">
            Storage, Identity (IAM), Network, and Logging controls
          </div>
        </div>
      </div>

      {/* Recent Scans Table */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold text-white">Recent Audit Scans</h3>
            <p className="text-xs text-slate-400">Recent configurations evaluated</p>
          </div>
          <button
            onClick={() => navigate('/history')}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 cursor-pointer"
          >
            <span>Full History ({allScans.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {allScans.length === 0 ? (
          <p className="text-xs text-slate-500 py-3 text-center">
            No previous scans recorded.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 font-mono uppercase text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-2 px-3">Scan ID</th>
                  <th className="py-2 px-3">Configuration</th>
                  <th className="py-2 px-3">Date</th>
                  <th className="py-2 px-3">Score</th>
                  <th className="py-2 px-3">Status</th>
                  <th className="py-2 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {allScans.slice(0, 4).map((scan) => (
                  <tr key={scan.scanId} className="hover:bg-slate-800/40">
                    <td className="py-2 px-3 font-mono text-cyan-400">
                      {scan.scanId}
                    </td>
                    <td className="py-2 px-3 font-medium text-white truncate max-w-[200px]">
                      {scan.configurationName}
                    </td>
                    <td className="py-2 px-3 text-slate-400">
                      {new Date(scan.timestamp).toLocaleDateString()}
                    </td>
                    <td className="py-2 px-3 font-mono font-bold">
                      {scan.securityScore}/100
                    </td>
                    <td className="py-2 px-3">
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
                    <td className="py-2 px-3 text-right">
                      <button
                        onClick={() => navigate('/findings')}
                        className="text-cyan-400 hover:text-cyan-300 font-medium cursor-pointer"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Educational Notice */}
      <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-400 text-center">
        This score is an educational project-specific metric calculated from 6 baseline checks and is not an official cloud certification.
      </div>
    </div>
  );
};
