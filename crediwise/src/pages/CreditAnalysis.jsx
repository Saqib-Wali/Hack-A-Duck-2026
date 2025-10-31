import Navbar from "../components/Navbar";

export default function CreditAnalysis() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900 text-white">
      <Navbar />
      <div className="p-8">
        <h2 className="text-4xl font-bold mb-8 text-green-400">Credit Analysis</h2>

        <div className="bg-gray-800/60 rounded-xl p-6 border border-gray-700">
          <h3 className="text-xl font-semibold text-gray-300 mb-4">
            Your Financial Overview
          </h3>
          <p className="text-gray-400">
            We’ll analyze your spending patterns, income ratio, and debt levels to
            provide a credit score simulation and personalized advice soon.
          </p>

          <div className="mt-6 text-center text-gray-500">
            📈 Charts and analytics coming soon...
          </div>
        </div>
      </div>
    </div>
  );
}
