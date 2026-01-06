import os
import json
import pandas as pd
import pickle
import shap
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from django.conf import settings

# Where model + metadata live
MODEL_PATH = settings.ML_MODEL_PATH
METADATA_PATH = os.path.join(os.path.dirname(MODEL_PATH), "metadata.json")


def build_skill_vocab(series):
    vocab = set()
    for s in series.fillna(""):
        skills = [x.strip().lower() for x in s.split(",") if x.strip()]
        vocab.update(skills)
    return sorted(vocab)


def train_model(dataset_path):
    df = pd.read_csv(dataset_path)

    # remove id column if present
    if "candidate_id" in df.columns:
        df = df.drop("candidate_id", axis=1)

    # --- capture ORIGINAL casing for metadata (frontend display) ---
    qualifications_unique = sorted(df["qualification"].dropna().unique())
    exp_unique = sorted(df["experience_level"].dropna().unique())

    skill_vocab_frontend = sorted(
        set(
            s.strip()
            for row in df["skills"].fillna("")
            for s in row.split(",")
            if s.strip()
        )
    )

    # --- normalize ONLY for model training ---
    for col in df.columns:
        if df[col].dtype == "object":
            df[col] = df[col].str.strip().str.lower()

    # lowercase skills vocabulary for the model
    skill_vocab = build_skill_vocab(df["skills"])

    # convert skills to multi-hot features
    skill_cols = {}
    for skill in skill_vocab:
        skill_cols[f"skill__{skill}"] = df["skills"].apply(
            lambda x: 1 if skill in [s.strip().lower() for s in str(x).split(",")] else 0
        )

    df = pd.concat([df, pd.DataFrame(skill_cols)], axis=1)

    # encoders
    le_qualification = LabelEncoder()
    le_experience = LabelEncoder()
    le_job = LabelEncoder()

    df["qualification"] = le_qualification.fit_transform(df["qualification"].fillna(""))
    df["experience_level"] = le_experience.fit_transform(df["experience_level"].fillna(""))

    # target
    df["job_role"] = le_job.fit_transform(df["job_role"])

    feature_cols = (
        ["qualification", "experience_level"]
        + [c for c in df.columns if c.startswith("skill__")]
    )

    X = df[feature_cols]
    y = df["job_role"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    model = RandomForestClassifier(n_estimators=150, random_state=42)
    model.fit(X_train, y_train)

    # SHAP explainer for interpretability
    explainer = shap.TreeExplainer(model)


    # save model + encoders
    artifacts = {
        "model": model,
        "feature_cols": feature_cols,
        "skill_vocab": skill_vocab,
        "explainer": explainer,
        "encoders": {
            "qualification": le_qualification,
            "experience_level": le_experience,
            "job_role": le_job,
        },
    }

    with open(MODEL_PATH, "wb") as f:
        pickle.dump(artifacts, f)

    # --- save metadata for frontend (keeps ORIGINAL case) ---
    metadata = {
        "qualification": qualifications_unique,
        "experience_level": exp_unique,
        "skills": skill_vocab_frontend,
    }

    with open(METADATA_PATH, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)

    return "Model trained & saved successfully!"
