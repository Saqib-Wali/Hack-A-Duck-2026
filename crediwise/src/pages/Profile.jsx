import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";

export default function Profile() {
  const email = localStorage.getItem("userEmail");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // 🧩 Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`http://localhost:8000/user/${email}`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.detail || "Failed to load user");
        setName(data.user.username);
      } catch (err) {
        setMessage("❌ " + err.message);
      }
    };
    if (email) fetchUser();
  }, [email]);

  // 🧩 Handle Profile Update
  const handleUpdate = async (e) => {
    e.preventDefault();
    setMessage("");

    if (password && password !== confirmPassword) {
      setMessage("⚠️ Passwords do not match!");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://localhost:8000/update_user", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          username: name,
          password: password || null,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Update failed");

      setMessage("✅ Profile updated successfully!");
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      setMessage("❌ " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#070B14] via-[#0C1525] to-[#0B0F17] text-white">
      <Navbar />

      <div className="flex flex-col items-center justify-center px-6 pt-28 pb-10">
        <div className="w-full max-w-lg bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-xl shadow-black/40 relative overflow-hidden">
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-transparent to-transparent opacity-30 blur-3xl pointer-events-none" />

          <h2 className="text-4xl font-bold mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">
            Profile Settings ⚙️
          </h2>

          {message && (
            <div
              className={`text-center mb-5 py-2 rounded-lg text-sm font-medium transition-all ${
                message.startsWith("✅")
                  ? "bg-green-500/10 text-green-400 border border-green-500/30"
                  : message.startsWith("⚠️")
                  ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/30"
                  : "bg-red-500/10 text-red-400 border border-red-500/30"
              }`}
            >
              {message}
            </div>
          )}

          <form onSubmit={handleUpdate} className="space-y-6 relative z-10">
            {/* Name */}
            <div>
              <label className="block text-gray-400 mb-2 text-sm font-medium">
                Username
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 rounded-lg bg-gray-900 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 text-white placeholder-gray-500 transition"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-gray-400 mb-2 text-sm font-medium">
                Email
              </label>
              <input
                type="email"
                value={email}
                readOnly
                className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 text-gray-400 opacity-80 cursor-not-allowed"
              />
            </div>

            {/* New Password */}
            <div>
              <label className="block text-gray-400 mb-2 text-sm font-medium">
                New Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Leave blank to keep current password"
                className="w-full p-3 rounded-lg bg-gray-900 border border-gray-700 focus:ring-2 focus:ring-green-500 placeholder-gray-500 transition"
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-gray-400 mb-2 text-sm font-medium">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="w-full p-3 rounded-lg bg-gray-900 border border-gray-700 focus:ring-2 focus:ring-green-500 placeholder-gray-500 transition"
              />
            </div>

            {/* Save Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white py-3 rounded-lg font-semibold transition-all duration-300 shadow-md shadow-green-700/20 hover:scale-[1.02] disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>

        <p className="text-gray-500 mt-6 text-sm text-center">
          Need help? <span className="text-green-400 cursor-pointer hover:underline">Contact Support</span>
        </p>
      </div>
    </div>
  );
}
