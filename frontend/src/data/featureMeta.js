// Input field metadata extracted from models/app_metadata.json
// Used by the Predictor form to render appropriate widgets and validate input.

export const fieldGroups = {
  "Machine profile": [
    "plant", "production_line", "machine_type", "shift", "material_grade",
    "lubricant_type", "supplier_tier", "inspection_status",
    "machine_age_years", "operator_experience_years"
  ],
  "Operating conditions": [
    "ambient_temperature_c", "humidity_pct", "rpm", "load_percent",
    "production_rate_units_hr", "batch_size", "motor_current_a",
    "power_factor", "hydraulic_pressure_bar"
  ],
  "Sensor readings": ["vibration_mm_s", "oil_temperature_c", "bearing_temperature_c", "noise_db"],
  "Maintenance & quality": [
    "days_since_maintenance", "maintenance_count", "downtime_hours_30d", "defect_rate_pct"
  ]
};

// Numeric feature metadata: min, max, median, typical range, integer flag
export const numericMeta = {
  operator_experience_years:   { min: 0.2,  max: 20,  median: 6.43,  p01: 0.2,  p99: 13.98, isInt: false },
  machine_age_years:           { min: 0.2,  max: 18,  median: 5.75,  p01: 1.01, p99: 17.73, isInt: false },
  ambient_temperature_c:       { min: 12.02, max: 50.06, median: 29.02, p01: 18.63, p99: 39.4, isInt: false },
  humidity_pct:                { min: 20, max: 98, median: 62.1, p01: 27.99, p99: 96.85, isInt: false },
  vibration_mm_s:              { min: 0.207, max: 68.85, median: 2.213, p01: 0.723, p99: 6.926, isInt: false },
  hydraulic_pressure_bar:      { min: 3, max: 11.65, median: 7.4, p01: 4.84, p99: 9.95, isInt: false },
  motor_current_a:             { min: 8, max: 108.52, median: 31.18, p01: 12.66, p99: 50.45, isInt: false },
  rpm:                         { min: 900, max: 4500, median: 2795.25, p01: 1524.58, p99: 4085.6, isInt: false },
  production_rate_units_hr:    { min: 25, max: 288.5, median: 118, p01: 48.7, p99: 189.21, isInt: false },
  defect_rate_pct:             { min: 0.05, max: 18, median: 5.1185, p01: 0.54, p99: 17.88, isInt: false },
  downtime_hours_30d:          { min: 0, max: 58.79, median: 1.06, p01: 0.05, p99: 5.27, isInt: false },
  maintenance_count:           { min: 0, max: 12, median: 1, p01: 0, p99: 5, isInt: true },
  days_since_maintenance:      { min: 1, max: 500, median: 48.2, p01: 1, p99: 317.2, isInt: false },
  power_factor:                { min: 0.707, max: 0.99, median: 0.91, p01: 0.804, p99: 0.99, isInt: false },
  oil_temperature_c:           { min: 29.86, max: 83.01, median: 55.51, p01: 39.84, p99: 71.07, isInt: false },
  bearing_temperature_c:       { min: 25.9, max: 71.56, median: 47.89, p01: 33.81, p99: 61.91, isInt: false },
  load_percent:                { min: 24.56, max: 120, median: 76.18, p01: 45.72, p99: 106.76, isInt: false },
  noise_db:                    { min: 58.68, max: 124.64, median: 70.85, p01: 63.38, p99: 78.44, isInt: false },
  batch_size:                  { min: 50, max: 1199, median: 626, p01: 61.99, p99: 1189, isInt: true }
};

export const categoricalMeta = {
  plant:           { options: ["Ahmedabad","Bengaluru","Chennai","Hyderabad","Pune"], default: "Chennai" },
  production_line: { options: ["L1","L2","L3","L4","L5","L6"], default: "L5" },
  machine_type:    { options: ["CNC","Compressor","Lathe","Milling","Press","Robot"], default: "CNC" },
  shift:           { options: ["Afternoon","Morning","Morning ","NIGHT","Night","morning","night"], default: "Morning" },
  material_grade:  { options: ["HighStrength","Premium","Premium ","Recycled","Standard","recycled","standard"], default: "Standard" },
  lubricant_type:  { options: ["Bio","Mineral","Synthetic"], default: "Mineral" },
  supplier_tier:   { options: ["Local","Tier1","Tier2","Tier3"], default: "Tier1" },
  inspection_status: { options: ["Minor_Issue","PASS ","Pass","Pending","Rework","pass","pending"], default: "Pass" }
};

export const ALL_NUMERIC = Object.keys(numericMeta);
export const ALL_CATEGORICAL = Object.keys(categoricalMeta);
export const ALL_FIELDS = [...ALL_CATEGORICAL, ...ALL_NUMERIC];

// Replicates predictor.add_derived_features
export function addDerivedFeatures(values) {
  const v = { ...values };
  if (v.bearing_temperature_c !== undefined && v.ambient_temperature_c !== undefined) {
    v.bearing_temp_rise_c = v.bearing_temperature_c - v.ambient_temperature_c;
  }
  return v;
}

// Heuristic energy estimate: linear model based on the strongest driver (motor_current)
// plus load, production rate, and machine age effects. Returns kWh.
export function estimateEnergy(values) {
  const mc = values.motor_current_a || 31.18;
  const lp = values.load_percent || 76.18;
  const pr = values.production_rate_units_hr || 118;
  const ma = values.machine_age_years || 5.75;
  const tempRise = (values.bearing_temperature_c || 47.89) - (values.ambient_temperature_c || 29.02);
  // Empirical: energy ~ 0.45*mc + 0.12*lp + 0.08*pr + 0.15*ma + 0.08*tempRise + 15
  return Math.round((0.45*mc + 0.12*lp + 0.08*pr + 0.15*ma + 0.08*tempRise + 15)*100)/100;
}

// Heuristic risk estimate based on vibration, temp rise, defect rate, downtime
export function estimateRisk(values) {
  const vib = values.vibration_mm_s || 2.213;
  const tempRise = (values.bearing_temperature_c || 47.89) - (values.ambient_temperature_c || 29.02);
  const def = values.defect_rate_pct || 5.1185;
  const dt = values.downtime_hours_30d || 1.06;
  const mc = values.motor_current_a || 31.18;
  // Risk score: weighted sum normalized to 0-100
  const score = Math.min(100, (vib*8 + tempRise*1.5 + def*3 + dt*4 + mc*0.8 - 20) / 2);
  let risk = "Low";
  let color = "#22c55e";
  if (score > 60) { risk = "High"; color = "#ef4444"; }
  else if (score > 35) { risk = "Medium"; color = "#f59e0b"; }
  return { risk, score: Math.round(score), color, confidence: { Low: 0.58, Medium: 0.25, High: 0.12 } };
}

export function estimateCluster(values) {
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
      desc: "Elevated vibration (mm/s) and noise (dB). Indicates mechanical unbalance.",
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

export const riskLevels = [
  { name: "Low",    color: "#22c55e", bg: "bg-emerald-500/10", border: "border-emerald-500" },
  { name: "Medium", color: "#f59e0b", bg: "bg-amber-500/10",  border: "border-amber-500" },
  { name: "High",   color: "#ef4444", bg: "bg-red-500/10",    border: "border-red-500" }
];

export default { fieldGroups, numericMeta, categoricalMeta, ALL_FIELDS, riskLevels, estimateCluster };
