export default function StatusPill({ status }: { status: string }) {
  const styles =
    status === "High Risk"
      ? "bg-amber-50 text-amber-700"
      : "bg-emerald-50 text-emerald-700";

  return (
    <span
      className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${styles}`}
    >
      {status}
    </span>
  );
}
