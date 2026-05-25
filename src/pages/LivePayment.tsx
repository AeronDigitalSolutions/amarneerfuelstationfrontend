import { useEffect, useState, type MouseEvent } from "react";
import axios from "axios";

const BASE_URL =
  import.meta.env.VITE_API_URL ||
  (window.location.hostname === "localhost"
    ? "http://localhost:5001/api"
    : "https://amarneerfuelstationbackend.onrender.com/api");

interface PaymentType {
  _id: string;
  amount: number;
  mode: string;
  createdAt: string;
}

export default function LivePayment() {
  const [payments, setPayments] = useState<PaymentType[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [mode, setMode] = useState<"UPI" | "CARD">("UPI");
  const [amount, setAmount] = useState("");

  const fetchPayments = async () => {
    const res = await axios.get(`${BASE_URL}/payments`);
    setPayments(res.data);
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const savePayment = async () => {
    if (!amount) return alert("Enter amount!");
    try {
      await axios.post(`${BASE_URL}/payments`, {
        amount: Number(amount),
        mode,
      });

      alert("Payment Saved!");
      setAmount("");
      setMode("UPI");
      setModalOpen(false);
      fetchPayments();
    } catch (err) {
      console.error(err);
      alert("Failed to save payment");
    }
  };

  const handleBackdropClick = (e: MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).id === "modalBackdrop") {
      setModalOpen(false);
    }
  };

  const totalAmount = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const upiCount = payments.filter((p) => p.mode === "UPI").length;
  const cardCount = payments.filter((p) => p.mode === "CARD").length;

  return (
    <div className="module-page">
      <section className="module-hero">
        <div>
          <p className="module-hero-tag">REALTIME PAYMENTS</p>
          <h2>Live Payment Monitor</h2>
          <p>Capture cashier-side UPI and card collections with timestamped records.</p>
        </div>
      </section>

      <section className="module-kpis">
        <article className="module-kpi">
          <span>Transactions</span>
          <strong>{payments.length}</strong>
        </article>
        <article className="module-kpi">
          <span>Total Amount</span>
          <strong style={{ fontSize: "22px" }}>₹{totalAmount.toFixed(2)}</strong>
        </article>
        <article className="module-kpi">
          <span>UPI / Card</span>
          <strong style={{ fontSize: "20px" }}>{upiCount} / {cardCount}</strong>
        </article>
      </section>
    <div
      style={{
        maxWidth: "100%",
        margin: "0",
        padding: "25px",
        background: "#ffffff",
        borderRadius: "16px",
        border: "1px solid #dbeafe",
        boxShadow: "0 12px 28px rgba(2,6,23,0.06)",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <h2
        style={{
          textAlign: "center",
          marginBottom: "20px",
          color: "#1e293b",
          fontSize: "1.8rem",
          fontWeight: 600,
        }}
      >
        💸 Live Payment
      </h2>

      <button
        onClick={() => setModalOpen(true)}
        style={{
          background: "#2563eb",
          color: "white",
          padding: "10px 16px",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          fontWeight: 500,
          marginBottom: "20px",
        }}
        onMouseOver={(e) => (e.currentTarget.style.background = "#1d4ed8")}
        onMouseOut={(e) => (e.currentTarget.style.background = "#2563eb")}
      >
        ➕ Add Payment
      </button>

      {/* TABLE */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          overflow: "hidden",
          borderRadius: "10px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        }}
      >
        <thead>
          <tr>
            <th
              style={{
                background: "#2563eb",
                padding: "12px",
                color: "white",
                fontWeight: 600,
                fontSize: "15px",
              }}
            >
              Amount
            </th>
            <th
              style={{
                background: "#2563eb",
                padding: "12px",
                color: "white",
                fontWeight: 600,
              }}
            >
              Mode
            </th>
            <th
              style={{
                background: "#2563eb",
                padding: "12px",
                color: "white",
                fontWeight: 600,
              }}
            >
              Timestamp
            </th>
          </tr>
        </thead>

        <tbody>
          {payments.map((p) => (
            <tr
              key={p._id}
              style={{
                cursor: "pointer",
                transition: "0.2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#f1f5ff")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "white")
              }
            >
              <td
                style={{
                  padding: "12px",
                  borderBottom: "1px solid #e2e8f0",
                  textAlign: "center",
                }}
              >
                ₹{p.amount}
              </td>
              <td
                style={{
                  padding: "12px",
                  borderBottom: "1px solid #c0cddfff",
                  textAlign: "center",
                }}
              >
                {p.mode}
              </td>
              <td
                style={{
                  padding: "12px",
                  borderBottom: "1px solid #e2e8f0",
                  textAlign: "center",
                }}
              >
                {new Date(p.createdAt).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* MODAL */}
      {modalOpen && (
        <div
          id="modalBackdrop"
          onClick={handleBackdropClick}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.55)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 200,
          }}
        >
          <div
            style={{
              width: "400px",
              background: "white",
              padding: "25px",
              borderRadius: "12px",
              position: "relative",
              animation: "popup 0.25s ease",
            }}
          >
            <h2
              style={{
                textAlign: "center",
                fontSize: "1.4rem",
                color: "#1e293b",
                marginBottom: "20px",
              }}
            >
              Add Payment
            </h2>

            <button
              onClick={() => setModalOpen(false)}
              style={{
                position: "absolute",
                top: "10px",
                right: "12px",
                fontSize: "20px",
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
            >
              ✖
            </button>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <label style={{ fontWeight: 600 }}>Payment Mode</label>
              <select
                value={mode}
                onChange={(e) =>
                  setMode(e.target.value as "UPI" | "CARD")
                }
                style={{
                  padding: "10px",
                  borderRadius: "6px",
                  border: "1px solid #cbd5e1",
                }}
              >
                <option value="UPI">UPI</option>
                <option value="CARD">Card</option>
              </select>

              <label style={{ fontWeight: 600 }}>Amount (₹)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                style={{
                  padding: "10px",
                  borderRadius: "6px",
                  border: "1px solid #cbd5e1",
                }}
              />

              <button
                onClick={savePayment}
                style={{
                  background: "#16a34a",
                  color: "white",
                  padding: "12px",
                  border: "none",
                  borderRadius: "8px",
                  width: "100%",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.background = "#15803d")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.background = "#16a34a")
                }
              >
                💾 Save Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ANIMATION */}
      <style>
        {`
        @keyframes popup {
          from { transform: scale(0.9); opacity: 0; }
          to   { transform: scale(1); opacity: 1; }
        }
      `}
      </style>
    </div>
    </div>
  );
}
