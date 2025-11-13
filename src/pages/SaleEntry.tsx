// SaleEntry.tsx — UPDATED WITH TABLE WRAPPER
import React, { useState, useEffect, type MouseEvent, type JSX } from "react";
import axios from "axios";
import styles from "../style/saleentry.module.css";

type PaymentMode = "Cash" | "UPI" | "Card" | "Credit";
type Shift = "A" | "B" | "C";

const BASE_URL =
  import.meta.env.VITE_API_URL ||
  (window.location.hostname === "localhost"
    ? "http://localhost:5000/api"
    : "https://amarneerfuelstationbackend.onrender.com/api");

interface Pump {
  _id?: string;
  pumpNo: string;
  pumpName: string;
  fuels: { type: string }[];
}

interface FuelRates {
  petrol: number;
  diesel: number;
  premiumPetrol: number;
  cng: number;
}

interface Sale {
  _id?: string;
  saleId: string;
  date: string;
  time: string;
  shift: string;
  pumpNumber: string;
  productType: string;
  openingMeter?: number;
  closingMeter?: number;
  testFuel?: number;
  litresSold: number;
  ratePerLitre: number;
  totalAmount: number;
  cashAmount?: number;
  upiAmount?: number;
  cardAmount?: number;
  totalPayment?: number;
  paymentMode: PaymentMode;
  attendant?: string;
  creditParty?: string;
  remarks?: string;
  createdAt?: string;
}

export default function SaleEntry(): JSX.Element {
  const [sales, setSales] = useState<Sale[]>([]);
  const [pumps, setPumps] = useState<Pump[]>([]);
  const [rates, setRates] = useState<FuelRates>({
    petrol: 0,
    diesel: 0,
    premiumPetrol: 0,
    cng: 0,
  });

  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editSale, setEditSale] = useState<Sale | null>(null);

  const [saleId, setSaleId] = useState(() => "SALE-" + Date.now());
  const [date] = useState(() => new Date().toISOString().split("T")[0]);
  const [shift, setShift] = useState<Shift>("A");
  const [pumpNumber, setPumpNumber] = useState("");
  const [productType, setProductType] = useState("Petrol");
  const [openingMeter, setOpeningMeter] = useState<number>(0);
  const [closingMeter, setClosingMeter] = useState<number>(0);
  const [testFuel, setTestFuel] = useState<number>(0);
  const [ratePerLitre, setRatePerLitre] = useState<number>(0);
  const [litresSold, setLitresSold] = useState<number>(0);
  const [totalAmount, setTotalAmount] = useState<number>(0);

  const [cashAmount, setCashAmount] = useState<number>(0);
  const [upiAmount, setUpiAmount] = useState<number>(0);
  const [cardAmount, setCardAmount] = useState<number>(0);
  const [totalPayment, setTotalPayment] = useState<number>(0);

  const [paymentMode, setPaymentMode] = useState<PaymentMode>("Cash");
  const [creditParty, setCreditParty] = useState("");
  const [remarks, setRemarks] = useState("");
  const [attendant, setAttendant] = useState("");

  useEffect(() => {
    void fetchSales();
    void fetchPumps();
    void fetchFuelRates();
  }, []);

  const fetchSales = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/sales`);
      setSales(res.data);
    } catch (err) {
      console.error("❌ Failed to fetch sales:", err);
    }
  };

  const fetchPumps = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/pumps`);
      setPumps(res.data);
    } catch (err) {
      console.error("❌ Failed to fetch pumps:", err);
    }
  };

  const fetchFuelRates = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/fuel-rates`);
      setRates(res.data);
      setRatePerLitre(res.data?.petrol ?? 0);
    } catch (err) {
      console.error("❌ Failed to fetch fuel rates:", err);
    }
  };

  useEffect(() => {
    const litresRaw =
      Number(closingMeter || 0) -
      Number(openingMeter || 0) -
      Number(testFuel || 0);
    const litres = litresRaw > 0 ? litresRaw : 0;
    setLitresSold(litres);

    const total = litres * Number(ratePerLitre || 0);
    setTotalAmount(Number(total.toFixed(2)));
  }, [openingMeter, closingMeter, testFuel, ratePerLitre]);

  useEffect(() => {
    const map: Record<string, number> = {
      Petrol: rates.petrol,
      Diesel: rates.diesel,
      "Premium Petrol": rates.premiumPetrol,
      CNG: rates.cng,
    };
    setRatePerLitre(map[productType] ?? 0);
  }, [productType, rates]);

  useEffect(() => {
    setTotalPayment(
      Number(
        ((cashAmount || 0) + (upiAmount || 0) + (cardAmount || 0)).toFixed(2)
      )
    );
  }, [cashAmount, upiAmount, cardAmount]);

  const handleSave = async () => {
    if (!pumpNumber) {
      alert("⚠️ Please select a pump number");
      return;
    }

    const now = new Date();
    const saleData: Partial<Sale> = {
      saleId,
      date,
      time: now.toLocaleTimeString(),
      shift,
      pumpNumber,
      productType,
      openingMeter,
      closingMeter,
      testFuel,
      litresSold,
      ratePerLitre,
      totalAmount,
      cashAmount,
      upiAmount,
      cardAmount,
      totalPayment,
      paymentMode,
      creditParty,
      remarks,
      attendant,
      createdAt: now.toISOString(),
    };

    try {
      if (editSale && editSale._id) {
        await axios.put(`${BASE_URL}/sales/${editSale._id}`, saleData);
        alert("✅ Sale updated successfully!");
      } else {
        await axios.post(`${BASE_URL}/sales`, saleData);
        alert("✅ Sale added successfully!");
      }

      await fetchSales();
      resetForm();
      setModalOpen(false);
    } catch (err) {
      console.error("❌ Failed to save sale:", err);
      alert("❌ Failed to save sale!");
    }
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (!window.confirm("Are you sure you want to delete this sale?")) return;
    try {
      await axios.delete(`${BASE_URL}/sales/${id}`);
      await fetchSales();
      alert("🗑️ Sale deleted successfully!");
    } catch (err) {
      console.error("❌ Delete failed:", err);
      alert("❌ Failed to delete sale!");
    }
  };

  const handleEdit = (sale: Sale) => {
    setEditSale(sale);
    setModalOpen(true);

    setSaleId(sale.saleId);
    setShift(sale.shift as Shift);
    setPumpNumber(sale.pumpNumber);
    setProductType(sale.productType);
    setOpeningMeter(sale.openingMeter ?? 0);
    setClosingMeter(sale.closingMeter ?? 0);
    setTestFuel((sale as any).testFuel ?? 0);
    setRatePerLitre(sale.ratePerLitre ?? 0);
    setCashAmount(sale.cashAmount ?? 0);
    setUpiAmount(sale.upiAmount ?? 0);
    setCardAmount(sale.cardAmount ?? 0);
    setRemarks(sale.remarks ?? "");
    setAttendant(sale.attendant ?? "");
  };

  const resetForm = () => {
    setEditSale(null);
    setSaleId("SALE-" + Date.now());
    setShift("A");
    setPumpNumber("");
    setProductType("Petrol");
    setOpeningMeter(0);
    setClosingMeter(0);
    setTestFuel(0);
    setRatePerLitre(rates.petrol ?? 0);
    setLitresSold(0);
    setTotalAmount(0);
    setCashAmount(0);
    setUpiAmount(0);
    setCardAmount(0);
    setTotalPayment(0);
    setPaymentMode("Cash");
    setCreditParty("");
    setRemarks("");
    setAttendant("");
  };

  const filteredSales = sales.filter((s) =>
    [
      s.productType,
      s.pumpNumber,
      s.saleId,
      s.attendant,
      s.paymentMode,
    ]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const totalCash = sales.reduce((acc, s) => acc + (s.cashAmount || 0), 0);
  const totalUpi = sales.reduce((acc, s) => acc + (s.upiAmount || 0), 0);
  const totalCard = sales.reduce((acc, s) => acc + (s.cardAmount || 0), 0);
  const grandTotal = sales.reduce((acc, s) => acc + (s.totalAmount || 0), 0);

  const totalTestFuel = sales.reduce(
    (acc, s) => acc + ((s as any).testFuel || 0),
    0
  );

  const totalReceivedFromSales = sales.reduce(
    (acc, s) =>
      acc + ((s.cashAmount || 0) + (s.upiAmount || 0) + (s.cardAmount || 0)),
    0
  );

  const handleBackdropClick = (e: MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).classList.contains(styles.modalBackdrop)) {
      setModalOpen(false);
    }
  };

  const amountsMatch = (a: number, b: number, eps = 0.01) =>
    Math.abs(a - b) <= eps;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>⛽ Fuel Sale Records</h1>
        <button className={styles.addButton} onClick={() => setModalOpen(true)}>
          ➕ Add Sale Entry
        </button>
      </div>

      {/* ===== TABLE SECTION ===== */}
      <div className={styles.tableSection}>
        <input
          type="text"
          placeholder="Search..."
          className={styles.search}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* ⭐ TABLE WRAPPER ADDED HERE */}
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Sale ID</th>
                <th>Pump</th>
                <th>Product</th>
                <th>Rate</th>
                <th>Litres</th>
                <th>Test Fuel</th>
                <th>Total ₹</th>
                <th>Total Received</th>
                <th>Cash</th>
                <th>UPI</th>
                <th>Card</th>
                <th>Attendant</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredSales.length > 0 ? (
                filteredSales.map((s) => (
                  <tr key={s._id}>
                    <td>
                      {new Date(s.createdAt || s.date).toLocaleString("en-IN")}
                    </td>
                    <td>{s.saleId}</td>
                    <td>{s.pumpNumber}</td>
                    <td>{s.productType}</td>
                    <td>{s.ratePerLitre}</td>
                    <td>{(s.litresSold || 0).toFixed(2)}</td>
                    <td>{((s as any).testFuel ?? 0).toFixed(2)}</td>
                    <td>{(s.totalAmount || 0).toFixed(2)}</td>
                    <td>
                      {(
                        (s.cashAmount || 0) +
                        (s.upiAmount || 0) +
                        (s.cardAmount || 0)
                      ).toFixed(2)}
                    </td>
                    <td>{s.cashAmount || 0}</td>
                    <td>{s.upiAmount || 0}</td>
                    <td>{s.cardAmount || 0}</td>
                    <td>{s.attendant || "-"}</td>
                    <td>
                      <button
                        className={styles.editBtn}
                        onClick={() => handleEdit(s)}
                      >
                        ✏️
                      </button>
                      <button
                        className={styles.deleteBtn}
                        onClick={() => handleDelete(s._id!)}
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={14}>No records found</td>
                </tr>
              )}
            </tbody>

            <tfoot>
              <tr>
                <td
                  colSpan={6}
                  style={{ textAlign: "right", fontWeight: "bold" }}
                >
                  Totals:
                </td>
                <td style={{ fontWeight: "bold" }}>
                  {totalTestFuel.toFixed(2)}
                </td>
                <td style={{ fontWeight: "bold" }}>{grandTotal.toFixed(2)}</td>
                <td style={{ fontWeight: "bold" }}>
                  {totalReceivedFromSales.toFixed(2)}
                </td>
                <td>{totalCash.toFixed(2)}</td>
                <td>{totalUpi.toFixed(2)}</td>
                <td>{totalCard.toFixed(2)}</td>
                <td colSpan={2} />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* ===== MODAL ===== */}
      {modalOpen && (
        <div className={styles.modalBackdrop} onClick={handleBackdropClick}>
          <div className={styles.modal}>
            <h2>{editSale ? "✏️ Edit Sale Entry" : "➕ Add Sale Entry"}</h2>
            <button
              className={styles.closeBtn}
              onClick={() => setModalOpen(false)}
            >
              ✖
            </button>

            <div className={styles.form}>
              <label>Sale ID</label>
              <input value={saleId} disabled />

              <label>Shift</label>
              <select
                value={shift}
                onChange={(e) => setShift(e.target.value as Shift)}
              >
                <option>A</option>
                <option>B</option>
                <option>C</option>
              </select>

              <label>Pump</label>
              <select
                value={pumpNumber}
                onChange={(e) => setPumpNumber(e.target.value)}
              >
                <option value="">Select Pump</option>
                {pumps.map((p) => (
                  <option key={p._id} value={p.pumpNo}>
                    {p.pumpNo} - {p.pumpName}
                  </option>
                ))}
              </select>

              <label>Product</label>
              <select
                value={productType}
                onChange={(e) => setProductType(e.target.value)}
              >
                <option>Petrol</option>
                <option>Diesel</option>
                <option>Premium Petrol</option>
                <option>CNG</option>
              </select>

              <label>Rate per Litre ₹</label>
              <input type="number" value={ratePerLitre} readOnly />

              <label>Opening Meter</label>
              <input
                type="number"
                value={openingMeter}
                onChange={(e) => setOpeningMeter(Number(e.target.value))}
              />

              <label>Closing Meter</label>
              <input
                type="number"
                value={closingMeter}
                onChange={(e) => setClosingMeter(Number(e.target.value))}
              />

              <label>Test Fuel (L)</label>
              <input
                type="number"
                value={testFuel}
                onChange={(e) => setTestFuel(Number(e.target.value))}
              />

              <label>Cash ₹</label>
              <input
                type="number"
                value={cashAmount}
                onChange={(e) => setCashAmount(Number(e.target.value))}
              />

              <label>UPI ₹</label>
              <input
                type="number"
                value={upiAmount}
                onChange={(e) => setUpiAmount(Number(e.target.value))}
              />

              <label>Card ₹</label>
              <input
                type="number"
                value={cardAmount}
                onChange={(e) => setCardAmount(Number(e.target.value))}
              />

              <label>Attendant</label>
              <input
                type="text"
                value={attendant}
                onChange={(e) => setAttendant(e.target.value)}
              />

              <label>Remarks</label>
              <input
                type="text"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
              />

              <div className={styles.modalSummary}>
                <div className={styles.summaryRow}>
                  <label>Total Litres (L)</label>
                  <input value={litresSold.toFixed(2)} readOnly />
                </div>

                <div className={styles.summaryRow}>
                  <label>Total Amount ₹</label>
                  <input value={totalAmount.toFixed(2)} readOnly />
                </div>

                <div className={styles.summaryRow}>
                  <label>Total Received ₹</label>
                  <input value={totalPayment.toFixed(2)} readOnly />
                </div>

                <div
                  className={
                    amountsMatch(totalAmount, totalPayment)
                      ? styles.matchBox
                      : styles.mismatchBox
                  }
                >
                  {amountsMatch(totalAmount, totalPayment) ? (
                    <strong>OK — Received equals total</strong>
                  ) : (
                    <strong>
                      MISMATCH — Difference ₹
                      {(totalAmount - totalPayment).toFixed(2)}
                    </strong>
                  )}
                </div>
              </div>

              <button className={styles.saveBtn} onClick={handleSave}>
                💾 {editSale ? "Update" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
