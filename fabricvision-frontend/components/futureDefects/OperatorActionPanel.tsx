"use client";

import { FiAlertTriangle, FiMapPin, FiTool } from "react-icons/fi";

interface Props {
  predictions: number[];
}

const OperatorActionPanel = ({ predictions }: Props) => {
  if (predictions.length === 0) return null;

  // -----------------------------
  // Zone
  // -----------------------------
  const startZone = predictions[0];
  const endZone = predictions[predictions.length - 1];
  const zone = `${startZone} cm → ${endZone} cm`;

  // -----------------------------
  // Interval analysis
  // -----------------------------
  const intervals = predictions.slice(1).map((p, i) => p - predictions[i]);

  const avgInterval =
    intervals.reduce((a, b) => a + b, 0) / intervals.length;

  const std =
    Math.sqrt(
      intervals.reduce((sum, v) => sum + Math.pow(v - avgInterval, 2), 0) /
        intervals.length
    );

  // -----------------------------
  // Pattern detection
  // -----------------------------
  let pattern = "Irregular";

  if (std < 2) pattern = "Repeating";
  else if (std < 10) pattern = "Drifting";

  // -----------------------------
  // Operator actions
  // -----------------------------
  let actions: string[] = [];

  if (pattern === "Repeating") {
    actions = [
      "keep much Focus on fabric roll,defects are continously repeating",
      "If fabric defects continously detect more, stop the roll",
      "Inspect machine rollers for repeating mechanical marks",
      "Check weaving needle or loom component alignment",
      "Monitor tension stability in the upcoming fabric section",
      "Mark predicted defect zones before cutting stage",
    ];
  } else if (pattern === "Drifting") {
    actions = [
      "fabric defects are continue as drifting",
      "Check fabric feed alignment",
      "Verify roller tension consistency",
      "Observe gradual shift of defect position",
      "Increase inspection frequency in next fabric segment",
    ];
  } else {
    actions = [
      "Continue monitoring upcoming fabric segment",
      "Verify camera detection stability",
      "Ensure consistent lighting conditions",
    ];
  }

  return (
    <div className="bg-red-50 p-6 rounded-xl border border-red-200 space-y-4">
      <h3 className="font-bold text-red-700 flex items-center gap-2">
        <FiAlertTriangle />
        Operator Recommendation
      </h3>

      {/* Core Insights */}
      <div className="text-sm space-y-2 text-gray-800">
        <p className="flex items-center gap-2">
          <FiMapPin className="text-red-600" />
          <b>Inspection Zone:</b> {zone}
        </p>

        <p>
          <b>Next Expected Defect:</b> {predictions[0]} cm
        </p>
      </div>

      {/* Operator Actions */}
      <div className="bg-white p-4 rounded-lg border">
        <h4 className="font-semibold mb-2 flex items-center gap-2">
          <FiTool />
          Recommended Actions
        </h4>

        <ul className="text-sm text-gray-700 space-y-1 list-disc pl-5">
          {actions.map((action, i) => (
            <li key={i}>{action}</li>
          ))}
        </ul>
      </div>

      <p className="text-xs text-gray-500">
        Recommendations generated using Model A predictive defect analysis.
      </p>
    </div>
  );
};

export default OperatorActionPanel;