"use client";

import React, { useState } from "react";

interface DefectRecord {
  defect_type: string;
  position_cm: number;
  timestamp: string;
}

interface Props {
  onSubmit: (defects: DefectRecord[]) => void;
}

const defaultJson = `[
  {"defect_type":"hole","position_cm":47,"timestamp":"2026-05-01_14-29-34"},
  {"defect_type":"hole","position_cm":62,"timestamp":"2026-05-01_14-29-40"},
  {"defect_type":"hole","position_cm":77,"timestamp":"2026-05-01_14-29-45"},
  {"defect_type":"hole","position_cm":92,"timestamp":"2026-05-01_14-29-50"},
  {"defect_type":"hole","position_cm":107,"timestamp":"2026-05-01_14-29-55"}
]`;

const SequenceInputPanel: React.FC<Props> = ({ onSubmit }) => {
  const [text, setText] = useState(defaultJson);
  const [error, setError] = useState("");

  const handleRun = () => {
    try {
      const parsed = JSON.parse(text);

      if (!Array.isArray(parsed) || parsed.length < 5) {
        throw new Error("Need at least 5 defect records");
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
        Recent Defects (Last 5+)
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