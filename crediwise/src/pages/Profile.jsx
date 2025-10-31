import Navbar from "../components/Navbar";

export default function Profile() {
  const email = localStorage.getItem("userEmail") || "Unknown User";
  const name = email.split("@")[0];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900 text-white">
      <Navbar />
      <div className="p-8">
        <h2 className="text-4xl font-bold mb-8 text-green-400">Profile Settings</h2>

        <div className="bg-gray-800/70 rounded-xl p-6 border border-gray-700 max-w-lg mx-auto">
          <form className="space-y-5">
            <div>
              <label className="block text-gray-400 mb-2 text-sm">Name</label>
              <input
                type="text"
                value={name}
                className="w-full p-3 rounded-lg bg-gray-900 border border-gray-700 focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-gray-400 mb-2 text-sm">Email</label>
              <input
                type="email"
                value={email}
                readOnly
                className="w-full p-3 rounded-lg bg-gray-900 border border-gray-700 focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-gray-400 mb-2 text-sm">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full p-3 rounded-lg bg-gray-900 border border-gray-700 focus:ring-2 focus:ring-green-500"
              />
            </div>

            <button className="w-full bg-green-600 hover:bg-green-500 py-3 rounded-lg font-semibold">
              Save Changes
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
