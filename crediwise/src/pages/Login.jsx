import { useState } from "react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!email || !password) {
        setError("⚠️ Please fill in all fields.");
        return;
      }

      // Simulate backend call
      await new Promise((resolve) => setTimeout(resolve, 1200));
      alert(`✅ Logged in as: ${email}`);
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0b0f19] via-[#101726] to-[#0b0f19] text-white px-4">
      <div className="w-full max-w-md bg-gray-800/40 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-700 p-8 animate-fadeIn">
        {/* Brand */}
        <h1 className="text-4xl font-extrabold mb-3 text-center text-blue-400 tracking-tight">
          CrediWise
        </h1>
        <p className="text-center text-gray-400 mb-8 text-sm">
          Welcome back 👋 <br /> Sign in to your account
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-300 mb-2 text-sm font-medium">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-3 rounded-lg bg-gray-900/70 border border-gray-700 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:outline-none text-white"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2 text-sm font-medium">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-3 rounded-lg bg-gray-900/70 border border-gray-700 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:outline-none text-white"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="text-center text-sm text-red-400 bg-red-900/30 py-2 rounded-lg border border-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-500 hover:opacity-90 transition-all duration-300 font-semibold py-3 rounded-lg disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-sm text-gray-400 mt-6">
          Don’t have an account?{" "}
          <a
            href="/signup"
            className="text-blue-400 hover:text-blue-300 transition-colors"
          >
            Create one
          </a>
        </p>
      </div>
    </div>
  );
}
