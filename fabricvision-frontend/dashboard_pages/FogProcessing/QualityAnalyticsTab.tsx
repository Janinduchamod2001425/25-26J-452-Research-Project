"use client";

import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

// ---------------- Mock Data (replace with real metrics later) ----------------

const qualityTimeline = [
  { time: "10:00", quality: 78, sharpness: 65 },
  { time: "10:05", quality: 82, sharpness: 70 },
  { time: "10:10", quality: 88, sharpness: 76 },
  { time: "10:15", quality: 91, sharpness: 82 },
  { time: "10:20", quality: 89, sharpness: 80 },
  { time: "10:25", quality: 93, sharpness: 85 },
];

const regionContribution = [
  { region: "Left Warp", contribution: 72 },
  { region: "Center Weave", contribution: 35 },
  { region: "Right Warp", contribution: 81 },
];

const qualityVsRisk = [
  { segment: "0–10m", quality: 92, risk: 8 },
  { segment: "10–20m", quality: 88, risk: 12 },
  { segment: "20–30m", quality: 83, risk: 18 },
];

// ---------------- Reusable Card ----------------

const Card = ({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
    <h3 className="text-base font-semibold text-slate-900">{title}</h3>
    {subtitle && <p className="text-xs text-slate-500 mt-1 mb-4">{subtitle}</p>}
    {children}
  </div>
);

// ---------------- Main Component ----------------

const QualityAnalyticsTab = () => {
  return (
    <div className="space-y-6">
      {/* TOP GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Quality Trend */}
        <Card
          title="Enhancement Quality Timeline"
          subtitle="Tracks frame quality and sharpness improvements over time."
        >
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={qualityTimeline}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="time" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="quality"
                  stroke="#22c55e"
                  strokeWidth={2}
                  name="Frame Quality"
                />
                <Line
                  type="monotone"
                  dataKey="sharpness"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Sharpness"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Region-wise Contribution */}
        <Card
          title="Localized Fabric Contribution"
          subtitle="Shows which fabric regions benefit most from enhancement."
        >
          <div className="space-y-4">
            {regionContribution.map((r) => (
              <div key={r.region}>
                <div className="flex justify-between text-sm text-slate-700 mb-1">
                  <span>{r.region}</span>
                  <span className="font-medium">{r.contribution}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full">
                  <div
                    className="h-2 rounded-full bg-indigo-500"
                    style={{ width: `${r.contribution}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Enhancement Decision Summary */}
        <Card
          title="Adaptive Enhancement Logic"
          subtitle="How enhancement strength is adjusted based on quality signals."
        >
          <ul className="space-y-3 text-sm text-slate-700">
            <li>
              <span className="font-semibold text-emerald-600">
                Stable Quality:
              </span>{" "}
              Low enhancement to preserve texture
            </li>
            <li>
              <span className="font-semibold text-amber-600">
                Moderate Degradation:
              </span>{" "}
              Adaptive contrast & sharpening
            </li>
            <li>
              <span className="font-semibold text-red-600">
                High Quality Drop:
              </span>{" "}
              Aggressive enhancement & alert
            </li>
          </ul>
        </Card>
      </div>

      {/* BOTTOM GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Quality vs Risk */}
        <Card
          title="Quality vs Defect Risk"
          subtitle="Demonstrates how enhancement improves downstream defect reliability."
        >
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={qualityVsRisk} barSize={18}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="segment" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip />
                <Bar dataKey="quality" fill="#22c55e" name="Quality Score" />
                <Bar dataKey="risk" fill="#f97316" name="Defect Risk" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Summary KPIs */}
        <Card
          title="Quality Analytics Summary"
          subtitle="Aggregated metrics from the current session."
        >
          <div className="grid grid-cols-2 gap-4">
            <Metric label="Avg Quality Gain" value="+12%" />
            <Metric label="Sharpness Gain" value="+18%" />
            <Metric label="Noise Reduction" value="−22%" />
            <Metric label="Frames Improved" value="91%" />
          </div>
        </Card>
      </div>
    </div>
  );
};

// ---------------- KPI Metric ----------------

const Metric = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
    <p className="text-xs text-slate-500">{label}</p>
    <p className="text-xl font-semibold text-slate-900 mt-1">{value}</p>
  </div>
);

export default QualityAnalyticsTab;
