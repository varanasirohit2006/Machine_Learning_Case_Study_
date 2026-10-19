"""Prediction logic for the Smart Manufacturing web app (no Streamlit code here, so it is easy to test)."""
import json
from pathlib import Path

import joblib
import pandas as pd

def _resolve_models_dir():
    # Check if models/ is in the same directory as predictor.py (e.g. repo root)
    candidate = Path(__file__).resolve().parent / "models"
    if candidate.exists():
        return candidate
    # Check if models/ is in the parent directory (e.g. if predictor.py is in app/)
    candidate = Path(__file__).resolve().parent.parent / "models"
    if candidate.exists():
        return candidate
    # Check if models/ is in the current working directory
    candidate = Path.cwd() / "models"
    if candidate.exists():
        return candidate
    return Path(__file__).resolve().parent / "models"


DEFAULT_MODELS_DIR = _resolve_models_dir()
RISK_ORDER = ["Low", "Medium", "High"]


def load_artifacts(models_dir=None):
    """Load the classifier bundle, regressor bundle and app metadata exported by the notebook."""
    models_dir = Path(models_dir) if models_dir is not None else _resolve_models_dir()
    return {
        "clf": joblib.load(models_dir / "final_classifier.pkl"),
        "reg": joblib.load(models_dir / "final_regressor.pkl"),
        "meta": json.loads((models_dir / "app_metadata.json").read_text(encoding="utf-8")),
    }


def add_derived_features(df):
    """Same engineered feature as the notebook: bearing temperature rise above ambient."""
    df = df.copy()
    if {"bearing_temperature_c", "ambient_temperature_c"} <= set(df.columns):
        df["bearing_temp_rise_c"] = df["bearing_temperature_c"] - df["ambient_temperature_c"]
    return df


def build_input_frame(values, feature_columns):
    """One-row DataFrame with the columns in the order the saved preprocessors expect."""
    df = add_derived_features(pd.DataFrame([values]))
    missing = [c for c in feature_columns if c not in df.columns]
    if missing:
        raise ValueError(f"Missing input values for: {missing}")
    return df[feature_columns]


def predict(artifacts, values):
    """Return the predicted risk class, class probabilities and energy use for one machine."""
    clf, reg = artifacts["clf"], artifacts["reg"]

    clf_input = build_input_frame(values, clf["feature_columns"])
    probabilities = clf["model"].predict_proba(clf["preprocessor"].transform(clf_input))[0]
    labels = list(clf["label_encoder"].classes_)
    prob_by_label = {label: float(p) for label, p in zip(labels, probabilities)}
    risk = labels[int(probabilities.argmax())]

    reg_input = build_input_frame(values, reg["feature_columns"])
    energy_kwh = float(reg["model"].predict(reg["preprocessor"].transform(reg_input))[0])

    ordered = {k: prob_by_label[k] for k in RISK_ORDER if k in prob_by_label}
    ordered.update({k: v for k, v in prob_by_label.items() if k not in ordered})
    return {"risk": risk, "probabilities": ordered, "energy_kwh": energy_kwh}
