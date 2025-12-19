export default function AlertsPanel() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm space-y-3">
      <h2 className="text-lg font-semibold">Active Alerts</h2>

      {["Low lighting detected", "FPS dropped below threshold"].map(
        (msg, i) => (
          <div
            key={i}
            className="bg-amber-50 text-amber-700 rounded-xl px-4 py-3"
          >
            ⚠️ {msg}
          </div>
        )
      )}
    </div>
  );
}
