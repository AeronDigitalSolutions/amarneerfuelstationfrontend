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
  dateTime?: string; // stored as ISO string now
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
  const [sales, setSales] = useState<Sale[]>([]); // we fetch sales here for calculation

  const [isUpdating, setIsUpdating] = useState(false); // update mode
  const [editId, setEditId] = useState<string>("");

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

  const [loading, setLoading] = useState(true);

  // fetch helpers
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
      // ensure sorted newest first (server may already sort, but be safe)
      data.sort((a: Tank, b: Tank) => (new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()));
      setTanks(data);
    } catch (err) {
      console.error("Failed to fetch tanks:", err);
    }
  };

  const fetchSales = async () => {
    try {
      const res = await fetch(`${BASE_URL}/sales`);
      const data = await res.json();
      // ensure sorted by createdAt asc or desc doesn't matter for sum, but keep
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

  // helpers for robust time parsing: accept createdAt (ISO) or date fields
  const toEpoch = (d?: string) => {
    if (!d) return NaN;
    const parsed = Date.parse(d);
    if (!isNaN(parsed)) return parsed;
    // fallback try replacing locale separators -> attempt
    try {
      return new Date(d).getTime();
    } catch {
      return NaN;
    }
  };

  // calculate sold litres between two ISO timestamps for specific product type
  const calculateSoldLitres = (fromIso: string, toIso: string, product: string) => {
    if (!fromIso || !toIso || !product) return 0;
    const fromMs = toEpoch(fromIso);
    const toMs = toEpoch(toIso);
    if (isNaN(fromMs) || isNaN(toMs)) return 0;

    const total = sales
      .filter((s) => {
        const saleProduct = (s.productType || s as any).toString?.() || "";
        // product match case-insensitive (trim)
        const sameProduct = saleProduct.trim().toLowerCase() === product.trim().toLowerCase();

        const saleTime = toEpoch(s.createdAt || s.date);
        if (isNaN(saleTime)) return false;
        // include sales where saleTime is >= fromMs and <= toMs
        return sameProduct && saleTime >= fromMs && saleTime <= toMs;
      })
      .reduce((acc, s) => acc + (Number(s.litresSold || 0)), 0);

    return Number(total);
  };

  // When tankId (select) changes -> auto-fill and compute soldQuantity
  useEffect(() => {
    if (!tank.tankId) return;

    const tm = tankMasters.find((t) => t.tankId === tank.tankId);
    if (!tm) {
      // clear autofills if master not found
      setTank(prev => ({ ...prev, productType: "", capacity: 0 }));
      setIsUpdating(false);
      setEditId("");
      return;
    }

    // prepare updated object
    const updated: Tank = { ...tank };

    // autopopulate master fields
    updated.productType = tm.fuelType;
    updated.capacity = tm.capacity;

    // set dateTime as ISO string for robust comparisons
    const nowIso = new Date().toISOString();
    updated.dateTime = nowIso;

    // find previous entries for this tank (ensure sorted newest first)
    const previousEntries = tanks
      .filter((t) => t.tankId === tm.tankId)
      .sort((a, b) => (new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()));

    if (previousEntries.length === 0) {
      // first-time entry: openingStock left blank for user
      updated.openingStock = "";
      updated.soldQuantity = "";
      setIsUpdating(false);
      setEditId("");
    } else {
      // take latest previous entry
      const last = previousEntries[0];

      // openingStock becomes last.closingStock
      updated.openingStock = last.closingStock;

      // we're in update mode: capture id to update
      setIsUpdating(true);
      setEditId(last._id || "");

      // determine start timestamp:
      // prefer last.dateTime (ISO if stored), fallback to last.createdAt
      const startIso = last.dateTime || last.createdAt || "";
      const endIso = updated.dateTime || nowIso;

      // compute sold litres from sales between startIso and endIso matching product
      const sold = calculateSoldLitres(startIso, endIso, tm.fuelType);

      // set soldQuantity (number)
      updated.soldQuantity = sold;
    }

    setTank(updated);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tank.tankId, tankMasters, tanks, sales]); // re-run when any of these change

  // handle input changes
  const handleChange = (e: any) => {
    const { name, value } = e.target;
    const updated: any = { ...tank, [name]: value };

    updated.closingStock =
      num(updated.openingStock) +
      num(updated.quantityReceived) -
      num(updated.soldQuantity);

    updated.totalAmount =
      num(updated.quantityReceived) * num(updated.ratePerLitre);

    setTank(updated);
  };

  // Save OR Update tank entry
  const handleSubmit = async () => {
    if (!tank.tankId) return alert("Select Tank ID");

    const payload = {
      ...tank,
      // ensure we send ISO dateTime (it already is ISO)
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
        // refresh both tanks and sales (sales may not change on tank save but we keep consistent)
        await Promise.all([fetchTanks(), fetchSales()]);
        resetForm();
      } else {
        const txt = await res.text();
        console.error("Save failed:", res.status, txt);
        alert("Error saving tank! See console.");
      }
    } catch (err) {
      console.error("Error saving tank:", err);
      alert("Error saving tank! See console.");
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

  if (loading) return <p>Loading...</p>;

  // helper to display dateTime in form nicely (localized) while keeping ISO in state
  const displayDateTime = (iso?: string) => {
    if (!iso) return "";
    try {
      return new Date(iso).toLocaleString("en-IN");
    } catch {
      return iso;
    }
  };

  return (
    <div className={styles.container}>
      <h1>🛢️ Fuel Tank Management</h1>

      {/* Form */}
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

        {/* show localized string but store ISO */}
        <input
          placeholder="Date & Time"
          value={displayDateTime(tank.dateTime)}
          readOnly
        />

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

        {/* Sold quantity is auto-filled from sales between timestamps */}
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
        {isUpdating ? "🔄 Update Tank Entry" : "➕ Save Tank Entry"}
      </button>

      {/* Table */}
      <h2>📊 Tank Records</h2>
      <table className={styles.table}>
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
          {tanks.map((t) => (
            <tr key={t._id}>
              <td>{t.createdAt ? new Date(t.createdAt).toLocaleString("en-IN") : "-"}</td>
              <td>{t.tankId}</td>
              <td>{t.productType}</td>
              <td>{t.capacity}</td>
              <td>{t.closingStock}</td>
              <td>{t.lowStockAlertLevel}</td>
              <td>{t.supplierName}</td>
              <td>{t.totalAmount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
