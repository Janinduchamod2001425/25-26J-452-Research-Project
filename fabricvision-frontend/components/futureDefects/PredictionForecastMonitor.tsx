"use client";

import { FiMapPin, FiAlertTriangle, FiEye } from "react-icons/fi";

interface Props {
  predictions: number[];
}

const PredictionForecastMonitor = ({ predictions }: Props) => {
  if (!predictions || predictions.length === 0) return null;

  const first = predictions[0];

  return (
    <div className="bg-white rounded-xl p-6 border shadow-sm">
      <h3 className="text-lg font-bold mb-4 text-gray-800">
        Future Defect Forecast (Next 30 Positions)
      </h3>

      <div className="overflow-y-auto max-h-[420px]">
        <table className="w-full text-sm">
          <thead className="text-gray-500 border-b">
            <tr>
              <th className="text-left py-2">Step</th>
              <th className="text-left py-2">Predicted Position</th>
              <th className="text-left py-2">Interval</th>
              <th className="text-left py-2">Inspection Priority</th>
            </tr>
          </thead>

          <tbody>
            {predictions.map((pos, i) => {

              const prev = i === 0 ? first : predictions[i - 1];
              const interval = pos - prev;

              let status = "Monitor";
              let color = "text-green-600";
              let icon = <FiEye />;

              if (interval < 20) {
                status = "Immediate Check";
                color = "text-red-600";
                icon = <FiAlertTriangle />;
              }
              else if (interval < 40) {
                status = "Inspect Soon";
                color = "text-yellow-600";
                icon = <FiAlertTriangle />;
              }

              return (
                <tr
                  key={i}
                  className="border-b hover:bg-gray-50 transition"
                >
                  <td className="py-2 font-medium">+{i + 1}</td>

                  <td className="py-2 flex items-center gap-2 text-indigo-600 font-semibold">
                    <FiMapPin />
                    {pos} cm
                  </td>

                  <td className="py-2 text-gray-700">
                    {interval} cm
                  </td>

                  <td className={`py-2 flex items-center gap-2 ${color}`}>
                    {icon}
                    {status}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-500 mt-4">
        Generated using Model A interval prediction based on historical defect patterns.
      </p>
    </div>
  );
};

export default PredictionForecastMonitor;