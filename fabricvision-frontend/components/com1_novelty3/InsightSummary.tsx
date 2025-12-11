"use client";

import React from "react";
import Card from "./Card";

const InsightSummary: React.FC = () => {
  return (
    <Card>
      <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">
        Session Insight Summary
      </h3>
      <p className="text-xs md:text-sm text-gray-600 leading-relaxed">
        During the last monitoring window, the motion-aware capture engine
        operated with an average FPS of{" "}
        <span className="font-semibold">11.2</span>, safely reducing the overall
        frame volume by approximately{" "}
        <span className="font-semibold">62.6%</span> compared to a fixed 30 FPS
        setup. Motion spikes were concentrated in the{" "}
        <span className="font-semibold">right warp tension zone</span>, which
        triggered short bursts of high FPS and ensured that all high-risk
        segments were forwarded to the anomaly pre-screen (Novelty 2) and defect
        detection pipeline (Component 3).
      </p>
      <p className="mt-2 text-xs md:text-sm text-gray-600 leading-relaxed">
        By combining <span className="font-semibold">motion variance</span>,
        <span className="font-semibold"> localized tension analysis</span>, and{" "}
        <span className="font-semibold">FIS-based anomaly scoring</span>,
        Novelty 3 provides an edge-level quality lens that is both
        computationally efficient and operationally explainable to supervisors
        and engineers.
      </p>
    </Card>
  );
};

export default InsightSummary;
