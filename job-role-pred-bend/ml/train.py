import pandas as pd
import pickle
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from django.conf import settings

MODEL_PATH = settings.ML_MODEL_PATH

def build_skill_vocab(series):
    vocab = set()

    for s in series.fillna(""):
        skills = [x.strip().lower() for x in s.split(",") if x.strip()]
        vocab.update(skills)

    return sorted(vocab)

def train_model(dataset_path):
    df = pd.read_csv(dataset_path)

    # drop id column
    df = df.drop("candidate_id", axis=1)

    # normalize text (strip + lowercase)
    for col in df.columns:
        if df[col].dtype == "object":
            df[col] = df[col].str.strip().str.lower()

    # ----- BUILD SKILL VOCAB -----
    skill_vocab = build_skill_vocab(df["skills"])

    # ----- CONVERT SKILLS TO MULTI‑HOT (efficient) -----
    skill_cols = {}

    for skill in skill_vocab:
        skill_cols[f"skill__{skill}"] = df["skills"].apply(
            lambda x: 1 if skill in [s.strip().lower() for s in str(x).split(",")] else 0
        )

    skill_df = pd.DataFrame(skill_cols)

    # join once (avoids fragmentation warning)
    df = pd.concat([df, skill_df], axis=1)


    # encoders (non‑skill categorical fields)
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

    model = RandomForestClassifier(
        n_estimators=150,
        random_state=42
    )

    model.fit(X_train, y_train)

    artifacts = {
        "model": model,
        "feature_cols": feature_cols,
        "skill_vocab": skill_vocab,
        "encoders": {
            "qualification": le_qualification,
            "experience_level": le_experience,
            "job_role": le_job,
        },
    }

    with open(MODEL_PATH, "wb") as f:
        pickle.dump(artifacts, f)

    return "Model trained & saved successfully!"
