"use client";

import { useState, useRef } from "react";
import {
  BarChart, Bar,
  XAxis, YAxis, Tooltip,
  ResponsiveContainer
} from "recharts";

const API_URL = "https://dataagent-x-backend.onrender.com";

interface AnalysisResult {
  model: string;
  target: string;
  rows: number;
  features: number;
  metrics: any;
  problem_type: string;
  insights: string[];
  feature_importance?: any[];
  correlations?: any[];
  recommendations?: string[];
  ai_summary?: string;
}

async function safeFetch(url: string, opts: RequestInit) {
  try {
    const res = await fetch(url, opts);
    if (!res.ok) throw new Error("Error");
    return await res.json();
  } catch {
    throw new Error("Backend not reachable");
  }
}

export default function Dashboard() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");

  const [dragActive, setDragActive] = useState(false);

  const handleAnalyze = async () => {
    if (!file) return;

    setAnalyzing(true);
    setError("");

    const fd = new FormData();
    fd.append("file", file);

    try {
      const data = await safeFetch(`${API_URL}/analyze/`, {
        method: "POST",
        body: fd,
      });

      setResult(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060810] text-white">

      <div className="max-w-5xl mx-auto p-6 space-y-8">

        {/* UPLOAD */}
        <div className="bg-white/5 p-6 rounded-2xl">

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragActive(false);
              const f = e.dataTransfer.files[0];
              if (f) setFile(f);
            }}
            className={`border-2 border-dashed rounded-2xl p-10 text-center ${
              dragActive ? "border-blue-400 bg-blue-500/10" : "border-white/10"
            }`}
          >
            <p>Drag & drop CSV</p>

            <input
              type="file"
              accept=".csv"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="hidden"
              id="fileUpload"
            />

            <label htmlFor="fileUpload" className="mt-4 inline-block px-4 py-2 bg-white text-black rounded">
              Browse
            </label>

            {file && <p className="text-green-400 mt-3">✅ {file.name}</p>}
          </div>

          {/* 🔥 UPDATED BUTTON */}
          <button
            onClick={handleAnalyze}
            disabled={analyzing}
            className="mt-4 px-4 py-2 bg-gradient-to-r from-blue-400 to-purple-500 rounded"
          >
            {analyzing ? "Analyzing with AI..." : "Analyze"}
          </button>

          {error && <p className="text-red-400 mt-3">{error}</p>}
        </div>

        {/* 🤖 AI SUMMARY */}
        {result?.ai_summary && (
          <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 p-6 rounded-2xl">
            <h2 className="text-xl font-bold mb-2">🤖 AI Summary</h2>
            <p>{result.ai_summary}</p>
          </div>
        )}

        {/* 📊 CHART */}
        {result?.feature_importance && (
          <div className="bg-white/5 p-6 rounded-2xl">
            <h2 className="font-bold mb-4">📊 Key Drivers</h2>

            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={result.feature_importance.map((f: any) => ({
                  name: f[0],
                  value: Number(f[1]),
                }))}
              >
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* 💡 INSIGHTS */}
        {result?.insights && (
          <div className="bg-white/5 p-6 rounded-2xl">
            <h2 className="font-bold mb-3">🚀 Insights</h2>
            {result.insights.map((i, idx) => (
              <p key={idx}>{i}</p>
            ))}
          </div>
        )}

        {/* 💡 RECOMMENDATIONS */}
        {result?.recommendations && (
          <div className="bg-green-900/30 p-6 rounded-2xl">
            <h2 className="font-bold mb-3">💡 Action Plan</h2>
            {result.recommendations.map((r, i) => (
              <p key={i}>✔️ {r}</p>
            ))}
          </div>
        )}

        {/* 💰 MONETIZATION */}
        <div className="bg-yellow-900/30 p-6 rounded-2xl">
          <p>🚀 Upgrade to Pro for advanced insights & reports</p>
          <button className="mt-3 px-4 py-2 bg-yellow-500 text-black rounded">
            Upgrade ($10/mo)
          </button>
        </div>

      </div>
    </div>
  );
}