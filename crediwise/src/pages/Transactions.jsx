import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("income");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const email = localStorage.getItem("userEmail");
  const API_BASE = "http://127.0.0.1:8000";

  const fetchTransactions = async () => {
    if (!email) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/transactions/${email}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to load transactions");
      setTransactions(data.transactions || []);
      setMessage("");
    } catch (err) {
      console.error(err);
      setMessage("⚠️ Unable to load transactions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description || !amount) return alert("Please fill all fields.");
    if (!email) return alert("You’re not logged in.");

    const raw = parseFloat(amount);
    if (Number.isNaN(raw)) return alert("Amount must be a number.");

    const positiveAmount = Math.abs(raw);
    const kind = (type || "income").toLowerCase();

    try {
      setSubmitting(true);
      setMessage("Adding transaction...");

      const res = await fetch(`${API_BASE}/transactions/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          amount: positiveAmount,
          description,
          transaction_date: new Date().toISOString().split("T")[0],
          kind,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to add transaction");

      setMessage("✅ Transaction added!");
      setDescription("");
      setAmount("");
      fetchTransactions();
    } catch (err) {
      console.error(err);
      setMessage(`❌ ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#070B14] via-[#0C1525] to-[#0B0F17] text-white overflow-y-auto">
      <Navbar />

      <div className="max-w-6xl mx-auto p-8 space-y-10">
        {/* Header */}
        <div>
          <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-green-400">
            Transactions
          </h2>
          <p className="text-gray-400 mt-2">
            Manage and review your financial activity
          </p>
        </div>

        {/* Add Transaction */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-lg shadow-black/20">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col md:flex-row gap-4 items-center"
          >
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description"
              className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20 placeholder-gray-400 focus:ring-2 focus:ring-green-400 focus:outline-none"
            />
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Amount"
              className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20 placeholder-gray-400 focus:ring-2 focus:ring-green-400 focus:outline-none"
            />
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-gray-200 focus:ring-2 focus:ring-green-400 focus:outline-none"
            >
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
            <button
              type="submit"
              disabled={submitting}
              className="bg-gradient-to-r from-green-500 to-emerald-400 hover:from-green-400 hover:to-emerald-300 text-black font-semibold px-6 py-3 rounded-lg transition-all duration-200 disabled:opacity-50 shadow-md"
            >
              {submitting ? "Adding..." : "Add Transaction"}
            </button>
          </form>
          {message && (
            <p className="text-sm text-gray-400 mt-3" aria-live="polite">
              {message}
            </p>
          )}
        </div>

        {/* Transactions Table */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-lg shadow-black/20">
          <h3 className="text-xl font-semibold text-gray-200 mb-4">
            Recent Transactions
          </h3>

          {loading ? (
            <p className="text-gray-400 animate-pulse-slow">
              Loading transactions...
            </p>
          ) : transactions.length === 0 ? (
            <p className="text-gray-500 italic">No transactions found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm text-gray-300">
                <thead className="border-b border-gray-700 text-gray-400 uppercase text-xs tracking-wider">
                  <tr>
                    <th className="py-3 px-2">Description</th>
                    <th className="py-3 px-2">Amount</th>
                    <th className="py-3 px-2">Date</th>
                    <th className="py-3 px-2">Category</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t) => (
                    <tr
                      key={t.id}
                      className="border-b border-white/5 hover:bg-white/10 transition-colors"
                    >
                      <td className="py-3 px-2">{t.description}</td>
                      <td
                        className={`py-3 px-2 font-semibold ${
                          t.amount > 0 ? "text-green-400" : "text-red-400"
                        }`}
                      >
                        {t.amount > 0 ? "+" : "-"}$
                        {Math.abs(t.amount).toFixed(2)}
                      </td>
                      <td className="py-3 px-2">
                        {new Date(t.transaction_date).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-2 text-gray-400">
                        {t.category || "Other"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
