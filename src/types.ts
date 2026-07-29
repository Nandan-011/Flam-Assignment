export type ToolMode = 'study' | 'recipe' | 'trip';

// --- Study Tool Types ---
export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  hint?: string;
  category?: string;
  isMastered?: boolean;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface StudyModule {
  title: string;
  summary: string;
  flashcards: Flashcard[];
  quiz: QuizQuestion[];
}

// --- Recipe Tool Types ---
export interface Ingredient {
  name: string;
  amount: number;
  unit: string;
  category: string;
  notes?: string;
}

export interface CookingStep {
  stepNumber: number;
  title: string;
  instruction: string;
  timerMinutes?: number;
  tip?: string;
}

export interface IngredientSwap {
  original: string;
  substitutes: string[];
  notes: string;
}

export interface RecipeModule {
  title: string;
  description: string;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  baseServings: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  ingredients: Ingredient[];
  steps: CookingStep[];
  swaps: IngredientSwap[];
  nutritionPerServing?: {
    calories?: number;
    protein?: string;
    carbs?: string;
    fat?: string;
  };
}

// --- Trip Tool Types ---
export interface ItineraryStop {
  id: string;
  timeOfDay: string;
  title: string;
  description: string;
  locationName: string;
  category: 'Sightseeing' | 'Food & Drink' | 'Activity' | 'Relaxation' | 'Travel';
  estimatedCost: string;
  durationMinutes?: number;
}

export interface DayItinerary {
  dayNumber: number;
  theme: string;
  stops: ItineraryStop[];
}

export interface TripModule {
  destination: string;
  title: string;
  summary: string;
  totalDays: number;
  estimatedBudgetTotal: string;
  days: DayItinerary[];
}

// --- Combined Union Data ---
export type GeneratedContent =
  | { type: 'study'; data: StudyModule }
  | { type: 'recipe'; data: RecipeModule }
  | { type: 'trip'; data: TripModule };

// --- Error & Stress Test Types ---
export type StressTestMode =
  | 'none'
  | 'malformed_json'
  | 'wrong_schema'
  | 'empty_response'
  | 'server_error'
  | 'slow_timeout';

export interface GenerationRequest {
  mode: ToolMode;
  prompt: string;
  refinementPrompt?: string;
  currentContent?: GeneratedContent;
  stressTestMode?: StressTestMode;
}

export interface SavedSession {
  id: string;
  timestamp: number;
  mode: ToolMode;
  prompt: string;
  content: GeneratedContent;
}
