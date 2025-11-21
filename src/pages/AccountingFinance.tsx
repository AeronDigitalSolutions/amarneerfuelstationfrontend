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
  autoTimestamp?: string;
  userTimestamp?: string;
  name?: string;
  attendantName?: string;
};

const BASE_URL =
  (typeof import.meta !== "undefined" && import.meta.env.VITE_API_URL)
    ? import.meta.env.VITE_API_URL
    : (typeof window !== "undefined" && window.location.hostname === "localhost"
        ? "http://localhost:5000/api"
        : "https://amarneerfuelstationbackend.onrender.com/api");

export default function AccountingFinance() {
  const [entries, setEntries] = useState<Finance[]>([]);
  const [activeTable, setActiveTable] = useState<"ledger" | "daily">("ledger");

  const [entry, setEntry] = useState<Finance>({
    entryType: "Journal",
    category: "",
    description: "",
    debit: 0,
    credit: 0,
    amount: 0,
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [showDailyModal, setShowDailyModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editEntry, setEditEntry] = useState<Finance | null>(null);

  const [dailyExpense, setDailyExpense] = useState({
    userTimestamp: "",
    amount: 0,
    description: "",
    name: "",
    attendantName: "",
    autoTimestamp: "",
  });

  const [summary, setSummary] = useState({
    totalSales: 0,
    totalPurchase: 0,
    totalExpense: 0,
    profit: 0,
    cashbookBalance: 0,
  });

  // DATE FILTER — SINGLE DATE ONLY
  const [filterDate, setFilterDate] = useState("");

  useEffect(() => {
    fetchEntries();
    fetchSummary();
  }, []);

  const fetchEntries = async () => {
    try {
      const res = await axios.get<Finance[]>(`${BASE_URL}/finance`);
      setEntries(res.data || []);
    } catch (err) {
      console.error("Error fetching entries:", err);
    }
  };

  const fetchSummary = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/finance/summary`);
      setSummary(res.data);
    } catch (err) {
      console.error("Error fetching summary:", err);
    }
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setEntry((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddEntry = async () => {
    if (!entry.category || !entry.description)
      return alert("Fill all required fields");

    try {
      await axios.post(`${BASE_URL}/finance`, {
        ...entry,
        debit: Number(entry.debit),
        credit: Number(entry.credit),
        amount: Number(entry.amount),
      });

      fetchEntries();
      fetchSummary();
      resetForm();
      setShowAddModal(false);
    } catch (err) {
      alert("Error saving entry");
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

  const handleEditChange = (ev: any) => {
    if (!editEntry) return;
    const { name, value } = ev.target;
    setEditEntry((prev) => prev ? { ...prev, [name]: value } : null);
  };

  const handleSaveEdit = async () => {
    if (!editEntry?._id) return;

    try {
      await axios.put(`${BASE_URL}/finance/${editEntry._id}`, editEntry);
      fetchEntries();
      fetchSummary();
      setIsEditing(false);
    } catch {
      alert("Error updating");
    }
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (!window.confirm("Delete entry?")) return;

    try {
      await axios.delete(`${BASE_URL}/finance/${id}`);
      fetchEntries();
      fetchSummary();
    } catch {
      alert("Error deleting");
    }
  };

  // OPEN DAILY EXPENSE MODAL
  const openDailyModal = () => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");

    const localDt = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(
      now.getDate()
    )}T${pad(now.getHours())}:${pad(now.getMinutes())}`;

    setDailyExpense({
      userTimestamp: localDt,
      amount: 0,
      description: "",
      name: "",
      attendantName: "",
      autoTimestamp: now.toISOString(),
    });

    setShowDailyModal(true);
  };

  const handleDailyChange = (e: any) => {
    const { name, value } = e.target;
    setDailyExpense((prev) => ({
      ...prev,
      [name]: name === "amount" ? Number(value) : value,
    }));
  };

  const handleAddDailyExpense = async () => {
    if (!dailyExpense.amount || !dailyExpense.description)
      return alert("Fill required fields");

    try {
      await axios.post(`${BASE_URL}/finance`, {
        entryType: "Expense",
        category: "Daily Expense",
        description: dailyExpense.description,
        amount: dailyExpense.amount,
        debit: dailyExpense.amount,
        credit: 0,
        name: dailyExpense.name,
        attendantName: dailyExpense.attendantName,
        userTimestamp: new Date(dailyExpense.userTimestamp).toISOString(),
        autoTimestamp: dailyExpense.autoTimestamp,
      });

      fetchEntries();
      fetchSummary();
      setShowDailyModal(false);
    } catch {
      alert("Error saving expense");
    }
  };

  // FILTERING LOGIC — SINGLE DATE MATCH
  const matchesDate = (entry: Finance) => {
    if (!filterDate) return true;

    const day = filterDate;

    const datesToCheck = [
      entry.createdAt,
      entry.autoTimestamp,
      entry.userTimestamp,
    ];

    return datesToCheck.some((d) =>
      d ? d.substring(0, 10) === day : false
    );
  };

  const isDaily = (e: Finance) =>
    e.entryType === "Expense" &&
    (e.category || "").toLowerCase().includes("daily");

  const ledgerEntries = entries.filter((e) => !isDaily(e) && matchesDate(e));
  const dailyEntries = entries.filter((e) => isDaily(e) && matchesDate(e));

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>💰 Accounting & Finance</h1>

      <div className={styles.buttonRow}>
        <div className={styles.leftButtons}>
          <button className={styles.openButton} onClick={() => setShowAddModal(true)}>
            ➕ Add New Entry
          </button>

          <button className={styles.secondaryButton} onClick={openDailyModal}>
            ➕ Add Daily Expenses
          </button>
        </div>

        {/* Table Tabs */}
        <div className={styles.tableSwitch}>
          <button
            className={`${styles.tabButton} ${
              activeTable === "ledger" ? styles.activeTab : ""
            }`}
            onClick={() => setActiveTable("ledger")}
          >
            Ledger Entries
          </button>

          <button
            className={`${styles.tabButton} ${
              activeTable === "daily" ? styles.activeTab : ""
            }`}
            onClick={() => setActiveTable("daily")}
          >
            Daily Expenses
          </button>
        </div>
      </div>

      {/* DATE FILTER */}
      <div className={styles.filterRow}>
        <input
          type="date"
          className={styles.dateFilter}
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
        />
      </div>

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
                  <th>Debit</th>
                  <th>Credit</th>
                  <th>Amount</th>
                  <th>Supplier</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {ledgerEntries.map((e) => (
                  <tr key={e._id}>
                    <td>{new Date(e.createdAt || "").toLocaleString()}</td>
                    <td>{e.entryType}</td>
                    <td>{e.category}</td>
                    <td>{e.description}</td>
                    <td>{e.debit}</td>
                    <td>{e.credit}</td>
                    <td>{e.amount}</td>
                    <td>{e.supplierName || "-"}</td>
                    <td>
                      <button onClick={() => handleEdit(e)} className={styles.editButton}>✏️</button>
                      <button onClick={() => handleDelete(e._id)} className={styles.deleteButton}>🗑️</button>
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
                  <th>Amount</th>
                  <th>Description</th>
                  <th>Name</th>
                  <th>Attendant</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {dailyEntries.map((d) => (
                  <tr key={d._id}>
                    <td>{d.autoTimestamp ? new Date(d.autoTimestamp).toLocaleString() : "-"}</td>
                    <td>{d.userTimestamp ? new Date(d.userTimestamp).toLocaleString() : "-"}</td>
                    <td>{d.amount}</td>
                    <td>{d.description}</td>
                    <td>{d.name || "-"}</td>
                    <td>{d.attendantName || "-"}</td>
                    <td>
                      <button onClick={() => handleEdit(d)} className={styles.editButton}>✏️</button>
                      <button onClick={() => handleDelete(d._id)} className={styles.deleteButton}>🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>

      {/* FIXED SUMMARY BAR */}
      <div className={styles.fixedSummary}>
        <span><strong>Purchase:</strong> ₹{summary.totalPurchase.toFixed(2)}</span>
        <span><strong>Expense:</strong> ₹{summary.totalExpense.toFixed(2)}</span>
        <span><strong>Profit:</strong> ₹{summary.profit.toFixed(2)}</span>
        <span><strong>Balance:</strong> ₹{summary.cashbookBalance.toFixed(2)}</span>
      </div>

      {/* Add Entry Modal */}
      {showAddModal && (
        <div className={styles.modalOverlay} onClick={() => setShowAddModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
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

      {/* Daily Expense Modal */}
      {showDailyModal && (
        <div className={styles.modalOverlay} onClick={() => setShowDailyModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3>Add Daily Expense</h3>

            <div className={styles.formGrid}>
              <input
                readOnly
                value={new Date(dailyExpense.autoTimestamp).toLocaleString()}
              />

              <input
                name="userTimestamp"
                type="datetime-local"
                value={dailyExpense.userTimestamp}
                onChange={handleDailyChange}
              />

              <input
                name="amount"
                type="number"
                placeholder="Amount"
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

      {/* Edit Modal */}
      {isEditing && editEntry && (
        <div className={styles.modalOverlay} onClick={() => setIsEditing(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3>Edit Entry</h3>

            <input
              name="description"
              placeholder="Description"
              value={editEntry.description}
              onChange={handleEditChange}
            />
            <input
              name="amount"
              type="number"
              value={editEntry.amount}
              onChange={handleEditChange}
            />
            <input
              name="debit"
              type="number"
              value={editEntry.debit}
              onChange={handleEditChange}
            />
            <input
              name="credit"
              type="number"
              value={editEntry.credit}
              onChange={handleEditChange}
            />
            <input
              name="supplierName"
              placeholder="Supplier"
              value={editEntry.supplierName || ""}
              onChange={handleEditChange}
            />

            <div className={styles.modalButtons}>
              <button onClick={handleSaveEdit} className={styles.saveButton}>Save</button>
              <button onClick={() => setIsEditing(false)} className={styles.cancelButton}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
