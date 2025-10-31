import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";

export default function Profile() {
  const email = localStorage.getItem("userEmail");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // 🧩 Fetch user data from backend when page loads
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
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900 text-white">
      <Navbar />

      <div className="p-8">
        <h2 className="text-4xl font-bold mb-8 text-green-400 text-center">
          Profile Settings
        </h2>

        <div className="bg-gray-800/70 rounded-xl p-6 border border-gray-700 max-w-lg mx-auto shadow-lg">
          {message && (
            <p
              className={`text-center mb-4 font-medium ${
                message.startsWith("✅") ? "text-green-400" : "text-red-400"
              }`}
            >
              {message}
            </p>
          )}

          <form onSubmit={handleUpdate} className="space-y-5">
            <div>
              <label className="block text-gray-400 mb-2 text-sm">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 rounded-lg bg-gray-900 border border-gray-700 focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-gray-400 mb-2 text-sm">Email</label>
              <input
                type="email"
                value={email}
                readOnly
                className="w-full p-3 rounded-lg bg-gray-900 border border-gray-700 opacity-75"
              />
            </div>

            <div>
              <label className="block text-gray-400 mb-2 text-sm">
                New Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Leave blank to keep current password"
                className="w-full p-3 rounded-lg bg-gray-900 border border-gray-700 focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-gray-400 mb-2 text-sm">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="w-full p-3 rounded-lg bg-gray-900 border border-gray-700 focus:ring-2 focus:ring-green-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-500 py-3 rounded-lg font-semibold transition disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
