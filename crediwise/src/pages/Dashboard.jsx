import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [user, setUser] = useState({});
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({ balance: 0, income: 0, expenses: 0 });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const COLORS = ["#22c55e", "#ef4444", "#0ea5e9"]; // green, red, blue

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
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("userEmail");
    navigate("/login");
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

      <main className="max-w-7xl mx-auto p-8 space-y-10">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-green-400">
              Welcome back, {user.username || "User"} 👋
            </h2>
            <p className="text-gray-400 mt-1">
              Here’s your financial overview today
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 px-6 py-2.5 rounded-xl font-semibold shadow-lg shadow-red-900/30 transition-all"
          >
            Logout
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Balance */}
          <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 shadow-lg shadow-black/20">
            <p className="text-gray-400 text-sm">Total Balance</p>
            <h3 className="text-3xl font-bold mt-2 text-cyan-400">
              ${summary.balance.toFixed(2)}
            </h3>
          </div>

          {/* Income */}
          <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 shadow-lg shadow-black/20">
            <p className="text-gray-400 text-sm">Total Income</p>
            <h3 className="text-3xl font-bold mt-2 text-green-400">
              +${summary.income.toFixed(2)}
            </h3>
          </div>

          {/* Expenses */}
          <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 shadow-lg shadow-black/20">
            <p className="text-gray-400 text-sm">Total Expenses</p>
            <h3 className="text-3xl font-bold mt-2 text-red-400">
              -${summary.expenses.toFixed(2)}
            </h3>
          </div>
        </div>

        {/* Chart + Transactions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chart Card */}
          <div className="col-span-1 bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 shadow-lg shadow-black/20">
            <h3 className="text-lg font-semibold mb-4 text-gray-200">
              Income vs Expenses
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  label
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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

          {/* Transactions List */}
          <div className="col-span-2 bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 shadow-lg shadow-black/20">
            <h3 className="text-lg font-semibold mb-4 text-gray-200">
              Recent Transactions
            </h3>

            {transactions.length === 0 ? (
              <p className="text-gray-500 text-center py-6 italic">
                No transactions found.
              </p>
            ) : (
              <div className="divide-y divide-white/10">
                {transactions.slice(0, 6).map((tx) => (
                  <div
                    key={tx.id}
                    className="py-3 flex justify-between items-center hover:bg-white/10 transition-all rounded-lg px-3"
                  >
                    <div>
                      <p className="font-medium text-gray-200">
                        {tx.description || "Transaction"}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(tx.transaction_date).toLocaleDateString()}
                      </p>
                    </div>
                    <p
                      className={`font-semibold text-lg ${
                        tx.amount > 0 ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {tx.amount > 0 ? "+" : "-"}$
                      {Math.abs(tx.amount).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
