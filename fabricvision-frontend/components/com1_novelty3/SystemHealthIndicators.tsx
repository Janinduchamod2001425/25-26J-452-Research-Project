"use client";

import React from "react";
import Card from "./Card";

interface HealthItem {
  label: string;
  status: "ok" | "warning" | "error";
  detail: string;
}

const items: HealthItem[] = [
  {
    label: "Camera Sync",
    status: "ok",
    detail: "Frame timestamps aligned with motion signals.",
  },
  {
    label: "Motion Sensor Stream",
    status: "ok",
    detail: "No dropped packets in last 5 minutes.",
  },
  {
    label: "Autoencoder Latency",
    status: "warning",
    detail: "Avg 38 ms per frame. Still within edge budget.",
  },
  {
    label: "Capture Loop Health",
    status: "ok",
    detail: "No buffer overflows reported.",
  },
];

const statusColor: Record<
  HealthItem["status"],
  { dot: string; text: string; badge: string }
> = {
  ok: {
    dot: "bg-emerald-500",
    text: "text-emerald-700",
    badge: "bg-emerald-50 text-emerald-700",
  },
  warning: {
    dot: "bg-amber-500",
    text: "text-amber-700",
    badge: "bg-amber-50 text-amber-700",
  },
  error: {
    dot: "bg-red-500",
    text: "text-red-700",
    badge: "bg-red-50 text-red-700",
  },
};

const SystemHealthIndicators: React.FC = () => {
  return (
    <Card>
      <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">
        System Health & Latency
      </h3>
      <p className="text-xs md:text-sm text-gray-500 mb-4">
        Quick health snapshot of all components participating in adaptive
        capture and pre-screening.
      </p>

      <div className="space-y-3">
        {items.map((item) => {
          const style = statusColor[item.status];
          return (
            <div
              key={item.label}
              className="flex items-start justify-between gap-3"
            >
              <div className="flex items-start gap-3 flex-1">
                <span
                  className={`mt-1 w-2 h-2 rounded-full ${style.dot} shadow-sm`}
                />
                <div>
                  <p className="text-xs font-semibold text-gray-800">
                    {item.label}
                  </p>
                  <p className="text-[11px] text-gray-500">{item.detail}</p>
                </div>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${style.badge}`}
              >
                {item.status.toUpperCase()}
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default SystemHealthIndicators;
