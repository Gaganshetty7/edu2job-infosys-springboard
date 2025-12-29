import os
import pickle
import pandas as pd
from django.conf import settings

MODEL_PATH = settings.ML_MODEL_PATH


def load_artifacts():
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError("Model not trained yet.")

    with open(MODEL_PATH, "rb") as f:
        artifacts = pickle.load(f)

    return artifacts


def predict_job_role(skills, qualification, experience_level):
    artifacts = load_artifacts()

    model = artifacts["model"]
    feature_cols = artifacts["feature_cols"]
    vocab = artifacts["skill_vocab"]
    enc = artifacts["encoders"]

    # ---------- NORMALIZE INPUT ----------
    qualification = qualification.strip().lower()
    experience_level = experience_level.strip().lower()

    incoming_skills = [
        s.strip().lower() for s in skills.split(",") if s.strip()
    ]

    # ---------- BASE FEATURE DICT ----------
    data = {col: 0 for col in feature_cols}

    # ---------- ENCODE CATEGORICAL ----------
    data["qualification"] = enc["qualification"].transform([qualification])[0]
    data["experience_level"] = enc["experience_level"].transform([experience_level])[0]

    # ---------- SET SKILL FLAGS ----------
    for skill in incoming_skills:
        col = f"skill__{skill}"
        if col in data:
            data[col] = 1   # mark skill as present

    df = pd.DataFrame([data])

    # ---------- PREDICT ----------
    probs = model.predict_proba(df)[0]

    # top‑3 indices (highest probability first)
    top3_idx = probs.argsort()[-3:][::-1]

    job_labels = enc["job_role"].inverse_transform(top3_idx)

    return [
        {"job_role": job_labels[i], "probability": float(probs[top3_idx[i]])}
        for i in range(len(top3_idx))
    ]
