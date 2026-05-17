import { useEffect, useState } from "react";
import styles from "../../style/cashierdashboard/sales.module.css";

const BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5001/api"
    : "https://amarneerfuelstationbackend.onrender.com/api";

export default function Sales() {
  const [sales, setSales] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${BASE_URL}/sales`)
      .then((r) => r.json())
      .then((d) => setSales(d))
      .catch(console.error);
  }, []);

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Sales History</h3>

      <ul className={styles.list}>
        {sales.map((s) => (
          <li key={s._id} className={styles.item}>
            <span className={styles.label}>
              {s.time} — Pump {s.pumpNumber}
            </span>
            <span className={styles.amount}>₹{s.totalAmount}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
