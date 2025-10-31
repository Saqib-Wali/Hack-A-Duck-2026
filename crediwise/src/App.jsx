import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import "./App.css";
import Login from "./pages/Login.jsx";

function HomePage() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Call FastAPI backend
    fetch("http://localhost:8000/")
      .then((res) => res.json())
      .then((data) => {
        setMessage(data.message);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error connecting to backend:", err);
        setMessage("❌ Failed to connect to backend");
        setLoading(false);
      });
  }, []);

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-900 text-white text-3xl">
      <h1 className="text-5xl font-bold mb-8 text-blue-400">CrediWise</h1>
      {loading ? (
        <p className="animate-pulse">Connecting to backend...</p>
      ) : (
        <p>{message}</p>
      )}
      <p className="mt-6 text-base text-gray-400">
        Backend: <code className="text-yellow-400">FastAPI + PostgreSQL</code>
      </p>
      <p className="text-base text-gray-400">
        Frontend: <code className="text-pink-400">React + Vite + Tailwind</code>
      </p>

      <Link
        to="/test"
        className="mt-6 bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg text-lg"
      >
        Go to Test Page
      </Link>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;
