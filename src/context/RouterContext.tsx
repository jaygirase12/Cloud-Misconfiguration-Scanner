import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '../firebase/authContext';

interface RouterContextType {
  path: string;
  navigate: (newPath: string) => void;
  params: Record<string, string>;
}

const RouterContext = createContext<RouterContextType | undefined>(undefined);

function getInitialPath(): string {
  const hash = window.location.hash.replace(/^#/, '');
  if (hash.startsWith('/')) return hash;
  const pathname = window.location.pathname;
  if (pathname && pathname !== '/') return pathname;
  return '/dashboard';
}

export const RouterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [path, setPath] = useState<string>(getInitialPath);
  const { user, loading } = useAuth();

  useEffect(() => {
    const handlePopState = () => {
      setPath(getInitialPath());
    };
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, []);

  const navigate = (newPath: string) => {
    window.location.hash = newPath;
    setPath(newPath);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Protected route enforcement
  useEffect(() => {
    if (loading) return;

    const publicPaths = ['/login', '/register'];
    const isPublic = publicPaths.includes(path);

    if (!user && !isPublic) {
      navigate('/login');
    } else if (user && (path === '/login' || path === '/register')) {
      navigate('/dashboard');
    }
  }, [user, loading, path]);

  // Extract params (e.g. /findings/STORAGE-001)
  const params: Record<string, string> = {};
  if (path.startsWith('/findings/')) {
    const findingId = path.replace('/findings/', '');
    if (findingId) {
      params.id = decodeURIComponent(findingId);
    }
  }

  return (
    <RouterContext.Provider value={{ path, navigate, params }}>
      {children}
    </RouterContext.Provider>
  );
};

export const useRouter = () => {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error('useRouter must be used within a RouterProvider');
  }
  return context;
};
