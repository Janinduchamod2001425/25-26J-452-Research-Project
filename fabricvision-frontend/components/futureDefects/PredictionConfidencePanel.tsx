"use client";

const PredictionConfidencePanel = ({ predictions }: { predictions: number[] }) => {
  if (predictions.length < 2) return null;

  const intervals = predictions.slice(1).map((v, i) => v - predictions[i]);
  const variance =
    intervals.reduce((a, b) => a + Math.abs(b - intervals[0]), 0) / intervals.length;

  return (
    <div className="bg-white p-6 rounded-xl">
      <h3 className="font-bold">Prediction Confidence</h3>
      <p>Variance: ±{variance.toFixed(2)} m</p>
      <p>Stability: {variance < 0.3 ? "Stable" : "Drifting"}</p>
    </div>
  );
};

export default PredictionConfidencePanel;
