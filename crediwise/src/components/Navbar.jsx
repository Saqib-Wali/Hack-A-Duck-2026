export default function Navbar() {
  return (
    <nav className="flex justify-between items-center px-6 py-3 bg-gray-900/80 backdrop-blur-md border-b border-gray-800 shadow-sm">
      <h1 className="text-2xl font-bold text-green-400">CrediWise</h1>
      <div className="space-x-6 text-gray-300">
        <a href="/dashboard" className="hover:text-green-400">Dashboard</a>
        <a href="/transactions" className="hover:text-green-400">Transactions</a>
        <a href="/credit-analysis" className="hover:text-green-400">Analysis</a>
        <a href="/profile" className="hover:text-green-400">Profile</a>
        <a href="/login" className="hover:text-red-400">Logout</a>
      </div>
    </nav>
  );
}
