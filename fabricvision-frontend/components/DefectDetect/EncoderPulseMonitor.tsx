// components/DefectDetect/EncoderPulseMonitor.tsx
"use client";
import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Filler,
  Title,
} from "chart.js";
import { FiActivity, FiTrendingUp, FiRefreshCw } from "react-icons/fi";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Filler, Title);

const EncoderPulseMonitor = () => {
  const data = {
    labels: ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"],
    datasets: [
      {
        label: "Pulse Rate",
        data: [65, 78, 90, 85, 93, 88, 95, 92],
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: "#3b82f6",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: "rgba(15, 23, 42, 0.9)",
        titleColor: "#ffffff",
        bodyColor: "#ffffff",
        padding: 12,
        cornerRadius: 6,
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        min: 60,
        max: 100,
        grid: {
          color: "rgba(226, 232, 240, 0.5)",
        },
        ticks: {
          color: "#64748b",
          font: {
            size: 11,
          },
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: "#64748b",
          font: {
            size: 11,
          },
        },
      },
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-6">
      JJ
    </div>
  );
};

export default EncoderPulseMonitor;