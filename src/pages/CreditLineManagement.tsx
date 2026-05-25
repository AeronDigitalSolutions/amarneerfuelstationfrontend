// import FullScreenLoader from "../component/FullScreenLoader";
import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import styles from "../style/creditline.module.css";

const BASE_URL =
  import.meta.env.VITE_API_URL ||
  (window.location.hostname === "localhost"
    ? "http://localhost:5001/api"
    : "https://amarneerfuelstationbackend.onrender.com/api");

type Vehicle = {
  vehicleNo: string;
  fuelType: "Petrol" | "Diesel";
};

type Account = {
  _id?: string;
  accountId: string;
  accountName: string;
  phoneNo: string;
  email: string;
  companyName: string;
  aadhaarNo: string;
  panNo: string;
  document?: string;
  fuelType: "Petrol" | "Diesel";
  vehicles: Vehicle[];
  creditLimit: number;
  contactPerson: string;
  totalSales?: number;
  totalPayments?: number;
  outstanding?: number;
  dueDate?: string | null;
  status?: "normal" | "overLimit" | "dueSoon" | "overdue";
  lastReminderSent?: string | null;
  transactions?: CreditTransaction[];
};

type CreditTransaction = {
  date?: string;
  type?: "Sale" | "Payment" | string;
  amount?: number;
  paymentMode?: string;
  vehicleNo?: string;
  fuelType?: string;
  rate?: number;
  volume?: number;
  machineNo?: string;
  shift?: string;
  saleDate?: string;
  dueDate?: string;
  settlementMode?: string;
};

type Machine = {
  _id?: string;
  machineNo: string;
  machineName: string;
};

type ShiftOption = {
  _id: string;
  shiftName: string;
  startTime: string;
  endTime: string;
};

type FuelRatesData = {
  rates: Record<string, number>;
  updatedAt?: string;
};

export default function CreditLineManagement() {
  // const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [search, setSearch] = useState("");

  const [showCreditModal, setShowCreditModal] = useState(false);
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showVehicleModal, setShowVehicleModal] = useState(false);

  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedAcc, setSelectedAcc] = useState<Account | null>(null);

  const [showBillModal, setShowBillModal] = useState(false);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [shiftOptions, setShiftOptions] = useState<ShiftOption[]>([]);
  const [fuelRates, setFuelRates] = useState<FuelRatesData | null>(null);

  const [emailSending, setEmailSending] = useState(false);
  const [reminderSending, setReminderSending] = useState(false);

  const [newAccount, setNewAccount] = useState<Account>({
    accountId: "",
    accountName: "",
    phoneNo: "",
    email: "",
    companyName: "",
    aadhaarNo: "",
    panNo: "",
    fuelType: "Petrol",
    vehicles: [],
    creditLimit: 0,
    contactPerson: "",
    document: "",
  });

  const [saleData, setSaleData] = useState({
    accountId: "",
    vehicleNo: "",
    fuelType: "Petrol",
    rate: 0,
    volume: 0,
    amount: 0,
    dueDate: "",
    machineNo: "",
    shift: "",
    saleDate: new Date().toISOString().split("T")[0],
    settlementMode: "CreditLine",
  });

  const [paymentData, setPaymentData] = useState({
    accountId: "",
    creditLimit: 0,
    outstanding: 0,
    amountPaid: 0,
    paymentMode: "Cash",
  });

  const [vehicleForm, setVehicleForm] = useState<Vehicle>({
    vehicleNo: "",
    fuelType: "Petrol",
  });

  useEffect(() => {
    fetchAccounts();
    fetchMachines();
    fetchShifts();
    fetchFuelRates();
  }, []);

  const fetchAccounts = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/credit`);
      // normalize returned accounts to ensure types for frontend
      setAccounts(
        (res.data || []).map((a: any) => ({
          ...a,
          outstanding: Number(a.outstanding ?? 0),
          creditLimit: Number(a.creditLimit ?? 0),
          dueDate: a.dueDate ?? null,
          status: a.status ?? "normal",
          lastReminderSent: a.lastReminderSent ?? null,
          transactions: Array.isArray(a.transactions) ? a.transactions : [],
        }))
      );
    } catch (err) {
      console.error("❌ Failed to fetch accounts:", err);
    }
    finally {
      // setLoading(false);
    }
  };

  const fetchMachines = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/machines`);
      setMachines(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("❌ Failed to fetch machines:", err);
      setMachines([]);
    }
  };

  const fetchShifts = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/shifts`);
      setShiftOptions(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("❌ Failed to fetch shifts:", err);
      setShiftOptions([]);
    }
  };

  const fetchFuelRates = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/fuel-rates`);
      setFuelRates(res.data);
    } catch (err) {
      console.error("❌ Failed to fetch fuel rates:", err);
      setFuelRates(null);
    }
  };

  useEffect(() => {
    if (!selectedAcc?._id) return;
    const next = accounts.find((a) => a._id === selectedAcc._id);
    if (next) setSelectedAcc(next);
  }, [accounts, selectedAcc?._id]);

  const normalizeFuelKey = (val: string) => val.trim().toLowerCase();

  const getCurrentRateForFuel = (fuelType: string) => {
    const rates = fuelRates?.rates || {};
    const target = normalizeFuelKey(fuelType);

    const exact = Object.entries(rates).find(
      ([key]) => normalizeFuelKey(key) === target
    );
    if (exact) return Number(exact[1]) || 0;

    const fallback = Object.entries(rates).find(([key]) =>
      normalizeFuelKey(key).includes(target)
    );
    if (fallback) return Number(fallback[1]) || 0;

    return 0;
  };

  const selectedSaleAccount = accounts.find(
    (a) => a.accountId === saleData.accountId
  );

  const selectedSaleVehicle = selectedSaleAccount?.vehicles.find(
    (v) => v.vehicleNo === saleData.vehicleNo
  );

  /* ---------- PDF GENERATION ---------- */
  const generatePDF = () => {
    if (!selectedAcc) return;
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const today = new Date();
    const dateStr = today.toLocaleDateString();

    const clean = (n: any) => {
      try {
        return Number(String(n).replace(/[^0-9.]/g, ""));
      } catch {
        return 0;
      }
    };

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("CREDIT ACCOUNT INVOICE", pageWidth / 2, 15, { align: "center" });

    doc.setFontSize(11);
    doc.text(`Date: ${dateStr}`, 14, 25);

    autoTable(doc, {
      startY: 35,
      head: [["Field", "Details"]],
      body: [
        ["Account ID", selectedAcc.accountId],
        ["Name", selectedAcc.accountName],
        ["Company", selectedAcc.companyName],
        ["Phone", selectedAcc.phoneNo],
        ["Email", selectedAcc.email],
        ["Aadhaar", selectedAcc.aadhaarNo],
        ["PAN", selectedAcc.panNo],
      ],
      theme: "grid",
      headStyles: { fillColor: [40, 64, 143], textColor: 255 },
    });

    const summaryStart = (doc as any).lastAutoTable.finalY + 10;
    autoTable(doc, {
      startY: summaryStart,
      head: [["Description", "Amount"]],
      body: [
        ["Credit Limit", `₹${clean(selectedAcc.creditLimit)}`],
        ["Outstanding", `₹${clean(selectedAcc.outstanding)}`],
      ],
      theme: "grid",
    });

    const gstStart = (doc as any).lastAutoTable.finalY + 10;
    const subTotal = clean(selectedAcc.outstanding);
    const gstRate = 18;
    const gstAmount = (subTotal * gstRate) / 100;
    const total = subTotal + gstAmount;

    autoTable(doc, {
      startY: gstStart,
      head: [["Type", "Amount"]],
      body: [
        ["Subtotal", `₹${subTotal}`],
        [`GST (${gstRate}%)`, `₹${gstAmount.toFixed(2)}`],
        ["Total Payable", `₹${total.toFixed(2)}`],
      ],
      theme: "grid",
    });

    const vehiclesStart = (doc as any).lastAutoTable.finalY + 10;
    autoTable(doc, {
      startY: vehiclesStart,
      head: [["Vehicle Number", "Fuel Type"]],
      body: selectedAcc.vehicles.map((v) => [v.vehicleNo, v.fuelType]),
      theme: "grid",
    });

    return doc.output("blob");
  };

  const downloadPDF = () => {
    const pdf = generatePDF();
    if (!pdf) return;
    const url = URL.createObjectURL(pdf);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${selectedAcc?.accountId}-bill.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  };

  /* ---------- EMAIL (NEW) ---------- */
  const sendEmailWithPdf = async () => {
    try {
      if (!selectedAcc) {
        alert("No account selected");
        return;
      }
      const outstanding = Number(selectedAcc.outstanding ?? 0);
      const creditLimit = Number(selectedAcc.creditLimit ?? 0);

      if (outstanding <= creditLimit) {
        alert("Email is sent only when account is over the credit limit.");
        return;
      }

      setEmailSending(true);

      const pdfBlob = generatePDF();
      if (!pdfBlob) {
        alert("PDF generation failed");
        setEmailSending(false);
        return;
      }

      const base64PDF: string = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(String(reader.result));
        };
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(pdfBlob);
      });

      const payload = {
        email: selectedAcc.email,
        accountId: selectedAcc.accountId,
        pdfBase64: base64PDF,
      };

      const res = await axios.post(`${BASE_URL}/credit/send-email`, payload);

      if (res?.data?.success) {
        alert("📧 Email sent successfully!");
        // optionally update lastReminderSent or similar fields locally after send
      } else {
        console.warn("Email API response:", res?.data);
        alert("Failed to send email. Check server logs or API route.");
      }
    } catch (error) {
      console.error("Email sending failed:", error);
      alert("Email sending failed! See console for details.");
    } finally {
      setEmailSending(false);
    }
  };

  /* ---------- REMINDER (NEW) ---------- */
  const sendReminder = async (accountId: string) => {
    try {
      setReminderSending(true);
      const res = await axios.post(`${BASE_URL}/credit/send-reminder`, {
        accountId,
      });
      if (res?.data?.success) {
        alert("🔔 Reminder sent!");
        fetchAccounts();
      } else {
        console.warn("Reminder API response:", res?.data);
        alert("Failed to send reminder.");
      }
    } catch (err) {
      console.error("Reminder error:", err);
      alert("Reminder sending failed. See console.");
    } finally {
      setReminderSending(false);
    }
  };

  /* ---------- HANDLERS ---------- */
  const handleAccountChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setNewAccount((prev) => ({ ...prev, [name]: value } as Account));
  };

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setNewAccount((prev) => ({ ...prev, document: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const addVehicle = () => {
    if (!vehicleForm.vehicleNo.trim()) {
      alert("Enter vehicle number");
      return;
    }
    setNewAccount((prev) => ({
      ...prev,
      vehicles: [...prev.vehicles, vehicleForm],
    }));
    setShowVehicleModal(false);
  };

  const removeVehicle = (vehicleNo: string) => {
    setNewAccount((prev) => ({
      ...prev,
      vehicles: prev.vehicles.filter((v) => v.vehicleNo !== vehicleNo),
    }));
  };

  const addAccount = async () => {
    if (!newAccount.accountId || !newAccount.accountName) {
      alert("Please fill Account ID & Account Name");
      return;
    }
    try {
      const payload = { ...newAccount };
      const res = await axios.post(`${BASE_URL}/credit`, payload);
      setAccounts((prev) => [res.data, ...prev]);
      setShowCreditModal(false);
      setNewAccount({
        accountId: "",
        accountName: "",
        phoneNo: "",
        email: "",
        companyName: "",
        aadhaarNo: "",
        panNo: "",
        fuelType: "Petrol",
        vehicles: [],
        creditLimit: 0,
        contactPerson: "",
        document: "",
      });
    } catch (err) {
      console.error(err);
      alert("Failed to add account.");
    }
    finally {
      // setLoading(false);
    }
  };

  const handleSaleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const numeric = ["rate", "volume", "amount"];

    setSaleData((prev) => {
      const updated: any = {
        ...prev,
        [name]: numeric.includes(name) ? Number(value) : value,
      };
      const rate = Number(updated.rate);
      const volume = Number(updated.volume);
      const amount = Number(updated.amount);

      if (name === "volume") updated.amount = Number((rate * volume).toFixed(2));
      else if (name === "amount")
        updated.volume = rate > 0 ? Number((amount / rate).toFixed(3)) : 0;
      else if (name === "rate") updated.amount = Number((rate * volume).toFixed(2));

      if (name === "saleDate" && !prev.dueDate) {
        const dt = new Date(`${value}T00:00:00`);
        dt.setDate(dt.getDate() + 15);
        updated.dueDate = dt.toISOString().split("T")[0];
      }

      return updated;
    });
  };

  const saveSale = async () => {
    if (
      !saleData.accountId ||
      !saleData.vehicleNo ||
      !saleData.machineNo ||
      !saleData.shift ||
      !saleData.saleDate ||
      !saleData.dueDate
    ) {
      alert("Select Account, Vehicle, Machine, Shift, Sale Date and Due Date");
      return;
    }
    if (Number(saleData.volume) <= 0 || Number(saleData.amount) <= 0) {
      alert("Volume and amount must be greater than 0");
      return;
    }

    const msPerDay = 24 * 60 * 60 * 1000;
    const saleTs = new Date(`${saleData.saleDate}T00:00:00`).getTime();
    const dueTs = new Date(`${saleData.dueDate}T00:00:00`).getTime();
    const dueDays = Math.max(1, Math.ceil((dueTs - saleTs) / msPerDay));

    const payload = { ...saleData, type: "Sale", dueDays };
    try {
      await axios.post(`${BASE_URL}/credit/transaction`, payload);
      await fetchAccounts();
      setSaleData({
        accountId: "",
        vehicleNo: "",
        fuelType: "Petrol",
        rate: 0,
        volume: 0,
        amount: 0,
        dueDate: "",
        machineNo: "",
        shift: "",
        saleDate: new Date().toISOString().split("T")[0],
        settlementMode: "CreditLine",
      });
      setShowSaleModal(false);
    } catch (err) {
      console.error(err);
      alert("Failed to update sale");
    }
    finally {
      // setLoading(false);
    }
  };

  const openPaymentModal = () => {
    setPaymentData({
      accountId: "",
      creditLimit: 0,
      outstanding: 0,
      amountPaid: 0,
      paymentMode: "Cash",
    });
    setShowPaymentModal(true);
  };

  const handlePaymentChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setPaymentData((prev) => ({
      ...prev,
      [name]: name === "amountPaid" ? Number(value) : value,
    }));
  };

  const selectedPaymentAccount = accounts.find(
    (a) => a.accountId === paymentData.accountId
  );

  const paymentHistoryPreview = useMemo(() => {
    const tx = Array.isArray(selectedPaymentAccount?.transactions)
      ? selectedPaymentAccount!.transactions
      : [];
    return [...tx]
      .sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime())
      .slice(0, 6);
  }, [selectedPaymentAccount]);

  useEffect(() => {
    if (selectedPaymentAccount) {
      setPaymentData((prev) => ({
        ...prev,
        creditLimit: selectedPaymentAccount.creditLimit,
        outstanding: selectedPaymentAccount.outstanding ?? 0,
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentData.accountId, selectedPaymentAccount]);

  useEffect(() => {
    if (!showSaleModal) return;
    setSaleData((prev) => {
      if (prev.dueDate) return prev;
      const base = prev.saleDate || new Date().toISOString().split("T")[0];
      const dt = new Date(`${base}T00:00:00`);
      dt.setDate(dt.getDate() + 15);
      return { ...prev, dueDate: dt.toISOString().split("T")[0] };
    });
  }, [showSaleModal]);

  useEffect(() => {
    if (!saleData.accountId) return;

    setSaleData((prev) => {
      const account = accounts.find((a) => a.accountId === prev.accountId);
      if (!account) return prev;

      const hasVehicle = account.vehicles.some((v) => v.vehicleNo === prev.vehicleNo);
      if (hasVehicle) return prev;

      const firstVehicle = account.vehicles[0];
      if (!firstVehicle) {
        return {
          ...prev,
          vehicleNo: "",
          fuelType: account.fuelType || prev.fuelType,
          rate: getCurrentRateForFuel(account.fuelType || prev.fuelType),
        };
      }

      return {
        ...prev,
        vehicleNo: firstVehicle.vehicleNo,
        fuelType: firstVehicle.fuelType || account.fuelType,
        rate: getCurrentRateForFuel(firstVehicle.fuelType || account.fuelType),
      };
    });
  }, [saleData.accountId, accounts, fuelRates]);

  useEffect(() => {
    if (!saleData.accountId || !saleData.vehicleNo) return;

    setSaleData((prev) => {
      const account = accounts.find((a) => a.accountId === prev.accountId);
      if (!account) return prev;

      const vehicle = account.vehicles.find((v) => v.vehicleNo === prev.vehicleNo);
      const resolvedFuelType = vehicle?.fuelType || account.fuelType || prev.fuelType;
      const liveRate = getCurrentRateForFuel(resolvedFuelType);
      const effectiveRate = liveRate > 0 ? liveRate : Number(prev.rate || 0);
      const volume = Number(prev.volume || 0);

      return {
        ...prev,
        fuelType: resolvedFuelType,
        rate: effectiveRate,
        amount: Number((effectiveRate * volume).toFixed(2)),
      };
    });
  }, [saleData.vehicleNo, saleData.accountId, accounts, fuelRates]);

  const savePayment = async () => {
    if (!paymentData.accountId || paymentData.amountPaid <= 0) {
      alert("Select account & valid amount");
      return;
    }
    const payload = {
      accountId: paymentData.accountId,
      type: "Payment",
      amount: paymentData.amountPaid,
      paymentMode: paymentData.paymentMode,
    };
    try {
      await axios.post(`${BASE_URL}/credit/transaction`, payload);
      await fetchAccounts();
      setShowPaymentModal(false);
    } catch (err) {
      alert("Payment failed");
    }
    finally {
      // setLoading(false);
    }
  };

  const filteredAccounts = accounts.filter((acc) => {
    const query = search.toLowerCase();
    return (
      acc.accountId.toLowerCase().includes(query) ||
      acc.accountName.toLowerCase().includes(query) ||
      acc.phoneNo.toLowerCase().includes(query) ||
      acc.email.toLowerCase().includes(query) ||
      acc.companyName.toLowerCase().includes(query) ||
      acc.aadhaarNo.toLowerCase().includes(query) ||
      acc.panNo.toLowerCase().includes(query) ||
      acc.vehicles.some((v) => v.vehicleNo.toLowerCase().includes(query))
    );
  });

  const formatDate = (d?: string | null) =>
    d ? new Date(d).toLocaleDateString() : "-";

  const renderStatusBadge = (acc: Account) => {
    const status = acc.status ?? "normal";
    const cls =
      status === "normal"
        ? `${styles.statusBadge} ${styles.statusNormal}`
        : status === "overLimit"
        ? `${styles.statusBadge} ${styles.statusOverLimit}`
        : status === "dueSoon"
        ? `${styles.statusBadge} ${styles.statusDueSoon}`
        : `${styles.statusBadge} ${styles.statusOverdue}`;
    const text =
      status === "normal"
        ? "Normal"
        : status === "overLimit"
        ? "Over Limit"
        : status === "dueSoon"
        ? "Due Soon"
        : "Overdue";
    return (
      <span className={cls} title={`Due Date: ${formatDate(acc.dueDate)}`}>
        {text}
      </span>
    );
  };

  const formatDateTime = (d?: string) => (d ? new Date(d).toLocaleString() : "-");

  const accountTransactions = useMemo(() => {
    const tx = Array.isArray(selectedAcc?.transactions) ? selectedAcc!.transactions : [];
    const sorted = [...tx].sort(
      (a, b) => new Date(a.date || 0).getTime() - new Date(b.date || 0).getTime()
    );

    let runningOutstanding = 0;
    return sorted.map((row) => {
      const amount = Number(row.amount || 0);
      const isPayment = String(row.type || "").toLowerCase() === "payment";
      runningOutstanding += isPayment ? -amount : amount;
      return {
        ...row,
        amount,
        isPayment,
        debit: isPayment ? 0 : amount,
        credit: isPayment ? amount : 0,
        runningOutstanding: Number(runningOutstanding.toFixed(2)),
      };
    });
  }, [selectedAcc]);

  return (
    <div className={`${styles.container} module-page`}>
      <section className="module-hero">
        <div>
          <p className="module-hero-tag">CREDIT GOVERNANCE</p>
          <h2>Credit Line Management</h2>
          <p>Track account-wise sales, payments, dues, and machine-shift linked credit settlements.</p>
        </div>
      </section>
      <h1>Credit Line System</h1>

      <section className={styles.actionBar}>
        <input
          type="text"
          className={styles.searchBar}
          placeholder="Search accounts (ID, Name, Phone, Aadhaar, PAN, Vehicle...)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className={styles.primaryAction} onClick={() => setShowCreditModal(true)}>
          Add Credit Account
        </button>
        <button className={styles.primaryAction} onClick={() => setShowSaleModal(true)}>
          Update Sale
        </button>
        <button className={styles.primaryAction} onClick={openPaymentModal}>
          Update Payment
        </button>
      </section>

      <h2>Accounts List</h2>
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.creditth}>Account ID</th>
              <th className={styles.creditth}>Name</th>
              <th className={styles.creditth}>Company</th>
              <th className={styles.creditth}>Phone</th>
              <th className={styles.creditth}>Aadhaar</th>
              <th className={styles.creditth}>PAN</th>
              <th className={styles.creditth}>Credit Limit</th>
              <th className={styles.creditth}>Outstanding</th>
              <th>Status</th>
              <th>Due Date</th>
              <th className={styles.creditth}>View</th>
            </tr>
          </thead>

          <tbody>
            {filteredAccounts.map((acc) => (
              <tr key={acc._id}>
                <td className={styles.credittd}>{acc.accountId}</td>
                <td className={styles.credittd}>{acc.accountName}</td>
                <td className={styles.credittd}>{acc.companyName}</td>
                <td className={styles.credittd}>{acc.phoneNo}</td>
                <td className={styles.credittd}>{acc.aadhaarNo}</td>
                <td className={styles.credittd}>{acc.panNo}</td>
                <td className={styles.credittd}>{acc.creditLimit}</td>
                <td className={styles.credittd}
                  style={{
                    color:
                      (acc.outstanding ?? 0) > (acc.creditLimit ?? 0)
                        ? "red"
                        : "green",
                  }}
                >
                  {acc.outstanding}
                </td>
                <td>{renderStatusBadge(acc)}</td>
                <td>{formatDate(acc.dueDate)}</td>
                <td>
                  <button
                    className={styles.viewBtn}
                    onClick={() => {
                      setSelectedAcc(acc);
                      setShowViewModal(true);
                    }}
                  >
                    View Account
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* VIEW MODAL */}
      {showViewModal && selectedAcc && (
        <div
          className={styles.modalBackdrop}
          onClick={() => setShowViewModal(false)}
        >
          <div
            className={`${styles.modalForm} ${styles.modalScrollable} ${styles.wideModal}`}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className={styles.closeBtn}
              onClick={() => setShowViewModal(false)}
            >
              ✖
            </button>

            <h2>Account Details</h2>

            <section className={styles.accountKpis}>
              <article>
                <span>Credit Limit</span>
                <strong>₹{Number(selectedAcc.creditLimit || 0).toFixed(2)}</strong>
              </article>
              <article>
                <span>Outstanding</span>
                <strong className={(selectedAcc.outstanding ?? 0) > (selectedAcc.creditLimit ?? 0) ? styles.kpiDanger : styles.kpiSafe}>
                  ₹{Number(selectedAcc.outstanding || 0).toFixed(2)}
                </strong>
              </article>
              <article>
                <span>Available Limit</span>
                <strong>
                  ₹{Math.max(0, Number((selectedAcc.creditLimit || 0) - (selectedAcc.outstanding || 0))).toFixed(2)}
                </strong>
              </article>
              <article>
                <span>Status / Due</span>
                <strong>{renderStatusBadge(selectedAcc)}</strong>
                <small>{formatDate(selectedAcc.dueDate)}</small>
              </article>
            </section>

            <section className={styles.profileGrid}>
              <div><label>Account ID</label><p>{selectedAcc.accountId}</p></div>
              <div><label>Account Name</label><p>{selectedAcc.accountName}</p></div>
              <div><label>Company</label><p>{selectedAcc.companyName || "-"}</p></div>
              <div><label>Phone</label><p>{selectedAcc.phoneNo || "-"}</p></div>
              <div><label>Email</label><p>{selectedAcc.email || "-"}</p></div>
              <div><label>Contact Person</label><p>{selectedAcc.contactPerson || "-"}</p></div>
              <div><label>Aadhaar</label><p>{selectedAcc.aadhaarNo || "-"}</p></div>
              <div><label>PAN</label><p>{selectedAcc.panNo || "-"}</p></div>
              <div><label>Last Reminder</label><p>{selectedAcc.lastReminderSent ? new Date(selectedAcc.lastReminderSent).toLocaleString() : "-"}</p></div>
            </section>

            <section className={styles.vehiclesStrip}>
              <h3>Registered Vehicles</h3>
              <div className={styles.vehicleChips}>
                {selectedAcc.vehicles?.length ? (
                  selectedAcc.vehicles.map((v) => (
                    <span key={v.vehicleNo} className={styles.vehicleChip}>
                      {v.vehicleNo} • {v.fuelType}
                    </span>
                  ))
                ) : (
                  <span className={styles.emptyMuted}>No vehicles linked.</span>
                )}
              </div>
            </section>

            <section className={styles.ledgerSection}>
              <div className={styles.ledgerHead}>
                <h3>Account Ledger</h3>
                <span>{accountTransactions.length} entries</span>
              </div>
              <div className={styles.ledgerTableWrap}>
                <table className={styles.ledgerTable}>
                  <thead>
                    <tr>
                      <th>Date & Time</th>
                      <th>Type</th>
                      <th>Particulars</th>
                      <th>Vehicle</th>
                      <th>Machine / Shift</th>
                      <th>Mode</th>
                      <th>Debit</th>
                      <th>Credit</th>
                      <th>Running Outstanding</th>
                    </tr>
                  </thead>
                  <tbody>
                    {accountTransactions.length ? (
                      accountTransactions.map((row: any, idx) => (
                        <tr key={`${row.date || "tx"}-${idx}`}>
                          <td>{formatDateTime(row.date)}</td>
                          <td>
                            <span className={row.isPayment ? styles.txCredit : styles.txDebit}>
                              {row.isPayment ? "Credit" : "Debit"}
                            </span>
                          </td>
                          <td>{row.type === "Sale" ? "Credit Fuel Sale" : "Payment Received"}</td>
                          <td>{row.vehicleNo || "-"}</td>
                          <td>{row.machineNo ? `${row.machineNo}${row.shift ? ` / ${row.shift}` : ""}` : row.shift || "-"}</td>
                          <td>{row.paymentMode || row.settlementMode || "-"}</td>
                          <td>{row.debit ? `₹${row.debit.toFixed(2)}` : "-"}</td>
                          <td>{row.credit ? `₹${row.credit.toFixed(2)}` : "-"}</td>
                          <td>₹{Number(row.runningOutstanding || 0).toFixed(2)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={9} className={styles.emptyLedger}>
                          No payment/sale history available for this account yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            {(selectedAcc.outstanding ?? 0) >
              (selectedAcc.creditLimit ?? 0) && (
              <div className={styles.viewActionRow}>
                <button
                  className={styles.billBtn}
                  onClick={() => setShowBillModal(true)}
                >
                  Generate Bill
                </button>
                <button
                  className={styles.billBtn}
                  onClick={() => sendReminder(selectedAcc.accountId)}
                  disabled={reminderSending}
                  title="Send reminder email for this account"
                >
                  {reminderSending ? "Sending..." : "Send Reminder"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* BILL MODAL */}
      {showBillModal && selectedAcc && (
        <div
          className={styles.modalBackdrop}
          onClick={() => setShowBillModal(false)}
        >
          <div
            className={`${styles.modalForm} ${styles.modalScrollable}`}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className={styles.closeBtn}
              onClick={() => setShowBillModal(false)}
            >
              ✖
            </button>

            <h2>Bill Summary</h2>

            <p>
              <b>Bill Date:</b> {new Date().toLocaleDateString()}
            </p>
            <p>
              <b>Account ID:</b> {selectedAcc.accountId}
            </p>
            <p>
              <b>Name:</b> {selectedAcc.accountName}
            </p>
            <p>
              <b>Company:</b> {selectedAcc.companyName}
            </p>
            <p>
              <b>Phone:</b> {selectedAcc.phoneNo}
            </p>
            <p>
              <b>Email:</b> {selectedAcc.email}
            </p>

            <table className={styles.billTable}>
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Amount</th>
                </tr>
              </thead>

              <tbody>
                <tr>
                  <td>Credit Limit</td>
                  <td>₹{selectedAcc.creditLimit}</td>
                </tr>

                <tr
                  style={{
                    color:
                      (selectedAcc.outstanding ?? 0) >
                      (selectedAcc.creditLimit ?? 0)
                        ? "red"
                        : "green",
                  }}
                >
                  <td>Outstanding</td>
                  <td>₹{selectedAcc.outstanding}</td>
                </tr>

                {(() => {
                  const subTotal = Number(selectedAcc.outstanding ?? 0);
                  const gstAmount = subTotal * 0.18;
                  const total = subTotal + gstAmount;
                  return (
                    <>
                      <tr>
                        <td>GST (18%)</td>
                        <td>₹{gstAmount.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td>
                          <b>Total Payable</b>
                        </td>
                        <td>
                          <b>₹{total.toFixed(2)}</b>
                        </td>
                      </tr>
                    </>
                  );
                })()}
              </tbody>
            </table>

            <h3>Vehicles Used</h3>
            <table className={styles.billTable}>
              <thead>
                <tr>
                  <th>Vehicle Number</th>
                  <th>Fuel Type</th>
                </tr>
              </thead>

              <tbody>
                {selectedAcc.vehicles.map((v) => (
                  <tr key={v.vehicleNo}>
                    <td>{v.vehicleNo}</td>
                    <td>{v.fuelType}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <hr />

            <button className={styles.billBtn} onClick={downloadPDF}>
              ⬇ Download PDF
            </button>

            <button
              className={styles.billBtn}
              onClick={sendEmailWithPdf}
              disabled={emailSending}
              title="Send PDF to registered email (only when outstanding > credit limit)"
              style={{ marginLeft: 10 }}
            >
              {emailSending ? "Sending..." : "📧 Send Email"}
            </button>
          </div>
        </div>
      )}

      {/* ADD ACCOUNT MODAL */}
      {showCreditModal && (
        <div
          className={styles.modalBackdrop}
          onClick={() => setShowCreditModal(false)}
        >
          <div
            className={`${styles.modalForm} ${styles.modalScrollable} ${styles.premiumModalForm}`}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className={styles.closeBtn}
              onClick={() => setShowCreditModal(false)}
            >
              ✖
            </button>

            <h2>Add Credit Account</h2>

            <p className={styles.saleModalHint}>
              Create account profile, set limit, and attach vehicles for tracked credit operations.
            </p>

            <div className={styles.saleGridTwo}>
              <div className={styles.fieldBlock}>
                <label>Account ID</label>
                <input
                  name="accountId"
                  value={newAccount.accountId}
                  onChange={handleAccountChange}
                  placeholder="e.g. AC-102"
                />
              </div>

              <div className={styles.fieldBlock}>
                <label>Account Name</label>
                <input
                  name="accountName"
                  value={newAccount.accountName}
                  onChange={handleAccountChange}
                  placeholder="e.g. Sharma Logistics"
                />
              </div>

              <div className={styles.fieldBlock}>
                <label>Phone</label>
                <input
                  name="phoneNo"
                  value={newAccount.phoneNo}
                  onChange={handleAccountChange}
                  placeholder="Phone number"
                />
              </div>

              <div className={styles.fieldBlock}>
                <label>Email</label>
                <input
                  name="email"
                  value={newAccount.email}
                  onChange={handleAccountChange}
                  placeholder="Email address"
                />
              </div>

              <div className={styles.fieldBlock}>
                <label>Company Name</label>
                <input
                  name="companyName"
                  value={newAccount.companyName}
                  onChange={handleAccountChange}
                  placeholder="Company / Organization"
                />
              </div>

              <div className={styles.fieldBlock}>
                <label>Contact Person</label>
                <input
                  name="contactPerson"
                  value={newAccount.contactPerson}
                  onChange={handleAccountChange}
                  placeholder="Primary contact name"
                />
              </div>

              <div className={styles.fieldBlock}>
                <label>Aadhaar No</label>
                <input
                  name="aadhaarNo"
                  value={newAccount.aadhaarNo}
                  onChange={handleAccountChange}
                  placeholder="Aadhaar"
                />
              </div>

              <div className={styles.fieldBlock}>
                <label>PAN No</label>
                <input
                  name="panNo"
                  value={newAccount.panNo}
                  onChange={handleAccountChange}
                  placeholder="PAN"
                />
              </div>

              <div className={styles.fieldBlock}>
                <label>Fuel Type</label>
                <select
                  name="fuelType"
                  value={newAccount.fuelType}
                  onChange={handleAccountChange}
                >
                  <option>Petrol</option>
                  <option>Diesel</option>
                </select>
              </div>

              <div className={styles.fieldBlock}>
                <label>Credit Limit</label>
                <input
                  name="creditLimit"
                  type="number"
                  value={newAccount.creditLimit}
                  onChange={handleAccountChange}
                  placeholder="Set account credit limit"
                />
              </div>
            </div>

            <div className={styles.fieldBlock}>
              <label>Upload Document</label>
              <input
                type="file"
                onChange={handleDocumentUpload}
                className={styles.fullRow}
              />
            </div>

            <button
              className={styles.addVehicleBtn}
              onClick={() => setShowVehicleModal(true)}
            >
              + Add Vehicle
            </button>

            <div className={styles.vehicleList}>
              {newAccount.vehicles.map((v) => (
                <p key={v.vehicleNo}>
                  {v.vehicleNo} ({v.fuelType})
                  <button
                    className={styles.deleteBtnSmall}
                    onClick={() => removeVehicle(v.vehicleNo)}
                  >
                    X
                  </button>
                </p>
              ))}
            </div>

            <button className={styles.submitBtn} onClick={addAccount}>
              Save Account
            </button>
          </div>
        </div>
      )}

      {/* SALE MODAL */}
      {showSaleModal && (
        <div
          className={styles.modalBackdrop}
          onClick={() => setShowSaleModal(false)}
        >
          <div
            className={`${styles.modalForm} ${styles.modalScrollable} ${styles.premiumModalForm}`}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className={styles.closeBtn}
              onClick={() => setShowSaleModal(false)}
            >
              ✖
            </button>

            <h2>Update Sale</h2>
            <p className={styles.saleModalHint}>
              Select account and vehicle. Fuel type and live rate are auto-fetched from setup.
            </p>

            <div className={styles.saleGridTwo}>
              <div className={styles.fieldBlock}>
                <label>Account</label>
                <select
                  name="accountId"
                  value={saleData.accountId}
                  onChange={handleSaleChange}
                >
                  <option value="">Select Credit Account</option>
                  {accounts.map((acc) => (
                    <option key={acc._id} value={acc.accountId}>
                      {acc.accountId} — {acc.accountName}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.fieldBlock}>
                <label>Vehicle</label>
                <select
                  name="vehicleNo"
                  value={saleData.vehicleNo}
                  onChange={handleSaleChange}
                  disabled={!saleData.accountId}
                >
                  <option value="">Select Vehicle</option>
                  {selectedSaleAccount?.vehicles.map((v) => (
                    <option key={v.vehicleNo} value={v.vehicleNo}>
                      {v.vehicleNo}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.fieldBlock}>
                <label>Fuel Type (Auto)</label>
                <input
                  name="fuelType"
                  value={saleData.fuelType}
                  readOnly
                  placeholder="Auto from selected vehicle"
                />
              </div>

              <div className={styles.fieldBlock}>
                <label>
                  Rate/Litre (Auto)
                  {fuelRates?.updatedAt ? (
                    <span className={styles.metaTag}>
                      Updated {new Date(fuelRates.updatedAt).toLocaleDateString()}
                    </span>
                  ) : null}
                </label>
                <input
                  name="rate"
                  type="number"
                  value={saleData.rate}
                  readOnly
                  placeholder="Auto from fuel rates"
                />
              </div>

              <div className={styles.fieldBlock}>
                <label>Volume (L)</label>
                <input
                  name="volume"
                  type="number"
                  step="0.01"
                  value={saleData.volume}
                  onChange={handleSaleChange}
                  placeholder="Enter filled volume"
                />
              </div>

              <div className={styles.fieldBlock}>
                <label>Total Amount</label>
                <input
                  name="amount"
                  type="number"
                  step="0.01"
                  value={saleData.amount}
                  readOnly
                  placeholder="Auto from rate x volume"
                />
              </div>

              <div className={styles.fieldBlock}>
                <label>Machine</label>
                <select
                  name="machineNo"
                  value={saleData.machineNo}
                  onChange={handleSaleChange}
                >
                  <option value="">Select Machine</option>
                  {machines.map((m) => (
                    <option key={m._id || m.machineNo} value={m.machineNo}>
                      {m.machineNo} - {m.machineName}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.fieldBlock}>
                <label>Shift</label>
                <select
                  name="shift"
                  value={saleData.shift}
                  onChange={handleSaleChange}
                >
                  <option value="">Select Shift</option>
                  {shiftOptions.map((s) => (
                    <option key={s._id} value={s.shiftName}>
                      {s.shiftName} ({s.startTime} - {s.endTime})
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.fieldBlock}>
                <label>Sale Date</label>
                <input
                  name="saleDate"
                  type="date"
                  value={saleData.saleDate}
                  onChange={handleSaleChange}
                />
              </div>

              <div className={styles.fieldBlock}>
                <label>Due Date</label>
                <input
                  name="dueDate"
                  type="date"
                  value={saleData.dueDate}
                  onChange={handleSaleChange}
                />
              </div>
            </div>

            <div className={styles.fieldBlock}>
              <label>Settlement Mode</label>
              <select
                name="settlementMode"
                value={saleData.settlementMode}
                onChange={handleSaleChange}
              >
                <option value="CreditLine">Credit Line</option>
                <option value="CompanyAccount">Company Account</option>
              </select>
            </div>

            {selectedSaleAccount && selectedSaleVehicle && (
              <p className={styles.saleInlineInfo}>
                {selectedSaleAccount.accountName} • {selectedSaleVehicle.vehicleNo} •{" "}
                {saleData.fuelType} • ₹{Number(saleData.rate || 0).toFixed(2)}/L
              </p>
            )}

            <button className={styles.submitBtn} onClick={saveSale}>
              Submit Sale
            </button>
          </div>
        </div>
      )}

      {/* PAYMENT MODAL */}
      {showPaymentModal && (
        <div
          className={styles.modalBackdrop}
          onClick={() => setShowPaymentModal(false)}
        >
          <div
            className={`${styles.modalForm} ${styles.modalScrollable} ${styles.premiumModalForm}`}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className={styles.closeBtn}
              onClick={() => setShowPaymentModal(false)}
            >
              ✖
            </button>

            <h2>Update Payment</h2>
            <p className={styles.saleModalHint}>
              Post payment against selected account and instantly reconcile outstanding balance.
            </p>

            <div className={styles.saleGridTwo}>
              <div className={styles.fieldBlock}>
                <label>Account</label>
                <select
                  name="accountId"
                  value={paymentData.accountId}
                  onChange={handlePaymentChange}
                >
                  <option value="">Select Account</option>
                  {accounts.map((acc) => (
                    <option key={acc._id} value={acc.accountId}>
                      {acc.accountId} — {acc.accountName}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.fieldBlock}>
                <label>Payment Mode</label>
                <select
                  name="paymentMode"
                  value={paymentData.paymentMode}
                  onChange={handlePaymentChange}
                >
                  <option>Cash</option>
                  <option>Card</option>
                  <option>UPI</option>
                </select>
              </div>

              <div className={styles.fieldBlock}>
                <label>Credit Limit</label>
                <input value={paymentData.creditLimit} disabled />
              </div>

              <div className={styles.fieldBlock}>
                <label>Outstanding</label>
                <input value={paymentData.outstanding} disabled />
              </div>

              <div className={styles.fieldBlock}>
                <label>Paying Amount</label>
                <input
                  name="amountPaid"
                  type="number"
                  value={paymentData.amountPaid}
                  onChange={handlePaymentChange}
                  placeholder="Enter payment amount"
                />
              </div>

              <div className={styles.fieldBlock}>
                <label>New Outstanding</label>
                <input
                  value={(paymentData.outstanding ?? 0) - (paymentData.amountPaid ?? 0)}
                  disabled
                  className={
                    paymentData.amountPaid >= (paymentData.outstanding ?? 0)
                      ? styles.green
                      : styles.red
                  }
                />
              </div>
            </div>

            {selectedPaymentAccount ? (
              <div className={styles.paymentHistoryBox}>
                <div className={styles.paymentHistoryHead}>
                  <h4>Recent Account Activity</h4>
                  <span>{paymentHistoryPreview.length} latest entries</span>
                </div>
                <div className={styles.paymentHistoryList}>
                  {paymentHistoryPreview.length ? (
                    paymentHistoryPreview.map((row, idx) => {
                      const isPayment = String(row.type || "").toLowerCase() === "payment";
                      return (
                        <article key={`${row.date || "row"}-${idx}`} className={styles.paymentHistoryItem}>
                          <div>
                            <strong>{isPayment ? "Payment Received" : "Credit Sale"}</strong>
                            <p>{formatDateTime(row.date)}</p>
                          </div>
                          <div className={isPayment ? styles.txCredit : styles.txDebit}>
                            {isPayment ? "+" : "-"} ₹{Number(row.amount || 0).toFixed(2)}
                          </div>
                        </article>
                      );
                    })
                  ) : (
                    <p className={styles.emptyMuted}>No history available yet.</p>
                  )}
                </div>
              </div>
            ) : null}

            <button className={styles.submitBtn} onClick={savePayment}>
              Submit Payment
            </button>
          </div>
        </div>
      )}

      {/* ADD VEHICLE MODAL */}
      {showVehicleModal && (
        <div className={styles.modalBackdrop} onClick={() => setShowVehicleModal(false)}>
          <div className={`${styles.modal} ${styles.modalScrollable}`} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={() => setShowVehicleModal(false)}>✖</button>

            <h3>Add Vehicle</h3>

            <label>Vehicle Number</label>
            <input value={vehicleForm.vehicleNo} onChange={(e) => setVehicleForm({ ...vehicleForm, vehicleNo: e.target.value })} />

            <label>Fuel Type</label>
            <select value={vehicleForm.fuelType} onChange={(e) => setVehicleForm({ ...vehicleForm, fuelType: e.target.value as "Petrol" | "Diesel" })}>
              <option>Petrol</option>
              <option>Diesel</option>
            </select>

            <button style={{ padding: "10px 11px", display: "flex", justifyContent: "center", marginTop: "10px" }} onClick={addVehicle}>
              Add
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
