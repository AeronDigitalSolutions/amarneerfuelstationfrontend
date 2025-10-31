import { useState, useEffect } from "react";
import styles from "../style/saleentry.module.css";
import API from "../utils/api";

type PaymentMode = "Cash" | "UPI" | "Card" | "Credit";
type Shift = "A" | "B" | "C";

interface Sale {
  _id: string;
  saleId: string;
  date: string;
  time: string;
  shift: string;
  pumpNumber: number;
  productType: string;
  litresSold: number;
  totalAmount: number;
  paymentMode: PaymentMode;
  attendant?: string;
  creditParty?: string;
  remarks?: string;
  createdAt?: string;
}

export default function SaleEntry() {
  const [saleId] = useState(() => "SALE-" + Date.now());
  const [date] = useState(() => new Date().toISOString().split("T")[0]);
  const [shift, setShift] = useState<Shift>("A");
  const [pumpNumber, setPumpNumber] = useState<number>(1);
  const [productType, setProductType] = useState("Petrol");
  const [openingMeter, setOpeningMeter] = useState<number>(0);
  const [closingMeter, setClosingMeter] = useState<number>(0);
  const [ratePerLitre, setRatePerLitre] = useState<number>(105.5);
  const [litresSold, setLitresSold] = useState<number>(0);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>("Cash");
  const [creditParty, setCreditParty] = useState("");
  const [remarks, setRemarks] = useState("");
  const [attendant, setAttendant] = useState("");

  const [sales, setSales] = useState<Sale[]>([]);
  const [search, setSearch] = useState("");
  const [sortField] = useState<keyof Sale>("date");
  const [sortOrder] = useState<"asc" | "desc">("desc");

  const [editSale, setEditSale] = useState<Sale | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Auto calculations
  useEffect(() => {
    const litres = closingMeter - openingMeter;
    setLitresSold(litres > 0 ? litres : 0);
    setTotalAmount((litres > 0 ? litres : 0) * ratePerLitre);
  }, [openingMeter, closingMeter, ratePerLitre]);

  // Fetch sales
  const fetchSales = async () => {
    try {
      const res = await API.get("/sales"); // ✅ Updated (no /api prefix)
      setSales(res.data);
    } catch (error) {
      console.error("Failed to fetch sales:", error);
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);

  // Save new sale
  const handleSave = async () => {
    const now = new Date();
    const formattedTime = now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const saleData = {
      saleId,
      date,
      time: formattedTime,
      shift,
      pumpNumber,
      productType,
      openingMeter,
      closingMeter,
      litresSold,
      ratePerLitre,
      totalAmount,
      paymentMode,
      creditParty,
      remarks,
      attendant,
      createdAt: now.toISOString(),
    };

    try {
      await API.post("/sales", saleData); // ✅ Updated
      alert("✅ Sale saved successfully!");
      fetchSales();
    } catch (err) {
      console.error(err);
      alert("❌ Failed to save sale!");
    }
  };

  // Edit existing sale
  const handleEdit = (sale: Sale) => {
    setEditSale(sale);
    setIsModalOpen(true);
  };

  const handleUpdate = async () => {
    if (!editSale) return;
    try {
      await API.put(`/sales/${editSale._id}`, editSale); // ✅ Updated
      alert("✅ Sale updated successfully!");
      setIsModalOpen(false);
      setEditSale(null);
      fetchSales();
    } catch (err) {
      console.error(err);
      alert("❌ Failed to update sale!");
    }
  };

  // Filter + sort
  const filteredSales = sales
    .filter(
      (s) =>
        s.productType.toLowerCase().includes(search.toLowerCase()) ||
        s.paymentMode.toLowerCase().includes(search.toLowerCase()) ||
        s.attendant?.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const valA = a[sortField] ?? "";
      const valB = b[sortField] ?? "";
      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>⛽ Fuel Sale Entry</h1>

      {/* ====== FORM ====== */}
      <div className={styles.grid}>
        <div>
          <label className={styles.label}>Sale ID</label>
          <input className={styles.input} value={saleId} disabled />
        </div>

        <div>
          <label className={styles.label}>Date</label>
          <input className={styles.input} value={date} disabled />
        </div>

        <div>
          <label className={styles.label}>Shift</label>
          <select
            className={styles.select}
            value={shift}
            onChange={(e) => setShift(e.target.value as Shift)}
          >
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
          </select>
        </div>

        <div>
          <label className={styles.label}>Pump Number</label>
          <input
            type="number"
            className={styles.input}
            value={pumpNumber}
            onChange={(e) => setPumpNumber(Number(e.target.value))}
          />
        </div>

        <div>
          <label className={styles.label}>Product Type</label>
          <select
            className={styles.select}
            value={productType}
            onChange={(e) => setProductType(e.target.value)}
          >
            <option>Petrol</option>
            <option>Diesel</option>
            <option>Oil</option>
          </select>
        </div>

        <div>
          <label className={styles.label}>Rate per Litre (₹)</label>
          <input
            type="number"
            className={styles.input}
            value={ratePerLitre}
            onChange={(e) => setRatePerLitre(Number(e.target.value))}
          />
        </div>

        <div>
          <label className={styles.label}>Opening Meter Reading</label>
          <input
            type="number"
            className={styles.input}
            value={openingMeter}
            onChange={(e) => setOpeningMeter(Number(e.target.value))}
          />
        </div>

        <div>
          <label className={styles.label}>Closing Meter Reading</label>
          <input
            type="number"
            className={styles.input}
            value={closingMeter}
            onChange={(e) => setClosingMeter(Number(e.target.value))}
          />
        </div>

        <div>
          <label className={styles.label}>Payment Mode</label>
          <select
            className={styles.select}
            value={paymentMode}
            onChange={(e) => setPaymentMode(e.target.value as PaymentMode)}
          >
            <option>Cash</option>
            <option>UPI</option>
            <option>Card</option>
            <option>Credit</option>
          </select>
        </div>

        {paymentMode === "Credit" && (
          <div>
            <label className={styles.label}>Credit Party</label>
            <input
              type="text"
              className={styles.input}
              value={creditParty}
              onChange={(e) => setCreditParty(e.target.value)}
            />
          </div>
        )}

        <div>
          <label className={styles.label}>Attendant Name</label>
          <input
            type="text"
            className={styles.input}
            value={attendant}
            onChange={(e) => setAttendant(e.target.value)}
          />
        </div>

        <div>
          <label className={styles.label}>Remarks</label>
          <input
            type="text"
            className={styles.input}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
          />
        </div>
      </div>

      {/* ====== SUMMARY ====== */}
      <div className={styles.summary}>
        <h2>Summary</h2>
        <p>
          Litres Sold: <strong>{litresSold.toFixed(2)}</strong> L
        </p>
        <p>
          Total Amount: <strong>₹{totalAmount.toFixed(2)}</strong>
        </p>
      </div>

      <button className={styles.button} onClick={handleSave}>
        💾 Save Sale
      </button>

      {/* ====== TABLE SECTION ====== */}
      <div className={styles.tableSection}>
        <h2>📊 Sale Records</h2>
        <input
          type="text"
          placeholder="Search by product, mode, or attendant"
          className={styles.search}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <table className={styles.table}>
          <thead>
            <tr>
              <th>Date & Time</th>
              <th>Sale ID</th>
              <th>Product</th>
              <th>Litres</th>
              <th>Amount (₹)</th>
              <th>Payment</th>
              <th>Attendant</th>
              <th>Edit</th>
            </tr>
          </thead>
          <tbody>
            {filteredSales.map((s) => (
              <tr key={s._id}>
                <td>
                  {new Date(s.createdAt || s.date).toLocaleString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </td>
                <td>{s.saleId}</td>
                <td>{s.productType}</td>
                <td>{s.litresSold.toFixed(2)}</td>
                <td>{s.totalAmount.toFixed(2)}</td>
                <td>{s.paymentMode}</td>
                <td>{s.attendant || "-"}</td>
                <td>
                  <button
                    className={styles.editButton}
                    onClick={() => handleEdit(s)}
                  >
                    ✏️ Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ====== EDIT MODAL ====== */}
      {isModalOpen && editSale && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modal}>
            <h2>Edit Sale</h2>

            <label>Product Type</label>
            <input
              className={styles.input}
              value={editSale.productType}
              onChange={(e) =>
                setEditSale({ ...editSale, productType: e.target.value })
              }
            />

            <label>Payment Mode</label>
            <select
              className={styles.select}
              value={editSale.paymentMode}
              onChange={(e) =>
                setEditSale({
                  ...editSale,
                  paymentMode: e.target.value as PaymentMode,
                })
              }
            >
              <option>Cash</option>
              <option>UPI</option>
              <option>Card</option>
              <option>Credit</option>
            </select>

            <label>Attendant</label>
            <input
              className={styles.input}
              value={editSale.attendant || ""}
              onChange={(e) =>
                setEditSale({ ...editSale, attendant: e.target.value })
              }
            />

            <div className={styles.modalActions}>
              <button onClick={handleUpdate}>💾 Update</button>
              <button onClick={() => setIsModalOpen(false)}>❌ Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
