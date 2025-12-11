"use client";

import React from "react";
import Card from "./Card";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
} from "recharts";

interface RegionSeriesPoint {
  t: number;
  v: number;
}

interface RegionCardConfig {
  label: string;
  contribution: number; // 0–1
  data: RegionSeriesPoint[];
}

const regions: RegionCardConfig[] = [
  {
    label: "Left Tension Zone",
    contribution: 0.32,
    data: [
      { t: 0, v: 0.2 },
      { t: 1, v: 0.3 },
      { t: 2, v: 0.4 },
      { t: 3, v: 0.35 },
    ],
  },
  {
    label: "Right Tension Zone",
    contribution: 0.41,
    data: [
      { t: 0, v: 0.3 },
      { t: 1, v: 0.42 },
      { t: 2, v: 0.38 },
      { t: 3, v: 0.41 },
    ],
  },
  {
    label: "Weft Direction Drift",
    contribution: 0.18,
    data: [
      { t: 0, v: 0.12 },
      { t: 1, v: 0.16 },
      { t: 2, v: 0.2 },
      { t: 3, v: 0.18 },
    ],
  },
  {
    label: "Roller Slip",
    contribution: 0.09,
    data: [
      { t: 0, v: 0.04 },
      { t: 1, v: 0.08 },
      { t: 2, v: 0.09 },
      { t: 3, v: 0.07 },
    ],
  },
];

const RegionContributionCards: React.FC = () => {
  return (
    <Card>
      <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">
        Region-wise Motion Contribution
      </h3>
      <p className="text-xs md:text-sm text-gray-500 mb-4">
        Breaks down which physical sources contribute most to motion variance.
        Helps technicians understand where mechanical tuning is required.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {regions.map((r) => (
          <div
            key={r.label}
            className="rounded-xl border border-gray-100 bg-gray-50/70 p-3 space-y-2"
          >
            <div className="flex justify-between items-center">
              <p className="text-xs font-semibold text-gray-800">{r.label}</p>
              <span className="text-[11px] font-mono text-indigo-700">
                {(r.contribution * 100).toFixed(0)}%
              </span>
            </div>
            <div className="w-full h-16">
              <ResponsiveContainer>
                <LineChart data={r.data}>
                  <XAxis dataKey="t" hide />
                  <YAxis hide domain={[0, "dataMax"]} />
                  <RechartsTooltip
                    contentStyle={{
                      fontSize: 10,
                      borderRadius: 8,
                      padding: 6,
                    }}
                    formatter={(value: unknown) => [
                      (value as number).toFixed(2),
                      "Motion level",
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="v"
                    stroke="#6366F1"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default RegionContributionCards;
