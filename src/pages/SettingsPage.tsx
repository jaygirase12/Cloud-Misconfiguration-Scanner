import React from 'react';
import { Settings, User, LogOut } from 'lucide-react';
import { useRouter } from '../context/RouterContext';
import { useAuth } from '../firebase/authContext';

export const SettingsPage: React.FC = () => {
  const { user, logout, isFirebaseActive } = useAuth();
  const { navigate } = useRouter();

  return (
    <div className="space-y-4 max-w-2xl pb-8">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-cyan-400" />
          <span>Settings</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Auditor user profile and application preferences.
        </p>
      </div>

      {/* User Information Card */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
        <h3 className="text-xs font-semibold text-white flex items-center gap-1.5">
          <User className="w-3.5 h-3.5 text-cyan-400" />
          <span>Auditor Profile</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase block">Name</span>
            <p className="font-medium text-white mt-0.5">
              {user?.displayName || 'Cloud Auditor'}
            </p>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase block">Email</span>
            <p className="font-medium text-white truncate mt-0.5">
              {user?.email || 'auditor@cloudguard.local'}
            </p>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase block">Mode</span>
            <p className="font-medium text-cyan-300 mt-0.5">
              {isFirebaseActive ? 'Firebase Authentication' : 'Local Demo Session'}
            </p>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase block">User ID</span>
            <p className="font-mono text-slate-300 truncate mt-0.5">
              {user?.uid || 'demo-uid'}
            </p>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={() => logout()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60 text-xs font-medium cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};
