"use client";

import { useState } from "react";

export default function Dashboard() {
  const [file, setFile] = useState<File | null>(null);

  return (
    <div className="min-h-screen bg-black text-white p-8">

      <h1 className="text-3xl font-bold mb-6">
        📊 Data Dashboard
      </h1>

      {/* Upload Box */}
      <div className="border border-gray-700 p-6 rounded-xl mb-6">
        <input
          type="file"
          accept=".csv"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />

        {file && (
          <p className="mt-3 text-green-400">
            ✅ {file.name} uploaded
          </p>
        )}
      </div>

      {/* Button */}
      <button className="px-6 py-3 bg-white text-black rounded-xl font-semibold hover:bg-gray-200">
        🚀 Run Analysis
      </button>

    </div>
  );
}
