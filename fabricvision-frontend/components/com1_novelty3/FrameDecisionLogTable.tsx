"use client";

import React, { useMemo, useState } from "react";
import { DemoFrame } from "@/store/novelty3DemoStore";

const PAGE_SIZE = 10;

const getBadgeClass = (type: string, value: string) => {
  switch (type) {
    case "frame_type":
      return value === "irregular"
        ? "bg-red-50 text-red-700 border-red-200"
        : "bg-amber-50 text-amber-700 border-amber-200";

    case "quality":
      return value === "good"
        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
        : "bg-red-50 text-red-700 border-red-200";

    case "risk":
      return value === "critical"
        ? "bg-red-100 text-red-800 border-red-300"
        : value === "high"
          ? "bg-amber-100 text-amber-800 border-amber-300"
          : "bg-emerald-100 text-emerald-800 border-emerald-300";

    case "decision":
      return value === "to_next_component"
        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
        : value === "to_fog"
          ? "bg-indigo-50 text-indigo-700 border-indigo-200"
          : "bg-red-50 text-red-700 border-red-200";

    default:
      return "bg-gray-100 text-gray-700 border-gray-300";
  }
};

const getDecisionLabel = (route: string) => {
  switch (route) {
    case "to_next_component":
      return "→ Next Component";
    case "to_fog":
      return "→ Fog Enhancement";
    case "hold_drop":
      return "Hold/Drop";
    default:
      return route;
  }
};

// Helper function to get motion color safely
const getMotionColor = (prediction: string) => {
  switch (prediction) {
    case "active":
      return "bg-green-500";
    case "unstable":
      return "bg-amber-500";
    default:
      return "bg-gray-400";
  }
};

const FrameDecisionLogTable: React.FC<{ frames: DemoFrame[] }> = ({
  frames,
}) => {
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<
    "all" | "to_next_component" | "to_fog" | "hold_drop"
  >("all");

  const filteredFrames = useMemo(() => {
    if (filter === "all") return frames;
    return frames.filter((f) => f.route === filter);
  }, [frames, filter]);

  const totalPages = Math.max(1, Math.ceil(filteredFrames.length / PAGE_SIZE));

  const pageFrames = filteredFrames.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  const filterStats = useMemo(
    () => ({
      all: frames.length,
      to_next_component: frames.filter((f) => f.route === "to_next_component")
        .length,
      to_fog: frames.filter((f) => f.route === "to_fog").length,
      hold_drop: frames.filter((f) => f.route === "hold_drop").length,
    }),
    [frames],
  );

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Frame Decision Log
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            Live assessment history with filtering
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-sm">
            <span className="text-gray-600">Showing</span>
            <span className="mx-1 font-semibold text-gray-900">
              {filteredFrames.length}
            </span>
            <span className="text-gray-600">of {frames.length} frames</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { key: "all", label: "All Frames", icon: "📋" },
          { key: "to_next_component", label: "Usable", icon: "✅" },
          { key: "to_fog", label: "Needs Enhancement", icon: "🔧" },
          { key: "hold_drop", label: "Held/Dropped", icon: "⏸️" },
        ].map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => {
              setFilter(key as any);
              setPage(1);
            }}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
              filter === key
                ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
            }`}
          >
            <span>{icon}</span>
            <span className="text-sm font-medium">{label}</span>
            <span
              className={`text-xs px-1.5 py-0.5 rounded-full ${
                filter === key
                  ? "bg-indigo-100 text-indigo-700"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              {filterStats[key as keyof typeof filterStats]}
            </span>
          </button>
        ))}
      </div>

      {/* Table Container */}
      <div className="overflow-hidden rounded-xl border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-300">
                  Frame ID
                </th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-300">
                  Type
                </th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-300">
                  FIS Score
                </th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-300">
                  Motion
                </th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-300">
                  Quality
                </th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-300">
                  Risk Level
                </th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-300">
                  Decision
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {pageFrames.map((f) => (
                <tr key={f.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-mono text-sm font-semibold text-gray-900">
                      #{f.id.toString().slice(-6)}
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getBadgeClass("frame_type", f.frame_type)}`}
                    >
                      {f.frame_type.toUpperCase()}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full ${f.fis > 0.7 ? "bg-emerald-500" : f.fis > 0.4 ? "bg-amber-500" : "bg-red-500"}`}
                          style={{ width: `${Math.min(f.fis * 100, 100)}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {f.fis.toFixed(3)}
                      </span>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      {/* Fixed: Using helper function to avoid TypeScript comparison error */}
                      <div
                        className={`h-2 w-2 rounded-full ${getMotionColor(f.motion.prediction)}`}
                      />
                      <span className="text-sm text-gray-700 capitalize">
                        {f.motion.prediction}
                      </span>
                      <span className="text-xs text-gray-500">
                        ({f.motion.confidence.toFixed(1)})
                      </span>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getBadgeClass("quality", f.assessment?.frame_quality || "")}`}
                    >
                      {f.assessment?.frame_quality || "-"}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getBadgeClass("risk", f.assessment?.risk_level || "")}`}
                    >
                      {f.assessment?.risk_level || "-"}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <div className="flex flex-col gap-1">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getBadgeClass("decision", f.route || "")}`}
                      >
                        {getDecisionLabel(f.route || "")}
                      </span>
                      <span className="text-xs text-gray-500">
                        {f.assessment?.action || ""}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {pageFrames.length === 0 && (
          <div className="py-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h4 className="text-gray-700 font-medium mb-2">No frames found</h4>
            <p className="text-gray-500 text-sm">
              {filter === "all"
                ? "Add frames using the control panel above"
                : `No frames with "${filter}" decision found`}
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="mt-6 flex items-center justify-between">
        <div className="text-sm text-gray-500">
          Showing{" "}
          <span className="font-semibold text-gray-900">
            {filteredFrames.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}
          </span>{" "}
          to{" "}
          <span className="font-semibold text-gray-900">
            {Math.min(page * PAGE_SIZE, filteredFrames.length)}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-gray-900">
            {filteredFrames.length}
          </span>{" "}
          entries
        </div>

        <div className="flex items-center gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Previous
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                    page === pageNum
                      ? "bg-indigo-600 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            {totalPages > 5 && <span className="px-2 text-gray-500">...</span>}
          </div>

          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            Next
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default FrameDecisionLogTable;
