"use client";

import React from "react";
import Card from "./Card";
import { CheckCircle, AlertTriangle, XCircle } from "lucide-react";

const qualityStats = {
  total: 1240,
  ready: 892,
  degraded: 241,
  low: 107,
};

const qualityIssues = [
  { label: "Blurred", count: 46 },
  { label: "Underexposed", count: 31 },
  { label: "Low Contrast", count: 19 },
  { label: "Texture Inconsistent", count: 11 },
];

const sampleFrames = [
  { id: "#F-1021", issue: "Blurred" },
  { id: "#F-1034", issue: "Low Contrast" },
  { id: "#F-1048", issue: "Underexposed" },
];

const FrameQualitySummary: React.FC = () => {
  return (
    <Card>
      <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">
        Frame Quality Summary (Rule-Based)
      </h3>
      <p className="text-xs md:text-sm text-gray-500 mb-6">
        Evaluates visual usability of captured frames using deterministic
        quality metrics. Frames are <b>flagged, not discarded</b>, and forwarded
        to fog computing with quality metadata.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* QUALITY STATES */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-800">
            Frame Readiness State
          </h4>

          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-emerald-700">
              <CheckCircle className="w-4 h-4" /> Ready
            </span>
            <span className="font-semibold">{qualityStats.ready}</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-amber-700">
              <AlertTriangle className="w-4 h-4" /> Degraded
            </span>
            <span className="font-semibold">{qualityStats.degraded}</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-red-700">
              <XCircle className="w-4 h-4" /> Low Quality
            </span>
            <span className="font-semibold">{qualityStats.low}</span>
          </div>

          <p className="text-[11px] text-gray-400 mt-2">
            Ready frames are forwarded directly. Degraded and low-quality frames
            are flagged for fog-level enhancement.
          </p>
        </div>

        {/* QUALITY ISSUE BREAKDOWN */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-800">
            Quality Issue Breakdown
          </h4>

          {qualityIssues.map((q) => (
            <div
              key={q.label}
              className="flex justify-between text-sm text-gray-700"
            >
              <span>{q.label}</span>
              <span className="font-mono font-semibold">{q.count}</span>
            </div>
          ))}

          <p className="text-[11px] text-gray-400 mt-2">
            Issues are detected using sharpness, exposure, contrast and
            texture-consistency rules (GLCM).
          </p>
        </div>

        {/* SAMPLE FLAGGED FRAMES */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-800">
            Flagged Frame Examples
          </h4>

          {sampleFrames.map((f) => (
            <div
              key={f.id}
              className="flex items-center justify-between text-sm border border-gray-100 rounded-lg px-3 py-2 bg-gray-50"
            >
              <span className="font-mono text-gray-600">{f.id}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-700 font-semibold">
                {f.issue}
              </span>
            </div>
          ))}

          <p className="text-[11px] text-gray-400 mt-2">
            Operators can quickly identify why certain frames require
            enhancement before defect detection.
          </p>
        </div>
      </div>
    </Card>
  );
};

export default FrameQualitySummary;
