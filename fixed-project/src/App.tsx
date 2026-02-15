import { useState, useEffect } from 'react';
import { ToastProvider } from '@/components/ui/Toast';
import { SplashScreen } from '@/pages/SplashScreen';
import { SetupWizard } from '@/pages/SetupWizard';
import { Login } from '@/pages/Login';
import { MainLayout } from '@/components/layout/MainLayout';
import { 
  isSetupComplete, 
  getCurrentUser,
  initializeDemoData 
} from '@/store';

type AppScreen = 'splash' | 'setup' | 'login' | 'main';

export function App() {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('splash');

  useEffect(() => {
    // Initialize demo data if needed
    initializeDemoData();
  }, []);

  const handleSplashComplete = () => {
    if (!isSetupComplete()) {
      setCurrentScreen('setup');
    } else if (!getCurrentUser()) {
      setCurrentScreen('login');
    } else {
      setCurrentScreen('main');
    }
  };

  const handleSetupComplete = () => {
    setCurrentScreen('login');
  };

  const handleLogin = () => {
    setCurrentScreen('main');
  };

  const handleLogout = () => {
    setCurrentScreen('login');
  };

  return (
    <ToastProvider>
      {currentScreen === 'splash' && (
        <SplashScreen onComplete={handleSplashComplete} />
      )}
      {currentScreen === 'setup' && (
        <SetupWizard onComplete={handleSetupComplete} />
      )}
      {currentScreen === 'login' && (
        <Login onLogin={handleLogin} />
      )}
      {currentScreen === 'main' && (
        <MainLayout onLogout={handleLogout} />
      )}
    </ToastProvider>
  );
}
