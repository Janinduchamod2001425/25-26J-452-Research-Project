"use client";

import React, { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import Image from "next/image";

const CLASSIFY_API = "http://127.0.0.1:8000/fogcomputing/classify";
const ENHANCE_API = "http://127.0.0.1:8000/fogcomputing/enhance";

const ImageClassificationTab: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [enhancing, setEnhancing] = useState(false);

  const [result, setResult] = useState<any>(null);
  const [enhancedImage, setEnhancedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // -------------------------
  // File select
  // -------------------------
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setFile(selected);
    setPreview(URL.createObjectURL(selected));
    setResult(null);
    setEnhancedImage(null);
    setError(null);
  };

  // -------------------------
  // Classification
  // -------------------------
  const handleClassify = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await axios.post(CLASSIFY_API, formData);
      setResult(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Classification failed");
    } finally {
      setLoading(false);
    }
  };

  // -------------------------
  // Enhancement
  // -------------------------
  const handleEnhancement = async () => {
    if (!file || !result?.predicted_class) return;

    setEnhancing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await axios.post(
        `${ENHANCE_API}?fabric_class=${result.predicted_class}`,
        formData
      );

      setEnhancedImage(
        `data:image/png;base64,${res.data.enhanced_image_base64}`
      );
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Enhancement failed");
    } finally {
      setEnhancing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-6xl mx-auto"
    >
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Fabric Classification & Enhancement
        </h1>
        <p className="text-gray-600">
          Class-aware edge-level enhancement using MobileNetV2
        </p>
      </div>

      {/* Upload */}
      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <input type="file" accept="image/*" onChange={handleFileChange} />

        {preview && (
          <div className="mt-4 relative h-56 border rounded-lg bg-gray-50">
            <Image
              src={preview}
              alt="preview"
              fill
              className="object-contain"
            />
          </div>
        )}

        <button
          onClick={handleClassify}
          disabled={!file || loading}
          className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg"
        >
          {loading ? "Classifying..." : "Run Classification"}
        </button>
      </div>

      {/* Classification Result */}
      {result && (
        <div className="bg-white p-6 rounded-xl border shadow-sm space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">Predicted Class</p>
              <p className="text-2xl font-bold text-indigo-600">
                {result.predicted_class}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Confidence</p>
              <p className="text-2xl font-bold text-emerald-600">
                {(result.confidence * 100).toFixed(1)}%
              </p>
            </div>
          </div>

          {/* Probability Panel */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Class Probabilities
            </h3>
            <div className="space-y-3">
              {Object.entries(result.probabilities).map(([cls, prob]: any) => (
                <div key={cls}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="capitalize">{cls}</span>
                    <span>{(prob * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full">
                    <div
                      className="h-2 bg-indigo-500 rounded-full transition-all"
                      style={{ width: `${prob * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Enhancement button */}
          <button
            onClick={handleEnhancement}
            disabled={enhancing}
            className="px-6 py-2 bg-emerald-600 text-white rounded-lg"
          >
            {enhancing ? "Enhancing..." : "Run Enhancement"}
          </button>
        </div>
      )}

      {/* Before vs After */}
      {enhancedImage && preview && (
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Enhancement Comparison</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-2">Original</p>
              <div className="relative h-64 border rounded-lg">
                <Image
                  src={preview}
                  alt="before"
                  fill
                  className="object-contain"
                />
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-2">Enhanced</p>
              <div className="relative h-64 border rounded-lg">
                <Image
                  src={enhancedImage}
                  alt="after"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg">{error}</div>
      )}
    </motion.div>
  );
};

export default ImageClassificationTab;
