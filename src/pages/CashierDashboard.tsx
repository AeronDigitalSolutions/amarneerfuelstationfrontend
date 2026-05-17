import { useEffect, useState } from "react";
import styles from "../style/cashierDashboard.module.css";

// Component pages
import Sales from "../component/cashierdashboard/Sales";
import Receipts from "../component/cashierdashboard/Receipts";

// Backend API
const BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5001/api"
    : "https://amarneerfuelstationbackend.onrender.com/api";

export default function CashierDashboard() {
  const username = localStorage.getItem("username") || "Cashier";

  const [activeTab, setActiveTab] = useState("overview");

  const [summary, setSummary] = useState({
    todaySales: 0,
    todayReceipts: 0,
    totalTransactions: 0,
    recentSales: [] as { time: string; pump: string; amount: number }[],
  });

  const fetchSummary = async () => {
    try {
      const res = await fetch(`${BASE_URL}/dashboard`);
      const data = await res.json();

      setSummary({
        todaySales: data.totalSales ?? 0,
        todayReceipts: data.receiptsToday ?? 0,
        totalTransactions: data.totalTransactions ?? 0,
        recentSales: data.recentSales ?? [],
      });
    } catch (err) {
      console.log("Failed to load cashier metrics:", err);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const renderPage = () => {
    switch (activeTab) {
      case "sales":
        return <Sales />;
      case "receipts":
        return <Receipts />;
      default:
        return (
          <>
            {/* METRIC BOXES */}
            <section className={styles.metrics}>
              <div className={styles.metricCard}>
                <h4>Today's Sales</h4>
                <p className={styles.metricValue}>₹{summary.todaySales.toLocaleString()}</p>
              </div>

              <div className={styles.metricCard}>
                <h4>Receipts Issued</h4>
                <p className={styles.metricValue}>{summary.todayReceipts}</p>
              </div>

              <div className={styles.metricCard}>
                <h4>Total Transactions</h4>
                <p className={styles.metricValue}>{summary.totalTransactions}</p>
              </div>
            </section>

            {/* RECENT SALES */}
            <section className={styles.panel}>
              <h3>Recent Sales</h3>
              <ul className={styles.list}>
                {summary.recentSales.length === 0 ? (
                  <li>No sales yet</li>
                ) : (
                  summary.recentSales.map((s, i) => (
                    <li key={i}>
                      {s.time} — Pump {s.pump} — ₹{s.amount}
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
        <div className={styles.brand}>Cashier Dashboard</div>

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
            className={`${styles.link} ${activeTab === "receipts" ? styles.active : ""}`}
            onClick={() => setActiveTab("receipts")}
          >
            Receipts
          </button>

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

      {/* MAIN */}
      <div className={styles.main}>
        <header className={styles.header}>
          <div>
            <h2>Cashier Dashboard</h2>
            <p className={styles.subtitle}>Transactions & Daily Receipts</p>
          </div>
          <div className={styles.user}>{username}</div>
        </header>

        <main className={styles.content}>{renderPage()}</main>
      </div>
    </div>
  );
}
