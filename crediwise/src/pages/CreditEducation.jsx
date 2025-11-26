import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";

export default function CreditEducation() {
  const [creditScore, setCreditScore] = useState(null);
  const [tips, setTips] = useState([]);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const email = localStorage.getItem("userEmail"); // ✅ this is correct

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [scoreRes, tipsRes, insightsRes] = await Promise.all([
          fetch(`http://localhost:8000/credit/${email}`),
          fetch(`http://localhost:8000/credit/tips/${email}`), // ✅ fixed here
          fetch(`http://localhost:8000/credit/insights/${email}`),
        ]);

        if (scoreRes.ok) setCreditScore(await scoreRes.json());
        if (tipsRes.ok) setTips(await tipsRes.json());
        if (insightsRes.ok) {
          const insightsData = await insightsRes.json();
          setInsights(insightsData.insights || []);
        }
      } catch (err) {
        console.error("❌ Error loading credit education data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (email) fetchData();
  }, [email]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white">
        <p className="animate-pulse text-blue-300">Loading credit education...</p>
      </div>
    );

  return (
    <div
      className="min-h-screen text-white bg-cover bg-center relative"
      style={{ backgroundImage: "url('/assets/finance-bg.jpg')" }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/90 via-blue-950/80 to-black/90 backdrop-blur-sm"></div>

      {/* Glow effects */}
      <div className="absolute top-10 left-10 w-80 h-80 bg-green-500/20 blur-3xl rounded-full animate-pulse-slow"></div>
      <div className="absolute bottom-10 right-10 w-[30rem] h-[30rem] bg-blue-600/20 blur-3xl rounded-full animate-pulse-slow"></div>

      <Navbar />

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-12">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-center mb-4 bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
          Credit Awareness & Tips 💳
        </h1>
        <p className="text-center text-gray-400 max-w-2xl mx-auto mb-12">
          Learn what impacts your credit score and how to keep it healthy.
        </p>

        {/* Credit Score Section */}
        {creditScore ? (
          <div className="bg-white/10 backdrop-blur-md border border-blue-700/30 p-8 rounded-2xl shadow-[0_0_25px_rgba(59,130,246,0.25)] text-center mb-12">
            <h3 className="text-2xl font-semibold text-green-400">
              Your Credit Score: {creditScore.score}
            </h3>
            <p className="text-gray-400 text-sm mt-2">
              Reported by <span className="text-blue-400">{creditScore.provider}</span> on{" "}
              {new Date(creditScore.date).toLocaleDateString()}
            </p>
          </div>
        ) : (
          <div className="text-center text-gray-500 mb-12">
            ⚠️ No credit score data available yet.
          </div>
        )}

        {/* Personalized Insights */}
        {insights.length > 0 && (
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-green-400 mb-6 text-center">
              Personalized Credit Insights 🔍
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {insights.map((tip, i) => (
                <div
                  key={i}
                  className="group bg-white/10 border border-white/10 backdrop-blur-md rounded-2xl p-6 shadow-[0_0_25px_rgba(34,197,94,0.15)] hover:shadow-[0_0_35px_rgba(34,197,94,0.25)] transition-all duration-300"
                >
                  <div className="w-12 h-1 bg-gradient-to-r from-green-400 to-blue-400 rounded-full mb-4"></div>
                  <h3 className="text-xl font-semibold mb-2 text-white group-hover:text-green-300 transition-colors">
                    {tip.title}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{tip.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* General Financial Tips */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {tips.length > 0 ? (
            tips.personalized_tips
              ? tips.personalized_tips.map((tip, i) => (
                  <div
                    key={i}
                    className="group bg-white/10 border border-white/10 backdrop-blur-md rounded-2xl p-6 shadow-[0_0_25px_rgba(59,130,246,0.15)] hover:shadow-[0_0_35px_rgba(34,197,94,0.25)] transition-all duration-300"
                  >
                    <div className="w-12 h-1 bg-gradient-to-r from-green-400 to-blue-400 rounded-full mb-4"></div>
                    <h3 className="text-xl font-semibold mb-2 text-white group-hover:text-green-300 transition-colors">
                      {tip.title}
                    </h3>
                    <p className="text-gray-400 text-sm leading-relaxed">{tip.content}</p>
                  </div>
                ))
              : tips.map((tip, i) => (
                  <div
                    key={i}
                    className="group bg-white/10 border border-white/10 backdrop-blur-md rounded-2xl p-6 shadow-[0_0_25px_rgba(59,130,246,0.15)] hover:shadow-[0_0_35px_rgba(34,197,94,0.25)] transition-all duration-300"
                  >
                    <div className="w-12 h-1 bg-gradient-to-r from-green-400 to-blue-400 rounded-full mb-4"></div>
                    <h3 className="text-xl font-semibold mb-2 text-white group-hover:text-green-300 transition-colors">
                      {tip.title}
                    </h3>
                    <p className="text-gray-400 text-sm leading-relaxed">{tip.content}</p>
                  </div>
                ))
          ) : (
            <p className="text-gray-500 text-center col-span-full">No financial tips found.</p>
          )}
        </div>

        {/* Motivation Banner */}
        <div className="mt-16 text-center">
          <div className="inline-block bg-gradient-to-r from-blue-600 to-green-500 px-6 py-4 rounded-2xl shadow-lg shadow-blue-900/40">
            <p className="text-lg font-semibold text-white">
              💡 Keep your utilisation below 30% and pay on time — consistency builds credit confidence!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
