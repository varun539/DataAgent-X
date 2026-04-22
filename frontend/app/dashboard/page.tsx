"use client";

import { useState } from "react";
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, CartesianGrid,
  ResponsiveContainer
} from "recharts";

// ✅ Use env variable — works for local + production
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface Metrics {
  r2?: number;
  mae?: number;
  rmse?: number;
  cv_mean?: number;
  cv_std?: number;
  accuracy?: number;
  f1?: number;
}

interface AnalysisResult {
  model: string;
  target: string;
  rows: number;
  features: number;
  metrics: Metrics;
  problem_type: string;
  insights: string[];
  feature_list: string[];
}

interface UploadResult {
  rows: number;
  columns: number;
  insights: string[];
  chart_data: any[];
  chart_type: string;
  chart_label: { x: string; y: string };
  ai_explanation: string;
}

export default function Dashboard() {
  const [file, setFile] = useState<File | null>(null);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");

  // ── UPLOAD ────────────────────────────────────────
  const handleUpload = async () => {
    if (!file) { setError("Please select a CSV file first"); return; }
    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${API_URL}/upload/`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Upload failed");
      }

      const data: UploadResult = await res.json();
      setUploadResult(data);
      setAnalysisResult(null);
    } catch (err: any) {
      setError(err.message || "Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  // ── ANALYZE ───────────────────────────────────────
  const handleAnalyze = async () => {
    if (!file) { setError("Please upload a file first"); return; }
    setAnalyzing(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${API_URL}/analyze/`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Analysis failed");
      }

      const data: AnalysisResult = await res.json();
      setAnalysisResult(data);
    } catch (err: any) {
      setError(err.message || "Analysis failed — is the backend running?");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0d14] text-white p-8 font-sans">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1">📊 DataAgent X Dashboard</h1>
        <p className="text-gray-400">Upload your data → Get AI-powered business insights</p>
      </div>

      {/* Upload Section */}
      <div className="bg-[#111827] border border-[#1e2535] rounded-2xl p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">📂 Upload Dataset</h2>

        <div className="flex flex-wrap gap-4 items-center">
          <input
            type="file"
            accept=".csv"
            onChange={(e) => {
              setFile(e.target.files?.[0] || null);
              setUploadResult(null);
              setAnalysisResult(null);
              setError("");
            }}
            className="text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-[#1e2535] file:text-white hover:file:bg-[#2a3448]"
          />

          <button
            onClick={handleUpload}
            disabled={loading || !file}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-xl font-semibold transition"
          >
            {loading ? "Loading..." : "📊 Preview Data"}
          </button>

          <button
            onClick={handleAnalyze}
            disabled={analyzing || !file}
            className="px-5 py-2 bg-green-600 hover:bg-green-500 disabled:opacity-50 rounded-xl font-semibold transition"
          >
            {analyzing ? "Training models..." : "🚀 Run Full Analysis"}
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-900/40 border border-red-700 rounded-xl text-red-300">
            ❌ {error}
          </div>
        )}
      </div>

      {/* Upload Preview Results */}
      {uploadResult && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Rows",    value: uploadResult.rows },
            { label: "Columns", value: uploadResult.columns },
            { label: "Status",  value: "✅ Ready" },
            { label: "Action",  value: "Run Analysis ↓" },
          ].map((m, i) => (
            <div key={i} className="bg-[#141826] border border-[#1e2535] rounded-xl p-4">
              <div className="text-gray-400 text-xs uppercase tracking-wider mb-1">{m.label}</div>
              <div className="text-xl font-bold text-blue-400">{m.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* EDA Insights */}
      {uploadResult?.insights && uploadResult.insights.length > 0 && (
        <div className="bg-[#111827] border border-[#1e2535] rounded-2xl p-6 mb-6">
          <h2 className="text-lg font-semibold mb-3">🔍 Data Overview</h2>
          {uploadResult.insights.map((ins, i) => (
            <div key={i} className="text-gray-300 py-1">{ins}</div>
          ))}
        </div>
      )}

      {/* Chart */}
      {uploadResult?.chart_data && uploadResult.chart_data.length > 0 && (
        <div className="bg-[#111827] border border-[#1e2535] rounded-2xl p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">
            📈 {uploadResult.chart_label?.y || "Value"} by {uploadResult.chart_label?.x || "Category"}
          </h2>
          <ResponsiveContainer width="100%" height={280}>
            {uploadResult.chart_type === "line" ? (
              <LineChart data={uploadResult.chart_data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2535" />
                <XAxis dataKey="label" tick={{ fill: "#9ca3af", fontSize: 11 }} />
                <YAxis tick={{ fill: "#9ca3af", fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "#111827", border: "1px solid #1e2535" }} />
                <Line type="monotone" dataKey="value" stroke="#63b3ed" strokeWidth={2} dot={false} />
              </LineChart>
            ) : (
              <BarChart data={uploadResult.chart_data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2535" />
                <XAxis dataKey="label" tick={{ fill: "#9ca3af", fontSize: 11 }} />
                <YAxis tick={{ fill: "#9ca3af", fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "#111827", border: "1px solid #1e2535" }} />
                <Bar dataKey="value" fill="#63b3ed" radius={[6, 6, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      )}

      {/* ML Analysis Results */}
      {analysisResult && (
        <>
          {/* Model Metrics */}
          <div className="bg-[#111827] border border-[#1e2535] rounded-2xl p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">🏆 Model Performance</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              {[
                { label: "Best Model",  value: analysisResult.model },
                { label: "Target",      value: analysisResult.target },
                { label: "Features",    value: analysisResult.features },
                { label: "Rows Trained",value: analysisResult.rows },
              ].map((m, i) => (
                <div key={i} className="bg-[#141826] border border-[#1e2535] rounded-xl p-3">
                  <div className="text-gray-400 text-xs uppercase mb-1">{m.label}</div>
                  <div className="font-bold text-blue-400">{m.value}</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {analysisResult.problem_type === "regression" ? (
                <>
                  <MetricCard label="R² Score"    value={analysisResult.metrics.r2?.toString() || "—"} />
                  <MetricCard label="MAE"          value={analysisResult.metrics.mae?.toString() || "—"} />
                  <MetricCard label="CV Mean R²"   value={analysisResult.metrics.cv_mean?.toString() || "—"} />
                  <MetricCard label="CV Std"       value={analysisResult.metrics.cv_std?.toString() || "—"} />
                </>
              ) : (
                <>
                  <MetricCard label="Accuracy"    value={analysisResult.metrics.accuracy?.toString() || "—"} />
                  <MetricCard label="F1 Score"    value={analysisResult.metrics.f1?.toString() || "—"} />
                  <MetricCard label="CV Mean"     value={analysisResult.metrics.cv_mean?.toString() || "—"} />
                  <MetricCard label="CV Std"      value={analysisResult.metrics.cv_std?.toString() || "—"} />
                </>
              )}
            </div>
          </div>

          {/* Business Insights */}
          <div className="bg-[#111827] border border-[#1e2535] rounded-2xl p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">💡 Business Insights</h2>
            {analysisResult.insights.map((ins, i) => (
              <div key={i} className="bg-[#141826] border border-[#1e2535] rounded-xl p-4 mb-3 text-gray-300 whitespace-pre-line">
                {ins}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[#141826] border border-[#1e2535] rounded-xl p-3">
      <div className="text-gray-400 text-xs uppercase mb-1">{label}</div>
      <div className="font-bold text-green-400">{value}</div>
    </div>
  );
}