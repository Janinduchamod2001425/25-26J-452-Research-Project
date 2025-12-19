// import AlertCard from "./AlertCard";

// const alerts = [
//   {
//     id: 1,
//     level: "Medium",
//     message: "Low lighting",
//     time: "2:57 PM",
//     date: "Nov 17 2025",
//   },
//   {
//     id: 2,
//     level: "High",
//     message: "FPS dropped",
//     time: "2:54 PM",
//     date: "Nov 17 2025",
//   },
// ];

// export default function AlertsPanel() {
//   return (
//     <section className="bg-white rounded-2xl p-6 shadow-sm">
//       <h2 className="text-lg font-semibold text-slate-900 mb-4">
//         Active Alerts
//       </h2>
//       <div className="space-y-3">
//         {alerts.map((a) => (
//           <AlertCard key={a.id} alert={a} />
//         ))}
//       </div>
//     </section>
//   );
// }

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
