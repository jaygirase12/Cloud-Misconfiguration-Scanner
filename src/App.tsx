import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { AuthProvider, useAuth } from './firebase/authContext';
import { RouterProvider, useRouter } from './context/RouterContext';
import { ScanProvider } from './context/ScanContext';
import { DashboardPage } from './pages/DashboardPage';
import { FindingDetailPage } from './pages/FindingDetailPage';
import { FindingsPage } from './pages/FindingsPage';
import { HistoryPage } from './pages/HistoryPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { RemediationPage } from './pages/RemediationPage';
import { ReportsPage } from './pages/ReportsPage';
import { ScannerPage } from './pages/ScannerPage';
import { SettingsPage } from './pages/SettingsPage';

const AppContent: React.FC = () => {
  const { path } = useRouter();
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 gap-3">
        <div className="w-8 h-8 border-2 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin" />
        <span className="font-mono text-xs">Initializing CloudGuard Security Engine...</span>
      </div>
    );
  }

  // Standalone public auth routes
  if (path === '/login') {
    return <LoginPage />;
  }

  if (path === '/register') {
    return <RegisterPage />;
  }

  // Render Page Content
  const renderCurrentView = () => {
    if (path === '/dashboard') return <DashboardPage />;
    if (path === '/scanner') return <ScannerPage />;
    if (path.startsWith('/findings/')) return <FindingDetailPage />;
    if (path === '/findings') return <FindingsPage />;
    if (path === '/remediation') return <RemediationPage />;
    if (path === '/history') return <HistoryPage />;
    if (path === '/reports') return <ReportsPage />;
    if (path === '/settings') return <SettingsPage />;
    return <DashboardPage />;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      <div className="flex-1 flex min-h-0">
        {/* Sidebar Navigation */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 lg:pl-72">
          <Navbar onToggleSidebar={() => setSidebarOpen(true)} />

          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {renderCurrentView()}
          </main>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider>
        <ScanProvider>
          <AppContent />
        </ScanProvider>
      </RouterProvider>
    </AuthProvider>
  );
}
