"""Streamlit web app: predicts maintenance risk and energy use from machine readings.

Run locally (from the repository root):   streamlit run app.py
"""
import sys
from pathlib import Path

import pandas as pd
import sklearn
import streamlit as st

sys.path.insert(0, str(Path(__file__).resolve().parent))
from predictor import add_derived_features, load_artifacts, predict  # noqa: E402

st.set_page_config(page_title="Smart Manufacturing Predictor", page_icon="🏭", layout="wide")

# Order and grouping of the input fields. Any column not listed here is added to "Other".
FIELD_GROUPS = {
    "Machine profile": [
        "plant", "production_line", "machine_type", "shift", "material_grade",
        "lubricant_type", "supplier_tier", "inspection_status",
        "machine_age_years", "operator_experience_years",
    ],
    "Operating conditions": [
        "ambient_temperature_c", "humidity_pct", "rpm", "load_percent", "production_rate_units_hr",
        "batch_size", "motor_current_a", "power_factor", "hydraulic_pressure_bar",
    ],
    "Sensor readings": ["vibration_mm_s", "oil_temperature_c", "bearing_temperature_c", "noise_db"],
    "Maintenance & quality": [
        "days_since_maintenance", "maintenance_count", "downtime_hours_30d", "defect_rate_pct",
    ],
}
RISK_STYLE = {"Low": ("success", "🟢"), "Medium": ("warning", "🟠"), "High": ("error", "🔴")}


@st.cache_resource(show_spinner="Loading models...")
def get_artifacts():
    return load_artifacts()


def pretty(name):
    return name.replace("_", " ").capitalize()


def render_field(col, meta):
    """Draw the right widget for one input field and return its value."""
    numeric, categorical = meta["features"]["numeric"], meta["features"]["categorical"]
    if col in categorical:
        info = categorical[col]
        return st.selectbox(pretty(col), info["options"], index=info["options"].index(info["default"]), key=col)

    info = numeric[col]
    help_text = (f"Typical range {info['p01']:.2f} to {info['p99']:.2f}. "
                 f"Allowed: {info['min']:.2f} to {info['max']:.2f} (range seen in the training data).")
    if info["is_integer"]:
        return st.number_input(pretty(col), min_value=int(info["min"]), max_value=int(info["max"]),
                               value=int(round(info["median"])), step=1, help=help_text, key=col)
    step = max(round((info["p99"] - info["p01"]) / 100, 3), 0.001)
    return st.number_input(pretty(col), min_value=float(info["min"]), max_value=float(info["max"]),
                           value=float(info["median"]), step=float(step), help=help_text, key=col)


# ----------------------------------------------------------------------------- page
st.title("🏭 Smart Manufacturing: Maintenance Risk & Energy Predictor")
st.write("Enter the machine's readings below and press **Predict**. The app estimates the "
         "**maintenance risk level** and the **energy consumption (kWh)** and shows the values it used.")

try:
    artifacts = get_artifacts()
except FileNotFoundError:
    st.error("Model files not found. Run the notebook first so that `models/final_classifier.pkl`, "
             "`models/final_regressor.pkl` and `models/app_metadata.json` exist, then restart the app.")
    st.stop()

meta = artifacts["meta"]
numeric_cols, categorical_cols = meta["features"]["numeric"], meta["features"]["categorical"]

# Sidebar: model information
with st.sidebar:
    st.header("About the models")
    c = meta["classifier"]
    st.markdown(f"**Risk classifier:** {c['name']}")
    st.caption(f"Test accuracy {c['accuracy']:.1%} · weighted F1 {c['weighted_f1']:.3f} · ROC-AUC {c['roc_auc']:.3f}")
    r = meta["regressor"]
    st.markdown(f"**Energy regressor:** {r['name']}")
    st.caption(f"Test R² {r['r2']:.3f} · RMSE {r['rmse']:.2f} kWh · MAE {r['mae']:.2f} kWh")
    st.divider()
    st.caption("Course project (23CSE301 Machine Learning). Predictions are statistical estimates "
               "learned from a historical dataset and are not a substitute for engineering inspection.")

trained_sklearn = meta.get("versions", {}).get("scikit-learn")
if trained_sklearn and trained_sklearn != sklearn.__version__:
    st.warning(f"Models were trained with scikit-learn {trained_sklearn} but this app runs {sklearn.__version__}. "
               "Pin the same version in requirements.txt if predictions look wrong or loading fails.")

# Input form, grouped into tabs
all_cols = list(categorical_cols) + list(numeric_cols)
groups = {g: [c for c in cols if c in all_cols] for g, cols in FIELD_GROUPS.items()}
leftover = [c for c in all_cols if not any(c in cols for cols in FIELD_GROUPS.values())]
if leftover:
    groups["Other"] = leftover
groups = {g: cols for g, cols in groups.items() if cols}

with st.form("machine_form"):
    values = {}
    for tab, (group_name, cols) in zip(st.tabs(list(groups)), groups.items()):
        with tab:
            layout = st.columns(3)
            for i, col in enumerate(cols):
                with layout[i % 3]:
                    values[col] = render_field(col, meta)
    submitted = st.form_submit_button("🔮 Predict", type="primary")

if submitted:
    result = predict(artifacts, values)
    st.subheader("Prediction")
    left, right = st.columns(2)

    with left:
        kind, icon = RISK_STYLE.get(result["risk"], ("info", "ℹ️"))
        getattr(st, kind)(f"{icon} Predicted maintenance risk: **{result['risk']}**")
        st.write("Model confidence per class:")
        for label, p in result["probabilities"].items():
            st.progress(min(max(p, 0.0), 1.0), text=f"{label}: {p:.1%}")

    with right:
        st.metric("Predicted energy consumption", f"{result['energy_kwh']:.2f} kWh")
        st.caption(f"Typical error of this model: about ±{meta['regressor']['mae']:.2f} kWh (test MAE).")

    # Echo of the input values (including the engineered feature)
    st.subheader("Input values used")
    echo = add_derived_features(pd.DataFrame([values])).T.reset_index()
    echo.columns = ["Feature", "Value"]
    echo["Value"] = echo["Value"].astype(str)
    st.dataframe(echo, use_container_width=True, hide_index=True)

    download = add_derived_features(pd.DataFrame([values]))
    download["predicted_risk"] = result["risk"]
    download["predicted_energy_kwh"] = round(result["energy_kwh"], 3)
    st.download_button("⬇️ Download inputs and prediction (CSV)", download.to_csv(index=False),
                       file_name="machine_prediction.csv", mime="text/csv")
else:
    st.info("Adjust the values in the tabs above (they start at typical values) and press **Predict**.")
