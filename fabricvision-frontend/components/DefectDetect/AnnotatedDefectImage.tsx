// components/DefectDetect/AnnotatedDefectImage.tsx
"use client";

import { defectData } from "@/data/defectData";
import { FiMaximize2, FiDownload, FiCamera, FiPlay, FiPause } from "react-icons/fi";
import { useState } from "react";

const AnnotatedDefectImage = () => {
  const { annotatedImage, encoder } = defectData;
  const [isPlaying, setIsPlaying] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
      FF
    </div>
  );
};

export default AnnotatedDefectImage;