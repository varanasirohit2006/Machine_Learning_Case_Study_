// Input field metadata extracted from models/app_metadata.json
window.fieldMeta = {
  fieldGroups: {
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
  },
  numericMeta: {
    operator_experience_years:   { min: 0.2,  max: 20,  median: 6.43,  isInt: false },
    machine_age_years:           { min: 0.2,  max: 18,  median: 5.75,  isInt: false },
    ambient_temperature_c:       { min: 12.02, max: 50.06, median: 29.02, isInt: false },
    humidity_pct:                { min: 20, max: 98, median: 62.1, isInt: false },
    vibration_mm_s:              { min: 0.207, max: 68.85, median: 2.213, isInt: false },
    hydraulic_pressure_bar:      { min: 3, max: 11.65, median: 7.4, isInt: false },
    motor_current_a:             { min: 8, max: 108.52, median: 31.18, isInt: false },
    rpm:                         { min: 900, max: 4500, median: 2795.25, isInt: false },
    production_rate_units_hr:    { min: 25, max: 288.5, median: 118, isInt: false },
    defect_rate_pct:             { min: 0.05, max: 18, median: 5.1185, isInt: false },
    downtime_hours_30d:          { min: 0, max: 58.79, median: 1.06, isInt: false },
    maintenance_count:           { min: 0, max: 12, median: 1, isInt: true },
    days_since_maintenance:      { min: 1, max: 500, median: 48.2, isInt: false },
    power_factor:                { min: 0.707, max: 0.99, median: 0.91, isInt: false },
    oil_temperature_c:           { min: 29.86, max: 83.01, median: 55.51, isInt: false },
    bearing_temperature_c:       { min: 25.9, max: 71.56, median: 47.89, isInt: false },
    load_percent:                { min: 24.56, max: 120, median: 76.18, isInt: false },
    noise_db:                    { min: 58.68, max: 124.64, median: 70.85, isInt: false },
    batch_size:                  { min: 50, max: 1199, median: 626, isInt: true }
  },
  categoricalMeta: {
    plant:           { options: ["Ahmedabad","Bengaluru","Chennai","Hyderabad","Pune"], default: "Chennai" },
    production_line: { options: ["L1","L2","L3","L4","L5","L6"], default: "L5" },
    machine_type:    { options: ["CNC","Compressor","Lathe","Milling","Press","Robot"], default: "CNC" },
    shift:           { options: ["Afternoon","Morning","NIGHT","Night","morning","night"], default: "Morning" },
    material_grade:  { options: ["HighStrength","Premium","Recycled","Standard","recycled","standard"], default: "Standard" },
    lubricant_type:  { options: ["Bio","Mineral","Synthetic"], default: "Mineral" },
    supplier_tier:   { options: ["Local","Tier1","Tier2","Tier3"], default: "Tier1" },
    inspection_status: { options: ["Minor_Issue","PASS","Pass","Pending","Rework","pass","pending"], default: "Pass" }
  }
};
