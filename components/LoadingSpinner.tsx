import React from 'react';
import { Sparkles } from 'lucide-react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 p-12 text-center animate-in fade-in duration-500">
      <div className="relative">
        <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-20 rounded-full animate-pulse"></div>
        <Sparkles className="w-16 h-16 text-amber-400 animate-spin-slow" />
      </div>
      <h3 className="text-xl font-serif text-indigo-200">Consulting the Stars...</h3>
      <p className="text-sm text-slate-400 max-w-xs">
        Aligning planetary positions and interpreting ancient wisdom for you.
      </p>
    </div>
  );
};

export default LoadingSpinner;