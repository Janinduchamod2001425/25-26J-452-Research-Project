"use client";

import React from "react";
import {
  FiTrendingUp,
  FiMapPin,
  FiAlertCircle,
  FiActivity,
  FiLayers,
} from "react-icons/fi";

const forecastData = [
  { step: "+1 m", position: "42.6 m", defect: "Hole", probability: "92%", action: "Inspect" },
  { step: "+2 m", position: "43.6 m", defect: "Hole", probability: "88%", action: "Inspect" },
  { step: "+3 m", position: "44.6 m", defect: "Hole", probability: "81%", action: "Monitor" },
  { step: "+4 m", position: "45.6 m", defect: "Hole", probability: "74%", action: "Monitor" },
  { step: "+5 m", position: "46.6 m", defect: "Hole", probability: "69%", action: "Low Risk" },
  { step: "+6 m", position: "47.6 m", defect: "Hole", probability: "65%", action: "Low Risk" },
  { step: "+7 m", position: "48.6 m", defect: "Hole", probability: "61%", action: "Low Risk" },
  { step: "+8 m", position: "49.6 m", defect: "Hole", probability: "58%", action: "Low Risk" },
  { step: "+9 m", position: "50.6 m", defect: "Hole", probability: "54%", action: "Low Risk" },
  { step: "+10 m", position: "51.6 m", defect: "Hole", probability: "50%", action: "Low Risk" },
];

const defectBadgeStyle = (defect: string) => {
  switch (defect) {
    case "Hole":
      return "bg-red-100 text-red-800";
    case "Line":
      return "bg-blue-100 text-blue-800";
    case "Stain":
      return "bg-yellow-100 text-yellow-800";
    case "Mixed":
      return "bg-purple-100 text-purple-800";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

const PredictionForecastMonitor = () => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
      <div className="p-6">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Upcoming Defect Forecast
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              Next 10 predicted defect positions (MODEL A)
            </p>
          </div>
          <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full font-medium">
            FORECAST
          </span>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">
                  Step
                </th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">
                  Position
                </th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">
                  Defect Type
                </th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">
                  Probability
                </th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {forecastData.map((f, i) => (
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                  {/* STEP */}
                  <td className="py-3 px-4 font-medium text-gray-900">
                    {f.step}
                  </td>

                  {/* POSITION */}
                  <td className="py-3 px-4 flex items-center gap-2">
                    <FiMapPin className="text-indigo-600 w-4 h-4" />
                    <span className="text-gray-800">{f.position}</span>
                  </td>

                  {/* DEFECT TYPE */}
                  <td className="py-3 px-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${defectBadgeStyle(
                        f.defect
                      )}`}
                    >
                      {f.defect}
                    </span>
                  </td>

                  {/* PROBABILITY */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-200 rounded-full h-1.5">
                        <div
                          className="bg-indigo-500 h-1.5 rounded-full"
                          style={{ width: f.probability }}
                        />
                      </div>
                      <span
                        className={`text-sm font-medium ${
                          parseInt(f.probability) >= 85
                            ? "text-red-600"
                            : parseInt(f.probability) >= 70
                            ? "text-yellow-600"
                            : "text-green-600"
                        }`}
                      >
                        {f.probability}
                      </span>
                    </div>
                  </td>

                  {/* ACTION */}
                  <td className="py-3 px-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        f.action === "Inspect"
                          ? "bg-red-100 text-red-800"
                          : f.action === "Monitor"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {f.action}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* FOOTER */}
        <div className="mt-6 pt-6 border-t border-gray-100 text-sm text-gray-600 flex items-center gap-2">
          <FiAlertCircle className="text-indigo-600" />
          Defect type is inferred from dominant pattern in recent detections
        </div>
      </div>
    </div>
  );
};

export default PredictionForecastMonitor;
