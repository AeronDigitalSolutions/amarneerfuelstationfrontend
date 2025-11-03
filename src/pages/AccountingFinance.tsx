import { useEffect, useState } from "react";
import axios from "axios";
import styles from "../style/accountingfinance.module.css";

type Finance = {
  _id?: string;
  entryType: string;
  category: string;
  description: string;
  debit: number;
  credit: number;
  amount: number;
  modeOfPayment?: string;
  supplierName?: string;
  invoiceNo?: string;
  createdAt?: string;
};

const BASE_URL = "https://amarneerfuelstationbackend.onrender.com/api"; // ✅ Hardcoded backend URL

export default function AccountingFinance() {
  const [entries, setEntries] = useState<Finance[]>([]);
  const [entry, setEntry] = useState<Finance>({
    entryType: "Journal",
    category: "",
    description: "",
    debit: 0,
    credit: 0,
    amount: 0,
  });

  const [summary, setSummary] = useState({
    totalSales: 0,
    totalPurchase: 0,
    totalExpense: 0,
    profit: 0,
    cashbookBalance: 0,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editEntry, setEditEntry] = useState<Finance | null>(null);

  // Fetch data on load
  useEffect(() => {
    fetchEntries();
    fetchSummary();
  }, []);

  const fetchEntries = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/finance`);
      setEntries(res.data);
    } catch (err: any) {
      console.error("Error fetching entries:", err.message);
    }
  };

  const fetchSummary = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/finance/summary`);
      setSummary(res.data);
    } catch (err: any) {
      console.error("Error fetching summary:", err.message);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEntry(prev => ({ ...prev, [name]: value }));
  };

  const handleAddEntry = async () => {
    if (!entry.category || !entry.description) {
      alert("Please fill all required details");
      return;
    }

    try {
      const payload = {
        ...entry,
        debit: Number(entry.debit),
        credit: Number(entry.credit),
        amount: Number(entry.amount),
      };
      await axios.post(`${BASE_URL}/finance`, payload);
      fetchEntries();
      fetchSummary();
      resetForm();
    } catch (err: any) {
      alert("Error saving entry: " + err.message);
    }
  };

  const resetForm = () => {
    setEntry({
      entryType: "Journal",
      category: "",
      description: "",
      debit: 0,
      credit: 0,
      amount: 0,
    });
  };

  const handleEdit = (e: Finance) => {
    setEditEntry({ ...e });
    setIsEditing(true);
  };

  const handleEditChange = (ev: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!editEntry) return;
    const { name, value } = ev.target;
    setEditEntry(prev => (prev ? { ...prev, [name]: value } : null));
  };

  const handleSaveEdit = async () => {
    if (!editEntry || !editEntry._id) {
      alert("Missing entry ID");
      return;
    }

    try {
      await axios.put(`${BASE_URL}/finance/${editEntry._id}`, editEntry);
      fetchEntries();
      fetchSummary();
      setIsEditing(false);
      setEditEntry(null);
    } catch (err: any) {
      alert("Error updating entry: " + err.message);
    }
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (!window.confirm("Are you sure you want to delete this entry?")) return;

    try {
      await axios.delete(`${BASE_URL}/finance/${id}`);
      setEntries(prev => prev.filter(e => e._id !== id));
      fetchSummary();
    } catch (err: any) {
      alert("Error deleting entry: " + err.message);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>💰 Accounting & Finance</h1>

      {/* === Add Form === */}
      <div className={styles.formCard}>
        <h2 className={styles.sectionTitle}>Add New Entry</h2>
        <div className={styles.formGrid}>
          <select name="entryType" value={entry.entryType} onChange={handleChange}>
            <option value="Journal">Journal Entry</option>
            <option value="Expense">Expense</option>
            <option value="Supplier">Supplier Ledger</option>
            <option value="Cashbook">Cashbook</option>
          </select>

          <input name="category" placeholder="Category (e.g., Purchase, Fuel)" value={entry.category} onChange={handleChange} />
          <input name="description" placeholder="Narration / Description" value={entry.description} onChange={handleChange} />
          <input name="debit" type="number" placeholder="Debit (₹)" value={entry.debit} onChange={handleChange} />
          <input name="credit" type="number" placeholder="Credit (₹)" value={entry.credit} onChange={handleChange} />
          <input name="amount" type="number" placeholder="Amount (₹)" value={entry.amount} onChange={handleChange} />
          <input name="modeOfPayment" placeholder="Mode of Payment (Cash / UPI / Bank)" value={entry.modeOfPayment || ""} onChange={handleChange} />
          <input name="supplierName" placeholder="Supplier Name (optional)" value={entry.supplierName || ""} onChange={handleChange} />
          <input name="invoiceNo" placeholder="Invoice No (optional)" value={entry.invoiceNo || ""} onChange={handleChange} />
        </div>

        <button onClick={handleAddEntry} className={styles.saveButton}>
          ➕ Save Entry
        </button>
      </div>

      {/* === Summary === */}
      <div className={styles.summaryCard}>
        <h2 className={styles.sectionTitle}>Financial Summary</h2>
        <div className={styles.summaryGrid}>
          <p><strong>Total Sales:</strong> ₹{summary.totalSales.toFixed(2)}</p>
          <p><strong>Total Purchase:</strong> ₹{summary.totalPurchase.toFixed(2)}</p>
          <p><strong>Total Expense:</strong> ₹{summary.totalExpense.toFixed(2)}</p>
          <p className={styles.profit}><strong>Profit:</strong> ₹{summary.profit.toFixed(2)}</p>
          <p className={styles.balance}><strong>Cashbook Balance:</strong> ₹{summary.cashbookBalance.toFixed(2)}</p>
        </div>
      </div>

      {/* === Entries Table === */}
      <div className={styles.tableContainer}>
        <h2 className={styles.sectionTitle}>📘 Ledger Entries</h2>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Category</th>
              <th>Description</th>
              <th>Debit (₹)</th>
              <th>Credit (₹)</th>
              <th>Amount (₹)</th>
              <th>Supplier</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {entries.map(e => (
              <tr key={e._id}>
                <td>{e.createdAt ? new Date(e.createdAt).toLocaleString() : "-"}</td>
                <td>{e.entryType}</td>
                <td>{e.category}</td>
                <td>{e.description}</td>
                <td>{e.debit}</td>
                <td>{e.credit}</td>
                <td>{e.amount}</td>
                <td>{e.supplierName || "-"}</td>
                <td>
                  <button className={styles.editButton} onClick={() => handleEdit(e)}>✏️</button>
                  <button className={styles.deleteButton} onClick={() => handleDelete(e._id)}>🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* === Edit Modal === */}
      {isEditing && editEntry && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3>Edit Entry – {editEntry.category}</h3>

            <input name="description" placeholder="Description" value={editEntry.description} onChange={handleEditChange} />
            <input name="amount" type="number" placeholder="Amount" value={editEntry.amount} onChange={handleEditChange} />
            <input name="debit" type="number" placeholder="Debit" value={editEntry.debit} onChange={handleEditChange} />
            <input name="credit" type="number" placeholder="Credit" value={editEntry.credit} onChange={handleEditChange} />
            <input name="supplierName" placeholder="Supplier" value={editEntry.supplierName || ""} onChange={handleEditChange} />

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
