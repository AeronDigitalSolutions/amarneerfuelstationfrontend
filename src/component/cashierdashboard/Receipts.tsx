import { useEffect, useState } from "react";
import styles from "../../style/cashierdashboard/receipts.module.css";

const BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5001/api"
    : "https://amarneerfuelstationbackend.onrender.com/api";

export default function Receipts() {
  const [receipts, setReceipts] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${BASE_URL}/payments`)
      .then((r) => r.json())
      .then((d) => setReceipts(d))
      .catch(console.error);
  }, []);

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Receipts Issued</h3>

      <ul className={styles.list}>
        {receipts.map((r) => (
          <li key={r._id} className={styles.item}>
            <span className={styles.method}>
              {r.date} — {r.paymentMode}
            </span>

            <span className={styles.amount}>₹{r.amount}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
