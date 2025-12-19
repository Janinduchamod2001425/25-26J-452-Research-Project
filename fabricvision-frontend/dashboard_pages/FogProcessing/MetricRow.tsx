export default function MetricRow({
  label,
  value,
  trend,
}: {
  label: string;
  value: string;
  trend: "up" | "flat" | "warn";
}) {
  const trendIcon = trend === "up" ? "📈" : trend === "flat" ? "➖" : "⚠️";
  const trendColor = trend === "warn" ? "text-amber-600" : "text-emerald-600";

  return (
    <div className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3">
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-base font-semibold text-slate-900">{value}</p>
      </div>
      <span className={`text-lg ${trendColor}`}>{trendIcon}</span>
    </div>
  );
}
