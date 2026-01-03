"use client";

import React, { createContext, useContext, useMemo, useState } from "react";

export type FogEnhanceResponse = any; // you can type this later

type FogContextType = {
  file: File | null;
  previewUrl: string | null;
  setFileWithPreview: (f: File | null) => void;

  enhanceData: FogEnhanceResponse | null;
  setEnhanceData: (d: FogEnhanceResponse | null) => void;

  loading: boolean;
  setLoading: (v: boolean) => void;

  error: string | null;
  setError: (v: string | null) => void;

  reset: () => void;
};

const FogContext = createContext<FogContextType | null>(null);

export const useFog = () => {
  const ctx = useContext(FogContext);
  if (!ctx) throw new Error("useFog must be used inside <FogProvider />");
  return ctx;
};

export const FogProvider = ({ children }: { children: React.ReactNode }) => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [enhanceData, setEnhanceData] = useState<FogEnhanceResponse | null>(
    null
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setFileWithPreview = (f: File | null) => {
    // cleanup old preview URL
    if (previewUrl) URL.revokeObjectURL(previewUrl);

    if (!f) {
      setFile(null);
      setPreviewUrl(null);
      return;
    }

    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
  };

  const reset = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl(null);
    setEnhanceData(null);
    setError(null);
    setLoading(false);
  };

  const value = useMemo(
    () => ({
      file,
      previewUrl,
      setFileWithPreview,
      enhanceData,
      setEnhanceData,
      loading,
      setLoading,
      error,
      setError,
      reset,
    }),
    [file, previewUrl, enhanceData, loading, error]
  );

  return <FogContext.Provider value={value}>{children}</FogContext.Provider>;
};
