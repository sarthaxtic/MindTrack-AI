from fastapi import FastAPI
from pydantic import BaseModel
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch
import numpy as np
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
from typing import Optional

# Language detection & translation
from langdetect import detect as langdetect_detect
from langdetect import DetectorFactory
from deep_translator import GoogleTranslator

# Make langdetect deterministic
DetectorFactory.seed = 0

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://mind-track-ai-gamma.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Get the correct model path
current_dir = Path(__file__).parent.absolute()
MODEL_PATH = current_dir / "mental_health_model"

# Verify model exists
if not MODEL_PATH.exists():
    raise Exception(f"Model not found at {MODEL_PATH}")

print(f"📁 Loading model from: {MODEL_PATH}")

tokenizer = None
model = None
device = None

# 🔹 Labels (must match training)
label_cols = ["Anxiety", "Stress", "Depression", "Suicidal", "Bipolar"]

# ─── Request Models ─────────────────────────────────────────────────────────────

class InputText(BaseModel):
    text: str
    auto_translate: Optional[bool] = False
    source_lang: Optional[str] = None

class LanguageDetectRequest(BaseModel):
    text: str

class TranslateRequest(BaseModel):
    text: str
    target_lang: Optional[str] = "en"


# ─── Hinglish-aware Language Detection ───────────────────────────────────────────

HINDI_PATTERNS = [
    "kya", "hai", "hoon", "mujhe", "mera", "meri", "nahi", "bahut", "acha",
    "bura", "kaise", "kaisa", "kuch", "aur", "lekin", "kyunki", "abhi", "kab",
    "yahan", "wahan", "theek", "thik", "pata", "zyada", "kam", "bohot", "accha",
    "baat", "raha", "rahi", "hota", "hoti", "chahiye", "chahta", "chahti",
    "lagta", "lagti", "samajh", "dukhi", "udaas", "tanaav", "chinta", "gussa",
    "akela", "neend", "thaka", "marna", "jeena", "zindagi", "dard", "rona",
    "khush", "pareshan", "dar", "ghabra", "mann", "dil", "aatma", "sapna",
    "takleef", "pareshani", "himmat", "umeed", "mushkil",
]

import re
DEVANAGARI_REGEX = re.compile(r'[\u0900-\u097F]')
HINGLISH_PATTERN = re.compile(
    r'\b(' + '|'.join(HINDI_PATTERNS) + r')\b', re.IGNORECASE
)

def detect_language(text: str) -> dict:
    """
    Detect language with special handling for Hinglish (code-mixed Hindi-English).
    Returns: { "language": "hi"|"en"|"hinglish", "confidence": float, "script": "devanagari"|"latin" }
    """
    # Check for Devanagari script first
    devanagari_chars = len(DEVANAGARI_REGEX.findall(text))
    total_chars = len(text.strip())
    
    if total_chars == 0:
        return {"language": "en", "confidence": 0.5, "script": "latin"}
    
    devanagari_ratio = devanagari_chars / total_chars
    
    if devanagari_ratio > 0.3:
        return {"language": "hi", "confidence": 0.95, "script": "devanagari"}
    
    # Check for Hinglish (Hindi words in Latin script)
    words = text.lower().split()
    hindi_word_count = sum(1 for w in words if HINGLISH_PATTERN.search(w))
    total_words = len(words)
    
    if total_words == 0:
        return {"language": "en", "confidence": 0.5, "script": "latin"}
    
    hindi_ratio = hindi_word_count / total_words
    
    if hindi_ratio >= 0.3:
        return {"language": "hinglish", "confidence": 0.85, "script": "latin"}
    elif hindi_ratio >= 0.15 or (hindi_word_count >= 2 and total_words <= 8):
        return {"language": "hinglish", "confidence": 0.7, "script": "latin"}
    
    # Fall back to langdetect for other languages
    try:
        detected = langdetect_detect(text)
        if detected == "hi":
            return {"language": "hi", "confidence": 0.8, "script": "latin"}
        return {"language": detected, "confidence": 0.8, "script": "latin"}
    except Exception:
        return {"language": "en", "confidence": 0.5, "script": "latin"}


def translate_text(text: str, src_lang: str = "auto", dest_lang: str = "en") -> dict:
    """
    Translate text while preserving emotional context.
    For Hinglish, we add context markers to help the translator.
    """
    if src_lang == "en" or (src_lang == "auto" and detect_language(text)["language"] == "en"):
        return {
            "original": text,
            "translated": text,
            "source_lang": "en",
            "was_translated": False,
        }
    
    try:
        # For Hinglish, try translating from Hindi
        translate_src = "hi" if src_lang in ("hi", "hinglish") else src_lang
        if translate_src == "auto":
            translate_src = "auto"
        
        translated_text = GoogleTranslator(source=translate_src, target=dest_lang).translate(text)
        
        return {
            "original": text,
            "translated": translated_text,
            "source_lang": src_lang,
            "was_translated": True,
        }
    except Exception as e:
        print(f"⚠️ Translation failed: {e}, using original text")
        return {
            "original": text,
            "translated": text,
            "source_lang": src_lang,
            "was_translated": False,
            "error": str(e),
        }


# ─── Helper Functions ────────────────────────────────────────────────────────────

def convert_to_native(obj):
    """Convert numpy types to Python native types for JSON serialization"""
    if isinstance(obj, np.float32) or isinstance(obj, np.float64):
        return float(obj)
    elif isinstance(obj, np.int32) or isinstance(obj, np.int64):
        return int(obj)
    elif isinstance(obj, np.ndarray):
        return obj.tolist()
    elif isinstance(obj, dict):
        return {k: convert_to_native(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [convert_to_native(item) for item in obj]
    return obj


# 🔥 Long text chunking (for prediction)
def split_text(text, tokenizer, max_length=512, stride=50):
    inputs = tokenizer(
        text,
        return_overflowing_tokens=True,
        max_length=max_length,
        stride=stride,
        truncation=True
    )
    
    chunks = []
    for ids in inputs["input_ids"]:
        chunks.append(tokenizer.decode(ids, skip_special_tokens=True))
    
    return chunks


def predict_long_text(text):
    chunks = split_text(text, tokenizer)
    
    all_probs = []
    
    for chunk in chunks:
        inputs = tokenizer(
            chunk,
            return_tensors="pt",
            truncation=True,
            padding=True,
            max_length=512
        ).to(device)
        
        with torch.no_grad():
            outputs = model(**inputs)
        
        probs = torch.sigmoid(outputs.logits)
        all_probs.append(probs.cpu().numpy())
    
    # 🔥 Use MAX to capture strongest signal
    return np.max(all_probs, axis=0)[0]


# 🔹 Main prediction function
def predict_text(text, threshold=0.5, min_conf=0.3):
    probs = predict_long_text(text)
    
    predicted_labels = [
        label_cols[i] for i, p in enumerate(probs) if p > threshold
    ]
    
    if len(predicted_labels) == 0 or max(probs) < min_conf:
        return {
            "labels": ["Normal"],
            "probabilities": dict(zip(label_cols, probs))
        }
    
    return {
        "labels": predicted_labels,
        "probabilities": dict(zip(label_cols, probs))
    }


def explain_prediction(text, top_label_idx, base_prob):
    """
    Computes Leave-One-Out (Occlusion) feature importance.
    Mimics SHAP value word-attribution by examining probability drops.
    """
    inputs = tokenizer(text, return_tensors="pt", max_length=512, truncation=True).to(device)
    input_ids = inputs["input_ids"][0]
    tokens = tokenizer.convert_ids_to_tokens(input_ids)
    
    scores = []
    clean_tokens = []
    
    for i in range(1, len(tokens) - 1): # Ignore CLS and SEP
        clean_token = tokens[i].replace(" ", "").replace(" ", "")
        
        occluded_ids = inputs["input_ids"].clone()
        occluded_ids[0, i] = tokenizer.unk_token_id
        
        with torch.no_grad():
            outputs = model(input_ids=occluded_ids, attention_mask=inputs["attention_mask"])
            occluded_probs = torch.sigmoid(outputs.logits)[0].cpu().numpy()
            
        occluded_prob = occluded_probs[top_label_idx]
        score = float(base_prob - occluded_prob)
        
        scores.append(score)
        clean_tokens.append(clean_token)
        
    return {"tokens": clean_tokens, "scores": scores}


def load_model():
    global tokenizer, model, device

    if tokenizer is None or model is None:
        print(f"🚀 Loading model from: {MODEL_PATH}")
        
        try:
            # Load tokenizer and model
            tokenizer = AutoTokenizer.from_pretrained(str(MODEL_PATH))
            model = AutoModelForSequenceClassification.from_pretrained(
                str(MODEL_PATH),
                ignore_mismatched_sizes=True
            )
            
            device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
            model.to(device)
            model.eval()
            torch.set_num_threads(1)
            
            print(f"✅ Model loaded successfully on {device}")
            print(f"📊 Model has {model.config.num_labels} output labels")
            print(f"🏷️  Labels: {label_cols}")
            
        except Exception as e:
            print(f"❌ Error loading model: {e}")
            raise


# ─── API Endpoints ───────────────────────────────────────────────────────────────

# Health check
@app.get("/")
def health():
    return {"status": "ML API running 🚀"}


@app.get("/warmup")
def warmup():
    try:
        load_model()
        return {"status": "model warmed up 🔥"}
    except Exception as e:
        return {"status": "error", "error": str(e)}


@app.post("/detect-language")
def detect_language_endpoint(data: LanguageDetectRequest):
    """Detect the language of input text with Hinglish support."""
    result = detect_language(data.text)
    return result


@app.post("/translate")
def translate_endpoint(data: TranslateRequest):
    """Translate text to the target language (default: English)."""
    lang_info = detect_language(data.text)
    result = translate_text(data.text, src_lang=lang_info["language"], dest_lang=data.target_lang)
    result["detected_language"] = lang_info
    return result


@app.post("/predict")
def predict(data: InputText):
    try:
        load_model()
        
        original_text = data.text
        analysis_text = data.text
        language_info = None
        translation_info = None
        
        # Auto-translate if requested
        if data.auto_translate:
            language_info = detect_language(data.text)
            print(f"🌐 Detected language: {language_info}")
            
            if language_info["language"] != "en":
                translation_info = translate_text(
                    data.text, 
                    src_lang=language_info["language"]
                )
                if translation_info.get("was_translated"):
                    analysis_text = translation_info["translated"]
                    print(f"🔄 Translated: '{original_text[:80]}...' → '{analysis_text[:80]}...'")
        elif data.source_lang and data.source_lang not in ("en", "auto"):
            language_info = {"language": data.source_lang, "confidence": 1.0, "script": "unknown"}
            translation_info = translate_text(data.text, src_lang=data.source_lang)
            if translation_info.get("was_translated"):
                analysis_text = translation_info["translated"]
        
        print(f"\n📝 Analyzing text: {analysis_text[:100]}...")
        
        # 🔹 Use the prediction function on (possibly translated) text
        result = predict_text(analysis_text, threshold=0.5, min_conf=0.3)
        
        # Convert numpy types to Python native types
        probabilities = convert_to_native(result["probabilities"])
        
        # Get all predictions with their probabilities
        all_predictions = []
        for label, prob in probabilities.items():
            all_predictions.append({
                "label": label.lower(),
                "confidence": float(prob)
            })
        
        # Sort by confidence descending
        all_predictions.sort(key=lambda x: x["confidence"], reverse=True)
        
        # Get the top prediction
        top_prediction = all_predictions[0] if all_predictions else {"label": "normal", "confidence": 0.0}
        
        # Get all predicted labels
        predicted_labels = result["labels"]
        
        # Generate explanation
        significant = [p for p in all_predictions if p["confidence"] > 0.3]
        
        if len(predicted_labels) == 1 and predicted_labels[0] == "Normal":
            explanation = "No significant mental health indicators detected in this text."
        else:
            explanation_parts = []
            for pred in significant[:3]:
                explanation_parts.append(
                    f"{pred['label'].title()}: {pred['confidence']*100:.1f}%"
                )
            explanation = f"Detected: {', '.join(explanation_parts)}"
            
        # Generate SHAP-like explanations
        shap_data = None
        if top_prediction["label"] != "normal" and len(analysis_text) <= 500: # Limit length
            try:
                top_label_idx = label_cols.index(top_prediction["label"].title())
                shap_data = explain_prediction(analysis_text, top_label_idx, top_prediction["confidence"])
            except Exception as e:
                print(f"⚠️ SHAP explanation failed: {e}")
        
        # Prepare response
        response = {
            # Original format fields
            "labels": predicted_labels,
            "probabilities": probabilities,
            
            # Additional fields
            "label": top_prediction["label"],
            "confidence": float(top_prediction["confidence"]),
            "all_predictions": all_predictions,
            "explanation": explanation,
            "shapData": shap_data,
            "raw_probs": [float(probabilities[label]) for label in label_cols],
            
            # Multilingual fields
            "language_info": language_info,
            "translation_info": {
                "original_text": original_text,
                "analyzed_text": analysis_text,
                "was_translated": translation_info.get("was_translated", False) if translation_info else False,
                "source_lang": translation_info.get("source_lang") if translation_info else None,
            } if language_info else None,
        }
        
        # Debug print
        print(f"📊 Results:")
        print(f"  Predicted Labels: {result['labels']}")
        print(f"  Probabilities:")
        for k, v in probabilities.items():
            print(f"    {k}: {v:.3f}")
        print(f"  Explanation: {explanation}")
        if language_info:
            print(f"  Language: {language_info['language']} (confidence: {language_info['confidence']:.2f})")
        
        return response

    except Exception as e:
        print(f"❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        
        return {
            "labels": ["Normal"],
            "probabilities": {
                "Anxiety": 0.0,
                "Stress": 0.0,
                "Depression": 0.0,
                "Suicidal": 0.0,
                "Bipolar": 0.0
            },
            "label": "neutral",
            "confidence": 0.0,
            "all_predictions": [],
            "explanation": f"Error: {str(e)}",
            "raw_probs": [0.0] * len(label_cols),
            "error": str(e)
        }