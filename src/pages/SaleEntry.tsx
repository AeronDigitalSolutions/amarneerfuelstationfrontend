// SaleEntry.tsx — UPDATED WITH FILTERS + SORTING (Option A arrows)
import { useState, useEffect, type MouseEvent, type JSX } from "react";
import axios from "axios";
import styles from "../style/saleentry.module.css";

type PaymentMode = "Cash" | "UPI" | "Card" | "Credit";
type Shift = string;

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

interface FuelTest {
  pumpId: string;
  pumpNo: string;
  pumpName: string;
  fuelType: string;
  liters: number;
  startTime: string;
  stopTime: string;
  duration: number;
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
  const [shift, setShift] = useState<Shift>("");

  const [shiftList, setShiftList] = useState<
    { _id: string; shiftName: string; startTime: string; endTime: string }[]
  >([]);

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

  // NEW: Filters state
  const [filterFrom, setFilterFrom] = useState<string>("");
  const [filterTo, setFilterTo] = useState<string>("");
  const [filterFuelType, setFilterFuelType] = useState<string>("All");
  const [filterPump, setFilterPump] = useState<string>("All");

  // NEW: Sorting state
  type SortBy = "none" | "litres" | "testFuel" | "total" | "received";
  const [sortBy, setSortBy] = useState<SortBy>("none");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    void fetchSales();
    void fetchPumps();
    void fetchFuelRates();
    void fetchShifts(); // ⭐ ADDED
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

  // ⭐ FETCH SHIFTS (NEW)
  const fetchShifts = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/shifts`);
      setShiftList(res.data);
    } catch (err) {
      console.error("❌ Failed to fetch shifts:", err);
    }
  };

  // Rest of your existing code remains **unchanged**
  // --------------------------------------------------
  // AUTO CALCULATE, AUTO RATE, AUTO PAYMENT, AUTO TEST FUEL
  // --------------------------------------------------

  useEffect(() => {
    const litresRaw =
      Number(closingMeter || 0) - Number(openingMeter || 0) - Number(testFuel || 0);

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
      Number(((cashAmount || 0) + (upiAmount || 0) + (cardAmount || 0)).toFixed(2))
    );
  }, [cashAmount, upiAmount, cardAmount]);

  useEffect(() => {
    const loadTestFuel = async () => {
      if (!pumpNumber) return;

      const pump = pumps.find((p) => p.pumpNo === pumpNumber);
      if (!pump) return;

      try {
        const res = await axios.get(
          `${BASE_URL}/fueltest/by-date?pumpId=${pump._id}&date=${date}`
        );

        const total = res.data.reduce(
          (sum: number, t: FuelTest) => sum + (t.liters || 0),
          0
        );

        setTestFuel(total);
      } catch (err) {
        console.error("❌ Failed to load test fuel:", err);
      }
    };

    loadTestFuel();
  }, [pumpNumber, pumps, date]);

  // ---------------- SAVE, DELETE, EDIT ---------------------

  const handleSave = async () => {
    if (!pumpNumber) {
      alert("⚠️ Please select a pump number");
      return;
    }

    if (!shift) {
      alert("⚠️ Please select shift");
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
    setShift(sale.shift);
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
    setShift("");
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

  // ---------------- FILTER, TABLE, TOTALS ---------------------

  // Helper to parse sale-date (use createdAt if present, else date)
  const getSaleDateString = (s: Sale) =>
    (s.createdAt || s.date || "").split("T")[0];

  // Apply filters: date range, fuel type, pump, search text
  const afterFilter = sales.filter((s) => {
    const combined =
      [
        s.productType,
        s.pumpNumber,
        s.saleId,
        s.attendant,
        s.paymentMode,
      ]
        .join(" ")
        .toLowerCase() || "";

    // Text search
    if (search && !combined.includes(search.toLowerCase())) return false;

    // Fuel type
    if (filterFuelType !== "All" && s.productType !== filterFuelType) return false;

    // Pump filter
    if (filterPump !== "All" && s.pumpNumber !== filterPump) return false;

    // Date filter
    const saleDateStr = getSaleDateString(s);
    if (filterFrom) {
      if (!saleDateStr || saleDateStr < filterFrom) return false;
    }
    if (filterTo) {
      if (!saleDateStr || saleDateStr > filterTo) return false;
    }

    return true;
  });

  // Sorting: sorts the filtered array copy
  const sortedSales = [...afterFilter].sort((a, b) => {
    if (sortBy === "none") return 0;

    const safeNum = (n: any) => (n === null || n === undefined ? 0 : Number(n));

    const aLitres = safeNum(a.litresSold);
    const bLitres = safeNum(b.litresSold);

    const aTest = safeNum((a as any).testFuel || 0);
    const bTest = safeNum((b as any).testFuel || 0);

    const aTotal = safeNum(a.totalAmount);
    const bTotal = safeNum(b.totalAmount);

    const aReceived =
      safeNum(a.cashAmount) + safeNum(a.upiAmount) + safeNum(a.cardAmount);
    const bReceived =
      safeNum(b.cashAmount) + safeNum(b.upiAmount) + safeNum(b.cardAmount);

    let diff = 0;
    switch (sortBy) {
      case "litres":
        diff = aLitres - bLitres;
        break;
      case "testFuel":
        diff = aTest - bTest;
        break;
      case "total":
        diff = aTotal - bTotal;
        break;
      case "received":
        diff = aReceived - bReceived;
        break;
      default:
        diff = 0;
    }

    return sortDir === "asc" ? diff : -diff;
  });

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
      acc +
      ((s.cashAmount || 0) +
        (s.upiAmount || 0) +
        (s.cardAmount || 0)),
    0
  );

  const handleBackdropClick = (e: MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).classList.contains(styles.modalBackdrop)) {
      setModalOpen(false);
    }
  };

  const amountsMatch = (a: number, b: number, eps = 0.01) =>
    Math.abs(a - b) <= eps;

  // NEW: set this month filter
  const applyThisMonth = () => {
    const now = new Date();
    const first = new Date(now.getFullYear(), now.getMonth(), 1);
    const to = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    setFilterFrom(first.toISOString().split("T")[0]);
    setFilterTo(to.toISOString().split("T")[0]);
  };

  // NEW: sort helpers
  const setSort = (col: SortBy, dir: "asc" | "desc") => {
    setSortBy(col);
    setSortDir(dir);
  };

  // ---------------- UI RENDER ---------------------

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>⛽ Fuel Sale Records</h1>
        <button className={styles.addButton} onClick={() => setModalOpen(true)}>
          ➕ Add Sale Entry
        </button>
      </div>

      {/* ===== FILTER BAR (NEW) ===== */}
      <div className={styles.filterBar}>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>From</label>
          <input
            type="date"
            className={styles.filterInput}
            value={filterFrom}
            onChange={(e) => setFilterFrom(e.target.value)}
          />
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>To</label>
          <input
            type="date"
            className={styles.filterInput}
            value={filterTo}
            onChange={(e) => setFilterTo(e.target.value)}
          />
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>&nbsp;</label>
          <button
            className={styles.smallBtn}
            onClick={() => {
              setFilterFrom("");
              setFilterTo("");
            }}
          >
            Clear
          </button>
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>&nbsp;</label>
          <button className={styles.smallBtnPrimary} onClick={applyThisMonth}>
            This Month
          </button>
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Fuel</label>
          <select
            className={styles.filterInput}
            value={filterFuelType}
            onChange={(e) => setFilterFuelType(e.target.value)}
          >
            <option value="All">All</option>
            <option value="Petrol">Petrol</option>
            <option value="Diesel">Diesel</option>
            <option value="Premium Petrol">Premium Petrol</option>
            <option value="CNG">CNG</option>
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Pump</label>
          <select
            className={styles.filterInput}
            value={filterPump}
            onChange={(e) => setFilterPump(e.target.value)}
          >
            <option value="All">All</option>
            {pumps.map((p) => (
              <option key={p._id} value={p.pumpNo}>
                {p.pumpNo}
              </option>
            ))}
          </select>
        </div>

<div className={styles.searchGroup}>
    <label className={styles.filterLabel}>Search</label>
    <input
      type="text"
      placeholder="Search…"
      className={styles.searchInline}
      value={search}
      onChange={(e) => setSearch(e.target.value)}
    />
  </div>


      </div>

      {/* TABLE SECTION */}
      <div className={styles.tableSection}>
        <input
          type="text"
          placeholder="Search..."
          className={styles.search}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Sale ID</th>
                <th>Pump</th>
                <th>Product</th>
                <th>Rate</th>

                <th>
                  Litres
                  <span className={styles.sortArrows}>
                    <button
                      className={styles.sortBtn}
                      title="Sort litres asc"
                      onClick={() => setSort("litres", "asc")}
                    >
                      🔼
                    </button>
                    <button
                      className={styles.sortBtn}
                      title="Sort litres desc"
                      onClick={() => setSort("litres", "desc")}
                    >
                      🔽
                    </button>
                  </span>
                </th>

                <th>
                  Test Fuel
                  <span className={styles.sortArrows}>
                    <button
                      className={styles.sortBtn}
                      title="Sort test fuel asc"
                      onClick={() => setSort("testFuel", "asc")}
                    >
                      🔼
                    </button>
                    <button
                      className={styles.sortBtn}
                      title="Sort test fuel desc"
                      onClick={() => setSort("testFuel", "desc")}
                    >
                      🔽
                    </button>
                  </span>
                </th>

                <th>
                  Total ₹
                  <span className={styles.sortArrows}>
                    <button
                      className={styles.sortBtn}
                      title="Sort total asc"
                      onClick={() => setSort("total", "asc")}
                    >
                      🔼
                    </button>
                    <button
                      className={styles.sortBtn}
                      title="Sort total desc"
                      onClick={() => setSort("total", "desc")}
                    >
                      🔽
                    </button>
                  </span>
                </th>

                <th>
                  Total Received
                  <span className={styles.sortArrows}>
                    <button
                      className={styles.sortBtn}
                      title="Sort received asc"
                      onClick={() => setSort("received", "asc")}
                    >
                      🔼
                    </button>
                    <button
                      className={styles.sortBtn}
                      title="Sort received desc"
                      onClick={() => setSort("received", "desc")}
                    >
                      🔽
                    </button>
                  </span>
                </th>

                <th>Cash</th>
                <th>UPI</th>
                <th>Card</th>
                <th>Attendant</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {sortedSales.length > 0 ? (
                sortedSales.map((s) => (
                  <tr key={s._id}>
                    <td>{new Date(s.createdAt || s.date).toLocaleString("en-IN")}</td>
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
                      <button className={styles.editBtn} onClick={() => handleEdit(s)}>
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
                <td colSpan={6} style={{ textAlign: "right", fontWeight: "bold" }}>
                  Totals:
                </td>
                <td style={{ fontWeight: "bold" }}>{totalTestFuel.toFixed(2)}</td>
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

      {/* MODAL */}
      {modalOpen && (
        <div className={styles.modalBackdrop} onClick={handleBackdropClick}>
          <div className={styles.modal}>
            <h2>{editSale ? "✏️ Edit Sale Entry" : "➕ Add Sale Entry"}</h2>
            <button className={styles.closeBtn} onClick={() => setModalOpen(false)}>
              ✖
            </button>

            <div className={styles.form}>
              <label>Sale ID</label>
              <input value={saleId} disabled />

              <label>Shift</label>
              <select value={shift} onChange={(e) => setShift(e.target.value)}>
                <option value="">Select Shift</option>
                {shiftList.map((s) => (
                  <option key={s._id} value={s.shiftName}>
                    {s.shiftName} ({s.startTime} - {s.endTime})
                  </option>
                ))}
              </select>

              <label>Pump</label>
              <select value={pumpNumber} onChange={(e) => setPumpNumber(e.target.value)}>
                <option value="">Select Pump</option>
                {pumps.map((p) => (
                  <option key={p._id} value={p.pumpNo}>
                    {p.pumpNo} - {p.pumpName}
                  </option>
                ))}
              </select>

              <label>Product</label>
              <select value={productType} onChange={(e) => setProductType(e.target.value)}>
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

              <label>Test Fuel (Auto)</label>
              <input type="number" value={testFuel} readOnly />

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
