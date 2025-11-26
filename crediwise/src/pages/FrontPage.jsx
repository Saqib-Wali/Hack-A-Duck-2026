// src/pages/FrontPage.jsx
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

/** Progress bar */
function ProgressBar({ value }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
      <div
        className="h-full bg-green-400 transition-all duration-500"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

/** Compact stat card for Overview panel */
function StatCard({ label, value, sub }) {
  return (
    <div className="bg-gray-800/60 p-3 rounded-lg border border-white/5 flex flex-col items-center justify-center text-center">
      <p className="text-gray-400 text-[11px] mb-1">{label}</p>
      <p className="text-lg font-semibold text-white">{value}</p>
      {sub && <p className="text-green-400 text-[10px] mt-1">{sub}</p>}
    </div>
  );
}

export default function FrontPage() {
  const [user, setUser] = useState({ name: "User" });
  const navigate = useNavigate();

  useEffect(() => {
    const email = localStorage.getItem("userEmail");
    const name = email?.split("@")[0] || "User";
    setUser({ name });
  }, []);

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 text-white overflow-hidden flex flex-col">
      {/* Subtle background glow */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-green-500/20 blur-3xl animate-pulse" />
        <div className="absolute top-1/3 -right-40 w-[36rem] h-[36rem] rounded-full bg-emerald-400/10 blur-3xl animate-pulse-slow" />
        <div className="absolute -bottom-28 left-1/3 w-[28rem] h-[28rem] rounded-full bg-cyan-400/10 blur-3xl" />
      </div>

      <div className="relative z-10 flex-1 flex flex-col">
        <Navbar />

        {/* HERO SECTION */}
        <section className="flex-1 flex items-center justify-center px-6 md:px-10 lg:px-16 xl:px-24 py-20">
          <div className="w-full max-w-7xl grid lg:grid-cols-2 gap-16 items-center">
            {/* LEFT SIDE */}
            <div className="flex flex-col justify-center">
              <p className="text-xs uppercase tracking-wider text-gray-400">
                Let us give you some great news —
              </p>

              <h1 className="mt-3 text-5xl md:text-6xl font-extrabold leading-tight">
                Your personal <br />
                finance made <br />
                <span className="text-green-400">easier</span>
              </h1>

              <p className="mt-5 text-gray-300 max-w-xl leading-relaxed">
                Millions of smart people trust{" "}
                <span className="font-semibold text-white">CrediWise</span> to
                manage their credit, savings, and spending in one place.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <button
                  onClick={() => navigate("/login")}
                  className="px-6 py-3 rounded-lg bg-green-500 text-black font-semibold hover:bg-green-400 transition"
                >
                  Get started
                </button>

                <Link
                  to="/signup"
                  className="px-6 py-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition"
                >
                  Learn more →
                </Link>
              </div>

              {/* Transactions stat */}
              <div className="mt-10 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/5 grid place-items-center text-lg">
                  💳
                </div>
                <div>
                  <p className="text-sm text-gray-400">Transactions processed</p>
                  <p className="text-xl font-bold">96,566,304+</p>
                </div>
              </div>
            </div>

            {/* RIGHT SIDE - Card + Overview */}
            <div className="relative flex justify-center lg:justify-end">
              {/* Card Mock */}
              <div className="relative z-0 w-72 h-[520px] rounded-[2.5rem] bg-black/80 border border-white/10 shadow-2xl shadow-green-500/10 overflow-hidden">
                <div className="h-6 bg-black/60 border-b border-white/10" />
                <div className="p-4 space-y-3">
                  <div className="text-sm text-gray-300">Cards</div>

                  <div className="rounded-xl bg-emerald-700/80 h-40 p-4 grid">
                    <div className="text-xs text-white/80">CrediWise VISA</div>
                    <div className="text-lg font-mono tracking-widest mt-2">
                      •••• •••• •••• 8576
                    </div>
                    <div className="text-xs text-white/70 mt-auto">09/28</div>
                  </div>

                  <button className="w-full py-2 rounded-lg bg-white/5 border border-white/10 text-sm">
                    Create new card
                  </button>

                  <div className="rounded-xl bg-white/5 p-3 border border-white/10">
                    <div className="text-xs text-gray-400 mb-2">
                      Spend analysis
                    </div>
                    <ProgressBar value={65} />
                    <div className="flex justify-between text-xs mt-2 text-gray-400">
                      <span>Weekly</span>
                      <span>$3,000</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Overview Panel */}
              <div className="hidden lg:block absolute -top-16 -right-56 w-[400px] rounded-2xl bg-gray-900/90 border border-white/10 p-6 backdrop-blur-lg z-10 shadow-xl shadow-black/40">
                <h3 className="font-semibold mb-4 text-lg">Overview</h3>

                <div className="grid grid-cols-4 gap-3 mb-6">
                  <StatCard
                    label="Total Balance"
                    value="$580,000"
                    sub="+3.28% vs last month"
                  />
                  <StatCard label="Income" value="$20,000" />
                  <StatCard label="Outcome" value="$8,000" />
                  <StatCard label="Savings" value="$12,000" />
                </div>

                <div className="mb-6">
                  <p className="text-sm text-gray-400 mb-2">Spend analysis</p>
                  <ProgressBar value={72} />
                  <div className="flex justify-between text-xs mt-2 text-gray-400">
                    <span>Sun</span>
                    <span>Fri</span>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-400 mb-2">
                    Transactions history
                  </p>
                  <div className="space-y-2 text-sm">
                    {[
                      { name: "YouTube", status: "Completed", date: "Mon, 25 Apr" },
                      { name: "Spotify", status: "Pending", date: "Sun, 24 Apr" },
                      { name: "Figma", status: "Canceled", date: "Fri, 22 Apr" },
                    ].map((t) => (
                      <div
                        key={t.name}
                        className="flex items-center justify-between rounded-lg bg-white/5 border border-white/10 px-3 py-2"
                      >
                        <span>{t.name}</span>
                        <span className="text-gray-400">{t.status}</span>
                        <span className="text-gray-500">{t.date}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
