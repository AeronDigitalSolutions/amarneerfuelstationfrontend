// TankManagement.tsx — Modal form + Filters (Date / Tank ID / Fuel) + Full-width table
import { useState, useEffect } from "react";
import styles from "../style/tankmanagement.module.css";

type Tank = {
  _id?: string;
  tankId: string;
  productType: string;
  capacity: number;
  openingStock: number | "";
  quantityReceived: number | "";
  soldQuantity: number | "";
  lowStockAlertLevel: number | "";
  ratePerLitre: number | "";
  supplierName: string;
  tankerReceiptNo: string;
  receivedBy: string;
  remarks: string;
  closingStock: number;
  totalAmount: number;
  dateTime?: string;
  createdAt?: string;
};

type TankMaster = {
  _id: string;
  tankId: string;
  fuelType: string;
  capacity: number;
};

type Sale = {
  _id?: string;
  productType?: string;
  litresSold?: number;
  createdAt?: string;
  date?: string;
};

const BASE_URL =
  import.meta.env.VITE_API_URL ||
  (window.location.hostname === "localhost"
    ? "http://localhost:5000/api"
    : "https://amarneerfuelstationbackend.onrender.com/api");

export default function TankManagement() {
  const [tankMasters, setTankMasters] = useState<TankMaster[]>([]);
  const [tanks, setTanks] = useState<Tank[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);

  const [isUpdating, setIsUpdating] = useState(false);
  const [editId, setEditId] = useState("");

  const [tank, setTank] = useState<Tank>({
    tankId: "",
    productType: "",
    capacity: 0,
    openingStock: "",
    quantityReceived: "",
    soldQuantity: "",
    lowStockAlertLevel: "",
    ratePerLitre: "",
    supplierName: "",
    tankerReceiptNo: "",
    receivedBy: "",
    remarks: "",
    closingStock: 0,
    totalAmount: 0,
    dateTime: "",
  });

  // ---- Filters state (placed between Add button and table) ----
  const [filterFrom, setFilterFrom] = useState<string>("");
  const [filterTo, setFilterTo] = useState<string>("");
  const [filterTankId, setFilterTankId] = useState<string>("All");
  const [filterFuel, setFilterFuel] = useState<string>("All");

  // Fetchers
  const fetchTankMasters = async () => {
    try {
      const res = await fetch(`${BASE_URL}/tank-master`);
      const data = await res.json();
      setTankMasters(data);
    } catch (err) {
      console.error("Failed to fetch tank master:", err);
    }
  };

  const fetchTanks = async () => {
    try {
      const res = await fetch(`${BASE_URL}/tanks`);
      const data = await res.json();
      data.sort(
        (a: Tank, b: Tank) =>
          new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );
      setTanks(data);
    } catch (err) {
      console.error("Failed to fetch tanks:", err);
    }
  };

  const fetchSales = async () => {
    try {
      const res = await fetch(`${BASE_URL}/sales`);
      const data = await res.json();
      setSales(data);
    } catch (err) {
      console.error("Failed to fetch sales:", err);
    }
  };

  useEffect(() => {
    void (async () => {
      await Promise.all([fetchTankMasters(), fetchTanks(), fetchSales()]);
      setLoading(false);
    })();
  }, []);

  const num = (n: any) => (isNaN(parseFloat(n)) ? 0 : parseFloat(n));

  const toEpoch = (d?: string) => {
    if (!d) return NaN;
    const parsed = Date.parse(d);
    return isNaN(parsed) ? NaN : parsed;
  };

  const calculateSoldLitres = (fromIso: string, toIso: string, product: string) => {
    if (!fromIso || !toIso || !product) return 0;

    const fromMs = toEpoch(fromIso);
    const toMs = toEpoch(toIso);
    if (isNaN(fromMs) || isNaN(toMs)) return 0;

    const total = sales
      .filter((s) => {
        const saleProduct = (s.productType || "").toString();
        const sameProduct =
          saleProduct.trim().toLowerCase() === product.trim().toLowerCase();
        const saleTime = toEpoch(s.createdAt || s.date);
        return sameProduct && saleTime >= fromMs && saleTime <= toMs;
      })
      .reduce((acc, s) => acc + (Number(s.litresSold || 0)), 0);

    return Number(total);
  };

  // Auto-fill when tankId change
  useEffect(() => {
    if (!tank.tankId) return;

    const tm = tankMasters.find((t) => t.tankId === tank.tankId);
    if (!tm) return;

    const updated: Tank = { ...tank };
    updated.productType = tm.fuelType;
    updated.capacity = tm.capacity;

    const nowIso = new Date().toISOString();
    updated.dateTime = nowIso;

    const prevEntries = tanks
      .filter((t) => t.tankId === tm.tankId)
      .sort(
        (a, b) =>
          new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );

    if (prevEntries.length === 0) {
      updated.openingStock = "";
      updated.soldQuantity = "";
      setIsUpdating(false);
      setEditId("");
    } else {
      const last = prevEntries[0];
      updated.openingStock = last.closingStock;

      setIsUpdating(true);
      setEditId(last._id || "");

      const startIso = last.dateTime || last.createdAt || "";
      const endIso = updated.dateTime;

      const sold = calculateSoldLitres(startIso, endIso, tm.fuelType);
      updated.soldQuantity = sold;
    }

    setTank(updated);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tank.tankId, tankMasters, tanks, sales]);

  // Input handler
  const handleChange = (e: any) => {
    const { name, value } = e.target;
    const updated: any = { ...tank, [name]: value };

    updated.closingStock =
      num(updated.openingStock) +
      num(updated.quantityReceived) -
      num(updated.soldQuantity);

    updated.totalAmount = num(updated.quantityReceived) * num(updated.ratePerLitre);

    setTank(updated);
  };

  const handleSubmit = async () => {
    if (!tank.tankId) return alert("Select Tank ID");

    const payload = {
      ...tank,
      dateTime: tank.dateTime,
      openingStock: num(tank.openingStock),
      quantityReceived: num(tank.quantityReceived),
      soldQuantity: num(tank.soldQuantity),
      lowStockAlertLevel: num(tank.lowStockAlertLevel),
      ratePerLitre: num(tank.ratePerLitre),
      closingStock: num(tank.closingStock),
      totalAmount: num(tank.totalAmount),
    };

    try {
      let res: Response;
      if (isUpdating && editId) {
        res = await fetch(`${BASE_URL}/tanks/${editId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(`${BASE_URL}/tanks`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (res.ok) {
        alert(isUpdating ? "Tank updated!" : "Tank saved!");
        await Promise.all([fetchTanks(), fetchSales()]);
        resetForm();
        setModalOpen(false);
      } else {
        const txt = await res.text();
        console.error("Save failed:", res.status, txt);
        alert("Error saving tank! See console.");
      }
    } catch (err) {
      console.error("Error:", err);
      alert("Save error!");
    }
  };

  const resetForm = () => {
    setTank({
      tankId: "",
      productType: "",
      capacity: 0,
      openingStock: "",
      quantityReceived: "",
      soldQuantity: "",
      lowStockAlertLevel: "",
      ratePerLitre: "",
      supplierName: "",
      tankerReceiptNo: "",
      receivedBy: "",
      remarks: "",
      closingStock: 0,
      totalAmount: 0,
      dateTime: "",
    });

    setIsUpdating(false);
    setEditId("");
  };

  // ---- Filter helpers ----
  const startOfDayMs = (dateStr: string) => {
    if (!dateStr) return NaN;
    const d = new Date(dateStr + "T00:00:00");
    return d.getTime();
  };
  const endOfDayMs = (dateStr: string) => {
    if (!dateStr) return NaN;
    const d = new Date(dateStr + "T23:59:59.999");
    return d.getTime();
  };

  const getTankTimestamp = (t: Tank) => {
    // prefer createdAt then dateTime
    return toEpoch(t.createdAt || t.dateTime);
  };

  const filteredTanks = tanks.filter((t) => {
    // Tank ID filter
    if (filterTankId !== "All" && t.tankId !== filterTankId) return false;

    // Fuel filter
    if (filterFuel !== "All" && t.productType !== filterFuel) return false;

    // Date filter
    if (filterFrom || filterTo) {
      const ts = getTankTimestamp(t);
      if (isNaN(ts)) return false;
      if (filterFrom) {
        const fromMs = startOfDayMs(filterFrom);
        if (!isNaN(fromMs) && ts < fromMs) return false;
      }
      if (filterTo) {
        const toMs = endOfDayMs(filterTo);
        if (!isNaN(toMs) && ts > toMs) return false;
      }
    }

    return true;
  });

  if (loading) return <p>Loading...</p>;

  return (
    <div className={styles.container}>
      <h1>🛢️ Fuel Tank Management</h1>

      {/* ADD NEW BUTTON */}
      <button className={styles.addButton} onClick={() => setModalOpen(true)}>
        ➕ Add Tank Entry
      </button>

      {/* ===== FILTER BAR (between Add button and table) ===== */}
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
          <label className={styles.filterLabel}>Tank ID</label>
          <select
            className={styles.filterInput}
            value={filterTankId}
            onChange={(e) => setFilterTankId(e.target.value)}
          >
            <option value="All">All</option>
            {tankMasters.map((tm) => (
              <option key={tm._id} value={tm.tankId}>
                {tm.tankId}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Fuel</label>
          <select
            className={styles.filterInput}
            value={filterFuel}
            onChange={(e) => setFilterFuel(e.target.value)}
          >
            <option value="All">All</option>
            {/* derive fuel types from master list to keep list consistent */}
            {Array.from(new Set(tankMasters.map((m) => m.fuelType))).map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.filterGroupButtons}>
          <button
            className={styles.smallBtn}
            onClick={() => {
              setFilterFrom("");
              setFilterTo("");
              setFilterTankId("All");
              setFilterFuel("All");
            }}
          >
            Clear
          </button>
        </div>
      </div>

      {/* ===== MODAL (closes when clicking outside) ===== */}
      {modalOpen && (
        <div
          className={styles.modalOverlay}
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalOpen(false);
          }}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2>{isUpdating ? "🔄 Update Tank Entry" : "➕ Add Tank Entry"}</h2>

            <button className={styles.closeBtn} onClick={() => setModalOpen(false)}>
              ✖
            </button>

            <div className={styles.formGrid}>
              <select name="tankId" value={tank.tankId} onChange={handleChange}>
                <option value="">Select Tank ID</option>
                {tankMasters.map((t) => (
                  <option key={t._id} value={t.tankId}>
                    {t.tankId}
                  </option>
                ))}
              </select>

              <input placeholder="Fuel Type" value={tank.productType} readOnly />
              <input placeholder="Capacity" value={tank.capacity} readOnly />
              <input placeholder="Date & Time" value={tank.dateTime} readOnly />

              <input
                name="openingStock"
                type="number"
                placeholder="Opening Stock"
                value={tank.openingStock}
                readOnly
              />

              <input
                name="quantityReceived"
                type="number"
                placeholder="Received (L)"
                value={tank.quantityReceived}
                onChange={handleChange}
              />

              <input
                name="soldQuantity"
                type="number"
                placeholder="Sold (L)"
                value={tank.soldQuantity}
                readOnly
              />

              <input
                name="lowStockAlertLevel"
                type="number"
                placeholder="Low Stock Alert"
                value={tank.lowStockAlertLevel}
                onChange={handleChange}
              />

              <input
                name="ratePerLitre"
                type="number"
                placeholder="Rate Per Litre"
                value={tank.ratePerLitre}
                onChange={handleChange}
              />

              <input
                name="supplierName"
                placeholder="Supplier Name"
                value={tank.supplierName}
                onChange={handleChange}
              />

              <input
                name="tankerReceiptNo"
                placeholder="Tanker Receipt No"
                value={tank.tankerReceiptNo}
                onChange={handleChange}
              />

              <input
                name="receivedBy"
                placeholder="Received By"
                value={tank.receivedBy}
                onChange={handleChange}
              />

              <input
                name="remarks"
                placeholder="Remarks"
                value={tank.remarks}
                onChange={handleChange}
              />
            </div>

            <div className={styles.summaryBox}>
              <p>
                Closing Stock: <strong>{tank.closingStock} L</strong>
              </p>
              <p>
                Total Amount: <strong>₹{tank.totalAmount}</strong>
              </p>
            </div>

            <button className={styles.saveButton} onClick={handleSubmit}>
              {isUpdating ? "🔄 Update Tank Entry" : "💾 Save Tank Entry"}
            </button>
          </div>
        </div>
      )}

      {/* TABLE */}
      <h2>📊 Tank Records</h2>
      <div className={styles.tableWrapper}>
        <table className={styles.table} role="table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Tank ID</th>
              <th>Fuel</th>
              <th>Capacity</th>
              <th>Closing Stock</th>
              <th>Low Alert</th>
              <th>Supplier</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {filteredTanks.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: "center", padding: "18px" }}>
                  No records found
                </td>
              </tr>
            ) : (
              filteredTanks.map((t, idx) => (
                <tr key={t._id ?? idx} className={idx % 2 === 0 ? styles.rowEven : styles.rowOdd}>
                  <td>{t.createdAt ? new Date(t.createdAt).toLocaleString("en-IN") : "-"}</td>
                  <td>{t.tankId}</td>
                  <td>{t.productType}</td>
                  <td>{t.capacity}</td>
                  <td>{t.closingStock}</td>
                  <td>{t.lowStockAlertLevel}</td>
                  <td>{t.supplierName}</td>
                  <td>₹{t.totalAmount}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
