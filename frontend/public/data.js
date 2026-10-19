// Data compiled from Review2_Final.ipynb (22,260 records, AY 2026-27)
const analysisData = {
  project: "Smart Manufacturing ML Case Study",
  course: "23CSE301 - Machine Learning Capstone",
  team: "Novacore",
  randomState: 42,
  dataset: {
    rows: 22260, columns: 30,
    file: "smart_manufacturing_ml_dataset.csv",
    numericFeatures: 22, categoricalFeatures: 8,
    targets: ["machine_energy_kwh", "maintenance_risk"],
    trainSplit: "80/20", trainRows: 17600, testRows: 4400,
    classBalance: [
      { risk: "Low", count: 9958, pct: 44.7, color: "#22c55e" },
      { risk: "Medium", count: 8125, pct: 36.5, color: "#f59e0b" },
      { risk: "High", count: 4177, pct: 18.8, color: "#ef4444" }
    ],
    energyStats: { mean: 51.57, std: 11.14, min: 18.01, q25: 43.76, median: 50.84, q75: 58.56, max: 107.45 }
  },
  tracks: {
    regression: {
      target: "machine_energy_kwh", algorithmCount: 10,
      algorithms: [
        { name: "Gradient Boosting Regressor", r2: 0.8322, rmse: 4.5696, mae: 3.6617, rank: 1, badge: "best" },
        { name: "Random Forest Regressor",     r2: 0.8197, rmse: 4.7360, mae: 3.7987, rank: 2 },
        { name: "Support Vector Regressor (SVR)", r2: 0.8103, rmse: 4.8582, mae: 3.8530, rank: 3 },
        { name: "Polynomial Regression (Deg 2)", r2: 0.7684, rmse: 5.3682, mae: 4.1426, rank: 4 },
        { name: "Lasso Regression",             r2: 0.7530, rmse: 5.5431, mae: 4.1399, rank: 5 },
        { name: "Linear Regression",            r2: 0.7530, rmse: 5.5433, mae: 4.1389, rank: 6, label: "baseline" },
        { name: "Ridge Regression",             r2: 0.7530, rmse: 5.5433, mae: 4.1389, rank: 7 },
        { name: "ElasticNet",                   r2: 0.7528, rmse: 5.5454, mae: 4.1452, rank: 8 },
        { name: "Decision Tree Regressor",      r2: 0.6263, rmse: 6.8184, mae: 5.4260, rank: 9 },
        { name: "KNN Regressor",                r2: 0.4780, rmse: 8.0588, mae: 6.3205, rank: 10 }
      ],
      cv: {
        "Gradient Boosting": { meanR2: 0.8267, stdR2: 0.0045 },
        "Random Forest":     { meanR2: 0.8152, stdR2: 0.0047 }
      },
      bestModel: "Gradient Boosting Regressor",
      bestParams: { learning_rate: 0.1, max_depth: 2, n_estimators: 200 },
      finalMetrics: { r2: 0.8334, rmse: 4.5532, mae: 3.6459 },
      topCorrelations: [
        { featA: "motor_current_a", featB: "machine_energy_kwh", corr: 0.772 },
        { featA: "production_rate_units_hr", featB: "load_percent", corr: 0.780 },
        { featA: "ambient_temperature_c", featB: "bearing_temperature_c", corr: 0.749 }
      ]
    },
    classification: {
      target: "maintenance_risk", algorithmCount: 10,
      partA: [
        { name: "Logistic Regression",    accuracy: 0.6759, f1: 0.6731, auc: 0.8241, rank: 2, part: "A" },
        { name: "K-Nearest Neighbors",    accuracy: 0.5430, f1: 0.5276, auc: 0.6931, rank: 10, part: "A" },
        { name: "Gaussian Naive Bayes",   accuracy: 0.6527, f1: 0.6429, auc: 0.8007, rank: 9, part: "A" },
        { name: "Decision Tree",          accuracy: 0.6536, f1: 0.6531, auc: 0.7957, rank: 8, part: "A" },
        { name: "Support Vector Machine", accuracy: 0.6645, f1: 0.6597, auc: 0.8125, rank: 6, part: "A" }
      ],
      partB: [
        { name: "Random Forest",       accuracy: 0.6709, f1: 0.6639, auc: 0.8192, rank: 5, part: "B", tuned: { max_depth: 15, n_estimators: 300 } },
        { name: "AdaBoost",            accuracy: 0.6709, f1: 0.6709, auc: 0.7863, rank: 3, part: "B", tuned: { estimator_max_depth: 2, learning_rate: 0.5, n_estimators: 200 } },
        { name: "Gradient Boosting",   accuracy: 0.6773, f1: 0.6747, auc: 0.8239, rank: 1, part: "B", badge: "best", tuned: { learning_rate: 0.1, max_depth: 2, n_estimators: 200 } },
        { name: "Bagging",             accuracy: 0.6716, f1: 0.6683, auc: 0.8184, rank: 4, part: "B", tuned: { estimator_max_depth: 10, max_samples: 0.7, n_estimators: 100 } },
        { name: "MLP Neural Network",  accuracy: 0.6591, f1: 0.6580, auc: 0.8069, rank: 7, part: "B", tuned: { activation: "tanh", alpha: 0.01, hidden: "128,64" } }
      ],
      cv: {
        "Gradient Boosting Classifier": { meanAcc: 0.6707, meanF1: 0.6676 },
        "Logistic Regression":        { meanAcc: 0.6736, meanF1: 0.6703 }
      },
      finalMetrics: { accuracy: 0.6773, weightedF1: 0.6747, rocAuc: 0.8239 },
      labelEncoder: ["High", "Low", "Medium"],
      bestModel: "Gradient Boosting Classifier"
    },
    clustering: {
      samples: 4000, features: 20,
      algorithms: [
        { name: "K-Means (k=5)",             silhouette: 0.0564, dbi: 3.0154, chs: 203.3723, rank: 1, badge: "best" },
        { name: "Agglomerative (ward, k=5)", silhouette: 0.0214, dbi: 4.1216, chs: 106.4723, rank: 2 }
      ],
      elbow: [
        { k: 2, inertia: 73755.20, silhouette: 0.0737, dbi: 3.3838, chs: 338.5089 },
        { k: 3, inertia: 70683.74, silhouette: 0.0585, dbi: 3.2978, chs: 263.4067 },
        { k: 4, inertia: 68183.79, silhouette: 0.0587, dbi: 3.0448, chs: 230.8413 },
        { k: 5, inertia: 66465.94, silhouette: 0.0564, dbi: 3.0154, chs: 203.3723 },
        { k: 6, inertia: 64966.95, silhouette: 0.0508, dbi: 3.0420, chs: 184.8386 },
        { k: 7, inertia: 63612.83, silhouette: 0.0524, dbi: 2.9105, chs: 171.4381 },
        { k: 8, inertia: 62534.02, silhouette: 0.0503, dbi: 2.8750, chs: 159.2829 },
        { k: 9, inertia: 61634.49, silhouette: 0.0486, dbi: 2.7813, chs: 148.6521 },
        { k: 10, inertia: 60669.69, silhouette: 0.0501, dbi: 2.6905, chs: 141.2530 }
      ],
      selectedK: 5,
      linkageComparison: [
        { linkage: "ward",    copheneticCorr: 0.2256, smallestCluster: 6.975, silhouette: 0.0214, dbi: 4.1216, chs: 106.4723 },
        { linkage: "complete", copheneticCorr: 0.1882, smallestCluster: 5.750, silhouette: 0.0081, dbi: 4.9327, chs: 88.3039 },
        { linkage: "average",  copheneticCorr: 0.4512, smallestCluster: 0.025, silhouette: 0.1252, dbi: 1.1532, chs: 4.7516 },
        { linkage: "single",   copheneticCorr: 0.5497, smallestCluster: 0.025, silhouette: 0.1489, dbi: 0.6222, chs: 2.6403 }
      ],
      bestLinkage: "ward",
      externalValidation: [
        { algorithm: "K-Means (k=5)", adjustedRand: 0.0082, normMutualInfo: 0.0062 },
        { algorithm: "Agglomerative (ward, k=5)", adjustedRand: 0.0414, normMutualInfo: 0.0589 }
      ],
      overallRiskMix: { Low: 45.2, Medium: 36.0, High: 18.8 }
    }
  },
  featureEngineering: {
    derivedFeature: "bearing_temp_rise_c",
    formula: "bearing_temperature_c - ambient_temperature_c",
    description: "Thermal headroom between bearing and ambient - a physical indicator of machine heat stress."
  },
  preprocessing: {
    missingImputation: "Median (numeric) / Mode (categorical)",
    scaling: "StandardScaler (fitted on train split only)",
    encoding: "LabelEncoder for target; OrdinalEncoder for categorical features",
    rationale: "Label over one-hot to avoid column expansion (curse of dimensionality).",
    trainSplit: "80/20 stratified",
    allRandom: 42
  },
  app: {
    metadata: {
      classifier: { name: "Gradient Boosting Classifier", accuracy: 0.6773, weightedF1: 0.6747, rocAuc: 0.8239 },
      regressor:  { name: "Gradient Boosting Regressor (tuned)", r2: 0.8334, rmse: 4.5532, mae: 3.6459 },
      versions: { python: "3.12.5", scikitLearn: "1.8.0", numpy: "2.1.3", pandas: "2.2.3" }
    }
  },
  resultsFiles: [
    "results/classification_comparison_all_10.csv",
    "results/classification_top2_cv.csv",
    "results/clustering_metrics.csv",
    "results/clustering_external_validation.csv",
    "results/agglomerative_linkage_comparison.csv",
    "results/final_model_tuning_effect.csv",
    "results/part_b_tuning_summary.csv"
  ]
};
window.analysisData = analysisData;
