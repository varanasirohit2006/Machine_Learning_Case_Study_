# 23CSE301 Machine Learning Capstone - Smart Manufacturing

End-to-end ML pipeline on a smart-manufacturing sensor dataset, covering three tracks:
**Regression**, **Classification** and **Clustering** (B.Tech CSE, III year, AY 2026-27).

**Team:** 

## Problem statement

Using machine sensor readings, operating conditions and maintenance history:

1. **Regression** - predict machine energy consumption (`machine_energy_kwh`).
2. **Classification** - predict the maintenance risk level (`maintenance_risk`: Low / Medium / High).
3. **Clustering** - discover groups of machines with similar operating profiles (unsupervised; risk labels used only for validation after fitting).

## Dataset

- File: `data/smart_manufacturing_ml_dataset.csv` (~22,000 machine records, 30 columns incl. two targets and an ID).
- Features: numerical sensor/operational variables (vibration, temperatures, pressure, current, RPM, load, downtime, ...) and categorical descriptors (plant, line, machine type, shift, material grade, lubricant, supplier tier, inspection status).
- Missing values and duplicates are handled in the notebook (Section B).

## Repository structure

```
README.md            this file
requirements.txt     Python dependencies
data/                dataset CSV
notebooks/           capstone notebook
models/              final_classifier.pkl (written by the notebook)
results/             CSV result tables (written by the notebook)
app/                 Streamlit web app (bonus): app.py (UI) and predictor.py (prediction logic)
```

## Methods

| Track               | Algorithms                                                                                                                                                        |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Regression (10)     | Linear, Ridge, Lasso, ElasticNet, Polynomial, Decision Tree, Random Forest, Gradient Boosting, SVR, KNN                                                           |
| Classification (10) | Part A: Logistic Regression, KNN, Gaussian Naive Bayes, Decision Tree, SVC. Part B: Random Forest, AdaBoost, Gradient Boosting, Bagging (Decision Tree base), MLP |
| Clustering (2)      | K-Means (Elbow curve), Agglomerative Hierarchical (Dendrograms, 4 linkages compared)                                                                              |

Evaluation: R2/RMSE/MAE + 5-fold CV (regression); Accuracy/Precision/Recall/weighted F1/ROC-AUC (OvR)/confusion matrix + 5-fold CV for the top two models (classification); Silhouette, Davies-Bouldin and Calinski-Harabasz, PCA and t-SNE plots (clustering).

## Web app (bonus: GUI + public deployment)

A Streamlit app (`app/app.py`) lets a user enter machine readings in a form and see the **predicted maintenance risk** (with class probabilities), the **predicted energy consumption (kWh)** and a table of **the input values used** (downloadable as CSV). It loads the models exported by the notebook (Section H); nothing is retrained.

**Live app:** _<paste your public URL here after deploying, e.g. https://your-app.streamlit.app>_

### Run the app locally

```bash
pip install -r requirements.txt
streamlit run app/app.py        # run from the repository root, after the notebook has created models/
```

### Deploy publicly on Streamlit Community Cloud (free)

1. Run the notebook completely so that `models/final_classifier.pkl`, `models/final_regressor.pkl` and `models/app_metadata.json` exist.
2. Pin exact library versions in `requirements.txt` (see the comment at the top of that file). The models are pickles, so scikit-learn must match the training version.
3. Push everything to a **public** GitHub repository, including the `models/` folder (each file must be under 100 MB; the notebook prints their sizes) and the `app/` folder.
4. Go to https://share.streamlit.io, sign in with GitHub and click **Create app**.
5. Choose your repository and branch, set **Main file path** to `app/app.py`.
6. Open **Advanced settings** and select the same Python version you used locally (the notebook prints it in Section G2), then click **Deploy**.
7. After a few minutes the app is live at a public URL. Paste it into this README.

**Troubleshooting:** if the app reports "Model files not found", the `models/` folder was not committed. If it fails while loading the models, the scikit-learn version differs from the training version.

## Results summary

_Fill in from the executed notebook (tables are also saved in `results/`)._

| Track          | Best model         | Key metrics                                                              |
| -------------- | ------------------ | ------------------------------------------------------------------------ |
| Regression     |                    | R2 = _<>_, RMSE = _<>_, MAE = _<>_                                 |
| Classification |                    | Accuracy = _<>_, weighted F1 = _<>_, ROC-AUC = _<>_                |
| Clustering     | _<algorithm, k>_ | Silhouette = _<>_, Davies-Bouldin = _<>_, Calinski-Harabasz = _<>_ |

## Environment setup & how to run

```bash
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
jupyter notebook notebooks/
```

1. Place `smart_manufacturing_ml_dataset.csv` where the notebook expects it (same folder, or update the path in the data-loading cell).
2. Run **Kernel > Restart & Run All**. A full run takes roughly 10-30 minutes depending on the machine (grid searches dominate).
3. Outputs: tables in `results/`; model files in `models/` (`final_classifier.pkl`, `final_regressor.pkl`, `app_metadata.json`). If the notebook is run from inside `notebooks/`, these folders are created at the repository root automatically.

All random operations use `random_state=42`. Scalers/encoders are fitted on the training split only.

## Generative-AI assistance (declaration)

Generative AI (Claude, Anthropic) was used for **code scaffolding** of the Review 2 sections (Classification Part B, final-model-selection helpers, the clustering pipeline and the Streamlit web app). Analysis, interpretation and feature-engineering decisions are the team's own. 

## References

- scikit-learn and SciPy documentation (`GridSearchCV`, `roc_curve`, `KMeans`, `AgglomerativeClustering`, `scipy.cluster.hierarchy.dendrogram`).
