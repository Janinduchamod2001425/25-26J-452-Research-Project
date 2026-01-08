"use client";

import { FiMapPin } from "react-icons/fi";

const PredictionForecastMonitor = ({ predictions }: { predictions: number[] }) => {
  return (
    <div className="bg-white rounded-xl p-6">
      <h3 className="font-bold mb-4">Next 10 Defect Positions</h3>

      <table className="w-full">
        <tbody>
          {predictions.map((pos, i) => (
            <tr key={i} className="border-b">
              <td className="py-2">+{i + 1}</td>
              <td className="py-2 flex items-center gap-2">
                <FiMapPin className="text-indigo-600" />
                {pos} m
              </td>
              <td className="py-2">
                {pos - predictions[0] < 2 ? "Inspect" : "Monitor"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PredictionForecastMonitor;
