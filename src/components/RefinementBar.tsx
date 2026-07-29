import React, { useState } from 'react';
import { ToolMode } from '../types';
import { Sparkles, RefreshCw, CornerDownLeft } from 'lucide-react';

interface RefinementBarProps {
  mode: ToolMode;
  onRefine: (refinementText: string) => void;
  isLoading: boolean;
}

const PLACEHOLDERS: Record<ToolMode, string> = {
  study: 'Refine study set (e.g., "Add 3 harder conceptual questions", "Focus more on Calvin Cycle")...',
  recipe: 'Refine recipe (e.g., "Make it vegan", "Add a spicy twist", "Scale for a party of 8")...',
  trip: 'Refine trip (e.g., "Make Day 2 more budget friendly", "Add a late night cocktail bar on Day 3")...',
};

export const RefinementBar: React.FC<RefinementBarProps> = ({
  mode,
  onRefine,
  isLoading,
}) => {
  const [refinementText, setRefinementText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!refinementText.trim() || isLoading) return;
    onRefine(refinementText.trim());
    setRefinementText('');
  };

  return (
    <div className="bg-[#0A0A0A] dark:bg-[#0A0A0A] text-white rounded-2xl p-4 shadow-xl border border-white/10 space-y-2 relative overflow-hidden">
      <div className="absolute top-0 left-0 bottom-0 w-1 bg-[#FF3B30]" />

      <div className="flex items-center justify-between text-xs font-mono text-white/80">
        <span className="flex items-center gap-2 uppercase tracking-[0.2em] font-bold text-[#FF3B30]">
          <Sparkles className="h-4 w-4 animate-pulse" />
          AI Iterative Refinement Engine
        </span>
        <span className="text-white/40 uppercase tracking-widest hidden sm:inline">
          [State Preservation Active]
        </span>
      </div>

      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <input
          id="refinement-input"
          type="text"
          value={refinementText}
          onChange={(e) => setRefinementText(e.target.value)}
          placeholder={PLACEHOLDERS[mode]}
          disabled={isLoading}
          className="flex-1 rounded-xl bg-black/60 border border-white/10 px-4 py-2.5 text-xs sm:text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#FF3B30] disabled:opacity-50 font-sans"
        />

        <button
          type="submit"
          id="btn-refine-submit"
          disabled={!refinementText.trim() || isLoading}
          className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#FF3B30] hover:bg-[#e03126] disabled:bg-white/10 text-white font-mono uppercase tracking-wider font-bold text-xs transition-all shrink-0 shadow-lg shadow-[#FF3B30]/20"
        >
          {isLoading ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <span>Apply Refinement</span>
              <CornerDownLeft className="h-3.5 w-3.5" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};
