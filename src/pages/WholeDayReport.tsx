import { useEffect,  useState, type JSX } from "react";
import axios from "axios";
import styles from "../style/WholeDayReport.module.css";
import oil from "../assets/oil.png"
/* ================================
   WholeDayReport (Option B look) - simplified nozzle table (option A)
   - Uses selected date
   - Shifts: Day (05:00-23:00) and Night (23:00-05:00)
   - Fetches endpoints: /sales, /fueltest, /credit/transaction, /payments, /finance, /tanks
   - Defensive in presence/absence of fields
   ================================= */

const BASE_URL =
  import.meta.env.VITE_API_URL ||
  (window.location.hostname === "localhost"
    ? "http://localhost:5001/api"
    : "https://amarneerfuelstationbackend.onrender.com/api");

function fmtCurrency(n?: number | string) {
  const v = Number(n ?? 0) || 0;
  return `₹${v.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}
function fmtNum(n?: number | string) {
  const v = Number(n ?? 0) || 0;
  return v.toFixed(2);
}
function renderDate(iso?: string | null) {
  if (!iso) return "-";
  try {
    return new Date(iso).toLocaleString("en-IN");
  } catch {
    return iso;
  }
}

function todayInputValue() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function dateLabelFromInput(ymd: string) {
  const [year, month, day] = ymd.split("-").map(Number);
  if (!year || !month || !day) return "-";
  return new Date(year, month - 1, day).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function localMidnightFromInput(ymd: string) {
  const [year, month, day] = ymd.split("-").map(Number);
  return new Date(year, (month || 1) - 1, day || 1, 0, 0, 0, 0);
}

export default function WholeDayReport(): JSX.Element {
  const [loading, setLoading] = useState(false);
  const [sales, setSales] = useState<any[]>([]);
  const [fuelTests, setFuelTests] = useState<any[]>([]);
  const [creditTx, setCreditTx] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [finance, setFinance] = useState<any[]>([]);
  const [tanks, setTanks] = useState<any[]>([]);

  const [selectedShift, setSelectedShift] = useState<"day" | "night">("day");
  const [selectedDate, setSelectedDate] = useState<string>(todayInputValue());

  // const today = useMemo(() => new Date(), []);
  // const todayStr = useMemo(() => today.toLocaleDateString("en-IN"), [today]);

  useEffect(() => {
    void fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [
        rSales,
        rFuelTest,
        rCredit,
        rPayments,
        rFinance,
        rTanks,
      ] = await Promise.all([
        axios.get(`${BASE_URL}/sales`),
        axios.get(`${BASE_URL}/fueltest`),
        axios.get(`${BASE_URL}/credit/transaction`),
        axios.get(`${BASE_URL}/payments`),
        axios.get(`${BASE_URL}/finance`),
        axios.get(`${BASE_URL}/tanks`),
      ]);

      setSales(Array.isArray(rSales.data) ? rSales.data : []);
      setFuelTests(Array.isArray(rFuelTest.data) ? rFuelTest.data : []);
      setCreditTx(Array.isArray(rCredit.data) ? rCredit.data : []);
      setPayments(Array.isArray(rPayments.data) ? rPayments.data : []);
      setFinance(Array.isArray(rFinance.data) ? rFinance.data : []);
      setTanks(Array.isArray(rTanks.data) ? rTanks.data : []);
    } catch (err) {
      console.error("Failed to fetch report data:", err);
    } finally {
      setLoading(false);
    }
  };

  /* ---------- SHIFT RANGE ---------- */
  const getShiftRange = (shift: "day" | "night", ymd: string) => {
    const base = localMidnightFromInput(ymd);

    const toISO = (dt: Date) => dt.toISOString();

    if (shift === "day") {
      const start = new Date(base);
      start.setHours(5, 0, 0, 0);
      const end = new Date(base);
      end.setHours(23, 0, 0, 0);
      return { start: toISO(start), end: toISO(end) };
    } else {
      const start = new Date(base);
      start.setHours(23, 0, 0, 0);
      const end = new Date(base);
      end.setDate(end.getDate() + 1);
      end.setHours(5, 0, 0, 0);
      return { start: toISO(start), end: toISO(end) };
    }
  };

  const shiftRange = getShiftRange(selectedShift, selectedDate);
  const inRange = (iso?: string | null) => {
    if (!iso) return false;
    const t = new Date(iso).getTime();
    const s = new Date(shiftRange.start).getTime();
    const e = new Date(shiftRange.end).getTime();
    return t >= s && t < e;
  };

  /* ---------- FILTERED SETS ---------- */
  const filteredSales = sales.filter((s) => inRange(s.createdAt ?? s.date));
  const filteredFuelTests = fuelTests.filter((f) =>
    inRange(f.createdAt ?? f.date ?? f.timestamp)
  );
  const filteredPayments = payments.filter((p) =>
    inRange(p.createdAt ?? p.date)
  );
  const filteredFinance = finance.filter((f) =>
    inRange(f.createdAt ?? f.autoTimestamp ?? f.userTimestamp)
  );
  const filteredTanks = tanks.filter((t) => inRange(t.createdAt ?? t.dateTime));
  const filteredCredit = creditTx.filter((c) => inRange(c.date ?? c.createdAt));

  /* ---------- NOZZLE SUMMARY (aggregate) ---------- */
  type NozzleAgg = {
    key: string;
    nozzleName?: string;
    fuelType?: string;
    opening?: number | null;
    closing?: number | null;
    testFuel: number;
    litres: number;
    rate?: number | null;
    amount: number;
  };
  const nozzleMap = new Map<string, NozzleAgg>();

  filteredSales.forEach((sale) => {
    (sale.entries || []).forEach((e: any) => {
      const key = e.nozzleName ? String(e.nozzleName) : `nozzle-${e.nozzleNo}`;
      const existing = nozzleMap.get(key);
      const opening = typeof e.openingMeter === "number" ? e.openingMeter : null;
      const closing = typeof e.closingMeter === "number" ? e.closingMeter : null;
      const testFuel = Number(e.testFuel ?? 0);
      const litres = Number(e.litres ?? 0);
      const amount = Number(e.amount ?? (Number(e.ratePerLitre ?? 0) * litres));

      if (!existing) {
        nozzleMap.set(key, {
          key,
          nozzleName: e.nozzleName,
          fuelType: e.fuelType,
          opening,
          closing,
          testFuel,
          litres,
          rate: typeof e.ratePerLitre === "number" ? e.ratePerLitre : null,
          amount,
        });
      } else {
        existing.opening =
          existing.opening === null
            ? opening
            : opening !== null
            ? Math.min(existing.opening!, opening)
            : existing.opening;
        existing.closing =
          existing.closing === null
            ? closing
            : closing !== null
            ? Math.max(existing.closing!, closing)
            : existing.closing;
        existing.testFuel += testFuel;
        existing.litres = Number((existing.litres + litres).toFixed(2));
        existing.amount = Number((existing.amount + amount).toFixed(2));
        if (!existing.rate && typeof e.ratePerLitre === "number") existing.rate = e.ratePerLitre;
        nozzleMap.set(key, existing);
      }
    });
  });

  filteredFuelTests.forEach((t) => {
    const key = t.nozzleName ? String(t.nozzleName) : `nozzle-${t.nozzleNo}`;
    const existing = nozzleMap.get(key);
    const liters = Number(t.liters ?? 0);
    if (existing) {
      existing.testFuel += liters;
      nozzleMap.set(key, existing);
    } else {
      nozzleMap.set(key, {
        key,
        nozzleName: t.nozzleName,
        fuelType: t.fuelType,
        opening: null,
        closing: null,
        testFuel: liters,
        litres: 0,
        rate: null,
        amount: 0,
      });
    }
  });

  const nozzleSummary = Array.from(nozzleMap.values());

  /* ---------- FUEL BY TYPE ---------- */
  const fuelMap = new Map<string, { litres: number; amount: number }>();
  filteredSales.forEach((s) => {
    (s.entries || []).forEach((e: any) => {
      const fuel = e.fuelType ?? "Unknown";
      const cur = fuelMap.get(fuel) || { litres: 0, amount: 0 };
      cur.litres += Number(e.litres ?? 0);
      cur.amount += Number(e.amount ?? (Number(e.ratePerLitre ?? 0) * Number(e.litres ?? 0)));
      fuelMap.set(fuel, cur);
    });
  });

  /* ---------- MONEY & TOTALS ---------- */
  const totalCashFromSales = filteredSales.reduce((a, s) => a + Number(s.cashAmount ?? 0), 0);
  const totalUpiFromSales = filteredSales.reduce((a, s) => a + Number(s.upiAmount ?? 0), 0);
  const totalCardFromSales = filteredSales.reduce((a, s) => a + Number(s.cardAmount ?? 0), 0);
  const fuelSaleTotal = filteredSales.reduce((a, s) => a + Number(s.totalAmount ?? 0), 0);

  const paymentsByMode = filteredPayments.reduce((acc: Record<string, number>, p) => {
    const mode = (p.mode ?? p.paymentMode ?? "OTHER").toString().toUpperCase();
    acc[mode] = (acc[mode] || 0) + Number(p.amount ?? 0);
    return acc;
  }, {} as Record<string, number>);

  const creditSaleTotal = filteredCredit
    .filter((c) => String(c.type ?? "").toLowerCase() === "sale")
    .reduce((a, c) => a + Number(c.amount ?? 0), 0);

  const creditCollection = filteredCredit
    .filter((c) => {
      const t = String(c.type ?? "").toLowerCase();
      return t === "payment" || t === "receipt";
    })
    .reduce((a, c) => a + Number(c.amount ?? 0), 0);

  const totalCollection =
    totalCashFromSales +
    totalUpiFromSales +
    totalCardFromSales +
    creditCollection +
    Object.values(paymentsByMode).reduce((a, b) => a + b, 0);

  const totalSaleA = fuelSaleTotal + creditSaleTotal;
  const shortExcess = Number((totalCollection - totalSaleA).toFixed(2));

  // daily expenses detection
  const dailyExpenses = filteredFinance.filter((f: any) => {
    const cat = String(f.category ?? "").toLowerCase();
    return cat.includes("daily") || cat.includes("expense");
  });
  const totalDailyExpenses = dailyExpenses.reduce((a: number, f: any) => a + Number(f.amount ?? f.debit ?? 0), 0);

  // Grand total requested (example: A + expenses)
  const grandTotal = Number((totalSaleA + totalDailyExpenses).toFixed(2));

  /* ---------- RENDER ---------- */
  return (
    <div className={`${styles.container} module-page`}>
      <header className={styles.header}>
  {/* LEFT SECTION — LOGO + DETAILS */}
  <div className={styles.headerLeft} style={{ display: "flex", gap: "16px", alignItems: "center" }}>
    
    {/* INDIAN OIL LOGO */}
    <img
      src={oil}
      alt="Indian Oil Logo"
      style={{ width: "70px", height: "70px", objectFit: "contain" }}
    />

    <div>
      {/* PETROL PUMP NAME */}
      <h1 className={styles.title} style={{ marginBottom: "4px" }}>
        Generate Report
      </h1>

      {/* SUB DETAILS */}
      <div className={styles.metaRow} style={{ flexDirection: "column", gap: "2px" }}>
        <div><strong>Station:</strong> Amar Neer Fuel Station</div>
        <div><strong>Report Date:</strong> {dateLabelFromInput(selectedDate)}</div>
        <div><strong>View:</strong> {selectedShift === "day" ? "Day Shift (05:00-23:00)" : "Night Shift (23:00-05:00)"}</div>
        <div><strong>Address:</strong> Kanpur</div>
        <div><strong>Phone:</strong> ___________</div>
        <div><strong>GSTIN:</strong> 09ABCDE1234F1Z5</div>
        <div><strong>RO Code:</strong> 123456</div>
        <div><strong>License No:</strong> UP-FS-2025-00123</div>
        <div><strong>Proprietor:</strong></div>
        <div><strong>Email:</strong> amarneerfuel@gmail.com</div>
      </div>
    </div>

  </div>

  {/* RIGHT SECTION — SHIFT BUTTONS */}
  <div className={styles.headerRight}>
    <label className={styles.dateFilter}>
      <span>Select Date</span>
      <input
        type="date"
        value={selectedDate}
        onChange={(event) => setSelectedDate(event.target.value || todayInputValue())}
      />
    </label>
    <div className={styles.shiftButtons}>
      <button
        className={`${styles.shiftBtn} ${selectedShift === "day" ? styles.active : ""}`}
        onClick={() => setSelectedShift("day")}
      >
        Day Shift
      </button>

      <button
        className={`${styles.shiftBtn} ${selectedShift === "night" ? styles.active : ""}`}
        onClick={() => setSelectedShift("night")}
      >
        Night Shift
      </button>

      <button className={styles.refreshBtn} onClick={fetchAll}>⟳ Refresh</button>
      <button className={styles.printBtn} onClick={() => window.print()}>🖨 Print</button>
    </div>
  </div>
</header>


      {loading ? (
        <div className={styles.loading}>Loading report...</div>
      ) : (
        <>
          <section className={styles.row}>
            <div className={styles.cardLarge}>
              <div className={styles.cardHeader}>Tank Summary</div>
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Sl</th>
                      <th>Tank</th>
                      <th>Fuel</th>
                      <th>Opening</th>
                      <th>Received</th>
                      <th>Sold</th>
                      <th>Closing</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTanks.length ? (
                      filteredTanks.map((t, i) => (
                        <tr key={t._id ?? i}>
                          <td>{i + 1}</td>
                          <td>{t.tankId ?? "-"}</td>
                          <td>{t.productType ?? "-"}</td>
                          <td>{t.openingStock ?? "-"}</td>
                          <td>{t.quantityReceived ?? "-"}</td>
                          <td>{t.soldQuantity ?? "-"}</td>
                          <td>{t.closingStock ?? "-"}</td>
                          <td>{fmtCurrency(t.totalAmount)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8} className={styles.emptyCell}>No tank records</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className={styles.cardSmall}>
              <div className={styles.cardHeader}>Money & Collections</div>
              <div className={styles.moneyGrid}>
                <div className={styles.moneyItem}>
                  <div className={styles.moneyLabel}>Cash (Sales)</div>
                  <div className={styles.moneyValue}>{fmtCurrency(totalCashFromSales)}</div>
                </div>
                <div className={styles.moneyItem}>
                  <div className={styles.moneyLabel}>UPI (Sales)</div>
                  <div className={styles.moneyValue}>{fmtCurrency(totalUpiFromSales)}</div>
                </div>
                <div className={styles.moneyItem}>
                  <div className={styles.moneyLabel}>Card (Sales)</div>
                  <div className={styles.moneyValue}>{fmtCurrency(totalCardFromSales)}</div>
                </div>
                <div className={styles.moneyItem}>
                  <div className={styles.moneyLabel}>Payments (Live)</div>
                  <div className={styles.moneyValue}>{fmtCurrency(Object.values(paymentsByMode).reduce((a,b)=>a+b,0))}</div>
                </div>
                <div className={styles.moneyItem}>
                  <div className={styles.moneyLabel}>Credit Collected</div>
                  <div className={styles.moneyValue}>{fmtCurrency(creditCollection)}</div>
                </div>
                <div className={`${styles.moneyItem} ${styles.highlight}`}>
                  <div className={styles.moneyLabel}>Total Collection (B)</div>
                  <div className={styles.moneyValue}>{fmtCurrency(totalCollection)}</div>
                </div>
              </div>
            </div>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Nozzle Summary</h2>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Nozzle</th>
                    <th>Fuel</th>
                    <th>Opening</th>
                    <th>Closing</th>
                    <th>Testing</th>
                    <th>Litres</th>
                    <th>Rate</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {nozzleSummary.length ? (
                    nozzleSummary.map((n, i) => (
                      <tr key={i}>
                        <td>{n.nozzleName ?? n.key}</td>
                        <td>{n.fuelType ?? "-"}</td>
                        <td>{n.opening ?? "-"}</td>
                        <td>{n.closing ?? "-"}</td>
                        <td>{fmtNum(n.testFuel)}</td>
                        <td>{fmtNum(n.litres)}</td>
                        <td>{n.rate ? fmtCurrency(n.rate) : "-"}</td>
                        <td>{fmtCurrency(n.amount)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan={8} className={styles.emptyCell}>No nozzle data for this shift</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Fuel Sale Detail (by Fuel Type)</h2>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead><tr><th>Fuel</th><th>Qty (Ltr)</th><th>Amount</th></tr></thead>
                <tbody>
                  {Array.from(fuelMap.entries()).length ? (
                    Array.from(fuelMap.entries()).map(([fuel, v]) => (
                      <tr key={fuel}>
                        <td>{fuel}</td>
                        <td>{fmtNum(v.litres)}</td>
                        <td>{fmtCurrency(v.amount)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan={3} className={styles.emptyCell}>No fuel sales in this shift</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Credit Line Transactions</h2>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr><th>Date / Time</th><th>Account</th><th>Type</th><th>Amount</th><th>Rate</th><th>Volume</th></tr>
                </thead>
                <tbody>
                  {filteredCredit.length ? (
                    filteredCredit.map((c, i) => (
                      <tr key={i}>
                        <td>{renderDate(c.date ?? c.createdAt)}</td>
                        <td>{c.accountName ?? c.accountId ?? "-"}</td>
                        <td>{c.type ?? "-"}</td>
                        <td>{fmtCurrency(c.amount)}</td>
                        <td>{c.rate ?? "-"}</td>
                        <td>{c.volume ?? "-"}</td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan={6} className={styles.emptyCell}>No credit entries</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Daily Expenses</h2>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead><tr><th>Category</th><th>Description</th><th>Amount</th><th>Time</th></tr></thead>
                <tbody>
                  {dailyExpenses.length ? (
                    dailyExpenses.map((d: any, i: number) => (
                      <tr key={i}>
                        <td>{d.category ?? "-"}</td>
                        <td>{d.description ?? "-"}</td>
                        <td>{fmtCurrency(d.amount ?? d.debit)}</td>
                        <td>{renderDate(d.userTimestamp ?? d.autoTimestamp ?? d.createdAt)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan={4} className={styles.emptyCell}>No daily expenses</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className={styles.totalRow}>
              <strong>Total Expenses:</strong> <span>{fmtCurrency(totalDailyExpenses)}</span>
            </div>
          </section>

          <section className={styles.sectionSummary}>
            <div className={styles.summaryGrid}>
              <div>
                <div className={styles.summaryLine}><span>Fuel Sale (A):</span><span>{fmtCurrency(fuelSaleTotal)}</span></div>
                <div className={styles.summaryLine}><span>Credit Sale:</span><span>{fmtCurrency(creditSaleTotal)}</span></div>
                <div className={`${styles.summaryLine} ${styles.big}`}><span>Grand Total Sale (A):</span><span>{fmtCurrency(totalSaleA)}</span></div>
              </div>

              <div>
                <div className={styles.summaryLine}><span>Total Collection (B):</span><span>{fmtCurrency(totalCollection)}</span></div>
                <div className={styles.summaryLine}><span>Daily Expenses:</span><span>{fmtCurrency(totalDailyExpenses)}</span></div>
                <div className={`${styles.summaryLine} ${styles.big}`}><span>Credit (B - A):</span><span className={shortExcess < 0 ? styles.negative : styles.positive}>{fmtCurrency(shortExcess)}</span></div>
              </div>

              <div>
                <div className={styles.summaryLine}><span>Grand Total (A + Expenses):</span><span>{fmtCurrency(grandTotal)}</span></div>
                <div style={{ height: 8 }} />
                <div className={styles.qrPlaceholder} />
              </div>
            </div>

            <div className={styles.signatures}>
              <div className={styles.signatureBox}>
                <div className={styles.sigLine} />
                <div>Manager Signature</div>
              </div>
              <div className={styles.signatureBox}>
                <div className={styles.sigLine} />
                <div>Cashier Signature</div>
              </div>
              <div className={styles.signatureBox}>
                <div className={styles.sigLine} />
                <div>Attendant Signature</div>
              </div>
            </div>
          </section>

          <footer className={styles.footer}>
            <div>Report generated: {new Date().toLocaleString("en-IN")}</div>
            <div>Note: Aggregations calculated client-side from API data</div>
          </footer>
        </>
      )}
    </div>
  );
}
