import React, { useState, useEffect, useRef } from 'react';
import {
  ToolMode,
  GeneratedContent,
  StressTestMode,
  SavedSession,
} from './types';
import { repairAndParseJSON, normalizeGeneratedContent } from './lib/jsonRepair';
import { Header } from './components/Header';
import { PromptInput } from './components/PromptInput';
import { StudyTool } from './components/StudyTool';
import { RecipeTool } from './components/RecipeTool';
import { TripTool } from './components/TripTool';
import { RefinementBar } from './components/RefinementBar';
import { StressTestModal } from './components/StressTestModal';
import { SessionHistoryModal } from './components/SessionHistoryModal';
import {
  AlertTriangle,
  RefreshCw,
  Sparkles,
  GraduationCap,
  Utensils,
  Compass,
  CheckCircle2,
  Bug,
} from 'lucide-react';

export default function App() {
  const [currentMode, setCurrentMode] = useState<ToolMode>('study');
  const [content, setContent] = useState<GeneratedContent | null>(null);
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Stress Test / Debug Mode State
  const [stressTestMode, setStressTestMode] = useState<StressTestMode>('none');
  const [isStressTestOpen, setIsStressTestOpen] = useState(false);

  // History / Saved Sessions
  const [sessions, setSessions] = useState<SavedSession[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Dark Mode State
  const [darkMode, setDarkMode] = useState(false);

  // Request counter to avoid stale responses overwriting newer ones (Race condition protection!)
  const requestCounterRef = useRef(0);

  // Load dark mode preference and saved sessions on mount
  useEffect(() => {
    const isDark = localStorage.getItem('flam_theme') === 'dark';
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    }

    try {
      const saved = localStorage.getItem('flam_ai_sessions');
      if (saved) {
        setSessions(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Failed to parse saved sessions from localStorage:', e);
    }
  }, []);

  const toggleDarkMode = () => {
    const nextDark = !darkMode;
    setDarkMode(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('flam_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('flam_theme', 'light');
    }
  };

  const saveSessionToStorage = (mode: ToolMode, prompt: string, generated: GeneratedContent) => {
    const newSession: SavedSession = {
      id: `sess-${Date.now()}`,
      timestamp: Date.now(),
      mode,
      prompt,
      content: generated,
    };

    setSessions((prev) => {
      const updated = [newSession, ...prev].slice(0, 20); // Keep max 20 recent
      localStorage.setItem('flam_ai_sessions', JSON.stringify(updated));
      return updated;
    });
  };

  const handleGenerate = async (prompt: string, refinementPrompt?: string) => {
    setIsLoading(true);
    setErrorMessage(null);

    // Increment request ID to ignore responses if user clicked generate again
    const requestId = ++requestCounterRef.current;

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: currentMode,
          prompt,
          refinementPrompt,
          currentContent: refinementPrompt ? content : undefined,
          stressTestMode,
        }),
      });

      // Ignore stale response if another request was fired after this one
      if (requestId !== requestCounterRef.current) return;

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || `Server responded with status ${response.status}`);
      }

      const data = await response.json();
      if (requestId !== requestCounterRef.current) return;

      const rawText = data.rawText;

      // 1. Repair & Parse raw JSON
      const parsedObj = repairAndParseJSON(rawText);

      // 2. Schema normalize & validate
      const normalized = normalizeGeneratedContent(parsedObj, currentMode);

      // 3. Set state safely
      setContent(normalized);
      setCurrentPrompt(prompt);

      // Save to localStorage history
      saveSessionToStorage(currentMode, prompt, normalized);
    } catch (err: any) {
      if (requestId !== requestCounterRef.current) return;
      console.error('Generation Error:', err);
      setErrorMessage(
        err.message || 'Failed to process AI output. Check network or retry.'
      );
    } finally {
      if (requestId === requestCounterRef.current) {
        setIsLoading(false);
      }
    }
  };

  const handleRetry = () => {
    if (currentPrompt) {
      handleGenerate(currentPrompt);
    }
  };

  const handleLoadSession = (sess: SavedSession) => {
    setCurrentMode(sess.mode);
    setCurrentPrompt(sess.prompt);
    setContent(sess.content);
    setErrorMessage(null);
  };

  const handleClearSessions = () => {
    setSessions([]);
    localStorage.removeItem('flam_ai_sessions');
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#0A0A0A] text-slate-900 dark:text-white font-sans transition-colors pb-16 relative overflow-x-hidden bg-artistic-grid">
      {/* Navbar Header */}
      <Header
        currentMode={currentMode}
        onSelectMode={(mode) => {
          setCurrentMode(mode);
          setContent(null);
          setErrorMessage(null);
        }}
        onOpenStressTest={() => setIsStressTestOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        darkMode={darkMode}
        onToggleDarkMode={toggleDarkMode}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Active Stress Test Banner if Enabled */}
        {stressTestMode !== 'none' && (
          <div className="p-4 rounded-2xl bg-rose-950/80 border-2 border-[#FF3B30] text-white flex items-center justify-between gap-4 shadow-xl backdrop-blur-md">
            <div className="flex items-center gap-3 text-xs sm:text-sm font-mono font-semibold">
              <Bug className="h-5 w-5 text-[#FF3B30] animate-bounce shrink-0" />
              <div>
                <span className="font-bold uppercase tracking-wider text-[#FF3B30]">[STRESS TEST ACTIVE]:</span>{' '}
                <span className="underline uppercase tracking-widest">{stressTestMode}</span>
              </div>
            </div>
            <button
              onClick={() => setStressTestMode('none')}
              className="px-3.5 py-1.5 rounded-xl bg-[#FF3B30] text-white font-mono font-bold text-xs hover:bg-[#e03126] transition-colors uppercase tracking-wider shadow-md"
            >
              Reset to Normal
            </button>
          </div>
        )}

        {/* Input Card */}
        <PromptInput
          mode={currentMode}
          onGenerate={(prompt) => handleGenerate(prompt)}
          isLoading={isLoading}
          hasContent={!!content}
        />

        {/* Error Boundary Display Card */}
        {errorMessage && (
          <div className="bg-rose-950/60 border border-[#FF3B30] rounded-2xl p-6 shadow-xl space-y-3 backdrop-blur-md">
            <div className="flex items-center gap-2 text-[#FF3B30] font-mono font-bold text-sm uppercase tracking-widest">
              <AlertTriangle className="h-5 w-5" />
              [AI FAILURE INTERCEPTED]
            </div>
            <p className="text-xs sm:text-sm text-white font-mono bg-black/60 p-3.5 rounded-xl border border-rose-900/60 leading-relaxed">
              {errorMessage}
            </p>
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs font-mono text-slate-400">
                Resilient pipeline auto-intercepted execution error. Application frame intact.
              </span>
              <button
                onClick={handleRetry}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FF3B30] hover:bg-[#e03126] text-white font-mono uppercase tracking-wider font-bold text-xs transition-colors shadow-lg"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Retry Request
              </button>
            </div>
          </div>
        )}

        {/* Refinement Bar (Visible when output exists) */}
        {content && !isLoading && (
          <RefinementBar
            mode={currentMode}
            onRefine={(refinement) => handleGenerate(currentPrompt, refinement)}
            isLoading={isLoading}
          />
        )}

        {/* Main Content Area */}
        {content && !errorMessage && (
          <div className="space-y-6">
            {content.type === 'study' && <StudyTool data={content.data} />}
            {content.type === 'recipe' && <RecipeTool data={content.data} />}
            {content.type === 'trip' && <TripTool data={content.data} />}
          </div>
        )}

        {/* Empty State / Welcome Guide */}
        {!content && !isLoading && !errorMessage && (
          <div className="bg-white/90 dark:bg-[#0A0A0A]/90 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-white/10 p-8 sm:p-10 text-center space-y-8 shadow-2xl max-w-4xl mx-auto relative overflow-hidden">
            <div className="absolute -top-24 -right-24 w-60 h-60 bg-[#FF3B30]/10 rounded-full blur-3xl pointer-events-none" />

            <div className="h-16 w-16 mx-auto rounded-full bg-[#FF3B30]/10 border border-[#FF3B30]/30 flex items-center justify-center text-[#FF3B30] shadow-inner">
              <Sparkles className="h-8 w-8" />
            </div>

            <div className="space-y-3">
              <p className="text-[#FF3B30] font-mono text-xs uppercase tracking-[0.3em]">
                ARTISTIC AI ENGINE / INTERACTIVE SUITE
              </p>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                STRUCTURED INTERACTIVE TOOL SUITE
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-white/60 max-w-2xl mx-auto leading-relaxed font-light">
                Submit raw unstructured prompts above. The AI engine guarantees JSON schema compliance, auto-repairs truncated outputs, and renders stateful interactive UI components.
              </p>
            </div>

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left pt-6 border-t border-slate-200 dark:border-white/10">
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-black/60 space-y-2 border border-slate-200 dark:border-white/10 relative">
                <div className="flex items-center gap-2 font-mono font-bold text-xs text-[#FF3B30] uppercase tracking-wider">
                  <GraduationCap className="h-4 w-4" /> 01. STUDY ENGINE
                </div>
                <p className="text-xs text-slate-600 dark:text-white/60 leading-relaxed font-light">
                  3D spatial flip flashcards, active quizzes with explanation steps, and re-testing wrong answers.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-black/60 space-y-2 border border-slate-200 dark:border-white/10 relative">
                <div className="flex items-center gap-2 font-mono font-bold text-xs text-[#FF3B30] uppercase tracking-wider">
                  <Utensils className="h-4 w-4" /> 02. RECIPE BUILDER
                </div>
                <p className="text-xs text-slate-600 dark:text-white/60 leading-relaxed font-light">
                  Serving multipliers, step-by-step cooking timers, checkable ingredients, and substitution cards.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-black/60 space-y-2 border border-slate-200 dark:border-white/10 relative">
                <div className="flex items-center gap-2 font-mono font-bold text-xs text-[#FF3B30] uppercase tracking-wider">
                  <Compass className="h-4 w-4" /> 03. TRIP PLANNER
                </div>
                <p className="text-xs text-slate-600 dark:text-white/60 leading-relaxed font-light">
                  Day-by-day collapsible itineraries with reorderable stop sequences, duration timers, and budget tracking.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Stress Test Modal */}
      <StressTestModal
        isOpen={isStressTestOpen}
        onClose={() => setIsStressTestOpen(false)}
        activeTestMode={stressTestMode}
        onSelectTestMode={(mode) => setStressTestMode(mode)}
      />

      {/* Saved Sessions Drawer Modal */}
      <SessionHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        sessions={sessions}
        onLoadSession={handleLoadSession}
        onClearSessions={handleClearSessions}
      />
    </div>
  );
}
