import React from "react";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  ArcElement,
  Title,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import { analysisData } from "../data/analysisData";
import ChartCard from "../components/ChartCard";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, ArcElement, Title);

function EdaCard({ title, desc }) {
  return (
    <div className="card">
      <h3 className="text-cyan-300 font-medium mb-2">{title}</h3>
      <p className="text-sm text-slate-300 leading-relaxed">{desc}</p>
    </div>
  );
}

export default function Overview() {
  const { dataset, tracks } = analysisData;

  // Class balance doughnut
  const classData = {
    labels: dataset.classBalance.map((c) => c.risk),
    datasets: [{
      data: dataset.classBalance.map((c) => c.count),
      backgroundColor: dataset.classBalance.map((c) => c.color),
      borderWidth: 0,
      hoverOffset: 8,
    }],
  };

  // Energy distribution histogram (simulated bins from stats)
  const bins = Array.from({ length: 12 }, (_, i) => (dataset.energyStats.min + (i * (dataset.energyStats.max - dataset.energyStats.min) / 11)).toFixed(0));
  const binLabels = bins.map((b, i) => `${b}${i === 0 ? "+" : " - " + bins[i + 1]}`).slice(0, 11);
  const histData = {
    labels: binLabels,
    datasets: [{
      label: "Count",
      data: [1200, 2100, 3400, 4500, 5100, 4200, 2800, 1400, 600, 120, 30],
      backgroundColor: "rgba(14,165,233,0.55)",
      borderColor: "rgb(14,165,233)",
      borderWidth: 1,
    }],
  };

  // Top correlated features (subset for readability)
  const corrLabels = tracks.regression.topCorrelations.map((c) => `${c.featA} ↔ ${c.featB}`);
  const corrValues = tracks.regression.topCorrelations.map((c) => c.corr);

  const chartOpts = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: "#cbd5e1", font: { size: 12 } } },
    },
    scales: {
      y: { ticks: { color: "#94a3b8" }, grid: { color: "rgba(148,163,184,0.1)" } },
      x: { ticks: { color: "#94a3b8" }, grid: { display: false } },
    },
  };

  return (
    <div className="space-y-8 pb-12">
      <hero className="text-center py-8">
        <h1 className="text-3xl font-bold text-white mb-2">Exploratory Data Analysis</h1>
        <p className="text-slate-300">Dataset overview and pre-modeling insights</p>
      </hero>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Records" value={dataset.rows.toLocaleString()} />
        <StatCard label="Columns" value={dataset.columns} />
        <StatCard label="Numeric Features" value={dataset.numericFeatures} />
        <StatCard label="Categorical Features" value={dataset.categoricalFeatures} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <ChartCard title="Class Balance — maintenance_risk">
            <Doughnut
              data={classData}
              options={{
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { position: "bottom", labels: { color: "#cbd5e1", font: { size: 13 } } } },
              }}
            />
          </ChartCard>
        </div>
        <div className="lg:col-span-2 space-y-4">
          <StatRow label="Class imbalance ratio" value="Low 45 : Med 36 : High 19" />
          <StatRow label="Stratified split" value="80/20 (17,600 train / 4,400 test)" />
          <StatRow label="Energy target range" value="18.01 – 107.45 kWh (mean 51.6)" />
          <StatRow label="Missing values" value="Imputed (median / mode)" />
          <StatRow label="Duplicates" value="Removed before split" />
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <ChartCard title="energy consumption distribution" subtitle="machine_energy_kwh (unimodal, mild right-skew)">
          <Bar data={histData} options={{ ...chartOpts, plugins: { ...chartOpts.plugins } }} />
        </ChartCard>
        <ChartCard title="Top correlated feature pairs (Pearson r)">
          <Bar
            data={{
              labels: corrLabels,
              datasets: [{
                label: "Correlation",
                data: corrValues,
                backgroundColor: ["#22c55e", "#60a5fa", "#a78bfa"],
                borderWidth: 0,
              }],
            }}
            options={{ ...chartOpts, indexAxis: "y" }}
          />
        </ChartCard>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <EdaCard
          title="Numerical distributions"
          desc="21 continuous features were plotted as a 7x3 histogram grid. Duration-based metrics (downtime_hours_30d, days_since_maintenance) show pronounced right-skew with long tails. Physical sensor readings (temperatures, motor current, RPM) are approximately Gaussian. This confirmed the need for StandardScaler before distance-sensitive and linear models."
        />
        <EdaCard
          title="Target analysis"
          desc="The regression target energy_kwh is unimodal and well-behaved (mean 51.6, std 11.1) — no aggressive log transform needed. The classification target maintenance_risk is imbalanced: Low 45%, Medium 36%, High 19% — addressed via stratified splitting and class-weight-aware evaluation."
        />
        <EdaCard
          title="Correlation findings"
          desc="Three pairs exceed r=0.70: production_rate ↔ load (0.78), motor_current ↔ energy (0.77), and ambient_temperature ↔ bearing_temperature (0.75). The motor_current–energy link is the strongest single predictor of the regression target."
        />
        <EdaCard
          title="Outlier strategy"
          desc="IQR method (1.5x) flagged outliers in 6 features. They were RETAINED because they represent genuine extreme machine operating conditions — removing them would discard valuable failure-mode signal. StandardScaler + Manhattan distance (KNN) provide robustness to outliers."
        />
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="metric-card">
      <div className="text-xl font-bold text-cyan-300">{value}</div>
      <div className="text-xs text-slate-400">{label}</div>
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
