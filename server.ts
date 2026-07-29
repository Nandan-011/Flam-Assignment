import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import { GenerationRequest } from './src/types';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Initialize Google GenAI client lazily or with check
function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is missing.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Schemas for structured response
const studySchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: 'Title of the study module' },
    summary: { type: Type.STRING, description: 'Overview of the topic' },
    flashcards: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          question: { type: Type.STRING },
          answer: { type: Type.STRING },
          hint: { type: Type.STRING },
          category: { type: Type.STRING },
        },
        required: ['id', 'question', 'answer'],
      },
    },
    quiz: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          question: { type: Type.STRING },
          options: { type: Type.ARRAY, items: { type: Type.STRING } },
          correctAnswerIndex: { type: Type.INTEGER },
          explanation: { type: Type.STRING },
        },
        required: ['id', 'question', 'options', 'correctAnswerIndex', 'explanation'],
      },
    },
  },
  required: ['title', 'summary', 'flashcards', 'quiz'],
};

const recipeSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    description: { type: Type.STRING },
    prepTimeMinutes: { type: Type.INTEGER },
    cookTimeMinutes: { type: Type.INTEGER },
    baseServings: { type: Type.INTEGER },
    difficulty: { type: Type.STRING },
    ingredients: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          amount: { type: Type.NUMBER },
          unit: { type: Type.STRING },
          category: { type: Type.STRING },
          notes: { type: Type.STRING },
        },
        required: ['name', 'amount', 'unit', 'category'],
      },
    },
    steps: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          stepNumber: { type: Type.INTEGER },
          title: { type: Type.STRING },
          instruction: { type: Type.STRING },
          timerMinutes: { type: Type.INTEGER },
          tip: { type: Type.STRING },
        },
        required: ['stepNumber', 'title', 'instruction'],
      },
    },
    swaps: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          original: { type: Type.STRING },
          substitutes: { type: Type.ARRAY, items: { type: Type.STRING } },
          notes: { type: Type.STRING },
        },
        required: ['original', 'substitutes', 'notes'],
      },
    },
    nutritionPerServing: {
      type: Type.OBJECT,
      properties: {
        calories: { type: Type.INTEGER },
        protein: { type: Type.STRING },
        carbs: { type: Type.STRING },
        fat: { type: Type.STRING },
      },
    },
  },
  required: ['title', 'description', 'prepTimeMinutes', 'cookTimeMinutes', 'baseServings', 'difficulty', 'ingredients', 'steps', 'swaps'],
};

const tripSchema = {
  type: Type.OBJECT,
  properties: {
    destination: { type: Type.STRING },
    title: { type: Type.STRING },
    summary: { type: Type.STRING },
    totalDays: { type: Type.INTEGER },
    estimatedBudgetTotal: { type: Type.STRING },
    days: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          dayNumber: { type: Type.INTEGER },
          theme: { type: Type.STRING },
          stops: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                timeOfDay: { type: Type.STRING },
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                locationName: { type: Type.STRING },
                category: { type: Type.STRING },
                estimatedCost: { type: Type.STRING },
                durationMinutes: { type: Type.INTEGER },
              },
              required: ['id', 'timeOfDay', 'title', 'description', 'locationName', 'category', 'estimatedCost'],
            },
          },
        },
        required: ['dayNumber', 'theme', 'stops'],
      },
    },
  },
  required: ['destination', 'title', 'summary', 'totalDays', 'estimatedBudgetTotal', 'days'],
};

// API Route for generating structured AI content
app.post('/api/generate', async (req, res) => {
  try {
    const { mode, prompt, refinementPrompt, currentContent, stressTestMode } = req.body as GenerationRequest;

    if (!prompt && !refinementPrompt) {
      return res.status(400).json({ error: 'Prompt is required.' });
    }

    // --- STRESS TEST / FAILURE SIMULATION TOGGLES (For Interview Demo) ---
    if (stressTestMode === 'server_error') {
      return res.status(500).json({ error: 'Simulated 500 Internal Server Error for stress test.' });
    }
    if (stressTestMode === 'malformed_json') {
      return res.json({ rawText: '{"title": "Unfinished JSON", "summary": "This is broken', isSimulated: true });
    }
    if (stressTestMode === 'wrong_schema') {
      return res.json({ rawText: '{"unexpectedField": true, "message": "Wrong schema payload"}', isSimulated: true });
    }
    if (stressTestMode === 'empty_response') {
      return res.json({ rawText: '', isSimulated: true });
    }
    if (stressTestMode === 'slow_timeout') {
      await new Promise((resolve) => setTimeout(resolve, 6000));
    }

    const ai = getGenAI();

    let targetSchema: any = studySchema;
    let systemInstruction = '';

    if (mode === 'study') {
      targetSchema = studySchema;
      systemInstruction = `You are an expert AI Educator. Generate a detailed, engaging study set containing flashcards and quiz questions based on the user topic or notes. Ensure questions are clear, option choices are distinct, and explanations are insightful.`;
    } else if (mode === 'recipe') {
      targetSchema = recipeSchema;
      systemInstruction = `You are a professional Master Chef. Create a complete, delicious recipe based on the provided ingredients or dietary prompt. Include scalable quantities, step-by-step instructions with timers, smart ingredient swaps, and estimated nutrition.`;
    } else if (mode === 'trip') {
      targetSchema = tripSchema;
      systemInstruction = `You are a world-class Travel Planner. Generate a cohesive, realistic day-by-day travel itinerary for the destination or description. Provide logical times of day, realistic costs, durations, and diverse categories (Sightseeing, Food, Activity, Relaxation).`;
    }

    let fullPrompt = `User Request: ${prompt}`;
    if (refinementPrompt && currentContent) {
      fullPrompt = `You are refining an existing ${mode} module.\n\n` +
        `Current State JSON:\n${JSON.stringify(currentContent.data, null, 2)}\n\n` +
        `Refinement Instructions: ${refinementPrompt}\n\n` +
        `Please output the updated JSON module maintaining the required schema structure.`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: fullPrompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: targetSchema,
        temperature: 0.7,
      },
    });

    const rawText = response.text || '';
    return res.json({ rawText });
  } catch (error: any) {
    console.error('API /api/generate error:', error);
    return res.status(500).json({ error: error?.message || 'Failed to generate AI output.' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

start();
