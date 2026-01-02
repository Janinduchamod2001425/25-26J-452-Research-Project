"use client";

import React from "react";
import {
  FiEye,
  FiAlertTriangle,
} from "react-icons/fi";

const PredictedDefectTypesImage = () => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
      <div className="p-6">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <FiEye className="text-indigo-600" />
              Predicted Defect Types on Fabric
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              Visual forecast of possible defect categories (MODEL A)
            </p>
          </div>

          <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full font-medium">
            FORECAST VIEW
          </span>
        </div>

        {/* FABRIC IMAGE */}
        <div className="relative rounded-lg overflow-hidden border border-gray-300 bg-gray-50">
          <img
            src="/fabric-sample.jpg"   // 🔁 replace with your fabric image path
            alt="Fabric forecast"
            className="w-full h-72 object-cover"
          />

          {/* HOLE */}
          <div className="absolute top-12 left-16 w-28 h-28 border-2 border-red-500 rounded-lg">
            <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-red-500 text-white px-3 py-1 text-xs rounded-full font-semibold">
              Hole
            </span>
          </div>

          {/* LINE DEFECT */}
          <div className="absolute top-24 right-24 w-36 h-20 border-2 border-blue-500 rounded-lg">
            <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-blue-500 text-white px-3 py-1 text-xs rounded-full font-semibold">
              Line Defect
            </span>
          </div>

          {/* STAIN */}
          <div className="absolute bottom-16 left-1/3 w-24 h-24 border-2 border-yellow-500 rounded-lg">
            <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-yellow-500 text-white px-3 py-1 text-xs rounded-full font-semibold">
              Stain
            </span>
          </div>

          {/* MIXED */}
          <div className="absolute bottom-10 right-20 w-32 h-24 border-2 border-purple-500 rounded-lg">
            <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-purple-500 text-white px-3 py-1 text-xs rounded-full font-semibold">
              Mixed / Other
            </span>
          </div>

          {/* FOOTER TAG */}
          <div className="absolute bottom-4 left-4 bg-black/75 text-white px-4 py-2 rounded-lg text-sm backdrop-blur">
            MODEL A — Defect Type Forecast
          </div>
        </div>

        {/* EXPLANATION */}
        <div className="mt-5 flex items-start gap-3 text-sm text-gray-600">
          <FiAlertTriangle className="text-amber-500 mt-0.5" />
          <p>
            Bounding boxes represent <b>possible defect categories</b>, not exact
            locations. Use this view to prepare inspection strategy.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PredictedDefectTypesImage;
