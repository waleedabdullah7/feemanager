import { useEffect, useState } from 'react';
import { GraduationCap } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 5;
      });
    }, 80);

    const timer = setTimeout(onComplete, 2000);
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [onComplete]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 flex items-center justify-center">
      <div className="text-center animate-in fade-in zoom-in duration-500">
        <div className="relative">
          <div className="absolute inset-0 bg-white/20 rounded-full blur-3xl scale-150" />
          <div className="relative bg-white/10 backdrop-blur-sm p-10 rounded-3xl border border-white/20 shadow-2xl">
            <div className="w-24 h-24 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <GraduationCap className="w-14 h-14 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">School Fee Manager Pro</h1>
            <p className="text-blue-100 text-lg mb-2">Professional Fee Management System</p>
            <p className="text-blue-200 text-sm">Developed by MWA</p>
            
            <div className="mt-8">
              <div className="w-64 h-2 bg-white/20 rounded-full mx-auto overflow-hidden">
                <div 
                  className="h-full bg-white rounded-full transition-all duration-100 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-blue-200 text-sm mt-3">
                {progress < 30 ? 'Initializing...' : progress < 60 ? 'Loading modules...' : progress < 90 ? 'Preparing workspace...' : 'Ready!'}
              </p>
            </div>
          </div>
        </div>
        
        <div className="mt-8 space-y-1">
          <p className="text-white font-semibold">Version 1.0.0</p>
          <p className="text-blue-200 text-sm">Developed by <span className="font-bold text-white">MWA</span></p>
          <p className="text-blue-300 text-xs">© 2026 All Rights Reserved</p>
        </div>
      </div>
    </div>
  );
}
