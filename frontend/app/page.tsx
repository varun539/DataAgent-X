// export default function Home() {
//   return (
//     <main className="min-h-screen flex flex-col items-center justify-center bg-black text-white">
      
//       <h1 className="text-5xl font-bold mb-4">
//         🚀 DataAgent X
//       </h1>

//       <p className="text-gray-400 mb-6">
//         Upload your data → Train models → Get AI insights
//       </p>

//       <a
//         href="/dashboard"
//         className="px-6 py-3 bg-white text-black rounded-xl font-semibold hover:bg-gray-200 transition"
//       >
//         Go to Dashboard →
//       </a>

//     </main>
//   );
// }


"use client";

import { useState } from "react";

export default function Home() {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");

  const sendMessage = async () => {
    if (!input) return;

    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");

    const res = await fetch("http://localhost:8000/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: input }),
    });

    const data = await res.json();

    setMessages([
      ...newMessages,
      { role: "assistant", content: data.response },
    ]);
  };

  return (
    <main className="min-h-screen flex flex-col items-center bg-black text-white p-6">

      {/* HERO SECTION */}
      <h1 className="text-5xl font-bold mb-4">
        🚀 DataAgent X
      </h1>

      <p className="text-gray-400 mb-6 text-center">
        Upload your data → Train models → Get AI insights
      </p>

      <a
        href="/dashboard"
        className="px-6 py-3 bg-white text-black rounded-xl font-semibold hover:bg-gray-200 transition mb-10"
      >
        Go to Dashboard →
      </a>

      {/* CHAT SECTION */}
      <div className="w-full max-w-2xl">
        <h2 className="text-2xl font-bold mb-4">Chat with AI 🤖</h2>

        <div className="border border-gray-700 p-4 h-[400px] overflow-y-auto rounded mb-4">
          {messages.map((msg, i) => (
            <div key={i} className="mb-2">
              <strong>{msg.role === "user" ? "You: " : "AI: "}</strong>
              {msg.content}
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="border border-gray-600 bg-black text-white p-2 flex-1 rounded"
            placeholder="Ask something..."
          />
          <button
            onClick={sendMessage}
            className="bg-white text-black px-4 rounded hover:bg-gray-200"
          >
            Send
          </button>
        </div>
      </div>

    </main>
  );
}
