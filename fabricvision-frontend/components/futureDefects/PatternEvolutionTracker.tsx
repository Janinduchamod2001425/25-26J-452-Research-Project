"use client";

const PatternEvolutionTracker = ({ predictions }: { predictions: number[] }) => {
  if (predictions.length < 3) return null;

  const interval = predictions[1] - predictions[0];

  const pattern =
    interval < 0.5 ? "Repeating" : interval < 1.5 ? "Drifting" : "Irregular";

  return (
    <div className="bg-white p-6 rounded-xl">
      <h3 className="font-bold">Pattern Evolution</h3>
      <p>Current Pattern: {pattern}</p>
      <p>Change Risk: {pattern === "Repeating" ? "Low" : "Medium"}</p>
    </div>
  );
};

export default PatternEvolutionTracker;
