import os
import pickle
import numpy as np
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

    # skills can be a list (from dash_prediction_data) or a comma-separated string (from JSON)
    if isinstance(skills, list):
        incoming_skills = [
            s.strip().lower()
            for s in skills
            if isinstance(s, str) and s.strip()
        ]
    else:
        incoming_skills = [
            s.strip().lower()
            for s in str(skills).split(",")
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

    # ---------- SHAP VALUES ----------
    explainer = artifacts["explainer"]
    shap_values = explainer.shap_values(df)

    # top‑3 indices (highest probability first)
    top3_idx = probs.argsort()[-3:][::-1]
    job_labels = enc["job_role"].inverse_transform(top3_idx)

    # ----------- BUILD REASONS (for roleCard) -----------
    results = []

    for i, idx in enumerate(top3_idx):
        role_name = job_labels[i]
        prob = float(probs[idx])

        # ---------- SHAP CONTRIBUTIONS FOR THIS ROLE ----------
        # shap_values can be:
        # - list of arrays (one per class)
        # - single array (n_samples, n_features)
        # - array (n_samples, n_features, n_classes)
        if isinstance(shap_values, list):
            # list: one array per class
            class_shap = shap_values[idx]      # shape (1, n_features)
            contribs = class_shap[0]
        else:
            sv = np.array(shap_values)
            if sv.ndim == 2:
                # (1, n_features) – same SHAP vector for all roles
                contribs = sv[0]
            elif sv.ndim == 3:
                # (1, n_features, n_classes) – pick this class
                contribs = sv[0, :, idx]
            else:
                raise ValueError(f"Unexpected shap_values shape: {sv.shape}")

        feature_importance = list(zip(feature_cols, contribs))

        # Sort by strongest positive influence
        feature_importance.sort(key=lambda x: abs(x[1]), reverse=True)

        skill_reasons = []
        edu_exp_reasons = []

        # only allow reasons for skills actually present in input
        input_skill_cols = {f"skill__{s}" for s in incoming_skills}

        for feat, value in feature_importance[:15]:   # look at top influences
            # skills: only consider input skills
            if feat.startswith("skill__") and value > 0 and feat in input_skill_cols:
                skill_name = feat.replace("skill__", "")
                skill_reasons.append(f"{skill_name} aligned strongly with {role_name}")

            # qualification
            elif feat == "qualification" and value > 0:
                decoded = enc["qualification"].inverse_transform(
                    [int(df.iloc[0][feat])]
                )[0]
                edu_exp_reasons.append(
                    f"Profiles with '{decoded}' frequently match {role_name}"
                )

            # experience
            elif feat == "experience_level" and value > 0:
                decoded = enc["experience_level"].inverse_transform(
                    [int(df.iloc[0][feat])]
                )[0]
                edu_exp_reasons.append(
                    f"Experience level '{decoded}' is common among {role_name}s"
                )

            # stop once we have enough explanations
            if len(skill_reasons) >= 3 and len(edu_exp_reasons) >= 2:
                break

        # fallbacks if nothing positive appeared
        if not skill_reasons:
            skill_reasons.append("No direct skill signals — inferred from broader pattern")

        if not edu_exp_reasons:
            edu_exp_reasons.append("Education/experience pattern inferred from model")

        reasons = skill_reasons + edu_exp_reasons

        results.append(
            {
                "role": role_name,
                "confidence": round(prob * 100, 2),
                "reasons": reasons,
            }
        )

    return results
