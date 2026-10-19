import React from "react";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Title,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { analysisData } from "../data/analysisData";
import ChartCard from "../components/ChartCard";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, Title);

const barColors = ["#0ea5e5", "#38bdf8", "#34d399", "#fbbf24", "#f87171", "#a78bfa", "#fb7185", "#c084fc", "#facc15", "#7dd3fc"];

export default function Regression() {
  const t = analysisData.tracks.regression;
  const sorted = [...t.algorithms].sort((a, b) => a.rank - b.rank);

  const r2Data = {
    labels: sorted.map((a) => a.name),
    datasets: [{
      label: "R²",
      data: sorted.map((a) => a.r2),
      backgroundColor: sorted.map((a) =>
        a.badge ? "#22c55e" : barColors[(a.rank - 1) % barColors.length]
      ),
      borderWidth: 0,
      barPercentage: 0.6,
    }],
  };

  const rmseData = {
    labels: sorted.map((a) => a.name),
    datasets: [{
      label: "RMSE",
      data: sorted.map((a) => a.rmse),
      backgroundColor: sorted.map((a) => a.label === "baseline" ? "#94a3b8" : "#ef4444"),
      borderWidth: 0,
      barPercentage: 0.6,
    }],
  };

  const chartOpts = {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { ticks: { color: "#cbd5e1", font: { size: 11 } }, grid: { display: false } },
      x: { ticks: { color: "#94a3b8", font: { size: 11 } }, grid: { color: "rgba(148,163,184,0.08)" } },
    },
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="text-center py-8">
        <h1 className="text-3xl font-bold text-white mb-2">Track 1 — Regression</h1>
        <p className="text-slate-300">Predicting {t.target} (machine energy consumption in kWh)</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <MetricCard label="Best Model" value={t.bestModel} />
        <MetricCard label="R² (Tuned)" value={t.finalMetrics.r2.toFixed(4)} />
        <MetricCard label="MAE (Tuned)" value={t.finalMetrics.mae.toFixed(2)} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <ChartCard title="Model Comparison — R²" subtitle="Higher is better (10 models, 80/20 split)">
          <Bar data={r2Data} options={chartOpts} />
        </ChartCard>
        <ChartCard title="Model Comparison — RMSE (kWh)" subtitle="Lower is better">
          <Bar data={rmseData} options={chartOpts} />
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
        <h3 className="text-cyan-300 font-medium mb-3">5-Fold CV — Top 2 Models</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-slate-700/30">
                <th className="pb-2 text-slate-300">Model</th>
                <th className="pb-2 text-slate-300">Mean R²</th>
                <th className="pb-2 text-slate-300">Std R²</th>
              </tr>
            </thead>
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

function MetricCard({ label, value }) {
  return (
    <div className="metric-card">
      <div className="text-xl font-bold text-cyan-300">{value}</div>
      <div className="text-xs text-slate-400">{label}</div>
    </div>
  );
}
