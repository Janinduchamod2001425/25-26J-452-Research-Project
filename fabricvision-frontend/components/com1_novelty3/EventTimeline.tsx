"use client";

import React from "react";
import Card from "./Card";

interface EventItem {
  time: string;
  label: string;
  detail: string;
  severity: "info" | "warning" | "critical";
}

const events: EventItem[] = [
  {
    time: "10:02:12",
    label: "Burst capture activated",
    detail: "Motion variance crossed high-risk band (14%). FPS raised to 18.",
    severity: "warning",
  },
  {
    time: "10:04:35",
    label: "Roller slip detected",
    detail: "Right tension roller drifted. Region flagged for YOLO focus.",
    severity: "critical",
  },
  {
    time: "10:06:44",
    label: "Stability recovered",
    detail:
      "Variance back to stable window (<3%). FPS safely reduced to 6 again.",
    severity: "info",
  },
  {
    time: "10:09:03",
    label: "Irregularity window forwarded",
    detail:
      "Segment [frames 1035–1050] tagged as high risk and forwarded to the fog layer for targeted enhancement.",
    severity: "warning",
  },
];

const severityStyles: Record<
  EventItem["severity"],
  { dot: string; badge: string }
> = {
  info: {
    dot: "bg-blue-500",
    badge: "bg-blue-50 text-blue-700",
  },
  warning: {
    dot: "bg-amber-500",
    badge: "bg-amber-50 text-amber-700",
  },
  critical: {
    dot: "bg-red-500",
    badge: "bg-red-50 text-red-700",
  },
};

const EventTimeline: React.FC = () => {
  return (
    <Card>
      <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">
        Key Capture & Motion Events
      </h3>
      <p className="text-xs md:text-sm text-gray-500 mb-4">
        Summarizes when the system changed capture behaviour or detected
        critical motion patterns. Useful for explainability during audits.
      </p>

      <div className="flex overflow-x-auto gap-4 pb-2">
        {events.map((e) => {
          const style = severityStyles[e.severity];
          return (
            <div
              key={e.time + e.label}
              className="min-w-[220px] max-w-xs rounded-2xl border border-gray-100 bg-gray-50/60 p-4 flex flex-col gap-2"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${style.dot} shadow-sm`}
                  />
                  <span className="text-[11px] font-mono text-gray-500">
                    {e.time}
                  </span>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${style.badge}`}
                >
                  {e.severity.toUpperCase()}
                </span>
              </div>
              <p className="text-xs font-semibold text-gray-800">{e.label}</p>
              <p className="text-[11px] text-gray-600">{e.detail}</p>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default EventTimeline;
