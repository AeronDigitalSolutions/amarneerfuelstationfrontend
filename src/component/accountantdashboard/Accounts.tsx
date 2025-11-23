import { useEffect, useState } from "react";
import styles from "../../style/accountantdashboard/accounts.module.css";

const BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5000/api"
    : "https://amarneerfuelstationbackend.onrender.com/api";

export default function Accounts() {
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    fetch(`${BASE_URL}/finance`)
      .then((r) => r.json())
      .then((d) => setSummary(d))
      .catch(console.error);
  }, []);

  if (!summary) return <p>Loading...</p>;

  return (
    <div className={styles.card}>
      <h3>Financial Summary</h3>

      <div className={styles.grid}>
        <div className={styles.box}>
          <h4>Total Income</h4>
          <p className={styles.value}>₹{summary.totalIncome}</p>
        </div>

        <div className={styles.box}>
          <h4>Total Expense</h4>
          <p className={styles.value}>₹{summary.totalExpense}</p>
        </div>

        <div className={styles.box}>
          <h4>Net Profit</h4>
          <p className={styles.value}>₹{summary.netProfit}</p>
        </div>
      </div>
    </div>
  );
}
