import { useState, useEffect } from "react";
import styles from "../style/tankmanagement.module.css";

type Tank = {
  _id?: string;
  tankId: string;
  productType: string;
  capacity: number;
  openingStock: number;
  quantityReceived: number;
  soldQuantity: number;
  lowStockAlertLevel: number;
  ratePerLitre: number;
  supplierName: string;
  tankerReceiptNo: string;
  receivedBy: string;
  remarks: string;
  closingStock: number;
  totalAmount: number;
  createdAt?: string;
  updatedAt?: string;
};

const BASE_URL = "https://amarneerfuelstationbackend.onrender.com"; // 🔗 Hardcoded backend URL

export default function TankManagement() {
  const [tanks, setTanks] = useState<Tank[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tank, setTank] = useState<Tank>({
    tankId: "",
    productType: "Petrol",
    capacity: 0,
    openingStock: 0,
    quantityReceived: 0,
    soldQuantity: 0,
    lowStockAlertLevel: 0,
    ratePerLitre: 0,
    supplierName: "",
    tankerReceiptNo: "",
    receivedBy: "",
    remarks: "",
    closingStock: 0,
    totalAmount: 0,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editTank, setEditTank] = useState<Tank | null>(null);

  // ✅ Fetch all tanks
  const fetchTanks = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/tanks`);
      if (!res.ok) throw new Error("Failed to fetch tanks");
      const data = await res.json();
      setTanks(data);
      setError("");
    } catch (err: any) {
      console.error("Error fetching tanks:", err);
      setError("Failed to load tanks.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTanks();
    const interval = setInterval(fetchTanks, 10000); // Auto-refresh every 10s
    return () => clearInterval(interval);
  }, []);

  // 🔢 Helper for numeric conversion
  const num = (n: any) => (isNaN(parseFloat(n)) ? 0 : parseFloat(n));

  // 🧮 Auto calculate closing stock and total amount
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const updatedTank = { ...tank, [name]: value };
    updatedTank.closingStock =
      num(updatedTank.openingStock) + num(updatedTank.quantityReceived) - num(updatedTank.soldQuantity);
    updatedTank.totalAmount = num(updatedTank.quantityReceived) * num(updatedTank.ratePerLitre);
    setTank(updatedTank);
  };

  // ✅ Save a new tank record
  const handleAddTank = async () => {
    if (!tank.tankId.trim()) return alert("⚠️ Please enter Tank ID");

    const payload = {
      ...tank,
      capacity: num(tank.capacity),
      openingStock: num(tank.openingStock),
      quantityReceived: num(tank.quantityReceived),
      soldQuantity: num(tank.soldQuantity),
      lowStockAlertLevel: num(tank.lowStockAlertLevel),
      ratePerLitre: num(tank.ratePerLitre),
      closingStock: num(tank.closingStock),
      totalAmount: num(tank.totalAmount),
    };

    try {
      const res = await fetch(`${BASE_URL}/tanks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to add tank record");
      const data = await res.json();
      setTanks(prev => [data, ...prev]);
      alert("✅ Tank record added successfully!");
      resetForm();
    } catch (err: any) {
      console.error("❌ Error adding tank:", err);
      alert("Failed to add tank record!");
    }
  };

  const resetForm = () => {
    setTank({
      tankId: "",
      productType: "Petrol",
      capacity: 0,
      openingStock: 0,
      quantityReceived: 0,
      soldQuantity: 0,
      lowStockAlertLevel: 0,
      ratePerLitre: 0,
      supplierName: "",
      tankerReceiptNo: "",
      receivedBy: "",
      remarks: "",
      closingStock: 0,
      totalAmount: 0,
    });
  };

  // 📝 Edit existing record
  const handleEdit = (t: Tank) => {
    setEditTank({ ...t });
    setIsEditing(true);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!editTank) return;
    const { name, value } = e.target;
    const updated = { ...editTank, [name]: value };
    updated.closingStock =
      num(updated.openingStock) + num(updated.quantityReceived) - num(updated.soldQuantity);
    updated.totalAmount = num(updated.quantityReceived) * num(updated.ratePerLitre);
    setEditTank(updated);
  };

  // ✅ Save edited data to backend
  const handleSaveEdit = async () => {
    if (!editTank || !editTank._id) return alert("Missing tank ID");
    try {
      const res = await fetch(`${BASE_URL}/tanks/${editTank._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editTank),
      });
      if (!res.ok) throw new Error("Failed to update tank");
      const data = await res.json();
      setTanks(prev => prev.map(t => (t._id === data._id ? data : t)));
      alert("✅ Tank updated successfully!");
      setIsEditing(false);
      setEditTank(null);
    } catch (err) {
      console.error("Error updating tank:", err);
      alert("❌ Failed to update tank!");
    }
  };

  if (loading) return <p className={styles.loading}>Loading tank data...</p>;
  if (error) return <p className={styles.error}>{error}</p>;

  return (
    <div className={styles.container}>
      <h1>🛢️ Fuel Tank Management</h1>

      {/* === Add Form === */}
      <div className={styles.formGrid}>
        <input name="tankId" placeholder="Tank ID" value={tank.tankId} onChange={handleChange} />
        <select name="productType" value={tank.productType} onChange={handleChange}>
          <option>Petrol</option>
          <option>Diesel</option>
          <option>Oil</option>
        </select>
        <input name="capacity" type="number" placeholder="Capacity (L)" value={tank.capacity} onChange={handleChange} />
        <input name="openingStock" type="number" placeholder="Opening Stock" value={tank.openingStock} onChange={handleChange} />
        <input name="quantityReceived" type="number" placeholder="Received (L)" value={tank.quantityReceived} onChange={handleChange} />
        <input name="soldQuantity" type="number" placeholder="Sold (L)" value={tank.soldQuantity} onChange={handleChange} />
        <input name="lowStockAlertLevel" type="number" placeholder="Low Stock Alert (L)" value={tank.lowStockAlertLevel} onChange={handleChange} />
        <input name="ratePerLitre" type="number" placeholder="Rate per Litre (₹)" value={tank.ratePerLitre} onChange={handleChange} />
        <input name="supplierName" placeholder="Supplier Name" value={tank.supplierName} onChange={handleChange} />
        <input name="tankerReceiptNo" placeholder="Tanker Receipt No" value={tank.tankerReceiptNo} onChange={handleChange} />
        <input name="receivedBy" placeholder="Received By" value={tank.receivedBy} onChange={handleChange} />
        <input name="remarks" placeholder="Remarks" value={tank.remarks} onChange={handleChange} />
      </div>

      <div className={styles.summaryBox}>
        <p>Closing Stock: <strong>{tank.closingStock.toFixed(2)} L</strong></p>
        <p>Total Amount: <strong>₹{tank.totalAmount.toFixed(2)}</strong></p>
      </div>

      <button className={styles.saveButton} onClick={handleAddTank}>
        ➕ Add Tank Record
      </button>

      {/* === Tank Table === */}
      <h2>📊 Tank Summary</h2>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Date & Time</th>
            <th>Tank ID</th>
            <th>Product</th>
            <th>Capacity</th>
            <th>Closing Stock</th>
            <th>Low Alert</th>
            <th>Supplier</th>
            <th>Amount (₹)</th>
            <th>Edit</th>
          </tr>
        </thead>
        <tbody>
          {tanks.map((t) => (
            <tr key={t._id} className={t.closingStock < t.lowStockAlertLevel ? styles.lowStock : ""}>
              <td>{t.createdAt ? new Date(t.createdAt).toLocaleString("en-IN") : "-"}</td>
              <td>{t.tankId}</td>
              <td>{t.productType}</td>
              <td>{t.capacity}</td>
              <td>{t.closingStock}</td>
              <td>{t.lowStockAlertLevel}</td>
              <td>{t.supplierName || "-"}</td>
              <td>{t.totalAmount ? t.totalAmount.toFixed(2) : "0.00"}</td>
              <td>
                <button className={styles.editButton} onClick={() => handleEdit(t)}>✏️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* === Edit Modal === */}
      {isEditing && editTank && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3>Edit Tank – {editTank.tankId}</h3>

            <input
              name="soldQuantity"
              type="number"
              value={editTank.soldQuantity}
              onChange={handleEditChange}
              placeholder="Sold Quantity (L)"
            />
            <input
              name="remarks"
              value={editTank.remarks}
              onChange={handleEditChange}
              placeholder="Remarks"
            />

            <div className={styles.summaryBox}>
              <p>Closing Stock: <strong>{editTank.closingStock.toFixed(2)} L</strong></p>
              <p>Total Amount: <strong>₹{editTank.totalAmount.toFixed(2)}</strong></p>
            </div>

            <div className={styles.modalButtons}>
              <button onClick={handleSaveEdit} className={styles.saveButton}>💾 Save</button>
              <button onClick={() => setIsEditing(false)} className={styles.cancelButton}>❌ Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
