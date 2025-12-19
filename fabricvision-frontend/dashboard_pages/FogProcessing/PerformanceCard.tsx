import MetricRow from "./MetricRow";

export default function PerformanceCard() {
  return (
    <section className="bg-white rounded-2xl p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900 mb-4">
        Performance Metrics
      </h2>

      <div className="space-y-3">
        <MetricRow label="System Uptime" value="99.9%" trend="up" />
        <MetricRow label="Average FPS" value="28 fps" trend="up" />
        <MetricRow label="Average Latency" value="62 ms" trend="flat" />
        <MetricRow label="Current Alerts" value="2" trend="warn" />
      </div>
    </section>
  );
}
