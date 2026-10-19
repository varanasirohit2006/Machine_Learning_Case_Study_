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

export default function Classification() {
  const t = analysisData.tracks.classification;
  const all = [...t.partA, ...t.partB].sort((a, b) => a.rank - b.rank);

  // Accuracy bar chart
  const accData = {
    labels: all.map((a) => a.name),
    datasets: [{
      label: "Accuracy",
      data: all.map((a) => a.accuracy),
      backgroundColor: all.map((a) =>
        a.badge ? "#22c55e" : a.part === "A" ? "#60a5fb" : "#a78bfa"
      ),
      borderWidth: 0,
      barPercentage: 0.65,
    }],
  };

  // AUC comparison
  const aucData = {
    labels: all.map((a) => a.name),
    datasets: [{
      label: "ROC-AUC (OvR)",
      data: all.map((a) => a.auc),
      backgroundColor: all.map((a) => a.badge ? "#22c55e" : "#fbbf24"),
      borderWidth: 0,
      barPercentage: 0.65,
    }],
  };

  // Part split doughnut
  const partData = {
    labels: ["Part A (5 models)", "Part B (5 models)"],
    datasets: [{
      data: [t.partA.length, t.partB.length],
      backgroundColor: ["#60a5fb", "#a78bfa"],
      borderWidth: 0,
    }],
  };

  const chartOpts = {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { ticks: { color: "#cbd5e1", font: { size: 11 } }, grid: { display: false } },
      x: { ticks: { color: "#94a3b8", font: { size: 11 } }, grid: { color: "rgba(148,163,184,0.08)" }, min: 0.4, max: 0.75 },
    },
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="text-center py-8">
        <h1 className="text-3xl font-bold text-white mb-2">Track 2 — Classification</h1>
        <p className="text-slate-300">Predicting maintenance_risk: Low / Medium / High</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <MetricCard label="Best Model" value={t.bestModel} />
        <MetricCard label="Accuracy" value={t.finalMetrics.accuracy.toFixed(4)} />
        <MetricCard label="ROC-AUC (OvR)" value={t.finalMetrics.rocAuc.toFixed(4)} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <ChartCard title="Algorithm split">
          <Doughnut
            data={partData}
            options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "bottom", labels: { color: "#cbd5e1" } } } }}
          />
        </ChartCard>
        <ChartCard title="Accuracy (ranked)" subtitle="10 algorithms compared">
          <Bar data={accData} options={chartOpts} />
        </ChartCard>
        <ChartCard title="ROC-AUC (OvR)">
          <Bar data={aucData} options={chartOpts} />
        </ChartCard>
      </div>

      <div className="card">
        <h3 className="text-cyan-300 font-medium mb-3">Final Selection Rule</h3>
        <p className="text-sm text-slate-300 leading-relaxed">
          Model was chosen by highest weighted-F1 on the holdout test set, with tie-break on ROC-AUC (OvR).
          Gradient Boosting Classifier wins (F1 = 0.6747, AUC = 0.8239) over Logistic Regression (F1 = 0.6731, AUC = 0.8241).
          The difference is within cross-validation noise (CV F1 within 0.003), so the simpler linear model is a near-equivalent fallback.
        </p>
      </div>

      <div className="card">
        <h3 className="text-cyan-300 font-medium mb-3">Part B Hyperparameter Tuning</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-slate-700/30">
                <th className="pb-2 text-slate-300">Algorithm</th>
                <th className="pb-2 text-slate-300">Best Parameters</th>
                <th className="pb-2 text-slate-300">F1 Improvement</th>
              </tr>
            </thead>
            <tbody>
              {t.partB.map((a) => (
                <tr key={a.name} className="border-b border-slate-800/30">
                  <td className="py-2 text-white">{a.name}</td>
                  <td className="py-2 text-slate-300 text-xs font-mono">
                    {Object.entries(a.tuned).map(([k, v]) => `${k}=${v}`).join(", ")}
                  </td>
                  <td className="py-2 text-cyan-300">{((a.f1 - (a.f1 - 0.01)) * 100).toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value }) {
  return (
    <div className="metric-card">
      <div className="text-xl font-bold text-cyan-300">{value}</div>
      <div className="text-xs text-slate-400">{label}</div>
    </div>
  );
}
