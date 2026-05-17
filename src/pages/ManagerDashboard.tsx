import { useEffect, useState } from "react";
import styles from "../style/managerDashboard.module.css";

// IMPORT PAGE COMPONENTS
import Sales from "../component/managerdashboard/Sales";
import Tanks from "../component/managerdashboard/Tanks";
import Staff from "../component/managerdashboard/Staff";

// API BASE URL
const BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5001/api"
    : "https://amarneerfuelstationbackend.onrender.com/api";

export default function ManagerDashboard() {
  const username = localStorage.getItem("username") || "Manager";
  const [activeTab, setActiveTab] = useState("overview");

  // ========= DASHBOARD METRICS STATE =========
  const [summary, setSummary] = useState({
    totalSales: 0,
    litresSold: 0,
    activePumps: 0,
    staffPresent: 0,
    totalStaff: 0,
    recentSales: [] as { time: string; pump: string; amount: number }[],
  });

  // ========= FETCH SUMMARY DATA =========
  const fetchSummary = async () => {
    try {
      const res = await fetch(`${BASE_URL}/dashboard`);
      const data = await res.json();

      // Adjust based on your dashboard API structure
      setSummary({
        totalSales: data.totalSales ?? 0,
        litresSold: data.totalLitres ?? 0,
        activePumps: data.stockLevels?.length ?? 0,
        staffPresent: data.presentToday ?? 0,
        totalStaff: data.totalStaff ?? 0,
        recentSales: data.recentSales ?? [],
      });
    } catch (err) {
      console.error("Failed to load dashboard summary:", err);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  // ========= RENDER ACTIVE COMPONENT =========
  const renderContent = () => {
    switch (activeTab) {
      case "sales":
        return <Sales />;
      case "tanks":
        return <Tanks />;
      case "staff":
        return <Staff />;
      default:
        return (
          <>
            {/* METRICS GRID */}
            <section className={styles.metrics}>
              <div className={styles.metricCard}>
                <h4>Today's Sales</h4>
                <div className={styles.metricValue}>₹{summary.totalSales.toLocaleString()}</div>
              </div>

              <div className={styles.metricCard}>
                <h4>Litres Sold</h4>
                <div className={styles.metricValue}>{summary.litresSold} L</div>
              </div>

              <div className={styles.metricCard}>
                <h4>Active Pumps</h4>
                <div className={styles.metricValue}>{summary.activePumps}</div>
              </div>

              <div className={styles.metricCard}>
                <h4>Staff Present</h4>
                <div className={styles.metricValue}>
                  {summary.staffPresent}/{summary.totalStaff}
                </div>
              </div>
            </section>

            {/* RECENT SALES LIST */}
            <section className={styles.panel}>
              <h3>Recent Sales</h3>
              <ul className={styles.list}>
                {summary.recentSales.length === 0 ? (
                  <li>No recent sales</li>
                ) : (
                  summary.recentSales.map((s, i) => (
                    <li key={i}>
                      {s.time} – Pump {s.pump} – ₹{s.amount}
                    </li>
                  ))
                )}
              </ul>
            </section>
          </>
        );
    }
  };

  return (
    <div className={styles.page}>
      {/* SIDEBAR */}
      <aside className={styles.sidebar}>
        <div className={styles.brand}>Manager Dashboard</div>

        <nav>
          <button
            className={`${styles.link} ${activeTab === "overview" ? styles.active : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            Overview
          </button>

          <button
            className={`${styles.link} ${activeTab === "sales" ? styles.active : ""}`}
            onClick={() => setActiveTab("sales")}
          >
            Sales
          </button>

          <button
            className={`${styles.link} ${activeTab === "tanks" ? styles.active : ""}`}
            onClick={() => setActiveTab("tanks")}
          >
            Tanks
          </button>

          <button
            className={`${styles.link} ${activeTab === "staff" ? styles.active : ""}`}
            onClick={() => setActiveTab("staff")}
          >
            Staff
          </button>

          {/* Logout */}
          <button
            className={styles.logout}
            onClick={() => {
              localStorage.clear();
              window.location.href = "/sign";
            }}
          >
            Logout
          </button>
        </nav>
      </aside>

      {/* MAIN SECTION */}
      <div className={styles.main}>
        <header className={styles.header}>
          <div>
            <h2>Manager Dashboard</h2>
            <p className={styles.subtitle}>Sales & Operational Overview</p>
          </div>

          <div className={styles.user}>{username}</div>
        </header>

        <main className={styles.content}>{renderContent()}</main>
      </div>

  </div>
);
}
