import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { Brain, TrendingUp, Shield, Loader2, Send } from "lucide-react";

export default function CreditAnalysis() {
  const [tips, setTips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([
    { sender: "ai", text: "Hi there! I'm your credit assistant. Ask me anything about your credit health 💬" },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const email = localStorage.getItem("userEmail");
    if (!email) return;

    fetch(`http://localhost:8000/ai/credit_analysis/${email}`)
      .then(res => res.json())
      .then(data => {
        setTips(data.analysis?.tips || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const newMessage = { sender: "user", text: input };
    setMessages(prev => [...prev, newMessage]);
    setInput("");
    setSending(true);

    try {
      const res = await fetch("http://localhost:8000/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });
      const data = await res.json();
      setMessages(prev => [
        ...prev,
        { sender: "ai", text: data.reply || "Hmm, something went wrong." },
      ]);
    } catch (err) {
      setMessages(prev => [...prev, { sender: "ai", text: "Error contacting AI server." }]);
    }
    setSending(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900 text-white flex flex-col">
      <Navbar />

      <div className="p-8 max-w-5xl mx-auto flex-grow">
        <h2 className="text-4xl font-bold mb-6 text-green-400 flex items-center gap-3">
          <Brain className="w-8 h-8 text-green-400" />
          AI Credit Analysis
        </h2>

        <p className="text-gray-400 mb-8">
          Your AI-powered assistant has analyzed your income, spending, and credit usage
          to give you personalized financial insights and improvement tips. You can even play a savings based game.
        </p>

        {/* ───── Analysis Section ───── */}
        <div className="bg-gray-800/60 rounded-2xl p-8 border border-gray-700 shadow-xl mb-10">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <Loader2 className="animate-spin w-8 h-8 mb-3 text-green-400" />
              <p>Analyzing your financial data...</p>
            </div>
          ) : tips.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2">
              {tips.map((tip, idx) => (
                <div
                  key={idx}
                  className="p-6 bg-gray-900/60 rounded-xl border border-gray-700 hover:border-green-500/70 transition-all"
                >
                  <div className="flex items-center gap-3 mb-3">
                    {idx === 0 ? (
                      <TrendingUp className="text-green-400 w-5 h-5" />
                    ) : idx === 1 ? (
                      <Shield className="text-blue-400 w-5 h-5" />
                    ) : (
                      <Brain className="text-purple-400 w-5 h-5" />
                    )}
                    <h4 className="text-lg font-semibold text-white">{tip.title}</h4>
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed">{tip.advice}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-12">
              <p>No AI analysis available yet. Try adding transactions or updating your profile.</p>
            </div>
          )}
        </div>

        {/* ───── Chat Window ───── */}
        <div className="bg-gray-800/60 rounded-2xl border border-gray-700 shadow-xl p-6">
          <h3 className="text-xl font-semibold text-green-400 mb-4">Chat with Your AI Assistant</h3>

          <div className="h-64 overflow-y-auto bg-gray-900/60 rounded-lg p-4 border border-gray-700 mb-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`mb-3 ${
                  msg.sender === "user" ? "text-right" : "text-left"
                }`}
              >
                <div
                  className={`inline-block px-4 py-2 rounded-xl ${
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

          <div className="flex items-center gap-3">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && sendMessage()}
              placeholder="Type your question..."
              className="flex-grow bg-gray-900 text-white rounded-lg p-3 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button
              onClick={sendMessage}
              disabled={sending}
              className="bg-green-600 hover:bg-green-500 transition p-3 rounded-lg disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
