import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

export default function Dashboard() {
  const [user, setUser] = useState({});
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({
    balance: 826420.12,
    income: 22842.8,
    expenses: 8048.26,
  });

  useEffect(() => {
    const userEmail = localStorage.getItem("userEmail");
    setUser({ email: userEmail, name: userEmail?.split("@")[0] || "User" });

    // Example static transactions
    setTransactions([
      { id: 1, name: "Hugo Lester", type: "Payroll", amount: 4906.54, currency: "USDT" },
      { id: 2, name: "Network Fee", type: "Expense", amount: -1.82, currency: "ETH" },
      { id: 3, name: "Adelina Gross", type: "Payroll", amount: 4422.8, currency: "BTC" },
      { id: 4, name: "Crypto.go Invest", type: "Investment", amount: 9820.0, currency: "DAI" },
    ]);
  }, []);

  const chartData = [
    { name: "BTC", value: 280982.8 },
    { name: "Ethereum", value: 280982.8 },
    { name: "DAI", value: 264454.42 },
  ];
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28"];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900 text-white">
      <Navbar />

      <main className="p-8">
        <h2 className="text-4xl font-bold mb-6 text-green-400">
          Welcome, {user.name || "User"} 👋
        </h2>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-6 mb-10">
          <div className="bg-gray-800/70 p-6 rounded-xl shadow-lg">
            <p className="text-gray-400 text-sm">Total Balance</p>
            <h3 className="text-2xl font-bold mt-2">${summary.balance.toLocaleString()}</h3>
            <p className="text-green-400 text-sm mt-1">+1.21%</p>
          </div>
          <div className="bg-gray-800/70 p-6 rounded-xl shadow-lg">
            <p className="text-gray-400 text-sm">Monthly Income</p>
            <h3 className="text-2xl font-bold text-green-400 mt-2">+${summary.income.toLocaleString()}</h3>
          </div>
          <div className="bg-gray-800/70 p-6 rounded-xl shadow-lg">
            <p className="text-gray-400 text-sm">Monthly Expenses</p>
            <h3 className="text-2xl font-bold text-red-400 mt-2">-${summary.expenses.toLocaleString()}</h3>
          </div>
        </div>

        {/* Chart + Transactions */}
        <div className="grid grid-cols-3 gap-8">
          <div className="col-span-1 bg-gray-800/70 p-6 rounded-xl shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Portfolio Assets</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={chartData} dataKey="value" cx="50%" cy="50%" innerRadius={60} outerRadius={80} label>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="col-span-2 bg-gray-800/70 p-6 rounded-xl shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Recent Transactions</h3>
            </div>

            <div className="divide-y divide-gray-700/50">
              {transactions.map((tx) => (
                <div key={tx.id} className="py-3 flex justify-between">
                  <div>
                    <p className="font-semibold">{tx.name}</p>
                    <p className="text-sm text-gray-400">{tx.type}</p>
                  </div>
                  <p className={`font-semibold ${tx.amount > 0 ? "text-green-400" : "text-red-400"}`}>
                    {tx.amount > 0 ? "+" : "-"}${Math.abs(tx.amount)} {tx.currency}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
