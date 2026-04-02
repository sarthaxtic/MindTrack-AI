import mongoose, { Schema, models } from "mongoose";

const AnalysisSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    text: { type: String, required: true },
    language: { type: String, default: "en" },
    prediction: { type: String, required: true },
    confidence: { type: Number, required: true },
    explanation: { type: [String], default: [] },
    mlData: {
      label: String,
      confidence: Number,
      labels: [String],
      probabilities: {
        type: Map,
        of: Number,
      },
      allPredictions: [{
        label: String,
        confidence: Number,
      }],
      rawProbs: [Number],
      shapData: {
        tokens: [String],
        scores: [Number],
      },
    },
    // Gemini fallback fields
    geminiInsight: {
      emotionalInsight: String,
      suggestedSupport: [String],
      riskLevel: { type: String, enum: ["Low", "Medium", "High"] },
    },
    fallbackUsed: { type: Boolean, default: false },
    riskLevel: { type: String, enum: ["Low", "Medium", "High"], default: "Low" },
    crisisEscalation: { type: Boolean, default: false },
    // Multilingual fields
    detectedLanguage: String,
    wasTranslated: { type: Boolean, default: false },
    originalText: String,
  },
  { timestamps: true }
);

export const Analysis = models.Analysis || mongoose.model("Analysis", AnalysisSchema);