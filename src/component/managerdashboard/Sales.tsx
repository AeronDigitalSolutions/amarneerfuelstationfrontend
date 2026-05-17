import { useEffect, useState } from "react";
import styles from "../../style/managerdashboard/sales.module.css";
import { FaGasPump, FaMoneyBillWave, FaCashRegister } from "react-icons/fa";

type Sale = {
  _id?: string;
  saleId?: string;
  createdAt?: string;
  date?: string;
  litresSold?: number;
  totalAmount?: number;
  cashAmount?: number;
  upiAmount?: number;
  cardAmount?: number;
  productType?: string;
  pumpNumber?: string;
  attendant?: string;
};

const BASE_URL =
  import.meta.env.VITE_API_URL ||
  (window.location.hostname.includes("localhost") ? "http://localhost:5001/api" : "https://amarneerfuelstationbackend.onrender.com/api");

export default function Sales() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    void fetchSales();
  }, []);

  const fetchSales = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/sales`);
      if (!res.ok) throw new Error("Failed to fetch sales");
      const data = await res.json();
      setSales(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error(err);
      setError("Unable to load sales");
    } finally {
      setLoading(false);
    }
  };

  // Helpers
  const todayIso = new Date().toISOString().split("T")[0];

  const totalCount = sales.length;
  const totalLitres = sales.reduce((acc, s) => acc + (Number(s.litresSold || 0)), 0);
  const totalAmount = sales.reduce((acc, s) => acc + (Number(s.totalAmount || 0)), 0);

  const todaysSales = sales.filter((s) => {
    const d = (s.createdAt || s.date || "").split("T")[0];
    return d === todayIso;
  });

  const todaysLitres = todaysSales.reduce((acc, s) => acc + (Number(s.litresSold || 0)), 0);
  const todaysAmount = todaysSales.reduce((acc, s) => acc + (Number(s.totalAmount || 0)), 0);
  const todaysCash = todaysSales.reduce((acc, s) => acc + (Number(s.cashAmount || 0)), 0);
  const todaysUpi = todaysSales.reduce((acc, s) => acc + (Number(s.upiAmount || 0)), 0);
  const todaysCard = todaysSales.reduce((acc, s) => acc + (Number(s.cardAmount || 0)), 0);

  const recent = [...sales].sort((a, b) => (new Date(b.createdAt || b.date || 0).getTime() - new Date(a.createdAt || a.date || 0).getTime())).slice(0, 6);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Sales Summary</h2>
        <p className={styles.sub}>Quick snapshot — totals & today's activity</p>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.grid}>
        <div className={styles.card}>
          <div className={styles.cardHead}>
            <FaGasPump className={styles.icon} />
            <div>
              <div className={styles.cardTitle}>Total Sales</div>
              <div className={styles.cardValue}>{totalCount}</div>
            </div>
          </div>
          <div className={styles.cardFoot}>All time</div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHead}>
            <FaMoneyBillWave className={styles.icon} />
            <div>
              <div className={styles.cardTitle}>Today's Amount</div>
              <div className={styles.cardValue}>₹{todaysAmount.toFixed(2)}</div>
            </div>
          </div>
          <div className={styles.cardFoot}>Received: ₹{(todaysCash + todaysUpi + todaysCard).toFixed(2)}</div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHead}>
            <FaCashRegister className={styles.icon} />
            <div>
              <div className={styles.cardTitle}>Today's Litres</div>
              <div className={styles.cardValue}>{todaysLitres.toFixed(2)} L</div>
            </div>
          </div>
          <div className={styles.cardFoot}>Total Litres: {totalLitres.toFixed(2)} L</div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHead}>
            <div className={styles.iconBadge}>💳</div>
            <div>
              <div className={styles.cardTitle}>Payment Split (today)</div>
              <div className={styles.cardValueSmall}>
                Cash ₹{todaysCash.toFixed(2)} · UPI ₹{todaysUpi.toFixed(2)} · Card ₹{todaysCard.toFixed(2)}
              </div>
            </div>
          </div>
          <div className={styles.cardFoot}>Grand total: ₹{totalAmount.toFixed(2)}</div>
        </div>
      </div>

      <section className={styles.recent}>
        <h3>Recent Sales</h3>
        {loading ? (
          <p className={styles.loading}>Loading…</p>
        ) : recent.length === 0 ? (
          <p className={styles.empty}>No sales yet.</p>
        ) : (
          <ul className={styles.list}>
            {recent.map((s) => (
              <li key={s._id} className={styles.listItem}>
                <div>
                  <div className={styles.saleTitle}>
                    <strong>{s.saleId || "-"}</strong> · {s.productType} · {s.pumpNumber || "-"}
                  </div>
                  <div className={styles.saleMeta}>
                    {new Date(s.createdAt || s.date || "").toLocaleString("en-IN")} · {s.attendant || "-"}
                  </div>
                </div>
                <div className={styles.saleRight}>
                  <div className={styles.saleAmt}>₹{(s.totalAmount || 0).toFixed(2)}</div>
                  <div className={styles.saleLit}>{(s.litresSold || 0).toFixed(2)} L</div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
