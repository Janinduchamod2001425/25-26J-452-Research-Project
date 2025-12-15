"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const qualityRiskData = [
  { segment: "0–10m", quality: 88, risk: 12 },
  { segment: "10–20m", quality: 92, risk: 8 },
];

export default function QualityRiskChart() {
  return (
    <section className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
      <h2 className="text-lg font-semibold text-slate-900">
        Fabric Type Distribution
      </h2>
      <p className="text-xs text-slate-500">
        Count of frames classified by the adaptive profile.
      </p>

      <div className="w-full h-40">
        <ResponsiveContainer>
          <BarChart data={qualityRiskData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="segment" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="quality" fill="#22c55e" />
            <Bar dataKey="risk" fill="#f97316" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
