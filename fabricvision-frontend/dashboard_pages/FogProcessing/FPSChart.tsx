"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const fpsData = [
  { time: "14:00", fps: 30 },
  { time: "14:05", fps: 28 },
  { time: "14:10", fps: 29 },
  { time: "14:15", fps: 27 },
];

export default function FPSChart() {
  return (
    <section className="xl:col-span-2 bg-white rounded-2xl p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900 mb-1">
        Real-Time Performance Trend
      </h2>
      <p className="text-xs text-slate-500 mb-4">
        FPS stability over recent time window.
      </p>

      <div className="w-full h-64">
        <ResponsiveContainer>
          <LineChart data={fpsData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="fps"
              stroke="#2563eb"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
