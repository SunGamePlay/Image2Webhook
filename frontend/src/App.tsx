import React, { useEffect, useState } from 'react';
import { useAuthStore } from './stores/useAuthStore';
import { LoginScreen } from './features/auth/LoginScreen';
import { NavRail } from './components/layout/NavRail';
import { UploadPane } from './features/upload/UploadPane';
import { ComparisonStudio } from './features/comparison/ComparisonStudio';
import { ToastContainer } from './components/common/Toast';
import { ErrorBoundary } from './components/common/ErrorBoundary';

export const App: React.FC = () => {
  const { user, checkSession, isLoading, logout, fetchConfig } = useAuthStore();
  const [activePane, setActivePane] = useState<'upload' | 'gallery'>('upload');

  useEffect(() => {
    checkSession();
    fetchConfig();
    if (window.location.hash === '#gallery') {
      setActivePane('gallery');
    }
    const onHash = () => {
      if (window.location.hash === '#gallery') setActivePane('gallery');
      else if (window.location.hash === '#upload') setActivePane('upload');
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, [checkSession, fetchConfig]);

  // Re-fetch app config once a session exists (developer mode).
  useEffect(() => {
    if (user) fetchConfig();
  }, [user, fetchConfig]);

  const switchPane = (pane: 'upload' | 'gallery') => {
    setActivePane(pane);
    window.location.hash = pane === 'gallery' ? '#gallery' : '#upload';
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#F8F5EE] text-[#7C7670] text-sm">
        正在加载...
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <LoginScreen />
        <ToastContainer />
      </>
    );
  }

  return (
    <ErrorBoundary>
      <div className="flex h-screen w-screen overflow-hidden bg-[#F8F5EE] app-root-layout">
        <NavRail activePane={activePane} onSelectPane={switchPane} onSignOff={logout} />
        <main className="flex-1 overflow-hidden relative app-main-content">
          {activePane === 'upload' ? (
            <UploadPane onGoToStudio={() => switchPane('gallery')} />
          ) : (
            <ComparisonStudio />
          )}
        </main>
        <ToastContainer />
      </div>
    </ErrorBoundary>
  );
};
