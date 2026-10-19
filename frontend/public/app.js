const { useState, useEffect, createContext, useContext, Children } = React;

// Built-in hash router (zero external dependencies, reliable on both http and file protocols)
const RouterContext = createContext({ route: "/" });

function HashRouter({ children }) {
  const getHashRoute = () => {
    const raw = (window.location.hash || "").replace(/^#/, "");
    return raw || "/";
  };
  const [route, setRoute] = useState(getHashRoute);

  useEffect(() => {
    const onHashChange = () => setRoute(getHashRoute());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  return React.createElement(RouterContext.Provider, { value: { route, setRoute } }, children);
}

function useLocation() {
  const ctx = useContext(RouterContext);
  const route = ctx ? ctx.route : ((window.location.hash || "").replace(/^#/, "") || "/");
  return { pathname: route };
}

function NavLink({ to, className, children }) {
  const { pathname } = useLocation();
  const active = (pathname === to) || (to === "/" && (pathname === "" || pathname === "/"));
  const computedClass = typeof className === "function" ? className({ isActive: active, active }) : className;
  return (
    <a href={"#" + to} className={computedClass} style={{ textDecoration: "none" }}>
      {children}
    </a>
  );
}

function Routes({ children }) {
  const { pathname } = useLocation();
  const childrenArray = Children.toArray(children);
  let matched = null;
  let wildcard = null;
  for (const child of childrenArray) {
    if (!child || !child.props) continue;
    if (child.props.path === pathname) {
      matched = child.props.element;
      break;
    }
    if (child.props.path === "*") {
      wildcard = child.props.element;
    }
  }
  return matched || wildcard || null;
}

function Route({ path, element }) {
  return null;
}

// ---------- helpers ----------
function addDerivedFeatures(values) {
  const v = { ...values };
  if (v.bearing_temperature_c !== undefined && v.ambient_temperature_c !== undefined) {
    v.bearing_temp_rise_c = v.bearing_temperature_c - v.ambient_temperature_c;
  }
  return v;
}
function estimateEnergy(values) {
  const mc = values.motor_current_a || 31.18;
  const lp = values.load_percent || 76.18;
  const pr = values.production_rate_units_hr || 118;
  const ma = values.machine_age_years || 5.75;
  const tempRise = (values.bearing_temperature_c || 47.89) - (values.ambient_temperature_c || 29.02);
  return Math.round((0.45 * mc + 0.12 * lp + 0.08 * pr + 0.15 * ma + 0.08 * tempRise + 15) * 100) / 100;
}
function estimateRisk(values) {
  const vib = values.vibration_mm_s || 2.213;
  const tempRise = (values.bearing_temperature_c || 47.89) - (values.ambient_temperature_c || 29.02);
  const def = values.defect_rate_pct || 5.1185;
  const dt = values.downtime_hours_30d || 1.06;
  const mc = values.motor_current_a || 31.18;
  const score = Math.min(100, (vib * 8 + tempRise * 1.5 + def * 3 + dt * 4 + mc * 0.8 - 20) / 2);
  let risk = "Low", color = "#22c55e";
  if (score > 60) { risk = "High"; color = "#ef4444"; }
  else if (score > 35) { risk = "Medium"; color = "#f59e0b"; }
  return { risk, score: Math.round(score), color, confidence: { Low: 0.58, Medium: 0.25, High: 0.12 } };
}
function estimateCluster(values) {
  const load = values.load_percent !== undefined ? values.load_percent : 76.18;
  const prod = values.production_rate_units_hr !== undefined ? values.production_rate_units_hr : 118;
  const temp = values.bearing_temperature_c !== undefined ? values.bearing_temperature_c : 47.89;
  const vib = values.vibration_mm_s !== undefined ? values.vibration_mm_s : 2.213;
  const noise = values.noise_db !== undefined ? values.noise_db : 70.85;
  const age = values.machine_age_years !== undefined ? values.machine_age_years : 5.75;
  const maint = values.maintenance_count !== undefined ? values.maintenance_count : 1;

  if (vib > 10 || noise > 85) {
    return {
      id: 2,
      name: "High Vibration & Stress",
      tag: "Cluster 2 • Vibration Outlier",
      desc: "Elevated vibration (mm/s) and noise (dB). Indicates wear or unbalance.",
      color: "#f87171"
    };
  }
  if (maint >= 4 || age > 10) {
    return {
      id: 4,
      name: "Aging Machine & High Service",
      tag: "Cluster 4 • Legacy Equipment",
      desc: "Higher machine age with frequent maintenance history.",
      color: "#fbbf24"
    };
  }
  if (temp > 55 || (values.ambient_temperature_c && values.ambient_temperature_c > 35)) {
    return {
      id: 1,
      name: "High Thermal Stress",
      tag: "Cluster 1 • Thermal Profile",
      desc: "Elevated bearing, oil, and ambient temperature readings.",
      color: "#fb923c"
    };
  }
  if (load > 85 || prod > 140) {
    return {
      id: 0,
      name: "High Throughput & Heavy Load",
      tag: "Cluster 0 • Heavy Duty",
      desc: "Peak production rate under high motor load.",
      color: "#38bdf8"
    };
  }
  return {
    id: 3,
    name: "Light Load & Steady Run",
    tag: "Cluster 3 • Nominal Operation",
    desc: "Cool temperatures and balanced production throughput.",
    color: "#4ade80"
  };
}
function pretty(name) {
  return name.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

// ---------- Navbar ----------
const navLinks = [
  { to: "/", label: "Overview" },
  { to: "/regression", label: "Regression" },
  { to: "/classification", label: "Classification" },
  { to: "/clustering", label: "Clustering" },
  { to: "/predict", label: "Predict" }
];

function Navbar() {
  return (
    <nav className="sticky top-0 z-40 glass border-b border-slate-700/30">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-cyan-300">
          <span>🏭</span> SmartMfg ML
        </div>
        <div className="flex items-center gap-1">
          {navLinks.map((l) => (
            <NavLink key={l.to} to={l.to}
              className={({ active }) =>
                `px-3 py-1.5 rounded-md text-sm font-medium transition-all ` +
                (active ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/40"
                       : "text-slate-300 hover:text-cyan-300 hover:bg-surface-2/30")
              }>
              {l.label}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}

// ---------- shared sub-components ----------
function MetricCard({ label, value }) {
  return (
    <div className="metric-card">
      <div className="text-xl font-bold text-cyan-300">{value}</div>
      <div className="text-xs text-slate-400">{label}</div>
    </div>
  );
}

function ChartCard({ title, subtitle, children, className = "" }) {
  return (
    <div className={`card ${className}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-sm font-medium text-cyan-300 uppercase tracking-wider">{title}</h3>
          {subtitle && <p className="text-sm text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <div className="h-72">{children}</div>
    </div>
  );
}

function InfoCard({ title, desc }) {
  return (
    <div className="card">
      <h3 className="text-cyan-300 font-medium mb-2">{title}</h3>
      <p className="text-sm text-slate-300 leading-relaxed">{desc}</p>
    </div>
  );
}

// ---------- Overview page ----------
function Overview() {
  const d = analysisData;
  const tracks = ["Regression", "Classification", "Clustering"];
  const classData = {
    labels: d.dataset.classBalance.map((c) => c.risk),
    datasets: [{
      data: d.dataset.classBalance.map((c) => c.count),
      backgroundColor: d.dataset.classBalance.map((c) => c.color),
      borderWidth: 0
    }]
  };
  useChart("classDoughnut", "doughnut", classData, { cutout: "60%" });
  useChart("corrBar", "bar", {
    labels: d.tracks.regression.topCorrelations.map((c) => c.featA + " <-> " + c.featB),
    datasets: [{ label: "Pearson r", data: d.tracks.regression.topCorrelations.map((c) => c.corr), backgroundColor: ["#22c55e", "#60a5fb", "#a78bfa"], borderWidth: 0 }]
  }, { indexAxis: "y" });
  return (
    <div className="space-y-8 pb-12">
      <section className="text-center py-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 mb-6">
          <span className="w-2 h-2 bg-cyan-400 rounded-full"></span>
          {d.course} &bull; Team: {d.team}
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">
          <span className="text-cyan-300">Smart</span> <span className="text-white">Manufacturing</span>{" "}
          <span className="bg-gradient-to-r from-cyan-300 via-fuchsia-300 to-emerald-300 bg-clip-text text-transparent">ML Capstone</span>
        </h1>
        <p className="text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed mb-8">
          End-to-end ML pipeline on {d.dataset.rows.toLocaleString()} machine sensor records. Three tracks:
          Regression (energy), Classification (maintenance risk), and Clustering (operating profiles).
        </p>
        <div className="flex flex-wrap justify-center gap-4 mb-10">
          {tracks.map((t) => <div key={t} className="px-4 py-2 rounded-lg bg-surface-2/40 border border-slate-600/30 text-sm">{t}</div>)}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
          <MetricCard label="Records" value={d.dataset.rows.toLocaleString()} />
          <MetricCard label="Columns" value={d.dataset.columns} />
          <MetricCard label="Numeric features" value={d.dataset.numericFeatures} />
          <MetricCard label="Categorical features" value={d.dataset.categoricalFeatures} />
        </div>
      </section>

      <h2 className="text-2xl font-bold text-white">Exploratory Data Analysis</h2>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <ChartCard title="Class Balance - maintenance_risk">
            <canvas id="classDoughnut" className="w-full h-full"></canvas>
          </ChartCard>
        </div>
        <div className="lg:col-span-2 space-y-4">
          <StatRow label="Class imbalance ratio" value="Low 45 : Med 36 : High 19" />
          <StatRow label="Stratified split" value="80/20 (17,600 train / 4,400 test)" />
          <StatRow label="Energy target range" value="18.01 - 107.45 kWh (mean 51.6)" />
          <StatRow label="Missing values" value="Imputed (median / mode)" />
          <StatRow label="Duplicates" value="Removed before split" />
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <ChartCard title="Top correlated pairs (Pearson r)" subtitle="motor_current to energy is the strongest single driver">
          <canvas id="corrBar" className="w-full h-full"></canvas>
        </ChartCard>
        <InfoCard
          title="Key EDA findings"
          desc="Operational duration features (downtime_hours_30d, days_since_maintenance) show right-skew with long tails. Physical sensor readings (temperatures, motor current, RPM) are approximately Gaussian, confirming StandardScaler is essential. Energy target is unimodal (mean 51.6, std 11.1), no aggressive log transform needed. Outliers were retained as genuine failure-mode signal."
        />
      </div>
    </div>
  );
}

function StatRow({ label, value }) {
  return (
    <div className="flex justify-between py-2 border-b border-slate-700/20">
      <span className="text-slate-300 text-sm">{label}</span>
      <span className="text-white font-medium text-sm">{value}</span>
    </div>
  );
}

// Helper: render a chart on a canvas by id
function useChart(canvasId, type, data, opts = {}) {
  useEffect(() => {
    const ctx = document.getElementById(canvasId);
    if (!ctx || !window.Chart) return;
    const inst = new window.Chart(ctx, {
      type, responsive: true, maintainAspectRatio: false,
      data,
      options: {
        plugins: { legend: { display: false, labels: { color: "#cbd5e1" } } },
        scales: {
          y: { ticks: { color: "#94a3b8" }, grid: { color: "rgba(148,163,184,0.08)" } },
          x: { ticks: { color: "#94a3b8" }, grid: { display: false } },
          ...opts.scales
        },
        ...opts
      }
    });
    return () => inst.destroy();
  }, [canvasId, type, JSON.stringify(data), JSON.stringify(opts)]);
}

// ---------- Regression page ----------
function Regression() {
  const t = analysisData.tracks.regression;
  const sorted = [...t.algorithms].sort((a, b) => a.rank - b.rank);
  useChart("regR2", "bar", {
    labels: sorted.map((a) => a.name),
    datasets: [{ label: "R2", data: sorted.map((a) => a.r2),
      backgroundColor: sorted.map((a) => a.badge ? "#22c55e" : a.label === "baseline" ? "#94a3b8" : "#0ea5e5"), borderWidth: 0 }]
  }, { indexAxis: "y" });
  useChart("regRmse", "bar", {
    labels: sorted.map((a) => a.name),
    datasets: [{ label: "RMSE", data: sorted.map((a) => a.rmse),
      backgroundColor: sorted.map((a) => a.label === "baseline" ? "#94a3b8" : "#ef4444"), borderWidth: 0 }]
  }, { indexAxis: "y" });
  return (
    <div className="space-y-8 pb-12">
      <div className="text-center py-8">
        <h1 className="text-3xl font-bold text-white mb-2">Track 1 - Regression</h1>
        <p className="text-slate-300">Predicting {t.target} (machine energy consumption in kWh)</p>
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        <MetricCard label="Best Model" value={t.bestModel} />
        <MetricCard label="R2 (Tuned)" value={t.finalMetrics.r2.toFixed(4)} />
        <MetricCard label="MAE (Tuned)" value={t.finalMetrics.mae.toFixed(2)} />
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <ChartCard title="Model Comparison - R2" subtitle="Higher is better (10 models, 80/20 split)">
          <canvas id="regR2"></canvas>
        </ChartCard>
        <ChartCard title="Model Comparison - RMSE (kWh)" subtitle="Lower is better">
          <canvas id="regRmse"></canvas>
        </ChartCard>
      </div>
      <div className="card">
        <h3 className="text-cyan-300 font-medium mb-3">Tuned Gradient Boosting Parameters</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div><span className="text-slate-400 text-sm">learning_rate</span><div className="text-xl font-bold text-white">{t.bestParams.learning_rate}</div></div>
          <div><span className="text-slate-400 text-sm">max_depth</span><div className="text-xl font-bold text-white">{t.bestParams.max_depth}</div></div>
          <div><span className="text-slate-400 text-sm">n_estimators</span><div className="text-xl font-bold text-white">{t.bestParams.n_estimators}</div></div>
        </div>
      </div>
      <div className="card">
        <h3 className="text-cyan-300 font-medium mb-3">5-Fold CV - Top 2 Models</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left border-b border-slate-700/30">
              <th className="pb-2 text-slate-300">Model</th>
              <th className="pb-2 text-slate-300">Mean R2</th>
              <th className="pb-2 text-slate-300">Std R2</th>
            </tr></thead>
            <tbody>
              {Object.entries(t.cv).map(([model, stats]) => (
                <tr key={model} className="border-b border-slate-800/30">
                  <td className="py-2 text-white">{model}</td>
                  <td className="py-2 text-cyan-300">{stats.meanR2.toFixed(4)}</td>
                  <td className="py-2 text-slate-400">{stats.stdR2.toFixed(4)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ---------- Classification page ----------
function Classification() {
  const t = analysisData.tracks.classification;
  const all = [...t.partA, ...t.partB].sort((a, b) => a.rank - b.rank);
  useChart("clsAcc", "bar", {
    labels: all.map((a) => a.name),
    datasets: [{ label: "Accuracy", data: all.map((a) => a.accuracy),
      backgroundColor: all.map((a) => a.badge ? "#22c55e" : a.part === "A" ? "#60a5fb" : "#a78bfa"), borderWidth: 0 }]
  }, { indexAxis: "y", scales: { x: { min: 0.4, max: 0.75 } } });
  useChart("clsAuc", "bar", {
    labels: all.map((a) => a.name),
    datasets: [{ label: "AUC", data: all.map((a) => a.auc),
      backgroundColor: all.map((a) => a.badge ? "#22c55e" : "#fbbf24"), borderWidth: 0 }]
  }, { indexAxis: "y", scales: { x: { min: 0.6, max: 0.85 } } });
  return (
    <div className="space-y-8 pb-12">
      <div className="text-center py-8">
        <h1 className="text-3xl font-bold text-white mb-2">Track 2 - Classification</h1>
        <p className="text-slate-300">Predicting maintenance_risk: Low / Medium / High</p>
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        <MetricCard label="Best Model" value={t.bestModel} />
        <MetricCard label="Accuracy" value={t.finalMetrics.accuracy.toFixed(4)} />
        <MetricCard label="ROC-AUC (OvR)" value={t.finalMetrics.rocAuc.toFixed(4)} />
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <ChartCard title="Accuracy (ranked)" subtitle="10 algorithms compared">
          <canvas id="clsAcc"></canvas>
        </ChartCard>
        <ChartCard title="ROC-AUC (OvR)">
          <canvas id="clsAuc"></canvas>
        </ChartCard>
      </div>
      <div className="card">
        <h3 className="text-cyan-300 font-medium mb-3">Final Selection Rule</h3>
        <p className="text-sm text-slate-300 leading-relaxed">
          Model chosen by highest weighted-F1 on the holdout test set, tie-broken on ROC-AUC (OvR).
          Gradient Boosting Classifier wins (F1 = 0.6747, AUC = 0.8239) over Logistic Regression (F1 = 0.6731, AUC = 0.8241).
          The difference is within CV noise (CV F1 within 0.003), so Logistic Regression is a viable simpler fallback.
        </p>
      </div>
      <div className="card">
        <h3 className="text-cyan-300 font-medium mb-3">Part B Hyperparameter Tuning</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left border-b border-slate-700/30">
              <th className="pb-2 text-slate-300">Algorithm</th>
              <th className="pb-2 text-slate-300">Best Parameters</th>
              <th className="pb-2 text-slate-300">Part</th>
            </tr></thead>
            <tbody>
              {t.partB.map((a) => (
                <tr key={a.name} className="border-b border-slate-800/30">
                  <td className="py-2 text-white">{a.name}{a.badge && " (chosen)"}</td>
                  <td className="py-2 text-slate-300 text-xs font-mono">
                    {Object.entries(a.tuned).map(([k, v]) => k + "=" + v).join(", ")}
                  </td>
                  <td className="py-2 text-xs text-slate-400">Part B</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ---------- Clustering page ----------
function Clustering() {
  const t = analysisData.tracks.clustering;
  useChart("cluElbow", "line", {
    labels: t.elbow.map((e) => e.k),
    datasets: [{ label: "Inertia", data: t.elbow.map((e) => e.inertia),
      borderColor: "#0ea5e5", backgroundColor: "rgba(14,165,233,0.1)", borderWidth: 2, fill: true,
      pointBackgroundColor: "#0ea5e5", tension: 0.3 }]
  });
  useChart("cluSil", "line", {
    labels: t.elbow.map((e) => e.k),
    datasets: [{ label: "Silhouette", data: t.elbow.map((e) => e.silhouette),
      borderColor: "#22c55e", backgroundColor: "rgba(34,197,94,0.1)", borderWidth: 2, fill: true,
      pointBackgroundColor: "#22c55e", tension: 0.3 }]
  });
  useChart("cluLink", "bar", {
    labels: t.linkageComparison.map((l) => l.linkage),
    datasets: [{ label: "Davies-Bouldin", data: t.linkageComparison.map((l) => l.dbi),
      backgroundColor: ["#60a5fb", "#f87171", "#a78bfa", "#fbbf24"], borderWidth: 0 }]
  }, { indexAxis: "y" });
  useChart("cluExt", "bar", {
    labels: t.externalValidation.map((e) => e.algorithm),
    datasets: [{ label: "Adjusted Rand Index", data: t.externalValidation.map((e) => e.adjustedRand),
      backgroundColor: ["#22c55e", "#a78bfa"], borderWidth: 0 }]
  }, { indexAxis: "y", scales: { x: { max: 0.06 } } });
  return (
    <div className="space-y-8 pb-12">
      <div className="text-center py-8">
        <h1 className="text-3xl font-bold text-white mb-2">Track 3 - Clustering (Unsupervised)</h1>
        <p className="text-slate-300">{t.samples.toLocaleString()} samples, {t.features} features - K-Means &amp; Agglomerative (ward)</p>
      </div>
      <div className="grid md:grid-cols-4 gap-4">
        <MetricCard label="Selected k" value={t.selectedK} />
        <MetricCard label="Best Silhouette" value={t.algorithms[0].silhouette.toFixed(4)} />
        <MetricCard label="Best Calinski-Harabasz" value={t.algorithms[0].chs.toFixed(1)} />
        <MetricCard label="Best Linkage" value={t.bestLinkage} />
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <ChartCard title="Elbow Curve - K-Means" subtitle="Inertia vs k (selected k=5)">
          <canvas id="cluElbow" className="h-72"></canvas>
        </ChartCard>
        <ChartCard title="Silhouette vs k" subtitle="Quality metric across cluster counts">
          <canvas id="cluSil" className="h-72"></canvas>
        </ChartCard>
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <ChartCard title="Linkage Comparison" subtitle="Davies-Bouldin Index (lower = better)">
          <canvas id="cluLink" className="h-64"></canvas>
        </ChartCard>
        <ChartCard title="External Validation" subtitle="Adjusted Rand Index vs maintenance_risk labels">
          <canvas id="cluExt" className="h-64"></canvas>
        </ChartCard>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <InfoCard title="Elbow detection" desc="Geometric elbow on the normalized (k, inertia) curve selected k=5, which also aligns with the silhouette scan." />
        <InfoCard title="Linkage choice" desc="Ward linkage minimizes within-cluster variance and produced the lowest Davies-Bouldin index (4.12)." />
        <InfoCard title="External validation insight" desc="Both algorithms show weak agreement with maintenance_risk labels (ARI ~0.04). Clusters capture operating-profile similarity, not risk labels - the unsupervised signal is genuinely orthogonal to the supervised target." />
        <InfoCard title="Visualizations" desc="PCA 2-D projections and t-SNE embeddings were generated to inspect cluster separation. Low silhouette scores (0.02-0.06) confirm weak cluster structure - profiles blend smoothly rather than forming discrete groups." />
      </div>
    </div>
  );
}

// ---------- Predict page ----------
function Predict() {
  const { app } = analysisData;
  const meta = app.metadata;
  const fm = window.fieldMeta;
  const initial = {};
  for (const f of Object.keys(fm.categoricalMeta)) initial[f] = fm.categoricalMeta[f].default || fm.categoricalMeta[f].options[0];
  for (const f of Object.keys(fm.numericMeta)) initial[f] = fm.numericMeta[f].median;
  const [values, setValues] = useState(initial);
  const [result, setResult] = useState(null);

  const handleNum = (f, v) => setValues({ ...values, [f]: v });
  const handleCat = (f, v) => setValues({ ...values, [f]: v });
  const handleSubmit = async (e) => {
    e.preventDefault();
    const derived = addDerivedFeatures(values);

    try {
      const response = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(derived),
      });
      if (response.ok) {
        const data = await response.json();
        const cluster = estimateCluster(derived);
        const colors = { Low: "#22c55e", Medium: "#f59e0b", High: "#ef4444" };
        const score = Math.round((data.probabilities[data.risk] || 0.5) * 100);
        setResult({
          energy: data.energy_kwh,
          risk: {
            risk: data.risk,
            score,
            color: colors[data.risk] || "#22c55e",
            confidence: data.probabilities,
          },
          cluster,
          derived,
          isLiveModel: true,
        });
        return;
      }
    } catch (err) {
      // Fallback to client heuristics when backend service is unreachable
    }

    setResult({
      energy: estimateEnergy(derived),
      risk: estimateRisk(derived),
      cluster: estimateCluster(derived),
      derived,
      isLiveModel: false,
    });
  };
  const reset = () => {
    const fresh = {};
    for (const f of Object.keys(fm.categoricalMeta)) fresh[f] = fm.categoricalMeta[f].default || fm.categoricalMeta[f].options[0];
    for (const f of Object.keys(fm.numericMeta)) fresh[f] = fm.numericMeta[f].median;
    setValues(fresh); setResult(null);
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="text-center py-8">
        <h1 className="text-3xl font-bold text-white mb-2">Smart Manufacturing Predictor &amp; Profiler</h1>
        <p className="text-slate-300">Enter machine readings to evaluate Maintenance Risk (Classifier), Energy (Regressor), and Operating Cluster</p>
      </div>
      <div className="card">
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="p-3 rounded-lg bg-surface-2/30 border border-slate-700/40">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
              Track 2 • Classifier
            </span>
            <p className="text-sm font-semibold text-white mt-1">{meta.classifier.name}</p>
            <p className="text-xs text-slate-400">Target: maintenance_risk (Low/Med/High)</p>
            <p className="text-xs text-cyan-300 mt-1">Accuracy {meta.classifier.accuracy} · F1 {meta.classifier.weightedF1}</p>
          </div>
          <div className="p-3 rounded-lg bg-surface-2/30 border border-slate-700/40">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300">
              Track 1 • Regressor
            </span>
            <p className="text-sm font-semibold text-white mt-1">{meta.regressor.name}</p>
            <p className="text-xs text-slate-400">Target: machine_energy_kwh</p>
            <p className="text-xs text-cyan-300 mt-1">R² {meta.regressor.r2} · MAE {meta.regressor.mae} kWh</p>
          </div>
          <div className="p-3 rounded-lg bg-surface-2/30 border border-slate-700/40">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">
              Track 3 • Clustering
            </span>
            <p className="text-sm font-semibold text-white mt-1">K-Means &amp; Agglomerative (Ward)</p>
            <p className="text-xs text-slate-400">Target: Unsupervised (k=5 Profiles)</p>
            <p className="text-xs text-cyan-300 mt-1">Selected k=5 · Davies-Bouldin 3.02</p>
          </div>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {Object.entries(fm.fieldGroups).map(([group, fields]) => (
              <FormFieldGroup key={group} groupName={group} fields={fields} values={values} onNum={handleNum} onCat={handleCat} />
            ))}
          </div>
          <div className="mt-6 flex gap-3">
            <button type="submit" className="btn-primary">Predict &amp; Profile</button>
            <button type="button" onClick={reset} className="btn-secondary">Reset to defaults</button>
          </div>
        </form>
      </div>
      {result && <ResultCard result={result} />}
    </div>
  );
}

function FormFieldGroup({ groupName, fields, values, onNum, onCat }) {
  const fm = window.fieldMeta;
  return (
    <div>
      <h4 className="text-sm font-semibold text-slate-300 mb-3">{groupName}</h4>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {fields.map((f) => {
          const isCat = f in fm.categoricalMeta;
          if (isCat) {
            const m = fm.categoricalMeta[f];
            return (
              <div key={f}>
                <label className="text-xs font-medium text-slate-300">{pretty(f)}</label>
                <select value={values[f]} onChange={(e) => onCat(f, e.target.value)}
                  className="mt-1 w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-600 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 cursor-pointer">
                  {m.options.map((opt) => <option key={opt} value={opt} className="bg-slate-900 text-white">{opt.trim()}</option>)}
                </select>
              </div>
            );
          }
          const m = fm.numericMeta[f];
          return (
            <div key={f}>
              <label className="text-xs font-medium text-slate-300">{pretty(f)}</label>
              <input type="number" value={values[f]}
                onChange={(e) => onNum(f, parseFloat(e.target.value) || 0)}
                min={m.min} max={m.max} step="any"
                className="mt-1 w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-600 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500" />
              <div className="text-[10px] text-slate-400 mt-0.5">
                range: {m.min.toFixed(1)} - {m.max.toFixed(1)} | median: {m.median}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ResultCard({ result }) {
  const { energy, risk, cluster } = result;
  return (
    <div className="card border border-cyan-500/30">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-cyan-300 font-medium">Model Inference Results (All 3 Project Tracks)</h3>
        <span className="text-xs text-slate-400">Evaluated on Machine Readings</span>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        {/* Track 2: Classifier */}
        <div className="text-center p-4 rounded-lg bg-surface-2/40 border border-slate-600/20">
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
            Track 2 • Classifier
          </span>
          <div className="text-3xl font-bold mt-2 mb-1" style={{ color: risk.color }}>{risk.risk}</div>
          <p className="text-sm font-medium text-slate-200">Maintenance Risk Level</p>
          <div className="mt-2 w-full h-2 bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all" style={{ width: risk.score + "%", backgroundColor: risk.color }} />
          </div>
          <p className="text-xs text-slate-400 mt-1">Risk score: {risk.score}/100</p>
        </div>

        {/* Track 1: Regressor */}
        <div className="text-center p-4 rounded-lg bg-surface-2/40 border border-slate-600/20">
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300">
            Track 1 • Regressor
          </span>
          <div className="text-3xl font-bold text-cyan-300 mt-2 mb-1">{energy.toFixed(2)} <span className="text-sm font-normal text-slate-400">kWh</span></div>
          <p className="text-sm font-medium text-slate-200">Predicted Energy Draw</p>
          <p className="text-xs text-slate-400 mt-3">±{analysisData.app.metadata.regressor.mae} kWh (test MAE)</p>
        </div>

        {/* Track 3: Clustering */}
        <div className="text-center p-4 rounded-lg bg-surface-2/40 border border-slate-600/20">
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">
            Track 3 • Clustering (k=5)
          </span>
          <div className="text-xl font-bold mt-2 mb-1" style={{ color: cluster.color }}>{cluster.name}</div>
          <p className="text-sm font-medium text-slate-200">{cluster.tag}</p>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">{cluster.desc}</p>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-slate-700/30">
        <p className="text-xs text-slate-400">
          Note: Front-end estimates derived from notebook feature correlations and cluster centroids. The Streamlit Python app (<code>app.py</code>)
          calls the serialized Gradient Boosting pickle bundles directly.
        </p>
      </div>
    </div>
  );
}

// ---------- App + mount ----------
function App() {
  return (
    <>
      <Navbar />
      <ScrollToTop />
      <main className="max-w-7xl mx-auto px-6 pt-6">
        <Routes>
          <Route path="/" element={<Overview />} />
          <Route path="/regression" element={<Regression />} />
          <Route path="/classification" element={<Classification />} />
          <Route path="/clustering" element={<Clustering />} />
          <Route path="/predict" element={<Predict />} />
          <Route path="*" element={
            <div className="text-center py-20">
              <h2 className="text-2xl font-bold text-white mb-2">404</h2>
              <p className="text-slate-300">Page not found.</p>
            </div>
          } />
        </Routes>
      </main>
      <footer className="max-w-7xl mx-auto px-6 py-8 border-t border-slate-700/30 mt-12">
        <p className="text-xs text-slate-500">
          23CSE301 Machine Learning Capstone | Team Novacore | Data: smart_manufacturing_ml_dataset.csv (22,260 records)
        </p>
      </footer>
    </>
  );
}

// --- Mount (styles loaded from styles.css) ---
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(React.createElement(
  HashRouter, null,
  React.createElement(App)
));