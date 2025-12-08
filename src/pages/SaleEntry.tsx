/** -------------- FULL UPDATED SaleEntry.tsx (DYNAMIC FUEL RATES) -------------- */

import { useState, useEffect, type MouseEvent, type JSX } from "react";
import axios from "axios";
import { FaChevronUp } from "react-icons/fa6";
import { IoIosArrowDown } from "react-icons/io";
import styles from "../style/saleentry.module.css";

type PaymentMode = "Cash" | "UPI" | "Card" | "Credit";
type Shift = string;

const BASE_URL =
  import.meta.env.VITE_API_URL ||
  (window.location.hostname === "localhost"
    ? "http://localhost:5000/api"
    : "https://amarneerfuelstationbackend.onrender.com/api");

/* ---------------------------------------------------------
   Interfaces
----------------------------------------------------------*/

interface NozzleDef {
  nozzleNo: number;
  fuelType: string;        // dynamic fuel type
  name?: string;
}

interface Machine {
  _id?: string;
  machineNo: string;
  machineName: string;
  nozzles: NozzleDef[];
}

interface SaleEntryItem {
  nozzleNo: number;
  nozzleName?: string;
  fuelType: string;
  openingMeter: number;
  closingMeter: number;
  testFuel: number;
  litres: number;
  ratePerLitre: number;
  amount: number;
  attendant?: string;
}

interface Sale {
  _id?: string;
  saleId: string;
  date: string;
  time?: string;
  shift: string;
  machineNo: string;
  entries: SaleEntryItem[];
  totalLitres: number;
  totalAmount: number;
  cashAmount?: number;
  upiAmount?: number;
  cardAmount?: number;
  totalPayment?: number;
  paymentMode?: PaymentMode;
  creditParty?: string;
  remarks?: string;
  attendant?: string;
  createdAt?: string;
}


/* =========================================================
     MAIN COMPONENT
=========================================================== */
export default function SaleEntry(): JSX.Element {

  /* ---------------- State ---------------- */

  const [sales, setSales] = useState<Sale[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);

  // ⭐ Dynamic Fuel Rates (e.g. {Petrol: 110, Diesel: 95})
  const [rates, setRates] = useState<Record<string, number>>({});

  const [shiftList, setShiftList] = useState<
    { _id: string; shiftName: string; startTime: string; endTime: string }[]
  >([]);

  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [nozzleModalOpen, setNozzleModalOpen] = useState(false);
  const [editSale, setEditSale] = useState<Sale | null>(null);

  const [saleId, setSaleId] = useState("SALE-" + Date.now());
  const [date] = useState(() => new Date().toISOString().split("T")[0]);
  const [shift, setShift] = useState<Shift>("");

  const [machineNo, setMachineNo] = useState("");
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);

  const [entries, setEntries] = useState<SaleEntryItem[]>([]);
  const [totalLitres, setTotalLitres] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);

  const [cashAmount, setCashAmount] = useState(0);
  const [upiAmount, setUpiAmount] = useState(0);
  const [cardAmount, setCardAmount] = useState(0);
  const [totalPayment, setTotalPayment] = useState(0);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>("Cash");

  // const [creditParty, setCreditParty] = useState("");
  const [remarks, setRemarks] = useState("");
  const [attendant, setAttendant] = useState("");

  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");
  const [filterFuelType, setFilterFuelType] = useState("All");
  const [filterMachine, setFilterMachine] = useState("All");

  type SortBy = "none" | "litres" | "total" | "received";
  const [sortBy, setSortBy] = useState<SortBy>("none");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const [activeNozzle, setActiveNozzle] = useState<NozzleDef | null>(null);
  const [nozzleOpening, setNozzleOpening] = useState(0);
  const [nozzleClosing, setNozzleClosing] = useState(0);
  const [nozzleTestFuel, setNozzleTestFuel] = useState(0);
  const [nozzleRate, setNozzleRate] = useState(0);
  const [nozzleAttendant, setNozzleAttendant] = useState("");

  /* ---------------------------------------------------------
        INITIAL LOAD
  ----------------------------------------------------------*/
  useEffect(() => {
    fetchSales();
    fetchMachines();
    fetchFuelRates();
    fetchShifts();
  }, []);

  /* -------------------- helpers ------------------------ */
  const safe = (n: any) => (n == null ? 0 : Number(n));

  /* -------------------- fetchers ------------------------ */

  const fetchSales = async () => {
    try {
      const r = await axios.get(`${BASE_URL}/sales`);
      setSales(r.data || []);
    } catch {}
  };

  const fetchMachines = async () => {
    try {
      const r = await axios.get(`${BASE_URL}/machines`);
      setMachines(r.data || []);
    } catch {}
  };

  // ⭐ Dynamic fuel rates fetcher
  const fetchFuelRates = async () => {
    try {
      const r = await axios.get(`${BASE_URL}/fuel-rates`);
      if (r.data?.rates) {
        setRates(r.data.rates);
      }
    } catch {}
  };

  const fetchShifts = async () => {
    try {
      const r = await axios.get(`${BASE_URL}/shifts`);
      setShiftList(r.data || []);
    } catch {}
  };


  /* ---------------- machine selected ---------------- */
  useEffect(() => {
    const m = machines.find((x) => x.machineNo === machineNo);
    setSelectedMachine(m || null);
    setEntries([]);
  }, [machineNo, machines]);


  /* ---------------- totals update ---------------- */
  useEffect(() => {
    const tl = entries.reduce((a, e) => a + safe(e.litres), 0);
    const ta = entries.reduce((a, e) => a + safe(e.amount), 0);
    setTotalLitres(Number(tl.toFixed(2)));
    setTotalAmount(Number(ta.toFixed(2)));
  }, [entries]);

  useEffect(() => {
    setTotalPayment(safe(cashAmount) + safe(upiAmount) + safe(cardAmount));
  }, [cashAmount, upiAmount, cardAmount]);


  /* =====================================================
           OPEN NOZZLE MODAL  (Dynamic fuel rates)
  ======================================================*/
  const openNozzleModal = async (nozzle: NozzleDef) => {
    setActiveNozzle(nozzle);

    try {
      const res = await axios.get(`${BASE_URL}/fuel-rates`);
      const latestRates = res.data?.rates || {};
      setRates(latestRates);
      setNozzleRate(latestRates[nozzle.fuelType] ?? 0);
    } catch {
      setNozzleRate(rates[nozzle.fuelType] ?? 0);
    }

    // auto test fuel
    try {
      if (selectedMachine?._id) {
        const r = await axios.get(
          `${BASE_URL}/fueltest/by-date?machineId=${selectedMachine._id}&nozzleNo=${nozzle.nozzleNo}&date=${date}`
        );
        const sum = Array.isArray(r.data)
          ? r.data.reduce((acc: number, t: any) => acc + safe(t.liters), 0)
          : 0;
        setNozzleTestFuel(sum);
      }
    } catch {
      setNozzleTestFuel(0);
    }

    setNozzleOpening(0);
    setNozzleClosing(0);
    setNozzleAttendant("");
    setNozzleModalOpen(true);
  };


  /* ---------------- add nozzle entry ---------------- */
  const addNozzleEntryToSale = () => {
    if (!activeNozzle) return;

    const opening = safe(nozzleOpening);
    const closing = safe(nozzleClosing);
    if (closing < opening) {
      alert("Closing meter cannot be less than opening meter");
      return;
    }

    let litres = closing - opening - safe(nozzleTestFuel);
    litres = litres < 0 ? 0 : litres;

    const entry: SaleEntryItem = {
      nozzleNo: activeNozzle.nozzleNo,
      nozzleName: activeNozzle.name || `Nozzle ${activeNozzle.nozzleNo}`,
      fuelType: activeNozzle.fuelType,
      openingMeter: opening,
      closingMeter: closing,
      testFuel: safe(nozzleTestFuel),
      litres: Number(litres.toFixed(2)),
      ratePerLitre: nozzleRate,
      amount: Number((litres * nozzleRate).toFixed(2)),
      attendant: nozzleAttendant,
    };

    setEntries((prev) => {
      const i = prev.findIndex((p) => p.nozzleNo === entry.nozzleNo);
      if (i >= 0) {
        const copy = [...prev];
        copy[i] = entry;
        return copy;
      }
      return [...prev, entry];
    });

    setNozzleModalOpen(false);
    setActiveNozzle(null);
  };


  /* ---------------- save sale ---------------- */
  const handleSave = async () => {
    if (!machineNo) return alert("Select machine");
    if (!shift) return alert("Select shift");
    if (entries.length === 0) return alert("Add at least one nozzle entry");

    const now = new Date();

    const payload: Partial<Sale> = {
      saleId,
      date,
      time: now.toLocaleTimeString(),
      shift,
      machineNo,
      entries,
      totalLitres,
      totalAmount,
      cashAmount,
      upiAmount,
      cardAmount,
      totalPayment,
      paymentMode,
      // creditParty,
      remarks,
      attendant,
      createdAt: now.toISOString(),
    };

    try {
      if (editSale && editSale._id) {
        await axios.put(`${BASE_URL}/sales/${editSale._id}`, payload);
        alert("Sale updated");
      } else {
        await axios.post(`${BASE_URL}/sales`, payload);
        alert("Sale added");
      }
      fetchSales();
      resetForm();
      setModalOpen(false);
    } catch {
      alert("Save failed");
    }
  };


  /* ---------------- reset ---------------- */
  const resetForm = () => {
    setEditSale(null);
    setSaleId("SALE-" + Date.now());
    setShift("");
    setMachineNo("");
    setEntries([]);
    setTotalLitres(0);
    setTotalAmount(0);
    setCashAmount(0);
    setUpiAmount(0);
    setCardAmount(0);
    setTotalPayment(0);
    setRemarks("");
    setAttendant("");
    setPaymentMode("Cash");
  };


  /* ---------------- delete ---------------- */
  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (!confirm("Delete this sale?")) return;
    try {
      await axios.delete(`${BASE_URL}/sales/${id}`);
      fetchSales();
    } catch {}
  };


  /* ---------------- edit ---------------- */
  const handleEdit = (s: Sale) => {
    setEditSale(s);
    setModalOpen(true);

    setSaleId(s.saleId);
    setShift(s.shift);
    setMachineNo(s.machineNo);
    setEntries(s.entries);
    setTotalLitres(s.totalLitres);
    setTotalAmount(s.totalAmount);
    setCashAmount(s.cashAmount || 0);
    setUpiAmount(s.upiAmount || 0);
    setCardAmount(s.cardAmount || 0);
    setTotalPayment(
      safe(s.cashAmount) + safe(s.upiAmount) + safe(s.cardAmount)
    );

    setRemarks(s.remarks || "");
    setAttendant(s.attendant || "");
  };


  /* =====================================================
        FILTER + SORT
  ======================================================*/

  const getSaleDate = (s: Sale) =>
    (s.createdAt || s.date || "").split("T")[0];

  const afterFilter = sales.filter((s) => {
    const combined =
      [
        s.machineNo,
        s.entries.map((e) => e.fuelType).join(" "),
        s.saleId,
        s.attendant,
      ]
        .join(" ")
        .toLowerCase();

    if (search && !combined.includes(search.toLowerCase())) return false;

    if (filterFuelType !== "All") {
      if (!s.entries.some((e) => e.fuelType === filterFuelType)) return false;
    }

    if (filterMachine !== "All" && s.machineNo !== filterMachine) return false;

    const d = getSaleDate(s);
    if (filterFrom && d < filterFrom) return false;
    if (filterTo && d > filterTo) return false;

    return true;
  });

  const sortedSales = [...afterFilter].sort((a, b) => {
    if (sortBy === "none") return 0;
    let diff = 0;
    if (sortBy === "litres") diff = safe(a.totalLitres) - safe(b.totalLitres);
    if (sortBy === "total") diff = safe(a.totalAmount) - safe(b.totalAmount);
    if (sortBy === "received") {
      diff =
        safe(a.cashAmount) +
        safe(a.upiAmount) +
        safe(a.cardAmount) -
        (safe(b.cashAmount) +
          safe(b.upiAmount) +
          safe(b.cardAmount));
    }
    return sortDir === "asc" ? diff : -diff;
  });


  const totalCash = sales.reduce((a, s) => a + safe(s.cashAmount), 0);
  const totalUpi = sales.reduce((a, s) => a + safe(s.upiAmount), 0);
  const totalCard = sales.reduce((a, s) => a + safe(s.cardAmount), 0);
  const grandTotal = sales.reduce((a, s) => a + safe(s.totalAmount), 0);
  const totalReceivedFromSales = sales.reduce(
    (a, s) => a + safe(s.cashAmount) + safe(s.upiAmount) + safe(s.cardAmount),
    0
  );

  const amountsMatch = (a: number, b: number) =>
    Math.abs(a - b) < 0.01;

  const handleBackdropClick = (e: MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).classList.contains(styles.modalBackdrop)) {
      setModalOpen(false);
      setNozzleModalOpen(false);
    }
  };


  /* =====================================================
               RENDER
  ======================================================*/

  return (
    <div className={styles.container}>

      <div className={styles.header}>
        <h1 className={styles.title}>Fuel Sale Records</h1>
      </div>

      <div className={styles.btnWrapper}>
        <button className={styles.addButton} onClick={() => setModalOpen(true)}>
          ➕ Add Sale Entry
        </button>
      </div>

      {/* ---------------- FILTER BAR ---------------- */}
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
          <label className={styles.filterLabel}>Fuel</label>
          <select
            className={styles.filterInput}
            value={filterFuelType}
            onChange={(e) => setFilterFuelType(e.target.value)}
          >
            <option value="All">All</option>

            {/* ⭐ Dynamic fuel types */}
            {Object.keys(rates).map((fuel) => (
              <option key={fuel} value={fuel}>
                {fuel}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Machine</label>
          <select
            className={styles.filterInput}
            value={filterMachine}
            onChange={(e) => setFilterMachine(e.target.value)}
          >
            <option value="All">All</option>
            {machines.map((m) => (
              <option key={m._id} value={m.machineNo}>
                {m.machineNo}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.searchGroup}>
          <label className={styles.filterLabel}>Search</label>
          <input
            className={styles.searchInline}
            placeholder="Search…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

      </div>


      {/* ---------------- TABLE ---------------- */}
      <div className={styles.tableSection}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>

            <thead>
              <tr>
                <th>Date</th>
                <th>Sale ID</th>
                <th>Machine</th>
                <th>Products</th>
                <th>
                  Litres
                  <span className={styles.sortArrows}>
                    <button
                      className={styles.sortBtn}
                      onClick={() => {
                        setSortBy("litres");
                        setSortDir("asc");
                      }}
                    >
                      <FaChevronUp style={{ fontSize: 9 }} />
                    </button>
                    <button
                      className={styles.sortBtn}
                      onClick={() => {
                        setSortBy("litres");
                        setSortDir("desc");
                      }}
                    >
                      <IoIosArrowDown />
                    </button>
                  </span>
                </th>
                <th>Total</th>
                <th>Received</th>
                <th>Cash</th>
                <th>UPI</th>
                <th>Card</th>
                <th>Attendant</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {sortedSales.length ? (
                sortedSales.map((s) => (
                  <tr key={s._id}>
                    <td>{new Date(s.createdAt || s.date).toLocaleString("en-IN")}</td>
                    <td>{s.saleId}</td>
                    <td>{s.machineNo}</td>
                    <td>
                      {s.entries
                        .map((e) => `${e.nozzleName} (${e.fuelType})`)
                        .join(", ")}
                    </td>
                    <td>{safe(s.totalLitres).toFixed(2)}</td>
                    <td>{safe(s.totalAmount).toFixed(2)}</td>
                    <td>
                      {(safe(s.cashAmount) +
                        safe(s.upiAmount) +
                        safe(s.cardAmount)).toFixed(2)}
                    </td>
                    <td>{safe(s.cashAmount).toFixed(2)}</td>
                    <td>{safe(s.upiAmount).toFixed(2)}</td>
                    <td>{safe(s.cardAmount).toFixed(2)}</td>
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
                        onClick={() => handleDelete(s._id)}
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={12}>No records</td>
                </tr>
              )}
            </tbody>

            <tfoot>
              <tr>
                <td colSpan={4} style={{ textAlign: "right", fontWeight: "bold" }}>
                  Totals:
                </td>
                <td>{sales.reduce((a, s) => a + safe(s.totalLitres), 0).toFixed(2)}</td>
                <td>{grandTotal.toFixed(2)}</td>
                <td>{totalReceivedFromSales.toFixed(2)}</td>
                <td>{totalCash.toFixed(2)}</td>
                <td>{totalUpi.toFixed(2)}</td>
                <td>{totalCard.toFixed(2)}</td>
                <td colSpan={2}></td>
              </tr>
            </tfoot>

          </table>
        </div>
      </div>


      {/* =====================================================
               MAIN SALE MODAL
      ======================================================*/}
      {modalOpen && (
        <div className={styles.modalBackdrop} onClick={handleBackdropClick}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>

            <div className={styles.modalHeader}>
              <h2>{editSale ? "✏️ Edit Sale Entry" : "➕ Add Sale Entry"}</h2>
              <button
                className={styles.closeBtn}
                onClick={() => setModalOpen(false)}
              >
                ✖
              </button>
            </div>

            <div className={styles.modalContent}>
              <div className={styles.form}>

                <label>Sale ID</label>
                <input value={saleId} disabled />

                <label>Shift</label>
                <select value={shift} onChange={(e) => setShift(e.target.value)}>
                  <option value="">Select Shift</option>
                  {shiftList.map((s) => (
                    <option key={s._id} value={s.shiftName}>
                      {s.shiftName} ({s.startTime} – {s.endTime})
                    </option>
                  ))}
                </select>

                <label>Machine</label>
                <select
                  value={machineNo}
                  onChange={(e) => setMachineNo(e.target.value)}
                >
                  <option value="">Select Machine</option>
                  {machines.map((m) => (
                    <option key={m._id} value={m.machineNo}>
                      {m.machineNo} – {m.machineName}
                    </option>
                  ))}
                </select>

                {/* -------- nozzle list -------- */}
                <label>Nozzles</label>
                <div className={styles.nozzleList}>
                  {selectedMachine ? (
                    selectedMachine.nozzles.map((n) => {
                      const ex = entries.find((e) => e.nozzleNo === n.nozzleNo);

                      return (
                        <div key={n.nozzleNo} className={styles.nozzleItem}>
                          <div>
                            <strong>{n.name || `Nozzle ${n.nozzleNo}`}</strong>
                            <div className={styles.nozzleMeta}>
                              #{n.nozzleNo} • {n.fuelType}
                            </div>
                          </div>

                          <div style={{ display: "flex", gap: 10 }}>
                            <button
                              className={styles.nozzleBtn}
                              onClick={() => {
                                if (ex) {
                                  setActiveNozzle(n);
                                  setNozzleOpening(ex.openingMeter);
                                  setNozzleClosing(ex.closingMeter);
                                  setNozzleTestFuel(ex.testFuel);
                                  setNozzleRate(ex.ratePerLitre);
                                  setNozzleAttendant(ex.attendant || "");
                                  setNozzleModalOpen(true);
                                } else {
                                  openNozzleModal(n);
                                }
                              }}
                            >
                              Nozzle Entry
                            </button>

                            {ex ? (
                              <div className={styles.entrySummary}>
                                <span>{ex.litres} L</span>
                                <span>₹{ex.amount}</span>
                                <button
                                  className={styles.smallDanger}
                                  onClick={() =>
                                    setEntries((prev) =>
                                      prev.filter((e) => e.nozzleNo !== n.nozzleNo)
                                    )
                                  }
                                >
                                  Remove
                                </button>
                              </div>
                            ) : (
                              <div className={styles.entryEmpty}>No entry</div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className={styles.noData}>
                      Select a machine to view nozzles
                    </div>
                  )}
                </div>

                <label>Totals</label>
                <div className={styles.summaryRow}>
                  <label>Total Litres</label>
                  <input value={totalLitres.toFixed(2)} readOnly />
                </div>

                <div className={styles.summaryRow}>
                  <label>Total Amount ₹</label>
                  <input value={totalAmount.toFixed(2)} readOnly />
                </div>


                {/* payments */}
                <label>Payments</label>
                <div className={styles.row}>
                  <div className={styles.col}>
                    <label>Cash</label>
                    <input
                      type="number"
                      value={cashAmount}
                      onChange={(e) => setCashAmount(safe(e.target.value))}
                    />
                  </div>
                  <div className={styles.col}>
                    <label>UPI</label>
                    <input
                      type="number"
                      value={upiAmount}
                      onChange={(e) => setUpiAmount(safe(e.target.value))}
                    />
                  </div>
                  <div className={styles.col}>
                    <label>Card</label>
                    <input
                      type="number"
                      value={cardAmount}
                      onChange={(e) => setCardAmount(safe(e.target.value))}
                    />
                  </div>
                </div>

                <div className={styles.row}>
                  <div className={styles.col}>
                    <label>Attendant</label>
                    <input
                      value={attendant}
                      onChange={(e) => setAttendant(e.target.value)}
                    />
                  </div>
                  <div className={styles.col}>
                    <label>Remarks</label>
                    <input
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                    />
                  </div>
                </div>

                <div
                  className={
                    amountsMatch(totalAmount, totalPayment)
                      ? styles.matchBox
                      : styles.mismatchBox
                  }
                >
                  {amountsMatch(totalAmount, totalPayment) ? (
                    <strong>✔ Amounts Match</strong>
                  ) : (
                    <strong>
                      ❌ Difference ₹ {(totalAmount - totalPayment).toFixed(2)}
                    </strong>
                  )}
                </div>

                <button className={styles.saveBtn} onClick={handleSave}>
                  💾 {editSale ? "Update" : "Save"}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ---------------- NOZZLE MODAL ---------------- */}
      {nozzleModalOpen && activeNozzle && (
        <div className={styles.modalBackdrop} onClick={handleBackdropClick}>
          <div
            className={styles.nozzleModal}
            onClick={(e) => e.stopPropagation()}
          >

            <div className={styles.modalHeader}>
              <h2>Nozzle — {activeNozzle.name}</h2>
              <button
                className={styles.closeBtn}
                onClick={() => setNozzleModalOpen(false)}
              >
                ✖
              </button>
            </div>

            <div className={styles.modalContent}>
              <div className={styles.form}>

                <div className={styles.summaryRow}>
                  <label>Fuel Type</label>
                  <input value={activeNozzle.fuelType} readOnly />
                </div>

                <div className={styles.summaryRow}>
                  <label>Rate per Litre ₹</label>
                  <input
                    type="number"
                    value={nozzleRate}
                    onChange={(e) => setNozzleRate(safe(e.target.value))}
                  />
                </div>

                <div className={styles.row}>
                  <div className={styles.col}>
                    <label>Opening Meter</label>
                    <input
                      type="number"
                      value={nozzleOpening}
                      onChange={(e) => setNozzleOpening(safe(e.target.value))}
                    />
                  </div>
                  <div className={styles.col}>
                    <label>Closing Meter</label>
                    <input
                      type="number"
                      value={nozzleClosing}
                      onChange={(e) => setNozzleClosing(safe(e.target.value))}
                    />
                  </div>
                </div>

                <div className={styles.summaryRow}>
                  <label>Test Fuel (Auto)</label>
                  <input value={nozzleTestFuel} readOnly />
                </div>

                <div className={styles.summaryRow}>
                  <label>Attendant</label>
                  <input
                    value={nozzleAttendant}
                    onChange={(e) => setNozzleAttendant(e.target.value)}
                  />
                </div>

                <div className={styles.summaryRow}>
                  <label>Preview Litres</label>
                  <input
                    value={Math.max(
                      0,
                      nozzleClosing - nozzleOpening - nozzleTestFuel
                    ).toFixed(2)}
                    readOnly
                  />
                </div>

                <div style={{ display: "flex", gap: 10 }}>
                  <button className={styles.saveBtn} onClick={addNozzleEntryToSale}>
                    Save Nozzle
                  </button>
                  <button
                    className={styles.cancelBtn}
                    onClick={() => setNozzleModalOpen(false)}
                  >
                    Cancel
                  </button>
                </div>

              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

/** ---------------- END OF FILE ---------------- */

