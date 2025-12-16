"use client";

import React from "react";
import Card from "./Card";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  Filler,
  type ChartData,
  type ChartOptions,
  type TooltipItem,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  Filler,
);

interface TimelinePoint {
  time: string;
  motion: number; // 0–100 (%)
  fps: number; // adaptive FPS
}

const timelineData: TimelinePoint[] = [
  { time: "10:00", motion: 3, fps: 6 },
  { time: "10:05", motion: 4, fps: 6 },
  { time: "10:10", motion: 9, fps: 9 },
  { time: "10:15", motion: 14, fps: 14 },
  { time: "10:20", motion: 21, fps: 18 },
  { time: "10:25", motion: 11, fps: 10 },
  { time: "10:30", motion: 5, fps: 7 },
  { time: "10:35", motion: 3, fps: 6 },
];

const labels = timelineData.map((p) => p.time);

const motionTimelineData: ChartData<"line"> = {
  labels,
  datasets: [
    {
      label: "Motion Variance (%)",
      data: timelineData.map((p) => p.motion),
      borderColor: "#3B82F6",
      backgroundColor: "rgba(59,130,246,0.2)",
      tension: 0.35,
      borderWidth: 3,
      pointRadius: 4,
      pointBackgroundColor: "#1D4ED8",
      yAxisID: "y",
      fill: true,
    },
    {
      label: "Adaptive FPS",
      data: timelineData.map((p) => p.fps),
      borderColor: "#8B5CF6",
      backgroundColor: "rgba(139,92,246,0.16)",
      tension: 0.35,
      borderWidth: 2,
      pointRadius: 3,
      pointBackgroundColor: "#8B5CF6",
      yAxisID: "y1",
      fill: false,
    },
  ],
};

const motionTimelineOptions: ChartOptions<"line"> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: true, position: "top" },
    tooltip: {
      mode: "index",
      intersect: false,
      callbacks: {
        label: (ctx: TooltipItem<"line">) => {
          const label = ctx.dataset.label ?? "";
          const value = ctx.parsed.y ?? 0;
          return `${label}: ${value.toFixed(1)}${label.includes("Motion") ? " %" : " FPS"}`;
        },
      },
    },
  },
  scales: {
    x: {
      grid: { color: "rgba(229,231,235,0.6)" },
      ticks: { color: "#6B7280", font: { size: 11 } },
    },
    y: {
      type: "linear",
      position: "left",
      min: 0,
      max: 25,
      grid: { color: "rgba(209,213,219,0.5)" },
      ticks: {
        color: "#6B7280",
        font: { size: 11 },
        callback: (value) => `${value}%`,
      },
      title: {
        display: true,
        text: "Motion Variance (%)",
        color: "#6B7280",
        font: { size: 11 },
      },
    },
    y1: {
      type: "linear",
      position: "right",
      min: 0,
      max: 24,
      grid: { drawOnChartArea: false },
      ticks: {
        color: "#6B21A8",
        font: { size: 11 },
        callback: (value) => `${value} FPS`,
      },
      title: {
        display: true,
        text: "Adaptive FPS",
        color: "#6B21A8",
        font: { size: 11 },
      },
    },
  },
  interaction: { mode: "index", intersect: false },
  animation: { duration: 900 },
};

const MotionTimeline: React.FC = () => {
  return (
    <Card className="col-span-1 xl:col-span-2">
      <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">
        Motion Stability & Adaptive Capture Timeline
      </h3>
      <p className="text-xs md:text-sm text-gray-500 mb-4">
        System increases FPS during high motion or instability, and safely
        reduces FPS during stable segments to save compute and storage.
      </p>
      <div className="relative w-full h-64 md:h-72">
        {/* background bands to hint stable/warning/burst */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-emerald-50 via-amber-50 to-rose-50 opacity-70 pointer-events-none" />
        <div className="relative w-full h-full">
          <Line data={motionTimelineData} options={motionTimelineOptions} />
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-3 text-[11px] text-gray-500">
        <span className="inline-flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-emerald-100 border border-emerald-400" />
          Stable motion zone
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-amber-100 border border-amber-400" />
          Moderate vibration (adaptive FPS)
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-rose-100 border border-rose-400" />
          High instability (burst capture)
        </span>
      </div>
    </Card>
  );
};

export default MotionTimeline;
