"use client";

import React, { useState } from "react";

interface Props {
  onSubmit: (features: number[]) => void;
}

/** Default demo values (UNCHANGED baseline) */
const defaultFeatures = [
  2,      // SupplierEnc
  120,    // RollLength
  18,     // DefectCount
  1.7,    // AvgSeverity
  0.08,   // DefectDensity
  0.45,   // MeanInterval
  0.62,   // StdInterval
];

const labels = [
  "Supplier Encoding",
  "Roll Length (m)",
  "Defect Count",
  "Average Severity",
  "Defect Density",
  "Mean Interval",
  "Std Interval",
];

const RollFeatureInputPanel: React.FC<Props> = ({ onSubmit }) => {
  const [features, setFeatures] = useState<number[]>(defaultFeatures);

  const updateFeature = (index: number, value: number) => {
    const updated = [...features];
    updated[index] = value;
    setFeatures(updated);
  };

  return (
    <div className="bg-white p-6 rounded-xl border space-y-4">
      <h3 className="font-bold text-gray-800">
        Roll-Level Feature Input (Model B)
      </h3>

      <div className="grid grid-cols-2 gap-4">
        {labels.map((label, i) => (
          <div key={i}>
            <label className="text-sm text-gray-600">{label}</label>
            <input
              type="number"
              step="any"
              value={features[i]}
              onChange={(e) => updateFeature(i, Number(e.target.value))}
              className="w-full mt-1 p-2 border rounded-lg"
            />
          </div>
        ))}
      </div>

      <button
        onClick={() => onSubmit(features)}
        className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
      >
        Run Risk Analysis
      </button>
    </div>
  );
};

export default RollFeatureInputPanel;