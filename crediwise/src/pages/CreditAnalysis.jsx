import { useEffect, useRef, useState } from "react";
import Navbar from "../components/Navbar";
import { Brain, Loader2, Send } from "lucide-react";

export default function CreditAnalysis() {
  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text: "Hi there! I'm your credit assistant. Ask me anything about your credit health 💬",
    },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const newMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, newMessage]);
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
      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: data.reply || "Hmm, something went wrong." },
      ]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: "Error contacting AI server." },
      ]);
    }
    setSending(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900 text-white flex flex-col">
      {/* Navbar */}
      <div className="sticky top-0 z-50 bg-gray-950/80 backdrop-blur-md">
        <Navbar />
      </div>

      {/* Centered Main Container */}
      <div className="flex flex-col items-center justify-center flex-grow px-4 py-10">
        <div className="w-full max-w-3xl bg-gray-900/80 border border-white/10 rounded-2xl shadow-[0_0_40px_rgba(0,255,140,0.1)] backdrop-blur-lg p-6 flex flex-col h-[80vh]">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <Brain className="w-8 h-8 text-green-400" />
            <h2 className="text-2xl font-bold text-green-400">
              AI Credit Analysis
            </h2>
          </div>

          {/* Chat Window */}
          <div
            className="flex-1 overflow-y-auto bg-gray-800/60 rounded-lg p-4 border border-gray-700 mb-4
                       scrollbar-thin scrollbar-thumb-green-600 scrollbar-track-gray-800"
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`mb-2 ${msg.sender === "user" ? "text-right" : "text-left"}`}
              >
                <div
                  className={`inline-block px-3 py-2 rounded-xl text-sm max-w-[75%] break-words ${
                    msg.sender === "user"
                      ? "bg-green-600 text-white"
                      : "bg-gray-700 text-gray-100"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Box */}
          <div className="flex items-center gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
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
