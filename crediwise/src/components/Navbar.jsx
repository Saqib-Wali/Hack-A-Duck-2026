import { Link, useLocation, useNavigate } from "react-router-dom";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
    localStorage.removeItem("userId");
    navigate("/login");
  };

  const navLinks = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Transactions", path: "/transactions" },
    { name: "Credit Education", path: "/credit-education" },
    { name: "Analysis", path: "/credit-analysis" },
    { name: "Profile", path: "/profile" },
  ];

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-[#0b0f17]/80 border-b border-white/10 shadow-[0_0_15px_rgba(0,0,0,0.4)]">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">
        {/* Brand Logo */}
        <Link
          to="/dashboard"
          className="text-3xl font-extrabold bg-gradient-to-r from-green-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent select-none tracking-tight"
        >
          CrediWise
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex space-x-8 text-gray-300 font-medium">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`relative transition-all duration-200 hover:text-green-400 ${
                location.pathname === link.path ? "text-green-400" : ""
              }`}
            >
              {link.name}
              {/* Active underline */}
              {location.pathname === link.path && (
                <span className="absolute -bottom-1 left-0 w-full h-[2px] bg-gradient-to-r from-green-400 to-cyan-400 rounded-full"></span>
              )}
            </Link>
          ))}
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="ml-4 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-semibold px-5 py-2 rounded-xl shadow-md shadow-red-900/30 transition-all duration-300"
        >
          Logout
        </button>
      </div>

      {/* Mobile Menu */}
      <div className="md:hidden flex justify-center border-t border-white/10 bg-[#0b0f17]/90 text-sm text-gray-400 py-2 space-x-6">
        {navLinks.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`hover:text-green-400 ${
              location.pathname === link.path ? "text-green-400" : ""
            }`}
          >
            {link.name}
          </Link>
        ))}
      </div>
    </nav>
  );
}
