import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { Brain, Loader2, Send } from "lucide-react";

export default function CreditAnalysis() {
  const [messages, setMessages] = useState([
    { sender: "ai", text: "Hi there! I'm your credit assistant. Ask me anything about your credit health 💬" },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const newMessage = { sender: "user", text: input };
    setMessages(prev => [...prev, newMessage]);
    setInput("");
    setSending(true);

    try {
      const email = localStorage.getItem("userEmail");
      const res = await fetch("http://localhost:8000/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input, email }),
      });
      const data = await res.json();
      setMessages(prev => [
        ...prev,
        { sender: "ai", text: data.reply || "Hmm, something went wrong." },
      ]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { sender: "ai", text: "Error contacting AI server." }]);
    }
    setSending(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900 text-white flex flex-col overflow-y-auto">
      {/* Navbar */}
      <div className="sticky top-0 z-50 bg-gray-950/80 backdrop-blur-md">
        <Navbar />
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 sm:p-8 max-w-4xl mx-auto w-full">
        <h2 className="text-4xl font-bold mb-6 text-green-400 flex items-center gap-3">
          <Brain className="w-8 h-8 text-green-400" />
          AI Credit Analysis
        </h2>

        <p className="text-gray-400 mb-10">
          Your AI-powered assistant helps you analyze your spending, income, and credit data to provide
          smart insights and personalized advice. Chat below to get started.
        </p>

        {/* ───── Chat Section ───── */}
        <div className="bg-gray-800/60 rounded-2xl border border-gray-700 shadow-xl p-6 mb-12">
          <h3 className="text-lg font-semibold text-green-400 mb-3">
            Chat with Your AI Assistant
          </h3>

          <div
            className="h-[60vh] overflow-y-auto bg-gray-900/60 rounded-lg p-4 border border-gray-700 mb-4
                       scrollbar-thin scrollbar-thumb-green-600 scrollbar-track-gray-800"
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`mb-2 ${msg.sender === "user" ? "text-right" : "text-left"}`}
              >
                <div
                  className={`inline-block px-3 py-2 rounded-xl text-sm ${
                    msg.sender === "user"
                      ? "bg-green-600 text-white"
                      : "bg-gray-700 text-gray-100"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 sticky bottom-0 bg-gray-800/60 p-2 rounded-lg">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && sendMessage()}
              placeholder="Type your question..."
              className="flex-grow bg-gray-900 text-white rounded-lg p-3 border border-gray-700 
                         focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
            />
            <button
              onClick={sendMessage}
              disabled={sending}
              className="bg-green-600 hover:bg-green-500 transition p-3 rounded-lg disabled:opacity-50"
            >
              {sending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
