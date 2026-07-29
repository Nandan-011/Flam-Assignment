import { GeneratedContent, ToolMode, StudyModule, RecipeModule, TripModule, ItineraryStop } from '../types';

/**
 * Robust JSON extraction & repair utility
 * Handles markdown formatting, partial responses, unescaped characters, and missing schema fields.
 */
export function repairAndParseJSON(rawText: string): Record<string, unknown> {
  if (!rawText || typeof rawText !== 'string') {
    throw new Error('AI returned an empty or invalid response string.');
  }

  let cleaned = rawText.trim();

  // 1. Remove markdown code block wrappers if present (e.g. ```json ... ```)
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');

  // 2. Locate boundaries of valid JSON object or array
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');

  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }

  // 3. Attempt direct JSON parsing first
  try {
    return JSON.parse(cleaned);
  } catch (initialError) {
    console.warn('Initial JSON parse failed. Applying auto-repair heuristics...', initialError);
  }

  // 4. Common Repair Strategies:
  // - Fix trailing commas in objects or arrays: `,}` or `,]`
  cleaned = cleaned.replace(/,\s*([}\]])/g, '$1');

  // - Fix unquoted key names (e.g., { title: "val" } -> { "title": "val" })
  cleaned = cleaned.replace(/([{,]\s*)([a-zA-Z0-9_]+)\s*:/g, '$1"$2":');

  // - Attempt JSON parse again after regex repairs
  try {
    return JSON.parse(cleaned);
  } catch (secondError) {
    console.error('Auto-repair could not parse JSON cleanly:', secondError);
    throw new Error('Malformed JSON received from AI model. Auto-repair failed.');
  }
}

/**
 * Validates and normalizes raw parsed JSON into strict StudyModule format with fallback defaults.
 */
export function normalizeStudyData(raw: Record<string, unknown>): StudyModule {
  const flashcardsRaw = Array.isArray(raw.flashcards) ? raw.flashcards : [];
  const flashcards = flashcardsRaw.map((fc: Record<string, unknown>, idx: number) => ({
    id: String(fc.id || `card-${idx + 1}`),
    question: String(fc.question || `Question ${idx + 1}`),
    answer: String(fc.answer || 'Answer not provided.'),
    hint: fc.hint ? String(fc.hint) : undefined,
    category: fc.category ? String(fc.category) : 'General',
    isMastered: false,
  }));

  const quizRaw = Array.isArray(raw.quiz) ? raw.quiz : [];
  const quiz = quizRaw.map((q: Record<string, unknown>, idx: number) => ({
    id: String(q.id || `quiz-${idx + 1}`),
    question: String(q.question || `Quiz Question ${idx + 1}`),
    options: Array.isArray(q.options) && q.options.length >= 2
      ? q.options.map(String)
      : ['Option A', 'Option B', 'Option C', 'Option D'],
    correctAnswerIndex: typeof q.correctAnswerIndex === 'number' && q.correctAnswerIndex >= 0
      ? q.correctAnswerIndex
      : 0,
    explanation: String(q.explanation || 'No explanation provided.'),
  }));

  return {
    title: String(raw.title || 'Study Set'),
    summary: String(raw.summary || 'Generated flashcard and quiz set.'),
    flashcards: flashcards.length > 0 ? flashcards : [
      { id: 'card-1', question: 'Sample Question', answer: 'Sample Answer', isMastered: false }
    ],
    quiz: quiz.length > 0 ? quiz : [
      { id: 'quiz-1', question: 'Sample Question?', options: ['Option A', 'Option B'], correctAnswerIndex: 0, explanation: 'Sample Explanation' }
    ],
  };
}

/**
 * Validates and normalizes raw parsed JSON into strict RecipeModule format.
 */
export function normalizeRecipeData(raw: Record<string, unknown>): RecipeModule {
  const ingredientsRaw = Array.isArray(raw.ingredients) ? raw.ingredients : [];
  const ingredients = ingredientsRaw.map((ing: Record<string, unknown>) => ({
    name: String(ing.name || 'Ingredient'),
    amount: typeof ing.amount === 'number' ? ing.amount : 1,
    unit: String(ing.unit || 'unit'),
    category: String(ing.category || 'Pantry'),
    notes: ing.notes ? String(ing.notes) : undefined,
  }));

  const stepsRaw = Array.isArray(raw.steps) ? raw.steps : [];
  const steps = stepsRaw.map((st: Record<string, unknown>, idx: number) => ({
    stepNumber: typeof st.stepNumber === 'number' ? st.stepNumber : idx + 1,
    title: String(st.title || `Step ${idx + 1}`),
    instruction: String(st.instruction || 'Follow recipe step.'),
    timerMinutes: typeof st.timerMinutes === 'number' ? st.timerMinutes : undefined,
    tip: st.tip ? String(st.tip) : undefined,
  }));

  const swapsRaw = Array.isArray(raw.swaps) ? raw.swaps : [];
  const swaps = swapsRaw.map((sw: Record<string, unknown>) => ({
    original: String(sw.original || 'Item'),
    substitutes: Array.isArray(sw.substitutes) ? sw.substitutes.map(String) : ['Substitute item'],
    notes: String(sw.notes || 'Note for substitution.'),
  }));

  return {
    title: String(raw.title || 'Delicious Recipe'),
    description: String(raw.description || 'Custom generated recipe.'),
    prepTimeMinutes: typeof raw.prepTimeMinutes === 'number' ? raw.prepTimeMinutes : 15,
    cookTimeMinutes: typeof raw.cookTimeMinutes === 'number' ? raw.cookTimeMinutes : 20,
    baseServings: typeof raw.baseServings === 'number' ? raw.baseServings : 2,
    difficulty: (raw.difficulty === 'Easy' || raw.difficulty === 'Medium' || raw.difficulty === 'Hard')
      ? raw.difficulty
      : 'Medium',
    ingredients: ingredients.length > 0 ? ingredients : [
      { name: 'Main Ingredient', amount: 2, unit: 'cups', category: 'Pantry' }
    ],
    steps: steps.length > 0 ? steps : [
      { stepNumber: 1, title: 'Prepare', instruction: 'Prepare ingredients and serve.' }
    ],
    swaps,
    nutritionPerServing: raw.nutritionPerServing && typeof raw.nutritionPerServing === 'object'
      ? {
          calories: (raw.nutritionPerServing as Record<string, unknown>).calories as number || undefined,
          protein: String((raw.nutritionPerServing as Record<string, unknown>).protein || '10g'),
          carbs: String((raw.nutritionPerServing as Record<string, unknown>).carbs || '30g'),
          fat: String((raw.nutritionPerServing as Record<string, unknown>).fat || '5g'),
        }
      : undefined,
  };
}

/**
 * Validates and normalizes raw parsed JSON into strict TripModule format.
 */
export function normalizeTripData(raw: Record<string, unknown>): TripModule {
  const daysRaw = Array.isArray(raw.days) ? raw.days : [];
  const days = daysRaw.map((d: Record<string, unknown>, dayIdx: number) => {
    const stopsRaw = Array.isArray(d.stops) ? d.stops : [];
    const validCategories: ItineraryStop['category'][] = ['Sightseeing', 'Food & Drink', 'Activity', 'Relaxation', 'Travel'];

    const stops: ItineraryStop[] = stopsRaw.map((s: Record<string, unknown>, stopIdx: number) => {
      const cat = String(s.category);
      const category: ItineraryStop['category'] = validCategories.includes(cat as any)
        ? (cat as ItineraryStop['category'])
        : 'Sightseeing';

      return {
        id: String(s.id || `stop-${dayIdx + 1}-${stopIdx + 1}`),
        timeOfDay: String(s.timeOfDay || 'Morning'),
        title: String(s.title || `Stop ${stopIdx + 1}`),
        description: String(s.description || 'Activity detail.'),
        locationName: String(s.locationName || 'Destination spot'),
        category,
        estimatedCost: String(s.estimatedCost || '$10 - $20'),
        durationMinutes: typeof s.durationMinutes === 'number' ? s.durationMinutes : 60,
      };
    });

    return {
      dayNumber: typeof d.dayNumber === 'number' ? d.dayNumber : dayIdx + 1,
      theme: String(d.theme || `Day ${dayIdx + 1} Highlights`),
      stops: stops.length > 0 ? stops : ([
        { id: `stop-${dayIdx + 1}-1`, timeOfDay: 'Morning', title: 'Explore City Center', description: 'Take a guided walk.', locationName: 'Main Square', category: 'Sightseeing', estimatedCost: 'Free', durationMinutes: 90 }
      ] as ItineraryStop[]),
    };
  });

  return {
    destination: String(raw.destination || 'Destination City'),
    title: String(raw.title || 'Custom Trip Itinerary'),
    summary: String(raw.summary || 'A curated day-by-day itinerary.'),
    totalDays: typeof raw.totalDays === 'number' ? raw.totalDays : days.length || 3,
    estimatedBudgetTotal: String(raw.estimatedBudgetTotal || '$200 - $500'),
    days: days.length > 0 ? days : [
      {
        dayNumber: 1,
        theme: 'Arrival & Welcome Walk',
        stops: [{ id: 'stop-1-1', timeOfDay: 'Afternoon', title: 'Check in & Relax', description: 'Settle in.', locationName: 'Hotel', category: 'Relaxation' as const, estimatedCost: 'Free', durationMinutes: 60 }]
      }
    ],
  };
}

/**
 * Takes raw parsed JSON object and maps it to normalized GeneratedContent according to mode.
 */
export function normalizeGeneratedContent(raw: Record<string, unknown>, mode: ToolMode): GeneratedContent {
  switch (mode) {
    case 'study':
      return { type: 'study', data: normalizeStudyData(raw) };
    case 'recipe':
      return { type: 'recipe', data: normalizeRecipeData(raw) };
    case 'trip':
      return { type: 'trip', data: normalizeTripData(raw) };
  }
}
