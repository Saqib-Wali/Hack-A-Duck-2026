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

  const COLORS = ["#00C49F", "#FF4444", "#0088FE"];

  useEffect(() => {
    const email = localStorage.getItem("userEmail");
    if (!email) {
      navigate("/login");
      return;
    }

    const fetchDashboardData = async () => {
      try {
        // Get user data
        const userRes = await fetch(`http://localhost:8000/user/${email}`);
        const userData = await userRes.json();
        if (!userRes.ok) throw new Error(userData.detail || "User not found");
        setUser(userData.user);

        // Get user transactions
        const txRes = await fetch(`http://localhost:8000/transactions/${email}`);
        const txData = await txRes.json();
        if (!txRes.ok) throw new Error(txData.detail || "Failed to fetch transactions");

        const txs = txData.transactions || [];
        setTransactions(txs);

        // Compute balance
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
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <p className="animate-pulse text-lg">Loading Dashboard...</p>
      </div>
    );
  }

  const chartData = [
    { name: "Income", value: summary.income },
    { name: "Expenses", value: summary.expenses },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900 text-white">
      <Navbar />
      <main className="p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-4xl font-bold text-green-400">
            Welcome, {user.username || "User"} 👋
          </h2>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-500 px-5 py-2 rounded-lg font-semibold"
          >
            Logout
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-6 mb-10">
          <div className="bg-gray-800/70 p-6 rounded-xl shadow-lg">
            <p className="text-gray-400 text-sm">Total Balance</p>
            <h3 className="text-2xl font-bold mt-2">${summary.balance.toFixed(2)}</h3>
          </div>
          <div className="bg-gray-800/70 p-6 rounded-xl shadow-lg">
            <p className="text-gray-400 text-sm">Total Income</p>
            <h3 className="text-2xl font-bold text-green-400 mt-2">
              +${summary.income.toFixed(2)}
            </h3>
          </div>
          <div className="bg-gray-800/70 p-6 rounded-xl shadow-lg">
            <p className="text-gray-400 text-sm">Total Expenses</p>
            <h3 className="text-2xl font-bold text-red-400 mt-2">
              -${summary.expenses.toFixed(2)}
            </h3>
          </div>
        </div>

        {/* Chart + Transactions */}
        <div className="grid grid-cols-3 gap-8">
          <div className="col-span-1 bg-gray-800/70 p-6 rounded-xl shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Income vs Expenses</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  label
                >
                  {chartData.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="col-span-2 bg-gray-800/70 p-6 rounded-xl shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>

            {transactions.length === 0 ? (
              <p className="text-gray-500 text-center py-6">No transactions found.</p>
            ) : (
              <div className="divide-y divide-gray-700/50">
                {transactions.map((tx) => (
                  <div key={tx.id} className="py-3 flex justify-between">
                    <div>
                      <p className="font-semibold">{tx.description || "Transaction"}</p>
                      <p className="text-sm text-gray-400">
                        {new Date(tx.transaction_date).toLocaleDateString()}
                      </p>
                    </div>
                    <p
                      className={`font-semibold ${
                        tx.amount > 0 ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {tx.amount > 0 ? "+" : "-"}${Math.abs(tx.amount).toFixed(2)}
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
