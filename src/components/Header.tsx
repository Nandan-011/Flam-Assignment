import React from 'react';
import { ToolMode } from '../types';
import { GraduationCap, Utensils, Compass, Bug, History, Sun, Moon, Sparkles } from 'lucide-react';

interface HeaderProps {
  currentMode: ToolMode;
  onSelectMode: (mode: ToolMode) => void;
  onOpenStressTest: () => void;
  onOpenHistory: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentMode,
  onSelectMode,
  onOpenStressTest,
  onOpenHistory,
  darkMode,
  onToggleDarkMode,
}) => {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 dark:border-white/10 bg-white/90 dark:bg-[#0A0A0A]/90 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 bg-[#FF3B30] rounded-full flex items-center justify-center font-black text-black text-lg shadow-lg shadow-[#FF3B30]/20 shrink-0">
            F
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-light text-base sm:text-lg text-slate-900 dark:text-white tracking-[0.2em] uppercase">
                FLAM <span className="font-bold text-[#FF3B30]">/ STUDIO</span>
              </h1>
              <span className="hidden sm:inline-block text-[10px] font-mono tracking-widest px-2 py-0.5 rounded bg-[#FF3B30]/10 text-[#FF3B30] border border-[#FF3B30]/30 uppercase">
                v1.0 ENGINE
              </span>
            </div>
            <p className="text-[11px] font-mono text-slate-500 dark:text-white/50 tracking-wider uppercase hidden md:block">
              STRUCTURED AI ENGINE & INTERACTIVE SUITE
            </p>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex items-center bg-slate-100 dark:bg-black/60 p-1 rounded-xl border border-slate-200 dark:border-white/10">
          <button
            id="mode-tab-study"
            onClick={() => onSelectMode('study')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all ${
              currentMode === 'study'
                ? 'bg-slate-900 dark:bg-[#FF3B30] text-white font-bold shadow-md'
                : 'text-slate-600 dark:text-white/60 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <GraduationCap className="h-4 w-4" />
            <span className="hidden md:inline">01 Study</span>
          </button>

          <button
            id="mode-tab-recipe"
            onClick={() => onSelectMode('recipe')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all ${
              currentMode === 'recipe'
                ? 'bg-slate-900 dark:bg-[#FF3B30] text-white font-bold shadow-md'
                : 'text-slate-600 dark:text-white/60 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Utensils className="h-4 w-4" />
            <span className="hidden md:inline">02 Recipe</span>
          </button>

          <button
            id="mode-tab-trip"
            onClick={() => onSelectMode('trip')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all ${
              currentMode === 'trip'
                ? 'bg-slate-900 dark:bg-[#FF3B30] text-white font-bold shadow-md'
                : 'text-slate-600 dark:text-white/60 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Compass className="h-4 w-4" />
            <span className="hidden md:inline">03 Trip</span>
          </button>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {/* History Button */}
          <button
            id="btn-session-history"
            onClick={onOpenHistory}
            className="p-2 rounded-xl text-slate-700 dark:text-white/80 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider border border-slate-200 dark:border-white/10"
            title="Saved Sessions & History"
          >
            <History className="h-4 w-4 text-[#FF3B30]" />
            <span className="hidden lg:inline">Saved</span>
          </button>

          {/* Stress Test / Debug Drawer for Live Interview */}
          <button
            id="btn-stress-test"
            onClick={onOpenStressTest}
            className="p-2 rounded-xl text-[#FF3B30] bg-[#FF3B30]/10 hover:bg-[#FF3B30]/20 transition-colors flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider border border-[#FF3B30]/30"
            title="Live Interview Stress Test Mode"
          >
            <Bug className="h-4 w-4 text-[#FF3B30]" />
            <span className="hidden lg:inline">Debug</span>
          </button>

          {/* Theme Toggle */}
          <button
            id="btn-theme-toggle"
            onClick={onToggleDarkMode}
            className="p-2 rounded-xl text-slate-700 dark:text-white/80 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 transition-colors"
            title="Toggle Dark Mode"
          >
            {darkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-700" />}
          </button>
        </div>
      </div>
    </header>
  );
};
