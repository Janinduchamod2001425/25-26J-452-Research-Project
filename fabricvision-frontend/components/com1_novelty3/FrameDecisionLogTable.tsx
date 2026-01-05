"use client";

import React, { useMemo, useState } from "react";
import { DemoFrame } from "@/store/novelty3DemoStore";

interface Props {
  frames: DemoFrame[];
}

const PAGE_SIZE = 10;

const badge = (text: string, color: string) => (
  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${color}`}>
    {text}
  </span>
);

const FrameDecisionLogTable: React.FC<Props> = ({ frames }) => {
  const [page, setPage] = useState(1);

  const totalPages = Math.ceil(frames.length / PAGE_SIZE);

  const pageFrames = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return frames.slice(start, start + PAGE_SIZE);
  }, [frames, page]);

  return (
    <div className="bg-white rounded-2xl border shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Live Frame Quality Decision Log
        </h3>
        <span className="text-sm text-gray-500">
          Showing {pageFrames.length} of {frames.length}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 border">Frame ID</th>
              <th className="px-3 py-2 border">Type</th>
              <th className="px-3 py-2 border">FIS</th>
              <th className="px-3 py-2 border">Capture Motion</th>
              <th className="px-3 py-2 border">Quality</th>
              <th className="px-3 py-2 border">Risk</th>
              <th className="px-3 py-2 border">Decision</th>
            </tr>
          </thead>

          <tbody>
            {pageFrames.map((f) => (
              <tr key={f.id} className="text-center">
                <td className="px-3 py-2 border font-mono">
                  #{f.id.toString().slice(-4)}
                </td>

                <td className="px-3 py-2 border">
                  {badge(
                    f.frame_type,
                    f.frame_type === "irregular"
                      ? "bg-red-50 text-red-700"
                      : "bg-amber-50 text-amber-700",
                  )}
                </td>

                <td className="px-3 py-2 border">{f.fis.toFixed(3)}</td>

                <td className="px-3 py-2 border">
                  {f.motion.prediction} ({f.motion.confidence.toFixed(2)})
                </td>

                <td className="px-3 py-2 border">
                  {badge(
                    f.assessment?.frame_quality ?? "-",
                    f.assessment?.frame_quality === "good"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-red-50 text-red-700",
                  )}
                </td>

                <td className="px-3 py-2 border">
                  {badge(
                    f.assessment?.risk_level ?? "-",
                    f.assessment?.risk_level === "critical"
                      ? "bg-red-100 text-red-800"
                      : f.assessment?.risk_level === "high"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-emerald-100 text-emerald-800",
                  )}
                </td>

                <td className="px-3 py-2 border">
                  {badge(
                    f.route ?? "-",
                    f.route === "to_next_component"
                      ? "bg-emerald-50 text-emerald-700"
                      : f.route === "to_fog"
                        ? "bg-indigo-50 text-indigo-700"
                        : "bg-red-50 text-red-700",
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-end gap-2 mt-4">
        <button
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
          className="px-3 py-1 rounded bg-gray-200 text-sm disabled:opacity-40"
        >
          Prev
        </button>

        <span className="text-sm text-gray-600 self-center">
          Page {page} / {totalPages}
        </span>

        <button
          disabled={page === totalPages}
          onClick={() => setPage((p) => p + 1)}
          className="px-3 py-1 rounded bg-indigo-600 text-white text-sm disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default FrameDecisionLogTable;
