import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Link } from "react-router-dom";
import { LogOut, Wallet, PieChart as PieChartIcon, Settings, Activity } from "lucide-react";

export default function Dashboard() {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({
    balance: 826420.12,
    income: 22842.8,
    expenses: 8048.26,
  });

  const chartData = [
    { name: "BTC", value: 280982.8 },
    { name: "Ethereum", value: 280982.8 },
    { name: "DAI", value: 264454.42 },
  ];

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  // Simulate fetching data
  useEffect(() => {
    // Example: replace with fetch('http://localhost:8000/api/transactions')
    setTransactions([
      { id: 1, name: "Hugo Lester", type: "Payroll", amount: 4906.54, currency: "USDT" },
      { id: 2, name: "Network Fee", type: "Expense", amount: -1.82, currency: "ETH" },
      { id: 3, name: "Adelina Gross", type: "Payroll", amount: 4422.8, currency: "BTC" },
      { id: 4, name: "Crypto.go Invest", type: "Investment", amount: 9820.0, currency: "DAI" },
    ]);
  }, []);

  return (
    <div className="min-h-screen flex bg-[#0b0e17] text-white font-inter">
      {/* Sidebar */}
      <aside className="w-64 bg-[#121623]/80 backdrop-blur-lg border-r border-gray-700/50 flex flex-col justify-between p-6">
        <div>
          <h1 className="text-2xl font-bold text-blue-400 mb-8">CrediWise</h1>

          <nav className="space-y-4">
            <Link to="#" className="flex items-center space-x-3 text-blue-400 font-semibold">
              <Activity size={18} /> <span>Dashboard</span>
            </Link>
            <Link to="#" className="flex items-center space-x-3 text-gray-400 hover:text-white transition">
              <Wallet size={18} /> <span>Transactions</span>
            </Link>
            <Link to="#" className="flex items-center space-x-3 text-gray-400 hover:text-white transition">
              <PieChartIcon size={18} /> <span>Analytics</span>
            </Link>
            <Link to="#" className="flex items-center space-x-3 text-gray-400 hover:text-white transition">
              <Settings size={18} /> <span>Settings</span>
            </Link>
          </nav>
        </div>

        <div className="mt-10 flex items-center justify-between border-t border-gray-700/30 pt-4">
          <p className="text-sm text-gray-400">Logged in as <br /><span className="text-blue-400 font-semibold">User</span></p>
          <button className="text-red-500 hover:text-red-400 transition">
            <LogOut size={20} />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold">Dashboard</h2>
          <button className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg font-semibold">
            + Add Transaction
          </button>
        </div>

        {/* Balance Cards */}
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
          {/* Chart */}
          <div className="col-span-1 bg-gray-800/70 p-6 rounded-xl shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Portfolio Assets</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  label
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Transactions */}
          <div className="col-span-2 bg-gray-800/70 p-6 rounded-xl shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Recent Transactions</h3>
              <button className="text-blue-400 hover:underline">See all</button>
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
