"use client";

import React from "react";
import axios from "axios";
import { motion } from "framer-motion";
import Image from "next/image";
import { useFog } from "./FogContext";

const ENHANCE_API =
  "http://127.0.0.1:8000/fogcomputing/enhance?auto_classify=true";

const ImageClassificationTab: React.FC = () => {
  const {
    file,
    previewUrl,
    setFileWithPreview,
    enhanceData,
    setEnhanceData,
    loading,
    setLoading,
    error,
    setError,
  } = useFog();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] || null;
    setFileWithPreview(selected);
    setEnhanceData(null);
    setError(null);
  };

  const handleRun = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await axios.post(ENHANCE_API, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setEnhanceData(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed. Check API.");
    } finally {
      setLoading(false);
    }
  };

  const probs = enhanceData?.classification?.probabilities || null;
  const predictedClass = enhanceData?.predicted_class;
  const confidence = enhanceData?.classification?.confidence;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-5xl mx-auto"
    >
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Fabric Classification & Enhancement
        </h1>
        {/* <p className="text-gray-600">
          Upload once → class + confidence + probabilities, and Quality
          Analytics tab will show metrics.
        </p> */}
      </div>

      {/* Upload */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Upload Fabric Image
        </label>

        <input
          type="file"
          accept="image/png,image/jpeg"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-lg file:border-0
            file:text-sm file:font-semibold
            file:bg-indigo-50 file:text-indigo-700
            hover:file:bg-indigo-100"
        />

        {previewUrl && (
          <div className="mt-4 relative w-full h-64 rounded-lg overflow-hidden border bg-gray-50">
            <Image
              src={previewUrl}
              alt="Preview"
              fill
              className="object-contain"
            />
          </div>
        )}

        <button
          onClick={handleRun}
          disabled={!file || loading}
          className="mt-4 px-6 py-2 rounded-lg bg-indigo-600 text-white font-medium
            hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? "Processing..." : "Run Classification"}
        </button>
      </div>

      {/* Result */}
      {enhanceData && (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-5">
          <h2 className="text-lg font-semibold text-gray-900">
            Classification Result
          </h2>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Predicted Class</p>
              <p className="text-2xl font-bold text-indigo-600">
                {predictedClass}
              </p>
            </div>

            <div className="text-right">
              <p className="text-sm text-gray-600">Confidence</p>
              <p className="text-2xl font-bold text-emerald-600">
                {confidence === null || confidence === undefined
                  ? "—"
                  : `${(confidence * 100).toFixed(1)}%`}
              </p>
            </div>
          </div>

          {/* Probability bars (the “previous panel” you asked for) */}
          {probs && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                Class Probabilities
              </h3>

              <div className="space-y-2">
                {Object.entries(probs)
                  .sort((a: any, b: any) => b[1] - a[1])
                  .map(([cls, prob]: any) => (
                    <div key={cls}>
                      <div className="flex justify-between text-sm">
                        <span
                          className={`${
                            cls === predictedClass
                              ? "font-semibold text-indigo-700"
                              : ""
                          }`}
                        >
                          {cls}
                        </span>
                        <span>{(prob * 100).toFixed(1)}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full">
                        <div
                          className={`h-2 rounded-full ${
                            cls === predictedClass
                              ? "bg-indigo-600"
                              : "bg-indigo-300"
                          }`}
                          style={{ width: `${Math.min(100, prob * 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200">
          {error}
        </div>
      )}
    </motion.div>
  );
};

export default ImageClassificationTab;
