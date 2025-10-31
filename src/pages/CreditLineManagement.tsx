import { useState, useEffect } from "react";
import api from "../utils/api";
import styles from "../style/creditline.module.css";

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
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    const res = await api.get("/api/credit");
    setAccounts(res.data);
  };

  const handleAccountChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewAccount(prev => ({ ...prev, [name]: value }));
  };

  const addVehicle = () => {
    if (!vehicleInput.trim()) return;
    setNewAccount(prev => ({ ...prev, vehicles: [...prev.vehicles, vehicleInput.trim()] }));
    setVehicleInput("");
  };

  const removeVehicle = (v: string) => {
    setNewAccount(prev => ({ ...prev, vehicles: prev.vehicles.filter(x => x !== v) }));
  };

  const addAccount = async () => {
    if (!newAccount.accountId || !newAccount.name || !newAccount.accountName) {
      alert("Please fill Account ID, Account Name, and Customer Name");
      return;
    }
    const res = await api.post("/api/credit", newAccount);
    setAccounts(prev => [res.data, ...prev]);
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
  };

  const handleTransactionChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTransaction(prev => ({ ...prev, [name]: value }));
  };

  const addTransaction = async () => {
    if (!transaction.accountId || !transaction.amount) {
      alert("Select account and enter amount");
      return;
    }
    await api.post("/api/credit/transaction", transaction);
    alert(`${transaction.type} recorded successfully!`);
    fetchAccounts();
    setTransaction({ accountId: "", type: "Sale", amount: 0, paymentMode: "" });
  };

  const deleteAccount = async (id: string) => {
    await api.delete(`/api/credit/${id}`);
    setAccounts(prev => prev.filter(acc => acc._id !== id));
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
                  <td><button onClick={() => deleteAccount(acc._id!)} className={styles.deleteButton}>🗑️</button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </div>
  );
}
