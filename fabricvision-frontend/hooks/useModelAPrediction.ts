"use client";

import { useState } from "react";

const API_URL = "http://127.0.0.1:8000/modelA/predict";

export const useModelAPrediction = () => {
  const [predictions, setPredictions] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const predict = async (defects: any[], steps = 30) => {
  setLoading(true);
  setError(null);

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        defects,
        steps
      }),
    });

    const json = await res.json();
    setPredictions(json.next_positions_cm);
  } catch (e) {
    setError("Model A prediction failed");
  } finally {
    setLoading(false);
  }
};

  return { predictions, loading, error, predict };
};