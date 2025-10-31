import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("income"); // "income" | "expense"
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const email = localStorage.getItem("userEmail");
const API_BASE = "http://127.0.0.1:8000";

  // 🔹 Fetch all user transactions
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 🔹 Add a new transaction
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
          kind, // backend uses this to apply correct sign
        }),
      });

      let data;
      try {
        data = await res.json();
      } catch {
        data = {};
      }

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
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900 text-white">
      <Navbar />
      <div className="p-8">
        <h2 className="text-4xl font-bold mb-8 text-green-400">Transactions</h2>

        {/* 💰 Add Transaction Form */}
        <div className="bg-gray-800/60 rounded-xl p-6 border border-gray-700 mb-8">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col md:flex-row gap-4"
          >
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description"
              className="flex-1 p-3 rounded-lg bg-gray-900 border border-gray-700 focus:ring-2 focus:ring-green-500"
            />
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Amount"
              className="flex-1 p-3 rounded-lg bg-gray-900 border border-gray-700 focus:ring-2 focus:ring-green-500"
            />
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="p-3 rounded-lg bg-gray-900 border border-gray-700 focus:ring-2 focus:ring-green-500"
            >
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
            <button
              type="submit"
              disabled={submitting}
              className="bg-green-600 hover:bg-green-500 px-6 py-3 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50"
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

        {/* 📊 Transactions Table */}
        <div className="bg-gray-800/60 rounded-xl border border-gray-700 p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-300">
            Recent Transactions
          </h3>

          {loading ? (
            <p className="text-gray-400">Loading transactions...</p>
          ) : transactions.length === 0 ? (
            <p className="text-gray-500 italic">No transactions found.</p>
          ) : (
            <table className="w-full text-left text-gray-300">
              <thead>
                <tr className="border-b border-gray-700 text-gray-400">
                  <th className="py-2">Description</th>
                  <th className="py-2">Amount</th>
                  <th className="py-2">Date</th>
                  <th className="py-2">Category</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => (
                  <tr key={t.id} className="border-b border-gray-800">
                    <td>{t.description}</td>
                    <td
                      className={
                        t.amount > 0 ? "text-green-400" : "text-red-400"
                      }
                    >
                      {t.amount > 0 ? "+" : "-"}$
                      {Math.abs(t.amount).toFixed(2)}
                    </td>
                    <td>
                      {new Date(t.transaction_date).toLocaleDateString()}
                    </td>
                    <td>{t.category || "Other"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
