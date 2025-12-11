"use client";

import React from "react";
import Card from "./Card";
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  type ChartData,
  type ChartOptions,
  type TooltipItem,
} from "chart.js";
import { Scatter } from "react-chartjs-2";

ChartJS.register(LinearScale, PointElement, Tooltip, Legend);

interface Point {
  x: number; // motion variance
  y: number; // FIS
}

const points: Point[] = [
  { x: 2.1, y: 0.08 },
  { x: 3.0, y: 0.1 },
  { x: 4.5, y: 0.12 },
  { x: 6.2, y: 0.19 },
  { x: 8.7, y: 0.26 },
  { x: 12.3, y: 0.34 },
  { x: 15.8, y: 0.42 },
  { x: 18.1, y: 0.51 },
  { x: 20.5, y: 0.58 },
];

const scatterData: ChartData<"scatter"> = {
  datasets: [
    {
      label: "Motion vs FIS",
      data: points,
      backgroundColor: "rgba(59,130,246,0.9)",
      pointRadius: 4,
    },
  ],
};

const scatterOptions: ChartOptions<"scatter"> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (ctx: TooltipItem<"scatter">) => {
          const x = ctx.parsed.x ?? 0;
          const y = ctx.parsed.y ?? 0;
          return ` Motion: ${x.toFixed(1)}%, FIS: ${y.toFixed(2)}`;
        },
      },
    },
  },
  scales: {
    x: {
      title: {
        display: true,
        text: "Motion Variance (%)",
        color: "#6B7280",
        font: { size: 11 },
      },
      grid: { color: "rgba(229,231,235,0.7)" },
      ticks: { color: "#6B7280", font: { size: 11 } },
      min: 0,
      max: 22,
    },
    y: {
      title: {
        display: true,
        text: "FIS (0–1)",
        color: "#6B7280",
        font: { size: 11 },
      },
      grid: { color: "rgba(229,231,235,0.7)" },
      ticks: { color: "#6B7280", font: { size: 11 } },
      min: 0,
      max: 0.7,
    },
  },
};

const MotionIrregularityCorrelation: React.FC = () => {
  return (
    <Card>
      <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">
        Correlation: Motion Variance vs Irregularity Score (FIS)
      </h3>
      <p className="text-xs md:text-sm text-gray-500 mb-4">
        Higher motion often correlates with higher reconstruction error (FIS),
        but not always one-to-one. This view supports root-cause analysis and
        justifies burst capture windows.
      </p>
      <div className="w-full h-60 md:h-64">
        <Scatter data={scatterData} options={scatterOptions} />
      </div>
    </Card>
  );
};

export default MotionIrregularityCorrelation;
