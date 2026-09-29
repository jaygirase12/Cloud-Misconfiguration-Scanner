import React from 'react';
import { Menu, Play, FileDown, UserCheck } from 'lucide-react';
import { useAuth } from '../firebase/authContext';
import { useRouter } from '../context/RouterContext';
import { useScan } from '../context/ScanContext';

interface NavbarProps {
  onToggleSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { path, navigate } = useRouter();
  const { currentScan } = useScan();
  const { user } = useAuth();

  const getPageTitle = (p: string) => {
    if (p === '/dashboard') return 'Dashboard';
    if (p === '/scanner') return 'Configuration Scanner';
    if (p.startsWith('/findings')) return 'Security Findings';
    if (p === '/remediation') return 'Remediation Guide';
    if (p === '/history') return 'Scan History';
    if (p === '/reports') return 'Audit Reports';
    if (p === '/settings') return 'Settings';
    return 'CloudGuard';
  };

  return (
    <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white lg:hidden cursor-pointer"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-base font-semibold text-white tracking-tight">
            {getPageTitle(path)}
          </h1>
          <p className="text-xs text-slate-400 hidden sm:block">
            Cloud Misconfiguration Scanner
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {user?.email && (
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-xs text-slate-300 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span className="truncate max-w-[160px]">{user.email}</span>
          </div>
        )}

        {currentScan && (
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-xs">
            <span className="text-slate-400">Score:</span>
            <span
              className={`font-mono font-bold ${
                currentScan.securityScore >= 80
                  ? 'text-emerald-400'
                  : currentScan.securityScore >= 60
                  ? 'text-yellow-400'
                  : 'text-rose-400'
              }`}
            >
              {currentScan.securityScore}/100
            </span>
          </div>
        )}

        <button
          onClick={() => navigate('/scanner')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-cyan-600 hover:bg-cyan-500 text-white transition-colors cursor-pointer"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>New Scan</span>
        </button>

        <button
          onClick={() => navigate('/reports')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
        >
          <FileDown className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reports</span>
        </button>
      </div>
    </header>
  );
};
