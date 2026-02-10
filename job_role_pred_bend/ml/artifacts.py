import os
import pickle
from django.conf import settings

ARTIFACTS = None

def load_artifacts():
    global ARTIFACTS
    if ARTIFACTS is None:
        if not os.path.exists(settings.ML_MODEL_PATH):
            raise FileNotFoundError("Model not found")

        with open(settings.ML_MODEL_PATH, "rb") as f:
            ARTIFACTS = pickle.load(f)

    return ARTIFACTS
