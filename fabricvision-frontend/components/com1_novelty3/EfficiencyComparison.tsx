"use client";

import React from "react";
import Card from "./Card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const barData = [
  { mode: "Fixed 30 FPS", frames: 10800 },
  { mode: "Adaptive FPS", frames: 4030 },
];

const pieData = [
  { name: "Frames Saved", value: 10800 - 4030 },
  { name: "Frames Kept", value: 4030 },
];

const COLORS = ["#10B981", "#6366F1"];

const EfficiencyComparison: React.FC = () => {
  const savingPercent = ((10800 - 4030) / 10800) * 100;

  return (
    <Card>
      <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">
        Capture Efficiency: Fixed vs Adaptive
      </h3>
      <p className="text-xs md:text-sm text-gray-500 mb-4">
        Novelty 3 reduces redundant frames by dynamically tuning capture rate.
        Below comparison uses a 1-minute window at conventional 30 FPS vs our
        adaptive policy.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Bar Chart */}
        <div className="w-full h-40 md:h-48">
          <ResponsiveContainer>
            <BarChart data={barData}>
              <XAxis
                dataKey="mode"
                tick={{ fontSize: 10 }}
                tickLine={false}
                axisLine={{ stroke: "#E5E7EB" }}
              />
              <YAxis
                tick={{ fontSize: 10 }}
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                axisLine={{ stroke: "#E5E7EB" }}
                tickLine={false}
              />
              <RechartsTooltip
                contentStyle={{
                  fontSize: 11,
                  borderRadius: 8,
                  padding: 8,
                }}
                formatter={(value: unknown) => [
                  `${value} frames`,
                  "Captured frames",
                ]}
              />
              <Bar dataKey="frames" radius={[8, 8, 0, 0]} fill="#6366F1" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Donut Chart + Stats */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-4">
          <div className="w-32 h-32">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={pieData}
                  innerRadius={35}
                  outerRadius={50}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={entry.name}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="text-xs md:text-sm text-gray-700 space-y-1">
            <p className="font-semibold">
              ~{savingPercent.toFixed(1)}% of frames eliminated at edge.
            </p>
            <p>
              This directly reduces workload for Component 2 & 3 while keeping
              all burst segments where motion and irregularity are highest.
            </p>
            <p className="text-[11px] text-gray-400">
              Scenario assumes a single camera; multi-camera setups benefit even
              more from adaptive motion-driven sampling.
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default EfficiencyComparison;
