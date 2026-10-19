import React from "react";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Line,
  Bar,
  Tooltip,
  Legend,
  Title,
} from "chart.js";
import { Bar as BarChart, Line as LineChart } from "react-chartjs-2";
import { analysisData } from "../data/analysisData";
import ChartCard from "../components/ChartCard";

ChartJS.register(BarElement, CategoryScale, LinearScale, PointElement, LineElement, Line, Bar, Tooltip, Legend, Title);

export default function Clustering() {
  const t = analysisData.tracks.clustering;

  // Elbow chart
  const elbowData = {
    labels: t.elbow.map((e) => e.k),
    datasets: [{
      label: "Inertia",
      data: t.elbow.map((e) => e.inertia),
      borderColor: "#0ea5e5",
      backgroundColor: "rgba(14,165,233,0.1)",
      borderWidth: 2,
      fill: true,
      pointBackgroundColor: "#0ea5e5",
      tension: 0.3,
    }],
  };

  // Silhouette vs k
  const silData = {
    labels: t.elbow.map((e) => e.k),
    datasets: [{
      label: "Silhouette",
      data: t.elbow.map((e) => e.silhouette),
      borderColor: "#22c55e",
      backgroundColor: "rgba(34,197,94,0.1)",
      borderWidth: 2,
      fill: true,
      pointBackgroundColor: "#22c55e",
      tension: 0.3,
    }],
  };

  // Linkage comparison
  const linkageLabels = t.linkageComparison.map((l) => l.linkage);
  const dbiData = {
    labels: linkageLabels,
    datasets: [{
      label: "Davies-Bouldin Index",
      data: t.linkageComparison.map((l) => l.dbi),
      backgroundColor: ["#60a5fb", "#f87171", "#a78bfa", "#fbbf24"],
      borderWidth: 0,
    }],
  };

  // External validation (ARI)
  const extLabels = t.externalValidation.map((e) => e.algorithm);
  const ariData = {
    labels: extLabels,
    datasets: [{
      label: "Adjusted Rand Index",
      data: t.externalValidation.map((e) => e.adjustedRand),
      backgroundColor: ["#22c55e", "#a78bfa"],
      borderWidth: 0,
      barPercentage: 0.5,
    }],
  };

  const opts = {
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
      <div className="text-center py-8">
        <h1 className="text-3xl font-bold text-white mb-2">Track 3 — Clustering (Unsupervised)</h1>
        <p className="text-slate-300">4,000 samples, 20 features — K-Means &amp; Agglomerative (ward linkage)</p>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <MetricCard label="Selected k" value={t.selectedK} />
        <MetricCard label="Best Silhouette" value={t.algorithms[0].silhouette.toFixed(4)} />
        <MetricCard label="Best CHS" value={t.algorithms[0].chs.toFixed(1)} />
        <MetricCard label="Best Linkage" value={t.bestLinkage} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <ChartCard title="Elbow Curve — K-Means" subtitle="Inertia vs k (selected k=5)">
          <LineChart data={elbowData} options={{ ...opts, scales: { ...opts.scales, y: { ...opts.scales.y, title: { display: true, text: "Inertia", color: "#94a3b8" } } } }} />
        </ChartCard>
        <ChartCard title="Silhouette vs k" subtitle="Quality metric across cluster counts">
          <LineChart data={silData} options={opts} />
        </ChartCard>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <ChartCard title="Agglomerative Linkage Comparison" subtitle="Davies-Bouldin Index (lower = better)">
          <BarChart data={dbiData} options={{ ...opts, indexAxis: "y" }} />
        </ChartCard>
        <ChartCard title="Post-hoc Validation vs maintenance_risk" subtitle="Adjusted Rand Index (cluster labels vs ground truth)">
          <BarChart data={ariData} options={{ ...opts, indexAxis: "y", scales: { ...opts.scales, x: { ...opts.scales.x, max: 0.05 } } }} />
        </ChartCard>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <InfoCard
          title="Elbow detection"
          desc="Geometric elbow method: normalized the (k, inertia) curve and found the point farthest from the line joining the endpoints. This yielded k=5, which also aligns with the silhouette scan (highest silhouette at k=2 in the 2-10 scan, but k=5 chosen as the more stable middle ground)."
        />
        <InfoCard
          title="Linkage choice"
          desc="Ward linkage was selected: it minimizes within-cluster variance and produced the lowest Davies-Bouldin (4.12) among single/complete/average/ward. Average and single linkage showed higher cophenetic correlations but tiny clusters; ward balanced stability and interpretability."
        />
        <InfoCard
          title="External validation"
          desc="Both algorithms showed weak agreement with the maintenance_risk labels (ARI ~0.04 for Agglomerative, ~0.008 for K-Means; NMI similarly low). Conclusion: clusters capture operating-profile similarity, not risk labels — the unsupervised signal is genuinely orthogonal to the supervised target."
        />
        <InfoCard
          title="Visualizations"
          desc="PCA 2-D projections (both algorithms) and t-SNE embeddings were generated to qualitatively inspect cluster separation. The low silhouette scores (0.02-0.06) confirm the data has weak cluster structure — the operating profiles blend smoothly rather than forming discrete groups."
        />
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
function InfoCard({ title, desc }) {
  return (
    <div className="card">
      <h3 className="text-cyan-300 font-medium mb-2">{title}</h3>
      <p className="text-sm text-slate-300 leading-relaxed">{desc}</p>
    </div>
  );
}
