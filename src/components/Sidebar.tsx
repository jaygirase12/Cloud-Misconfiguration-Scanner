import React from 'react';
import {
  LayoutDashboard,
  ShieldAlert,
  SearchCode,
  Wrench,
  History,
  FileText,
  Settings,
  LogOut,
  Shield,
} from 'lucide-react';
import { useRouter } from '../context/RouterContext';
import { useAuth } from '../firebase/authContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { path, navigate } = useRouter();
  const { user, logout, isFirebaseActive } = useAuth();

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'Scanner', icon: SearchCode, path: '/scanner' },
    { label: 'Findings', icon: ShieldAlert, path: '/findings' },
    { label: 'Remediation', icon: Wrench, path: '/remediation' },
    { label: 'Scan History', icon: History, path: '/history' },
    { label: 'Reports', icon: FileText, path: '/reports' },
    { label: 'Settings', icon: Settings, path: '/settings' },
  ];

  const handleNav = (p: string) => {
    navigate(p);
    onClose();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-cyan-600 flex items-center justify-center text-white">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-sm text-white tracking-tight">
                CloudGuard
              </h1>
              <p className="text-xs text-slate-400">
                Misconfiguration Scanner
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              path === item.path ||
              (item.path === '/findings' && path.startsWith('/findings/'));
            return (
              <button
                key={item.path}
                onClick={() => handleNav(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-cyan-600/20 text-cyan-400 font-semibold border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? 'text-cyan-400' : 'text-slate-400'
                  }`}
                />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User Card & Logout */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/50">
          <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div className="min-w-0 pr-2">
              <p className="text-xs font-medium text-slate-200 truncate">
                {user?.displayName || 'Cloud Auditor'}
              </p>
              <p className="text-[11px] text-cyan-400 truncate font-mono">
                {user?.email || 'auditor@example.com'}
              </p>
            </div>

            <button
              onClick={() => logout()}
              title="Sign Out"
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
