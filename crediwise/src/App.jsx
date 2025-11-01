import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import "./App.css";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import CreditAnalysis from "./pages/CreditAnalysis";
import Profile from "./pages/Profile";
import CreditEducation from "./pages/CreditEducation";
import FrontPage from "./pages/FrontPage";



function HomePage() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:8000/")
      .then((res) => res.json())
      .then((data) => {
        setMessage(data.message);
        setLoading(false);
      })
      .catch(() => {
        setMessage("❌ Failed to connect to backend");
        setLoading(false);
      });
  }, []);

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
      <h1 className="text-5xl font-bold mb-6 text-blue-400">CrediWise</h1>
      {loading ? (
        <p className="animate-pulse">Connecting to backend...</p>
      ) : (
        <p className="text-lg">{message}</p>
      )}

      <div className="mt-10 space-x-6">
        <Link to="/login" className="bg-blue-600 px-5 py-2 rounded-lg hover:bg-blue-500">
          Login
        </Link>
        <Link to="/signup" className="bg-green-600 px-5 py-2 rounded-lg hover:bg-green-500">
          Signup
        </Link>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        {/* 🌍 Public Pages */}
        <Route path="/" element={<FrontPage />} />
        {/* <Route path="/" element={<HomePage />} /> */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* 🔒 Authenticated Pages */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/credit-analysis" element={<CreditAnalysis />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/credit-education" element={<CreditEducation />} />

      </Routes>
    </Router>
  );
}
