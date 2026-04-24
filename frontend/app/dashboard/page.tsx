"use client";

import { useState, useRef } from "react";
import {
  BarChart, Bar,
  XAxis, YAxis, Tooltip,
  ResponsiveContainer
} from "recharts";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

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
}

interface UploadResult {
  rows: number;
  columns: number;
  insights: string[];
  chart_data: any[];
}

async function safeFetch(url: string, opts: RequestInit) {
  try {
    const res = await fetch(url, opts);
    if (!res.ok) {
      const e = await res.json().catch(() => ({}));
      throw new Error(e.detail || `Error ${res.status}`);
    }
    return await res.json();
  } catch {
    throw new Error("Backend not reachable");
  }
}

export default function Dashboard() {
  const [file, setFile] = useState<File | null>(null);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");

  const [dragActive, setDragActive] = useState(false);

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const chatRef = useRef<HTMLDivElement>(null);

  const quickQ = [
    "Why is revenue low?",
    "Which product performs best?",
    "What are the top drivers of sales?",
    "How can I increase profit?",
    "Which features matter most?"
  ];

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setError("");

    const fd = new FormData();
    fd.append("file", file);

    try {
      const data = await safeFetch(`${API_URL}/upload/`, {
        method: "POST",
        body: fd,
      });

      setUploadResult(data);
      setResult(null);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

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

  const sendMessage = async (msg?: string) => {
    const q = msg || input;
    if (!q.trim()) return;

    const newMessages = [...messages, { role: "user", content: q }];
    setMessages(newMessages);
    setInput("");

    try {
      const data = await safeFetch(`${API_URL}/chat/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: q }),
      });

      setMessages([
        ...newMessages,
        { role: "assistant", content: data.response },
      ]);
    } catch {
      setMessages([
        ...newMessages,
        { role: "assistant", content: "Backend not connected 😅" },
      ]);
    }

    setTimeout(() => {
      chatRef.current?.scrollTo(0, chatRef.current.scrollHeight);
    }, 100);
  };

  return (
    <div className="min-h-screen bg-[#060810] text-white">

      <nav className="sticky top-0 z-50 px-8 py-4 bg-[#060810]/80 backdrop-blur-xl border-b border-white/10">
        <a href="/" className="font-bold text-lg bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
          🚀 DataAgent X
        </a>
      </nav>

      <div className="max-w-5xl mx-auto p-6 space-y-8">

        {/* UPLOAD */}
        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">

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
              if (f) {
                setFile(f);
                setUploadResult(null);
                setResult(null);
                setError("");
              }
            }}
            className={`border-2 border-dashed rounded-2xl p-10 text-center ${
              dragActive ? "border-blue-400 bg-blue-500/10" : "border-white/10"
            }`}
          >
            <p className="text-gray-400">Drag & drop CSV</p>

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

          <div className="flex gap-3 mt-4">
            <button onClick={handleUpload} className="px-4 py-2 bg-white/10 rounded">
              {loading ? "Loading..." : "Preview"}
            </button>

            <button onClick={handleAnalyze} className="px-4 py-2 bg-gradient-to-r from-blue-400 to-purple-500 rounded">
              {analyzing ? "Analyzing..." : "Analyze"}
            </button>
          </div>

          {error && <p className="text-red-400 mt-3">{error}</p>}
        </div>

        {/* INSIGHTS */}
        {result && (
          <div className="bg-white/5 p-6 rounded-2xl space-y-3">
            <h2 className="font-bold">🚀 AI Insights</h2>
            {result.insights.map((i, idx) => (
              <p key={idx}>{i}</p>
            ))}
          </div>
        )}

        {/* FEATURE IMPORTANCE */}
        {result?.feature_importance && (
          <div className="bg-white/5 p-6 rounded-2xl">
            <h2 className="font-bold mb-3">📊 Top Features</h2>

            {result.feature_importance.map((f: any, i: number) => (
              <p key={i}>
                {f[0]} → {Number(f[1]).toFixed(3)}
              </p>
            ))}
          </div>
        )}

        {/* RECOMMENDATIONS */}
        {result?.recommendations && (
          <div className="bg-green-900/30 p-6 rounded-2xl">
            <h2 className="font-bold mb-3">💡 Recommendations</h2>

            {result.recommendations.map((r, i) => (
              <p key={i}>{r}</p>
            ))}
          </div>
        )}

        {/* CHAT */}
        <div className="bg-white/5 p-6 rounded-2xl">
          <h2 className="font-bold mb-3">🤖 Ask AI</h2>

          <div className="flex flex-wrap gap-2 mb-3">
            {quickQ.map((q, i) => (
              <button key={i} onClick={() => sendMessage(q)} className="px-3 py-1 bg-white/5 rounded">
                {q}
              </button>
            ))}
          </div>

          <div ref={chatRef} className="h-[200px] overflow-y-auto mb-3">
            {messages.map((m, i) => (
              <p key={i}><b>{m.role === "user" ? "You:" : "AI:"}</b> {m.content}</p>
            ))}
          </div>

          <div className="flex gap-2">
            <input value={input} onChange={(e) => setInput(e.target.value)} className="flex-1 p-2 bg-black/40 rounded" />
            <button onClick={() => sendMessage()} className="px-4 bg-purple-500 rounded">Ask</button>
          </div>
        </div>

      </div>
    </div>
  );
}
