"use client";

import React from "react";
import { FiBarChart2, FiInfo } from "react-icons/fi";

const ShapSummaryImage = () => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <FiBarChart2 className="text-indigo-600" />
            Feature Importance (SHAP)
          </h3>
          <p className="text-sm text-gray-600">
            Global explainability of MODEL B risk predictions
          </p>
        </div>

        <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full font-medium">
          XAI
        </span>
      </div>

      {/* IMAGE */}
      <div className="border border-gray-100 rounded-lg overflow-hidden bg-gray-50">
        <img
          src="/shap/modelB_shap_summary.png"
          alt="SHAP Summary Plot"
          className="w-full object-contain"
        />
      </div>

      {/* EXPLANATION */}
      <div className="mt-4 flex items-start gap-2 text-sm text-gray-600">
        <FiInfo className="text-indigo-600 mt-0.5" />
        <p>
          This SHAP summary shows how each feature (e.g., defect density,
          interval variance) influences the overall risk score across
          historical rolls.
        </p>
      </div>
    </div>
  );
};

export default ShapSummaryImage;
