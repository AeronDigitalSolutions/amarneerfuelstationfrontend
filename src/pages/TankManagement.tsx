// TankManagement.tsx — Modal form + Filters (Date / Tank ID / Fuel) + Full-width table
import FullScreenLoader from "../component/FullScreenLoader";
// TankManagement.tsx
import { useState, useEffect } from "react";
import styles from "../style/tankmanagement.module.css";

type Chamber = {
  chamberName: string;
  fuelDensity: number | ""; // allow empty input while editing
};

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
  invoiceDensity?: number | "";
  chambers?: Chamber[];
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
    invoiceDensity: "",
    chambers: [],
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
     finally {
      setLoading(false); // hide loader when complete
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
     finally {
      setLoading(false); // hide loader when complete
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
     finally {
      setLoading(false); // hide loader when complete
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
      updated.invoiceDensity = "";
      updated.chambers = [];
    } else {
      const last = prevEntries[0];
      updated.openingStock = last.closingStock;

      setIsUpdating(true);
      setEditId(last._id || "");

      const startIso = last.dateTime || last.createdAt || "";
      const endIso = updated.dateTime;

      const sold = calculateSoldLitres(startIso, endIso, tm.fuelType);
      updated.soldQuantity = sold;

      // if returning to edit flow, preserve invoiceDensity/chambers if present
      updated.invoiceDensity = last.invoiceDensity ?? "";
      updated.chambers = Array.isArray(last.chambers)
        ? last.chambers.map((c: any) => ({
            chamberName: c.chamberName,
            fuelDensity: c.fuelDensity === "" || c.fuelDensity == null ? "" : Number(c.fuelDensity) || ""
          }))
        : [];
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

  // ------ chambers helpers ------
  const addChamber = () => {
    const next = (tank.chambers?.length ?? 0) + 1;
    const newChamber: Chamber = { chamberName: `Chamber ${next}`, fuelDensity: "" };
    setTank((prev) => ({ ...prev, chambers: [...(prev.chambers || []), newChamber] }));
  };

  const updateChamber = (index: number, field: keyof Chamber, value: string) => {
    setTank((prev) => {
      const copy = [...(prev.chambers || [])];
      const target = { ...(copy[index] || { chamberName: `Chamber ${index + 1}`, fuelDensity: "" }) };
      if (field === "fuelDensity") {
        target.fuelDensity = value === "" ? "" : Number(value);
      } else {
        target.chamberName = value;
      }
      copy[index] = target;
      return { ...prev, chambers: copy };
    });
  };

  const removeChamber = (index: number) => {
    setTank((prev) => {
      const copy = [...(prev.chambers || [])];
      copy.splice(index, 1);
      // renumber names
      const renumbered: Chamber[] = copy.map((c, i) => ({
        chamberName: c.chamberName || `Chamber ${i + 1}`,
        fuelDensity: c.fuelDensity === "" ? "" : Number(c.fuelDensity),
      }));
      return { ...prev, chambers: renumbered };
    });
  };

  // submit
  const handleSubmit = async () => {
    if (!tank.tankId) return alert("Select Tank ID");

    const payload: any = {
      ...tank,
      openingStock: num(tank.openingStock),
      quantityReceived: num(tank.quantityReceived),
      soldQuantity: num(tank.soldQuantity),
      lowStockAlertLevel: num(tank.lowStockAlertLevel),
      ratePerLitre: num(tank.ratePerLitre),
      closingStock: num(tank.closingStock),
      totalAmount: num(tank.totalAmount),
      invoiceDensity: tank.invoiceDensity === "" ? undefined : Number(tank.invoiceDensity),
      chambers: (tank.chambers || []).map((c) => ({
        chamberName: c.chamberName,
        fuelDensity: c.fuelDensity === "" ? 0 : Number(c.fuelDensity),
      })),
      dateTime: tank.dateTime,
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
     finally {
      setLoading(false); // hide loader when complete
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
      invoiceDensity: "",
      chambers: [],
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
    return toEpoch(t.createdAt || t.dateTime);
  };

  const filteredTanks = tanks.filter((t) => {
    if (filterTankId !== "All" && t.tankId !== filterTankId) return false;
    if (filterFuel !== "All" && t.productType !== filterFuel) return false;
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

  // if (loading) return <p>Loading...</p>;

  return (
    <>
    <FullScreenLoader loading={loading} />
    <div className={styles.container}>
      <h1>Fuel Tank Management</h1>

      {/* ADD NEW BUTTON */}
      <div className={styles.btn_tank}>
        <button className={styles.addButton} onClick={() => { resetForm(); setModalOpen(true); }}>
          Add Tank Entry ➕
        </button>
      </div>

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
            <h2>{isUpdating ? "🔄 Update Tank Entry" : "Add Tank Entry"}</h2>

            <button className={styles.closeBtn} onClick={() => setModalOpen(false)}>
              ✖
            </button>

            <div className={styles.formGrid}>
              <select name="tankId" value={tank.tankId} onChange={(e) => { handleChange(e); }}>
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

              {/* NEW: Invoice Density */}
              <input
                name="invoiceDensity"
                placeholder="Invoice Density"
                type="number"
                value={tank.invoiceDensity === "" ? "" : (tank.invoiceDensity as number)}
                onChange={(e) => {
                  const v = e.target.value;
                  setTank((prev) => ({ ...prev, invoiceDensity: v === "" ? "" : Number(v) }));
                }}
              />
            </div>

            {/* TESTING DENSITY / CHAMBERS (before remarks) */}
            <div style={{ marginTop: 12, padding: 12, border: "1px dashed #e6e6e6", borderRadius: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <strong>Testing Density</strong>
                <button className={styles.smallBtnPrimary} onClick={addChamber}>+ Add Chamber</button>
              </div>

              <div style={{ marginTop: 12 }}>
                {(tank.chambers || []).length === 0 ? (
                  <div style={{ color: "#666" }}>No chambers added</div>
                ) : (
                  (tank.chambers || []).map((c, i) => (
                    <div key={i} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
                      <input
                        value={c.chamberName}
                        onChange={(e) => updateChamber(i, "chamberName", e.target.value)}
                        style={{ minWidth: 160, padding: 8, borderRadius: 6, border: "1px solid #ccc" }}
                      />
                      <input
                        type="number"
                        value={c.fuelDensity === "" ? "" : String(c.fuelDensity)}
                        onChange={(e) => updateChamber(i, "fuelDensity", e.target.value)}
                        placeholder="Fuel Density"
                        style={{ width: 140, padding: 8, borderRadius: 6, border: "1px solid #ccc" }}
                      />
                      <button className={styles.smallBtn} onClick={() => removeChamber(i)}>Remove</button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Remarks (after chambers) */}
            <div style={{ marginTop: 12 }}>
              <input
                name="remarks"
                placeholder="Remarks"
                value={tank.remarks}
                onChange={handleChange}
                style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #ccc" }}
              />
            </div>

            <div className={styles.summaryBox} style={{ marginTop: 12 }}>
              <p>
                Closing Stock: <strong>{tank.closingStock} L</strong>
              </p>
              <p>
                Total Amount: <strong>₹{tank.totalAmount}</strong>
              </p>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button className={styles.saveButton} onClick={handleSubmit}>
                {isUpdating ? "🔄 Update Tank Entry" : "💾 Save Tank Entry"}
              </button>
              <button className={styles.smallBtn} onClick={() => { resetForm(); setModalOpen(false); }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TABLE */}
      <h2 className={styles.tank_records}>Tank Records</h2>
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
    </>
  );
}
