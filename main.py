import os
from typing import Any, Dict
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from predictor import load_artifacts, predict

app = FastAPI(title="Smart Manufacturing ML Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

_artifacts = None


def get_artifacts():
    global _artifacts
    if _artifacts is None:
        _artifacts = load_artifacts()
    return _artifacts


@app.get("/")
def root():
    return {"service": "Smart Manufacturing ML Backend", "status": "running"}


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/metadata")
def metadata():
    try:
        artifacts = get_artifacts()
        return artifacts["meta"]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load artifacts: {e}")


@app.post("/predict")
def predict_endpoint(values: Dict[str, Any]):
    try:
        artifacts = get_artifacts()
        result = predict(artifacts, values)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Prediction error: {e}")
