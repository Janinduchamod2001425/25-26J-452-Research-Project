"use client";

import { defectData } from "@/data/defectData";
import { FiMaximize2, FiDownload, FiCamera, FiPlay, FiPause, FiClock, FiZap, FiTarget, FiPieChart, FiAlertCircle } from "react-icons/fi";
import { useState, useEffect } from "react";

interface AnnotatedDefectImageProps {
  apiData?: any;
}

interface DefectBox {
  id: number;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  colorClass: string;
  textColorClass: string;
  severity: string;
}

interface ColorMap {
  [key: string]: string;
}

const AnnotatedDefectImage: React.FC<AnnotatedDefectImageProps> = ({ apiData }) => {
  const { encoder } = defectData;
  const [isPlaying, setIsPlaying] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [imageUrl, setImageUrl] = useState(defectData.annotatedImage);

  useEffect(() => {
    if (apiData?.annotated_image) {
      setImageUrl(apiData.annotated_image);
    } else {
      setImageUrl(defectData.annotatedImage);
    }
  }, [apiData]);

  const getDefectBoxes = (): DefectBox[] => {
    if (!apiData?.defects?.length) return [];
    
    return apiData.defects.map((defect: any, index: number) => {
      const bbox = defect.bounding_box;
      const colorMap: ColorMap = {
        "cut": "border-red-500",
        "holes": "border-blue-500", 
        "stain": "border-yellow-500",
        "lines": "border-orange-500"
      };
      
      const colorClass = colorMap[defect.type] || "border-gray-500";
      const textColorMap: ColorMap = {
        "cut": "bg-red-500",
        "holes": "bg-blue-500",
        "stain": "bg-yellow-500",
        "lines": "bg-orange-500"
      };
      
      const textColorClass = textColorMap[defect.type] || "bg-gray-500";
      
      return {
        id: defect.id,
        label: `${defect.type} ${defect.confidence}`,
        x: bbox.x1 / 1920 * 100,
        y: bbox.y1 / 1080 * 100,
        width: ((bbox.x2 - bbox.x1) / 1920 * 100),
        height: ((bbox.y2 - bbox.y1) / 1080 * 100),
        colorClass,
        textColorClass,
        severity: defect.severity
      };
    });
  };

  const defectBoxes = getDefectBoxes();

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Defect Visualization</h2>
            <p className="text-gray-600 text-sm mt-1">
              {apiData ? "AI-annotated detection results" : "AI-annotated defect detection results"}
              {apiData && ` • ${apiData.summary?.total_defects} defect(s) found`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {isPlaying ? <FiPause className="w-5 h-5 text-gray-700" /> : <FiPlay className="w-5 h-5 text-gray-700" />}
            </button>
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              <button 
                onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.25))}
                className="px-3 py-1 text-gray-700 hover:bg-white rounded-md transition-colors"
              >
                -
              </button>
              <span className="text-sm text-gray-600 px-2">{Math.round(zoomLevel * 100)}%</span>
              <button 
                onClick={() => setZoomLevel(Math.min(3, zoomLevel + 0.25))}
                className="px-3 py-1 text-gray-700 hover:bg-white rounded-md transition-colors"
              >
                +
              </button>
            </div>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <FiDownload className="w-5 h-5 text-gray-700" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <FiMaximize2 className="w-5 h-5 text-gray-700" />
            </button>
          </div>
        </div>

        <div className="relative rounded-lg overflow-hidden border border-gray-300 bg-gray-50">
          <div 
            className="relative aspect-video"
            style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center' }}
          >
            <img
              src={imageUrl}
              className="w-full h-full object-cover"
              alt="Annotated defect detection"
            />
            
            {defectBoxes.map((box: DefectBox) => (
              <div
                key={box.id}
                className={`absolute border-2 ${box.colorClass} rounded-lg`}
                style={{
                  left: `${box.x}%`,
                  top: `${box.y}%`,
                  width: `${box.width}%`,
                  height: `${box.height}%`
                }}
              >
                <div className={`absolute -top-8 left-1/2 transform -translate-x-1/2 ${box.textColorClass} text-white px-3 py-1.5 rounded-lg text-sm font-medium shadow-lg`}>
                  {box.label}
                </div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-current rounded-full animate-pulse"></div>
              </div>
            ))}
            
            {!apiData && (
              <>
                <div className="absolute top-1/4 left-1/4 w-20 h-20 border-2 border-red-500 rounded-lg">
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium shadow-lg">
                    Hole Defect
                  </div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                </div>
                
                <div className="absolute bottom-1/3 right-1/3 w-16 h-16 border-2 border-yellow-500 rounded-lg">
                  <div className="absolute -top-7 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium shadow-lg">
                    Stain
                  </div>
                </div>
              </>
            )}
          </div>
          
          <div className="absolute bottom-4 left-4 bg-black/80 text-white px-4 py-3 rounded-lg backdrop-blur-sm">
            <div className="text-xs opacity-80">{apiData ? "Processed Image" : "Live View"}</div>
            <div className="text-sm font-semibold">
              {apiData?.defects?.[0]?.confidence || "Confidence: 94.2%"}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-gradient-to-br from-blue-50 to-white p-4 rounded-lg border border-blue-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <FiZap className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Encoder Speed</div>
                <div className="text-lg font-bold text-gray-900">{encoder.speed}</div>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-white p-4 rounded-lg border border-green-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <FiClock className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Active Duration</div>
                <div className="text-lg font-bold text-gray-900">{encoder.activeDuration}</div>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-white p-4 rounded-lg border border-purple-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <FiTarget className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Length Measured</div>
                <div className="text-lg font-bold text-gray-900">{encoder.lengthMeasured}</div>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-amber-50 to-white p-4 rounded-lg border border-amber-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <FiPieChart className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Idle Time</div>
                <div className="text-lg font-bold text-gray-900">{encoder.idleTime}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnnotatedDefectImage;