import React from "react";

// Reusable card that wraps any chart with a consistent header + optional stat.
export default function ChartCard({ title, subtitle, stat, statLabel, children, className = "" }) {
  return (
    <div className={`card ${className}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-sm font-medium text-cyan-300 uppercase tracking-wider">{title}</h3>
          {subtitle && <p className="text-sm text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
        {stat !== undefined && (
          <div className="text-right">
            <div className="text-2xl font-bold text-white">{stat}{statLabel || ""}</div>
            {typeof statLabel === "string" && <span className="text-xs text-slate-400">{statLabel}</span>}
          </div>
        )}
      </div>
      {children}
    </div>
  );
}
