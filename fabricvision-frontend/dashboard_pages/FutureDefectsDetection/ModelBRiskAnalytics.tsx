"use client";

import React from "react";
import { useModelBAnalytics } from "@/hooks/useModelBAnalytics";
import SupplierInputPanel from "@/components/futureDefects/SupplierInputPanel";
import ShapContributionPanel from "@/components/futureDefects/ShapContributionPanel";
import ShapSummaryImage from "@/components/futureDefects/ShapSummaryImage";

const ModelBRiskAnalytics = () => {

  const { data, loading, error, predict } = useModelBAnalytics();

  return (
    <div className="space-y-6">

      <h2 className="text-2xl font-bold">
        MODEL B — Risk & RCA Analytics
      </h2>

      {/* Supplier input */}
      <SupplierInputPanel onSubmit={predict} />

      {loading && (
        <p className="text-gray-500">Analyzing supplier risk...</p>
      )}

      {error && (
        <p className="text-red-600">{error}</p>
      )}

      {data && (

        <>
        
        {/* Metrics */}
        <div className="grid grid-cols-3 gap-4">

          <Metric
            title="Supplier Risk Score"
            value={data.supplier_risk_score.toFixed(3)}
          />

          <Metric
            title="Roll Risk Score"
            value={`${(data.roll_risk_score*100).toFixed(1)} %`}
          />

          <Metric
            title="Root Cause"
            value={mapRCA(data.root_cause_class)}
          />

        </div>

        {/* Explainability */}
        <ShapContributionPanel risk={data.roll_risk_score} />

        <ShapSummaryImage />

        </>

      )}

    </div>
  );
};

const Metric = ({ title, value }: any) => (

  <div className="bg-white p-6 rounded-xl border shadow-sm">

    <p className="text-sm text-gray-500">{title}</p>

    <p className="text-2xl font-bold">{value}</p>

  </div>

);

const mapRCA = (c: number) => {
  switch (c) {
    case 0:
      return "Supplier Quality Issue";
    case 1:
      return "Pattern Repetition Issue";
    case 2:
      return "Fabric Structure Weakness";
    case 3:
      return "High Defect Density";
    case 4:
      return "Random Defect Occurrence";
    default:
      return "Unknown";
  }
};

export default ModelBRiskAnalytics;