import { useEffect, useState } from "react";
import styles from "../../style/managerdashboard/tanks.module.css";
import { FaWarehouse, FaExclamationTriangle } from "react-icons/fa";

type Tank = {
  _id?: string;
  tankId: string;
  productType: string;
  capacity: number;
  closingStock?: number;
  lowStockAlertLevel?: number;
  createdAt?: string;
  totalAmount?: number;
};

type TankMaster = {
  _id: string;
  tankId: string;
  fuelType: string;
  capacity: number;
};

const BASE_URL =
  import.meta.env.VITE_API_URL ||
  (window.location.hostname.includes("localhost") ? "http://localhost:5000/api" : "https://amarneerfuelstationbackend.onrender.com/api");

export default function Tanks() {
  const [tanks, setTanks] = useState<Tank[]>([]);
  const [masters, setMasters] = useState<TankMaster[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    void loadAll();
  }, []);

  const loadAll = async () => {
    try {
      setLoading(true);
      const [r1, r2] = await Promise.all([
        fetch(`${BASE_URL}/tank-master`).then((r) => r.ok ? r.json() : []),
        fetch(`${BASE_URL}/tanks`).then((r) => r.ok ? r.json() : []),
      ]);
      setMasters(Array.isArray(r1) ? r1 : []);
      setTanks(Array.isArray(r2) ? r2 : []);
    } catch (err) {
      console.error(err);
      setError("Unable to load tanks");
    } finally {
      setLoading(false);
    }
  };

  const totalTanks = tanks.length;
  const totalCapacity = masters.reduce((acc, m) => acc + (Number(m.capacity || 0)), 0);
  const totalClosing = tanks.reduce((acc, t) => acc + (Number(t.closingStock || 0)), 0);

  const lowStock = tanks.filter((t) => {
    if (t.lowStockAlertLevel == null) return false;
    return Number(t.closingStock || 0) <= Number(t.lowStockAlertLevel || 0);
  });

  const recent = [...tanks].sort((a, b) => (new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())).slice(0, 6);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Tank Summary</h2>
        <p className={styles.sub}>Stock snapshot & low-level alerts</p>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.grid}>
        <div className={styles.card}>
          <div className={styles.cardHead}>
            <FaWarehouse className={styles.icon} />
            <div>
              <div className={styles.cardTitle}>Tanks</div>
              <div className={styles.cardValue}>{totalTanks}</div>
            </div>
          </div>
          <div className={styles.cardFoot}>Capacity: {totalCapacity} L</div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHead}>
            <div className={styles.iconBadge}>📦</div>
            <div>
              <div className={styles.cardTitle}>Closing Stock</div>
              <div className={styles.cardValue}>{totalClosing} L</div>
            </div>
          </div>
          <div className={styles.cardFoot}>Across all tanks</div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHead}>
            <FaExclamationTriangle className={styles.warnIcon} />
            <div>
              <div className={styles.cardTitle}>Low Stock Alerts</div>
              <div className={styles.cardValue}>{lowStock.length}</div>
            </div>
          </div>
          <div className={styles.cardFoot}>Check tanks below threshold</div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHead}>
            <div className={styles.iconBadge}>🔎</div>
            <div>
              <div className={styles.cardTitle}>Unique Fuel Types</div>
              <div className={styles.cardValue}>{Array.from(new Set(masters.map(m => m.fuelType))).length}</div>
            </div>
          </div>
          <div className={styles.cardFoot}>From tank master list</div>
        </div>
      </div>

      <section className={styles.recent}>
        <h3>Low stock tanks</h3>
        {loading ? (
          <p className={styles.loading}>Loading…</p>
        ) : lowStock.length === 0 ? (
          <p className={styles.empty}>All tanks healthy</p>
        ) : (
          <ul className={styles.list}>
            {lowStock.map((t) => (
              <li key={t._id} className={styles.listItem}>
                <div>
                  <div className={styles.tankTitle}><strong>{t.tankId}</strong> · {t.productType}</div>
                  <div className={styles.tankMeta}>Closing: {t.closingStock} L · Alert: {t.lowStockAlertLevel} L</div>
                </div>
                <div>₹{Number(t.totalAmount || 0).toFixed(2)}</div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className={styles.recent}>
        <h3>Recent Tank Entries</h3>
        {recent.length === 0 ? <p className={styles.empty}>No records</p> : (
          <ul className={styles.list}>
            {recent.map((t) => (
              <li key={t._id} className={styles.listItem}>
                <div>
                  <div className={styles.tankTitle}>{t.tankId} · {t.productType}</div>
                  <div className={styles.tankMeta}>{t.createdAt ? new Date(t.createdAt).toLocaleString("en-IN") : "-"}</div>
                </div>
                <div>{t.closingStock} L</div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
