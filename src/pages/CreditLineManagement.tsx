import { useState, useEffect } from "react";
import axios from "axios";
import styles from "../style/creditline.module.css";

// 🌐 Hardcoded backend base URL
const BASE_URL = "https://amarneerfuelstationbackend.onrender.com";

type Account = {
  _id?: string;
  accountId: string;
  accountName: string;
  name: string;
  email: string;
  fuelType: "Petrol" | "Diesel";
  vehicles: string[];
  creditLimit: number;
  contactPerson: string;
  totalSales?: number;
  totalPayments?: number;
  outstanding?: number;
  transactions?: {
    date: string;
    type: string;
    amount: number;
    paymentMode?: string;
  }[];
};

export default function CreditLineManagement() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [newAccount, setNewAccount] = useState<Account>({
    accountId: "",
    accountName: "",
    name: "",
    email: "",
    fuelType: "Petrol",
    vehicles: [],
    creditLimit: 0,
    contactPerson: "",
  });

  const [vehicleInput, setVehicleInput] = useState("");
  const [transaction, setTransaction] = useState({
    accountId: "",
    type: "Sale",
    amount: 0,
    paymentMode: "",
  });

  useEffect(() => {
    console.log("🌐 Using API Base URL:", BASE_URL);
    fetchAccounts();
  }, []);

  /** 🔹 Fetch All Credit Accounts */
  const fetchAccounts = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/credit`);
      setAccounts(res.data);
    } catch (err) {
      console.error("❌ Failed to fetch accounts:", err);
    }
  };

  /** 🔹 Handle Account Input Change */
  const handleAccountChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewAccount(prev => ({ ...prev, [name]: value }));
  };

  /** ➕ Add Vehicle to List */
  const addVehicle = () => {
    if (!vehicleInput.trim()) return;
    setNewAccount(prev => ({ ...prev, vehicles: [...prev.vehicles, vehicleInput.trim()] }));
    setVehicleInput("");
  };

  /** ❌ Remove Vehicle */
  const removeVehicle = (v: string) => {
    setNewAccount(prev => ({ ...prev, vehicles: prev.vehicles.filter(x => x !== v) }));
  };

  /** ➕ Add New Credit Account */
  const addAccount = async () => {
    if (!newAccount.accountId || !newAccount.name || !newAccount.accountName) {
      alert("Please fill Account ID, Account Name, and Customer Name");
      return;
    }
    try {
      const res = await axios.post(`${BASE_URL}/credit`, newAccount);
      setAccounts(prev => [res.data, ...prev]);
      alert("✅ Credit account created successfully!");
      setNewAccount({
        accountId: "",
        accountName: "",
        name: "",
        email: "",
        fuelType: "Petrol",
        vehicles: [],
        creditLimit: 0,
        contactPerson: "",
      });
    } catch (err) {
      console.error("❌ Failed to add account:", err);
      alert("Failed to add account. Check console for details.");
    }
  };

  /** 🔹 Handle Transaction Form */
  const handleTransactionChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTransaction(prev => ({ ...prev, [name]: value }));
  };

  /** 💰 Add Transaction (Sale / Payment) */
  const addTransaction = async () => {
    if (!transaction.accountId || !transaction.amount) {
      alert("Select account and enter amount");
      return;
    }
    try {
      await axios.post(`${BASE_URL}/credit/transaction`, transaction);
      alert(`${transaction.type} recorded successfully!`);
      fetchAccounts();
      setTransaction({ accountId: "", type: "Sale", amount: 0, paymentMode: "" });
    } catch (err) {
      console.error("❌ Failed to add transaction:", err);
      alert("Failed to record transaction. Check console for details.");
    }
  };

  /** 🗑️ Delete Credit Account */
  const deleteAccount = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this account?")) return;
    try {
      await axios.delete(`${BASE_URL}/credit/${id}`);
      setAccounts(prev => prev.filter(acc => acc._id !== id));
    } catch (err) {
      console.error("❌ Failed to delete account:", err);
      alert("Error deleting account. Check console for details.");
    }
  };

  return (
    <div className={styles.container}>
      <h1>💳 Credit Line Management</h1>

      {/* ➕ Add Credit Account */}
      <section className={styles.section}>
        <h2>➕ Add Credit Account</h2>
        <div className={styles.formGrid}>
          <input name="accountId" placeholder="Account ID" value={newAccount.accountId} onChange={handleAccountChange} />
          <input name="accountName" placeholder="Credit Account Name" value={newAccount.accountName} onChange={handleAccountChange} />
          <input name="name" placeholder="Customer / Transporter Name" value={newAccount.name} onChange={handleAccountChange} />
          <input name="email" type="email" placeholder="Email ID" value={newAccount.email} onChange={handleAccountChange} />
          <input name="creditLimit" type="number" placeholder="Credit Limit (₹)" value={newAccount.creditLimit} onChange={handleAccountChange} />
          <input name="contactPerson" placeholder="Contact Person" value={newAccount.contactPerson} onChange={handleAccountChange} />
          <select name="fuelType" value={newAccount.fuelType} onChange={handleAccountChange}>
            <option>Petrol</option>
            <option>Diesel</option>
          </select>

          {/* Vehicle List */}
          <div className={styles.vehicleBox}>
            <input placeholder="Vehicle Number" value={vehicleInput} onChange={e => setVehicleInput(e.target.value)} />
            <button type="button" onClick={addVehicle} className={styles.smallButton}>Add</button>
            <div className={styles.vehicleList}>
              {newAccount.vehicles.map(v => (
                <span key={v} className={styles.vehicleTag}>
                  {v} <button type="button" onClick={() => removeVehicle(v)}>x</button>
                </span>
              ))}
            </div>
          </div>
        </div>
        <button onClick={addAccount} className={styles.addButton}>Add Account</button>
      </section>

      {/* 💰 Record Transaction */}
      <section className={styles.section}>
        <h2>💰 Record Sale / Payment</h2>
        <div className={styles.formGrid}>
          <select name="accountId" value={transaction.accountId} onChange={handleTransactionChange}>
            <option value="">Select Account</option>
            {accounts.map(acc => (
              <option key={acc._id} value={acc.accountId}>
                {acc.accountId} – {acc.accountName}
              </option>
            ))}
          </select>

          <select name="type" value={transaction.type} onChange={handleTransactionChange}>
            <option>Sale</option>
            <option>Payment</option>
          </select>

          <input type="number" name="amount" placeholder="Amount (₹)" value={transaction.amount} onChange={handleTransactionChange} />
          <input name="paymentMode" placeholder="Payment Mode (Cash / Bank / UPI)" value={transaction.paymentMode} onChange={handleTransactionChange} />
        </div>
        <button onClick={addTransaction} className={styles.addButton}>Save Transaction</button>
      </section>

      {/* 📊 Records */}
      <section className={styles.section}>
        <h2>📊 Credit Accounts Overview</h2>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Account ID</th>
              <th>Account Name</th>
              <th>Customer Name</th>
              <th>Fuel Type</th>
              <th>Vehicles</th>
              <th>Credit Limit (₹)</th>
              <th>Sales (₹)</th>
              <th>Payments (₹)</th>
              <th>Outstanding (₹)</th>
              <th>Last Transaction</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map(acc => {
              const lastTx = acc.transactions?.[acc.transactions.length - 1];
              return (
                <tr key={acc._id}>
                  <td>{acc.accountId}</td>
                  <td>{acc.accountName}</td>
                  <td>{acc.name}</td>
                  <td>{acc.fuelType}</td>
                  <td>{acc.vehicles.join(", ") || "—"}</td>
                  <td>{acc.creditLimit}</td>
                  <td>{acc.totalSales}</td>
                  <td>{acc.totalPayments}</td>
                  <td style={{ color: acc.outstanding! > acc.creditLimit ? "red" : "inherit" }}>
                    {acc.outstanding}
                  </td>
                  <td>
                    {lastTx
                      ? `${new Date(lastTx.date).toLocaleString()} (${lastTx.type}: ₹${lastTx.amount})`
                      : "—"}
                  </td>
                  <td>
                    <button onClick={() => deleteAccount(acc._id!)} className={styles.deleteButton}>
                      🗑️
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </div>
  );
}
