export default function MetricCard({
  title,
  value,
  color,
  note,
}: {
  title: string;
  value: string;
  color: string;
  note: string;
}) {
  return (
    <div className="bg-slate-50 rounded-xl p-4">
      <p className="text-xs uppercase tracking-wide text-slate-500">{title}</p>
      <p className={`text-3xl font-bold mt-2 ${color}`}>{value}</p>
      <p className="text-xs text-slate-500 mt-1">{note}</p>
    </div>
  );
}
