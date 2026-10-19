import React from "react";
import { analysisData } from "../data/analysisData";

export default function Hero() {
  const { dataset, project, course, team } = analysisData;
  const tracks = ["Regression", "Classification", "Clustering"];

  return (
    <section className="relative py-16 md:py-24 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-emerald-500/8 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-96 h-96 bg-fuchsia-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 mb-6">
          <span className="w-2 h-2 bg-cyan-400 rounded-full" />
          {course} &bull; Team: {team}
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
          <span className="text-cyan-300">Smart</span>{" "}
          <span className="text-white">Manufacturing</span>{" "}
          <span className="bg-gradient-to-r from-cyan-300 via-fuchsia-300 to-emerald-300 bg-clip-text text-transparent">
            ML Capstone
          </span>
        </h1>

        <p className="text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed mb-8">
          End-to-end machine learning pipeline on {dataset.rows.toLocaleString()} machine sensor records.
          Three tracks — Regression, Classification, and Clustering — predicting energy consumption,
          maintenance risk, and operating-profile groups.
        </p>

        <div className="flex flex-wrap justify-center gap-4 mb-10">
          {tracks.map((t) => (
            <div key={t} className="px-4 py-2 rounded-lg bg-surface-2/40 border border-slate-600/30 text-sm">
              {t}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
          <StatCard label="Records" value={dataset.rows.toLocaleString()} />
          <StatCard label="Features" value={dataset.columns} />
          <StatCard label="Train Split" value={dataset.trainSplit} />
          <StatCard label="Random" value={analysisData.randomState} />
        </div>
      </div>
    </section>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="metric-card">
      <div className="text-2xl font-bold text-cyan-300">{value}</div>
      <div className="text-xs text-slate-400">{label}</div>
    </div>
  );
}
