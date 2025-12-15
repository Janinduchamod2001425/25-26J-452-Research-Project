"use client";

import React from "react";
import Card from "./Card";

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";

// Register chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

// ---------- Data ----------
const modeLabels = ["Stable Mode", "Moderate Mode", "Burst Mode"];
const modeValues = [58, 29, 13];
const COLORS = ["#10B981", "#FBBF24", "#F97316"];

// ---------- Chart Data ----------
const chartData: ChartData<"doughnut"> = {
  labels: modeLabels,
  datasets: [
    {
      label: "Mode Distribution",
      data: modeValues,
      backgroundColor: COLORS,
      borderColor: "#fff",
      borderWidth: 2,
      hoverOffset: 8,
    },
  ],
};

// ---------- Chart Options ----------
const chartOptions: ChartOptions<"doughnut"> = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: "65%",
  animation: {
    animateRotate: true,
    animateScale: true,
  },
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (ctx) => {
          const value = ctx.parsed;
          return `${value}%`;
        },
      },
    },
  },
};

const ModeDistributionChart: React.FC = () => {
  return (
    <Card className="py-8">
      <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">
        Capture Mode Distribution
      </h3>

      <p className="text-xs md:text-sm text-gray-500 mb-6">
        Shows how much time the system spent in stable, moderate, and burst
        capture modes during the current session.
      </p>

      <div className="flex flex-col md:flex-row items-center md:items-start gap-10">
        {/* Large Donut Chart */}
        <div className="relative w-48 h-48 md:w-64 md:h-64">
          <Doughnut data={chartData} options={chartOptions} />

          {/* Percentage Labels on Slices */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-gray-400 text-xs font-medium">
              {/* This stays under the center label */}
            </span>
          </div>
        </div>

        {/* Legend + Explanation */}
        <div className="flex-1 space-y-3 text-xs md:text-sm text-gray-700 leading-relaxed">
          {modeLabels.map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <span
                className="w-4 h-4 rounded-xl"
                style={{ backgroundColor: COLORS[i] }}
              ></span>

              <p className="mt-6">
                <span className="font-semibold text-gray-900">{label}</span> –{" "}
                {i === 0 && "low FPS, ideal for long, consistent production."}
                {i === 1 && "adaptive response to small tension variations."}
                {i === 2 &&
                  "short high-FPS bursts around critical spikes or anomalies."}
              </p>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default ModeDistributionChart;
