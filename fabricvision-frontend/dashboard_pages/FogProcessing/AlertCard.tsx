export default function AlertCard({
  alert,
}: {
  alert: {
    id: number;
    level: string;
    message: string;
    time: string;
    date: string;
  };
}) {
  const bg =
    alert.level === "High"
      ? "bg-red-50 text-red-700"
      : "bg-amber-50 text-amber-700";

  return (
    <div className={`flex items-start rounded-xl px-4 py-3 ${bg}`}>
      <span className="mt-0.5 mr-3">⚠️</span>
      <div>
        <p className="text-xs font-semibold">{alert.level} Alert</p>
        <p className="text-xs text-slate-700">{alert.message}</p>
        <p className="text-[10px] text-slate-500 mt-1">
          {alert.time} · {alert.date}
        </p>
      </div>
    </div>
  );
}
