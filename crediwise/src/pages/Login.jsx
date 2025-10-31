import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const API_BASE = "http://localhost:8000";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const existing = localStorage.getItem("userEmail");
    if (existing) navigate("/dashboard");
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Login failed");

      localStorage.setItem("userId", data.user.id);
      localStorage.setItem("userName", data.user.name);
      localStorage.setItem("userEmail", data.user.email);

      navigate("/dashboard");
    } catch (err) {
      setError(err?.message || "Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center text-white relative overflow-hidden bg-cover bg-center"
      style={{
        backgroundImage: "url('/assets/finance-bg.jpg')", // 🖼️ Add your custom background image here
      }}
    >
      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-blue-950/70 to-black/80 backdrop-blur-sm"></div>

      {/* Soft glow orbs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-600/30 blur-3xl rounded-full animate-pulse-slow"></div>
      <div className="absolute bottom-0 right-0 w-[28rem] h-[28rem] bg-indigo-500/25 blur-3xl rounded-full animate-pulse-slow"></div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-md bg-white/10 backdrop-blur-md border border-blue-700/40 rounded-3xl shadow-[0_0_50px_rgba(37,99,235,0.25)] p-10 mx-4 transition-all duration-300 hover:shadow-[0_0_80px_rgba(59,130,246,0.4)]">
        <h1 className="text-4xl font-extrabold mb-4 text-center bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
          Welcome Back
        </h1>
        <p className="text-center text-gray-300 mb-8 text-sm font-light">
          Sign in to your <span className="text-blue-400 font-semibold">CrediWise</span> account
        </p>

        {error && (
          <p className="text-center text-red-400 bg-red-900/30 p-2 rounded mb-4 text-sm border border-red-700/40">
            {error}
          </p>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-gray-300 mb-2 text-sm">Email Address</label>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full p-3 rounded-lg bg-slate-900/60 border border-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-400 text-white placeholder-gray-400 transition-all duration-200"
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2 text-sm">Password</label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full p-3 pr-12 rounded-lg bg-slate-900/60 border border-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-400 text-white placeholder-gray-400 transition-all duration-200"
              />
              <button
                type="button"
                onClick={() => setShowPw((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-300 text-sm"
              >
                {showPw ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg font-semibold text-white text-lg bg-gradient-to-r from-blue-600 to-indigo-500 hover:from-blue-500 hover:to-cyan-400 transition-all duration-300 shadow-[0_0_25px_rgba(59,130,246,0.4)] disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-8">
          Don’t have an account?{" "}
          <Link
            to="/signup"
            className="text-blue-400 hover:text-blue-300 font-medium transition-all duration-200"
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
