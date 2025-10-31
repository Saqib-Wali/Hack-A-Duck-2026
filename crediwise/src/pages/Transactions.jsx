import Navbar from "../components/Navbar";

export default function Transactions() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900 text-white">
      <Navbar />
      <div className="p-8">
        <h2 className="text-4xl font-bold mb-8 text-green-400">Transactions</h2>

        <div className="bg-gray-800/60 rounded-xl p-6 border border-gray-700 mb-8">
          <form className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              placeholder="Description"
              className="flex-1 p-3 rounded-lg bg-gray-900 border border-gray-700 focus:ring-2 focus:ring-green-500"
            />
            <input
              type="number"
              placeholder="Amount"
              className="flex-1 p-3 rounded-lg bg-gray-900 border border-gray-700 focus:ring-2 focus:ring-green-500"
            />
            <button type="submit" className="bg-green-600 hover:bg-green-500 px-6 py-3 rounded-lg font-semibold">
              Add Transaction
            </button>
          </form>
        </div>

        <div className="bg-gray-800/60 rounded-xl border border-gray-700 p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-300">Recent Transactions</h3>
          <table className="w-full text-left text-gray-300">
            <thead>
              <tr className="border-b border-gray-700 text-gray-400">
                <th className="py-2">Description</th>
                <th className="py-2">Amount</th>
                <th className="py-2">Date</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-800">
                <td>Groceries</td>
                <td className="text-red-400">- $65</td>
                <td>Oct 30, 2025</td>
              </tr>
              <tr>
                <td>Salary</td>
                <td className="text-green-400">+ $3,000</td>
                <td>Oct 28, 2025</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
