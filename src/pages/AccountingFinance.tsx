import { useEffect, useState } from "react";
import axios from "axios";
import styles from "../style/accountingfinance.module.css";
import FullScreenLoader from "../component/FullScreenLoader";

type Finance = {
  _id?: string;
  entryType: string;
  category: string;
  description: string;
  debit: number | "";
  credit: number | "";
  amount: number | "";
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
        ? "http://localhost:5001/api"
        : "https://amarneerfuelstationbackend.onrender.com/api");

export default function AccountingFinance() {
  const [entries, setEntries] = useState<Finance[]>([]);
  const [activeTable, setActiveTable] = useState<"ledger" | "daily">("ledger");

  // ❌ Removed default prefilled 0
  const [entry, setEntry] = useState<Finance>({
    entryType: "Journal",
    category: "",
    description: "",
    debit: "",
    credit: "",
    amount: "",
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [showDailyModal, setShowDailyModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editEntry, setEditEntry] = useState<Finance | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const [dailyExpense, setDailyExpense] = useState({
    userTimestamp: "",
    amount: "",
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
    finally {
      setLoading(false); // hide loader when complete
    }
  };

  const fetchSummary = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/finance/summary`);
      setSummary(res.data);
    } catch (err) {
      console.error("Error fetching summary:", err);
    }
     finally {
      setLoading(false); // hide loader when complete
    }
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;

    setEntry((prev) => ({
      ...prev,
      [name]: value === "" ? "" : value, // keep empty instead of 0
    }));
  };

  // ✅ Add Entry
  const handleAddEntry = async () => {
    if (!entry.category || !entry.description)
      return alert("Fill all required fields");

    try {
      await axios.post(`${BASE_URL}/finance`, {
        entryType: entry.entryType,
        category: entry.category,
        description: entry.description,
        debit: entry.debit === "" ? 0 : Number(entry.debit),
        credit: entry.credit === "" ? 0 : Number(entry.credit),
        amount: entry.amount === "" ? 0 : Number(entry.amount),
        modeOfPayment: entry.modeOfPayment,
        supplierName: entry.supplierName,
        invoiceNo: entry.invoiceNo,
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
      debit: "",
      credit: "",
      amount: "",
      modeOfPayment: "",
      supplierName: "",
      invoiceNo: "",
    });
  };

  // 🟡 EDITING
  const handleEdit = (e: Finance) => {
    setEditEntry({ ...e });
    setIsEditing(true);
  };

  const handleEditChange = (ev: any) => {
    const { name, value } = ev.target;
    setEditEntry((prev) =>
      prev ? { ...prev, [name]: value === "" ? "" : value } : null
    );
  };

  const handleSaveEdit = async () => {
    if (!editEntry?._id) return;

    try {
      await axios.put(`${BASE_URL}/finance/${editEntry._id}`, {
        ...editEntry,
        amount: editEntry.amount === "" ? 0 : Number(editEntry.amount),
        debit: editEntry.debit === "" ? 0 : Number(editEntry.debit),
        credit: editEntry.credit === "" ? 0 : Number(editEntry.credit),
      });

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
     finally {
      setLoading(false); // hide loader when complete
    }
  };

  // Daily Modal Setup
  const openDailyModal = () => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");

    const localDt = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(
      now.getDate()
    )}T${pad(now.getHours())}:${pad(now.getMinutes())}`;

    setDailyExpense({
      userTimestamp: localDt,
      amount: "",
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
      [name]: value === "" ? "" : value,
    }));
  };

  const handleAddDailyExpense = async () => {
    if (dailyExpense.amount === "" || !dailyExpense.description)
      return alert("Fill required fields");

    try {
      await axios.post(`${BASE_URL}/finance`, {
        entryType: "Expense",
        category: "Daily Expense",
        description: dailyExpense.description,
        amount: Number(dailyExpense.amount),
        debit: Number(dailyExpense.amount),
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

  // Filter by date
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
    <>
      <FullScreenLoader loading={loading} />
    <div className={`${styles.container} module-page`}>
      <section className="module-hero">
        <div>
          <p className="module-hero-tag">FINANCE CONTROL</p>
          <h2>Accounts & Finance Console</h2>
          <p>Capture journal and daily transactions with cleaner filtering and real-time summary visibility.</p>
        </div>
      </section>
      <h1 className={styles.title}>Accounting & Finance</h1>

      <div className={styles.buttonRow}>
        <div className={styles.leftButtons}>
          <button className={styles.openButton} onClick={() => setShowAddModal(true)}>
            Add New Entry
          </button>

          <button className={styles.secondaryButton} onClick={openDailyModal}>
            Add Daily Expenses
          </button>
        </div>

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
            <h2 className={styles.sectionTitle}>Ledger Entries</h2>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.accountth}>Date</th>
                  <th className={styles.accountth}>Type</th>
                  <th className={styles.accountth}>Category</th>
                  <th className={styles.accountth}>Description</th>
                  <th className={styles.accountth}>Debit</th>
                  <th className={styles.accountth}>Credit</th>
                  <th className={styles.accountth}>Amount</th>
                  <th className={styles.accountth}>Supplier</th>
                  <th className={styles.accountth}>Actions</th>
                </tr>
              </thead>

              <tbody>
                {ledgerEntries.map((e) => (
                  <tr key={e._id}>
                    <td className={styles.accounttd}>{new Date(e.createdAt || "").toLocaleString()}</td>
                    <td className={styles.accounttd}>{e.entryType}</td>
                    <td className={styles.accounttd}>{e.category}</td>
                    <td className={styles.accounttd}>{e.description}</td>
                    <td className={styles.accounttd}>{e.debit}</td>
                    <td className={styles.accounttd}>{e.credit}</td>
                    <td className={styles.accounttd}>{e.amount}</td>
                    <td className={styles.accounttd}>{e.supplierName || "-"}</td>
                    <td >
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
            <h2 className={styles.sectionTitle}>Daily Expenses</h2>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th  className={styles.accountth}>Auto Timestamp</th>
                  <th  className={styles.accountth}>User Timestamp</th>
                  <th  className={styles.accountth}>Amount</th>
                  <th  className={styles.accountth}>Description</th>
                  <th  className={styles.accountth}>Name</th>
                  <th  className={styles.accountth}>Attendant</th>
                  <th  className={styles.accountth}>Actions</th>
                </tr>
              </thead>

              <tbody>
                {dailyEntries.map((d) => (
                  <tr key={d._id}>
                    <td  className={styles.accounttd}>{d.autoTimestamp ? new Date(d.autoTimestamp).toLocaleString() : "-"}</td>
                    <td  className={styles.accounttd}>{d.userTimestamp ? new Date(d.userTimestamp).toLocaleString() : "-"}</td>
                    <td  className={styles.accounttd}>{d.amount}</td>
                    <td  className={styles.accounttd}>{d.description}</td>
                    <td  className={styles.accounttd}>{d.name || "-"}</td>
                    <td  className={styles.accounttd}>{d.attendantName || "-"}</td>
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

      {/* Fixed summary */}
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
              <button className={styles.saveButton} onClick={handleAddEntry}>Save</button>
              <button className={styles.cancelButton} onClick={() => setShowAddModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Daily Expense Modal */}
      {showDailyModal && (
        <div className={styles.modalOverlay} onClick={() => setShowDailyModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.title}>Add Daily Expense</h3>

            <div className={styles.formGrid}>
              <input readOnly value={new Date(dailyExpense.autoTimestamp).toLocaleString()} />

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
              <button className={styles.saveButton} onClick={handleAddDailyExpense}>Submit</button>
              <button className={styles.cancelButton} onClick={() => setShowDailyModal(false)}>Cancel</button>
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
              placeholder="Amount"
              value={editEntry.amount}
              onChange={handleEditChange}
            />
            <input
              name="debit"
              type="number"
              placeholder="Debit"
              value={editEntry.debit}
              onChange={handleEditChange}
            />
            <input
              name="credit"
              type="number"
              placeholder="Credit"
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
              <button className={styles.saveButton} onClick={handleSaveEdit}>Save</button>
              <button className={styles.cancelButton} onClick={() => setIsEditing(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
}
