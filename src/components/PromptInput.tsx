import React, { useState } from 'react';
import { ToolMode } from '../types';
import { Send, Sparkles, RefreshCw, Lightbulb } from 'lucide-react';

interface PromptInputProps {
  mode: ToolMode;
  onGenerate: (prompt: string) => void;
  isLoading: boolean;
  hasContent: boolean;
}

const PRESETS: Record<ToolMode, string[]> = {
  study: [
    'Photosynthesis, Light-independent reactions, ATP & NADPH role, Calvin Cycle',
    'JavaScript Async/Await, Promises, Event Loop, Microtasks vs Macrotasks',
    'World War II Pacific Theater key turning points, Midway, Guadalcanal',
  ],
  recipe: [
    'Eggs, spinach, cherry tomatoes, feta cheese, garlic, olive oil',
    'Chicken breast, broccoli, soy sauce, ginger, sesame oil, rice',
    'Chickpeas, tahini, lemon, cucumber, red onion, parsley, pita',
  ],
  trip: [
    '4 days in Tokyo exploring tech districts, ramen spots, ancient temples, and Fuji day trip',
    '3 days in Paris focusing on art museums, bakeries, and Seine river cruise',
    '5 days road trip along California Highway 1 from SF to Big Sur and Monterey',
  ],
};

const MODE_META: Record<ToolMode, { title: string; placeholder: string; color: string }> = {
  study: {
    title: 'Generate Study Set (Flashcards & Quiz)',
    placeholder: 'Paste notes or enter any topic (e.g., Quantum Computing, Cell Biology, Microeconomics)...',
    color: 'from-indigo-600 to-blue-600',
  },
  recipe: {
    title: 'Generate Recipe & Cooking Steps',
    placeholder: 'List ingredients you have in your fridge or pantry (e.g. tomatoes, pasta, garlic, parmesan)...',
    color: 'from-emerald-600 to-teal-600',
  },
  trip: {
    title: 'Generate Day-by-Day Travel Itinerary',
    placeholder: 'Describe your dream trip (destination, duration, pace, budget, interests)...',
    color: 'from-sky-600 to-blue-600',
  },
};

export const PromptInput: React.FC<PromptInputProps> = ({
  mode,
  onGenerate,
  isLoading,
  hasContent,
}) => {
  const [promptText, setPromptText] = useState('');

  const meta = MODE_META[mode];
  const presets = PRESETS[mode];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptText.trim() || isLoading) return;
    onGenerate(promptText.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="w-full bg-white dark:bg-[#0A0A0A]/80 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-white/10 p-5 sm:p-6 shadow-xl transition-all relative overflow-hidden">
      {/* Top accent bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF3B30] via-orange-500 to-[#FF3B30]" />

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="h-3 w-3 rounded-full bg-[#FF3B30] animate-pulse" />
          <h2 className="text-xs font-mono font-bold text-slate-900 dark:text-white uppercase tracking-[0.2em]">
            {meta.title}
          </h2>
        </div>
        <span className="text-[11px] text-slate-500 dark:text-white/40 font-mono hidden sm:inline uppercase tracking-widest">
          Ctrl + Enter to Execute
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <textarea
            id="prompt-textarea"
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={meta.placeholder}
            rows={3}
            disabled={isLoading}
            className="w-full rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-black/60 px-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/30 focus:border-[#FF3B30] focus:outline-none focus:ring-1 focus:ring-[#FF3B30] disabled:opacity-60 resize-y transition-colors font-sans"
          />
        </div>

        {/* Example Presets */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs font-mono text-slate-500 dark:text-white/50 uppercase tracking-wider flex items-center gap-1.5">
            <Lightbulb className="h-3.5 w-3.5 text-[#FF3B30]" />
            Presets:
          </span>
          {presets.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              id={`preset-btn-${idx}`}
              onClick={() => setPromptText(preset)}
              disabled={isLoading}
              className="text-xs font-mono bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-white/80 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-white/10 transition-colors text-left truncate max-w-xs"
            >
              {preset}
            </button>
          ))}
        </div>

        {/* Submit Bar */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-white/10">
          <span className="text-xs font-mono text-slate-500 dark:text-white/40 uppercase tracking-widest">
            {hasContent ? '[OVERWRITE ACTIVE STATE]' : '[STRUCTURED JSON GUARANTEE]'}
          </span>

          <button
            type="submit"
            id="btn-generate-submit"
            disabled={!promptText.trim() || isLoading}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-mono uppercase tracking-widest font-bold text-white transition-all shadow-lg ${
              !promptText.trim() || isLoading
                ? 'bg-slate-300 dark:bg-white/10 text-slate-500 dark:text-white/30 cursor-not-allowed shadow-none'
                : 'bg-[#FF3B30] hover:bg-[#e03126] active:scale-95 shadow-[#FF3B30]/20'
            }`}
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Executing AI...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>{hasContent ? 'REGENERATE TOOL' : 'GENERATE INTERACTIVE TOOL'}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
