export type MentalState = "Depression" | "Anxiety" | "Neutral" | "Bipolar" | "Stress" | "Error";

export type RiskLevel = "Low" | "Medium" | "High";

export interface Prediction {
  label: string;
  confidence: number;
}

export interface MLData {
  label: string;
  confidence: number;
  labels?: string[];
  probabilities?: Record<string, number>;
  allPredictions?: Prediction[];
  rawProbs?: number[];
  shapData?: {
    tokens: string[];
    scores: number[];
  };
}

export interface GeminiInsight {
  emotionalInsight: string;
  suggestedSupport: string[];
  riskLevel: RiskLevel;
}

export interface AnalysisResponse {
  _id?: string;
  text?: string;
  prediction: MentalState;
  confidence: number;
  explanation: string[];
  mlData?: MLData;
  error?: string;
  createdAt?: string;
  updatedAt?: string;
  userId?: string;
  language?: string;
  // Gemini fallback fields
  geminiInsight?: GeminiInsight;
  fallbackUsed?: boolean;
  riskLevel?: RiskLevel;
  crisisEscalation?: boolean;
  // Multilingual fields
  detectedLanguage?: string;
  wasTranslated?: boolean;
  originalText?: string;
}

export interface AnalysisDocument extends AnalysisResponse {
  _id: string;
  userId: string;
  text: string;
  language: string;
  createdAt: string;
  updatedAt: string;
}