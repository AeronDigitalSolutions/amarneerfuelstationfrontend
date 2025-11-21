// PaymentComparison.tsx
import { useEffect, useState } from "react";
import axios from "axios";

const BASE_URL =
  import.meta.env.VITE_API_URL ||
  (window.location.hostname === "localhost"
    ? "http://localhost:5000/api"
    : "https://your-backend-url/api");

interface PaymentType {
  _id: string;
  amount: number;
  mode: "UPI" | "CARD";
  createdAt: string;
}

interface SalePayment {
  _id?: string;
  date: string;
  shift: string;
  upiAmount?: number;
  cardAmount?: number;
  createdAt?: string;
}

export default function PaymentComparison() {
  const [payments, setPayments] = useState<PaymentType[]>([]);
  const [sales, setSales] = useState<SalePayment[]>([]);
  const [shiftList, setShiftList] = useState<
    { _id: string; shiftName: string }[]
  >([]);

  const [selectedShift, setSelectedShift] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  // Final Totals
  const [liveUPI, setLiveUPI] = useState(0);
  const [liveCard, setLiveCard] = useState(0);
  const [saleUPI, setSaleUPI] = useState(0);
  const [saleCard, setSaleCard] = useState(0);

  // Fetch Live Payment
  const fetchPayments = async () => {
    const res = await axios.get(`${BASE_URL}/payments`);
    setPayments(res.data);
  };

  // Fetch Sale Entry Payments
  const fetchSales = async () => {
    const res = await axios.get(`${BASE_URL}/sales`);
    setSales(res.data);
  };

  // Fetch Shift List
  const fetchShifts = async () => {
    const res = await axios.get(`${BASE_URL}/shifts`);
    setShiftList(res.data);
  };

  useEffect(() => {
    fetchPayments();
    fetchSales();
    fetchShifts();
  }, []);

  // FILTERING
  const filteredSales = sales.filter((s) => {
    const saleDate = s.date.split("T")[0];
    return (
      saleDate === selectedDate &&
      (selectedShift ? s.shift === selectedShift : true)
    );
  });

  // CALCULATE TOTALS
  useEffect(() => {
    // Live UPI + Card
    const liveU = payments
      .filter((p) => p.mode === "UPI")
      .reduce((sum, p) => sum + p.amount, 0);

    const liveC = payments
      .filter((p) => p.mode === "CARD")
      .reduce((sum, p) => sum + p.amount, 0);

    setLiveUPI(liveU);
    setLiveCard(liveC);

    // Sale Entry UPI + Card (filtered)
    const saleU = filteredSales.reduce(
      (sum, s) => sum + (s.upiAmount || 0),
      0
    );
    const saleC = filteredSales.reduce(
      (sum, s) => sum + (s.cardAmount || 0),
      0
    );

    setSaleUPI(saleU);
    setSaleCard(saleC);
  }, [payments, filteredSales]);

  const diffUPI = liveUPI - saleUPI;
  const diffCard = liveCard - saleCard;

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>💳 Payment Comparison</h1>

      {/* FILTERS */}
      <div style={styles.filterBox}>
        <div>
          <label style={styles.label}>Select Date</label>
          <input
            type="date"
            style={styles.input}
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>

        <div>
          <label style={styles.label}>Select Shift</label>
          <select
            style={styles.input}
            value={selectedShift}
            onChange={(e) => setSelectedShift(e.target.value)}
          >
            <option value="">All Shifts</option>
            {shiftList.map((s) => (
              <option key={s._id} value={s.shiftName}>
                {s.shiftName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* MAIN COMPARISON */}
      <div style={styles.compareBox}>
        <h2>Comparison Summary</h2>

        <table style={styles.summaryTable}>
          <thead>
            <tr>
              <th style={styles.th}>Mode</th>
              <th style={styles.th}>Live Payment</th>
              <th style={styles.th}>Sale Entry Payment</th>
              <th style={styles.th}>Difference</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td style={styles.td}>UPI</td>
              <td style={styles.td}>₹{liveUPI}</td>
              <td style={styles.td}>₹{saleUPI}</td>
              <td
                style={{
                  ...styles.td,
                  color: diffUPI === 0 ? "green" : "red",
                }}
              >
                {diffUPI === 0
                  ? "MATCH ✔"
                  : `₹${diffUPI.toFixed(2)} (Mismatch)`}
              </td>
            </tr>

            <tr>
              <td style={styles.td}>CARD</td>
              <td style={styles.td}>₹{liveCard}</td>
              <td style={styles.td}>₹{saleCard}</td>
              <td
                style={{
                  ...styles.td,
                  color: diffCard === 0 ? "green" : "red",
                }}
              >
                {diffCard === 0
                  ? "MATCH ✔"
                  : `₹${diffCard.toFixed(2)} (Mismatch)`}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* SALES TABLE */}
      <h2 style={{ marginTop: "25px" }}>Filtered Sale Entry Payments</h2>

      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Date</th>
            <th style={styles.th}>Shift</th>
            <th style={styles.th}>UPI ₹</th>
            <th style={styles.th}>Card ₹</th>
            <th style={styles.th}>Created At</th>
          </tr>
        </thead>

        <tbody>
          {filteredSales.map((s) => (
            <tr key={s._id}>
              <td style={styles.td}>{s.date.split("T")[0]}</td>
              <td style={styles.td}>{s.shift}</td>
              <td style={styles.td}>{s.upiAmount || 0}</td>
              <td style={styles.td}>{s.cardAmount || 0}</td>
              <td style={styles.td}>
                {s.createdAt
                  ? new Date(s.createdAt).toLocaleString()
                  : "-"}
              </td>
            </tr>
          ))}

          {filteredSales.length === 0 && (
            <tr>
              <td style={styles.td} colSpan={5}>
                No records found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: "900px",
    margin: "20px auto",
    padding: "20px",
    background: "#f5f7fa",
    borderRadius: "10px",
    boxShadow: "0 0 10px rgba(0,0,0,0.1)",
  },
  title: {
    textAlign: "center",
    marginBottom: "20px",
    fontSize: "26px",
  },
  filterBox: {
    display: "flex",
    gap: "20px",
    marginBottom: "25px",
  },
  label: {
    fontWeight: "bold",
  },
  input: {
    padding: "10px",
    width: "200px",
    borderRadius: "6px",
    border: "1px solid #aaa",
    marginTop: "6px",
  },
  compareBox: {
    background: "#fff",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
  },
  summaryTable: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "10px",
  },
  table: {
    width: "100%",
    background: "white",
    borderCollapse: "collapse",
    borderRadius: "10px",
    overflow: "hidden",
    boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
  },
  th: {
    background: "#1976d2",
    color: "white",
    padding: "12px",
    textAlign: "left",
    fontSize: "15px",
  },
  td: {
    padding: "12px",
    borderBottom: "1px solid #ddd",
    fontSize: "14px",
  },
};
