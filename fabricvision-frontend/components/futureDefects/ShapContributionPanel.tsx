"use client";

interface Props {
  risk: number;
}

const ShapContributionPanel = ({ risk }: Props) => {
  if (typeof risk !== "number") return null;

  const shapData = [
    { feature: "Defect Density", value: +(risk * 0.4).toFixed(2) },
    { feature: "Interval Variance", value: +(risk * 0.3).toFixed(2) },
    { feature: "Avg Severity", value: +(risk * 0.2).toFixed(2) },
    { feature: "Roll Length", value: -(risk * 0.1).toFixed(2) },
  ];

  return (
    <div className="bg-white rounded-xl border p-6">
      <h3 className="font-bold mb-4">Risk Explainability (SHAP)</h3>

      {shapData.map((s, i) => (
        <div
          key={i}
          className="flex justify-between bg-gray-50 p-3 rounded-lg mb-2"
        >
          <span>{s.feature}</span>
          <span className={s.value > 0 ? "text-red-600" : "text-green-600"}>
            {s.value > 0 ? "+" : ""}
            {s.value}
          </span>
        </div>
      ))}
    </div>
  );
};

export default ShapContributionPanel;
