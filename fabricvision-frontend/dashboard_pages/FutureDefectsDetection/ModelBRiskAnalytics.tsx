"use client";

import React from "react";
import { useModelBAnalytics } from "@/hooks/useModelBAnalytics";
import RollFeatureInputPanel from "@/components/futureDefects/RollFeatureInputPanel";
import ShapContributionPanel from "@/components/futureDefects/ShapContributionPanel";
import ShapSummaryImage from "@/components/futureDefects/ShapSummaryImage";

import { FiTrendingUp, FiAlertTriangle } from "react-icons/fi";

const ModelBRiskAnalytics = () => {
  const { data, loading, error, predict } = useModelBAnalytics();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">
        MODEL B — Risk & RCA Analytics
      </h2>

      {/* 🔹 INPUT PANEL */}
      <RollFeatureInputPanel onSubmit={predict} />

      {loading && <p className="text-gray-500">Analyzing risk...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {data && (
        <>
          {/* METRICS */}
          <div className="grid grid-cols-3 gap-4">
            <Metric
              title="Risk Score"
              value={data.risk_score.toFixed(2)}
              icon={FiTrendingUp}
            />
            <Metric
              title="Pattern Class"
              value={mapPattern(data.pattern_class)}
            />
            <Metric
              title="Root Cause"
              value={mapRCA(data.rca_class)}
              icon={FiAlertTriangle}
            />
          </div>

          {/* EXPLAINABILITY */}
          <ShapContributionPanel risk={data.risk_score} />
          <ShapSummaryImage />
        </>
      )}
    </div>
  );
};

const Metric = ({ title, value, icon: Icon }: any) => (
  <div className="bg-white p-6 rounded-xl border">
    <div className="flex items-center gap-2 text-sm text-gray-600">
      {Icon && <Icon className="text-indigo-600" />}
      {title}
    </div>
    <p className="text-2xl font-bold">{value}</p>
  </div>
);

const mapPattern = (c: number) =>
  c === 0 ? "Repeating" : c === 1 ? "Drifting" : "Irregular";

const mapRCA = (c: number) =>
  c === 0 ? "Material Issue" : c === 1 ? "Machine Issue" : "Operator Issue";

export default ModelBRiskAnalytics;