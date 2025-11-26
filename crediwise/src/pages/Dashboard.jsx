import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [user, setUser] = useState({});
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({ balance: 0, income: 0, expenses: 0 });
  const [challenges, setChallenges] = useState([]);
  const [motivation, setMotivation] = useState("");
  const [loading, setLoading] = useState(true);

  // Modals & Form states
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [newGoal, setNewGoal] = useState({ title: "", goal_amount: "" });
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [progressAmount, setProgressAmount] = useState("");
  const navigate = useNavigate();

  const COLORS = ["#22c55e", "#ef4444", "#0ea5e9"];

  // ✅ Fetch dashboard data
  useEffect(() => {
    const email = localStorage.getItem("userEmail");
    if (!email) {
      navigate("/login");
      return;
    }

    const fetchDashboardData = async () => {
      try {
        const userRes = await fetch(`http://localhost:8000/user/${email}`);
        const userData = await userRes.json();
        if (!userRes.ok) throw new Error(userData.detail || "User not found");
        setUser(userData.user);

        const txRes = await fetch(`http://localhost:8000/transactions/${email}`);
        const txData = await txRes.json();
        if (!txRes.ok) throw new Error(txData.detail || "Failed to fetch transactions");
        const txs = txData.transactions || [];
        setTransactions(txs);

        const income = txs.filter(t => t.amount > 0).reduce((a, b) => a + Number(b.amount), 0);
        const expenses = txs.filter(t => t.amount < 0).reduce((a, b) => a + Math.abs(Number(b.amount)), 0);
        const balance = income - expenses;
        setSummary({ income, expenses, balance });

        const chRes = await fetch(`http://localhost:8000/challenges/${email}`);
        if (chRes.ok) {
          const chData = await chRes.json();
          setChallenges(chData.challenges || []);
        }

        // 🧠 Get motivation from AI (safe fallback)
        const motRes = await fetch(`http://localhost:8000/challenges/motivate/${email}`);
        if (motRes.ok) {
          const motData = await motRes.json();
          if (motData.message) setMotivation(motData.message);
        } else {
          setMotivation("Keep pushing forward toward your savings goals! 💪");
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  // ➕ Add new goal
  const handleAddGoal = async () => {
    const email = localStorage.getItem("userEmail");
    if (!email || !newGoal.title || !newGoal.goal_amount) return;
    await fetch("http://localhost:8000/challenges/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, title: newGoal.title, goal_amount: Number(newGoal.goal_amount) }),
    });
    setShowGoalModal(false);
    // ✅ Refresh challenges instantly
    setChallenges((prev) => [
      ...prev,
      { id: Math.random().toString(), title: newGoal.title, goal_amount: newGoal.goal_amount, progress: 0, completed: false },
    ]);
  };

  // 🟢 Progress modal controls
  const handleProgressUpdate = (ch) => {
    setSelectedChallenge(ch);
    setProgressAmount("");
    setShowProgressModal(true);
  };

  const confirmProgressUpdate = async () => {
    if (!selectedChallenge || !progressAmount) return;
    const res = await fetch("http://localhost:8000/challenges/update_progress", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        challenge_id: selectedChallenge.id,
        amount: Number(progressAmount),
      }),
    });

    if (res.ok) {
      setChallenges((prev) =>
        prev.map((goal) =>
          goal.id === selectedChallenge.id
            ? {
                ...goal,
                progress: goal.progress + Number(progressAmount),
                completed: goal.progress + Number(progressAmount) >= goal.goal_amount,
              }
            : goal
        )
      );
    }

    setShowProgressModal(false);
  };

  // 🗑️ Delete goal (fixed version)
  const handleDeleteGoal = async (e, ch) => {
    e.stopPropagation();
    const confirmDelete = window.confirm(`Delete goal "${ch.title}"?`);
    if (!confirmDelete) return;

    try {
      const res = await fetch(`http://localhost:8000/challenges/delete/${ch.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setChallenges((prev) => prev.filter((goal) => goal.id !== ch.id));
      } else {
        alert("❌ Failed to delete goal. Check backend logs.");
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("⚠️ Error deleting goal.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#070B14] to-[#0B0F17] text-white">
        <p className="animate-pulse text-lg">Loading Dashboard...</p>
      </div>
    );
  }

  const chartData = [
    { name: "Income", value: summary.income },
    { name: "Expenses", value: summary.expenses },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#070B14] via-[#0C1525] to-[#0B0F17] text-white overflow-y-auto">
      <Navbar />

      <main className="max-w-7xl mx-auto p-8 space-y-10 pt-32">
        {/* 👋 Welcome Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-green-400">
              Welcome back, {user.username || "User"} 👋
            </h2>
            <p className="text-gray-400 mt-1">Here’s your financial overview today</p>
          </div>
        </div>

        {/* 💰 Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: "Total Balance", value: summary.balance, color: "text-cyan-400", prefix: "$" },
            { label: "Total Income", value: summary.income, color: "text-green-400", prefix: "+$" },
            { label: "Total Expenses", value: summary.expenses, color: "text-red-400", prefix: "-$" },
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 shadow-lg shadow-black/20"
            >
              <p className="text-gray-400 text-sm">{item.label}</p>
              <h3 className={`text-3xl font-bold mt-2 ${item.color}`}>
                {item.prefix}{item.value.toFixed(2)}
              </h3>
            </div>
          ))}
        </div>

        {/* 📈 Chart + Transactions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="col-span-1 bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 shadow-lg shadow-black/20">
            <h3 className="text-lg font-semibold mb-4 text-gray-200">Income vs Expenses</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={chartData} dataKey="value" cx="50%" cy="50%" innerRadius={60} outerRadius={90} label>
                  {chartData.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#111827",
                    border: "1px solid #1f2937",
                    borderRadius: "8px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-around mt-4 text-sm">
              <p className="text-green-400">Income</p>
              <p className="text-red-400">Expenses</p>
            </div>
          </div>

          <div className="col-span-2 bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 shadow-lg shadow-black/20">
            <h3 className="text-lg font-semibold mb-4 text-gray-200">Recent Transactions</h3>
            {transactions.length === 0 ? (
              <p className="text-gray-500 text-center py-6 italic">No transactions found.</p>
            ) : (
              <div className="divide-y divide-white/10">
                {transactions.slice(0, 6).map((tx) => (
                  <div key={tx.id} className="py-3 flex justify-between items-center hover:bg-white/10 transition-all rounded-lg px-3">
                    <div>
                      <p className="font-medium text-gray-200">{tx.description || "Transaction"}</p>
                      <p className="text-sm text-gray-500">{new Date(tx.transaction_date).toLocaleDateString()}</p>
                    </div>
                    <p className={`font-semibold text-lg ${tx.amount > 0 ? "text-green-400" : "text-red-400"}`}>
                      {tx.amount > 0 ? "+" : "-"}${Math.abs(tx.amount).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 🏦 Saving Goals Section */}
        <section className="mt-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-green-400 tracking-tight flex items-center gap-2">
              🏦 <span>Saving Goals</span>
            </h2>
            <button
              onClick={() => setShowGoalModal(true)}
              className="px-5 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-medium rounded-xl shadow-md shadow-green-700/20 transition-all duration-200 hover:scale-105"
            >
              + New Goal
            </button>
          </div>

          {challenges.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {challenges.map((ch) => {
                const pct = Math.min((ch.progress / ch.goal_amount) * 100, 100);
                const completed = ch.completed || pct >= 100;
                return (
                  <div
                    key={ch.id}
                    className="p-6 rounded-2xl bg-gradient-to-b from-[#0D131F]/90 to-[#0A0F18]/80 border border-white/10 hover:border-green-500/40 transition-all duration-300 shadow-lg shadow-black/30 relative overflow-hidden group"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-xl font-semibold text-green-400 flex items-center gap-2">
                        💰 {ch.title}
                      </h3>
                      <button
                        type="button"
                        title="Delete goal"
                        className="text-red-400 hover:text-red-300 text-lg font-bold transition-transform transform hover:scale-125"
                        onClick={(e) => handleDeleteGoal(e, ch)}
                      >
                        ✖
                      </button>
                    </div>

                    <p className="text-gray-300 mb-2 text-sm">
                      Target: <span className="font-bold text-white">${ch.goal_amount}</span>
                    </p>

                    <div className="relative w-full bg-gray-800 h-3 rounded-lg overflow-hidden mb-3">
                      <div
                        className={`h-full transition-all duration-700 ${
                          completed
                            ? "bg-gradient-to-r from-green-400 to-emerald-600"
                            : "bg-gradient-to-r from-emerald-500 to-green-600"
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    <div className="flex justify-between items-center text-sm text-gray-400">
                      <span>
                        Progress: <span className="text-white font-semibold">${ch.progress}</span> / ${ch.goal_amount}
                      </span>
                      {completed ? (
                        <span className="text-green-400 font-semibold flex items-center gap-1">
                          🎉 Completed
                        </span>
                      ) : (
                        <span className="text-yellow-400 font-medium">🔥 Keep going</span>
                      )}
                    </div>

                    {!completed && (
                      <button
                        onClick={() => handleProgressUpdate(ch)}
                        className="mt-4 w-full py-2 rounded-lg bg-green-600 hover:bg-green-700 transition-all duration-200 font-medium shadow-md shadow-green-700/20 hover:scale-105"
                      >
                        + Add Progress
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-400 italic mt-10 text-center">
              No active saving goals yet. Click <span className="text-green-400 font-semibold">+ New Goal</span> to get started!
            </p>
          )}

          {motivation && (
            <div className="bg-gradient-to-r from-green-600/10 to-emerald-600/10 border border-green-500/20 text-green-300 text-center p-4 rounded-xl mt-10 backdrop-blur-sm shadow-inner shadow-green-800/10 animate-pulse">
              🌟 {motivation}
            </div>
          )}
        </section>

        {/* ➕ Create Goal Modal */}
        {showGoalModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fadeIn">
            <div className="bg-gradient-to-b from-[#0F172A] to-[#111827] border border-white/10 shadow-2xl rounded-2xl p-8 w-[90%] max-w-md text-white relative">
              <button
                onClick={() => setShowGoalModal(false)}
                className="absolute top-3 right-4 text-gray-400 hover:text-white text-2xl font-bold"
              >
                ✕
              </button>
              <h3 className="text-2xl font-semibold mb-6 text-green-400">Create Saving Goal</h3>
              <input
                type="text"
                placeholder="Goal Title"
                className="w-full p-3 mb-4 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
              />
              <input
                type="number"
                placeholder="Target Amount ($)"
                className="w-full p-3 mb-6 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                onChange={(e) => setNewGoal({ ...newGoal, goal_amount: e.target.value })}
              />
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowGoalModal(false)}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddGoal}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                >
                  Save Goal
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ➕ Add Progress Modal */}
        {showProgressModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fadeIn">
            <div className="bg-gradient-to-b from-[#0F172A] to-[#111827] border border-white/10 shadow-2xl rounded-2xl p-8 w-[90%] max-w-md text-white relative">
              <button
                onClick={() => setShowProgressModal(false)}
                className="absolute top-3 right-4 text-gray-400 hover:text-white text-2xl font-bold"
              >
                ✕
              </button>
              <h3 className="text-2xl font-semibold mb-6 text-green-400">Add Progress</h3>
              <p className="text-gray-300 mb-4">
                {selectedChallenge?.title} — Goal: ${selectedChallenge?.goal_amount}
              </p>
              <input
                type="number"
                placeholder="Enter amount saved ($)"
                className="w-full p-3 mb-6 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                value={progressAmount}
                onChange={(e) => setProgressAmount(e.target.value)}
              />
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowProgressModal(false)}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmProgressUpdate}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                >
                  Save Progress
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
