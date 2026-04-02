import shap
import torch
from transformers import pipeline, AutoModelForSequenceClassification, AutoTokenizer

model_path = "./mental_health_model"
tokenizer = AutoTokenizer.from_pretrained(model_path)
model = AutoModelForSequenceClassification.from_pretrained(model_path)

# Multi-label pipeline
pipe = pipeline("text-classification", model=model, tokenizer=tokenizer, return_all_scores=True)

try:
    print("Initializing Explainer...")
    explainer = shap.Explainer(pipe)
    print("Running SHAP...")
    shap_values = explainer(["I am feeling extremely sad and hopeless about the future."])

    print("Data:", shap_values.data)
    print("Values shape:", shap_values.values.shape)
    # Shape should be (1, num_tokens, num_classes)
    print("Success")
except Exception as e:
    print(f"Error: {e}")
