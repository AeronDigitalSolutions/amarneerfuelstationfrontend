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
  // NEW fields for daily expense support
  autoTimestamp?: string; // server generated (ISO)
  userTimestamp?: string; // chosen by user (ISO)
  name?: string;
  attendantName?: string;
};

// Backend auto-select logic
const BASE_URL =
  import.meta.env.VITE_API_URL ||
  (window.location.hostname === "localhost"
    ? "http://localhost:5000/api"
    : "https://amarneerfuelstationbackend.onrender.com/api");

export default function AccountingFinance() {
  const [entries, setEntries] = useState<Finance[]>([]);

  /* existing finance entry state */
  const [entry, setEntry] = useState<Finance>({
    entryType: "Journal",
    category: "",
    description: "",
    debit: 0,
    credit: 0,
    amount: 0,
  });

  /* new daily expense state */
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDailyModal, setShowDailyModal] = useState(false);

  const [dailyExpense, setDailyExpense] = useState({
    userTimestamp: "", // ISO string (datetime-local value)
    amount: 0,
    description: "",
    name: "",
    attendantName: "",
    autoTimestamp: "", // readonly display
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

  /* which table to show: 'ledger' or 'daily' */
  const [activeTable, setActiveTable] = useState<"ledger" | "daily">("ledger");

  useEffect(() => {
    fetchEntries();
    fetchSummary();
  }, []);

  const fetchEntries = async () => {
    try {
      const res = await axios.get<Finance[]>(`${BASE_URL}/finance`);
      setEntries(res.data || []);
    } catch (err: any) {
      console.error("Error fetching entries:", err.message || err);
    }
  };

  const fetchSummary = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/finance/summary`);
      setSummary(res.data);
    } catch (err: any) {
      console.error("Error fetching summary:", err.message || err);
    }
  };

  /* --- Handlers for generic finance entry (existing) --- */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setEntry((prev) => ({ ...prev, [name]: value }));
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
      await fetchEntries();
      await fetchSummary();
      resetForm();
      setShowAddModal(false);
    } catch (err: any) {
      alert("Error saving entry: " + (err.message || err));
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

  /* --- Edit handlers (existing) --- */
  const handleEdit = (e: Finance) => {
    setEditEntry({ ...e });
    setIsEditing(true);
  };

  const handleEditChange = (
    ev: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    if (!editEntry) return;
    const { name, value } = ev.target;
    setEditEntry((prev) => (prev ? { ...prev, [name]: value } : null));
  };

  const handleSaveEdit = async () => {
    if (!editEntry || !editEntry._id) {
      alert("Missing entry ID");
      return;
    }

    try {
      await axios.put(`${BASE_URL}/finance/${editEntry._id}`, editEntry);
      await fetchEntries();
      await fetchSummary();
      setIsEditing(false);
      setEditEntry(null);
    } catch (err: any) {
      alert("Error updating entry: " + (err.message || err));
    }
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (!window.confirm("Are you sure you want to delete this entry?")) return;

    try {
      await axios.delete(`${BASE_URL}/finance/${id}`);
      setEntries((prev) => prev.filter((e) => e._id !== id));
      await fetchSummary();
    } catch (err: any) {
      alert("Error deleting entry: " + (err.message || err));
    }
  };

  /* -------------------------
     DAILY EXPENSE specific
     ------------------------- */
  const openDailyModal = () => {
    const now = new Date();
    // for datetime-local input we need format "YYYY-MM-DDTHH:mm"
    const pad = (n: number) => String(n).padStart(2, "0");
    const localDatetime = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(
      now.getDate()
    )}T${pad(now.getHours())}:${pad(now.getMinutes())}`;

    setDailyExpense({
      userTimestamp: localDatetime,
      amount: 0,
      description: "",
      name: "",
      attendantName: "",
      autoTimestamp: now.toISOString(),
    });

    setShowDailyModal(true);
  };

  const handleDailyChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setDailyExpense((prev) => ({ ...prev, [name]: name === "amount" ? Number(value) : value }));
  };

  const handleAddDailyExpense = async () => {
    // validation
    if (!dailyExpense.amount || !dailyExpense.description) {
      alert("Please fill required fields: amount & description");
      return;
    }

    try {
      // payload uses the existing Finance model fields
      const payload = {
        entryType: "Expense",
        category: "Daily Expense",
        description: dailyExpense.description,
        amount: Number(dailyExpense.amount),
        debit: Number(dailyExpense.amount), // store as debit for expenses
        credit: 0,
        name: dailyExpense.name,
        attendantName: dailyExpense.attendantName,
        userTimestamp: dailyExpense.userTimestamp ? new Date(dailyExpense.userTimestamp).toISOString() : undefined,
        autoTimestamp: dailyExpense.autoTimestamp || new Date().toISOString(),
      };

      await axios.post(`${BASE_URL}/finance`, payload);
      await fetchEntries();
      await fetchSummary();
      setShowDailyModal(false);
    } catch (err: any) {
      alert("Error saving daily expense: " + (err.message || err));
    }
  };

  /* helpers to split ledger vs daily */
  const isDailyExpense = (f: Finance) =>
    f.entryType === "Expense" && (f.category || "").toLowerCase().includes("daily");

  const ledgerEntries = entries.filter((e) => !isDailyExpense(e));
  const dailyEntries = entries.filter((e) => isDailyExpense(e));

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>💰 Accounting & Finance</h1>

      {/* Buttons row: Add New Entry + Add Daily Expenses + table switch */}
      <div className={styles.buttonRow}>
        <div className={styles.leftButtons}>
          <button className={styles.openButton} onClick={() => setShowAddModal(true)}>
            ➕ Add New Entry
          </button>

          <button className={styles.secondaryButton} onClick={openDailyModal}>
            ➕ Add Daily Expenses
          </button>
        </div>

        <div className={styles.tableSwitch}>
          <button
            className={`${styles.tabButton} ${activeTable === "ledger" ? styles.activeTab : ""}`}
            onClick={() => setActiveTable("ledger")}
          >
            Ledger Entries
          </button>
          <button
            className={`${styles.tabButton} ${activeTable === "daily" ? styles.activeTab : ""}`}
            onClick={() => setActiveTable("daily")}
          >
            Daily Expenses
          </button>
        </div>
      </div>

      {/* === Table Container (switch based) === */}
      <div className={styles.tableContainer}>
        {activeTable === "ledger" ? (
          <>
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
                {ledgerEntries.map((e) => (
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
          </>
        ) : (
          <>
            <h2 className={styles.sectionTitle}>🧾 Daily Expenses</h2>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Auto Timestamp</th>
                  <th>User Timestamp</th>
                  <th>Amount (₹)</th>
                  <th>Description</th>
                  <th>Name</th>
                  <th>Attendant</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {dailyEntries.map((d) => (
                  <tr key={d._id}>
                    <td>{d.autoTimestamp ? new Date(d.autoTimestamp).toLocaleString() : (d.createdAt ? new Date(d.createdAt).toLocaleString() : "-")}</td>
                    <td>{d.userTimestamp ? new Date(d.userTimestamp).toLocaleString() : "-"}</td>
                    <td>{d.amount}</td>
                    <td>{d.description}</td>
                    <td>{d.name || "-"}</td>
                    <td>{d.attendantName || "-"}</td>
                    <td>
                      <button className={styles.editButton} onClick={() => handleEdit(d)}>✏️</button>
                      <button className={styles.deleteButton} onClick={() => handleDelete(d._id)}>🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>

      {/* === Financial Summary (below table) === */}
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

      {/* === Add Entry Modal === */}
      {showAddModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3>Add New Entry</h3>
            <div className={styles.formGrid}>
              <select name="entryType" value={entry.entryType} onChange={handleChange}>
                <option value="Journal">Journal Entry</option>
                <option value="Expense">Expense</option>
                <option value="Supplier">Supplier Ledger</option>
                <option value="Cashbook">Cashbook</option>
              </select>

              <input name="category" placeholder="Category" value={entry.category} onChange={handleChange} />
              <input name="description" placeholder="Description" value={entry.description} onChange={handleChange} />
              <input name="debit" type="number" placeholder="Debit" value={entry.debit} onChange={handleChange} />
              <input name="credit" type="number" placeholder="Credit" value={entry.credit} onChange={handleChange} />
              <input name="amount" type="number" placeholder="Amount" value={entry.amount} onChange={handleChange} />
              <input name="modeOfPayment" placeholder="Mode of Payment" value={entry.modeOfPayment || ""} onChange={handleChange} />
              <input name="supplierName" placeholder="Supplier Name" value={entry.supplierName || ""} onChange={handleChange} />
              <input name="invoiceNo" placeholder="Invoice No" value={entry.invoiceNo || ""} onChange={handleChange} />
            </div>

            <div className={styles.modalButtons}>
              <button onClick={handleAddEntry} className={styles.saveButton}>Save</button>
              <button onClick={() => setShowAddModal(false)} className={styles.cancelButton}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* === Daily Expense Modal === */}
      {showDailyModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3>Add Daily Expense</h3>

            <div className={styles.formGrid}>
              {/* Auto timestamp (readonly display) */}
              <input
                name="autoTimestamp"
                value={new Date(dailyExpense.autoTimestamp || new Date()).toLocaleString()}
                readOnly
                title="Auto timestamp (server will record in ISO when saved)"
              />

              {/* User-selectable date/time */}
              <input
                name="userTimestamp"
                type="datetime-local"
                value={dailyExpense.userTimestamp}
                onChange={handleDailyChange}
              />

              <input
                name="amount"
                type="number"
                placeholder="Amount (₹)"
                value={dailyExpense.amount}
                onChange={handleDailyChange}
              />

              <input
                name="description"
                placeholder="Description"
                value={dailyExpense.description}
                onChange={handleDailyChange}
              />

              <input
                name="name"
                placeholder="Name"
                value={dailyExpense.name}
                onChange={handleDailyChange}
              />

              <input
                name="attendantName"
                placeholder="Attendant Name"
                value={dailyExpense.attendantName}
                onChange={handleDailyChange}
              />
            </div>

            <div className={styles.modalButtons}>
              <button onClick={handleAddDailyExpense} className={styles.saveButton}>Submit</button>
              <button onClick={() => setShowDailyModal(false)} className={styles.cancelButton}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* === Edit Modal (existing) === */}
      {isEditing && editEntry && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3>Edit Entry – {editEntry.category}</h3>

            <input
              name="description"
              placeholder="Description"
              value={editEntry.description}
              onChange={handleEditChange}
            />
            <input
              name="amount"
              type="number"
              placeholder="Amount"
              value={String(editEntry.amount)}
              onChange={handleEditChange}
            />
            <input
              name="debit"
              type="number"
              placeholder="Debit"
              value={String(editEntry.debit)}
              onChange={handleEditChange}
            />
            <input
              name="credit"
              type="number"
              placeholder="Credit"
              value={String(editEntry.credit)}
              onChange={handleEditChange}
            />
            <input
              name="supplierName"
              placeholder="Supplier"
              value={editEntry.supplierName || ""}
              onChange={handleEditChange}
            />

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
