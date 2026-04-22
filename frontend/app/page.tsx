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

    try {
      const res = await fetch(
        "https://crispy-space-goggles-5gx794q74j4wcpg94-8000.app.github.dev/chat",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message: input }),
        }
      );

      console.log("STATUS:", res.status);

      const data = await res.json();
      console.log("DATA:", data);

      setMessages([
        ...newMessages,
        { role: "assistant", content: data.response || "No response" },
      ]);
    } catch (err) {
      console.error("ERROR:", err);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center bg-black text-white p-6">

      <h1 className="text-5xl font-bold mb-4">🚀 DataAgent X</h1>

      <p className="text-gray-400 mb-6 text-center">
        Upload your data → Train models → Get AI insights
      </p>

      <a
        href="/dashboard"
        className="px-6 py-3 bg-white text-black rounded-xl font-semibold mb-10"
      >
        Go to Dashboard →
      </a>

      <div className="w-full max-w-2xl">
        <h2 className="text-2xl font-bold mb-4">Chat with AI 🤖</h2>

        <div className="border border-gray-700 p-4 h-[400px] overflow-y-auto rounded mb-4">
          {messages.map((msg, i) => (
            <div key={i}>
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
            className="bg-white text-black px-4 rounded"
          >
            Send
          </button>
        </div>
      </div>
    </main>
  );
}