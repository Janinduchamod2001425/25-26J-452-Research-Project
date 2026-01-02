"use client";

import React from "react";
import {
  FiTrendingUp,
  FiTrendingDown,
  FiInfo,
} from "react-icons/fi";

const shapData = [
  {
    feature: "Defect Density",
    impact: "High",
    direction: "up",
    value: "+0.42",
  },
  {
    feature: "Interval Variance",
    impact: "Medium",
    direction: "up",
    value: "+0.31",
  },
  {
    feature: "Average Severity",
    impact: "Low",
    direction: "up",
    value: "+0.18",
  },
  {
    feature: "Roll Length",
    impact: "Low",
    direction: "down",
    value: "-0.09",
  },
];

const ShapContributionPanel = () => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-800">
            Risk Explainability (SHAP)
          </h3>
          <p className="text-sm text-gray-600">
            Feature-level contribution to roll risk score
          </p>
        </div>

        <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full font-medium">
          XAI
        </span>
      </div>

      {/* TABLE */}
      <div className="space-y-3">
        {shapData.map((item, i) => (
          <div
            key={i}
            className="flex items-center justify-between bg-gray-50 rounded-lg p-4"
          >
            <div>
              <p className="font-semibold text-gray-800">
                {item.feature}
              </p>
              <p className="text-xs text-gray-500">
                Contribution strength: {item.impact}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span
                className={`text-sm font-semibold ${
                  item.direction === "up"
                    ? "text-red-600"
                    : "text-green-600"
                }`}
              >
                {item.value}
              </span>

              {item.direction === "up" ? (
                <FiTrendingUp className="text-red-600 w-4 h-4" />
              ) : (
                <FiTrendingDown className="text-green-600 w-4 h-4" />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* FOOTER NOTE */}
      <div className="mt-5 flex items-start gap-2 text-sm text-gray-600">
        <FiInfo className="text-indigo-600 mt-0.5" />
        <p>
          SHAP values indicate how each feature influenced the final
          risk score for this roll.
        </p>
      </div>
    </div>
  );
};

export default ShapContributionPanel;
