import { useEffect, useState } from "react";
import styles from "../../style/accountantdashboard/expenses.module.css";

const BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5001/api"
    : "https://amarneerfuelstationbackend.onrender.com/api";

export default function Expenses() {
  const [expenses, setExpenses] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${BASE_URL}/finance/expenses`)
      .then((r) => r.json())
      .then((d) => setExpenses(d))
      .catch(console.error);
  }, []);

  return (
    <div className={styles.card}>
      <h3>Expense Records</h3>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Date</th>
            <th>Category</th>
            <th>Details</th>
            <th>Amount</th>
          </tr>
        </thead>

        <tbody>
          {expenses.map((e) => (
            <tr key={e._id}>
              <td>{e.date}</td>
              <td>{e.category}</td>
              <td>{e.description}</td>
              <td className={styles.amount}>₹{e.amount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
