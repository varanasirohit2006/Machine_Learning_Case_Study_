import React from "react";
import { NavLink } from "react-router-dom";

const links = [
  { to: "/", label: "Overview" },
  { to: "/regression", label: "Regression" },
  { to: "/classification", label: "Classification" },
  { to: "/clustering", label: "Clustering" },
  { to: "/predict", label: "Predict" },
];

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-40 glass border-b border-slate-700/30">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-cyan-300">
          <span>🏭</span> SmartMfg ML
        </div>
        <div className="flex items-center gap-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ active }) =>
                `px-3 py-1.5 rounded-md text-sm font-medium transition-all ` +
                (active
                  ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/40"
                  : "text-slate-300 hover:text-cyan-300 hover:bg-surface-2/30")
              }
            >
              {l.label}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}
