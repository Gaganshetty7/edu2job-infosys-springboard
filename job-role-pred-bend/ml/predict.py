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


def safe_encode(enc, value, fallback):
    """
    Try encoding. If unseen label comes in, encode the fallback instead.
    """
    try:
        return enc.transform([value])[0]
    except Exception:
        return enc.transform([fallback])[0]


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
        s.strip().lower()
        for s in skills.split(",")
        if s.strip()
    ]

    # ---------- BASE FEATURE DICT ----------
    data = {col: 0 for col in feature_cols}

    # ---------- ENCODE CATEGORICAL (SAFE) ----------
    data["qualification"] = safe_encode(enc["qualification"], qualification, "other")
    data["experience_level"] = safe_encode(enc["experience_level"], experience_level, "other")

    # ---------- SET SKILL FLAGS ----------
    for skill in incoming_skills:
        col = f"skill__{skill}"
        if col in data:
            data[col] = 1

    df = pd.DataFrame([data])

    # ---------- PREDICT ----------
    probs = model.predict_proba(df)[0]

    # top‑3 indices (highest probability first)
    top3_idx = probs.argsort()[-3:][::-1]
    job_labels = enc["job_role"].inverse_transform(top3_idx)

    results = []

    for i, idx in enumerate(top3_idx):
        role_name = job_labels[i]
        prob = float(probs[idx])

        # ----------- BUILD REASONS (for roleCard) -----------
        reasons = []

        # degree heuristic
        if any(x in qualification for x in ["bsc", "b.tech", "msc", "mca", "phd"]):
            reasons.append("Relevant educational background")

        # skill matches that help
        matched = [
            sk
            for sk in incoming_skills
            if f"skill__{sk}" in vocab
        ]
        if matched:
            reasons.append(f"{len(matched)} relevant skill(s) detected")

        if not reasons:
            reasons.append("Based on overall probability pattern")

        results.append(
            {
                "role": role_name,
                "confidence": round(prob * 100, 2),
                "reasons": reasons,
            }
        )

    return results
