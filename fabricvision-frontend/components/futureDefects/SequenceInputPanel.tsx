"use client";

import React, { useState } from "react";

interface Props {
  onSubmit: (sequence: number[][]) => void;
}

const defaultJson = `[
  [0.10, 2.0, 1.1, 0.3],
  [0.12, 2.1, 1.2, 0.4],
  [0.14, 2.0, 1.3, 0.5],
  [0.16, 2.2, 1.2, 0.4],
  [0.18, 2.1, 1.4, 0.6],
  [0.20, 2.3, 1.5, 0.7],
  [0.22, 2.4, 1.6, 0.8],
  [0.24, 2.5, 1.7, 0.9],
  [0.26, 2.6, 1.8, 1.0],
  [0.28, 2.7, 1.9, 1.1]
]`;

const SequenceInputPanel: React.FC<Props> = ({ onSubmit }) => {
  const [text, setText] = useState(defaultJson);
  const [error, setError] = useState("");

  const handleRun = () => {
    try {
      const parsed = JSON.parse(text);
      if (!Array.isArray(parsed) || parsed.length !== 10) {
        throw new Error("Sequence must contain exactly 10 rows");
      }
      onSubmit(parsed);
      setError("");
    } catch (e: any) {
      setError(e.message || "Invalid JSON format");
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl border space-y-3">
      <h3 className="font-bold text-gray-800">
        Input Detection Sequence (Last 10)
      </h3>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={10}
        className="w-full font-mono text-sm p-3 border rounded-lg"
      />

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <button
        onClick={handleRun}
        className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
      >
        Run Prediction
      </button>
    </div>
  );
};

export default SequenceInputPanel;
