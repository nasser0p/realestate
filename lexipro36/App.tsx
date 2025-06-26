
import React, { useEffect, useState } from 'react';
import { HashRouter, Routes, Route, useLocation, Navigate, Outlet } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardPage from './pages/DashboardPage';
import CasesPage from './pages/CasesPage';
import DocumentsPage from './pages/DocumentsPage';
import AiCopilotPage from './pages/AiCopilotPage';
import SettingsPage from './pages/SettingsPage';
import CalendarPage from './pages/CalendarPage'; // Import CalendarPage
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import { LanguageProvider } from './contexts/LanguageContext';
import { CaseProvider } from './contexts/CaseContext';
import { ToastProvider, useToast } from './contexts/ToastContext';
import { AuthProvider, useAuth } from './contexts/AuthContext'; 
import { UserProvider } from './contexts/UserContext';
import { NotificationProvider } from './contexts/NotificationContext'; // Import NotificationProvider
import { useLanguage } from './hooks/useLanguage';
import { STRINGS, APP_NAME } from './constants';
import { Language } from './types';
import CaseDetailPage from './pages/CaseDetailPage';
import Toast from './components/Toast';
import LoadingSpinner from './components/LoadingSpinner';


const PageTitleUpdater: React.FC = () => {
  const location = useLocation();
  const { language } = useLanguage();
  const strings = STRINGS[language];
  const { currentUser } = useAuth();

  useEffect(() => {
    let title = APP_NAME; // Default title
    if (currentUser) {
      const path = location.pathname;
      if (path === '/') title = strings.dashboard;
      else if (path === '/cases') title = strings.cases;
      else if (path.startsWith('/cases/')) title = strings.caseDetails || 'Case Details';
      else if (path === '/documents') title = strings.documents;
      else if (path === '/calendar') title = strings.calendar; // Add calendar title
      else if (path === '/ai-copilot') title = strings.aiCopilot;
      else if (path === '/settings') title = strings.settings;
    } else {
      if (location.pathname === '/login') title = `${strings.login} - ${APP_NAME}`;
      else if (location.pathname === '/signup') title = `${strings.signup} - ${APP_NAME}`;
    }
    document.title = title;
  }, [location.pathname, language, strings, currentUser]);

  return null; // This component doesn't render anything itself
};


const RouteBasedHeader: React.FC = () => {
  const location = useLocation();
  const { language } = useLanguage();
  const strings = STRINGS[language];
  const [headerTitle, setHeaderTitle] = useState(strings.dashboard);
  const { currentUser } = useAuth();

  useEffect(() => {
    const path = location.pathname;
    if (!currentUser) return; // Header is only for authenticated users in ProtectedLayout

    if (path === '/') setHeaderTitle(strings.dashboard);
    else if (path === '/cases') setHeaderTitle(strings.cases);
    else if (path.startsWith('/cases/')) {
      setHeaderTitle(strings.caseDetails || 'Case Details'); 
    }
    else if (path === '/documents') setHeaderTitle(strings.documents);
    else if (path === '/calendar') setHeaderTitle(strings.calendar); // Add calendar header title
    else if (path === '/ai-copilot') setHeaderTitle(strings.aiCopilot);
    else if (path === '/settings') setHeaderTitle(strings.settings);
    else setHeaderTitle(APP_NAME);
  }, [location.pathname, language, strings, currentUser]);
  
  if (!currentUser) return null;

  return <Header title={headerTitle} />;
};

const AuthPagesHeader: React.FC = () => {
  return (
     <header className="bg-primary shadow-md p-4 flex justify-center items-center sticky top-0 z-40">
      <h1 className="text-3xl font-bold text-light-text">{APP_NAME}</h1>
    </header>
  );
};

const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  if (!toasts.length) return null;

  return (
    <div className="fixed top-5 right-5 z-[100] space-y-3">
      {toasts.map(toast => (
        <Toast key={toast.id} {...toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
};

const ProtectedLayout: React.FC = () => {
  const { language } = useLanguage();
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className={`flex-1 overflow-y-auto bg-neutral ${language === Language.AR ? 'mr-64' : 'ml-64'} transition-all duration-300`}>
        <RouteBasedHeader />
        <ToastContainer />
        <div className="p-6">
          <Outlet /> {/* Child routes will render here */}
        </div>
      </main>
    </div>
  );
};

// ProtectedRoute component
const ProtectedRoute: React.FC = () => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="fixed inset-0 bg-neutral flex justify-center items-center z-[200]">
        <LoadingSpinner size="w-16 h-16" />
      </div>
    );
  }

  return currentUser ? <ProtectedLayout /> : <Navigate to="/login" replace />;
};


const AppRoutes: React.FC = () => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="fixed inset-0 bg-neutral flex justify-center items-center z-[200]">
        <LoadingSpinner size="w-16 h-16" />
      </div>
    );
  }

  return (
    <>
      <PageTitleUpdater />
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={!currentUser ? <><AuthPagesHeader /><LoginPage /></> : <Navigate to="/" />} />
        <Route path="/signup" element={!currentUser ? <><AuthPagesHeader /><SignupPage /></> : <Navigate to="/" />} />

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/cases" element={<CasesPage />} />
          <Route path="/cases/:caseId" element={<CaseDetailPage />} />
          <Route path="/documents" element={<DocumentsPage />} />
          <Route path="/calendar" element={<CalendarPage />} /> {/* Add CalendarPage route */}
          <Route path="/ai-copilot" element={<AiCopilotPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
        
        {/* Fallback for any other route when not logged in */}
         {!currentUser && <Route path="*" element={<Navigate to="/login" />} />}
         {/* Fallback for authenticated users if route not found (optional, could redirect to '/' or a 404 page) */}
         {currentUser && <Route path="*" element={<Navigate to="/" />} />}
      </Routes>
    </>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <LanguageProvider>
        <ToastProvider>
          <UserProvider>
            <NotificationProvider> {/* NotificationProvider added here */}
              <CaseProvider> {/* CaseProvider needs to be inside NotificationProvider if it triggers notifications */}
                <HashRouter>
                  <AppRoutes />
                </HashRouter>
              </CaseProvider>
            </NotificationProvider>
          </UserProvider>
        </ToastProvider>
      </LanguageProvider>
    </AuthProvider>
  );
};

export default App;