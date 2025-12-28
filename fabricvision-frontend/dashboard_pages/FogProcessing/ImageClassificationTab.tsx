"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

const API_URL = "http://127.0.0.1:8000/fogcomputing/classify";

const ImageClassificationTab: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setFile(selected);
    setPreview(URL.createObjectURL(selected));
    setResult(null);
    setError(null);
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(API_URL, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Prediction failed");
      }

      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-5xl mx-auto"
    >
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Fabric Image Classification
        </h1>
        <p className="text-gray-600">
          Upload a fabric frame to classify lighting & texture profile using
          edge-level MobileNetV2
        </p>
      </div>

      {/* Upload Card */}
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

        {preview && (
          <div className="mt-4 relative w-full h-64 rounded-lg overflow-hidden border">
            <Image
              src={preview}
              alt="Preview"
              fill
              className="object-contain"
            />
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={!file || loading}
          className="mt-4 px-6 py-2 rounded-lg bg-indigo-600 text-white font-medium
                     hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? "Classifying..." : "Run Classification"}
        </button>
      </div>

      {/* Result */}
      {result && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Classification Result
          </h2>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Predicted Class</p>
              <p className="text-2xl font-bold text-indigo-600">
                {result.predicted_class}
              </p>
            </div>

            <div className="text-right">
              <p className="text-sm text-gray-600">Confidence</p>
              <p className="text-2xl font-bold text-emerald-600">
                {(result.confidence * 100).toFixed(1)}%
              </p>
            </div>
          </div>

          {/* Probabilities */}
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              Class Probabilities
            </h3>
            <div className="space-y-2">
              {Object.entries(result.probabilities).map(([cls, prob]: any) => (
                <div key={cls}>
                  <div className="flex justify-between text-sm">
                    <span>{cls}</span>
                    <span>{(prob * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full">
                    <div
                      className="h-2 bg-indigo-500 rounded-full"
                      style={{ width: `${prob * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {error && (
        <div className="text-red-600 bg-red-50 p-4 rounded-lg border border-red-200">
          {error}
        </div>
      )}
    </motion.div>
  );
};

export default ImageClassificationTab;
