import { useEffect, useState } from "react";
import api from "../utils/api";
import styles from "../style/dashboard.module.css";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type DashboardData = {
  totalSales: number;
  totalLitres: number;
  cashPayments: number;
  bankPayments: number;
  stockLevels: { fuelType: string; currentLevel: number; capacity: number }[];
  totalStaff: number;
  presentToday: number;
  totalOutstanding: number;
};

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("🌐 Using API Base URL:", api.defaults.baseURL || "Not set");
    fetchData();
    const interval = setInterval(fetchData, 10000); // Auto-refresh every 10s
    return () => clearInterval(interval);
  }, []);

  /** 🔹 Fetch Dashboard Data */
  const fetchData = async () => {
    try {
      const res = await api.get("/dashboard");
      setData(res.data);
      setLoading(false);
    } catch (err) {
      console.error("❌ Failed to load dashboard data:", err);
      setLoading(false);
    }
  };

  if (loading) return <p className={styles.loading}>Loading Dashboard...</p>;
  if (!data)
    return <p className={styles.loading}>No dashboard data available.</p>;

  return (
    <div className={styles.container}>
      <h1>📊 Petrol Pump Dashboard</h1>

      {/* 🧮 Stats Grid */}
      <div className={styles.grid}>
        <div className={styles.card}>
          <h3>💰 Total Sales</h3>
          <p>₹{data.totalSales.toLocaleString()}</p>
        </div>
        <div className={styles.card}>
          <h3>⛽ Litres Sold</h3>
          <p>{data.totalLitres.toLocaleString()} L</p>
        </div>
        <div className={styles.card}>
          <h3>💵 Cash Payments</h3>
          <p>₹{data.cashPayments.toLocaleString()}</p>
        </div>
        <div className={styles.card}>
          <h3>🏦 Bank Payments</h3>
          <p>₹{data.bankPayments.toLocaleString()}</p>
        </div>
        <div className={styles.card}>
          <h3>👷 Staff Attendance</h3>
          <p>
            {data.presentToday} / {data.totalStaff} Present
          </p>
        </div>
        <div className={styles.card}>
          <h3>💳 Total Outstanding</h3>
          <p>₹{data.totalOutstanding.toLocaleString()}</p>
        </div>
      </div>

      {/* 📊 Fuel Stock Chart */}
      <div className={styles.chartSection}>
        <h2>🛢️ Fuel Stock Levels</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.stockLevels}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="fuelType" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="currentLevel" fill="#2563eb" name="Current Level (L)" />
            <Bar dataKey="capacity" fill="#93c5fd" name="Tank Capacity (L)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
