"use client";

export default function PerformanceCard() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm space-y-3">
      <h2 className="text-lg font-semibold text-slate-900">
        Performance Metrics
      </h2>

      {[
        ["System Uptime", "99.9%"],
        ["Average FPS", "28"],
        ["Latency", "62 ms"],
        ["Active Alerts", "3"],
      ].map(([label, value]) => (
        <div
          key={label}
          className="flex justify-between bg-slate-50 rounded-xl px-4 py-3"
        >
          <span className="text-slate-500 text-sm">{label}</span>
          <span className="font-semibold text-slate-900">{value}</span>
        </div>
      ))}
    </div>
  );
}
