/**
 * Shared Gemini Service
 * Used by both the analysis route (journal fallback) and chat route.
 */

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface GeminiInsight {
  emotionalInsight: string;
  suggestedSupport: string[];
  riskLevel: "Low" | "Medium" | "High";
  rawResponse: string;
}

interface MLContext {
  labels: string[];
  probabilities: Record<string, number>;
  maxConfidence: number;
}

// ─── Journal Analysis with Gemini ──────────────────────────────────────────────

const JOURNAL_ANALYSIS_PROMPT = `You are a mental health support assistant.

Analyze the following user input carefully. The primary ML model was unable to confidently classify it.

Tasks:
1. Identify possible emotional states or distress signals
2. Detect subtle or hidden distress (even if language appears neutral)
3. Provide a gentle, empathetic response
4. Suggest simple coping strategies if needed

Rules:
- Do NOT provide medical diagnosis
- Do NOT label with clinical disorders definitively
- Use soft language like "it seems", "you might be feeling"
- If distress is severe, encourage seeking help

User Input:
{user_input}

ML Model Context:
- Predicted Labels: {ml_labels}
- Confidence Scores: {ml_scores}

Output Format (respond EXACTLY in this JSON format, no markdown):
{
  "emotionalInsight": "2-3 lines describing the emotional state",
  "suggestedSupport": ["bullet point 1", "bullet point 2", "bullet point 3"],
  "riskLevel": "Low | Medium | High"
}`;

export async function analyzeJournalWithGemini(
  userInput: string,
  mlContext?: MLContext
): Promise<GeminiInsight> {
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Gemini API key not configured");
  }

  const prompt = JOURNAL_ANALYSIS_PROMPT
    .replace("{user_input}", userInput)
    .replace("{ml_labels}", mlContext?.labels?.join(", ") || "Normal")
    .replace(
      "{ml_scores}",
      mlContext?.probabilities
        ? Object.entries(mlContext.probabilities)
            .map(([k, v]) => `${k}: ${(v * 100).toFixed(1)}%`)
            .join(", ")
        : "N/A"
    );

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        safetySettings: [
          { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
          { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
        ],
        generationConfig: {
          temperature: 0.4,
          topP: 0.85,
          maxOutputTokens: 400,
        },
      }),
    }
  );

  if (!res.ok) {
    const errText = await res.text();
    console.error("Gemini journal analysis error:", errText);
    throw new Error(`Gemini API failed: ${res.status}`);
  }

  const data = await res.json();
  const rawText =
    data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

  // Parse the JSON response from Gemini
  try {
    // Extract JSON from response (Gemini sometimes wraps in markdown code blocks)
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        emotionalInsight: parsed.emotionalInsight || "Unable to determine emotional state.",
        suggestedSupport: Array.isArray(parsed.suggestedSupport)
          ? parsed.suggestedSupport
          : ["Consider talking to someone you trust about how you're feeling."],
        riskLevel: (["Low", "Medium", "High"].includes(parsed.riskLevel)
          ? parsed.riskLevel
          : "Low") as "Low" | "Medium" | "High",
        rawResponse: rawText,
      };
    }
  } catch (parseErr) {
    console.error("Failed to parse Gemini JSON response:", parseErr);
  }

  // Fallback if JSON parsing fails
  return {
    emotionalInsight: rawText.slice(0, 300) || "The input suggests some emotional complexity that warrants attention.",
    suggestedSupport: [
      "Consider journaling about your feelings in more detail",
      "Practice a grounding exercise like deep breathing",
      "Reach out to a trusted friend or counselor if needed",
    ],
    riskLevel: "Low",
    rawResponse: rawText,
  };
}

// ─── Chat with Gemini ──────────────────────────────────────────────────────────

export async function chatWithGemini(
  message: string,
  history: { role: string; content: string }[],
  lang: string
): Promise<string> {
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Gemini API key not configured");
  }

  const langInstruction =
    lang === "hi"
      ? "The user is communicating in Hindi or Hinglish. You MUST respond in Hindi (Devanagari script) or Hinglish (Hindi written in English). Match the user's language style. If they write in Devanagari, reply in Devanagari. If they write Hinglish, reply in Hinglish."
      : "The user is communicating in English. Respond in English.";

  const systemPrompt = `You are a compassionate mental health support companion named "MindTrack Buddy". You must:

STRICT RULES:
- NEVER diagnose medical or psychiatric conditions
- NEVER prescribe or suggest specific medications
- NEVER provide clinical treatment plans
- NEVER dismiss or minimize the user's feelings
- Always suggest professional help for serious concerns
- If anyone expresses suicidal ideation, IMMEDIATELY provide crisis hotline numbers (988 for US, 9152987821 for India iCall, 1860-2662-345 for Vandrevala Foundation)
- Be empathetic, warm, and validating
- Focus on coping strategies, self-care tips, and emotional support
- Use simple, friendly language
- Keep responses concise (2-3 short paragraphs max)
- Use relevant emojis sparingly for warmth

LANGUAGE INSTRUCTION:
${langInstruction}

You are NOT a therapist. You are a supportive friend who listens and guides.`;

  const contents = [
    {
      role: "user",
      parts: [{ text: systemPrompt }],
    },
    {
      role: "model",
      parts: [
        {
          text:
            lang === "hi"
              ? "मैं समझ गया/गई। मैं एक सहानुभूतिपूर्ण मानसिक स्वास्थ्य सहयोगी के रूप में सभी नियमों का पालन करूंगा/करूंगी।"
              : "I understand. I will act as a compassionate mental health support companion following all the strict rules.",
        },
      ],
    },
    ...history.slice(-5).map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    })),
    {
      role: "user",
      parts: [{ text: message }],
    },
  ];

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents,
        safetySettings: [
          { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
          { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
        ],
        generationConfig: {
          temperature: 0.7,
          topP: 0.9,
          maxOutputTokens: 500,
        },
      }),
    }
  );

  if (!res.ok) {
    const errText = await res.text();
    console.error("Gemini chat API error:", errText);
    throw new Error(`Gemini API failed: ${res.status}`);
  }

  const data = await res.json();
  const text =
    data?.candidates?.[0]?.content?.parts?.[0]?.text ||
    (lang === "hi"
      ? "मुझे अभी जवाब देने में कठिनाई हो रही है। कृपया जानिए कि मैं आपके लिए यहाँ हूँ। 💙"
      : "I'm having trouble responding right now. Please know that I'm here for you. 💙");

  return text;
}

// ─── Complexity Detection (for chatbot) ────────────────────────────────────────

const COMPLEX_PATTERNS = [
  // Emotional ambiguity
  /i (don'?t|dont) know (how|what) i (feel|am feeling)/i,
  /confused about/i,
  /mixed (feelings|emotions)/i,
  /can'?t (explain|describe|put into words)/i,
  /not sure (what|how|if)/i,

  // Multi-topic emotional cues
  /sometimes .+( but| and) (sometimes|other times)/i,
  /part of me .+ (but|while) (another|other) part/i,

  // Deep existential / complex
  /meaning of life/i,
  /what'?s the point/i,
  /feel like (a burden|nothing matters)/i,
  /everything feels (wrong|off|empty|meaningless)/i,

  // Hindi/Hinglish complexity
  /samajh nahi aa raha/i,
  /kuch ajeeb sa lag raha/i,
  /pata nahi kya ho raha/i,
  /bahut confused/i,
  /kuch theek nahi/i,
];

export function isComplexInput(message: string): boolean {
  const lower = message.toLowerCase();

  // Check if any complex pattern matches
  if (COMPLEX_PATTERNS.some((pattern) => pattern.test(lower))) {
    return true;
  }

  // Long messages with emotional content are likely complex
  const words = lower.split(/\s+/);
  if (words.length > 30) {
    return true;
  }

  // Multiple question marks suggest confusion/seeking
  if ((lower.match(/\?/g) || []).length >= 2) {
    return true;
  }

  return false;
}

// ─── High Risk Detection ───────────────────────────────────────────────────────

export function isHighRiskFromGemini(insight: GeminiInsight): boolean {
  return insight.riskLevel === "High";
}

export function isHighRiskFromML(probabilities: Record<string, number>): boolean {
  const suicidalProb = probabilities["Suicidal"] || probabilities["suicidal"] || 0;
  return suicidalProb > 0.4;
}

export const CRISIS_ESCALATION_MESSAGE = `⚠️ **We're concerned about you.**

Based on what you've shared, it seems like you may be going through a very difficult time. Please know that you are not alone and help is available right now.

🆘 **Immediate Support:**
- **Suicide & Crisis Lifeline**: Call **988** (24/7)
- **Crisis Text Line**: Text **HOME** to **741741**
- **iCall (India)**: **9152987821**
- **Vandrevala Foundation**: **1860-2662-345** (24/7)

💙 Please reach out to someone you trust — a friend, family member, or counselor. You matter, and there are people who want to help.`;

export const CRISIS_ESCALATION_MESSAGE_HI = `⚠️ **हम आपके बारे में चिंतित हैं।**

आपने जो साझा किया है उससे लगता है कि आप बहुत कठिन समय से गुज़र रहे हैं। कृपया जानिए कि आप अकेले नहीं हैं और अभी मदद उपलब्ध है।

🆘 **तत्काल सहायता:**
- **Suicide & Crisis Lifeline**: **988** पर कॉल करें (24/7)
- **Crisis Text Line**: **741741** पर **HOME** लिखें
- **iCall (भारत)**: **9152987821**
- **वंड्रेवाला फाउंडेशन**: **1860-2662-345** (24/7)

💙 कृपया किसी विश्वसनीय व्यक्ति से बात करें — दोस्त, परिवार, या काउंसलर। आप महत्वपूर्ण हैं, और ऐसे लोग हैं जो मदद करना चाहते हैं।`;
