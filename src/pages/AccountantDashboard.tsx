import { useEffect, useState } from "react";
import styles from "../style/accountantDashboard.module.css";

import Accounts from "../component/accountantdashboard/Accounts";
import Expenses from "../component/accountantdashboard/Expenses";
import SalaryRecords from "../component/accountantdashboard/SalaryRecords";

const BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5000/api"
    : "https://amarneerfuelstationbackend.onrender.com/api";

export default function AccountantDashboard() {
  const user = localStorage.getItem("username") || "accountant";

  const [active, setActive] = useState("accounts");
  const [summary, setSummary] = useState<any>(null);

  // 🔥 FETCH SUMMARY FROM ACCOUNTINGFINANCE API
  const fetchSummary = async () => {
    try {
      const res = await fetch(`${BASE_URL}/finance/summary`);
      const data = await res.json();
      setSummary(data);
    } catch (err) {
      console.error("Summary fetch failed:", err);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  return (
    <div className={styles.page}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.brand}>Accountant</div>

        <nav>
          <button
            className={`${styles.link} ${active === "accounts" ? styles.active : ""}`}
            onClick={() => setActive("accounts")}
          >
            📘 Accounts Summary
          </button>

          <button
            className={`${styles.link} ${active === "expenses" ? styles.active : ""}`}
            onClick={() => setActive("expenses")}
          >
            💸 Expenses
          </button>

          <button
            className={`${styles.link} ${active === "salary" ? styles.active : ""}`}
            onClick={() => setActive("salary")}
          >
            🧾 Salary Records
          </button>
        </nav>
      </aside>

      {/* Main Section */}
      <main className={styles.main}>
        <header className={styles.header}>
          <div>
            <h2>Accountant Dashboard</h2>
            <p className={styles.subtitle}>Financial & payroll analytics</p>
          </div>
          <div className={styles.user}>{user}</div>
        </header>

        {/* 🔥 Summary Cards */}
        {summary && (
          <div className={styles.summaryGrid}>
            <div className={styles.summaryCard}>
              <h4>Total Purchase</h4>
              <p>₹{summary.totalPurchase.toFixed(2)}</p>
            </div>
            <div className={styles.summaryCard}>
              <h4>Total Expense</h4>
              <p>₹{summary.totalExpense.toFixed(2)}</p>
            </div>
            <div className={styles.summaryCard}>
              <h4>Profit</h4>
              <p>₹{summary.profit.toFixed(2)}</p>
            </div>
            <div className={styles.summaryCard}>
              <h4>Cashbook Balance</h4>
              <p>₹{summary.cashbookBalance.toFixed(2)}</p>
            </div>
          </div>
        )}

        {/* Module Switching */}
        <div className={styles.content}>
          {active === "accounts" && <Accounts />}
          {active === "expenses" && <Expenses />}
          {active === "salary" && <SalaryRecords />}
        </div>
      </main>
    </div>
  );
}
