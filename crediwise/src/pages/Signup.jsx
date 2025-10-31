import { useState } from "react";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:8000/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Signup failed");

      alert("✅ Account created successfully! You can now log in.");

      setName("");
      setEmail("");
      setPassword("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen w-screen flex items-center justify-center bg-cover bg-center bg-no-repeat text-white overflow-auto"
      style={{
        backgroundImage: "url('/assets/background.png')",
      }}
    >
      {/* overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

      {/* signup card */}
      <div className="relative z-10 w-full max-w-md bg-gray-900/70 rounded-2xl shadow-2xl p-8 border border-gray-700 mx-4">
        <h1 className="text-4xl font-bold mb-2 text-center text-green-400">
          Create Account
        </h1>
        <p className="text-center text-gray-400 mb-8">
          Join CrediWise and start your financial journey 🚀
        </p>

        {error && (
          <p className="text-center text-red-400 bg-red-900/30 p-2 rounded mb-4 text-sm">
            {error}
          </p>
        )}

        <form onSubmit={handleSignup} className="space-y-5">
          <div>
            <label className="block text-gray-300 mb-2 text-sm">Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 rounded-lg bg-gray-900/70 border border-gray-700 focus:ring-2 focus:ring-green-500 focus:outline-none text-white"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2 text-sm">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 rounded-lg bg-gray-900/70 border border-gray-700 focus:ring-2 focus:ring-green-500 focus:outline-none text-white"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2 text-sm">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded-lg bg-gray-900/70 border border-gray-700 focus:ring-2 focus:ring-green-500 focus:outline-none text-white"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-500 font-semibold py-3 rounded-lg transition-colors duration-200 disabled:opacity-50"
          >
            {loading ? "Creating..." : "Sign Up"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <a href="/login" className="text-green-400 hover:underline">
            Log in
          </a>
        </p>
      </div>
    </div>
  );
}
