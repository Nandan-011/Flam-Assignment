import React, { useState } from 'react';
import { RecipeModule } from '../types';
import {
  Utensils,
  Clock,
  Users,
  CheckSquare,
  Square,
  Repeat,
  Flame,
  ChefHat,
  Timer,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface RecipeToolProps {
  data: RecipeModule;
}

export const RecipeTool: React.FC<RecipeToolProps> = ({ data }) => {
  const [servingMultiplier, setServingMultiplier] = useState(1);
  const [checkedSteps, setCheckedSteps] = useState<Record<number, boolean>>({});
  const [checkedIngredients, setCheckedIngredients] = useState<Record<string, boolean>>({});
  const [showSwaps, setShowSwaps] = useState(false);

  const currentServings = Math.round(data.baseServings * servingMultiplier);

  const toggleStep = (stepNum: number) => {
    setCheckedSteps((prev) => ({ ...prev, [stepNum]: !prev[stepNum] }));
  };

  const toggleIngredient = (name: string) => {
    setCheckedIngredients((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  return (
    <div className="space-y-6">
      {/* Recipe Header Banner */}
      <div className="bg-[#0A0A0A] text-white rounded-2xl p-6 shadow-xl border border-white/10 relative overflow-hidden">
        <div className="absolute top-0 left-0 bottom-0 w-1 bg-[#FF3B30]" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[#FF3B30] text-xs font-mono font-bold uppercase tracking-[0.2em]">
              <ChefHat className="h-4 w-4" />
              02. INTERACTIVE AI RECIPE ENGINE
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight uppercase text-white">{data.title}</h2>
            <p className="text-xs sm:text-sm text-white/70 max-w-2xl font-light">{data.description}</p>
          </div>

          {/* Quick Meta Badges */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
            <div className="bg-black/60 px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-1.5 text-white/80 uppercase">
              <Clock className="h-3.5 w-3.5 text-[#FF3B30]" />
              Prep {data.prepTimeMinutes}m | Cook {data.cookTimeMinutes}m
            </div>

            <div className="bg-black/60 px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-1.5 text-white/80 uppercase">
              <Flame className="h-3.5 w-3.5 text-[#FF3B30]" />
              Diff: {data.difficulty}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Ingredients & Scalable Servings */}
        <div className="lg:col-span-1 space-y-6">
          {/* Servings Scalar */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Users className="h-4 w-4 text-emerald-500" />
                Scale Servings
              </span>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                {currentServings} servings ({servingMultiplier}x)
              </span>
            </div>

            {/* Serving Preset Buttons */}
            <div className="grid grid-cols-4 gap-2">
              {[0.5, 1, 2, 3].map((mult) => (
                <button
                  key={mult}
                  id={`btn-servings-${mult}`}
                  type="button"
                  onClick={() => setServingMultiplier(mult)}
                  className={`py-1.5 rounded-lg text-xs font-bold transition-all border ${
                    servingMultiplier === mult
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-400'
                  }`}
                >
                  {mult * data.baseServings}p
                </button>
              ))}
            </div>

            {/* Nutrition per serving preview */}
            {data.nutritionPerServing && (
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-3 gap-2 text-center text-xs">
                {data.nutritionPerServing.calories && (
                  <div className="bg-slate-50 dark:bg-slate-800/60 p-2 rounded-lg">
                    <span className="text-slate-400 block text-[10px]">Calories</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {Math.round(data.nutritionPerServing.calories)}
                    </span>
                  </div>
                )}
                {data.nutritionPerServing.protein && (
                  <div className="bg-slate-50 dark:bg-slate-800/60 p-2 rounded-lg">
                    <span className="text-slate-400 block text-[10px]">Protein</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {data.nutritionPerServing.protein}
                    </span>
                  </div>
                )}
                {data.nutritionPerServing.carbs && (
                  <div className="bg-slate-50 dark:bg-slate-800/60 p-2 rounded-lg">
                    <span className="text-slate-400 block text-[10px]">Carbs</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {data.nutritionPerServing.carbs}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Ingredient Checklist */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <Utensils className="h-4 w-4 text-emerald-500" />
              Ingredients Checklist
            </h3>

            <div className="space-y-2">
              {data.ingredients.map((ing, idx) => {
                const scaledAmount = Number((ing.amount * servingMultiplier).toFixed(2));
                const isChecked = checkedIngredients[ing.name];

                return (
                  <div
                    key={idx}
                    id={`ingredient-item-${idx}`}
                    onClick={() => toggleIngredient(ing.name)}
                    className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                      isChecked
                        ? 'bg-slate-100 dark:bg-slate-800/40 text-slate-400 line-through border-slate-200 dark:border-slate-800'
                        : 'bg-slate-50 dark:bg-slate-800/60 text-slate-800 dark:text-slate-200 border-slate-200/80 dark:border-slate-700/80 hover:border-emerald-400'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {isChecked ? (
                        <CheckSquare className="h-4 w-4 text-emerald-500 shrink-0" />
                      ) : (
                        <Square className="h-4 w-4 text-slate-400 shrink-0" />
                      )}
                      <span className="font-medium">{ing.name}</span>
                    </div>

                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {scaledAmount} {ing.unit}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Ingredient Swaps Drawer */}
          {data.swaps && data.swaps.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3">
              <button
                id="btn-toggle-swaps"
                onClick={() => setShowSwaps(!showSwaps)}
                className="w-full flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider"
              >
                <span className="flex items-center gap-1.5">
                  <Repeat className="h-4 w-4 text-amber-500" />
                  Ingredient Substitutions ({data.swaps.length})
                </span>
                {showSwaps ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>

              {showSwaps && (
                <div className="space-y-3 pt-2">
                  {data.swaps.map((swap, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/60 rounded-xl text-xs space-y-1"
                    >
                      <div className="font-bold text-amber-900 dark:text-amber-200">
                        Replace {swap.original} with:
                      </div>
                      <div className="text-slate-700 dark:text-slate-300 font-medium">
                        • {swap.substitutes.join(', ')}
                      </div>
                      <div className="text-slate-500 text-[11px] italic">{swap.notes}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Cooking Steps */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <ChefHat className="h-4 w-4 text-emerald-500" />
              Step-by-Step Cooking Guide
            </h3>

            <span className="text-xs font-semibold text-slate-500">
              {Object.values(checkedSteps).filter(Boolean).length} / {data.steps.length} Steps Completed
            </span>
          </div>

          <div className="space-y-4">
            {data.steps.map((step) => {
              const isDone = checkedSteps[step.stepNumber];

              return (
                <div
                  key={step.stepNumber}
                  id={`cooking-step-${step.stepNumber}`}
                  onClick={() => toggleStep(step.stepNumber)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2 ${
                    isDone
                      ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800/80 opacity-70'
                      : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200/80 dark:border-slate-700/80 hover:border-emerald-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`h-6 w-6 rounded-full flex items-center justify-center font-bold text-xs ${
                          isDone
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        {step.stepNumber}
                      </div>
                      <h4 className={`font-bold text-sm ${isDone ? 'line-through text-slate-500' : 'text-slate-900 dark:text-white'}`}>
                        {step.title}
                      </h4>
                    </div>

                    {step.timerMinutes && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2.5 py-1 rounded-full border border-amber-200/80 dark:border-amber-800/80">
                        <Timer className="h-3.5 w-3.5" />
                        {step.timerMinutes} mins
                      </span>
                    )}
                  </div>

                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed pl-8">
                    {step.instruction}
                  </p>

                  {step.tip && (
                    <div className="pl-8 text-xs text-emerald-800 dark:text-emerald-300 font-medium italic">
                      💡 Chef's Tip: {step.tip}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
