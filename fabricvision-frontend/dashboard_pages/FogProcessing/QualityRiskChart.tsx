"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { segment: "0–10m", quality: 88, risk: 12 },
  { segment: "10–20m", quality: 92, risk: 8 },
];

export default function QualityRiskChart() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <h2 className="text-lg font-semibold mb-3">Quality vs Defect Risk</h2>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="segment" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="quality" fill="#22c55e" />
            <Bar dataKey="risk" fill="#f97316" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
