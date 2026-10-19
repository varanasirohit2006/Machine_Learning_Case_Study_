# Smart Manufacturing ML — React Frontend

Interactive React frontend for the 23CSE301 ML capstone project. Shows all analysis from `Review2_Final.ipynb`: regression, classification, and clustering results, with live Chart.js visualizations and a machine-reading predictor form.

## Quick Start (standalone — no install required)

The standalone build lives in `frontend/public/` and works by simply opening it in a browser with network access (for CDN React):

```bash
cd frontend
npx serve public -l 8080        # or any static server
open http://localhost:8080
```

Or just open directly in any browser:
```bash
# Windows
start frontend/public/index.html
```

The standalone app uses pre-bundled React 18, Chart.js, Tailwind CSS, and a self-contained hash router. It works both over local web servers (`http://localhost`) and directly via `file:///` without CORS issues.

## Data Sources

All metrics are embedded in:
- `public/data.js` — extracted from notebook output cells (regression ranking, classification table, clustering metrics)
- `public/featureMeta.js` — extracted from `models/app_metadata.json` (feature ranges for the predictor form)

## Project Structure

```
frontend/
├── public/                 # Standalone browser app (open index.html)
│   ├── index.html          # Main HTML entry
│   ├── vendor/             # Local offline bundles (React, ReactDOM, Chart.js)
│   ├── app.bundle.js       # Pre-compiled standalone app
│   ├── app.js              # Source React app
│   ├── data.js             # All analysis metrics from the notebook
│   ├── featureMeta.js      # Input field metadata for the predictor
│   └── styles.css          # Glassmorphism dark styling & fallbacks
├── src/                    # Vite React source (for npm build workflow)
│   ├── App.jsx
│   ├── main.jsx
│   ├── index.css
│   ├── data/analysisData.js
│   ├── data/featureMeta.js
│   ├── components/
│   └── pages/
├── package.json            # Vite + React + Chart.js deps
├── vite.config.js
└── tailwind.config.cjs
```

## Pages

| Route | Page |
|-------|------|
| `/` | Overview — EDA summary, class balance, correlations |
| `/regression` | Regression track — 10-model comparison, CV, tuned params |
| `/classification` | Classification track — Part A & B, tuned params, ROC-AUC |
| `/clustering` | Clustering — elbow, linkage comparison, validation |
| `/predict` | Predictor — enter machine readings, get risk + energy estimate |

## Notes

- The predict form uses heuristic estimates based on the notebook's feature correlations (motor_current to energy = 0.77). The Python `app.py` Streamlit app calls the actual Gradient Boosting models for production predictions.
- All chart data is hardcoded from notebook cell outputs (no runtime data fetching needed).
- The Vite `src/` version provides a production build pipeline once npm dependencies are installed.
