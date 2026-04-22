"use client";

import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer
} from "recharts";

export default function Dashboard() {
  const [file, setFile] = useState<File | null>(null);
  const [insights, setInsights] = useState<string[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [aiExplanation, setAiExplanation] = useState("");

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("http://127.0.0.1:8001/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    setInsights(data.insights || []);
    setChartData(data.chart_data || []);
    setAiExplanation(data.ai_explanation || "");
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">

      <h1 className="text-3xl font-bold mb-6">📊 Data Dashboard</h1>

      {/* Upload */}
      <input
        type="file"
        accept=".csv"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />

      <button
        onClick={handleUpload}
        className="mt-4 px-6 py-3 bg-white text-black rounded-xl"
      >
        🚀 Run Analysis
      </button>

      {/* Insights */}
      <div className="mt-6">
        <h2 className="text-xl font-bold mb-2">💡 Insights</h2>

        {insights.length === 0 ? (
          <p className="text-gray-400">No insights yet</p>
        ) : (
          insights.map((insight, i) => (
            <div key={i} className="bg-gray-900 p-3 rounded mb-2">
              {insight}
            </div>
          ))
        )}
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">📈 Sales by Product</h2>

          <div className="bg-gray-900 p-4 rounded">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="product" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="sales" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* AI Insights */}
      {aiExplanation && (
        <div className="mt-6 bg-purple-900 p-4 rounded">
          <h2 className="text-xl font-bold mb-2">🤖 AI Insights</h2>
          <p>{aiExplanation}</p>
        </div>
      )}

    </div>
  );
}