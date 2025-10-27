import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Gemini AI Integration
 * Provides AI-powered question generation using Google's Gemini API
 */

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

let genAI: GoogleGenerativeAI | null = null;

function getGeminiClient() {
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not set. Please add it to your .env file.");
  }
  
  if (!genAI) {
    genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  }
  
  return genAI;
}

export interface GeminiGenerateOptions {
  prompt: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

/**
 * Generate text using Gemini AI
 */
export async function generateWithGemini(options: GeminiGenerateOptions): Promise<string> {
  try {
    const client = getGeminiClient();
    const model = client.getGenerativeModel({ 
      model: options.model || "gemini-pro",
    });

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: options.prompt }] }],
      generationConfig: {
        temperature: options.temperature || 0.7,
        maxOutputTokens: options.maxTokens || 2048,
      },
    });

    const response = result.response;
    return response.text();
  } catch (error) {
    console.error("[Gemini] Generation error:", error);
    throw new Error(`Gemini API error: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

/**
 * Generate assessment questions using Gemini
 */
export async function generateQuestionsWithGemini(params: {
  jobTitle: string;
  jobDescription: string;
  skills: string[];
  complexity: "low" | "medium" | "high";
  count: number;
}): Promise<any[]> {
  const { jobTitle, jobDescription, skills, complexity, count } = params;

  const difficultyMap = {
    low: "beginner to intermediate",
    medium: "intermediate to advanced",
    high: "advanced to expert",
  };

  const prompt = `You are an expert HR assessment designer. Generate ${count} multiple-choice questions for a ${jobTitle} position.

Job Description: ${jobDescription}

Required Skills: ${skills.join(", ")}

Difficulty Level: ${difficultyMap[complexity]}

Requirements:
1. Generate exactly ${count} questions
2. Each question should have 4 options (A, B, C, D)
3. Only ONE option should be correct
4. Questions should test practical knowledge and problem-solving
5. Mix of conceptual and scenario-based questions
6. Difficulty should be ${difficultyMap[complexity]} level

Return ONLY a valid JSON array with this exact structure:
[
  {
    "question": "Question text here",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "explanation": "Brief explanation of why this answer is correct"
  }
]

Important: 
- correctAnswer is the index (0-3) of the correct option
- Do not include any markdown, code blocks, or extra text
- Return ONLY the JSON array`;

  try {
    const response = await generateWithGemini({ 
      prompt,
      model: "gemini-2.5-pro",
      maxTokens: 16384
    });
    
    // Clean up the response to extract JSON
    let jsonText = response.trim();
    
    // Remove markdown code blocks if present
    jsonText = jsonText.replace(/```json\n?/g, "").replace(/```\n?/g, "");
    
    // Parse the JSON
    const questions = JSON.parse(jsonText);
    
    if (!Array.isArray(questions)) {
      throw new Error("Response is not an array");
    }
    
    // Validate question structure
    questions.forEach((q, index) => {
      if (!q.question || !Array.isArray(q.options) || q.options.length !== 4) {
        throw new Error(`Invalid question structure at index ${index}`);
      }
      // Handle both index (number) and letter (A/B/C/D) formats
      if (typeof q.correctAnswer === "string") {
        // Convert letter to index
        q.correctAnswer = q.correctAnswer.charCodeAt(0) - 65;
      }
      if (typeof q.correctAnswer !== "number") {
        throw new Error(`Invalid correctAnswer format at index ${index}`);
      }
    });
    
    return questions;
  } catch (error) {
    console.error("[Gemini] Question generation error:", error);
    throw new Error(`Failed to generate questions: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

/**
 * Check if Gemini API is configured
 */
export function isGeminiConfigured(): boolean {
  return !!GEMINI_API_KEY;
}

