"use client";

export default function Home() {
  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center bg-[#060810] text-white overflow-hidden px-6">

      {/* Background orbs */}
      <div className="absolute top-[-200px] right-[-100px] w-[500px] h-[500px] rounded-full bg-blue-500/10 blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-100px] left-[-100px] w-[400px] h-[400px] rounded-full bg-violet-500/10 blur-[120px] pointer-events-none animate-pulse" />

      {/* Grid bg */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(99,179,237,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(99,179,237,0.03) 1px, transparent 1px)",
          backgroundSize: "60px 60px"
        }}
      />

      <div className="relative z-10 text-center max-w-3xl">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-blue-300 text-xs font-mono tracking-widest uppercase mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-ping" />
          AI-Powered Business Intelligence
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight mb-6">
          Turn your data into
          <span className="block bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
            business decisions
          </span>
        </h1>

        {/* Subheadline */}
        <p className="text-lg text-gray-400 mb-10 max-w-xl mx-auto leading-relaxed">
          Upload any CSV → AI trains the best ML model → Get plain-English insights and actionable recommendations
        </p>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/dashboard"
            className="px-8 py-4 rounded-2xl font-bold text-black bg-gradient-to-r from-blue-400 to-purple-500 hover:scale-105 transition shadow-lg"
          >
            Launch Dashboard →
          </a>

          <a
            href="https://github.com/varun539/DataAgent-X"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-4 rounded-2xl font-bold border border-white/10 text-gray-400 hover:text-white hover:border-white/30 transition"
          >
            View on GitHub ↗
          </a>
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-3 mt-12">
          {[
            "XGBoost + LightGBM + CatBoost",
            "AI Insights",
            "Feature Importance",
            "Correlation Detection",
            "Business Recommendations"
          ].map((f, i) => (
            <span
              key={i}
              className="px-3 py-1 rounded-full text-xs font-mono text-gray-400 border border-white/10 bg-white/5"
            >
              {f}
            </span>
          ))}
        </div>

      </div>
    </main>
  );
}