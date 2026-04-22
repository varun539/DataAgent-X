"use client";

import { useState } from "react";
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, CartesianGrid,
  ResponsiveContainer
} from "recharts";

// ✅ ALWAYS use env (no hardcoding)
const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://crispy-space-goggles-5gx794q74j4wcpg94-8000.app.github.dev";

export default function Dashboard() {
  const [file, setFile] = useState<File | null>(null);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");

  // 🔥 UPLOAD
  const handleUpload = async () => {
    if (!file) {
      setError("Please select a CSV file first");
      return;
    }

    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${API_URL}/upload/`, {
        method: "POST",
        body: formData,
      });

      console.log("UPLOAD STATUS:", res.status);

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Upload failed");
      }

      const data = await res.json();
      setUploadResult(data);
      setAnalysisResult(null);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  // 🔥 ANALYZE
  const handleAnalyze = async () => {
    if (!file) {
      setError("Upload file first broo");
      return;
    }

    setAnalyzing(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${API_URL}/analyze/`, {
        method: "POST",
        body: formData,
      });

      console.log("ANALYZE STATUS:", res.status);

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Analysis failed");
      }

      const data = await res.json();
      setAnalysisResult(data);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Analysis failed");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">

      <h1 className="text-3xl font-bold mb-6">
        📊 DataAgent X Dashboard
      </h1>

      {/* Upload */}
      <div className="mb-6">
        <input
          type="file"
          accept=".csv"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />

        <div className="flex gap-3 mt-3">
          <button
            onClick={handleUpload}
            disabled={loading || !file}
            className="px-4 py-2 bg-blue-600 rounded"
          >
            {loading ? "Loading..." : "Preview Data"}
          </button>

          <button
            onClick={handleAnalyze}
            disabled={analyzing || !file}
            className="px-4 py-2 bg-green-600 rounded"
          >
            {analyzing ? "Analyzing..." : "Run Analysis"}
          </button>
        </div>

        {error && (
          <p className="text-red-400 mt-3">❌ {error}</p>
        )}
      </div>

      {/* Preview */}
      {uploadResult && (
        <div className="mb-6">
          <p>Rows: {uploadResult.rows}</p>
          <p>Columns: {uploadResult.columns}</p>

          {uploadResult.insights?.map((ins: string, i: number) => (
            <div key={i}>{ins}</div>
          ))}
        </div>
      )}

      {/* Chart */}
      {uploadResult?.chart_data?.length > 0 && (
        <div className="mb-6">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={uploadResult.chart_data}>
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Analysis */}
      {analysisResult && (
        <div>
          <h2 className="text-xl font-bold mb-2">🚀 Analysis</h2>

          <p>Model: {analysisResult.model}</p>
          <p>Target: {analysisResult.target}</p>

          {analysisResult.insights?.map((ins: string, i: number) => (
            <div key={i}>{ins}</div>
          ))}
        </div>
      )}
    </div>
  );
}