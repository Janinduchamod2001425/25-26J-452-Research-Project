"use client";

const OperatorActionPanel = ({ predictions }: { predictions: number[] }) => {
  if (predictions.length === 0) return null;

  const zone = `${predictions[0]} – ${predictions[2]} m`;

  return (
    <div className="bg-red-50 p-6 rounded-xl">
      <h3 className="font-bold text-red-700">Operator Recommendation</h3>
      <p><b>Action:</b> Inspect Fabric</p>
      <p><b>Zone:</b> {zone}</p>
      <p><b>Reason:</b> Model A predicts imminent defect</p>
    </div>
  );
};

export default OperatorActionPanel;
