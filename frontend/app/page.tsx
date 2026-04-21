export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-black text-white">
      
      <h1 className="text-5xl font-bold mb-4">
        🚀 DataAgent X
      </h1>

      <p className="text-gray-400 mb-6">
        Upload your data → Train models → Get AI insights
      </p>

      <a
        href="/dashboard"
        className="px-6 py-3 bg-white text-black rounded-xl font-semibold hover:bg-gray-200 transition"
      >
        Go to Dashboard →
      </a>

    </main>
  );
}
