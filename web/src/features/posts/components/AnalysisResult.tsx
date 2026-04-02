"use client";

import { motion } from "framer-motion";
import {
  Brain,
  AlertTriangle,
  TrendingUp,
  Sparkles,
  BarChart3,
  Info,
  Shield,
  Bot,
  Phone,
  Globe,
} from "lucide-react";
import { AnalysisResponse } from "../types/post.types";

interface AnalysisResultProps {
  data: AnalysisResponse;
}

const getConfidenceColor = (confidence: number) => {
  if (confidence >= 0.7) return "text-green-500";
  if (confidence >= 0.4) return "text-yellow-500";
  if (confidence >= 0.2) return "text-orange-500";
  return "text-red-500";
};

const getConfidenceBgColor = (confidence: number) => {
  if (confidence >= 0.7) return "bg-green-500";
  if (confidence >= 0.4) return "bg-yellow-500";
  if (confidence >= 0.2) return "bg-orange-500";
  return "bg-red-500";
};

const getPredictionIcon = (prediction: string) => {
  switch (prediction.toLowerCase()) {
    case "depression":
      return <AlertTriangle className="w-5 h-5 text-purple-500" />;
    case "anxiety":
      return <Brain className="w-5 h-5 text-yellow-500" />;
    case "stress":
      return <TrendingUp className="w-5 h-5 text-orange-500" />;
    case "bipolar":
      return <AlertTriangle className="w-5 h-5 text-pink-500" />;
    default:
      return <Sparkles className="w-5 h-5 text-green-500" />;
  }
};

const getPredictionColor = (prediction: string) => {
  switch (prediction.toLowerCase()) {
    case "depression":
      return "border-purple-500/20 bg-purple-500/5";
    case "anxiety":
      return "border-yellow-500/20 bg-yellow-500/5";
    case "stress":
      return "border-orange-500/20 bg-orange-500/5";
    case "bipolar":
      return "border-pink-500/20 bg-pink-500/5";
    default:
      return "border-green-500/20 bg-green-500/5";
  }
};

const getRiskLevelStyle = (level: string) => {
  switch (level) {
    case "High":
      return "bg-red-500/15 text-red-400 border-red-500/30";
    case "Medium":
      return "bg-yellow-500/15 text-yellow-400 border-yellow-500/30";
    default:
      return "bg-green-500/15 text-green-400 border-green-500/30";
  }
};

export default function AnalysisResult({ data }: AnalysisResultProps) {
  const confidencePercent = (data.confidence * 100).toFixed(1);
  const confidenceColor = getConfidenceColor(data.confidence);
  const predictionColor = getPredictionColor(data.prediction);

  // Check if there are any significant detections (above 30%)
  const hasSignificantDetections =
    data.mlData?.allPredictions?.some((pred) => pred.confidence > 0.3) ?? false;

  // Filter explanation to exclude the crisis escalation message for separate rendering
  const explanationLines = (data.explanation || []).filter(
    (line) => !line.startsWith("⚠️")
  );
  const geminiExplanation = explanationLines.find((line) =>
    line.startsWith("AI Insight:")
  );
  const mlExplanations = explanationLines.filter(
    (line) => !line.startsWith("AI Insight:")
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-[var(--radius-lg)] border ${predictionColor} bg-[var(--surface)] p-6 space-y-4`}
    >
      {/* ─── Crisis Escalation Banner ──────────────────────────────────── */}
      {data.crisisEscalation && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 space-y-3"
        >
          <div className="flex items-center gap-2">
            <Shield size={18} className="text-red-400" />
            <span className="text-sm font-semibold text-red-400">
              ⚠️ High-Risk Signal Detected
            </span>
          </div>
          <p className="text-xs text-red-300/80 leading-relaxed">
            Based on the analysis, this text may indicate severe distress.
            Please consider reaching out for support.
          </p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { name: "Crisis Lifeline", phone: "988" },
              { name: "Crisis Text", phone: "Text HOME to 741741" },
              { name: "iCall (India)", phone: "9152987821" },
              { name: "Vandrevala Foundation", phone: "1860-2662-345" },
            ].map((r) => (
              <div
                key={r.phone}
                className="flex items-center gap-1.5 p-2 rounded-md bg-red-500/10"
              >
                <Phone size={10} className="text-red-400 shrink-0" />
                <div>
                  <div className="text-[10px] font-medium text-red-300">
                    {r.name}
                  </div>
                  <div className="text-[10px] text-red-400">{r.phone}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ─── Header ────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {getPredictionIcon(data.prediction)}
          <h3 className="text-lg font-semibold text-[var(--text)]">
            Analysis Result
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {/* Risk Level Badge */}
          {data.riskLevel && (
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getRiskLevelStyle(data.riskLevel)}`}
            >
              {data.riskLevel} Risk
            </span>
          )}
          <div className={`text-sm font-medium ${confidenceColor}`}>
            {confidencePercent}% confidence
          </div>
        </div>
      </div>

      <div className="h-px bg-[var(--border)]" />

      {/* ─── Language & Translation Info ────────────────────────────────── */}
      {(data.detectedLanguage || data.wasTranslated) && (
        <div className="flex items-center gap-2 flex-wrap">
          {data.detectedLanguage && (
            <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-[var(--accent-dim)] text-[var(--accent)] border border-[var(--accent)]/20">
              <Globe size={10} />
              {data.detectedLanguage === "hinglish"
                ? "Hinglish"
                : data.detectedLanguage === "hi"
                  ? "Hindi"
                  : data.detectedLanguage === "en"
                    ? "English"
                    : data.detectedLanguage.toUpperCase()}
            </span>
          )}
          {data.wasTranslated && (
            <span className="text-[10px] text-[var(--text-muted)]">
              • Auto-translated for analysis
            </span>
          )}
        </div>
      )}

      {/* ─── Fallback Indicator ─────────────────────────────────────────── */}
      {data.fallbackUsed && (
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-[var(--accent-dim)] border border-[var(--accent)]/15">
          <Bot size={12} className="text-[var(--accent)]" />
          <span className="text-[10px] font-medium text-[var(--accent)]">
            Enhanced by AI — Gemini provided additional emotional analysis
          </span>
        </div>
      )}

      {/* ─── Main Prediction ───────────────────────────────────────────── */}
      <div className="space-y-2">
        <div className="text-sm text-[var(--text-muted)]">
          Primary Detection
        </div>
        <div className="text-2xl font-bold text-[var(--text)]">
          {data.prediction}
        </div>
        <div className="w-full bg-[var(--surface-raised)] rounded-full h-2 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${data.confidence * 100}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className={`h-full rounded-full ${getConfidenceBgColor(data.confidence)}`}
          />
        </div>
      </div>

      {/* ─── ML Explanation ─────────────────────────────────────────────── */}
      {mlExplanations.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm text-[var(--text-muted)]">Explanation</div>
          <div className="space-y-1">
            {mlExplanations.map((text, idx) => (
              <p key={idx} className="text-sm text-[var(--text-secondary)]">
                • {text}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* ─── Gemini AI Insight ──────────────────────────────────────────── */}
      {data.geminiInsight && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="space-y-3 p-4 rounded-lg bg-gradient-to-br from-[var(--accent-dim)] to-transparent border border-[var(--accent)]/10"
        >
          <div className="flex items-center gap-2">
            <div className="size-6 rounded-full bg-[var(--accent)]/10 flex items-center justify-center">
              <Bot size={12} className="text-[var(--accent)]" />
            </div>
            <span className="text-sm font-semibold text-[var(--text)]">
              AI Emotional Insight
            </span>
          </div>

          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            {data.geminiInsight.emotionalInsight}
          </p>

          {data.geminiInsight.suggestedSupport &&
            data.geminiInsight.suggestedSupport.length > 0 && (
              <div className="space-y-1.5">
                <div className="text-xs font-medium text-[var(--text-muted)]">
                  Suggested Support
                </div>
                {data.geminiInsight.suggestedSupport.map((tip, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2 text-xs text-[var(--text-secondary)]"
                  >
                    <span className="text-[var(--accent)] mt-0.5">•</span>
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            )}

          {geminiExplanation && (
            <p className="text-xs text-[var(--text-muted)] italic">
              {geminiExplanation.replace("AI Insight: ", "")}
            </p>
          )}
        </motion.div>
      )}

      {/* ─── All Detections ─────────────────────────────────────────────── */}
      {data.mlData &&
        data.mlData.allPredictions &&
        data.mlData.allPredictions.length > 0 && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2">
              <BarChart3 size={14} className="text-[var(--text-muted)]" />
              <div className="text-sm text-[var(--text-muted)]">
                All Detections
              </div>
            </div>

            <div className="space-y-2">
              {data.mlData.allPredictions.map((pred, idx) => {
                const predConfidence = pred.confidence;
                const isSignificant = predConfidence > 0.3;
                const barColor = isSignificant
                  ? predConfidence > 0.7
                    ? "bg-green-500"
                    : predConfidence > 0.4
                      ? "bg-yellow-500"
                      : "bg-orange-500"
                  : "bg-gray-500/30";

                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span
                        className={`capitalize ${isSignificant ? "text-[var(--text)] font-medium" : "text-[var(--text-muted)]"}`}
                      >
                        {pred.label}
                        {isSignificant && (
                          <span className="ml-2 text-xs text-[var(--accent)]">
                            ●
                          </span>
                        )}
                      </span>
                      <span
                        className={`text-[var(--text-muted)] tabular-nums ${isSignificant ? "font-medium" : ""}`}
                      >
                        {(predConfidence * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-[var(--surface-raised)] rounded-full h-1.5 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${predConfidence * 100}%` }}
                        transition={{
                          duration: 0.5,
                          ease: "easeOut",
                          delay: idx * 0.05,
                        }}
                        className={`h-full rounded-full ${barColor}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      {/* ─── No Significant Issues ──────────────────────────────────────── */}
      {!hasSignificantDetections &&
        data.prediction === "Neutral" &&
        !data.fallbackUsed && (
          <div className="mt-3 p-3 rounded-md bg-green-500/10 border border-green-500/20">
            <div className="flex items-center gap-2">
              <Info size={14} className="text-green-500" />
              <p className="text-xs text-green-600 dark:text-green-400">
                No significant mental health concerns detected in this text.
              </p>
            </div>
          </div>
        )}

      {/* ─── SHAP-like Explainability ───────────────────────────────────── */}
      {data.mlData?.shapData && (
        <div className="space-y-3 pt-4 border-t border-[var(--border)]">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-purple-500" />
            <div className="text-sm font-semibold text-[var(--text)]">
              SHAP Signal Attribution
            </div>
          </div>
          <div className="text-xs text-[var(--text-muted)] mb-2">
            AI has highlighted exactly which words contributed most heavily to the <strong>{data.prediction}</strong> prediction. Hover over words to see exact weights.
          </div>
          <div className="p-4 rounded-lg bg-[var(--surface-raised)] border border-[var(--border)] leading-loose text-sm font-medium">
            {data.mlData.shapData.tokens.map((token, idx) => {
              const score = data.mlData!.shapData!.scores[idx];
              
              let bgColor = "transparent";
              let textColor = "var(--text-secondary)";
              
              if (score > 0.02) {
                // High positive impact towards the label (e.g. depression signal) -> Red scale
                const opacity = Math.min(score * 3, 0.85); // Cap at 85% opacity
                bgColor = `rgba(239, 68, 68, ${opacity})`; // Tailwind red-500
                textColor = opacity > 0.4 ? "#fff" : "var(--text)";
              } else if (score < -0.02) {
                // Negative impact (reduces chance of label) -> Blue scale/Cool
                const opacity = Math.min(Math.abs(score) * 3, 0.4);
                bgColor = `rgba(59, 130, 246, ${opacity})`; // Tailwind blue-500
                textColor = "var(--text)";
              }

              // Remove ugly underscores from XLM-R tokenization artifacts if they leak through
              const cleanToken = token.replace(/_/g, "");
              if (!cleanToken) return null;

              return (
                <span
                  key={idx}
                  className="px-1 rounded-sm transition-colors duration-200 cursor-help inline-block mx-[1px]"
                  title={`Impact Metric: ${(score * 100).toFixed(2)}%`}
                  style={{ backgroundColor: bgColor, color: textColor }}
                >
                  {cleanToken}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── Detailed Stats ─────────────────────────────────────────────── */}
      {data.mlData && data.mlData.rawProbs && (
        <details className="text-xs pt-2">
          <summary className="cursor-pointer text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
            View detailed statistics
          </summary>
          <div className="mt-2 p-3 bg-[var(--surface-raised)] rounded-lg space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <div className="text-[var(--text-muted)]">Model Label</div>
                <div className="font-mono text-[var(--text)]">
                  {data.mlData.label}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-[var(--text-muted)]">Raw Confidence</div>
                <div className="font-mono text-[var(--text)]">
                  {(data.mlData.confidence * 100).toFixed(2)}%
                </div>
              </div>
            </div>
            {data.mlData.probabilities && (
              <div className="space-y-1">
                <div className="text-[var(--text-muted)]">
                  Raw Probabilities
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                  {Object.entries(data.mlData.probabilities).map(
                    ([key, value]) => (
                      <div
                        key={key}
                        className="flex justify-between font-mono text-xs"
                      >
                        <span className="capitalize">{key}:</span>
                        <span>{(value * 100).toFixed(2)}%</span>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
            {data.fallbackUsed && (
              <div className="space-y-1 pt-1 border-t border-[var(--border)]">
                <div className="text-[var(--text-muted)]">
                  Gemini Fallback
                </div>
                <div className="font-mono text-[var(--accent)]">Active</div>
              </div>
            )}
          </div>
        </details>
      )}
    </motion.div>
  );
}