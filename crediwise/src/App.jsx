import { useEffect, useState } from "react";
import "./App.css";

function App() {
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
    </div>
  );
}

export default App;
