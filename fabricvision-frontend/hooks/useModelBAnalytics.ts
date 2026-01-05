"use client";

import { useState } from "react";

const API_URL = "http://127.0.0.1:8000/modelB/predict";

export interface ModelBResponse {
  risk_score: number;
  pattern_class: number;
  rca_class: number;
}

export const useModelBAnalytics = () => {
  const [data, setData] = useState<ModelBResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const predict = async (features: number[]) => {
    setLoading(true);
    setError(null);

    try {
      const payload = {
        SupplierEnc: features[0],
        RollLength: features[1],
        DefectCount: features[2],
        AvgSeverity: features[3],
        DefectDensity: features[4],
        MeanInterval: features[5],
        StdInterval: features[6],
      };

      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Server error");
      }

      const json = await res.json();

      setData({
        risk_score: json.risk_score,
        pattern_class: json.pattern_class,
        rca_class: json.rca_class,
      });
    } catch (err: any) {
      setError(err.message || "Failed to fetch Model B analytics");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, predict };
};
